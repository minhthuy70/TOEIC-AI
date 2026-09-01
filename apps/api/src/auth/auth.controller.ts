import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
constructor(
  private readonly authService: AuthService,
) {}

  @Post('register')
  register(
    @Body()
    body: {
      fullName: string;
      email: string;
      password: string;
    },
  ) {
    return this.authService.register(
      body.fullName,
      body.email,
      body.password,
    );
  }

  @Post('login')
  login(
    @Body()
    body: {
      email: string;
      password: string;
      rememberMe?: boolean;
    },
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const acceptLanguage = req.headers['accept-language'] || 'unknown';

    return this.authService.login(
      body.email,
      body.password,
      body.rememberMe || false,
      userAgent,
      acceptLanguage,
    );
  }

  @Post('google')
  googleLogin(
    @Body()
    body: {
      idToken: string;
      rememberMe?: boolean;
    },
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const acceptLanguage = req.headers['accept-language'] || 'unknown';

    return this.authService.googleLogin(body.idToken, body.rememberMe || false, userAgent, acceptLanguage);
  }

  @Post('facebook')
  facebookLogin(
    @Body()
    body: {
      accessToken: string;
      rememberMe?: boolean;
    },
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const acceptLanguage = req.headers['accept-language'] || 'unknown';

    return this.authService.facebookLogin(body.accessToken, body.rememberMe || false, userAgent, acceptLanguage);
  }

  @Post('apple')
  appleLogin(
    @Body()
    body: {
      idToken: string;
      user?: any;
      rememberMe?: boolean;
    },
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const acceptLanguage = req.headers['accept-language'] || 'unknown';

    return this.authService.appleLogin(body.idToken, body.user, body.rememberMe || false, userAgent, acceptLanguage);
  }

  @Post('microsoft')
  microsoftLogin(
    @Body()
    body: {
      accessToken: string;
      rememberMe?: boolean;
    },
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const acceptLanguage = req.headers['accept-language'] || 'unknown';

    return this.authService.microsoftLogin(body.accessToken, body.rememberMe || false, userAgent, acceptLanguage);
  }

  @UseGuards(JwtAuthGuard)
  @Get('linked-accounts')
  getLinkedAccounts(@Req() req: any) {
    const userId = req.user?.id || 1;
    return this.authService.getLinkedAccounts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unlink/:provider')
  unlinkAccount(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id || 1;
    return this.authService.unlinkAccount(userId, body.provider);
  }

  @Post('verify-email')
  verifyEmail(
    @Body()
    body: {
      email: string;
      code: string;
    },
  ) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  @Post('resend-verification')
  resendVerification(
    @Body()
    body: {
      email: string;
    },
  ) {
    return this.authService.resendVerificationCode(body.email);
  }

  @Get("me")
  getMe(@Req() req: any) {
    return req.user;
  }

  @Post('forgot-password')
  forgotPassword(
    @Body()
    body: {
      email: string;
    },
  ) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(
    @Body()
    body: {
      token: string;
      email: string;
      newPassword: string;
    },
  ) {
    return this.authService.resetPassword(body.token, body.email, body.newPassword);
  }

  @Post('request-unlock')
  requestUnlock(
    @Body()
    body: {
      email: string;
    },
  ) {
    return this.authService.requestUnlock(body.email);
  }

  @Post('unlock-account')
  unlockAccount(
    @Body()
    body: {
      email: string;
    },
  ) {
    return this.authService.unlockAccount(body.email);
  }

  @Post('logout-all')
  logoutAll(@Req() req: any) {
    return this.authService.logoutFromAllDevices(req.user.id);
  }

  @Get('sessions')
  getSessions(@Req() req: any) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const acceptLanguage = req.headers['accept-language'] || 'unknown';

    return this.authService.getActiveSessions(req.user.id, userAgent, acceptLanguage);
  }

  @Post('revoke-session')
  revokeSession(
    @Body()
    body: {
      sessionId: number;
    },
    @Req() req: any,
  ) {
    return this.authService.revokeSession(body.sessionId, req.user.id);
  }
}