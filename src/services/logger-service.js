const configs = require('../configurations');
const { appendFile } = require('fs');

class LogStrategy {
    static noDate(timestamp, message) {
        console.log(message);
    }

    static toFile(timestamp, message) {
        var fileName = path.join(__dirname, 'logs.txt');
        appendFile(fileName, `${timestamp} - ${message} \n`, error => {
            if (error) {
                console.log('Error writing to file');
                console.error(error);
            }
        });
    }

    static toConsole(timestamp, message) {
        console.log(`${timestamp} - ${message}`);
    }

    static none() {

    }
}

class LoggerService {
    constructor(logLevel, logStrategy) {
        this.logLevel = logLevel;
        this.logs = [];
        this.stategy = LogStrategy[logStrategy];
    }

    changeStrategy(newStrategy) {
        this.stategy = LogStrategy[newStrategy];
    }

    log(message, logLevel=0) {
        if (configs.loggingEnabled && configs.currentLogLevel >= logLevel) {
            const timestamp = new Date().toISOString();
            this.stategy(timestamp, message);
        }
    }
}

module.exports = new LoggerService(configs.currentLogLevel, configs.logStrategy);