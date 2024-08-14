import { Request, Response, NextFunction } from 'express';
import { generateDesKey, generateKeyPair, getDesKey, getPublicKey } from '../utils/keyManagement';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

export const createDesKey = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = generateDesKey();
    res.status(201).json({
      status: 'success',
      data: {
        desKey: key,
      },
    });
  } catch (err) {
    return next(new AppError('Failed to generate DES key', 500));
  }
});

export const createRsaKeyPair = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    generateKeyPair();
    res.status(201).json({
      status: 'success',
      message: 'RSA key pair generated successfully',
    });
  } catch (err) {
    return next(new AppError('Failed to generate RSA key pair', 500));
  }
});

export const fetchDesKey = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = getDesKey();
    res.status(200).json({
      status: 'success',
      data: {
        desKey: key,
      },
    });
  } catch (err) {
    return next(new AppError('Failed to fetch DES key', 500));
  }
});

export const fetchRsaPublicKey = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicKey = getPublicKey();
    res.status(200).json({
      status: 'success',
      data: {
        rsaPublicKey: publicKey,
      },
    });
  } catch (err) {
    return next(new AppError('Failed to fetch RSA public key', 500));
  }
});
