let observer = null;

function getIconUrl() {
    // Firefox has a weird delay on the Favicon URL in the tabs API.
    // We can probably do pretty well using our own logic.
    // Generally, if the icon is dynamic, it tends to expose only one anyway.

    // Find all icon candidates
    // Pick the one that's closest, but not smaller, than the desired size
    // If no candidates exist, try /favicon.ico
    return "http://example.com/";
};

function renderIcon(url) {
    // Render to off-screen canvas of specified size
    // Return as PNG data
    // XXX: What to do about animated gifs? Looks like systrays don't support those anyway.
    return "TODO";
};

function updateIcon() {
    let url = getIconUrl();
    let icon = renderIcon(getIconUrl());
    browser.runtime.sendMessage({command: "update", icon: icon});
};

function onMutation(mutations) {
    for(let mutation of mutations) {
        if (mutation.type == "childList") {
            // TODO: Be more specific
            updateIcon();
        }
    }
};

var commands = {
    enable: () => {
        // If enabled, do nothing
        if (observer === null) {
            return;
        }
        // Attach listener
        observer = new MutationObserver(onMutation);
        // TODO: monitor <link> modifications as well
        observer.observe(document.head, {childList: true});
    },
    disable: () => {
        observer.disconnect();
        observer = null;
    }
}

// Add a background script listener
browser.runtime.onMessage.addListener(({command: command, ...params}, sender, sendResponse) => { commands[command](params); });

// Poke it to enable reporting if necessary
browser.runtime.sendMessage({command: "init"});
