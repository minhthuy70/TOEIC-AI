import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

import { PrismaModule } from "./prisma/prisma.module";
import { PlacementTestModule } from "./placement-test/placement-test.module";
import { VocabularyModule } from "./vocabulary/vocabulary.module";

import { ProfileController } from "./profile/profile.controller";
import { ProfileService } from "./profile/profile.service";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    PrismaModule,

     AuthModule,

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "..", "..", "uploads"),
      serveRoot: "/uploads",
    }),

    PlacementTestModule,

    VocabularyModule,
  ],

  controllers: [
    ProfileController,
  ],

  providers: [
    ProfileService,
  ],
})
export class AppModule { }