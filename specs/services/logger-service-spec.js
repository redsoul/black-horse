const LoggerService = require('../../src/services/logger-service');
const configs = require('../../src/configurations');
const fs = require('fs');

jest.mock('fs');

describe('Logger Service', function () {
	const mockConsole = mockArg => {
		const originalConsole = { ...console };
		global.console[mockArg] = jest.fn();

		// Return function to restore console
		return () => {
			global.console = originalConsole;
		};
	};

	test('if changeStategy defaults to previous stategy if exists', function () {
		const originaLoggingEnabled = configs.loggingEnabled;
		const originaCurrentLogLevel = configs.currentLogLevel;
		configs.loggingEnabled = true;
		configs.currentLogLevel = 1;

		const restoreConsole = mockConsole('log');
		LoggerService.changeStrategy('nonexistingStrategy');
		LoggerService.log('some text');
		expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/.*\s-\ssome text/));

		configs.loggingEnabled = originaLoggingEnabled;
		configs.currentLogLevel = originaCurrentLogLevel;
		restoreConsole();
		LoggerService.changeStrategy(configs.logStrategy);
	});

	test('if changeStategy defaults to toDate when no existing stategy', function () {
		const originaLoggingEnabled = configs.loggingEnabled;
		const originaCurrentLogLevel = configs.currentLogLevel;
		configs.loggingEnabled = true;
		configs.currentLogLevel = 1;

		const restoreConsole = mockConsole('log');
		LoggerService.stategy = undefined;
		LoggerService.changeStrategy('nonexistingStrategy');
		LoggerService.log('some text');
		expect(console.log).toHaveBeenCalledWith('some text');

		configs.loggingEnabled = originaLoggingEnabled;
		configs.currentLogLevel = originaCurrentLogLevel;
		restoreConsole();
		LoggerService.changeStrategy(configs.logStrategy);
	});

	test('if logs are produced when loggingEnabled is off', function () {
		const originalConfigs = configs.loggingEnabled;
		configs.loggingEnabled = false;

		const restoreConsole = mockConsole('log');
		LoggerService.log('some text');
		expect(console.log).not.toHaveBeenCalled();

		configs.loggingEnabled = originalConfigs;
		restoreConsole();
	});

	test('if logs are produced when loggingEnabled is on but logLevel is below currentLogLevel', function () {
		const originaLoggingEnabled = configs.loggingEnabled;
		const originaCurrentLogLevel = configs.currentLogLevel;
		configs.loggingEnabled = true;
		configs.currentLogLevel = 1;

		const restoreConsole = mockConsole('log');
		LoggerService.log('some text', 2);
		expect(console.log).not.toHaveBeenCalled();

		configs.loggingEnabled = originaLoggingEnabled;
		configs.currentLogLevel = originaCurrentLogLevel;
		restoreConsole();
	});

	test('if logs are produced when log stategy set to none', function () {
		const originaLoggingEnabled = configs.loggingEnabled;
		const originaCurrentLogLevel = configs.currentLogLevel;
		configs.loggingEnabled = true;
		configs.currentLogLevel = 1;

		const restoreConsole = mockConsole('log');
		LoggerService.changeStrategy('none');
		LoggerService.log('some text');
		expect(console.log).not.toHaveBeenCalled();

		configs.loggingEnabled = originaLoggingEnabled;
		configs.currentLogLevel = originaCurrentLogLevel;
		LoggerService.changeStrategy(configs.logStrategy);
		restoreConsole();
	});

	test('if logs are written into file when log stategy is set to toFile', function () {
		const originaLoggingEnabled = configs.loggingEnabled;
		const originaCurrentLogLevel = configs.currentLogLevel;
		configs.loggingEnabled = true;
		configs.currentLogLevel = 1;

		LoggerService.changeStrategy('toFile');
		LoggerService.log('some text');
		expect(fs.appendFile).toHaveBeenCalledWith(
			expect.stringMatching(/.*logs\.txt/),
			expect.stringMatching(/.*\s-\ssome text/),
			expect.any(Function)
		);

		configs.loggingEnabled = originaLoggingEnabled;
		configs.currentLogLevel = originaCurrentLogLevel;
		LoggerService.changeStrategy(configs.logStrategy);
	});

	test('if logs are produced when loggingEnabled is on and set to noDate', function () {
		const originaLoggingEnabled = configs.loggingEnabled;
		const originaCurrentLogLevel = configs.currentLogLevel;
		configs.loggingEnabled = true;
		configs.currentLogLevel = 1;

		const restoreConsole = mockConsole('log');
		LoggerService.changeStrategy('noDate');
		LoggerService.log('some text');
		expect(console.log).toHaveBeenCalledWith('some text');

		configs.loggingEnabled = originaLoggingEnabled;
		configs.currentLogLevel = originaCurrentLogLevel;
		restoreConsole();
		LoggerService.changeStrategy(configs.logStrategy);
	});

	test('if logs are produced when loggingEnabled is on and set to toConsole', function () {
		const originaLoggingEnabled = configs.loggingEnabled;
		const originaCurrentLogLevel = configs.currentLogLevel;
		configs.loggingEnabled = true;
		configs.currentLogLevel = 1;

		const restoreConsole = mockConsole('log');
		LoggerService.changeStrategy('toConsole');
		LoggerService.log('some text');
		expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/.*\s-\ssome text/));

		configs.loggingEnabled = originaLoggingEnabled;
		configs.currentLogLevel = originaCurrentLogLevel;
		restoreConsole();
		LoggerService.changeStrategy(configs.logStrategy);
	});
});
