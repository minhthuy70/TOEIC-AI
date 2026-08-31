import { Controller, Get, Post, Req, UseGuards, HttpException, HttpStatus, Body, Query, Param } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ChallengesService } from "./challenges.service";

@UseGuards(JwtAuthGuard)
@Controller("challenges")
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get("available")
  async getAvailableChallenges(
    @Req() req: any,
    @Query("type") type?: string
  ) {
    try {
      const userId = req.user.userId;
      return this.challengesService.getAvailableChallenges(userId, type);
    } catch (error) {
      console.error("Get available challenges error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("my")
  async getUserChallenges(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.challengesService.getUserChallenges(userId);
    } catch (error) {
      console.error("Get user challenges error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("accept")
  async acceptChallenge(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { challengeId } = body;
      if (!challengeId) {
        throw new HttpException(
          { message: "Challenge ID is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.challengesService.acceptChallenge(userId, challengeId);
    } catch (error) {
      console.error("Accept challenge error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("decline")
  async declineChallenge(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { challengeId } = body;
      if (!challengeId) {
        throw new HttpException(
          { message: "Challenge ID is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.challengesService.declineChallenge(userId, challengeId);
    } catch (error) {
      console.error("Decline challenge error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("progress")
  async updateChallengeProgress(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { challengeId, progressType, currentValue } = body;
      if (!challengeId || !progressType || currentValue === undefined) {
        throw new HttpException(
          { message: "Missing required fields", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.challengesService.updateChallengeProgress(
        userId,
        challengeId,
        progressType,
        currentValue
      );
    } catch (error) {
      console.error("Update challenge progress error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":id/leaderboard")
  async getChallengeLeaderboard(
    @Param("id") id: string,
    @Query("limit") limit?: string
  ) {
    try {
      const challengeId = parseInt(id);
      const limitNum = limit ? parseInt(limit) : 20;
      return this.challengesService.getChallengeLeaderboard(challengeId, limitNum);
    } catch (error) {
      console.error("Get challenge leaderboard error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("history")
  async getChallengeHistory(
    @Req() req: any,
    @Query("limit") limit?: string
  ) {
    try {
      const userId = req.user.userId;
      const limitNum = limit ? parseInt(limit) : 20;
      return this.challengesService.getChallengeHistory(userId, limitNum);
    } catch (error) {
      console.error("Get challenge history error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("create")
  async createCustomChallenge(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      return this.challengesService.createCustomChallenge(userId, body);
    } catch (error) {
      console.error("Create custom challenge error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":id")
  async getChallengeDetails(@Param("id") id: string) {
    try {
      const challengeId = parseInt(id);
      return this.challengesService.getChallengeDetails(challengeId);
    } catch (error) {
      console.error("Get challenge details error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}