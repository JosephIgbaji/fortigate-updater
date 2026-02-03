const { Client } = require('ssh2');

class FortiSSHClient {
    /**
     * @param {Object} config
     * @param {string} config.host
     * @param {number} [config.port=22]
     * @param {string} config.username
     * @param {string} config.password
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * Updates an address object with a new IP.
     * @param {string} addressObject - Name of the address object on the firewall.
     * @param {string} newIP - The new IP address (e.g., "1.2.3.4").
     * @returns {Promise<string>} - The shell output.
     */
    async updateUserIP(addressObject, newIP) {
        return new Promise((resolve, reject) => {
            const conn = new Client();

            conn.on('ready', () => {
                console.log('SSH Client :: Ready');

                conn.shell((err, stream) => {
                    if (err) {
                        conn.end();
                        return reject(err);
                    }

                    let output = ''; // Accumulate output for debugging/logging

                    stream.on('close', () => {
                        console.log('SSH Shell :: Closed');
                        conn.end();
                        resolve(output);
                    }).on('data', (data) => {
                        output += data;
                        // Optional debug: console.log('STDOUT: ' + data);
                    }).on('error', (err) => {
                        console.error('SSH Shell Stream Error:', err);
                        reject(err);
                    });

                    // Build command sequence
                    // Using set subnet with /32 mask (255.255.255.255) for single host
                    const commands = [
                        'config firewall address',
                        `edit "${addressObject}"`,
                        `set subnet ${newIP} 255.255.255.255`,
                        'next',
                        'end',
                        'exit' // Terminate session to trigger close
                    ];

                    const commandString = commands.join('\n') + '\n';

                    // Simple delay to ensure session is stable (POC hack)
                    setTimeout(() => {
                        stream.write(commandString);
                    }, 500);

                });
            }).on('error', (err) => {
                console.error('SSH Connection Error:', err);
                reject(err);
            }).connect({
                host: this.config.host,
                port: this.config.port || 22,
                username: this.config.username,
                password: this.config.password,
                readyTimeout: 20000, // Increase timeout to 20 seconds
                debug: (msg) => console.log('[SSH2 DEBUG]:', msg) // Log low-level debug info
            });
        });
    }
}

module.exports = FortiSSHClient;
