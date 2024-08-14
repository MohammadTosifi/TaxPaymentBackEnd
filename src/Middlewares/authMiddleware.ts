import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { getPublicKey } from '../utils/rsaUtils';
import crypto from 'crypto';
import User, { IUser } from '../models/userModel';
import { CustomRequest } from './restrictTo';
import { verifyAsync } from '../utils/verifyAsync';

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

const decryptWithRSA = (encryptedToken: string) => {
  const publicKey = getPublicKey();
  const decryptedToken = crypto.publicDecrypt(publicKey, Buffer.from(encryptedToken, 'base64')).toString('utf8');
  return decryptedToken;
};

// export const protect = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
//   // 1) Getting token and check if it's there
//   let token;
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   if (!token) {
//     return next(new AppError('You are not logged in! Please log in to get access.', 401));
//   }

//   // 2) Decrypt token
//   let decryptedToken;
//   try {
//     decryptedToken = decryptWithRSA(token);
//   } catch (err) {
//     return next(new AppError('Invalid token', 401));
//   }

//   // 3) Verification token
//   let decoded;
//   try {
//     decoded = jwt.verify(decryptedToken, process.env.JWT_SECRET!) as DecodedToken;
//   } catch (err) {
//     return next(new AppError('Token verification failed', 401));
//   }

//   // 4) Check if user still exists
//   const currentUser: IUser | null = await User.findById(decoded.id);
//   if (!currentUser) {
//     return next(new AppError('The user belonging to this token does no longer exist.', 401));
//   }

//   // GRANT ACCESS TO PROTECTED ROUTE
//   req.user = currentUser;
//   next();
// });

export const protect = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  const decoded = await verifyAsync(token, process.env.JWT_SECRET);

  // 4) Check if user still exists
  const currentUser: IUser | null = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
