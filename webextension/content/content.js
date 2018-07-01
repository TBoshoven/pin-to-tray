async function updateIcon() {
    const url = favicon.getIconUrl();
    try {
        const icon = await renderIcon.fromUrl(url);
        browser.runtime.sendMessage({ command: "UpdateIcon", icon });
    }
    catch (e) {
        console.log("PinToTray Could not update icon:", e);
    }
}

let lastUpdatedTitle = null;

function updateTitle(highlight) {
    highlight = !!highlight;
    const currentTitle = title.getTitle();
    if (currentTitle != lastUpdatedTitle) {
        browser.runtime.sendMessage({ command: "UpdateTitle", title: currentTitle, highlight });
        lastUpdatedTitle = currentTitle;
    }
}

function hideIcon() {
    browser.runtime.sendMessage({ command: "HideIcon" });
}

monitor.onIconUpdated = updateIcon;
monitor.onTitleUpdated = () => updateTitle(true);

// Commands from background script
const commands = {
    enable: () => {
        monitor.enable();

        // Always update
        updateTitle(false);
        updateIcon();
    },
    disable: () => {
        monitor.disable();

        hideIcon();
    }
};

// Add a background script listener
browser.runtime.onMessage.addListener(({ command: command, ...params }, sender, sendResponse) => {
    commands[command](params);
});

// Poke it to enable reporting if necessary
browser.runtime.sendMessage({ command: "Init" });
