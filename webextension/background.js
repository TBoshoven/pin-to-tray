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

let commands = {
   init: async (tab) => {
       if (await isEnabled(tab)) {
           browser.tabs.sendMessage(tab.id, {command: "enable"});
       }
   }
}

// Add a content script listener
browser.runtime.onMessage.addListener(({command: command, ...params}, sender, sendResponse) => {
    let tab = sender.tab;
    if (tab !== undefined) {
        commands[command](tab, params);
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
