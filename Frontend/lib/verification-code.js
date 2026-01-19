import crypto from 'crypto';

export default function generateSecureOTP() {
    const length = 6;
    const max = Math.pow(10, length);
    return crypto.randomInt(0, max).toString().padStart(length, '0');
}