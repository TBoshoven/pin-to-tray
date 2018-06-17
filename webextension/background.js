// Commands from content script
let contentCommands = {
	// A new tab announces itself
    Init: async (tab) => {
        if (await isEnabled(tab)) {
            browser.tabs.sendMessage(tab.id, {command: "enable"});
        }
    },

    // A tab has an updated icon
    UpdateIcon: (tab, params) => {
        let id = tab.id;
        console.log("Tab updated:", id);
        port.postMessage({"command": "UpdateIcon", "id": id, "data": params["icon"]});
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
	Unpin: () => {}
};

async function isEnabled(tab) {
    return await browser.sessions.getTabValue(tab.id, "pin-to-tray.enabled");
}

async function setEnabled(tab, enabled) {
    if (await isEnabled(tab)) {
        if (!enabled) {
            browser.sessions.setTabValue(tab.id, "pin-to-tray.enabled", false);
            browser.tabs.sendMessage(tab.id, {command: "disable"});
        }
    }
    else {
        if (enabled) {
            browser.sessions.setTabValue(tab.id, "pin-to-tray.enabled", true);
            browser.tabs.sendMessage(tab.id, {command: "enable"});
        }
    }
}

// Install native module
let port = browser.runtime.connectNative("pintotray");
port.onMessage.addListener((response) => {
    console.log("Received: ", response);
    let command = response["command"];
    if (command !== undefined) {
        nativeCommands[command](response);
    }
});

// Add a content script listener
browser.runtime.onMessage.addListener(({command: command, ...params}, sender, sendResponse) => {
    let tab = sender.tab;
    if (tab !== undefined) {
        contentCommands[command](tab, params);
    };
});

// Create tab context menu toggle
browser.contextMenus.create({
    id: "pin-to-tray",
    title: "Pin to Tray",
    contexts: ["tab"],
    type: "checkbox",
    onclick: function(data, tab) {
        let checked = data.checked;
        setEnabled(tab, checked);
    }
});
