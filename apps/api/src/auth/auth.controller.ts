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
  ) {
    return this.authService.login(
      body.email,
      body.password,
      body.rememberMe || false,
    );
  }

  @Post('google')
  googleLogin(
    @Body()
    body: {
      idToken: string;
      rememberMe?: boolean;
    },
  ) {
    return this.authService.googleLogin(body.idToken, body.rememberMe || false);
  }

  @Post('facebook')
  facebookLogin(
    @Body()
    body: {
      accessToken: string;
      rememberMe?: boolean;
    },
  ) {
    return this.authService.facebookLogin(body.accessToken, body.rememberMe || false);
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

  @UseGuards(JwtAuthGuard)
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
}