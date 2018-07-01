const monitor = (() => {
    let observer = null;

    const public = {
        onIconUpdated: () => {},
        onTitleUpdated: () => {},
    };

    function observeNode(node) {
        switch (node.nodeName.toLowerCase()) {
        case "head":
            observer.observe(node, { childList: true });
            break;
        case "link":
            observer.observe(node, { attributes: true, attributeFilter: ["href", "rel", "sizes"] });
            break;
        case "title":
            // Titles can contain all kinds of weirdness, so this one needs to be quite broad
            observer.observe(node, { childList: true, characterData: true, subtree: true });
            break;
        }
    }

    function onMutation(mutations) {
        for (let mutation of mutations) {
            switch (mutation.type) {
            case "childList":
                if (title.isTitleNode(mutation.target)) {
                    updateTitle(true);
                }
                else {
                    // Modifications to <head>
                    const touched = [];
                    mutation.addedNodes.forEach((node) => {
                        touched.unshift(node);
                        observeNode(node);
                    });
                    mutation.removedNodes.forEach((node) => touched.unshift(node));
                    if (touched.some(favicon.isIconNode)) {
                        public.onIconUpdated();
                    }
                    if (touched.some(title.isTitleNode)) {
                        public.onTitleUpdated();
                    }
                }
                break;
            case "attributes":
                public
                .onIconUpdated();
                break;
            }
        }
    }

    public.enable = () => {
        // No need to re-add the observer if it's already there
        if (observer === null) {
            // Attach listener
            observer = new MutationObserver(onMutation);

            // Monitor <head> for additions and removals
            observeNode(document.head);

            // Monitor <link> and <title> attribute modifications
            for (let node of document.head.querySelectorAll("link, title")) {
                observeNode(node);
            }
        }
    };

    public.disable = () => {
        if (observer !== null) {
            observer.disconnect();
            observer = null;
        }
    };

    return public;
})();
