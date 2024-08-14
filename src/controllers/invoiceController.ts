// invoiceController.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { getPrivateKey, getPublicKey, xor48Hash, desDecrypt, desEncrypt, generateMAC, verifyMAC, getDesKey } from '../utils/keyManagement';
import Invoice from '../models/invoiceModel';
import User from '../models/userModel';
import { CustomRequest } from '../Middlewares/restrictTo';

// invoiceController.ts
// invoiceController.ts
export const createInvoice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, amount } = req.body;

  // Generate a new DES key for this invoice
  const desKey = getDesKey(); // Securely generated and stored
  const invoiceData = { userId, amount, status: 'Unpaid' };
  const encryptedData = desEncrypt(JSON.stringify(invoiceData), desKey);
  const mac = generateMAC(encryptedData, desKey);

  // Generate the XOR-based 48-bit hash
  const xorHash = xor48Hash(Buffer.from(encryptedData));

  // Sign the XOR-based 48-bit hash
  const privateKey = getPrivateKey();
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(xorHash);
  signer.end();
  const signature = signer.sign(privateKey, 'base64');

  // Get the current RSA public key
  const rsaPublicKey = getPublicKey();

  // Create and save the invoice
  const invoice = await Invoice.create({
    userId,
    amount,
    status: 'Unpaid',
    encryptedData,
    mac,
    signature,
    desKey, // Store the DES key used for this invoice
    rsaPublicKey, // Store the RSA public key used for this invoice
  });

  res.status(201).json({
    status: 'success',
    data: {
      invoice,
    },
  });
});

export const getAllInvoices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const invoices = await Invoice.find();

  const decryptedInvoices = await Promise.all(
    invoices.map(async (invoice) => {
      // Use the DES key stored with the invoice
      const desKey = invoice.desKey;

      // Verify the MAC
      const macValid = verifyMAC(invoice.encryptedData, desKey, invoice.mac);
      if (!macValid) {
        console.error('MAC verification failed for invoice ID:', invoice._id);
        throw new AppError('Invalid MAC for the invoice data', 400);
      }

      // Use the RSA public key stored with the invoice
      const rsaPublicKey = invoice.rsaPublicKey;

      // Verify the signature
      const xorHash = xor48Hash(Buffer.from(invoice.encryptedData));
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(xorHash);
      verifier.end();
      const isVerified = verifier.verify(rsaPublicKey, invoice.signature, 'base64');

      if (!isVerified) {
        console.error('Signature verification failed for invoice ID:', invoice._id);
        throw new AppError('Invalid signature for the invoice data', 400);
      }

      // Decrypt the invoice data
      const decryptedData = desDecrypt(invoice.encryptedData, desKey);
      const invoiceData = JSON.parse(decryptedData);

      // Get the user data
      const user = await User.findById(invoiceData.userId).select('-password');

      return {
        _id: invoice._id,
        status: invoiceData.status,
        amount: invoiceData.amount,
        username: user?.username,
      };
    }),
  );

  res.status(200).json({
    status: 'success',
    data: {
      invoices: decryptedInvoices,
    },
  });
});

export const getUserInvoices = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;

  const invoices = await Invoice.find({ userId });

  const decryptedInvoices = await Promise.all(
    invoices.map(async (invoice) => {
      // Use the DES key stored with the invoice
      const desKey = invoice.desKey;

      // Verify the MAC
      const macValid = verifyMAC(invoice.encryptedData, desKey, invoice.mac);
      if (!macValid) {
        console.error('MAC verification failed for invoice ID:', invoice._id);
        throw new AppError('Invalid MAC for the invoice data', 400);
      }

      // Use the RSA public key stored with the invoice
      const rsaPublicKey = invoice.rsaPublicKey;

      // Verify the signature
      const xorHash = xor48Hash(Buffer.from(invoice.encryptedData));
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(xorHash);
      verifier.end();
      const isVerified = verifier.verify(rsaPublicKey, invoice.signature, 'base64');

      if (!isVerified) {
        console.error('Signature verification failed for invoice ID:', invoice._id);
        throw new AppError('Invalid signature for the invoice data', 400);
      }

      // Decrypt the invoice data
      const decryptedData = desDecrypt(invoice.encryptedData, desKey);
      const invoiceData = JSON.parse(decryptedData);

      return {
        _id: invoice._id,
        amount: invoiceData.amount,
        status: invoiceData.status,
      };
    }),
  );

  res.status(200).json({
    status: 'success',
    data: {
      invoices: decryptedInvoices,
    },
  });
});

