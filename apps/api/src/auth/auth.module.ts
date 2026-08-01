import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";

@Module({

    imports: [

        JwtModule.register({

            secret: "BELLA_SECRET_KEY",

            signOptions: {

                expiresIn: "7d"

            }

        })

    ],

    controllers: [

        AuthController

    ],

    providers: [
    AuthService,
    JwtStrategy,
],

    exports: [

        JwtModule,

        AuthService

    ]

})

export class AuthModule {}