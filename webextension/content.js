let observer = null;

function getDesiredSize() {
    // TODO: Verify these; this was extracted from various pieces of documentation.
    // Might be able to extract this using native component.
    if (navigator.appVersion.indexOf("Win") != -1) {
        return 16;
    }
    // This will not work properly with changes or multiple screens, but it's better than nothing.
    if (navigator.appVersion.indexOf("Mac") != -1) {
        return 18 * window.devicePixelRatio;
    }
    // Qt recommendation
    return 22;
}

const desiredSize = getDesiredSize();

function getSize(linkElt) {
    let sizes = linkElt.getAttribute("sizes");
    if (sizes === null) {
        return null;
    }
    sizes = sizes.split(" ");
    let parsedSizes = [];
    // Iterate and parse
    for (let size of sizes) {
        let m = size.match(/([0-9]+)x([0-9]+)/i);
        if (m !== null) {
            let w = parseInt(m[1]);
            let h = parseInt(m[2]);
            parsedSizes.push(Math.max(w, h));
        }
    }
    parsedSizes.sort();

    // Pick the one that's closest, but not smaller, than the desired size
    for (let size of parsedSizes) {
        if (size >= desiredSize) {
            return size;
        }
    }
    // If that fails, pick the largest one
    if (parsedSizes.length > 0) {
        return parsedSizes.pop();
    }

    // Otherwise, give up
    return null;
}

function getIconUrl() {
    // Firefox has a weird delay on the Favicon URL in the tabs API.
    // We can probably do pretty well using our own logic.
    // Generally, if the icon is dynamic, it tends to expose only one anyway.

    // TODO: Relative schemas?

    // Find all icon candidates
    let elements = document.head.querySelectorAll("link[rel~=icon]");
    let elementsBySize = {};
    for (let element of elements) {
        let size = getSize(element);
        if (size !== null) {
            elementsBySize[size] = element;
        }
        else {
            // This should act as a fallback if no sizes are provided
            elementsBySize[0] = element;
        }
    }

    let sizes = Object.keys(elementsBySize).sort();

    // Pick the one that's closest, but not smaller, than the desired size
    for (let size of sizes) {
        if (size >= desiredSize) {
            return elementsBySize[size].getAttribute("href");
        }
    }
    if (sizes.length > 0) {
        return elementsBySize[sizes.pop()].getAttribute("href");
    }

    // If no candidates exist, try /favicon.ico
    return "/favicon.ico";
};

function loadImage(url) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.onload = function() {
            resolve(img);
        };
        img.onerror = function(e) {
            reject(e);
        };
        img.src = url;
    });
}

async function renderIcon(url) {
    // Render to off-screen canvas of desired size
    // Return as PNG data
    // XXX: What to do about animated gifs? Looks like systrays don't support those anyway.
    let canvas = document.createElement("canvas");
    canvas.width = desiredSize;
    canvas.height = desiredSize;
    let context = canvas.getContext("2d");
    context.drawImage(await loadImage(url), 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL().replace(/^.*?,/, "");
};

async function updateIcon() {
    let url = getIconUrl();
    let icon = await renderIcon(getIconUrl());
    browser.runtime.sendMessage({ command: "UpdateIcon", icon: icon });
};

function hideIcon() {
    browser.runtime.sendMessage({ command: "HideIcon" });
};

function onMutation(mutations) {
    for (let mutation of mutations) {
        if (mutation.type == "childList") {
            // TODO: Be more specific
            updateIcon().catch((reason) => console.log("Error:", reason));
        }
    }
};

var commands = {
    enable: () => {
        // No need to re-add the observer if it's already there
        if (observer === null) {
            // Attach listener
            observer = new MutationObserver(onMutation);
            // TODO: monitor <link> and <title> modifications as well
            observer.observe(document.head, { childList: true });
        }

        // Always update
        updateIcon();
    },
    disable: () => {
        if (observer === null) {
            return;
        }
        observer.disconnect();
        observer = null;

        hideIcon();
    }
};

// Add a background script listener
browser.runtime.onMessage.addListener(({ command: command, ...params }, sender, sendResponse) => {
    commands[command](params);
});

// Poke it to enable reporting if necessary
browser.runtime.sendMessage({ command: "Init" });
