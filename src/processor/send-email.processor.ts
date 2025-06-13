import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AuthService } from 'src/auth/auth.service';

@Processor('send-email')
export class SendEmailProcessor {
  constructor(private readonly authService: AuthService) {}

  private readonly logger = new Logger();

  @Process('email-verification')
  async handleEmailVerification(job: Job) {
    const { email, password } = job.data;
    await this.authService.sendEmailVerification(email, password);

    return { message: 'Email sent!' };
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueError()
  onError(error: Error) {
    this.logger.error(`Processing queue error. Error: ${error.message}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Job with id ${job.id} completed`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job failed: ${job.id}-${job.name}`, error);
  }
}
