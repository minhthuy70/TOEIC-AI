import { Module } from "@nestjs/common";
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';


import { AuthController } from "./auth/auth.controller";

@Module({
  imports: [],
  controllers: [
    AuthController,
    ProfileController,
  ],
  providers: [ProfileService],
})
export class AppModule {}