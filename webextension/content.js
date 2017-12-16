var commands = {
    enable: () => {
        alert("Hi!");
    }
}

// Add a background script listener
browser.runtime.onMessage.addListener(({command: command, ...params}, sender, sendResponse) => { commands[command](params); });

// Poke it to enable reporting if necessary
browser.runtime.sendMessage({command: "init"});
