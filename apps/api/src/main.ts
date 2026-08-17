import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { existsSync } from "fs";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  // ============================================================
  // PROJECT ROOT
  // ============================================================

  const projectRoot = join(
    process.cwd(),
    "..",
    "..",
  );

  // ============================================================
  // TOEIC GENERATED DATA
  // ============================================================

  const imagesPath = join(
    projectRoot,
    "toeic-generated-data",
    "images",
  );

  const audioPath = join(
    projectRoot,
    "toeic-generated-data",
    "audio",
  );

  // ============================================================
  // PLACEMENT TEST
  // ============================================================

  const placementTestPath = join(
    projectRoot,
    "uploads",
    "tests",
    "placement-test",
  );

  const placementImagesPath = join(
    placementTestPath,
    "images",
  );

  const placementAudioPath = join(
    placementTestPath,
    "audio",
  );

  // ============================================================
  // DEBUG
  // ============================================================

  console.log(
    "\n============================================",
  );

  console.log(
    "STATIC ASSETS DEBUG",
  );

  console.log(
    "============================================",
  );

  console.log(
    "\nprocess.cwd():",
  );

  console.log(
    process.cwd(),
  );

  console.log(
    "\nprojectRoot:",
  );

  console.log(
    projectRoot,
  );

  // ------------------------------------------------------------
  // Generated tests
  // ------------------------------------------------------------

  console.log(
    "\nGenerated images:",
  );

  console.log(
    imagesPath,
  );

  console.log(
    "Generated images exists:",
  );

  console.log(
    existsSync(imagesPath),
  );

  console.log(
    "\nGenerated audio:",
  );

  console.log(
    audioPath,
  );

  console.log(
    "Generated audio exists:",
  );

  console.log(
    existsSync(audioPath),
  );

  // ------------------------------------------------------------
  // Placement Test
  // ------------------------------------------------------------

  console.log(
    "\nPlacement Test:",
  );

  console.log(
    placementTestPath,
  );

  console.log(
    "Placement Test exists:",
  );

  console.log(
    existsSync(
      placementTestPath,
    ),
  );

  console.log(
    "\nPlacement images:",
  );

  console.log(
    placementImagesPath,
  );

  console.log(
    "Placement images exists:",
  );

  console.log(
    existsSync(
      placementImagesPath,
    ),
  );

  console.log(
    "\nPlacement audio:",
  );

  console.log(
    placementAudioPath,
  );

  console.log(
    "Placement audio exists:",
  );

  console.log(
    existsSync(
      placementAudioPath,
    ),
  );

  console.log(
    "============================================\n",
  );

  // ============================================================
  // STATIC ASSETS
  // ============================================================

  // 100 Full TOEIC Tests
  app.useStaticAssets(
    imagesPath,
    {
      prefix: "/images",
    },
  );

  app.useStaticAssets(
    audioPath,
    {
      prefix: "/audio",
    },
  );

  // Placement Test
  app.useStaticAssets(
    placementImagesPath,
    {
      prefix: "/placement-images",
    },
  );

  app.useStaticAssets(
    placementAudioPath,
    {
      prefix: "/placement-audio",
    },
  );

  // ============================================================
  // CORS
  // ============================================================

  app.enableCors({
    origin:
      "http://localhost:3000",

    credentials: true,
  });

  // ============================================================
  // START SERVER
  // ============================================================

  await app.listen(3001);

  console.log(
    "API running: http://localhost:3001",
  );
}

bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// async function bootstrap() {

//   const app =
//     await NestFactory.create(
//             AppModule,
//     );
//       app.enableCors();

//   await app.listen(3001);
//   }

// bootstrap();