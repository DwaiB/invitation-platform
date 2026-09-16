import type { Request } from 'express';
import type { UserDocument } from '../users/schemas/user.schema.js';

export interface AuthenticatedRequest extends Request {
  user: UserDocument;
}
