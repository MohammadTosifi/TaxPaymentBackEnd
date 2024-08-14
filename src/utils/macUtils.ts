import crypto from 'crypto';

export const generateMAC = (data: string, key: string) => {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(data);
  return hmac.digest('hex');
};

export const verifyMAC = (data: string, key: string, mac: string) => {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(data);
  const calculatedMac = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(calculatedMac, 'hex'));
};
