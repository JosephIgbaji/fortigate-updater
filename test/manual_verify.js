const FortiSSHClient = require('../src/FortiSSHClient');

const config = {
    host: '127.0.0.1',
    port: 9999,
    username: 'admin',
    password: 'password'
};

const client = new FortiSSHClient(config);
console.log('Connecting to Mock Server...');
client.updateUserIP('TEST_OBJ', '192.168.99.99')
    .then(output => {
        console.log('\n--- SESSION OUTPUT ---');
        console.log(output);
        console.log('--- END SESSION ---');
        process.exit(0);
    })
    .catch(err => {
        console.error('Test Error:', err);
        process.exit(1);
    });
