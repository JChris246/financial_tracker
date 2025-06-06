const logger = require("../../logger").setup();

const init = () => {
    // TODO: prepare json db
    logger.debug("JSON DB initialized");
    return true;
};

// TODO: implement db function similar to mongo

module.exports = {
    init
};

