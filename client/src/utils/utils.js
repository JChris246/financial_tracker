const pad = (v, n = 2) => {
    v = v + ""; // convert to string
    if (v.length >= n)
        return v;
    for (let i = 0; i < n; i++) {
        v = "0" + v;
        if (v.length >= n)
            break;
    }
    return v;
};

const DATE_TYPE = { INPUT: 0, DISPLAY_FULL: 1, DISPLAY_DATE: 2 };

const formatDate = (d, type) => {
    if (typeof d === "string") {
        d = d.trim();
    }

    if (!d)
        return "";

    if (typeof d === "string" || typeof d === "number") {
        d = new Date(d);
    } else if (!(d instanceof Date)) {
        return "";
    }

    if (isNaN(d.getTime()))
        return "";

    const date = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    const time = pad(d.getHours()) + ":" + pad(d.getMinutes());

    if (type === DATE_TYPE.INPUT)
        return date + "T" + time; // YYYY-MM-DDThh:mm - 2022-01-07T23:43
    else if (type === DATE_TYPE.DISPLAY_FULL)
        return date + " " + time; // YYYY-MM-DD hh:mm - 2022-01-07 23:43
    else if (type === DATE_TYPE.DISPLAY_DATE)
        return date; // YYYY-MM-DD - 2022-01-07
    else return date + " " + time; // YYYY-MM-DD hh:mm - 2022-01-07 23:43
};

const formatMoney = (m) => {
    if (typeof m !== "number") {
        return m;
    }

    // this not necessarily locale friendly (i.e. uses commas even if locale expects periods)
    return m.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const stringToColor = (str) => {
    str += "please add some more entropy to avoid to similar colors";

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 7) - hash);
    }

    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;

    // convert to hex and return
    return `#${pad(r.toString(16))}${pad(g.toString(16))}${pad(b.toString(16))}`;
};

export { pad, formatDate, DATE_TYPE, formatMoney, stringToColor };