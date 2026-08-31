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
  completeFirstLogin(@Body() body: any) {
    return this.profileService.completeFirstLogin(
      body.userId,
      body.currentScore,
      body.targetScore,
      body.examDate,
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