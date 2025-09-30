import 'express';

declare module 'express' {
  interface Request {
    user?: {
      sub: number;
      username: string;
      email: string;
      role: string;
    };
  }
}
