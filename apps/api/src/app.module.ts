import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

import { PrismaModule } from "./prisma/prisma.module";
import { PlacementTestModule } from "./placement-test/placement-test.module";
import { VocabularyModule } from "./vocabulary/vocabulary.module";
import { GrammarModule } from "./grammar/grammar.module";
import { ListeningModule } from "./listening/listening.module";
import { ReadingModule } from "./reading/reading.module";
import { PracticeModule } from "./practice/practice.module";
import { MockTestModule } from "./mock-test/mock-test.module";


import { AuthModule } from "./auth/auth.module";
import { ProfileModule } from "./profile/profile.module";
import { AdminModule } from "./admin/admin.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { SettingsModule } from "./settings/settings.module";
import { ErrorTrackingModule } from "./error-tracking/error-tracking.module";
import { PointsModule } from "./points/points.module";
import { LevelsModule } from "./levels/levels.module";
import { BadgesModule } from "./badges/badges.module";
import { FriendsModule } from "./friends/friends.module";
import { ChallengesModule } from "./challenges/challenges.module";
import { RewardsModule } from "./rewards/rewards.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    PrismaModule,
    ProfileModule,
    AuthModule,

    ServeStaticModule.forRoot(
      {
        rootPath: join(process.cwd(), "..", "..", "uploads"),
        serveRoot: "/uploads",
      },
      {
        rootPath: join(process.cwd(), "..", "..", "output", "listening"),
        serveRoot: "/listening",
      }
    ),

    PlacementTestModule,
    VocabularyModule,
    GrammarModule,
    ListeningModule,
    ReadingModule,
    PracticeModule,
    MockTestModule,
    AdminModule,
    DashboardModule,
    SettingsModule,
    ErrorTrackingModule,
    PointsModule,
    LevelsModule,
    BadgesModule,
    FriendsModule,
    ChallengesModule,
    RewardsModule,
    NotificationsModule,
  ],
})
export class AppModule {}