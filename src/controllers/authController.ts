import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import User, { IUser } from '../models/userModel';
import { CustomRequest } from '../Middlewares/restrictTo';
import { getPrivateKey } from '../utils/keyManagement';
import mongoose from 'mongoose';

const signToken = (id: string) => {
  if (process.env.JWT_SECRET) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }
};

const encryptWithRSA = (token: string) => {
  const privateKey = getPrivateKey();
  return crypto.privateEncrypt(privateKey, Buffer.from(token)).toString('base64');
};

// const createSendToken = (user: any, statusCode: number, res: Response) => {
//   const token = signToken(user._id);
//   const encryptedToken = encryptWithRSA(token); // Encrypt the token

//   user.password = undefined; // Make sure to never send the password back

//   res.status(statusCode).json({
//     status: 'success',
//     token: encryptedToken, // Send the encrypted token
//     data: {
//       user,
//     },
//   });
// };

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  let token;
  let userId;
  if (user._id instanceof mongoose.Types.ObjectId) {
    userId = user._id.toString();
  } else if (typeof user._id === 'string') {
    userId = user._id;
  }

  if (userId) {
    token = signToken(userId);
  }
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  // 1) Check if username and password exist
  if (!username || !password) {
    return next(new AppError('Please provide username and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ username }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect username or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

export const logout = (req: CustomRequest, res: Response) => {
  // Access the 'Authorization' header
  let authorizationHeader = req.headers.authorization;

  // Check if 'Authorization' header exists
  if (authorizationHeader) {
    authorizationHeader = 'Bearer ';

    return res.status(200).json({ status: 'success', message: 'Logout successfully' });
  }
};
