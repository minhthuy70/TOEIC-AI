import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { StudyGroupsService } from "./study-groups.service";

@Controller("study-groups")
@UseGuards(JwtAuthGuard)
export class StudyGroupsController {
  constructor(private readonly studyGroupsService: StudyGroupsService) {}

  @Get("my-groups")
  getMyGroups(@Req() req: any) {
    return this.studyGroupsService.getMyGroups(req.user.userId);
  }

  @Get("explore")
  getExploreGroups(@Req() req: any) {
    return this.studyGroupsService.getExploreGroups(req.user.userId);
  }

  @Get(":id")
  getGroupDetail(@Req() req: any, @Param("id") id: string) {
    return this.studyGroupsService.getGroupDetail(req.user.userId, id);
  }

  @Post("create")
  createGroup(@Req() req: any, @Body() body: any) {
    return this.studyGroupsService.createGroup(req.user.userId, body);
  }

  @Post("join")
  joinGroup(@Req() req: any, @Body() body: { groupId: string; inviteCode?: string }) {
    return this.studyGroupsService.joinGroup(req.user.userId, body.groupId, body.inviteCode);
  }

  @Post("leave")
  leaveGroup(@Req() req: any, @Body() body: { groupId: string }) {
    return this.studyGroupsService.leaveGroup(req.user.userId, body.groupId);
  }

  @Get(":id/messages")
  getGroupMessages(@Req() req: any, @Param("id") id: string) {
    return this.studyGroupsService.getGroupMessages(req.user.userId, id);
  }

  @Post(":id/messages")
  sendMessage(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { content: string }
  ) {
    return this.studyGroupsService.sendMessage(req.user.userId, id, body.content);
  }

  @Post(":id/challenges/join")
  joinGroupChallenge(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { challengeId: string }
  ) {
    return this.studyGroupsService.joinGroupChallenge(req.user.userId, id, body.challengeId);
  }
}
