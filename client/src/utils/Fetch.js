const requestSync = async ({ url, method="GET", token, body }) => {
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const res = await fetch(url, { method, headers, body });

        if (!(res.status >= 200 && res.status < 300)) {
            return {
                status: res.status,
                msg: (await res.json()).msg,
                success: false
            };
        }

        return {
            json: await res.json(),
            success: true
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
        if (!(res.status >= 200 && res.status < 300)) {
            res.json().then(json => callback({ status: res.status, msg: json.msg, success: false }))
                .catch(e => callback({ msg: "Failed to load json: "+e, success: false }));
        } else res.json().then(json => callback({ json, success: true }));
    });
};

export {
    requestSync,
    request
};