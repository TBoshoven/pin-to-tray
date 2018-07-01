const tabs = {
    // Whether the extension is enabled on a certain tab
    isEnabled: async (tabId) => await browser.sessions.getTabValue(tabId, "pin-to-tray.enabled") || false,

    // Enable or disable the extension on a certain tab
    setEnabled: async (tabId, enabled) => {
        const isEnabled = await tabs.isEnabled(tabId);
        if (isEnabled == enabled) {
            // Nothing to do
            return;
        }
        browser.sessions.setTabValue(tabId, "pin-to-tray.enabled", enabled);
        browser.tabs.sendMessage(tabId, { command: enabled ? "enable" : "disable" });
    },

    // Initialize all tabs
    init: async () => {
        let allTabs = await browser.tabs.query({});
        allTabs.forEach(async (tab) => {
            if (await tabs.isEnabled(tab.id)) {
                browser.tabs.sendMessage(tab.id, { command: "enable" });
            }
        });
    },

    // Callback for messages coming from tabs
    onCommand: (tabId, command, payload) => console.log("Tab command from", tabId, ":", command, payload)
};

// Add a content script listener
browser.runtime.onMessage.addListener(({ command: command, ...payload }, sender, sendResponse) => {
    const tab = sender.tab;
    if (tab !== undefined) {
        tabs.onCommand(tab.id, command, payload);
    };
});
