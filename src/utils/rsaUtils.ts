import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const keyDirectory = path.resolve(__dirname, '../keys');
const rsaPrivateKeyPath = path.join(keyDirectory, 'rsa_private.pem');
const rsaPublicKeyPath = path.join(keyDirectory, 'rsa_public.pem');

if (!fs.existsSync(keyDirectory)) {
  fs.mkdirSync(keyDirectory);
}

export const generateKeyPair = () => {
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

export const getPublicKey = () => {
  return fs.readFileSync(rsaPublicKeyPath, 'utf8');
};

export const getPrivateKey = () => {
  return fs.readFileSync(rsaPrivateKeyPath, 'utf8');
};

export const xor48Hash = (data: any) => {
  const buffer = Buffer.from(data);
  const blockSize = 6; // 48 bits / 8 bits per byte = 6 bytes
  const hash = Buffer.alloc(blockSize);

  for (let i = 0; i < buffer.length; i += blockSize) {
    for (let j = 0; j < blockSize; j++) {
      hash[j] ^= buffer[i + j] || 0; // XOR operation
    }
  }

  return hash;
};
