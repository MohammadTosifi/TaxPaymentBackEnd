// invoiceModel.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IInvoice extends Document {
  userId: string;
  amount: number;
  status: string;
  encryptedData: string;
  mac: string;
  signature: string;
  desKey: string;
  rsaPublicKey: string;
}

const invoiceSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'Unpaid',
  },
  encryptedData: {
    type: String,
    required: true,
  },
  mac: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    required: true,
  },
  desKey: {
    type: String,
    required: true,
  },
  rsaPublicKey: {
    type: String,
    required: true,
  },
});

const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

export default Invoice;
