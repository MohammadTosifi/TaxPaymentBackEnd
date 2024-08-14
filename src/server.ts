//General Imports
import mongoose, { ConnectOptions } from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '..', 'config.env');

dotenv.config({ path: envPath });

import app from './app';
//DB Settings
let DB: string = '';
const databaseConfig: ConnectOptions = {};

if (process.env.DATABASE && process.env.DATABASE_PASSWORD) {
  DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
}
mongoose
  .connect(DB, databaseConfig)
  .then(() => console.log('DB connection successful!'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App running on port ${port}`));
