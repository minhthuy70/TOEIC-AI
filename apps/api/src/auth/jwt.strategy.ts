import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {
  ExtractJwt,
  Strategy,
} from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy) {

  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey:
        "BELLA_SECRET_KEY",
    });
  }

  async validate(payload: any) {
    try {
      // Check if the session exists in the database
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(this as any);
      if (!token) {
        throw new UnauthorizedException('Token not found');
      }

      const session = await this.prisma.userSession.findUnique({
        where: { token },
      });

      if (!session) {
        throw new UnauthorizedException('Session has been revoked');
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.prisma.userSession.delete({
          where: { id: session.id },
        });
        throw new UnauthorizedException('Session has expired');
      }

      // Update last used time
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() },
      });

      return {
        id: payload.sub,
        sub: payload.sub,
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}