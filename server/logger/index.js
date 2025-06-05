const prodLogger = require("./productionLogger");
const devLogger = require("./developmentLogger");
const testLogger = require("./testLogger");

const fs = require("fs");

// process.env.TZ = "UTC";

/**
 * Get the next available archive number.
 *
 * @returns {number} The archive number.
 */
const getNextArchiveNumber = () => {
    let current = 1;
    while (fs.existsSync(global.LOG_DIR + "/combined.log." + current)) {
        current++;
    }

    return current;
};

module.exports.setup = (isInitial=false) => {
    let logger = null;
    if (process.env.NODE_ENV !== "test") {
        if (!fs.existsSync(global.LOG_DIR)) {
            fs.mkdirSync(global.LOG_DIR);
        }

        // archive current log files if exist
        if (isInitial && fs.existsSync(global.LOG_DIR + "/combined.log")) {
            const archiveNumber = getNextArchiveNumber();
            fs.renameSync(global.LOG_DIR + "/combined.log", global.LOG_DIR + "/combined.log." + archiveNumber);
            fs.renameSync(global.LOG_DIR + "/error.log", global.LOG_DIR + "/error.log." + archiveNumber);
        }
    }

    switch (process.env.NODE_ENV) {
        case "production":
        case "prod":
            logger = prodLogger();
            break;
        case "test":
            logger = testLogger();
            break;
        case "development":
        case "dev":
        default: // node env not set assume dev
            logger = devLogger();
    }

    if (isInitial) {
        // put the following log here so that it's the 1st thing that gets logged
        logger.info("Starting server setup...");
        const loggerType = (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod") ?
            "production" : process.env.NODE_ENV === "test" ? "test" : "development";

        logger.info("Using " + loggerType + " logger");
    }

    return logger;
};