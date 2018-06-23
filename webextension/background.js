// Commands from content script
let contentCommands = {
    // A new tab announces itself
    Init: async (tab) => {
        if (await isEnabled(tab.id)) {
            browser.tabs.sendMessage(tab.id, { command: "enable" });
        }
    },

    // A tab has an updated icon
    UpdateIcon: (tab, params) => native.UpdateIcon({ id: tab.id, data: params["icon"] }),

    // A tab has an updated title
    UpdateTitle: async (tab, params) => {
        const id = tab.id;
        native.UpdateTitle({ id, title: params["title"] });
        let activeTabs = await browser.tabs.query({ "active": true });
        let isActive = activeTabs.some((activeTab) => (activeTab.id == id));
        if (!isActive && params["highlight"]) {
            native.HighlightIcon({ id, enabled: true });
        }
    },

    // A tab requests the icon to be removed
    HideIcon: (tab, params) => {
        native.HideIcon({ id: tab.id });
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

native.onReconnect = initTabs;

// Add a content script listener
browser.runtime.onMessage.addListener(({ command: command, ...params }, sender, sendResponse) => {
    let tab = sender.tab;
    if (tab !== undefined) {
        contentCommands[command](tab, params);
    };
});

// Add a listener for closed tabs
browser.tabs.onRemoved.addListener((id) => native.HideIcon({ id }));

// Add a listener for tab activations
browser.tabs.onActivated.addListener((activeInfo) => native.HighlightIcon({ id: activeInfo.tabId, enabled: false }));

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
