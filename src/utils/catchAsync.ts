import { Request, Response, NextFunction } from 'express';

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    (fn(req, res, next) as Promise<Function>).catch(next);
  };
};

export default catchAsync;
