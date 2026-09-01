import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ProfileService } from "./profile.service";

@UseGuards(JwtAuthGuard)
@Controller("profile")
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Post("complete-first-login")
  completeFirstLogin(@Req() req: any, @Body() body: any) {
    const userId = Number(req.user?.sub || req.user?.id || body.userId);
    return this.profileService.completeFirstLogin(
      userId,
      body.currentScore !== undefined ? Number(body.currentScore) : 0,
      body.targetScore !== undefined ? Number(body.targetScore) : 600,
      body.examDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      body.dailyStudyTime
        ? Number(body.dailyStudyTime)
        : undefined,
      body.studySchedule,
      body.motivationLevel
        ? Number(body.motivationLevel)
        : undefined,
      body.learningStyle,
    );
  }
  @Get("me")
  getProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user.userId);
  }

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

  @Put("change-password")
  changePassword(
    @Req() req: any,
    @Body() body: any,
) {
  return this.profileService.changePassword(
    req.user.userId,
    body,
  );
}

@Post("upload-avatar")
@UseInterceptors(
  FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './public/avatars',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `${req.user.userId}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  })
)
uploadAvatar(
  @Req() req: any,
  @UploadedFile() file: any,
) {
  return this.profileService.uploadAvatar(
    req.user.userId,
    file,
  );
}

@Post("deactivate-account")
deactivateAccount(@Req() req: any) {
  return this.profileService.deactivateAccount(req.user.userId);
}

@Put("email")
updateEmail(@Req() req: any, @Body() body: { email: string; password?: string }) {
  return this.profileService.updateEmail(req.user.userId, body.email, body.password);
}

@Get("privacy")
getPrivacySettings(@Req() req: any) {
  return this.profileService.getPrivacySettings(req.user.userId);
}

@Put("privacy")
updatePrivacySettings(@Req() req: any, @Body() body: any) {
  return this.profileService.updatePrivacySettings(req.user.userId, body);
}

@Get("export-data")
exportUserData(@Req() req: any) {
  return this.profileService.exportUserData(req.user.userId);
}

@Get("connected-accounts")
getConnectedAccounts(@Req() req: any) {
  return this.profileService.getConnectedAccounts(req.user.userId);
}

@Post("connected-accounts/unlink")
unlinkConnectedAccount(@Req() req: any, @Body() body: { provider: string }) {
  return this.profileService.unlinkConnectedAccount(req.user.userId, body.provider);
}

@Post("connected-accounts/link")
linkConnectedAccount(@Req() req: any, @Body() body: { provider: string; email?: string }) {
  return this.profileService.linkConnectedAccount(req.user.userId, body.provider, body.email);
}

@Get("study-settings")
getStudySettings(@Req() req: any) {
  return this.profileService.getStudySettings(req.user.userId);
}

@Put("study-settings")
updateStudySettings(@Req() req: any, @Body() body: any) {
  return this.profileService.updateStudySettings(req.user.userId, body);
}

@Get("appearance-settings")
getAppearanceSettings(@Req() req: any) {
  return this.profileService.getAppearanceSettings(req.user.userId);
}

@Put("appearance-settings")
updateAppearanceSettings(@Req() req: any, @Body() body: any) {
  return this.profileService.updateAppearanceSettings(req.user.userId, body);
}

@Get("accessibility-settings")
getAccessibilitySettings(@Req() req: any) {
  return this.profileService.getAccessibilitySettings(req.user.userId);
}

@Put("accessibility-settings")
updateAccessibilitySettings(@Req() req: any, @Body() body: any) {
  return this.profileService.updateAccessibilitySettings(req.user.userId, body);
}

@Get("language-settings")
getLanguageSettings(@Req() req: any) {
  return this.profileService.getLanguageSettings(req.user.userId);
}

@Put("language-settings")
updateLanguageSettings(@Req() req: any, @Body() body: any) {
  return this.profileService.updateLanguageSettings(req.user.userId, body);
}

@Get("offline/packages")
getOfflinePackages(@Req() req: any) {
  return this.profileService.getOfflinePackages(req.user.userId);
}

@Post("offline/sync")
syncOfflineData(@Req() req: any, @Body() body: any) {
  return this.profileService.syncOfflineData(req.user.userId, body);
}

@Get("background-audio/tracks")
getBackgroundAudioTracks(@Req() req: any) {
  return this.profileService.getBackgroundAudioTracks(req.user.userId);
}

@Get("background-audio/settings")
getBackgroundAudioSettings(@Req() req: any) {
  return this.profileService.getBackgroundAudioSettings(req.user.userId);
}

@Put("background-audio/settings")
updateBackgroundAudioSettings(@Req() req: any, @Body() body: any) {
  return this.profileService.updateBackgroundAudioSettings(req.user.userId, body);
}

@Get("widgets/data")
getWidgetsData(@Req() req: any) {
  return this.profileService.getWidgetsData(req.user.userId);
}

@Get("widgets/settings")
getWidgetSettings(@Req() req: any) {
  return this.profileService.getWidgetSettings(req.user.userId);
}

@Put("widgets/settings")
updateWidgetSettings(@Req() req: any, @Body() body: any) {
  return this.profileService.updateWidgetSettings(req.user.userId, body);
}

@Get("social-sharing/templates")
getSocialSharingTemplates(@Req() req: any) {
  return this.profileService.getSocialSharingTemplates(req.user.userId);
}

@Post("social-sharing/log")
logSocialShare(@Req() req: any, @Body() body: { shareType: string; platform: string }) {
  return this.profileService.logSocialShare(req.user.userId, body.shareType, body.platform);
}

@Post("delete-account")
deleteAccount(@Req() req: any, @Body() body: { password?: string; reason?: string }) {
  return this.profileService.deleteAccount(req.user.userId, body.password, body.reason);
}

@Post("save-placement-test-result")
savePlacementTestResult(@Req() req: any, @Body() body: { score: number }) {
  return this.profileService.savePlacementTestResult(req.user.userId, body.score);
}

@Get("placement-test-cooldown")
getPlacementTestCooldown(@Req() req: any) {
  return this.profileService.getPlacementTestCooldown(req.user.userId);
}

@Post("accept-stage")
acceptStage(@Req() req: any, @Body() body: { stage: number }) {
  return this.profileService.acceptStageAssignment(req.user.userId, body.stage);
}

@Post("request-stage-change")
requestStageChange(@Req() req: any, @Body() body: { requestedStage: number; reason?: string }) {
  return this.profileService.requestStageChange(req.user.userId, body.requestedStage, body.reason);
}

@Get("stage-change-requests")
getStageChangeRequests(@Req() req: any) {
  return this.profileService.getStageChangeRequests();
}

@Post("review-stage-change")
reviewStageChange(@Req() req: any, @Body() body: { requestId: number; status: 'APPROVED' | 'REJECTED'; comment?: string }) {
  return this.profileService.reviewStageChangeRequest(body.requestId, body.status, req.user.userId, body.comment);
}

@Post("apply-stage-change")
applyStageChange(@Req() req: any, @Body() body: { requestId: number }) {
  return this.profileService.applyStageChange(body.requestId);
}
}