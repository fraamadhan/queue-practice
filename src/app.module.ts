import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development'],
      cache: true,
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const redisConfig = config.get<string>('REDIS_URL');
        const redisUrl = redisConfig ? new URL(redisConfig) : '';
        console.log(redisUrl);
        return {
          redis: {
            host: redisUrl
              ? redisUrl.hostname
              : config.get<string>('REDIS_HOST'),
            password: redisUrl
              ? redisUrl.password
              : config.get<string>('REDIS_PASSWORD'),
            port: redisUrl
              ? +redisUrl.port
              : Number(config.get<string>('REDIS_PORT')),
          },
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: Number(process.env.MAIL_PORT),
          secure: process.env.MAIL_SECURE === 'true',
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
