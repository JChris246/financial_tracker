const { sleep } = require("../utils/utils");

// for mongoose this does not need to return handle...will it need to for sql?
const setupDatabase = async (type) => {
    if (!type) {
        throw new Error("Database type not specified");
    }

    let successful = false;
    switch (type.toLowerCase()) {
        case "mongo":
            successful = await require("./mongo").init();
            break;
        case "sql":
            successful = await require("./sql").init();
            break;
        case "json":
            successful = require("./json").init();
            break;
        default:
            throw new Error("Database type not supported");
    }

    return successful;
};

const getDatabase = async () => {
    if (!global.ACTIVE_DB_TYPE) {
        let tries = 20;
        while (!global.ACTIVE_DB_TYPE && tries > 0) {
            await sleep(100);
            tries--;
        }
    }

    if (!global.ACTIVE_DB_TYPE) {
        throw new Error("Database not setup");
    }

    switch (global.ACTIVE_DB_TYPE.toLowerCase()) {
        case "mongo":
            return require("./mongo");
        case "sql":
            return require("./sql");
        case "json":
            return require("./json");
        default:
            throw new Error("Database type not supported");
    }
};

module.exports = { setupDatabase, getDatabase };