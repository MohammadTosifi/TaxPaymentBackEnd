import jwt, { Secret, VerifyOptions } from 'jsonwebtoken';
import AppError from './appError';

export const NO_JWT_SECRET = 'JWT secret is undefined.';

export const verifyAsync = (token: string, secretOrPublicKey: Secret | undefined, options?: VerifyOptions) =>
  new Promise<jwt.JwtPayload>((resolve, reject) => {
    if (!secretOrPublicKey) {
      reject(new AppError(NO_JWT_SECRET, 401));
      return;
    }

    jwt.verify(token, secretOrPublicKey, options, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as jwt.JwtPayload);
      }
    });
  });
