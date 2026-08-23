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

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const newUser = await this.prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        isEmailVerified: false,
        verificationCode,
        verificationCodeExpiresAt,
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

    // Send email
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
        to: newUser.email,
        subject: 'Mã xác thực tài khoản của bạn',
        html: `
          <h3>Chào ${newUser.fullName},</h3>
          <p>Mã xác thực tài khoản (OTP) của bạn là: <strong>${verificationCode}</strong></p>
          <p>Mã này có hiệu lực trong vòng 15 phút.</p>
        `
      });
      console.log('====================================');
      console.log('OTP CODE (Dành cho Dev):', verificationCode);
      console.log('====================================');
    } catch (error) {
      console.error('Lỗi gửi mail (có thể do chưa cấu hình SMTP):', error);
      console.log('OTP CODE FALLBACK:', verificationCode);
    }

    return {
      message: "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực.",
      requiresVerification: true,
      email: newUser.email,
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

    if (!user.isEmailVerified) {
      return {
        message: "Vui lòng xác thực email của bạn.",
        requiresVerification: true,
        email: user.email,
      };
    }

    // OAuth user không có password
    if (!user.password) {
      return {
        message: "Tài khoản này đăng nhập bằng mạng xã hội (Google/Facebook). Vui lòng dùng nút đăng nhập tương ứng.",
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
        avatarUrl: user.avatarUrl,
        firstLoginCompleted:
          user.profile?.firstLoginCompleted,
      },
    };
  }

  async googleLogin(idToken: string) {
    // Verify Google idToken qua Google tokeninfo API
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    );

    if (!googleRes.ok) {
      return { message: "Google token không hợp lệ" };
    }

    const googleData = await googleRes.json();

    // Kiểm tra client_id khớp (bảo mật)
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && googleData.aud !== clientId) {
      return { message: "Google token không hợp lệ" };
    }

    const { sub: googleId, email, name, picture } = googleData;

    if (!email) {
      return { message: "Không lấy được email từ Google" };
    }

    // Tìm user theo googleId hoặc email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email },
        ],
      },
      include: { profile: true },
    });

    if (user) {
      // Liên kết googleId nếu user đăng ký email trước đó
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatarUrl: picture || user.avatarUrl,
          },
          include: { profile: true },
        });
      }
    } else {
      // Tạo user mới từ Google
      user = await this.prisma.user.create({
        data: {
          fullName: name || email.split("@")[0],
          email,
          googleId,
          avatarUrl: picture,
          isEmailVerified: true,
          // password để null - OAuth user
          profile: {
            create: {
              firstLoginCompleted: false,
            },
          },
        },
        include: { profile: true },
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        firstLoginCompleted: user.profile?.firstLoginCompleted,
      },
    };
  }

  async facebookLogin(accessToken: string) {
    const fbRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );

    if (!fbRes.ok) {
      return { message: "Facebook token không hợp lệ" };
    }

    const fbData = await fbRes.json();
    const { id: facebookId, name, email: fbEmail, picture } = fbData;
    
    // Facebook có thể không trả về email nếu user đăng ký bằng sđt
    const email = fbEmail || `fb_${facebookId}@facebook-placeholder.com`;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { facebookId },
          { email },
        ],
      },
      include: { profile: true },
    });

    const avatarUrl = picture?.data?.url || null;

    if (user) {
      if (!user.facebookId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            facebookId,
            avatarUrl: avatarUrl || user.avatarUrl,
          },
          include: { profile: true },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          fullName: name || "Người dùng Facebook",
          email,
          facebookId,
          avatarUrl,
          isEmailVerified: true,
          profile: {
            create: {
              firstLoginCompleted: false,
            },
          },
        },
        include: { profile: true },
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtToken = this.jwtService.sign(payload);

    return {
      accessToken: jwtToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        firstLoginCompleted: user.profile?.firstLoginCompleted,
      },
    };
  }


  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Luôn trả về cùng một thông báo để tránh lộ lọt email
      return { message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.", success: true };
    }

    // OAuth user không có password
    if (!user.password) {
      return { message: "Tài khoản này đăng nhập bằng mạng xã hội, không cần đặt lại mật khẩu.", success: false };
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

    if (!user.password) {
      return { message: "Tài khoản mạng xã hội không thể đặt lại mật khẩu", success: false };
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

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return { message: "Không tìm thấy tài khoản", success: false };
    }

    if (user.isEmailVerified) {
      return { message: "Email đã được xác thực trước đó", success: false };
    }

    if (user.verificationCode !== code) {
      return { message: "Mã xác thực không hợp lệ", success: false };
    }

    if (!user.verificationCodeExpiresAt || user.verificationCodeExpiresAt < new Date()) {
      return { message: "Mã xác thực đã hết hạn", success: false };
    }

    // Xác thực thành công
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        firstLoginCompleted: user.profile?.firstLoginCompleted,
      },
    };
  }

  async resendVerificationCode(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: "Không tìm thấy tài khoản", success: false };
    }

    if (user.isEmailVerified) {
      return { message: "Email đã được xác thực trước đó", success: false };
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpiresAt,
      },
    });

    // Send email
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
        subject: 'Mã xác thực tài khoản của bạn (Gửi lại)',
        html: `
          <h3>Chào ${user.fullName},</h3>
          <p>Mã xác thực tài khoản (OTP) mới của bạn là: <strong>${verificationCode}</strong></p>
          <p>Mã này có hiệu lực trong vòng 15 phút.</p>
        `
      });
      console.log('====================================');
      console.log('OTP CODE RESEND (Dành cho Dev):', verificationCode);
      console.log('====================================');
    } catch (error) {
      console.error('Lỗi gửi mail (có thể do chưa cấu hình SMTP):', error);
      console.log('OTP CODE FALLBACK:', verificationCode);
    }

    return { success: true, message: "Đã gửi lại mã xác thực thành công." };
  }
}