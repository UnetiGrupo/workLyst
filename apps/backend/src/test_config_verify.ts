import { cargarConfiguracion } from './config/configLoader';

console.log('TEST_START: Validating configuration loading...');
try {
    const config = cargarConfiguracion();
    console.log('TEST_SUCCESS: Config loaded successfully.');
    console.log('TEST_INFO: Port=' + config.server.port);
} catch (e) {
    console.error('TEST_ERROR: Failed to load config:', e);
    process.exit(1);
}
