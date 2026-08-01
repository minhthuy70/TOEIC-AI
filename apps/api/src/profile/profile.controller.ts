import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ProfileService } from "./profile.service";

@Controller("profile")
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Post("complete-first-login")
  completeFirstLogin(@Body() body: any) {
    return this.profileService.completeFirstLogin(
      body.userId,
      body.currentScore,
      body.targetScore,
      body.examDate,
      body.dailyStudyTime
        ? Number(body.dailyStudyTime)
        : undefined,
    );
  }
  @UseGuards(JwtAuthGuard)
@Get("me")
getProfile(@Req() req: any) {
  return this.profileService.getProfile(req.user.userId);
}
@UseGuards(JwtAuthGuard)
@Put("me")
updateProfile(
  @Req() req: any,
  @Body() body: any,
) {
  return this.profileService.updateProfile(
    req.user.userId,
    body,
  );
}
}