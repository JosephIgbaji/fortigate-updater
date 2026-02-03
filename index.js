require('dotenv').config();
const express = require('express');
const FortiSSHClient = require('./src/FortiSSHClient');

const app = express();
// Trust Vercel proxy to get real client IP
app.set('trust proxy', 1);

const port = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Configuration
const firewallConfig = {
    host: process.env.FIREWALL_HOST,
    port: process.env.FIREWALL_PORT,
    username: process.env.FIREWALL_USER,
    password: process.env.FIREWALL_PASSWORD
};

app.get('/', (req, res) => {
    // Basic detection of IP
    let ip = req.ip;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    res.send(`
        <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; text-align: center;">
            <h1>Fortigate IP Updater</h1>
            <p>Detected Request IP: <strong>${ip}</strong></p>
            <form action="/update" method="post">
                <p>Click below to whitelist your current IP on the firewall.</p>
                <input type="hidden" name="ip" value="${ip}" /> 
                <!-- In production, don't trust the client-provided IP field, verify strictly on server -->
                <button type="submit" style="padding: 10px 20px; font-size: 1.2em; cursor: pointer;">Update Access</button>
            </form>
        </div>
    `);
});

app.post('/update', async (req, res) => {
    // Use detected IP or form IP? For POC, using detected IP is better security practice generally,
    // but passing it for visibility helps debugging local proxies.
    // Let's rely on server-side detection again to be sure (or just use what we showed).

    let ip = req.ip;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    const targetAddressObject = process.env.TEST_ADDRESS_OBJECT;

    if (!targetAddressObject || !firewallConfig.host) {
        return res.status(500).send("Server configuration error: Missing environment variables.");
    }

    console.log(`[Request] Update ${targetAddressObject} -> ${ip}`);

    try {
        const client = new FortiSSHClient(firewallConfig);
        const output = await client.updateUserIP(targetAddressObject, ip);

        res.send(`
            <div style="font-family: sans-serif; max-width: 800px; margin: 40px auto;">
                <h2 style="color: green;">Success</h2>
                <p>Command executed on firewall.</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
                    <pre>${output}</pre>
                </div>
                <br>
                <a href="/">Back</a>
            </div>
        `);
    } catch (error) {
        console.error("SSH Error:", error);
        res.status(500).send(`
            <h2 style="color: red;">Failed</h2>
            <p>${error.message}</p>
            <a href="/">Back</a>
        `);
    }
});

// Export for Vercel
module.exports = app;

// Start server if run directly
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log(`Targeting Firewall: ${firewallConfig.host || 'Not Configured'}`);
    });
}
