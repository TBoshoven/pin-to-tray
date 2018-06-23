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
    try {
        let icon = await renderIcon(getIconUrl());
        browser.runtime.sendMessage({ command: "UpdateIcon", icon: icon });
    }
    catch (e) {
        console.log("PinToTray Could not update icon:", e);
    }
};

function getTitle() {
    let element = document.head.querySelector("title");
    if (element === null) {
        // If there is no default icon, extract the domain from the url
        let host = document.location.host;
        return host || "Pin to Tray";
    }
    // Remove all whitespace at the start and end, and compact any whitespace in the center
    return element.innerText.replace(/(^\s+|\s+$|\s+(?=\s))/g, '');
}

function updateTitle(highlight) {
    highlight = highlight || false;
    let title = getTitle();
    if (title != lastUpdatedTitle) {
        browser.runtime.sendMessage({ command: "UpdateTitle", title: title, highlight: highlight });
        lastUpdatedTitle = title;
    }
}

function hideIcon() {
    browser.runtime.sendMessage({ command: "HideIcon" });
}

function isIconNode(node) {
    if (node.nodeName.toLowerCase() == "link") {
        for (let token of node.relList) {
            if (token.toLowerCase() == "icon") {
                return true;
            }
        }
    }
    return false;
}

function isTitleNode(node) {
    return node.nodeName.toLowerCase() == "title";
}

function observeNode(node) {
    switch (node.nodeName.toLowerCase()) {
    case "link":
        observer.observe(node, { attributes: true, attributeFilter: ["href", "rel", "sizes"] });
        break;
    case "title":
        // Titles can contain all kinds of weirdness, so this one needs to be quite broad
        observer.observe(node, { childList: true, characterData: true, subtree: true });
        break;
    }
}

function onMutation(mutations) {
    for (let mutation of mutations) {
        switch (mutation.type) {
        case "childList":
            if (isTitleNode(mutation.target)) {
                updateTitle(true);
            }
            else {
                // Modifications to <head>
                let touched = [];
                mutation.addedNodes.forEach((node) => {
                    touched.unshift(node);
                    observeNode(node);
                });
                mutation.removedNodes.forEach((node) => touched.unshift(node));
                if (touched.some(isIconNode)) {
                    updateIcon();
                }
                if (touched.some(isTitleNode)) {
                    updateTitle(true);
                }
            }
            break;
        case "attributes":
            updateIcon();
            break;
        }
    }
}

var commands = {
    enable: () => {
        // No need to re-add the observer if it's already there
        if (observer === null) {
            // Attach listener
            observer = new MutationObserver(onMutation);

            // Monitor <head> for additions and removals
            observer.observe(document.head, { childList: true });

            // Monitor <link> and <title> attribute modifications
            for (let node of document.head.querySelectorAll("link, title")) {
                observeNode(node);
            }
        }

        // Always update
        updateTitle(false);
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

let lastUpdatedTitle = null;

// Poke it to enable reporting if necessary
browser.runtime.sendMessage({ command: "Init" });
