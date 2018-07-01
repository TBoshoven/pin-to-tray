const os = {
    getDesiredIconSize: () => {
        // TODO: Verify these; this was extracted from various pieces of documentation.
        // Might be able to extract this using native component.
        if (navigator.appVersion.indexOf("Win") != -1) {
            return 16;
        }
        // This will not work properly with changes or multiple screens, but it's better than nothing.
        if (navigator.appVersion.indexOf("Mac") != -1) {
            return 18 * window.devicePixelRatio;
        }
        // Qt recommendation
        return 22;
    }
};
