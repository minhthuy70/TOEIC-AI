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
@UseGuards(JwtAuthGuard)
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

@UseGuards(JwtAuthGuard)
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
  @UploadedFile() file: Express.Multer.File,
) {
  return this.profileService.uploadAvatar(
    req.user.userId,
    file,
  );
}
}