import { generateDesKey, generateKeyPair } from './keyManagement';

const main = () => {
  generateDesKey();
  generateKeyPair();
  console.log('Keys generated successfully.');
};

main();
