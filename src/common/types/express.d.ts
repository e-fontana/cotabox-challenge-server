import 'express-serve-static-core';
import { TUser } from 'src/common/decorators/user.decorator';

declare global {
  namespace Express {
    interface Request {
      user?: TUser;
    }
  }
}
