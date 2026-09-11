import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "@prisma/client";
import { SecurityService } from "./security.service";

@Controller("security")
@UseGuards(JwtAuthGuard)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  // 1. Two-Factor Authentication
  @Get("2fa/status")
  get2faStatus(@Req() req: any) {
    const userId = req.user.id;
    return this.securityService.get2faStatus(userId);
  }

  @Post("2fa/generate")
  generate2fa(@Req() req: any) {
    const userId = req.user.id;
    return this.securityService.generate2faSecret(userId);
  }

  @Post("2fa/verify")
  verify2fa(@Req() req: any, @Body() body: { otpCode: string }) {
    const userId = req.user.id;
    return this.securityService.verifyAndEnable2fa(userId, body.otpCode);
  }

  @Post("2fa/disable")
  disable2fa(@Req() req: any) {
    const userId = req.user.id;
    return this.securityService.disable2fa(userId);
  }

  // 4. Session Management
  @Get("sessions")
  getSessions(@Req() req: any) {
    const userId = req.user.id;
    return this.securityService.getSessions(userId);
  }

  @Post("sessions/revoke")
  revokeSession(@Req() req: any, @Body() body: { sessionId: number }) {
    const userId = req.user.id;
    return this.securityService.revokeSession(userId, body.sessionId);
  }

  @Post("sessions/revoke-all")
  revokeAllSessions(@Req() req: any) {
    const userId = req.user.id;
    return this.securityService.revokeAllSessions(userId);
  }

  // 2, 3. Suspicious Activity Detection
  @Get("suspicious-activities")
  getSuspiciousActivities(@Req() req: any) {
    const userId = req.user.id;
    return this.securityService.getSuspiciousActivities(userId);
  }

  // 5-11. System Defense Status
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get("system-defense-status")
  getSystemDefenseStatus() {
    return this.securityService.getSystemDefenseStatus();
  }

  // 5. IP Whitelist Management
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get("ip-whitelist")
  getIpWhitelist() {
    return this.securityService.getIpWhitelist();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post("ip-whitelist")
  addIpWhitelist(@Body() body: { ip: string; label: string }) {
    return this.securityService.addIpWhitelist(body.ip, body.label);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete("ip-whitelist/:id")
  deleteIpWhitelist(@Param("id") id: string) {
    return this.securityService.deleteIpWhitelist(id);
  }
}
