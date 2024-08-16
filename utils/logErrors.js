
import winston from "winston";

const logger = winston.createLogger({
    level: "error", // log only errors and above
    transports: [
        new winston.transports.File({
            filename: "error.log", // filename for the error log file
            format: winston.format.combine(
                winston.format.timestamp(), // add timestamp to each log entry
                winston.format.simple("db"),
                winston.format.json() // log entries in JSON format
            ),
        }),
    ],
});

// Middleware function to log errors
function logErrors(err, req, res, next) {
    logger.error(err); // log the error stack trace
}



export default logErrors;
