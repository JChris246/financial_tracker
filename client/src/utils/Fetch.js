const requestSync = async ({ url, method="GET", token, body }) => {
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const res = await fetch(url, { method, headers, body });

        const isResponseJson = res.headers.get("Content-Type")?.includes("application/json");
        const json = isResponseJson ? await res.json() : undefined;

        if (!(res.status >= 200 && res.status < 300)) {
            return {
                status: res.status,
                msg: json?.msg,
                success: false,
                json
            };
        }

        return {
            json,
            success: true,
            msg: json?.msg,
        };
    } catch (e) {
        return {
            msg: e,
            success: false
        };
    }
};

const request = ({ url, method="GET", token, body, callback }) => {
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(url, { method, headers, body }).then(res => {
        const isResponseJson = res.headers.get("Content-Type")?.includes("application/json");
        if (!(res.status >= 200 && res.status < 300)) {
            if (isResponseJson) {
                res.json().then(json => callback({ status: res.status, msg: json.msg, success: false, json }))
                    .catch(e => callback({ msg: "Failed to load json: "+e, success: false }));
            } else {
                callback({ status: res.status, success: false });
            }
        } else {
            if (isResponseJson) {
                res.json().then(json => callback({ json, success: true, msg: json.msg }));
            } else {
                callback({ success: true });
            }
        }
    });
};

export {
    requestSync,
    request
};