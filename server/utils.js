const isNumber = (value) => {
    return (typeof value === "number" || (typeof value === "string" && isFinite(Number(value)))) && !isNaN(value);
};

module.exports = { isNumber };