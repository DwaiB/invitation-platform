import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema.js';

export interface SupabaseIdentity {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async findOrCreate(identity: SupabaseIdentity): Promise<UserDocument> {
    if (!identity.email) {
      throw new Error('Authenticated Supabase user has no email address');
    }

    return this.userModel.findOneAndUpdate(
      { supabaseUserId: identity.id },
      {
        $set: {
          email: identity.email,
          ...(identity.name ? { name: identity.name } : {}),
          ...(identity.avatarUrl ? { avatarUrl: identity.avatarUrl } : {}),
        },
        $setOnInsert: { supabaseUserId: identity.id },
      },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
    ).exec();
  }
}
