import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { env } from 'src/utils/env-validator';
import { generatePasswordResetTemplate } from './templates/password-reset.template';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: true,
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASSWORD,
    },
  });

  async sendPasswordResetEmail(username: string, resetToken: string) {
    const { subject, html } = generatePasswordResetTemplate(
      username,
      resetToken,
    );

    await this.transporter.sendMail({
      from: `Noreply <${env.MAIL_USER}>`,
      to: username,
      subject,
      html,
    });
  }

  async sendMail(to: string, from: string, html: string) {
    const info = await this.transporter.sendMail({
      from,
      to,
      subject: 'Hello ✔',
      html,
    });

    return info;
  }
}
