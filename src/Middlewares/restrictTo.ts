import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import { IUser } from '../models/userModel';

export interface CustomRequest extends Request {
  requestTime?: string;
  user?: IUser;
  passwordCurrent?: string;
  params: any;
}

export const ACCESS_DENIED = 'You do not have permission to perform this action';

const restrictTo = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    if (!roles.includes(user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

export default restrictTo;
