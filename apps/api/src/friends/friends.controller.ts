import { Controller, Get, Post, Req, UseGuards, HttpException, HttpStatus, Body, Query } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { FriendsService } from "./friends.service";

@UseGuards(JwtAuthGuard)
@Controller("friends")
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post("request")
  async sendFriendRequest(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { friendId } = body;
      if (!friendId) {
        throw new HttpException(
          { message: "Friend ID is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.friendsService.sendFriendRequest(userId, friendId);
    } catch (error) {
      console.error("Send friend request error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("accept")
  async acceptFriendRequest(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { friendId } = body;
      if (!friendId) {
        throw new HttpException(
          { message: "Friend ID is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.friendsService.acceptFriendRequest(userId, friendId);
    } catch (error) {
      console.error("Accept friend request error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("reject")
  async rejectFriendRequest(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { friendId } = body;
      if (!friendId) {
        throw new HttpException(
          { message: "Friend ID is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.friendsService.rejectFriendRequest(userId, friendId);
    } catch (error) {
      console.error("Reject friend request error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("remove")
  async removeFriend(@Req() req: any, @Body() body: any) {
    try {
      const userId = req.user.userId;
      const { friendId } = body;
      if (!friendId) {
        throw new HttpException(
          { message: "Friend ID is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      return this.friendsService.removeFriend(userId, friendId);
    } catch (error) {
      console.error("Remove friend error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("list")
  async getFriendsList(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.friendsService.getFriendsList(userId);
    } catch (error) {
      console.error("Get friends list error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("pending")
  async getPendingRequests(@Req() req: any) {
    try {
      const userId = req.user.userId;
      return this.friendsService.getPendingRequests(userId);
    } catch (error) {
      console.error("Get pending requests error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("search")
  async searchUsers(
    @Req() req: any,
    @Query("search") search?: string,
    @Query("limit") limit?: string
  ) {
    try {
      if (!search) {
        throw new HttpException(
          { message: "Search term is required", statusCode: 400 },
          HttpStatus.BAD_REQUEST
        );
      }
      const userId = req.user.userId;
      const limitNum = limit ? parseInt(limit) : 20;
      return this.friendsService.searchUsers(search, userId, limitNum);
    } catch (error) {
      console.error("Search users error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: 500 },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}