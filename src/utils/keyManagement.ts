// keyManagement.ts
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const keyDirectory = path.resolve(__dirname, '../keys');
const desKeyPath = path.join(keyDirectory, 'des.key');
const rsaPrivateKeyPath = path.join(keyDirectory, 'rsa_private.pem');
const rsaPublicKeyPath = path.join(keyDirectory, 'rsa_public.pem');

if (!fs.existsSync(keyDirectory)) {
  fs.mkdirSync(keyDirectory);
}

export const generateDesKey = (): string => {
  const key = crypto.randomBytes(8); // DES uses 8-byte keys
  fs.writeFileSync(desKeyPath, key);
  return key.toString('hex');
};

export const getDesKey = (): string => {
  if (!fs.existsSync(desKeyPath)) {
    return generateDesKey();
  }
  return fs.readFileSync(desKeyPath, 'utf8');
};

export const generateKeyPair = (): void => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  fs.writeFileSync(rsaPublicKeyPath, publicKey);
  fs.writeFileSync(rsaPrivateKeyPath, privateKey);
};

export const getPublicKey = (): string => {
  return fs.readFileSync(rsaPublicKeyPath, 'utf8');
};

export const getPrivateKey = (): string => {
  return fs.readFileSync(rsaPrivateKeyPath, 'utf8');
};

export const xor48Hash = (data: Buffer): Buffer => {
  const blockSize = 6; // 48 bits / 8 bits per byte = 6 bytes
  const hash = Buffer.alloc(blockSize);

  for (let i = 0; i < data.length; i += blockSize) {
    for (let j = 0; j < blockSize; j++) {
      hash[j] ^= data[i + j] || 0; // XOR operation
    }
  }

  return hash;
};

export const generateMAC = (data: string, key: string): string => {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(data);
  return hmac.digest('hex');
};

export const verifyMAC = (data: string, key: string, mac: string): boolean => {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(data);
  const calculatedMac = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(calculatedMac, 'hex'));
};

const algorithm = 'des-ede3-cbc';

export const desEncrypt = (text: string, key: string): string => {
  const desKey = crypto.createHash('sha256').update(key).digest().slice(0, 24);
  const iv = crypto.randomBytes(8);
  const cipher = crypto.createCipheriv(algorithm, desKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
};

export const desDecrypt = (data: string, key: string): string => {
  const desKey = crypto.createHash('sha256').update(key).digest().slice(0, 24);
  const [iv, encryptedText] = data.split(':');
  const decipher = crypto.createDecipheriv(algorithm, desKey, Buffer.from(iv, 'base64'));
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
