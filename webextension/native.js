const native = new Proxy({}, {
    get(target, name) {
        return (params) => {
            nativePort.postMessage(Object.assign(params, { command: name }));
        };
    }
});
