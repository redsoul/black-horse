const configs = require('../configurations');
const { appendFile } = require('fs');

class LogStrategy {
    static noDate(timestamp, message) {
        console.log(message); // eslint-disable-line no-console
    }

    static toFile(timestamp, message) {
        let fileName = process.cwd() + '/logs/logs.txt';
        appendFile(fileName, `${timestamp} - ${message} \n`, error => {
            if (error) {
                console.log('Error writing to file'); // eslint-disable-line no-console
                console.error(error); // eslint-disable-line no-console
            }
        });
    }

    static toConsole(timestamp, message) {
        console.log(`${timestamp} - ${message}`); // eslint-disable-line no-console
    }

    static none() {

    }
}

class LoggerService {
    constructor(logLevel, logStrategy) {
        this.logLevel = logLevel;
        this.logs = [];
        this.changeStrategy(logStrategy);
    }

    changeStrategy(newStrategy) {
        if (typeof LogStrategy[newStrategy] === "function") {
            this.stategy = LogStrategy[newStrategy];
        }

        if (!this.stategy) {
            this.stategy = LogStrategy['noDate'];
        }
    }

    log(message, logLevel = 0) {
        if (configs.loggingEnabled && configs.currentLogLevel >= logLevel) {
            const timestamp = new Date().toISOString();
            this.stategy(timestamp, message);
        }
    }
}

module.exports = new LoggerService(configs.currentLogLevel, configs.logStrategy);