const isNumber = (value) => {
    return typeof value === "number" || (typeof value === "string" && !isNaN(value) && isFinite(Number(value)));
};

module.exports = { isNumber };