export const getInvoice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { invoiceId } = req.params;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    return next(new AppError('No invoice found with that ID', 404));
  }

  // Use the DES key stored with the invoice
  const desKey = invoice.desKey;

  // Verify the MAC
  const macValid = verifyMAC(invoice.encryptedData, desKey, invoice.mac);
  if (!macValid) {
    return next(new AppError('Invalid MAC for the invoice data', 400));
  }

  // Use the RSA public key stored with the invoice
  const rsaPublicKey = invoice.rsaPublicKey;

  // Verify the signature
  const xorHash = xor48Hash(Buffer.from(invoice.encryptedData));
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(xorHash);
  verifier.end();
  const isVerified = verifier.verify(rsaPublicKey, invoice.signature, 'base64');

  if (!isVerified) {
    return next(new AppError('Invalid signature for the invoice data', 400));
  }

  // Decrypt the invoice data
  const decryptedData = desDecrypt(invoice.encryptedData, desKey);
  const parsedData = JSON.parse(decryptedData);

  // Fetch the user information
  const user = await User.findById(parsedData.userId);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      invoice: {
        username: user.username,
        amount: parsedData.amount,
        status: parsedData.status,
      },
    },
  });
});

export const updateInvoice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { invoiceId } = req.params;
  const { amount, status } = req.body;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    return next(new AppError('No invoice found with that ID', 404));
  }

  // Use the DES key stored with the invoice
  const desKey = invoice.desKey;

  // Verify the MAC
  const macValid = verifyMAC(invoice.encryptedData, desKey, invoice.mac);
  if (!macValid) {
    return next(new AppError('Invalid MAC for the invoice data', 400));
  }

  // Use the RSA public key stored with the invoice
  const rsaPublicKey = invoice.rsaPublicKey;

  // Verify the signature
  const xorHash = xor48Hash(Buffer.from(invoice.encryptedData));
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(xorHash);
  verifier.end();
  const isVerified = verifier.verify(rsaPublicKey, invoice.signature, 'base64');

  if (!isVerified) {
    return next(new AppError('Invalid signature for the invoice data', 400));
  }

  // Decrypt the invoice data
  const decryptedData = JSON.parse(desDecrypt(invoice.encryptedData, desKey));

  // Update the invoice data
  if (amount !== undefined) decryptedData.amount = amount;
  if (status !== undefined) decryptedData.status = status;

  // Encrypt the updated invoice data
  const updatedEncryptedData = desEncrypt(JSON.stringify(decryptedData), desKey);
  const updatedMac = generateMAC(updatedEncryptedData, desKey);

  // Sign the updated encrypted invoice data
  const privateKey = getPrivateKey();
  const updatedXorHash = xor48Hash(Buffer.from(updatedEncryptedData));
  const updatedSigner = crypto.createSign('RSA-SHA256');
  updatedSigner.update(updatedXorHash);
  updatedSigner.end();
  const updatedSignature = updatedSigner.sign(privateKey, 'base64');

  // Save the updated invoice
  invoice.amount = decryptedData.amount;
  invoice.status = decryptedData.status;
  invoice.encryptedData = updatedEncryptedData;
  invoice.mac = updatedMac;
  invoice.signature = updatedSignature;

  await invoice.save();

  res.status(200).json({
    status: 'success',
    data: {
      invoice,
    },
  });
});

