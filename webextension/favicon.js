const favicon = (() => {
    const desiredSize = os.getDesiredIconSize();

    function getSize(linkElt) {
        const sizes = linkElt.getAttribute("sizes");
        if (sizes === null) {
            return null;
        }
        sizes = sizes.split(" ");
        const parsedSizes = [];

        // Iterate and parse
        for (let size of sizes) {
            const m = size.match(/([0-9]+)x([0-9]+)/i);
            if (m !== null) {
                let w = parseInt(m[1]);
                let h = parseInt(m[2]);
                parsedSizes.push(Math.max(w, h));
            }
        }
        parsedSizes.sort();

        // Pick the one that's closest, but not smaller, than the desired size
        for (let size of parsedSizes) {
            if (size >= desiredSize) {
                return size;
            }
        }
        // If that fails, pick the largest one
        if (parsedSizes.length > 0) {
            return parsedSizes.pop();
        }

        // Otherwise, give up
        return null;
    }

    function getIconUrl() {
        // Firefox has a weird delay on the Favicon URL in the tabs API.
        // We can probably do pretty well using our own logic.
        // Generally, if the icon is dynamic, it tends to expose only one anyway.

        // TODO: Relative schemas?

        // Find all icon candidates
        const elements = document.head.querySelectorAll("link[rel~=icon]");
        const elementsBySize = {};
        for (let element of elements) {
            const size = getSize(element);
            if (size !== null) {
                elementsBySize[size] = element;
            }
            else {
                // This should act as a fallback if no sizes are provided
                elementsBySize[0] = element;
            }
        }

        let sizes = Object.keys(elementsBySize).sort();

        // Pick the one that's closest, but not smaller, than the desired size
        for (let size of sizes) {
            if (size >= desiredSize) {
                return elementsBySize[size].getAttribute("href");
            }
        }
        if (sizes.length > 0) {
            return elementsBySize[sizes.pop()].getAttribute("href");
        }

        // If no candidates exist, try /favicon.ico
        return "/favicon.ico";
    }

    function isIconNode(node) {
        return node.nodeName.toLowerCase() == "link" &&
               Array.from(node.relList).some((token) => token.toLowerCase() == "icon");
    }

    return { getIconUrl, isIconNode };
})();
