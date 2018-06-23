(() => {
    // Create tab context menu toggle
    const menuItemId = browser.menus.create({
        id: "pin-to-tray",
        title: "Pin to Tray",
        contexts: ["tab"],
        type: "checkbox",
        onclick: (data, tab) => tabs.setEnabled(tab.id, data.checked)
    });

    // Add a listener to update the checkbox value
    browser.menus.onShown.addListener(async (info, tab) => {
        if (info["menuIds"].includes(menuItemId)) {
            await browser.menus.update(menuItemId, { checked: await tabs.isEnabled(tab.id) });
            browser.menus.refresh();
        }
    });
})();
