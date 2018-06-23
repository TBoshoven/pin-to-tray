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
    }
};
