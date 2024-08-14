import crypto from 'crypto';

const algorithm = 'des-ede3-cbc';

export const desEncrypt = (text: string, key: string) => {
  const desKey = crypto.createHash('sha256').update(key).digest().slice(0, 24);
  const iv = crypto.randomBytes(8);
  const cipher = crypto.createCipheriv(algorithm, desKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
};

export const desDecrypt = (data: string, key: string) => {
  const desKey = crypto.createHash('sha256').update(key).digest().slice(0, 24);
  const [iv, encryptedText] = data.split(':');
  const decipher = crypto.createDecipheriv(algorithm, desKey, Buffer.from(iv, 'base64'));
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
