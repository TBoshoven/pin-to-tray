function onMutation(mutations) {
    for(let mutation of mutations) {
        if (mutation.type == "childList") {
            console.log("Child list mutation");
        }
    }
};

var commands = {
    enable: () => {
        // If enabled, do nothing
        // Attach listener
        let observer = new MutationObserver(onMutation);
        observer.observe(document.head, {childList: true});
    },
    disable: () => {
        observer.disconnect();
    }
}

// Add a background script listener
browser.runtime.onMessage.addListener(({command: command, ...params}, sender, sendResponse) => { commands[command](params); });

// Poke it to enable reporting if necessary
browser.runtime.sendMessage({command: "init"});
