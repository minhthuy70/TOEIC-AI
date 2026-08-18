import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import * as nodemailer from "nodemailer";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    fullName: string,
    email: string,
    password: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return {
        message: "Email đã tồn tại",
      };
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    const newUser = await this.prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,

        profile: {
          create: {
            firstLoginCompleted: false,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      firstLoginCompleted:
        newUser.profile?.firstLoginCompleted,
    };
  }

  async login(
    email: string,
    password: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email },

      include: {
        profile: true,
      },
    });

    if (!user) {
      return {
        message: "Không tìm thấy tài khoản",
      };
    }

    const match = await bcrypt.compare(
      password,
      user.password,
    );

    if (!match) {
      return {
        message: "Sai mật khẩu",
      };
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken =
      this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        firstLoginCompleted:
          user.profile?.firstLoginCompleted,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Luôn trả về cùng một thông báo để tránh lộ lọt email
      return { message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.", success: true };
    }

    const secret = "BELLA_SECRET_KEY" + user.password;
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, { secret, expiresIn: '15m' });

    const resetLink = `http://localhost:3000/reset-password?token=${token}&email=${user.email}`;

    // Cấu hình nodemailer để gửi email thật (mặc định dùng Gmail)
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: '"Bella AI Support" <support@bella-ai.com>',
        to: user.email,
        subject: 'Đặt lại mật khẩu của bạn',
        html: `
          <h3>Chào ${user.fullName},</h3>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link dưới đây để tiến hành:</p>
          <a href="${resetLink}" style="padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Đặt lại mật khẩu</a>
          <p style="margin-top: 20px; color: #666;">Link này có hiệu lực trong vòng 15 phút.</p>
          <p style="color: #666;">Nếu bạn không yêu cầu đặt lại mật khẩu, xin hãy bỏ qua email này.</p>
        `
      });
      console.log('====================================');
      console.log('RESET LINK (Dành cho Dev):', resetLink);
      console.log('====================================');
    } catch (error) {
      console.error('Lỗi gửi mail (có thể do chưa cấu hình SMTP):', error);
      console.log('RESET LINK FALLBACK:', resetLink);
    }

    return { message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.", success: true };
  }

  async resetPassword(token: string, email: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: "Token không hợp lệ hoặc đã hết hạn", success: false };
    }

    const secret = "BELLA_SECRET_KEY" + user.password;
    try {
      this.jwtService.verify(token, { secret });
    } catch (e) {
      return { message: "Token không hợp lệ hoặc đã hết hạn", success: false };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    return { message: "Đặt lại mật khẩu thành công", success: true };
  }
}