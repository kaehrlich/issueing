import { NextResponse } from 'next/server'
import { generateKeyPairSync, createHash } from 'crypto'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const rawDays = searchParams.get('days');
    const rawServer = searchParams.get('server');

    const validityDays = Math.max(1, Math.min(1000, parseInt(rawDays || '600')));
    const validationServer = rawServer?.trim() || 'validity.crashdebug.dev';

    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + validityDays);

    const meta = {
        issue_date: now.toISOString().split('T')[0],
        expire_date: expires.toISOString().split('T')[0],
        validation_server: `https://${validationServer}`,
        assembly_server: 'local',
    };

    const metaString = JSON.stringify(meta);
    const validationHash = createHash('sha256').update(metaString).digest('hex');

    const { publicKey: pub1, privateKey: priv1 } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const { publicKey: pub2, privateKey: priv2 } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const certificate1 = {
        pubKey_peer: pub2,
        privKey_self: priv1,
        meta,
        validate: validationHash,
    };

    const certificate2 = {
        pubKey_peer: pub1,
        privKey_self: priv2,
        meta,
        validate: validationHash,
    };

    return NextResponse.json({
        cert1: JSON.stringify(certificate1, null, 2),
        cert2: JSON.stringify(certificate2, null, 2),
    });
}
