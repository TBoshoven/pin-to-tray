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
            base.nativePort.onMessage.addListener((message) => {
                let command = message.command;
                if (command !== undefined) {
                    base.onCommand(command, message);
                }
            });
            base.nativePort.onDisconnect.addListener(() => {
                base.nativePort = null;
                base.connect();
                base.onReconnect();
            });
        },

        disconnect: () => {
            base.nativePort.disconnect();
            base.nativePort = null;
        },

        // Command callback
        onCommand: (command, payload) => console.log("Received command:", command, payload),

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
