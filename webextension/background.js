 var commands = {
    init: (tab) => {
        browser.tabs.sendMessage(tab.id, {command: 'enable'});
    }
}

// Add a content script listener
browser.runtime.onMessage.addListener(({command: command, ...params}, sender, sendResponse) => {
    var tab = sender.tab;
    // TODO: Verify that the message came from a tab
    commands[command](tab, params);
});
