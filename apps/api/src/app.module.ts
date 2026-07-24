import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

import { PrismaModule } from "./prisma/prisma.module";
import { PlacementTestModule } from "./placement-test/placement-test.module";
import { VocabularyModule } from "./vocabulary/vocabulary.module";

import { AuthController } from "./auth/auth.controller";
import { ProfileController } from "./profile/profile.controller";
import { ProfileService } from "./profile/profile.service";

@Module({
  imports: [
    PrismaModule,

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "..", "..", "uploads"),
      serveRoot: "/uploads",
    }),

    PlacementTestModule,

    VocabularyModule,
  ],

  controllers: [
    AuthController,
    ProfileController,
  ],

  providers: [
    ProfileService,
  ],
})
export class AppModule { }