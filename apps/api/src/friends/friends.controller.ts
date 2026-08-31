import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { FriendsService } from "./friends.service";

@Controller("friends")
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get("list")
  getFriends(@Req() req: any) {
    return this.friendsService.getFriends(req.user.userId);
  }

  @Get("requests")
  getFriendRequests(@Req() req: any) {
    return this.friendsService.getFriendRequests(req.user.userId);
  }

  @Get("search")
  searchUsers(@Req() req: any, @Query("q") q: string) {
    return this.friendsService.searchUsers(req.user.userId, q);
  }

  @Post("request")
  sendFriendRequest(@Req() req: any, @Body() body: { targetUserId: number }) {
    return this.friendsService.sendFriendRequest(req.user.userId, Number(body.targetUserId));
  }

  @Post("accept")
  acceptFriendRequest(@Req() req: any, @Body() body: { requestId: number }) {
    return this.friendsService.acceptFriendRequest(req.user.userId, Number(body.requestId));
  }

  @Post("decline")
  declineFriendRequest(@Req() req: any, @Body() body: { requestId: number }) {
    return this.friendsService.declineFriendRequest(req.user.userId, Number(body.requestId));
  }

  @Delete("remove/:friendId")
  removeFriend(@Req() req: any, @Param("friendId") friendId: string) {
    return this.friendsService.removeFriend(req.user.userId, Number(friendId));
  }

  @Post("block")
  blockUser(@Req() req: any, @Body() body: { targetUserId: number }) {
    return this.friendsService.blockUser(req.user.userId, Number(body.targetUserId));
  }

  @Post("unblock")
  unblockUser(@Req() req: any, @Body() body: { targetUserId: number }) {
    return this.friendsService.unblockUser(req.user.userId, Number(body.targetUserId));
  }

  @Get("blocked")
  getBlockedUsers(@Req() req: any) {
    return this.friendsService.getBlockedUsers(req.user.userId);
  }

  @Get("profile/:friendId")
  getFriendProfile(@Req() req: any, @Param("friendId") friendId: string) {
    return this.friendsService.getFriendProfile(req.user.userId, Number(friendId));
  }

  @Get("compare/:friendId")
  compareWithFriend(@Req() req: any, @Param("friendId") friendId: string) {
    return this.friendsService.compareWithFriend(req.user.userId, Number(friendId));
  }
}