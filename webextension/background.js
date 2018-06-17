// Commands from content script
let contentCommands = {
    // A new tab announces itself
    Init: async (tab) => {
        if (await isEnabled(tab.id)) {
            browser.tabs.sendMessage(tab.id, { command: "enable" });
        }
    },

    // A tab has an updated icon
    UpdateIcon: (tab, params) => {
        let id = tab.id;
        nativePort.postMessage({ "command": "UpdateIcon", "id": id, "data": params["icon"] });
    },

    // A tab has an updated title
    UpdateTitle: (tab, params) => {
        let id = tab.id;
        nativePort.postMessage({ "command": "UpdateTitle", "id": id, "title": params["title"] });
    },

    // A tab requests the icon to be removed
    HideIcon: (tab, params) => {
        let id = tab.id;
        nativePort.postMessage({ "command": "HideIcon", "id": id });
    }
};

// Commands from native module
let nativeCommands = {
    // Handle a icon activation
    HandleClick: async (params) => {
        let tab = await browser.tabs.get(params["id"]);
        // Focus tab
        browser.tabs.update(tab.id, { active: true });
        // Focus window
        browser.windows.update(tab.windowId, { drawAttention: true, focused: true });
    },
    // Unpin an icon
    Unpin: (params) => {
        setEnabled(params["id"], false);
    }
};

async function isEnabled(tabId) {
    return await browser.sessions.getTabValue(tabId, "pin-to-tray.enabled") || false;
}

async function setEnabled(tabId, enabled) {
    if (await isEnabled(tabId)) {
        if (!enabled) {
            browser.sessions.setTabValue(tabId, "pin-to-tray.enabled", false);
            browser.tabs.sendMessage(tabId, { command: "disable" });
        }
    }
    else {
        if (enabled) {
            browser.sessions.setTabValue(tabId, "pin-to-tray.enabled", true);
            browser.tabs.sendMessage(tabId, { command: "enable" });
        }
    }
}

function reconnect() {
    connectNative();
    initTabs();
}

// Install native module
var nativePort = null;
function connectNative() {
    nativePort = browser.runtime.connectNative("pintotray");
    nativePort.onMessage.addListener((response) => {
        let command = response["command"];
        if (command !== undefined) {
            nativeCommands[command](response);
        }
    });
    nativePort.onDisconnect.addListener(reconnect);
}
// TODO: Lazy connections, so the application only has to be loaded if we're pinning
connectNative();

// Add a content script listener
browser.runtime.onMessage.addListener(({ command: command, ...params }, sender, sendResponse) => {
    let tab = sender.tab;
    if (tab !== undefined) {
        contentCommands[command](tab, params);
    };
});

// Add a listener for closed tabs
browser.tabs.onRemoved.addListener((tabId) => { nativePort.postMessage({ "command": "HideIcon", "id": tabId }) });

async function initTabs() {
    // Initialize all tabs
    let tabs = await browser.tabs.query({});
    tabs.forEach(async (tab) => {
        if (await isEnabled(tab.id)) {
            browser.tabs.sendMessage(tab.id, { command: "enable" });
        }
    });
}
initTabs();

// Create tab context menu toggle
let menuItemId = browser.menus.create({
    id: "pin-to-tray",
    title: "Pin to Tray",
    contexts: ["tab"],
    type: "checkbox",
    onclick: function(data, tab) {
        let checked = data.checked;
        setEnabled(tab.id, checked);
    }
});
// Add a listener to update the checkbox value
browser.menus.onShown.addListener(async function(info, tab) {
    if (info["menuIds"].includes(menuItemId)) {
        await browser.menus.update(menuItemId, { checked: await isEnabled(tab.id) });
        browser.menus.refresh();
    }
});
