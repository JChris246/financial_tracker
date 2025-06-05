const { createLogger, format, transports, addColors } = require("winston");
const { printf, combine, timestamp, colorize } = format;

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

addColors({
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "blue",
});

const devFormat = printf(({ level, message, timestamp }) => `[${timestamp} (${level})]: ${String(message).trim()}`);

const TestLogger = () => {
    return createLogger({
        levels,
        level: "http",
        format: combine(
            timestamp({ format: "YYYY-MM-DD @ HH:mm:ss" }),
            devFormat
        ),
        transports: [
            new transports.Console({
                format: combine(
                    colorize(),
                    timestamp({ format: "YYYY-MM-DD @ HH:mm:ss" }),
                    devFormat
                )
            })
        ],
    });
};

module.exports = TestLogger;