const title = {
    getTitle: () => {
        const element = document.head.querySelector("title");
        if (element === null) {
            // If there is no title element, extract the domain from the url
            return document.location.host || "Pin to Tray";
        }
        // Remove all whitespace at the start and end, and compact any whitespace in the center
        return element.innerText.replace(/(^\s+|\s+$|\s+(?=\s))/g, "");
    },

    isTitleNode: (node) => node.nodeName.toLowerCase() == "title"
};
