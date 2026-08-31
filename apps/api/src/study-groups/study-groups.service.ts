import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StudyGroupsService {
  constructor(private prisma: PrismaService) {}

  private mockGroups = [
    {
      id: "group-1",
      name: "Chiến Binh TOEIC 800+ ETS 2026",
      description: "Nhóm tập trung giải đề ETS format mới, cày bẫy Part 5 & 7 mỗi ngày",
      targetScore: 800,
      memberCount: 28,
      maxMembers: 50,
      isPrivate: false,
      ownerId: 1,
      ownerName: "Minh Thùy",
      avatar: "🔥",
      category: "ETS Mock Test",
      progress: {
        weeklyTargetQuestions: 2000,
        weeklyCurrentQuestions: 1680,
        weeklyTargetHours: 100,
        weeklyCurrentHours: 85,
        percentage: 84,
      },
      challenges: [
        {
          id: "chal-1",
          title: "Giải 5 Full Test ETS trong tuần",
          progress: "4/5 Bài",
          reward: "+500 XP",
          daysLeft: 3,
        },
        {
          id: "chal-2",
          title: "Hoàn thành 1,000 từ vựng SRS",
          progress: "820/1000 Từ",
          reward: "+300 XP",
          daysLeft: 5,
        },
      ],
      leaderboard: [
        { rank: 1, name: "Nguyễn Văn Hùng", xp: 1450, studyHours: 16.5, streak: 21 },
        { rank: 2, name: "Bạn (Tôi)", xp: 1280, studyHours: 14.2, streak: 14 },
        { rank: 3, name: "Lê Minh Tuấn", xp: 1100, studyHours: 12.0, streak: 10 },
        { rank: 4, name: "Trần Mai Phương", xp: 950, studyHours: 10.5, streak: 8 },
      ],
      activities: [
        {
          id: "act-1",
          userName: "Lê Minh Tuấn",
          action: "vừa đạt 860 điểm bài thi ETS Test 02",
          time: "10 phút trước",
          type: "score",
        },
        {
          id: "act-2",
          userName: "Nguyễn Văn Hùng",
          action: "đã hoàn thành chuỗi học 21 ngày liên tục 🔥",
          time: "1 giờ trước",
          type: "streak",
        },
        {
          id: "act-3",
          userName: "Trần Mai Phương",
          action: "đã mở khóa huy hiệu Vua Tốc Độ Part 5 🏆",
          time: "3 giờ trước",
          type: "badge",
        },
      ],
      messages: [
        {
          id: "msg-1",
          userId: 991,
          userName: "Lê Minh Tuấn",
          content: "Chào cả nhóm! Câu 115 trong đề ETS Test 2 có bẫy liên từ hay quá mọi người ơi.",
          time: "14:20",
          isMe: false,
        },
        {
          id: "msg-2",
          userId: 1,
          userName: "Bạn",
          content: "Đúng rồi Tuấn, câu đó chú ý vế sau là mệnh đề rút gọn phân từ nhé!",
          time: "14:25",
          isMe: true,
        },
      ],
    },
    {
      id: "group-2",
      name: "Chinh Phục 650+ Nền Tảng Chắc",
      description: "Nhóm dành cho các bạn xây gốc ngữ pháp và từ vựng cơ bản",
      targetScore: 650,
      memberCount: 42,
      maxMembers: 60,
      isPrivate: false,
      ownerId: 2,
      ownerName: "Hoàng Long",
      avatar: "📚",
      category: "Grammar & Vocab",
      progress: {
        weeklyTargetQuestions: 1500,
        weeklyCurrentQuestions: 1100,
        weeklyTargetHours: 80,
        weeklyCurrentHours: 62,
        percentage: 73,
      },
      challenges: [
        {
          id: "chal-3",
          title: "Ôn tập 500 từ vựng Part 1 & 2",
          progress: "380/500 Từ",
          reward: "+300 XP",
          daysLeft: 4,
        },
      ],
      leaderboard: [
        { rank: 1, name: "Phạm Thảo", xp: 1200, studyHours: 14.0, streak: 12 },
        { rank: 2, name: "Hoàng Long", xp: 1050, studyHours: 11.5, streak: 9 },
      ],
      activities: [
        {
          id: "act-4",
          userName: "Phạm Thảo",
          action: "đã hoàn thành 50 câu Part 5",
          time: "30 phút trước",
          type: "practice",
        },
      ],
      messages: [
        {
          id: "msg-3",
          userId: 994,
          userName: "Phạm Thảo",
          content: "Mọi người hôm nay học xong Part 1 chưa nhỉ?",
          time: "10:15",
          isMe: false,
        },
      ],
    },
  ];

  async getMyGroups(userId: number) {
    return {
      success: true,
      groups: this.mockGroups,
    };
  }

  async getExploreGroups(userId: number) {
    const exploreList = [
      ...this.mockGroups,
      {
        id: "group-3",
        name: "Luyện Nghe Siêu Đẳng 450+ LC",
        description: "Nghe chép chính tả và phản xạ Part 2, Part 3 & 4 giọng Anh/Úc",
        targetScore: 900,
        memberCount: 18,
        maxMembers: 30,
        isPrivate: false,
        ownerId: 3,
        ownerName: "Thanh Trúc",
        avatar: "🎧",
        category: "Listening Mastery",
        progress: {
          weeklyTargetQuestions: 1000,
          weeklyCurrentQuestions: 850,
          weeklyTargetHours: 60,
          weeklyCurrentHours: 52,
          percentage: 85,
        },
        challenges: [],
        leaderboard: [],
        activities: [],
        messages: [],
      },
      {
        id: "group-4",
        name: "Master Part 7 Reading Strategies",
        description: "Kỹ thuật Scanning/Skimming đoạn văn kép và ba Part 7 tốc độ cao",
        targetScore: 900,
        memberCount: 25,
        maxMembers: 40,
        isPrivate: true,
        ownerId: 4,
        ownerName: "Đặng Quang",
        avatar: "⚡",
        category: "Reading Part 7",
        progress: {
          weeklyTargetQuestions: 1200,
          weeklyCurrentQuestions: 980,
          weeklyTargetHours: 70,
          weeklyCurrentHours: 64,
          percentage: 82,
        },
        challenges: [],
        leaderboard: [],
        activities: [],
        messages: [],
      },
    ];

    return {
      success: true,
      groups: exploreList,
    };
  }

  async getGroupDetail(userId: number, groupId: string) {
    const group = this.mockGroups.find((g) => g.id === groupId) || this.mockGroups[0];
    return {
      success: true,
      group,
    };
  }

  async createGroup(userId: number, data: any) {
    const newGroup = {
      id: `group-${Date.now()}`,
      name: data.name || "Nhóm Luyện Thi Mới",
      description: data.description || "Nhóm cùng học TOEIC đạt điểm cao",
      targetScore: Number(data.targetScore) || 750,
      memberCount: 1,
      maxMembers: Number(data.maxMembers) || 50,
      isPrivate: Boolean(data.isPrivate),
      ownerId: userId,
      ownerName: "Bạn (Tôi)",
      avatar: data.avatar || "🎯",
      category: data.category || "General TOEIC",
      progress: {
        weeklyTargetQuestions: 1000,
        weeklyCurrentQuestions: 0,
        weeklyTargetHours: 50,
        weeklyCurrentHours: 0,
        percentage: 0,
      },
      challenges: [
        {
          id: `chal-${Date.now()}`,
          title: "Giải 3 đề thi thử tuần đầu tiên",
          progress: "0/3 Bài",
          reward: "+400 XP",
          daysLeft: 7,
        },
      ],
      leaderboard: [
        { rank: 1, name: "Bạn (Tôi)", xp: 100, studyHours: 1.0, streak: 1 },
      ],
      activities: [
        {
          id: `act-${Date.now()}`,
          userName: "Bạn",
          action: "đã tạo nhóm học tập này",
          time: "Vừa xong",
          type: "system",
        },
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          userId: userId,
          userName: "Hệ thống",
          content: "Chào mừng các bạn đến với nhóm học tập! Hãy cùng nhau cố gắng nhé!",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
        },
      ],
    };

    this.mockGroups.push(newGroup);

    return {
      success: true,
      message: "Đã tạo nhóm học tập thành công!",
      group: newGroup,
    };
  }

  async joinGroup(userId: number, groupId: string, inviteCode?: string) {
    const group = this.mockGroups.find((g) => g.id === groupId);
    if (group) {
      group.memberCount += 1;
    }
    return {
      success: true,
      message: "Đã tham gia nhóm học tập thành công!",
      groupId,
    };
  }

  async leaveGroup(userId: number, groupId: string) {
    const group = this.mockGroups.find((g) => g.id === groupId);
    if (group && group.memberCount > 1) {
      group.memberCount -= 1;
    }
    return {
      success: true,
      message: "Đã rời khỏi nhóm học tập",
      groupId,
    };
  }

  async getGroupMessages(userId: number, groupId: string) {
    const group = this.mockGroups.find((g) => g.id === groupId) || this.mockGroups[0];
    return {
      success: true,
      messages: group.messages,
    };
  }

  async sendMessage(userId: number, groupId: string, content: string) {
    const group = this.mockGroups.find((g) => g.id === groupId) || this.mockGroups[0];
    const newMsg = {
      id: `msg-${Date.now()}`,
      userId,
      userName: "Bạn",
      content,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };
    group.messages.push(newMsg);

    return {
      success: true,
      message: newMsg,
    };
  }

  async joinGroupChallenge(userId: number, groupId: string, challengeId: string) {
    return {
      success: true,
      message: "Đã tham gia thử thách nhóm thành công! Hãy hoàn thành mục tiêu để nhận thưởng.",
      challengeId,
    };
  }
}
