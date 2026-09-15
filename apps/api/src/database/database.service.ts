import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {
    this.connection.on('connected', () => {
      this.logger.log('Successfully connected to MongoDB');
    });

    this.connection.on('error', (err: Error) => {
      this.logger.error(`MongoDB connection error: ${err.message}`);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });
  }

  getHealthStatus(): 'ok' | 'connecting' | 'disconnected' | 'error' {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    switch (this.connection.readyState) {
      case 1:
        return 'ok';
      case 2:
        return 'connecting';
      case 0:
      case 3:
      default:
        return 'disconnected';
    }
  }
}
