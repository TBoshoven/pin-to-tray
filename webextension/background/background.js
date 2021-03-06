// Commands from content script
const tabCommands = {
    // A new tab announces itself
    Init: async (id) => {
        if (await tabs.isEnabled(id)) {
            browser.tabs.sendMessage(id, { command: "enable" });
        }
    },

    // A tab has an updated icon
    UpdateIcon: (id, params) => native.UpdateIcon({ id, data: params["icon"] }),

    // A tab has an updated title
    UpdateTitle: async (id, params) => {
        native.UpdateTitle({ id, title: params["title"] });
        let activeTabs = await browser.tabs.query({ "active": true });
        let isActive = activeTabs.some((activeTab) => (activeTab.id == id));
        if (!isActive && params["highlight"]) {
            native.HighlightIcon({ id, enabled: true });
        }
    },

    // A tab requests the icon to be removed
    HideIcon: (id, params) => {
        native.HideIcon({ id });
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
        tabs.setEnabled(params["id"], false);
    },

    TrayIsEmpty: () => {
        native.disconnect();
    }
};

native.onReconnect = tabs.init;
native.onCommand = (command, payload) => nativeCommands[command](payload);
tabs.onCommand = (tab, command, payload) => tabCommands[command](tab, payload);

// Add a listener for closed tabs
browser.tabs.onRemoved.addListener((id) => native.HideIcon({ id }));

// Add a listener for tab activations
browser.tabs.onActivated.addListener((activeInfo) => native.HighlightIcon({ id: activeInfo.tabId, enabled: false }));

tabs.init();
