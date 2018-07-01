const renderIcon = (() => {
    const desiredSize = os.getDesiredIconSize();

    // Helper function to load an image in the background
    function loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    async function fromUrl(url) {
        // Render to off-screen canvas of desired size
        // Return as PNG data
        // XXX: What to do about animated gifs? Looks like systrays don't support those anyway.
        const canvas = document.createElement("canvas");
        canvas.width = desiredSize;
        canvas.height = desiredSize;
        const context = canvas.getContext("2d");
        context.drawImage(await loadImage(url), 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL().replace(/^.*?,/, "");
    }

    return { fromUrl };
})();
