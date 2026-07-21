import { Body, Controller, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  private profileService =
    new ProfileService();

  @Post('complete-first-login')
  completeFirstLogin(
    @Body() body: any,
  ) {
    return this.profileService.completeFirstLogin(
      body.userId,
      body.currentScore,
      body.targetScore,
      body.examDate,
      body.dailyStudyTime ? Number(body.dailyStudyTime) : undefined,
    );
  }
}