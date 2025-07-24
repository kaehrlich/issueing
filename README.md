# Mutual Certificate Issuer

Live:
- https://issueing.vercel.app
- https://issueing.crashdebug.dev

This service issues a pair of asymmetric mutual trust certificates for secure communication between two services over untrusted networks.

Each generated certificate file contains:
- A private RSA key (used for decryption)
- The peer’s public key (used for encryption)

This allows mutual authentication and encryption without relying on centralized infrastructure.

---

## Features

- One-click certificate generation
- Automatic mutual key pairing
- Advanced mode with configurable:
    - Validity duration (1–1000 days)
    - Custom validation server

---

## Usage

### Basic Mode

Visit the homepage and click **Request Certificates** to generate and download:
- `cert1.mutual.json`
- `cert2.mutual.json`

Distribute the files to the respective systems:
- Certificate 1 → Service A
- Certificate 2 → Service B

Each file is unique. Do not share private keys.

### Advanced Mode

Use `/advanced` to set:
- Validity duration
- Validation server (standard, permissive, or custom)

Once valid parameters are entered, certificates can be generated and downloaded.

---

## Development

```bash
npm install
npm run dev
```