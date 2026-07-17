import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { PlacementTestModule } from './placement-test/placement-test.module';

import { AuthController } from "./auth/auth.controller";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PlacementTestModule,
  ],
  controllers: [
    AuthController,
    ProfileController,
  ],
  providers: [ProfileService],
})
export class AppModule {}