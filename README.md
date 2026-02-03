# Fortigate IP Automator

Automate the process of updating remote user IP addresses on a Fortigate firewall. This project provides a self-service web portal that detects a user's public IP and updates a specific "Address Object" on the Fortigate firewall via SSH.

## Features

- **Self-Service Portal**: Simple webpage for users to trigger IP updates.
- **Automatic IP Detection**: Detects the requestor's public IP.
- **SSH Automation**: Connects securely to the Fortigate CLI to execute update commands.
- **Mock Server**: Includes a mock SSH server for safe local development and testing.

## Prerequisites

- Node.js (v14 or later)
- NPM

## Installation

1. Clone the repository (or navigate to the project folder).
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *(On Windows: `copy .env.example .env`)*

2. Edit `.env` with your firewall details:
   ```ini
   PORT=3000
   FIREWALL_HOST=192.168.1.99    # IP of your Fortigate
   FIREWALL_USER=admin           # Admin username
   FIREWALL_PASSWORD=secret      # Admin password
   TEST_ADDRESS_OBJECT=REMOTE_USER_1 # Name of the Address Object to update
   ```

## Usage

Start the web server:
```bash
npm start
```
Access the portal at `http://localhost:3000`.

## Development / Testing

To test without a real firewall, use the included Mock SSH Server.

1. **Generate Test Keys** (First time only):
   ```bash
   node test/generate_key.js
   ```

2. **Start Mock Server**:
   ```bash
   node test/MockFortigate.js
   ```
   *The mock server listens on port 9999.*

3. **Configure .env for Mock**:
   Set `FIREWALL_HOST=127.0.0.1` and `FIREWALL_PORT=9999` (you may need to modify `index.js` or `FortiSSHClient.js` to accept a port config if not already strictly implemented, or just rely on the default logic. *Note: The current POC code defaults to port 22 in `FortiSSHClient.js` unless overridden. You might need to update the `firewallConfig` object in `index.js` to pass `port: process.env.FIREWALL_PORT`.*)

4. **Run Verification Script**:
   ```bash
   node test/manual_verify.js
   ```

## Security Note

This is a **Proof of Concept (POC)**. For production use:
- **Authentication**: Add user login/SSO to the web portal.
- **Validation**: Strict validation of IP addresses.
- **Least Privilege**: Use a Fortigate admin account with restricted permissions.

## Deployment on Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set Environment Variables in Vercel Project Settings (`FIREWALL_HOST`, `FIREWALL_USER`, etc.).

