const native = (() => {
    const base = {
        nativePort: null,

        // Called automatically when the first command is sent
        connect: () => {
            if (base.nativePort) {
                // Already connected; ignore.
                return;
            }
            base.nativePort = browser.runtime.connectNative("pintotray");
            base.nativePort.onMessage.addListener((response) => {
                let command = response["command"];
                if (command !== undefined) {
                    nativeCommands[command](response);
                }
            });
            base.nativePort.onDisconnect.addListener(() => {
                base.nativePort = null;
                base.connect();
                base.onReconnect();
            });
        },

        // Reconnection callback
        onReconnect: () => {}
    };

    // Usage: native.CommandName({params...});
    const proxy = new Proxy(base, {
        get(target, name) {
            if (name in target) {
                return target[name];
            }
            base.connect();
            return (params) => {
                const command = Object.assign(params, { command: name });
                console.log("Native command: ", command);
                base.nativePort.postMessage(command);
            };
        }
    });

    return proxy;
})();