export const payInvoice = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { invoiceId } = req.params;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    return next(new AppError('No invoice found with that ID', 404));
  }

  // Use the DES key stored with the invoice
  const desKey = invoice.desKey;

  // Decrypt the invoice data to check the userId
  const decryptedData = JSON.parse(desDecrypt(invoice.encryptedData, desKey));

  // Ensure the logged-in user is the same as the user associated with the invoice
  if (req.user?._id.toString() !== decryptedData.userId.toString()) {
    return next(new AppError('You do not have permission to pay this invoice', 403));
  }

  if (invoice.status === 'Paid') {
    return next(new AppError('The invoice is already paid', 400));
  }

  // Verify the MAC
  const macValid = verifyMAC(invoice.encryptedData, desKey, invoice.mac);
  if (!macValid) {
    return next(new AppError('Invalid MAC for the invoice data', 400));
  }

  // Use the RSA public key stored with the invoice
  const rsaPublicKey = invoice.rsaPublicKey;

  // Verify the signature
  const xorHash = xor48Hash(Buffer.from(invoice.encryptedData));
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(xorHash);
  verifier.end();
  const isVerified = verifier.verify(rsaPublicKey, invoice.signature, 'base64');

  if (!isVerified) {
    return next(new AppError('Invalid signature for the invoice data', 400));
  }

  // Update the invoice status to "Paid"
  decryptedData.status = 'Paid';

  // Encrypt the updated invoice data
  const updatedEncryptedData = desEncrypt(JSON.stringify(decryptedData), desKey);
  const updatedMac = generateMAC(updatedEncryptedData, desKey);

  // Sign the updated encrypted invoice data
  const privateKey = getPrivateKey();
  const updatedXorHash = xor48Hash(Buffer.from(updatedEncryptedData));
  const updatedSigner = crypto.createSign('RSA-SHA256');
  updatedSigner.update(updatedXorHash);
  updatedSigner.end();
  const updatedSignature = updatedSigner.sign(privateKey, 'base64');

  // Save the updated invoice
  invoice.status = 'Paid';
  invoice.encryptedData = updatedEncryptedData;
  invoice.mac = updatedMac;
  invoice.signature = updatedSignature;

  await invoice.save();

  res.status(200).json({
    status: 'success',
    data: {
      invoice,
    },
  });
});

// export const payInvoice = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
//   const { invoiceId } = req.params;

//   const invoice = await Invoice.findById(invoiceId);
//   if (!invoice) {
//     return next(new AppError('No invoice found with that ID', 404));
//   }

//   // Use the DES key stored with the invoice
//   const desKey = invoice.desKey;

//   // Decrypt the invoice data to check the userId
//   const decryptedData = JSON.parse(desDecrypt(invoice.encryptedData, desKey));

//   // Ensure the logged-in user is the same as the user associated with the invoice
//   if (req.user?._id.toString() !== decryptedData.userId.toString()) {
//     return next(new AppError('You do not have permission to pay this invoice', 403));
//   }

//   if (invoice.status === 'Paid') {
//     return next(new AppError('The invoice is already paid', 400));
//   }

//   // Verify the MAC
//   const macValid = verifyMAC(invoice.encryptedData, desKey, invoice.mac);
//   if (!macValid) {
//     return next(new AppError('Invalid MAC for the invoice data', 400));
//   }

//   // Verify the signature
//   const publicKey = getPublicKey();
//   const xorHash = xor48Hash(Buffer.from(invoice.encryptedData));
//   const verifier = crypto.createVerify('RSA-SHA256');
//   verifier.update(xorHash);
//   verifier.end();
//   const isVerified = verifier.verify(publicKey, invoice.signature, 'base64');

//   if (!isVerified) {
//     return next(new AppError('Invalid signature for the invoice data', 400));
//   }

//   // Update the invoice status to "Paid"
//   decryptedData.status = 'Paid';

//   // Encrypt the updated invoice data
//   const updatedEncryptedData = desEncrypt(JSON.stringify(decryptedData), desKey);
//   const updatedMac = generateMAC(updatedEncryptedData, desKey);

//   // Sign the updated encrypted invoice data
//   const privateKey = getPrivateKey();
//   const updatedXorHash = xor48Hash(Buffer.from(updatedEncryptedData));
//   const updatedSigner = crypto.createSign('RSA-SHA256');
//   updatedSigner.update(updatedXorHash);
//   updatedSigner.end();
//   const updatedSignature = updatedSigner.sign(privateKey, 'base64');

//   // Save the updated invoice
//   invoice.status = 'Paid';
//   invoice.encryptedData = updatedEncryptedData;
//   invoice.mac = updatedMac;
//   invoice.signature = updatedSignature;

//   await invoice.save();

//   res.status(200).json({
//     status: 'success',
//     data: {
//       invoice,
//     },
//   });
// });
