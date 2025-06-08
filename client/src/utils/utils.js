const pad = (v, n = 2) => {
    v = v + ""; // convert to string
    if (v.length === n)
        return v;
    for (let i = 0; i < n; i++) {
        v = "0" + v;
        if (v.length >= n)
            break;
    }
    return v;
};

const DATE_TYPE = { INPUT: 0, DISPLAY: 1 };

const formatDate = (d, type) => {
    if (!d)
        return "";

    if (typeof d === "string" || typeof d === "number") {
        d = new Date(d);
    }

    const date = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    const time = pad(d.getHours()) + ":" + pad(d.getMinutes());

    if (type === DATE_TYPE.INPUT)
        return date + "T" + time; // YYYY-MM-DDThh:mm - 2022-01-07T23:43:09
    else if (type === DATE_TYPE.DISPLAY)
        return date + " " + time; // YYYY-MM-DD hh:mm - 2022-01-07 23:43:09
    else return date + " " + time; // YYYY-MM-DD hh:mm - 2022-01-07 23:43:09
};

export { pad, formatDate, DATE_TYPE };