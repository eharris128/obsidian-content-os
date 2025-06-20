import { describe, it, expect } from 'vitest';
import { LogLevel, createLogger } from '../src/utils/logger';

describe('Logger', () => {
	it('should create a no-op logger when devMode is false', () => {
		const logger = createLogger('test', false);
		expect(logger).toBeDefined();
		expect(logger.debug).toBeDefined();
		expect(logger.info).toBeDefined();
		expect(logger.warn).toBeDefined();
		expect(logger.error).toBeDefined();
	});

	it('should create a real logger when devMode is true', () => {
		const logger = createLogger('test', true, LogLevel.DEBUG);
		expect(logger).toBeDefined();
		expect(logger.debug).toBeDefined();
		expect(logger.info).toBeDefined();
		expect(logger.warn).toBeDefined();
		expect(logger.error).toBeDefined();
	});
});