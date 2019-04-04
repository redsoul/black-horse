const LoggerService = require('../../src/services/logger-service');
const configs = require('../../src/configurations');

describe('Logger Service', function () {

    const mockConsole = (mockArg) => {
        const originalConsole = { ...console };
        global.console[mockArg] = jest.fn();

        // Return function to restore console
        return () => {
            global.console = originalConsole;
        };
    };
    
    test("if logs are produced when loggingEnabled is off", function () {
        const originalConfigs = configs.loggingEnabled;
        configs.loggingEnabled = false;

        const restoreConsole = mockConsole('log');
        LoggerService.log('some text');
        expect(console.log).not.toHaveBeenCalled();

        configs.loggingEnabled = originalConfigs;
    });

    test("if logs are produced when loggingEnabled is on but logLevel is below currentLogLevel", function () {
        const originaLoggingEnabled = configs.loggingEnabled;
        const originaCurrentLogLevel = configs.currentLogLevel;
        configs.loggingEnabled = true;
        configs.currentLogLevel = 1

        const restoreConsole = mockConsole('log');
        LoggerService.log('some text', 1);
        expect(console.log).not.toHaveBeenCalled();

        configs.loggingEnabled = originaLoggingEnabled;
        configs.currentLogLevel = originaCurrentLogLevel;

        restoreConsole();
    });
});