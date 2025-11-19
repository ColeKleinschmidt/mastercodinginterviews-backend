import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return secret;
};

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

export const signToken = (payload: object, options?: SignOptions): string => {
  return jwt.sign(payload, getSecret(), options);
};

export const verifyToken = <T extends JwtPayload = JwtPayload>(token: string): T => {
  const decoded = jwt.verify(token, getSecret());

  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }

  return decoded as T;
};
