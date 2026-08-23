import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import * as nodemailer from "nodemailer";

// Login attempt tracking (in-memory)
const loginAttempts = new Map<string, { count: number; lockedUntil: number; lockCount: number }>();
const MAX_ATTEMPTS = 5;
const BASE_LOCK_TIME = 15 * 60 * 1000; // 15 minutes base
const PERMANENT_LOCK_THRESHOLD = 5; // Number of temporary locks before permanent lock

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private calculateLockTime(lockCount: number): number {
    // Progressive lock times:
    // Lock 1: 15 minutes
    // Lock 2: 30 minutes
    // Lock 3: 1 hour
    // Lock 4: 2 hours
    // Lock 5+: 4 hours (max)
    const lockTimes = [
      BASE_LOCK_TIME,                    // 15 minutes
      BASE_LOCK_TIME * 2,                 // 30 minutes
      BASE_LOCK_TIME * 4,                 // 1 hour
      BASE_LOCK_TIME * 8,                 // 2 hours
      BASE_LOCK_TIME * 16,                // 4 hours (max)
    ];

    const index = Math.min(lockCount, lockTimes.length - 1);
    return lockTimes[index];
  }

  private async checkLoginAttempts(email: string): Promise<{ allowed: boolean; remainingAttempts?: number; lockedUntil?: Date; lockCount?: number; isPermanentlyLocked?: boolean }> {
    // Check database for permanent lock first
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { isPermanentlyLocked: true, isLocked: true, lockedUntil: true }
    });

    if (user?.isPermanentlyLocked) {
      return {
        allowed: false,
        isPermanentlyLocked: true,
      };
    }

    // Check database for temporary lock
    if (user?.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
      return {
        allowed: false,
        lockedUntil: user.lockedUntil,
      };
    }

    // Check in-memory attempts
    const attempts = loginAttempts.get(email);

    if (!attempts) {
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockCount: 0 };
    }

    // Check if account is locked
    if (attempts.lockedUntil > Date.now()) {
      return {
        allowed: false,
        lockedUntil: new Date(attempts.lockedUntil),
        lockCount: attempts.lockCount,
      };
    }

    // Reset count if lock time has passed but keep lockCount for progressive locking
    if (attempts.lockedUntil > 0 && attempts.lockedUntil <= Date.now()) {
      attempts.count = 0;
      attempts.lockedUntil = 0;
      loginAttempts.set(email, attempts);
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockCount: attempts.lockCount };
    }

    const remainingAttempts = MAX_ATTEMPTS - attempts.count;
    return { allowed: true, remainingAttempts, lockCount: attempts.lockCount };
  }

  private async recordFailedAttempt(email: string): Promise<void> {
    const attempts = loginAttempts.get(email) || { count: 0, lockedUntil: 0, lockCount: 0 };
    attempts.count++;

    // Lock account after max attempts
    if (attempts.count >= MAX_ATTEMPTS) {
      attempts.lockCount = (attempts.lockCount || 0) + 1;

      // Check if this should be a permanent lock
      if (attempts.lockCount >= PERMANENT_LOCK_THRESHOLD) {
        await this.setPermanentLock(email);
      } else {
        attempts.lockedUntil = Date.now() + this.calculateLockTime(attempts.lockCount);
        await this.setTemporaryLock(email, attempts.lockedUntil, attempts.lockCount);
        await this.sendLockNotification(email, attempts.lockCount, attempts.lockedUntil);
      }
    }

    loginAttempts.set(email, attempts);
  }

  private async setTemporaryLock(email: string, lockedUntil: number, lockCount: number): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { email },
        data: {
          isLocked: true,
          lockedUntil: new Date(lockedUntil),
        },
      });
    } catch (error) {
      console.error('Error setting temporary lock:', error);
    }
  }

  private async setPermanentLock(email: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { email },
        data: {
          isLocked: true,
          isPermanentlyLocked: true,
          lockedUntil: null,
        },
      });
      await this.sendPermanentLockNotification(email);
    } catch (error) {
      console.error('Error setting permanent lock:', error);
    }
  }

  private async sendLockNotification(email: string, lockCount: number, lockedUntil: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const lockTimeMinutes = Math.ceil((lockedUntil - Date.now()) / 60000);
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: '"Bella AI Security" <security@bella-ai.com>',
        to: user.email,
        subject: `Cảnh báo bảo mật: Tài khoản của bạn đã bị khóa lần thứ ${lockCount}`,
        html: `
          <h3>Chào ${user.fullName},</h3>
          <p>Tài khoản của bạn vừa bị khóa tạm thời do nhiều lần đăng nhập thất bại.</p>
          <p><strong>Chi tiết:</strong></p>
          <ul>
            <li>Lần khóa thứ: ${lockCount}</li>
            <li>Thời gian khóa: ${lockTimeMinutes} phút</li>
            <li>Số lần thử tối đa: ${MAX_ATTEMPTS}</li>
          </ul>
          <p>Tài khoản sẽ tự động mở khóa sau thời gian trên.</p>
          <p style="color: #dc2626; font-weight: bold;">Lưu ý: Nếu bạn không thực hiện các lần đăng nhập này, tài khoản của bạn có thể đang bị tấn công. Vui lòng đổi mật khẩu ngay khi có thể.</p>
          <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ: support@bella-ai.com</p>
        `
      });
      console.log('Lock notification sent to:', email);
    } catch (error) {
      console.error('Error sending lock notification:', error);
    }
  }

  private async sendPermanentLockNotification(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: '"Bella AI Security" <security@bella-ai.com>',
        to: user.email,
        subject: 'BẢO MẬT QUAN TRỌNG: Tài khoản của bạn đã bị khóa vĩnh viễn',
        html: `
          <h3 style="color: #dc2626;">CẢNH BÁO BẢO MẬT QUAN TRỌNG</h3>
          <p>Tài khoản của bạn đã bị khóa vĩnh viễn do hoạt động đăng nhập bất thường liên tục.</p>
          <p><strong>Chi tiết:</strong></p>
          <ul>
            <li>Tổng số lần khóa: ${PERMANENT_LOCK_THRESHOLD} lần</li>
            <li>Trạng thái: Khóa vĩnh viễn</li>
            <li>Thời gian khóa: Không giới hạn</li>
          </ul>
          <p>Để mở khóa tài khoản, bạn cần gửi yêu cầu mở khóa:</p>
          <a href="http://localhost:3000/unlock-request?email=${encodeURIComponent(email)}" style="padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Gửi yêu cầu mở khóa</a>
          <p style="color: #dc2626; font-weight: bold;">Đây là biện pháp bảo vệ để ngăn chặn tấn công brute force vào tài khoản của bạn.</p>
          <p>Nếu bạn cần hỗ trợ khẩn cấp, vui lòng liên hệ: security@bella-ai.com</p>
        `
      });
      console.log('Permanent lock notification sent to:', email);
    } catch (error) {
      console.error('Error sending permanent lock notification:', error);
    }
  }

  private resetLoginAttempts(email: string): void {
    // Keep lockCount for progressive locking but reset current attempts
    const attempts = loginAttempts.get(email);
    if (attempts) {
      attempts.count = 0;
      attempts.lockedUntil = 0;
      loginAttempts.set(email, attempts);
    }
  }

  async requestUnlock(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, message: "Không tìm thấy tài khoản" };
    }

    if (!user.isPermanentlyLocked) {
      return { success: false, message: "Tài khoản không bị khóa vĩnh viễn" };
    }

    if (user.unlockRequestSent) {
      return { success: false, message: "Bạn đã gửi yêu cầu mở khóa. Vui lòng chờ xử lý." };
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        unlockRequestSent: true,
        unlockRequestSentAt: new Date(),
      },
    });

    await this.sendUnlockRequestNotification(email, user.fullName);

    return { success: true, message: "Yêu cầu mở khóa đã được gửi. Chúng tôi sẽ liên hệ với bạn trong vòng 24-48 giờ." };
  }

  private async sendUnlockRequestNotification(email: string, fullName: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      // Send to user
      await transporter.sendMail({
        from: '"Bella AI Support" <support@bella-ai.com>',
        to: email,
        subject: 'Xác nhận yêu cầu mở khóa tài khoản',
        html: `
          <h3>Chào ${fullName},</h3>
          <p>Yêu cầu mở khóa tài khoản của bạn đã được nhận.</p>
          <p><strong>Thông tin yêu cầu:</strong></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Thời gian gửi: ${new Date().toLocaleString('vi-VN')}</li>
            <li>Trạng thái: Đang chờ xử lý</li>
          </ul>
          <p>Đội ngũ hỗ trợ sẽ xem xét yêu cầu của bạn trong vòng 24-48 giờ làm việc.</p>
          <p>Bạn sẽ nhận được email thông báo khi yêu cầu được xử lý.</p>
          <p>Nếu cần hỗ trợ khẩn cấp, vui lòng liên hệ: support@bella-ai.com</p>
        `
      });

      // Send to admin
      await transporter.sendMail({
        from: '"Bella AI Security" <security@bella-ai.com>',
        to: process.env.ADMIN_EMAIL || 'admin@bella-ai.com',
        subject: `Yêu cầu mở khóa tài khoản - ${email}`,
        html: `
          <h3>Yêu cầu mở khóa tài khoản mới</h3>
          <p><strong>Thông tin người dùng:</strong></p>
          <ul>
            <li>Họ tên: ${fullName}</li>
            <li>Email: ${email}</li>
            <li>Thời gian gửi: ${new Date().toLocaleString('vi-VN')}</li>
          </ul>
          <p>Vui lòng đăng nhập vào admin panel để xem và xử lý yêu cầu này.</p>
          <a href="http://localhost:3000/admin/users" style="padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Xem yêu cầu</a>
        `
      });

      console.log('Unlock request notifications sent for:', email);
    } catch (error) {
      console.error('Error sending unlock request notifications:', error);
    }
  }

  async unlockAccount(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, message: "Không tìm thấy tài khoản" };
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        isLocked: false,
        isPermanentlyLocked: false,
        lockedUntil: null,
        unlockRequestSent: false,
        unlockRequestSentAt: null,
      },
    });

    // Reset in-memory attempts
    loginAttempts.delete(email);

    await this.sendUnlockConfirmationNotification(email, user.fullName);

    return { success: true, message: "Tài khoản đã được mở khóa thành công" };
  }

  private async sendUnlockConfirmationNotification(email: string, fullName: string): Promise<void> {
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
        to: email,
        subject: 'Tài khoản của bạn đã được mở khóa',
        html: `
          <h3 style="color: #16a34a;">Tài khoản đã được mở khóa</h3>
          <p>Chào ${fullName},</p>
          <p>Tài khoản của bạn đã được mở khóa thành công.</p>
          <p>Bạn có thể đăng nhập lại ngay bây giờ.</p>
          <a href="http://localhost:3000/login" style="padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Đăng nhập ngay</a>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ ngay: security@bella-ai.com</p>
        `
      });
      console.log('Unlock confirmation sent to:', email);
    } catch (error) {
      console.error('Error sending unlock confirmation:', error);
    }
  }

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
    rememberMe: boolean = false,
    userAgent?: string,
    acceptLanguage?: string,
  ) {
    // Check login attempts
    const attemptCheck = await this.checkLoginAttempts(email);
    if (!attemptCheck.allowed) {
      if (attemptCheck.isPermanentlyLocked) {
        return {
          message: "Tài khoản của bạn đã bị khóa vĩnh viễn do hoạt động bất thường. Vui lòng gửi yêu cầu mở khóa.",
          locked: true,
          isPermanentlyLocked: true,
        };
      }

      const lockTimeMinutes = Math.ceil((attemptCheck.lockedUntil!.getTime() - Date.now()) / 60000);
      const lockCount = attemptCheck.lockCount || 1;
      return {
        message: `Tài khoản đã bị khóa lần thứ ${lockCount} do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${lockTimeMinutes} phút.`,
        locked: true,
        lockedUntil: attemptCheck.lockedUntil,
        lockCount,
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { email },

      include: {
        profile: true,
      },
    });

    if (!user) {
      this.recordFailedAttempt(email);
      const checkResult = await this.checkLoginAttempts(email);
      const remainingAttempts = checkResult.remainingAttempts || 0;
      return {
        message: `Không tìm thấy tài khoản. Số lần thử còn lại: ${remainingAttempts}`,
        remainingAttempts,
      };
    }

    // Check if account is deactivated
    if (!user.isActive) {
      return {
        message: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ để kích hoạt lại.",
        deactivated: true,
      };
    }

    const foundUser = await this.prisma.user.findUnique({
      where: { email },

      include: {
        profile: true,
      },
    });

    if (!foundUser) {
      this.recordFailedAttempt(email);
      const checkResult = await this.checkLoginAttempts(email);
      const remainingAttempts = checkResult.remainingAttempts || 0;
      return {
        message: `Không tìm thấy tài khoản. Số lần thử còn lại: ${remainingAttempts}`,
        remainingAttempts,
      };
    }

    // Check if account is deactivated
    if (!foundUser.isActive) {
      return {
        message: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ để kích hoạt lại.",
        deactivated: true,
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
    if (!foundUser.password) {
      return {
        message: "Tài khoản này đăng nhập bằng mạng xã hội (Google/Facebook). Vui lòng dùng nút đăng nhập tương ứng.",
      };
    }

    const match = await bcrypt.compare(
      password,
      foundUser.password,
    );

    if (!match) {
      this.recordFailedAttempt(email);
      const checkResult = await this.checkLoginAttempts(email);
      const remainingAttempts = checkResult.remainingAttempts || 0;
      return {
        message: remainingAttempts > 0
          ? `Sai mật khẩu. Số lần thử còn lại: ${remainingAttempts}`
          : "Tài khoản đã bị khóa tạm thời do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.",
        remainingAttempts,
      };
    }

    // Reset login attempts on successful login
    this.resetLoginAttempts(email);

    // Update last login time
    await this.prisma.user.update({
      where: { id: foundUser.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
    };

    // Nếu rememberMe = true, token có hiệu lực 30 ngày, ngược lại 1 ngày
    const expiresIn = rememberMe ? '30d' : '1d';
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    // Create session record
    const deviceId = this.generateDeviceId(userAgent || 'unknown', acceptLanguage || 'unknown');
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));

    await this.prisma.userSession.create({
      data: {
        userId: foundUser.id,
        token: accessToken,
        deviceInfo: deviceId,
        userAgent: userAgent || 'unknown',
        ipAddress: 'IP_PLACEHOLDER', // In production, get real IP
        expiresAt,
      },
    });

    return {
      accessToken,
      user: {
        id: foundUser.id,
        fullName: foundUser.fullName,
        email: foundUser.email,
        role: foundUser.role,
        avatarUrl: foundUser.avatarUrl,
        firstLoginCompleted:
          foundUser.profile?.firstLoginCompleted,
      },
    };
  }

  async googleLogin(idToken: string, rememberMe: boolean = false, userAgentParam?: string, acceptLanguageParam?: string) {
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
      // Check if account is deactivated
      if (!user.isActive) {
        return {
          message: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ để kích hoạt lại.",
          deactivated: true,
        };
      }

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

    // Update last login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Nếu rememberMe = true, token có hiệu lực 30 ngày, ngược lại 1 ngày
    const expiresIn = rememberMe ? '30d' : '1d';
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    // Create session record
    const deviceId = this.generateDeviceId(userAgentParam || 'unknown', acceptLanguageParam || 'unknown');
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        deviceInfo: deviceId,
        userAgent: userAgentParam || 'unknown',
        ipAddress: 'IP_PLACEHOLDER',
        expiresAt,
      },
    });

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

  async facebookLogin(accessToken: string, rememberMe: boolean = false, userAgent?: string, acceptLanguage?: string) {
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
      // Check if account is deactivated
      if (!user.isActive) {
        return {
          message: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ để kích hoạt lại.",
          deactivated: true,
        };
      }

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

    // Update last login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Nếu rememberMe = true, token có hiệu lực 30 ngày, ngược lại 1 ngày
    const expiresIn = rememberMe ? '30d' : '1d';
    const jwtToken = this.jwtService.sign(payload, { expiresIn });

    // Create session record
    const deviceId = this.generateDeviceId(userAgent || 'unknown', acceptLanguage || 'unknown');
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token: jwtToken,
        deviceInfo: deviceId,
        userAgent: userAgent || 'unknown',
        ipAddress: 'IP_PLACEHOLDER',
        expiresAt,
      },
    });

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

  private generateDeviceId(userAgent: string, acceptLanguage: string): string {
    // Generate a unique device ID based on request headers
    const language = acceptLanguage || 'unknown';
    return this.hashString(`${userAgent}-${language}`);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  async logoutFromAllDevices(userId: number): Promise<{ success: boolean; message: string; sessionsDeleted: number }> {
    // Delete all sessions for this user
    const result = await this.prisma.userSession.deleteMany({
      where: { userId },
    });

    return {
      success: true,
      message: "Đã đăng xuất khỏi tất cả thiết bị thành công",
      sessionsDeleted: result.count,
    };
  }

  async revokeSession(sessionId: number, userId: number): Promise<{ success: boolean; message: string }> {
    // Verify the session belongs to the user
    const session = await this.prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      return {
        success: false,
        message: "Không tìm thấy phiên đăng nhập",
      };
    }

    await this.prisma.userSession.delete({
      where: { id: sessionId },
    });

    return {
      success: true,
      message: "Đã hủy phiên đăng nhập thành công",
    };
  }

  async getActiveSessions(userId: number, userAgent?: string, acceptLanguage?: string): Promise<any[]> {
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
      select: {
        id: true,
        deviceInfo: true,
        userAgent: true,
        ipAddress: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    const currentDeviceId = this.generateDeviceId(userAgent || 'unknown', acceptLanguage || 'unknown');

    return sessions.map(session => ({
      ...session,
      isCurrent: session.userAgent === userAgent && session.deviceInfo === currentDeviceId,
    }));
  }
}