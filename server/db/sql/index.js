const logger = require("../../logger").setup();

const init = () => {
    // TODO: prepare sql db
    logger.debug("sql DB initialized");
    return false;
};

// TODO: implement db function similar to mongo

module.exports = {
    init
};