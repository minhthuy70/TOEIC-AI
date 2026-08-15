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
  // STATIC ASSETS
  // ============================================================

  const projectRoot = join(process.cwd(), "..", "..");

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

  console.log("\n============================================");
  console.log("STATIC ASSETS DEBUG");
  console.log("============================================");

  console.log("process.cwd():");
  console.log(process.cwd());

  console.log("\nprojectRoot:");
  console.log(projectRoot);

  console.log("\nimagesPath:");
  console.log(imagesPath);

  console.log("imagesPath exists:");
  console.log(existsSync(imagesPath));

  console.log("\naudioPath:");
  console.log(audioPath);

  console.log("audioPath exists:");
  console.log(existsSync(audioPath));

  console.log("============================================\n");

  app.useStaticAssets(imagesPath, {
    prefix: "/images",
  });

  app.useStaticAssets(audioPath, {
    prefix: "/audio",
  });

  // ============================================================
  // CORS
  // ============================================================

  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  await app.listen(3001);

  console.log("API running: http://localhost:3001");
}

bootstrap();