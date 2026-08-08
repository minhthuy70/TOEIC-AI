import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

import { PrismaModule } from "./prisma/prisma.module";
import { PlacementTestModule } from "./placement-test/placement-test.module";
import { VocabularyModule } from "./vocabulary/vocabulary.module";
import { GrammarModule } from "./grammar/grammar.module";


import { AuthModule } from "./auth/auth.module";
import { ProfileModule } from "./profile/profile.module";

@Module({
  imports: [
    PrismaModule,
    ProfileModule,
    AuthModule,

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "..", "..", "uploads"),
      serveRoot: "/uploads",
    }),

    PlacementTestModule,
    VocabularyModule,
    GrammarModule,
  ],
})
export class AppModule {}