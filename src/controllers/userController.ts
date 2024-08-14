import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { CustomRequest } from '../Middlewares/restrictTo';

export const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { username, role } = req.body;

  if (!username || !role) {
    return next(new AppError('Please provide a username and role', 400));
  }

  const defaultPassword = '12345678';
  const newUser = await User.create({ username, role, password: defaultPassword });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

export const getAllUsersForStaff = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const users = await User.find();

  const userRoles = users.filter((user) => user.role === 'User');
  res.status(200).json({
    status: 'success',
    data: {
      users: userRoles,
    },
  });
});

export const updateUser = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
