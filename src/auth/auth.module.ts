import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BullModule } from '@nestjs/bull';
import { SendEmailProcessor } from 'src/processor/send-email.processor';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'send-email',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SendEmailProcessor],
})
export class AuthModule {}
