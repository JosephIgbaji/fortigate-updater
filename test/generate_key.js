const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('Generating RSA Host Key...');
const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'pkcs1', // "Public Key Cryptography Standards 1" 
        format: 'pem'   // Most common formatting choice
    },
    privateKeyEncoding: {
        type: 'pkcs1', // "Public Key Cryptography Standards 1"
        format: 'pem'   // Most common formatting choice
    }
});

const keyPath = path.join(__dirname, 'host.key');
fs.writeFileSync(keyPath, privateKey);
console.log(`Key written to ${keyPath}`);
