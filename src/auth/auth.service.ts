import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RegisterDto } from './dto/create-auth.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { MailTemplate } from 'src/utils/mail-template';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService implements OnModuleDestroy {
  constructor(
    @InjectQueue('send-email') private sendEmailQueue: Queue,
    private mailerService: MailerService,
  ) {}
  async onModuleDestroy() {
    if (this.sendEmailQueue) {
      await this.sendEmailQueue.close();
    }
  }

  async signUp(body: RegisterDto) {
    await this.sendEmailQueue.add(
      'email-verification',
      { email: body.email, password: body.password },
      { attempts: 7, delay: 3000 },
    );

    return { message: 'Email sent', success: true };
  }

  async sendEmailVerification(email: string, token: string) {
    const url = `${process.env.FE_URL}/auth/verify-email/${token}`;
    const subject = 'Email Verification';
    const templateBody = MailTemplate(url);

    await this.mailerService.sendMail({
      to: email,
      from: 'Addo Salon <raeljarr@gmail.com>',
      subject,
      html: templateBody,
    });
  }
}
