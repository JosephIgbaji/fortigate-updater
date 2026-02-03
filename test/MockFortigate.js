const fs = require('fs');
const { Server } = require('ssh2');
const path = require('path');

const hostKey = fs.readFileSync(path.join(__dirname, 'host.key'));

const server = new Server({
    hostKeys: [hostKey]
}, (client) => {
    console.log('\n[Mock] Client connected!');

    client.on('error', (err) => console.error('[Mock] Client Error:', err.message));

    client.on('authentication', (ctx) => {
        console.log(`[Mock] Auth attempt: User=${ctx.username} Method=${ctx.method}`);
        if (ctx.method === 'password')
            ctx.accept();
        else
            ctx.reject();
    }).on('ready', () => {
        console.log('[Mock] Client authenticated!');

        client.on('session', (accept, reject) => {
            const session = accept();
            session.on('pty', (accept, reject, info) => {
                accept();
            });
            session.on('shell', (accept, reject) => {
                const stream = accept();
                // Emulate Fortigate prompt
                stream.write('FortiGate-VM64 # ');

                stream.on('data', (data) => {
                    const input = data.toString();
                    const lines = input.split('\n');

                    for (const line of lines) {
                        const cmd = line.trim();
                        if (cmd === 'exit') {
                            stream.write('\nlogout\n');
                            stream.exit(0);
                            stream.end();
                            break;
                        }
                        if (cmd) {
                            console.log(`[Mock] EXEC_CMD: ${cmd}`);
                            // Fortigates echo back
                            stream.write(cmd + '\n');
                        }
                    }
                });
            });
        });
    }).on('end', () => {
        console.log('[Mock] Client disconnected');
    });
});

const PORT = 9999;
server.listen(PORT, '127.0.0.1', function () {
    console.log('Mock Fortigate Server listening on port ' + PORT);
});
