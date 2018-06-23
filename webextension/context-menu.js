// Create tab context menu toggle
let menuItemId = browser.menus.create({
    id: "pin-to-tray",
    title: "Pin to Tray",
    contexts: ["tab"],
    type: "checkbox",
    onclick: function(data, tab) {
        let checked = data.checked;
        setEnabled(tab.id, checked);
    }
});

// Add a listener to update the checkbox value
browser.menus.onShown.addListener(async function(info, tab) {
    if (info["menuIds"].includes(menuItemId)) {
        await browser.menus.update(menuItemId, { checked: await isEnabled(tab.id) });
        browser.menus.refresh();
    }
});
