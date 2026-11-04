import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Smartphone,
  Mail,
  User,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  KeyRound,
  Laptop,
  FileText,
  Check,
  X,
  SlidersHorizontal,
  Terminal,
  BadgeCheck,
  Loader2,
  Upload,
  Search,
  Edit3,
  Link2,
  Clock,
  XCircle,
  ChevronDown,
  Trophy,
  Users,
  Calendar,
  Bell,
  Building2,
} from 'lucide-react';
import {
  computeCompetitionStatus,
  getCompetitionStatusLabel,
  type CompetitionCatalogItem,
  type RegistrationSubmission,
} from '../data/competitionData';
import {
  MyRegistrationsClosedLoopModule,
  TeamLogoAvatar,
  resolveTeamAuditStages,
  buildApprovedSnapshotFromCaptainTeam,
  resolvePersonContactByName,
  isUserAccountExpired,
  getEffectiveUserStatus,
  isTeamOwnedByUser,
  CtfRoleBadges,
  type CtfRoleType,
  type CaptainTeamRecord,
  type ParticipatedTeamRecord,
  type TeamApprovedSnapshot,
  type PlatformDirectoryUser,
} from './TeamRegistrationSystem';
import type { EventRegistrationConfig } from './AdminRegistrationManagement';
import type {
  VerificationApplicationRecord,
  VerificationAttachmentItem,
} from './InstitutionAndContentManagement';

// ============================================================================
// 站内消息中心（顶部铃铛下拉面板 + 个人中心“我的消息”TAB 100% 同步数据结构）
// ============================================================================
export type MessageCategoryTab = 'invite' | 'review' | 'system';

export type MessageRolePerspective =
  | '队长视角'
  | '队员/指导教师视角'
  | '高校管理员视角'
  | '秘书处视角'
  | '全角色通用';

export type MessageScenarioType =
  | 'member_feedback' // 1. 队长视角：成员反馈（队员/老师同意或拒绝）
  | 'review_rejected' // 1. 队长视角：审核驳回（高校/秘书处驳回）
  | 'review_progress' // 1. 队长视角：审核进度（高校通过，待秘书处）
  | 'registration_success' // 1. 队长视角：报名成功（秘书处终审通过）
  | 'team_invite' // 2. 队员/指导教师视角：入队邀请（队长发出邀请）
  | 'removed_from_team' // 2. 队员/指导教师视角：被移出队伍（纯通知，无按钮）
  | 'team_status_change' // 2. 队员/指导教师视角：队伍状态提醒（队伍被驳回/通过）
  | 'univ_todo' // 3. 高校管理员视角：待办提醒（本校有队伍提交审核）
  | 'univ_channel_open' // 3. 高校管理员视角：通道开启（秘书处开启高校审核）
  | 'sec_todo' // 4. 秘书处视角：待办提醒（高校审核通过队伍）
  | 'cert_result'; // 5. 全角色通用：认证结果（实名/学籍/教师认证审核完）

export type MessageRightActionType =
  | 'invite_actions' // 【同意】【拒绝】（已处理后显示灰色“已同意”或“已拒绝”）
  | 'go_modify' // 【去修改】
  | 'view_detail' // 【查看详情】
  | 'go_admin' // 【去后台处理】
  | 'go_cert' // 【去查看】
  | 'none'; // 无（纯通知，如被移出队伍）

export interface PlatformMessageItem {
  id: string;
  title: string;
  /** 供顶部 350px 铃铛下拉面板极简展示的短标题，例如“周子航邀请您加入队伍”、“您的队伍被驳回” */
  shortTitle?: string;
  desc: string;
  time: string;
  unread: boolean;
  category?: MessageCategoryTab;
  rolePerspective?: MessageRolePerspective;
  scenarioType?: MessageScenarioType;
  messageTypeLabel?: string;
  /** 左侧图标样式：'avatar' 为用户交互类显示对方头像；其余为系统/审核类带颜色图标 */
  iconStyle?: 'avatar' | 'success' | 'error' | 'warning' | 'info';
  senderName?: string;
  senderAvatarUrl?: string;
  actionType?: MessageRightActionType;
  /** 邀请类消息的处理状态 */
  inviteStatus?: 'pending' | 'accepted' | 'rejected';
  /** 关联的“我参与的队伍”ID（用于点击【同意】/【拒绝】双向同步到我的报名-我参与的队伍） */
  relatedParticipatedTeamId?: string;
  /** 若同意的是一条新邀请，携带完整队伍信息以便立刻插入到“我参与的队伍”列表 */
  inviteTeamPayload?: ParticipatedTeamRecord;
  /** 关联的队长发起队伍ID（用于点击【去修改】或【查看详情】定位到对应队伍） */
  relatedCaptainTeamId?: string;
}

export const INITIAL_PLATFORM_MESSAGES: PlatformMessageItem[] = [
  // =========================================================================
  // 一、队员 / 指导教师视角
  // =========================================================================
  // 1. 队员视角 —— 入队邀请（未读、待处理，对应 part-team-1）
  {
    id: 'msg-invite-1',
    title: '周子航 邀请您加入队伍',
    shortTitle: '周子航邀请您加入队伍',
    desc: '邀请您加入【2026“XX杯”车联网与智能工业控制系统安全极客邀请赛】的【北航车联护盾联队】担任【参赛队员】（初始分配角色：Web手、取证手）',
    time: '5分钟前',
    unread: true,
    category: 'invite',
    rolePerspective: '队员/指导教师视角',
    scenarioType: 'team_invite',
    messageTypeLabel: '入队邀请',
    iconStyle: 'avatar',
    senderName: '周子航',
    senderAvatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    actionType: 'invite_actions',
    inviteStatus: 'pending',
    relatedParticipatedTeamId: 'part-team-1',
  },
  // 2. 队长视角 —— 第一段【高校资格审核】被驳回（未读，对应 cap-team-4）
  {
    id: 'msg-reject-1',
    title: '高校资格审核已驳回，请修改',
    shortTitle: '您的队伍被高校审核驳回',
    desc: '您的队伍【北航凌云密算战队】在第一段【高校资格审核】中未通过（当前报名状态：已驳回），驳回原因：队伍简介中未注明所依托的学院实验室安全合规备案号，且指导教师信息需补充确认。请修改后重新提交审核。',
    time: '15分钟前',
    unread: true,
    category: 'review',
    rolePerspective: '队长视角',
    scenarioType: 'review_rejected',
    messageTypeLabel: '高校审核驳回',
    iconStyle: 'error',
    actionType: 'go_modify',
    relatedCaptainTeamId: 'cap-team-4',
  },
  // 3. 队员视角 —— 入队邀请（未读、待处理，对应新队伍 part-team-new-star，点击同意后立刻新增出现在“我的报名-我参与的”中）
  {
    id: 'msg-invite-2',
    title: '陆景川 邀请您加入队伍',
    shortTitle: '陆景川邀请您加入队伍',
    desc: '邀请您加入【2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛】的【北航星辰二进制战队】担任【参赛队员】（初始分配角色：Pwn手、逆向手）',
    time: '28分钟前',
    unread: true,
    category: 'invite',
    rolePerspective: '队员/指导教师视角',
    scenarioType: 'team_invite',
    messageTypeLabel: '入队邀请',
    iconStyle: 'avatar',
    senderName: '陆景川',
    senderAvatarUrl:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80',
    actionType: 'invite_actions',
    inviteStatus: 'pending',
    relatedParticipatedTeamId: 'part-team-new-star',
    inviteTeamPayload: {
      id: 'part-team-new-star',
      competitionId: 'comp-2026-main',
      competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
      subTrackName: '',
      teamName: '北航星辰二进制战队',
      teamLogo: 'default-logo',
      teamIntro: '专注Linux内核态漏洞挖掘、堆利用原语构造与自动化CTF二进制攻防对抗。',
      captainName: '陆景川',
      captainPhone: '138****5520',
      university: '北京航空航天大学',
      myRoleInTeam: '参赛队员',
      myCtfRoles: ['Pwn手', '逆向手'],
      status: 'joined',
      invitedAt: '2026-10-28 11:05',
      teammatesSummary: ['陆景川（队长 · 北京航空航天大学）', '林远航（队员 · 已同意）', '赵振宇 教授（指导教师 · 已同意）'],
      teamMembersDetail: [
        { name: '陆景川', role: '队长', university: '北京航空航天大学', ctfRoles: ['Pwn手', '密码学手'], statusLabel: '发起人' },
        { name: '林远航', role: '队员', university: '北京航空航天大学', ctfRoles: ['Pwn手', '逆向手'], statusLabel: '已同意' },
        { name: '赵振宇 教授', role: '指导教师', university: '北京航空航天大学', statusLabel: '已同意' },
      ],
    },
  },
  // 4. 队长视角 —— 成员反馈（未读，受邀队员拒绝加入）
  {
    id: 'msg-feedback-reject',
    title: '张子轩 已拒绝加入队伍',
    shortTitle: '张子轩已拒绝加入队伍',
    desc: '受邀队员【张子轩】拒绝了加入您的队伍【北航红蓝极客战队】（拒绝原因：下周有操作系统课程设计答辩，时间冲突），您可继续邀请其他同学替换或满1名已同意队员后提交审核。',
    time: '45分钟前',
    unread: true,
    category: 'review',
    rolePerspective: '队长视角',
    scenarioType: 'member_feedback',
    messageTypeLabel: '成员反馈',
    iconStyle: 'avatar',
    senderName: '张子轩',
    senderAvatarUrl:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
    actionType: 'view_detail',
    relatedCaptainTeamId: 'cap-team-1',
  },
  // 5. 队员视角 —— 入队邀请（未读、待处理，对应 part-team-3 宋知行）
  {
    id: 'msg-invite-3',
    title: '宋知行 邀请您加入队伍',
    shortTitle: '宋知行邀请您加入队伍',
    desc: '邀请您加入【2026“XX杯”云原生与零信任架构安全攻防挑战赛】的【北航云原生星云战队】担任【参赛队员】（初始分配角色：Web手、杂项手）',
    time: '1小时前',
    unread: true,
    category: 'invite',
    rolePerspective: '队员/指导教师视角',
    scenarioType: 'team_invite',
    messageTypeLabel: '入队邀请',
    iconStyle: 'avatar',
    senderName: '宋知行',
    senderAvatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    actionType: 'invite_actions',
    inviteStatus: 'pending',
    relatedParticipatedTeamId: 'part-team-3',
  },
  // 6. 指导教师视角 —— 指导教师入队邀请（已同意示例，对应 part-team-2）
  {
    id: 'msg-invite-advisor',
    title: '沈星河 邀请您担任指导教师',
    shortTitle: '沈星河邀请您担任指导教师',
    desc: '邀请您加入【2026“XX杯”人工智能生成内容（AIGC）安全与大模型攻防挑战赛】的【北航AIGC安全卫士队】担任【指导教师】',
    time: '1小时30分钟前',
    unread: false,
    category: 'invite',
    rolePerspective: '队员/指导教师视角',
    scenarioType: 'team_invite',
    messageTypeLabel: '指导教师邀请',
    iconStyle: 'avatar',
    senderName: '沈星河',
    senderAvatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    actionType: 'invite_actions',
    inviteStatus: 'accepted',
    relatedParticipatedTeamId: 'part-team-2',
  },
  // 7. 队长视角 —— 成员反馈（队员同意加入）
  {
    id: 'msg-feedback-member-accept',
    title: '苏沐宸 已同意加入队伍',
    shortTitle: '苏沐宸已同意加入队伍',
    desc: '受邀队员【苏沐宸】已确认加入您的队伍【北航红蓝极客战队】，分配队内角色【逆向手、Pwn手】已正式生效。',
    time: '1小时45分钟前',
    unread: false,
    category: 'review',
    rolePerspective: '队长视角',
    scenarioType: 'member_feedback',
    messageTypeLabel: '成员反馈',
    iconStyle: 'avatar',
    senderName: '苏沐宸',
    senderAvatarUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80',
    actionType: 'view_detail',
    relatedCaptainTeamId: 'cap-team-1',
  },
  // 8. 队长视角 —— 成员反馈（指导教师同意加入）
  {
    id: 'msg-feedback-accept',
    title: '赵振宇 教授 已同意加入',
    shortTitle: '赵振宇教授已同意加入',
    desc: '【赵振宇 教授】已确认加入您的队伍【北航红蓝极客战队】担任指导教师。',
    time: '2小时前',
    unread: false,
    category: 'review',
    rolePerspective: '队长视角',
    scenarioType: 'member_feedback',
    messageTypeLabel: '成员反馈',
    iconStyle: 'avatar',
    senderName: '赵振宇',
    senderAvatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
    actionType: 'view_detail',
    relatedCaptainTeamId: 'cap-team-1',
  },
  // 9. 队长视角 —— 第一段【高校资格审核】通过（状态变更为“待校赛”，对应 cap-team-2）
  {
    id: 'msg-review-progress',
    title: '高校资格审核已通过（待校赛）',
    shortTitle: '队伍已通过高校资格审核',
    desc: '您的队伍【北航零日防御先锋队】已通过第一段【高校资格审核】，当前报名状态更新为【待校赛】。待本校选拔赛结束后，将由高校管理员统一勾选晋级名单并上传成绩证明提报至秘书处。',
    time: '3小时前',
    unread: false,
    category: 'review',
    rolePerspective: '队长视角',
    scenarioType: 'review_progress',
    messageTypeLabel: '高校审核通过',
    iconStyle: 'info',
    actionType: 'view_detail',
    relatedCaptainTeamId: 'cap-team-2',
  },
  // 10. 队长视角 —— 第二段【高校晋级提报】已列入名单（状态变更为“待终审”，对应 cap-team-7）
  {
    id: 'msg-review-promoted',
    title: '高校已提报晋级名单（待终审）',
    shortTitle: '队伍已获高校晋级提报',
    desc: '恭喜！本校高校管理员已将您的队伍【SkyHawk-0day（林远航单兵队）】列入校赛晋级推荐名单（校内排名：第 2 名）并随附校赛成绩证明提交至大赛秘书处，当前报名状态为【待终审】。',
    time: '3小时30分钟前',
    unread: false,
    category: 'review',
    rolePerspective: '队长视角',
    scenarioType: 'review_progress',
    messageTypeLabel: '晋级提报通知',
    iconStyle: 'info',
    actionType: 'view_detail',
    relatedCaptainTeamId: 'cap-team-7',
  },
  // 11. 队长视角 —— 第二段【高校晋级提报】未晋级（状态变更为“未晋级”，对应 cap-team-8）
  {
    id: 'msg-review-not-advanced',
    title: '校赛晋级结果通知（未晋级）',
    shortTitle: '队伍止步校内选拔赛',
    desc: '贵校管理员已完成【2026第五届“XX杯”全国网数智安全大赛】本校晋级名单提报，您的队伍【北航玄武密码学研习队】未在本次晋级推荐名单内，当前报名状态更新为【未晋级】。感谢您的参与！',
    time: '4小时前',
    unread: false,
    category: 'review',
    rolePerspective: '队长视角',
    scenarioType: 'review_progress',
    messageTypeLabel: '校赛结果通知',
    iconStyle: 'warning',
    actionType: 'view_detail',
    relatedCaptainTeamId: 'cap-team-8',
  },
  // 12. 队长视角 —— 第三段【秘书处终审】驳回高校晋级名单（对应 cap-team-9）
  {
    id: 'msg-review-sec-reject',
    title: '秘书处终审退回高校重报提醒',
    shortTitle: '本校晋级名单待高校重报',
    desc: '您所在的【北航量子防线战队】（校内排名：第 3 名）所属高校晋级提报单被大赛秘书处退回补充材料（原因：校赛成绩单缺少教务处或网安学院公章）。队伍当前保持【待终审】状态，等待本校高校管理员重新上传提报，队长无需修改队伍信息。',
    time: '4小时20分钟前',
    unread: false,
    category: 'review',
    rolePerspective: '队长视角',
    scenarioType: 'review_progress',
    messageTypeLabel: '终审进度提醒',
    iconStyle: 'warning',
    actionType: 'view_detail',
    relatedCaptainTeamId: 'cap-team-9',
  },
  // 13. 队长视角 —— 第三段【秘书处终审】通过（报名成功，对应 cap-team-3）
  {
    id: 'msg-reg-success',
    title: '恭喜！秘书处终审通过，报名成功',
    shortTitle: '恭喜！队伍报名成功',
    desc: '您的队伍【北航智盾先锋队】（校内排名：第 1 名）已通过高校资格审核、高校晋级提报及大赛秘书处终审，报名状态正式变更为【报名成功】，已同步载入【我的竞赛】与最终参赛队伍清单！',
    time: '5小时前',
    unread: false,
    category: 'review',
    rolePerspective: '队长视角',
    scenarioType: 'registration_success',
    messageTypeLabel: '报名成功',
    iconStyle: 'success',
    actionType: 'view_detail',
    relatedCaptainTeamId: 'cap-team-3',
  },
  // 14. 队员/指导教师视角 —— 队内角色分配变更提醒
  {
    id: 'msg-role-updated',
    title: '队长更新了您的队内角色标签',
    shortTitle: '队内角色标签已更新',
    desc: '【北航AIGC安全卫士队】队长【沈星河】更新了您在队内的角色分配标签，当前角色为：【Web手、密码学手、杂项手】。',
    time: '昨天 19:40',
    unread: false,
    category: 'review',
    rolePerspective: '队员/指导教师视角',
    scenarioType: 'team_status_change',
    messageTypeLabel: '角色变更提醒',
    iconStyle: 'info',
    actionType: 'view_detail',
    relatedParticipatedTeamId: 'part-team-2',
  },
  // 15. 队员/指导教师视角 —— 被移出队伍（纯通知，无按钮）
  {
    id: 'msg-removed-team',
    title: '移出队伍通知',
    shortTitle: '您已被移出队伍',
    desc: '您已被队长【陈思远】移出队伍【北航固件狩猎二队】。',
    time: '昨天 18:20',
    unread: false,
    category: 'system',
    rolePerspective: '队员/指导教师视角',
    scenarioType: 'removed_from_team',
    messageTypeLabel: '被移出队伍',
    iconStyle: 'warning',
    actionType: 'none',
  },
  // 16. 队员/指导教师视角 —— 所在队伍状态变更（通过秘书处终审 -> 报名成功）
  {
    id: 'msg-team-status-change',
    title: '所在队伍报名成功通知',
    shortTitle: '所在队伍已报名成功',
    desc: '您参与的队伍【北航多模态鉴伪实验室战队】（校内排名：第 2 名）已通过大赛秘书处终审，状态正式变更为【报名成功】，您可前往【我的竞赛】查看完整参赛档案。',
    time: '昨天 14:10',
    unread: false,
    category: 'review',
    rolePerspective: '队员/指导教师视角',
    scenarioType: 'team_status_change',
    messageTypeLabel: '队伍状态提醒',
    iconStyle: 'success',
    actionType: 'view_detail',
    relatedParticipatedTeamId: 'part-team-7',
  },
  // 17. 队员/指导教师视角 —— 所在队伍状态变更（通过高校资格审核 -> 待校赛）
  {
    id: 'msg-team-status-school-pass',
    title: '所在队伍已通过高校资格审核',
    shortTitle: '所在队伍进入待校赛阶段',
    desc: '您作为参赛队员加入的【北航智能网联防火墙战队】已通过本校高校资格审核，当前处于【待校赛】阶段。',
    time: '昨天 12:30',
    unread: false,
    category: 'review',
    rolePerspective: '队员/指导教师视角',
    scenarioType: 'team_status_change',
    messageTypeLabel: '队伍状态提醒',
    iconStyle: 'info',
    actionType: 'view_detail',
    relatedParticipatedTeamId: 'part-team-5',
  },

  // =========================================================================
  // 三、高校管理员视角
  // =========================================================================
  // 18. 高校管理员视角 —— 待办提醒（本校有新队伍提交资格审核）
  {
    id: 'msg-univ-todo',
    title: '本校新报名队伍待资格审核',
    shortTitle: '本校有新队伍待审核',
    desc: '【北京航空航天大学】有 2 支新组建队伍（北航云端猎手战队、SkyHawk-0day）已提交报名，请前往后台【报名管理 -> 查看报名 -> 高校资格审核】核验队伍及成员合规性。',
    time: '昨天 11:00',
    unread: true,
    category: 'review',
    rolePerspective: '高校管理员视角',
    scenarioType: 'univ_todo',
    messageTypeLabel: '资格审核待办',
    iconStyle: 'info',
    actionType: 'go_admin',
  },
  // 19. 高校管理员视角 —— 待办提醒（学生认证/教师认证待审核）
  {
    id: 'msg-univ-cert-todo',
    title: '本校新增学生/教师认证待审核',
    shortTitle: '新增学生/教师认证待审核',
    desc: '【北京航空航天大学】有 3 条新的学生认证申请与 1 条教师认证申请提交至后台，请前往【认证管理】核对所属院校、学历、专业及入学/毕业时间信息。',
    time: '昨天 09:45',
    unread: false,
    category: 'review',
    rolePerspective: '高校管理员视角',
    scenarioType: 'univ_todo',
    messageTypeLabel: '身份认证待办',
    iconStyle: 'info',
    actionType: 'go_admin',
  },
  // 20. 高校管理员视角 —— 待办提醒（校赛结束，提报本校晋级名单）
  {
    id: 'msg-univ-promote-todo',
    title: '请提报本校校赛晋级队伍名单',
    shortTitle: '请提报本校晋级队伍名单',
    desc: '本校已有 5 支队伍通过第一段【高校资格审核】。请在校内选拔赛结束后，前往后台【高校资格审核】点击【提报晋级名单】，勾选晋级队伍、设置校内排名并上传盖章版校赛成绩证明。',
    time: '2天前',
    unread: false,
    category: 'review',
    rolePerspective: '高校管理员视角',
    scenarioType: 'univ_todo',
    messageTypeLabel: '晋级提报待办',
    iconStyle: 'warning',
    actionType: 'go_admin',
  },
  // 21. 高校管理员视角 —— 秘书处驳回本校提报的晋级名单（需修改重报）
  {
    id: 'msg-univ-sec-reject',
    title: '本校晋级提报单被秘书处驳回',
    shortTitle: '晋级名单被驳回需重报',
    desc: '大赛秘书处在第三段终审中驳回了贵校提报的晋级名单，驳回原因：上传的校赛成绩证明PDF未加盖学院或教务部门公章，且第3名队伍排序备注不全。请前往后台重新上传材料并提报。',
    time: '2天前',
    unread: false,
    category: 'review',
    rolePerspective: '高校管理员视角',
    scenarioType: 'univ_todo',
    messageTypeLabel: '终审驳回重报',
    iconStyle: 'error',
    actionType: 'go_admin',
  },
  // 22. 高校管理员视角 —— 秘书处已通过本校晋级名单
  {
    id: 'msg-univ-sec-pass',
    title: '本校晋级队伍名单已通过秘书处终审',
    shortTitle: '本校晋级名单终审通过',
    desc: '贵校提报的【2026第五届“XX杯”全国网数智安全大赛】晋级队伍名单（共 3 支队伍）已通过大赛秘书处终审，全部晋级队伍已正式进入【最终参赛队伍清单】。',
    time: '2天前',
    unread: false,
    category: 'review',
    rolePerspective: '高校管理员视角',
    scenarioType: 'univ_todo',
    messageTypeLabel: '终审通过通知',
    iconStyle: 'success',
    actionType: 'go_admin',
  },
  // 23. 高校管理员视角 —— 通道开启（秘书处开启高校审核与晋级提报通道）
  {
    id: 'msg-univ-channel-open',
    title: '高校资格审核与晋级提报通道已开启',
    shortTitle: '高校审核通道已开启',
    desc: '【2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛】的高校资格审核与校赛晋级提报通道已开启，请及时前往后台处理本校报名队伍。',
    time: '3天前',
    unread: false,
    category: 'system',
    rolePerspective: '高校管理员视角',
    scenarioType: 'univ_channel_open',
    messageTypeLabel: '通道开启',
    iconStyle: 'info',
    actionType: 'go_admin',
  },

  // =========================================================================
  // 四、秘书处视角
  // =========================================================================
  // 24. 秘书处视角 —— 待办提醒（高校已提报晋级名单，待秘书处终审）
  {
    id: 'msg-sec-todo',
    title: '高校晋级名单待秘书处终审',
    shortTitle: '有高校提报晋级名单待终审',
    desc: '【北京航空航天大学】、【清华大学】等 3 所高校已提交校赛晋级推荐名单及成绩证明材料（合计 9 支晋级队伍），请前往后台【查看报名 -> 秘书处终审】按高校维度核验材料并完成终审。',
    time: '2天前',
    unread: true,
    category: 'review',
    rolePerspective: '秘书处视角',
    scenarioType: 'sec_todo',
    messageTypeLabel: '终审待办提醒',
    iconStyle: 'info',
    actionType: 'go_admin',
  },
  // 25. 秘书处视角 —— 待办提醒（被驳回高校已修改并重新提报晋级名单）
  {
    id: 'msg-sec-resubmit-todo',
    title: '高校已重新提报晋级名单待复核',
    shortTitle: '高校已重新提报晋级名单',
    desc: '此前被打回补充材料的【哈尔滨工业大学】已完成校赛成绩证明材料重传与排名修正，并重新提交至【秘书处终审】，请及时复核。',
    time: '2天前',
    unread: false,
    category: 'review',
    rolePerspective: '秘书处视角',
    scenarioType: 'sec_todo',
    messageTypeLabel: '重报复核待办',
    iconStyle: 'warning',
    actionType: 'go_admin',
  },
  // 26. 秘书处视角 —— 最终参赛队伍清单汇总提醒
  {
    id: 'msg-sec-summary',
    title: '各赛区最终参赛队伍清单阶段汇总',
    shortTitle: '最终参赛队伍清单阶段汇总',
    desc: '当前已有 18 所高校通过秘书处终审，共计 52 支队伍正式沉淀至【最终参赛队伍清单】，您可随时前往后台导出包含队员身份证号、学历、队内角色、所属赛区等全量字段的 Excel 明细表。',
    time: '3天前',
    unread: false,
    category: 'system',
    rolePerspective: '秘书处视角',
    scenarioType: 'sec_todo',
    messageTypeLabel: '赛事汇总通知',
    iconStyle: 'success',
    actionType: 'go_admin',
  },

  // =========================================================================
  // 五、全角色通用（系统与认证类）
  // =========================================================================
  // 27. 全角色通用 —— 实名认证审核通过
  {
    id: 'msg-cert-pass',
    title: '实名认证已完成',
    shortTitle: '实名认证已完成',
    desc: '您的实名认证信息（姓名、身份证号）及手机号、邮箱已核验通过，现已解锁【学生/教师认证】申请权限。',
    time: '3天前',
    unread: false,
    category: 'system',
    rolePerspective: '全角色通用',
    scenarioType: 'cert_result',
    messageTypeLabel: '实名认证结果',
    iconStyle: 'success',
    actionType: 'go_cert',
  },
  // 28. 全角色通用 —— 学生认证审核通过
  {
    id: 'msg-cert-student-pass',
    title: '学生认证审核通过',
    shortTitle: '学生认证审核通过',
    desc: '您提交的【参赛学生】身份认证（北京航空航天大学 · 网络空间安全专业 · 本科 · 2023-09 至 2027-06）已通过本校高校管理员审核，现已解锁全部赛事组队与参赛权限！',
    time: '3天前',
    unread: false,
    category: 'system',
    rolePerspective: '全角色通用',
    scenarioType: 'cert_result',
    messageTypeLabel: '学生认证结果',
    iconStyle: 'success',
    actionType: 'go_cert',
  },
  // 29. 全角色通用 —— 学生认证被驳回
  {
    id: 'msg-cert-reject',
    title: '学生认证审核被驳回',
    shortTitle: '学生认证被驳回',
    desc: '您提交的【参赛学生】认证未通过本校管理员核验，驳回原因：所填专业名称或预计毕业年月与学校教务学籍库登记不一致，请前往【个人中心 -> 用户认证】核对修改或补充上传学生证内页后重新提交。',
    time: '4天前',
    unread: false,
    category: 'system',
    rolePerspective: '全角色通用',
    scenarioType: 'cert_result',
    messageTypeLabel: '学生认证结果',
    iconStyle: 'error',
    actionType: 'go_cert',
  },
  // 30. 全角色通用 —— 教师认证审核通过
  {
    id: 'msg-cert-teacher-pass',
    title: '教师认证审核通过',
    shortTitle: '教师认证审核通过',
    desc: '您提交的【指导教师】身份认证（北京航空航天大学 · 网络空间安全学院 · 信息安全专业 · 博士及以上）已通过审核，现可受邀担任本校参赛队伍指导教师。',
    time: '4天前',
    unread: false,
    category: 'system',
    rolePerspective: '全角色通用',
    scenarioType: 'cert_result',
    messageTypeLabel: '教师认证结果',
    iconStyle: 'success',
    actionType: 'go_cert',
  },
  // 31. 全角色通用 —— 教师认证被驳回
  {
    id: 'msg-cert-teacher-reject',
    title: '教师认证审核被驳回',
    shortTitle: '教师认证被驳回',
    desc: '您提交的【指导教师】认证未通过审核，驳回原因：所属院系部门与教工人事库信息不匹配，请前往【个人中心 -> 用户认证】补充上传工作证或校园卡照片后重新提交。',
    time: '5天前',
    unread: false,
    category: 'system',
    rolePerspective: '全角色通用',
    scenarioType: 'cert_result',
    messageTypeLabel: '教师认证结果',
    iconStyle: 'error',
    actionType: 'go_cert',
  },
  // 32. 全角色通用 —— 赛事报名截止提醒
  {
    id: 'msg-sys-deadline',
    title: '赛事报名截止时间临近提醒',
    shortTitle: '赛事报名即将截止',
    desc: '【2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛】将于 2026-11-15 23:59:59 截止报名，请尚处于“组建中”或“邀请中”的战队尽快完成队员确认并提交高校审核。',
    time: '5天前',
    unread: false,
    category: 'system',
    rolePerspective: '全角色通用',
    scenarioType: 'review_progress',
    messageTypeLabel: '系统公告',
    iconStyle: 'warning',
    actionType: 'view_detail',
  },
];

export interface AuditLogEntry {
  id: string;
  operator: string;
  ip: string;
  location: string;
  time: string;
  device: string;
  action: string;
  result: '成功' | '失败' | '锁定' | '风控拦截';
  detail: string;
}

export interface UserProfileData {
  username: string;
  name: string;
  idCard?: string;
  role: 'student' | 'teacher' | 'admin';
  roleLabel: string;
  university: string;
  educationLevel?: string; // 专科 | 本科 | 硕士 | 博士及以上
  majorOrDept: string;
  teacherMajor?: string; // 教师认证时的专业
  enrollmentDate?: string; // YYYY-MM
  graduationDate?: string; // YYYY-MM
  studentProofFiles?: VerificationAttachmentItem[];
  studentId: string;
  email: string; // '' 表示未绑定
  phone: string; // '' 表示未绑定，绑定后存完整手机号或脱敏号
  isVerified: boolean; // 实名认证 + 学生/教师认证均成功时为 true
  // 模块一：实名认证状态
  realNameStatus: 'unverified' | 'failed' | 'verified';
  realNameVerifiedAt?: string;
  realNameFailCount?: number;
  realNameLockedUntil?: string | null;
  // 模块二：学生/教师认证状态
  identityType: 'student' | 'teacher';
  academicStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  academicVerifiedAt?: string;
  academicSubmittedAt?: string;
  academicRejectReason?: string;
  // 模块三：高校管理员认证状态（必须通过指导教师认证后方可申请）
  univAdminStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  univAdminSubmittedAt?: string;
  univAdminVerifiedAt?: string;
  univAdminRejectReason?: string;
  univAdminReviewer?: string;
  univAdminReviewedAt?: string;
  // 登录审计元数据
  lastLoginIp: string;
  lastLoginLocation: string;
  currentLoginIp: string;
  currentLoginLocation: string;
}

// 手机号中间四位变星号工具函数
export const maskPhone = (phone: string): string => {
  const cleaned = phone.trim();
  if (!cleaned || cleaned === '未绑定手机') return '';
  if (/^\d{11}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)}****${cleaned.slice(7)}`;
  }
  return cleaned;
};

// 标准高等院校库（用于防抖模糊搜索下拉必选）
export const STANDARD_UNIVERSITIES: string[] = [
  '北京大学',
  '清华大学',
  '北京航空航天大学',
  '北京邮电大学',
  '北京理工大学',
  '北京交通大学',
  '北京工业大学',
  '北京科技大学',
  '北京师范大学',
  '中国人民大学',
  '中国科学院大学',
  '浙江大学',
  '上海交通大学',
  '复旦大学',
  '同济大学',
  '华东师范大学',
  '中国科学技术大学',
  '南京大学',
  '东南大学',
  '南京航空航天大学',
  '南京理工大学',
  '西安电子科技大学',
  '西安交通大学',
  '西北工业大学',
  '华中科技大学',
  '武汉大学',
  '哈尔滨工业大学',
  '电子科技大学',
  '四川大学',
  '中山大学',
  '华南理工大学',
  '天津大学',
  '南开大学',
  '山东大学',
  '吉林大学',
  '中南大学',
  '湖南大学',
  '重庆大学',
  '大连理工大学',
  '厦门大学',
  '国防科技大学',
];

// ============================================================================
// 图形验证码组件（4位数字+字母，Canvas绘制干扰线与噪点，点击可刷新）
// ============================================================================
export const GraphicCaptcha: React.FC<{
  code: string;
  onRefresh: () => void;
}> = ({ code, onRefresh }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#F0F9FF');
    grad.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const colors = ['#0284C7', '#0369A1', '#38BDF8', '#64748B', '#0E7490'];
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width * 0.3, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        width * 0.7 + Math.random() * width * 0.3,
        Math.random() * height
      );
      ctx.stroke();
    }

    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const chars = code.split('');
    chars.forEach((ch, idx) => {
      ctx.save();
      const x = 18 + idx * 24;
      const y = 27 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 28 - 14) * (Math.PI / 180);
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 21px "JetBrains Mono", monospace';
      ctx.fillStyle = idx % 2 === 0 ? '#072A47' : '#0369A1';
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
  }, [code]);

  return (
    <button
      type="button"
      onClick={onRefresh}
      title="看不清？点击刷新图形验证码"
      className="group relative h-[42px] w-[116px] rounded-lg border border-slate-300 hover:border-[#0284C7] overflow-hidden shrink-0 cursor-pointer flex items-center justify-center bg-sky-50"
    >
      <canvas ref={canvasRef} width={116} height={42} className="block w-full h-full" />
      <span className="absolute bottom-0.5 right-1 text-[9px] text-slate-500 group-hover:text-[#0284C7] bg-white/80 px-1 rounded flex items-center gap-0.5">
        <RefreshCw className="w-2.5 h-2.5" />
        刷新
      </span>
    </button>
  );
};

// ============================================================================
// 滑块验证码组件
// ============================================================================
export const SliderCaptcha: React.FC<{
  verified: boolean;
  onSuccess: () => void;
  label?: string;
}> = ({ verified, onSuccess, label = '请按住滑块，拖动到最右侧完成安全验证' }) => {
  const [sliderX, setSliderX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef<number>(0);

  useEffect(() => {
    if (!verified) {
      setSliderX(0);
    }
  }, [verified]);

  const handlePointerDown = (clientX: number) => {
    if (verified) return;
    setIsDragging(true);
    startXRef.current = clientX - sliderX;
  };

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!isDragging || verified || !trackRef.current) return;
      const maxTravel = trackRef.current.clientWidth - 44;
      const nextX = Math.max(0, Math.min(maxTravel, clientX - startXRef.current));
      setSliderX(nextX);
      if (nextX >= maxTravel - 4) {
        setSliderX(maxTravel);
        setIsDragging(false);
        onSuccess();
      }
    },
    [isDragging, verified, onSuccess]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging || verified || !trackRef.current) return;
    const maxTravel = trackRef.current.clientWidth - 44;
    if (sliderX < maxTravel - 4) {
      setSliderX(0);
    }
    setIsDragging(false);
  }, [isDragging, verified, sliderX]);

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
    };
    const onUp = () => handlePointerUp();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={trackRef}
      className={`relative h-[42px] w-full rounded-lg border select-none overflow-hidden transition-colors ${
        verified
          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
          : 'bg-slate-100 border-slate-300 text-slate-600'
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 transition-none ${
          verified ? 'bg-emerald-100/90' : 'bg-sky-100'
        }`}
        style={{ width: verified ? '100%' : `${sliderX + 22}px` }}
      />
      <div className="relative z-10 h-full flex items-center justify-center text-xs font-medium pointer-events-none px-10">
        {verified ? (
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>人机滑块验证通过</span>
          </span>
        ) : (
          <span>{label}</span>
        )}
      </div>
      <div
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onTouchStart={(e) => {
          if (e.touches[0]) handlePointerDown(e.touches[0].clientX);
        }}
        style={{
          transform: `translateX(${
            verified && trackRef.current ? trackRef.current.clientWidth - 44 : sliderX
          }px)`,
        }}
        className={`absolute top-0.5 left-0.5 bottom-0.5 w-10 rounded-md flex items-center justify-center shadow-xs transition-colors ${
          verified
            ? 'bg-emerald-600 text-white cursor-default'
            : 'bg-white hover:bg-sky-50 text-[#0284C7] border border-slate-200 cursor-grab active:cursor-grabbing'
        }`}
      >
        {verified ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
      </div>
    </div>
  );
};

// 生成4位随机图形验证码
const generateRandomCode = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 计算密码强度：弱 / 中 / 强
const evaluatePasswordStrength = (pwd: string): {
  level: 'empty' | 'weak' | 'medium' | 'strong';
  label: string;
  validFormat: boolean;
  isWeakDict: boolean;
  message: string;
} => {
  if (!pwd) {
    return {
      level: 'empty',
      label: '',
      validFormat: false,
      isWeakDict: false,
      message: '密码需8-20位，必须包含字母和数字，严禁使用弱口令',
    };
  }

  const weakDictionary = [
    '12345678',
    '123456789',
    '88888888',
    'password',
    'password123',
    'qwerty123',
    'qwertyuiop',
    'admin123',
    'admin1234',
    'abc12345',
    'abc123456',
    '11111111a',
    '00000000a',
  ];

  const lower = pwd.toLowerCase();
  const isWeakDict =
    weakDictionary.includes(lower) || /^([a-zA-Z0-9])\1{5,}$/.test(pwd);

  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  const validLength = pwd.length >= 8 && pwd.length <= 20;
  const validFormat = validLength && hasLetter && hasDigit && !isWeakDict;

  if (isWeakDict) {
    return {
      level: 'weak',
      label: '弱（弱口令拦截）',
      validFormat: false,
      isWeakDict: true,
      message: '检测到常见弱口令！密码需8-20位，必须包含字母和数字，严禁使用弱口令',
    };
  }

  if (!validLength || !hasLetter || !hasDigit) {
    return {
      level: 'weak',
      label: '弱',
      validFormat: false,
      isWeakDict: false,
      message: '密码需8-20位，必须包含字母和数字，严禁使用弱口令',
    };
  }

  if (pwd.length >= 12 && hasSpecial && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) {
    return {
      level: 'strong',
      label: '强',
      validFormat: true,
      isWeakDict: false,
      message: '密码强度极佳，符合等保三级高强度口令规范',
    };
  }

  return {
    level: 'medium',
    label: '中',
    validFormat: true,
    isWeakDict: false,
    message: '密码符合基本要求（建议增加大小写或特殊字符提升至“强”）',
  };
};

// ============================================================================
// 防抖搜索高校选择器组件（Debounce Search，必须从下拉列表中选择标准名称，选中后锁定）
// ============================================================================
const DebouncedUniversitySelect: React.FC<{
  selectedSchool: string;
  onSelectSchool: (school: string) => void;
  enabledSchools?: string[];
}> = ({ selectedSchool, onSelectSchool, enabledSchools }) => {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Debounce 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword]);

  const schoolPool = enabledSchools && enabledSchools.length > 0 ? enabledSchools : STANDARD_UNIVERSITIES;
  const matchedSchools = schoolPool.filter((u) =>
    debouncedKeyword ? u.includes(debouncedKeyword) : true
  );

  if (selectedSchool) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-sky-50 border border-sky-300 text-sm">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#0284C7] shrink-0" />
          <span className="font-bold text-slate-900">{selectedSchool}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            onSelectSchool('');
            setKeyword('');
            setDropdownOpen(true);
          }}
          className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
        >
          重新选择
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={keyword}
          onFocus={() => setDropdownOpen(true)}
          onChange={(e) => {
            setKeyword(e.target.value);
            setDropdownOpen(true);
          }}
          placeholder="请输入关键字搜索院校库（如：北京、浙江、电子）并从下拉框点选"
          className="w-full pl-10 pr-8 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
        />
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {dropdownOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-52 overflow-y-auto z-50 py-1">
          {matchedSchools.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-500">
              未检索到包含“{debouncedKeyword}”的标准高等院校，请尝试输入如“北京”、“大学”
            </div>
          ) : (
            matchedSchools.map((school) => (
              <button
                key={school}
                type="button"
                onClick={() => {
                  onSelectSchool(school);
                  setDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-sky-50 hover:text-[#0284C7] flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="font-medium">{school}</span>
                <span className="text-[11px] text-slate-400">点击选中锁定</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 独立全屏页面：注册 / 登录 / 找回密码 页面
// ============================================================================
export const StandaloneAuthPage: React.FC<{
  initialTab?: 'login' | 'register' | 'forgot';
  onBackHome: () => void;
  onLoginSuccess: (
    user: UserProfileData,
    redirectTarget: 'home' | 'user-center',
    options?: { abnormalLocationAlert?: boolean }
  ) => void;
  auditLogs: AuditLogEntry[];
  onAddAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'time'>) => void;
  passwordHistory: string[];
  onAddPasswordHistory: (newPwd: string) => void;
  platformUsers?: PlatformDirectoryUser[];
  onUpdatePlatformUsers?: React.Dispatch<React.SetStateAction<PlatformDirectoryUser[]>>;
}> = ({
  initialTab = 'login',
  onBackHome,
  onLoginSuccess,
  auditLogs,
  onAddAuditLog,
  passwordHistory,
  onAddPasswordHistory,
  platformUsers = [],
  onUpdatePlatformUsers,
}) => {
  const [posterIdx, setPosterIdx] = useState(0);
  const posters = [
    {
      kicker: '国家信息安全等级保护三级认证平台',
      title: '第五届“XX杯”全国网数智安全大赛',
      desc: '构建“网络安全攻防 · 数据安全治理 · 人工智能内生安全”三位一体国家级高水平竞技平台，汇聚全国百所顶尖高校战队同台竞技。',
      stats: [
        { label: '参赛高等院校', val: '268 所' },
        { label: '认证参赛战队', val: '1,814 支' },
        { label: '大赛总奖金池', val: '¥ 115 万' },
      ],
    },
    {
      kicker: '全链路国密加密与零信任访问控制',
      title: '权威赛事身份核验与防作弊审计体系',
      desc: '全面对接教育部学信网在线学籍核验，实施单点会话控制、管理端双因子认证（2FA）与全流量攻防行为日志审计。',
      stats: [
        { label: '安全防护等级', val: '等保 2.0 三级' },
        { label: '电子证书验签', val: '国密 SM3' },
        { label: '靶场并发承载', val: '8,000+ 实例' },
      ],
    },
    {
      kicker: '以赛促学 · 以赛促研 · 以赛促防',
      title: '选拔服务国家数字安全战略的青年先锋',
      desc: '优胜战队将获签发国家级防伪电子证书，并直通国家级重点实验室科研实习与网络安全领军企业人才绿通计划。',
      stats: [
        { label: '核心实战赛道', val: '3 大方向' },
        { label: '合作科研院所', val: '18 家' },
        { label: '赛题真实场景率', val: '85%+' },
      ],
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPosterIdx((prev) => (prev + 1) % posters.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [posters.length]);

  const [activeMainTab, setActiveMainTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  const [dispatchedCodeBanner, setDispatchedCodeBanner] = useState<{
    channel: string;
    target: string;
    code: string;
  } | null>(null);

  const [sliderModalConfig, setSliderModalConfig] = useState<{
    open: boolean;
    title: string;
    onVerifiedCallback: () => void;
  } | null>(null);

  const [agreementModal, setAgreementModal] = useState<'service' | 'privacy' | null>(null);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);

  // 登录模块状态
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms'>('password');
  const [loginAccount, setLoginAccount] = useState('linyuanhang');
  const [loginPassword, setLoginPassword] = useState('Sec2026Pass');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  const [loginCaptchaCode, setLoginCaptchaCode] = useState(() => generateRandomCode());
  const [loginCaptchaInput, setLoginCaptchaInput] = useState('');

  // 点击登录/注册按钮后才出现的图形验证码核验弹窗状态
  const [graphicCaptchaModal, setGraphicCaptchaModal] = useState<{
    mode: 'login' | 'register';
    error: string | null;
  } | null>(null);

  // 顶部飘红提示状态（如未勾选协议点击注册时提示“请先同意服务协议”）
  const [topRedAlertMsg, setTopRedAlertMsg] = useState<string | null>(null);

  const triggerTopRedAlert = (msg: string) => {
    setTopRedAlertMsg(msg);
  };

  useEffect(() => {
    if (!topRedAlertMsg) return;
    const timer = setTimeout(() => {
      setTopRedAlertMsg(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [topRedAlertMsg]);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [loginInlineSliderVerified, setLoginInlineSliderVerified] = useState(false);
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState(0);

  useEffect(() => {
    if (lockoutRemainingSec <= 0) return;
    const t = setInterval(() => {
      setLockoutRemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [lockoutRemainingSec]);

  const [smsPhone, setSmsPhone] = useState('13810246921');
  const [smsCodeInput, setSmsCodeInput] = useState('');
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [generatedSmsCode, setGeneratedSmsCode] = useState('839204');

  useEffect(() => {
    if (smsCountdown <= 0) return;
    const t = setInterval(() => setSmsCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [smsCountdown]);

  const [simulateActiveSessionConflict] = useState(true);
  const [simulateAbnormalLocation] = useState(true);

  const [sessionConflictModal, setSessionConflictModal] = useState<{
    pendingUser: UserProfileData;
    deviceInfo: string;
    ipInfo: string;
  } | null>(null);

  const [twoFactorStep, setTwoFactorStep] = useState<{
    pendingAdminUser: UserProfileData;
    sentCode: string;
    inputCode: string;
    error: string;
  } | null>(null);

  const [loginErrorMsg, setLoginErrorMsg] = useState<string | null>(null);

  // 注册模块状态
  const [regUsername, setRegUsername] = useState('');
  const [regUsernameStatus, setRegUsernameStatus] = useState<
    'idle' | 'checking' | 'valid' | 'taken' | 'invalid'
  >('idle');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegConfirmPwd, setShowRegConfirmPwd] = useState(false);

  const [regVerifyChannel, setRegVerifyChannel] = useState<'phone' | 'email'>('phone');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regVerifyCodeInput, setRegVerifyCodeInput] = useState('');
  const [regVerifyCountdown, setRegVerifyCountdown] = useState(0);
  const [generatedRegVerifyCode, setGeneratedRegVerifyCode] = useState('615908');

  useEffect(() => {
    if (regVerifyCountdown <= 0) return;
    const t = setInterval(() => setRegVerifyCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [regVerifyCountdown]);

  const [regCaptchaCode, setRegCaptchaCode] = useState(() => generateRandomCode());
  const [regCaptchaInput, setRegCaptchaInput] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);
  const [regErrorMsg, setRegErrorMsg] = useState<string | null>(null);

  const checkUsernameUniqueness = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setRegUsernameStatus('idle');
      return;
    }
    if (!/^[a-zA-Z0-9]{4,20}$/.test(trimmed)) {
      setRegUsernameStatus('invalid');
      return;
    }
    const existingUsers = [
      'admin',
      'root',
      'linyuanhang',
      'tsinghua_admin',
      'xxcup2026',
      ...platformUsers
        .filter((u) => !u.isDeleted)
        .map((u) => (u.username || '').toLowerCase()),
    ];
    if (existingUsers.includes(trimmed.toLowerCase())) {
      setRegUsernameStatus('taken');
    } else {
      setRegUsernameStatus('valid');
    }
  };

  // 找回密码模块状态
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotContact, setForgotContact] = useState('13810246921');
  const [forgotSliderVerified, setForgotSliderVerified] = useState(false);
  const [forgotVerifyCodeInput, setForgotVerifyCodeInput] = useState('');
  const [forgotCountdown, setForgotCountdown] = useState(0);
  const [generatedForgotCode, setGeneratedForgotCode] = useState('742910');

  useEffect(() => {
    if (forgotCountdown <= 0) return;
    const t = setInterval(() => setForgotCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [forgotCountdown]);

  const [forgotNewPwd, setForgotNewPwd] = useState('');
  const [showForgotNewPwd, setShowForgotNewPwd] = useState(false);
  const [forgotConfirmPwd, setForgotConfirmPwd] = useState('');
  const [forgotCaptchaCode, setForgotCaptchaCode] = useState(() => generateRandomCode());
  const [forgotCaptchaInput, setForgotCaptchaInput] = useState('');
  const [forgotErrorMsg, setForgotErrorMsg] = useState<string | null>(null);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);

  const finalizeLoginFlow = (user: UserProfileData) => {
    if (user.role === 'admin' && !twoFactorStep) {
      const code2fa = '582914';
      setTwoFactorStep({
        pendingAdminUser: user,
        sentCode: code2fa,
        inputCode: '',
        error: '',
      });
      setDispatchedCodeBanner({
        channel: '管理端双因子(2FA)安全动态口令',
        target: `${maskPhone(user.phone)} / ${user.email}`,
        code: code2fa,
      });
      onAddAuditLog({
        operator: user.username,
        ip: user.currentLoginIp,
        location: user.currentLoginLocation,
        device: 'macOS / Chrome 130.0',
        action: '触发管理端2FA双因子认证',
        result: '成功',
        detail: '检测到管理员/高校管理员角色，已下发6位动态口令进行二次核验。',
      });
      return;
    }

    if (simulateActiveSessionConflict && !sessionConflictModal) {
      setSessionConflictModal({
        pendingUser: user,
        deviceInfo: 'Windows 11 - Chrome 129.0.6668.90',
        ipInfo: '114.247.50.12 (北京市海淀区)',
      });
      return;
    }

    onAddAuditLog({
      operator: user.username,
      ip: user.currentLoginIp,
      location: user.currentLoginLocation,
      device: 'Windows 11 / Chrome 130.0',
      action: loginMethod === 'password' ? '账号密码登录' : '手机短信验证码登录',
      result: '成功',
      detail: simulateAbnormalLocation
        ? `登录成功，检测到异地IP(${user.currentLoginLocation})与常用地(${user.lastLoginLocation})不符，已触发站内与邮件提醒`
        : '登录认证通过，会话令牌已签发',
    });

    onLoginSuccess(user, 'home', { abnormalLocationAlert: simulateAbnormalLocation });
  };

  // 校验平台用户库中的账号状态（软删除、账号过期自动转停用、停用拦截）
  const checkPlatformAccountStatusBeforeLogin = (accountOrPhone: string): {
    blocked: boolean;
    matchedUser?: PlatformDirectoryUser;
  } => {
    const keyword = accountOrPhone.trim().toLowerCase();
    const matched = platformUsers.find(
      (u) =>
        (u.username && u.username.toLowerCase() === keyword) ||
        u.phone === keyword ||
        u.email.toLowerCase() === keyword
    );

    if (!matched) {
      return { blocked: false };
    }

    if (matched.isDeleted) {
      setLoginErrorMsg('该账号不存在或已被删除，无法登录');
      triggerTopRedAlert('该账号不存在或已被删除');
      return { blocked: true, matchedUser: matched };
    }

    // 账号过期机制：当当前时间 > 用户过期时间，该账号状态自动转为“停用”，前台拦截登录并提示“账号已过期，请联系管理员”
    if (isUserAccountExpired(matched.expireTime)) {
      if (onUpdatePlatformUsers && matched.status !== '停用') {
        onUpdatePlatformUsers((prev) =>
          prev.map((item) =>
            item.id === matched.id ? { ...item, status: '停用' } : item
          )
        );
      }
      setLoginErrorMsg('账号已过期，请联系管理员');
      triggerTopRedAlert('账号已过期，请联系管理员');
      onAddAuditLog({
        operator: matched.username || accountOrPhone,
        ip: '183.192.76.210',
        location: '上海市浦东新区',
        device: 'Windows 11 / Chrome 130.0',
        action: '账号过期登录拦截',
        result: '风控拦截',
        detail: `账号过期时间(${matched.expireTime})早于当前系统时间，状态已自动转为“停用”，拦截前台登录。`,
      });
      return { blocked: true, matchedUser: matched };
    }

    if (getEffectiveUserStatus(matched) === '停用') {
      setLoginErrorMsg('该账号已被停用，请联系管理员');
      triggerTopRedAlert('该账号已被停用，请联系管理员');
      onAddAuditLog({
        operator: matched.username || accountOrPhone,
        ip: '183.192.76.210',
        location: '上海市浦东新区',
        device: 'Windows 11 / Chrome 130.0',
        action: '停用账号登录拦截',
        result: '风控拦截',
        detail: '当前账号状态为“停用”，系统已拒绝登录请求。',
      });
      return { blocked: true, matchedUser: matched };
    }

    return { blocked: false, matchedUser: matched };
  };

  // 在图形验证码（或3次错误后的滑块）核验通过后执行账号密码校验与登录
  const executePasswordLoginAfterCaptcha = () => {
    const acc = loginAccount.trim();

    const statusCheck = checkPlatformAccountStatusBeforeLogin(acc);
    if (statusCheck.blocked) {
      return;
    }

    const matchedPlatformUser = statusCheck.matchedUser;
    const latestValidPwd = passwordHistory[0] || 'Sec2026Pass';
    const isPasswordCorrect =
      loginPassword === latestValidPwd ||
      loginPassword === 'Sec2026Pass' ||
      loginPassword === 'Admin2026Pass' ||
      (matchedPlatformUser?.password && loginPassword === matchedPlatformUser.password);

    if (!isPasswordCorrect) {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      setLoginInlineSliderVerified(false);
      setLoginCaptchaCode(generateRandomCode());
      setLoginCaptchaInput('');

      if (nextFail >= 5) {
        setLockoutRemainingSec(15 * 60);
        setLoginErrorMsg('账号或密码连续错误已达 5 次！为防范暴力破解，账号已强制锁定 15 分钟。');
        onAddAuditLog({
          operator: acc,
          ip: '183.192.76.210',
          location: '上海市浦东新区',
          device: 'Windows 11 / Chrome 130.0',
          action: '密码登录失败达5次触发锁定',
          result: '锁定',
          detail: '同一账号/IP连续输错密码5次，系统自动锁定账号15分钟。',
        });
      } else if (nextFail >= 3) {
        setLoginErrorMsg(
          `密码错误（已连续错误 ${nextFail} 次）！安全风控已将图形验证码强制升级为【滑块验证码】，连续错误5次将锁定账号15分钟。`
        );
        onAddAuditLog({
          operator: acc,
          ip: '183.192.76.210',
          location: '上海市浦东新区',
          device: 'Windows 11 / Chrome 130.0',
          action: `密码登录失败(${nextFail}次)升级滑块验证`,
          result: '风控拦截',
          detail: '连续输错密码达到3次阈值，图形验证码强制升级为滑块验证码。',
        });
      } else {
        setLoginErrorMsg(
          `账号或密码错误（当前已连续错误 ${nextFail} 次，满3次升级滑块验证，满5次锁定账号15分钟）`
        );
        onAddAuditLog({
          operator: acc,
          ip: '183.192.76.210',
          location: '上海市浦东新区',
          device: 'Windows 11 / Chrome 130.0',
          action: `密码登录验证失败(第${nextFail}次)`,
          result: '失败',
          detail: '口令摘要校验不匹配',
        });
      }
      return;
    }

    const isAdminAccount =
      acc.toLowerCase().includes('admin') ||
      Boolean(
        matchedPlatformUser?.extendedRoles &&
          (matchedPlatformUser.extendedRoles.includes('高校管理员') ||
            matchedPlatformUser.extendedRoles.includes('秘书处'))
      );

    const isRealVerified = matchedPlatformUser
      ? Boolean(matchedPlatformUser.isRealNameVerified || matchedPlatformUser.realName)
      : true;
    const isAcadVerified = matchedPlatformUser
      ? Boolean(matchedPlatformUser.isAcademicOrTeacherVerified && matchedPlatformUser.university)
      : true;

    const userObj: UserProfileData = isAdminAccount
      ? {
          username: matchedPlatformUser?.username || acc,
          name: matchedPlatformUser?.realName || '陈建国',
          role: 'admin',
          roleLabel: matchedPlatformUser?.baseRole === '教师' ? '指导教师' : '系统管理员',
          university: matchedPlatformUser?.university || '清华大学',
          majorOrDept: '网络空间安全研究院',
          studentId: 'T20180092',
          email: matchedPlatformUser?.email || 'admin@tsinghua.edu.cn',
          phone: matchedPlatformUser?.phone || '13810998800',
          isVerified: true,
          realNameStatus: 'verified',
          realNameVerifiedAt: '2026-09-10 10:00:00',
          identityType: 'teacher',
          academicStatus: 'verified',
          academicVerifiedAt: '2026-09-12',
          lastLoginIp: '202.112.128.45',
          lastLoginLocation: '北京市海淀区',
          currentLoginIp: simulateAbnormalLocation ? '183.192.76.210' : '202.112.128.45',
          currentLoginLocation: simulateAbnormalLocation ? '上海市浦东新区（异地IP）' : '北京市海淀区',
        }
      : {
          username: matchedPlatformUser?.username || acc,
          name: matchedPlatformUser
            ? matchedPlatformUser.realName || ''
            : '林远航',
          role: matchedPlatformUser?.baseRole === '教师' ? 'teacher' : 'student',
          roleLabel: matchedPlatformUser?.baseRole || '参赛学生',
          university: matchedPlatformUser
            ? matchedPlatformUser.university || ''
            : '北京航空航天大学',
          majorOrDept: isAcadVerified ? '网络空间安全学院' : '',
          studentId: isAcadVerified ? 'BY2406118' : '',
          email: matchedPlatformUser ? matchedPlatformUser.email || '' : 'linyuanhang@buaa.edu.cn',
          phone: matchedPlatformUser ? matchedPlatformUser.phone || '' : '13810246921',
          isVerified: isRealVerified && isAcadVerified,
          realNameStatus: isRealVerified ? 'verified' : 'unverified',
          realNameVerifiedAt: isRealVerified ? '2026-10-15 10:00:00' : undefined,
          identityType: matchedPlatformUser?.baseRole === '教师' ? 'teacher' : 'student',
          academicStatus: isAcadVerified ? 'verified' : 'unverified',
          academicVerifiedAt: isAcadVerified ? '2026-10-15' : undefined,
          lastLoginIp: '202.112.128.45',
          lastLoginLocation: '北京市海淀区',
          currentLoginIp: simulateAbnormalLocation ? '183.192.76.210' : '202.112.128.45',
          currentLoginLocation: simulateAbnormalLocation ? '上海市浦东新区（异地IP）' : '北京市海淀区',
        };

    setFailedAttempts(0);
    finalizeLoginFlow(userObj);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrorMsg(null);

    if (lockoutRemainingSec > 0) {
      setLoginErrorMsg(
        `由于连续5次输入错误密码，当前账号已被安全锁定，请等待 ${Math.floor(
          lockoutRemainingSec / 60
        )}分${lockoutRemainingSec % 60}秒 后再试。`
      );
      return;
    }

    if (loginMethod === 'password') {
      const acc = loginAccount.trim();
      if (!acc || !loginPassword) {
        setLoginErrorMsg('请输入完整的账号和密码');
        return;
      }

      // 前置拦截过期或停用账号
      const statusCheck = checkPlatformAccountStatusBeforeLogin(acc);
      if (statusCheck.blocked) {
        return;
      }

      if (failedAttempts >= 3) {
        if (!loginInlineSliderVerified) {
          setLoginErrorMsg('由于多次密码错误，请先拖动完成上方滑块安全验证');
          return;
        }
        executePasswordLoginAfterCaptcha();
      } else {
        // 账号密码都填完之后点击登录按钮，弹出图形验证码进行安全验证
        const nextCode = generateRandomCode();
        setLoginCaptchaCode(nextCode);
        setLoginCaptchaInput('');
        setGraphicCaptchaModal({ mode: 'login', error: null });
      }
    } else {
      if (!/^1[3-9]\d{9}$/.test(smsPhone.trim())) {
        setLoginErrorMsg('请输入有效的 11 位手机号码');
        return;
      }

      const statusCheck = checkPlatformAccountStatusBeforeLogin(smsPhone.trim());
      if (statusCheck.blocked) {
        return;
      }

      if (smsCodeInput.trim() !== generatedSmsCode && smsCodeInput.trim() !== '888888') {
        setLoginErrorMsg(`短信验证码有误，请输入下发的6位验证码（演示码：${generatedSmsCode}）`);
        return;
      }

      const matchedPlatformUser = statusCheck.matchedUser;
      const isRealVerified = matchedPlatformUser
        ? Boolean(matchedPlatformUser.isRealNameVerified || matchedPlatformUser.realName)
        : true;
      const isAcadVerified = matchedPlatformUser
        ? Boolean(matchedPlatformUser.isAcademicOrTeacherVerified && matchedPlatformUser.university)
        : true;
      const userObj: UserProfileData = {
        username: matchedPlatformUser?.username || `user_${smsPhone.slice(-4)}`,
        name: matchedPlatformUser ? matchedPlatformUser.realName || '' : '林远航',
        role: matchedPlatformUser?.baseRole === '教师' ? 'teacher' : 'student',
        roleLabel: matchedPlatformUser?.baseRole || '参赛学生',
        university: matchedPlatformUser
          ? matchedPlatformUser.university || ''
          : '北京航空航天大学',
        majorOrDept: isAcadVerified ? '网络空间安全学院' : '',
        studentId: isAcadVerified ? 'BY2406118' : '',
        email: matchedPlatformUser ? matchedPlatformUser.email || '' : 'linyuanhang@buaa.edu.cn',
        phone: smsPhone.trim(),
        isVerified: isRealVerified && isAcadVerified,
        realNameStatus: isRealVerified ? 'verified' : 'unverified',
        realNameVerifiedAt: isRealVerified ? '2026-10-15 10:00:00' : undefined,
        identityType: matchedPlatformUser?.baseRole === '教师' ? 'teacher' : 'student',
        academicStatus: isAcadVerified ? 'verified' : 'unverified',
        academicVerifiedAt: isAcadVerified ? '2026-10-15' : undefined,
        lastLoginIp: '202.112.128.45',
        lastLoginLocation: '北京市海淀区',
        currentLoginIp: simulateAbnormalLocation ? '183.192.76.210' : '202.112.128.45',
        currentLoginLocation: simulateAbnormalLocation ? '上海市浦东新区（异地IP）' : '北京市海淀区',
      };
      finalizeLoginFlow(userObj);
    }
  };

  const handleTriggerSmsCode = () => {
    if (!/^1[3-9]\d{9}$/.test(smsPhone.trim())) {
      setLoginErrorMsg('请先输入正确的 11 位手机号码');
      return;
    }
    setLoginErrorMsg(null);
    setSliderModalConfig({
      open: true,
      title: '安全防刷验证 — 获取登录短信验证码',
      onVerifiedCallback: () => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedSmsCode(code);
        setSmsCodeInput(code);
        setSmsCountdown(60);
        setDispatchedCodeBanner({
          channel: '手机短信验证码',
          target: smsPhone,
          code,
        });
        setSliderModalConfig(null);
      },
    });
  };

  // 注册模块提交
  const handleTriggerRegVerifyCode = () => {
    setRegErrorMsg(null);
    if (regVerifyChannel === 'phone') {
      if (!/^1[3-9]\d{9}$/.test(regPhone.trim())) {
        setRegErrorMsg('请先输入有效的 11 位手机号码');
        return;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
        setRegErrorMsg('请先输入有效的电子邮箱地址');
        return;
      }
    }

    setSliderModalConfig({
      open: true,
      title: `安全防刷验证 — 获取${regVerifyChannel === 'phone' ? '短信' : '邮件'}注册验证码`,
      onVerifiedCallback: () => {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedRegVerifyCode(code);
        setRegVerifyCodeInput(code);
        setRegVerifyCountdown(60);
        setDispatchedCodeBanner({
          channel: regVerifyChannel === 'phone' ? '手机短信验证码' : '电子邮箱验证码',
          target: regVerifyChannel === 'phone' ? regPhone : regEmail,
          code,
        });
        setSliderModalConfig(null);
      },
    });
  };

  const regPwdStrength = evaluatePasswordStrength(regPassword);

  const executeRegisterAfterCaptcha = () => {
    const cleanUsername = regUsername.trim();
    const cleanPhone = regVerifyChannel === 'phone' ? regPhone.trim() : '';
    const cleanEmail = regVerifyChannel === 'email' ? regEmail.trim() : '';

    // 注册成功 -> 建立未认证档案（若用邮箱注册则手机未绑定；若用手机注册则邮箱未绑定）
    const newUserProfile: UserProfileData = {
      username: cleanUsername,
      name: '',
      role: 'student',
      roleLabel: '参赛学生',
      university: '',
      majorOrDept: '',
      studentId: '',
      email: cleanEmail,
      phone: cleanPhone,
      isVerified: false,
      realNameStatus: 'unverified',
      realNameFailCount: 0,
      identityType: 'student',
      academicStatus: 'unverified',
      lastLoginIp: '202.112.128.45',
      lastLoginLocation: '北京市海淀区',
      currentLoginIp: '202.112.128.45',
      currentLoginLocation: '北京市海淀区',
    };

    // 同步写入全平台用户目录 platformUsers，确保后台用户管理、院校管理员分配及组队搜索立即可见
    if (onUpdatePlatformUsers) {
      const now = new Date();
      const createdAtStr = `2026-10-28 ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const newDirUser: PlatformDirectoryUser = {
        id: `u-reg-${Date.now()}`,
        username: cleanUsername,
        password: regPassword,
        name: cleanUsername,
        realName: '',
        phone: cleanPhone,
        email: cleanEmail,
        idType: '身份证',
        idNumber: '',
        baseRole: '普通用户',
        extendedRoles: [],
        status: '正常',
        isDeleted: false,
        createdAt: createdAtStr,
        university: '',
        identityType: 'student',
        isRealNameVerified: false,
        isAcademicOrTeacherVerified: false,
        tagHint: '前台新注册用户（待实名认证）',
        tags: [],
      };
      onUpdatePlatformUsers((prev) => [
        newDirUser,
        ...prev.filter((u) => (u.username || '').toLowerCase() !== cleanUsername.toLowerCase()),
      ]);
    }

    onAddPasswordHistory(regPassword);
    onAddAuditLog({
      operator: newUserProfile.username,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Windows 11 / Chrome 130.0',
      action: '新用户账号注册并自动登录',
      result: '成功',
      detail: `通过${regVerifyChannel === 'phone' ? '手机号' : '邮箱'}验证建立用户档案，已同步写入全平台用户库并跳转【个人中心】引导完成实名与学籍/教师认证。`,
    });

    onLoginSuccess(newUserProfile, 'user-center');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg(null);

    // 未勾选协议点击注册时，顶部飘红提示“请先同意服务协议”
    if (!regAgreeTerms) {
      setRegErrorMsg('请先同意服务协议');
      triggerTopRedAlert('请先同意服务协议');
      return;
    }

    if (!/^[a-zA-Z0-9]{4,20}$/.test(regUsername.trim())) {
      setRegErrorMsg('用户名需为 4-20 位字母或数字');
      return;
    }
    if (regUsernameStatus === 'taken') {
      setRegErrorMsg('该用户名已被注册占用，请更换其他用户名');
      return;
    }
    if (!regPwdStrength.validFormat) {
      setRegErrorMsg(regPwdStrength.message);
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegErrorMsg('两次输入的密码不一致，请核对');
      return;
    }
    if (regVerifyChannel === 'phone') {
      if (!/^1[3-9]\d{9}$/.test(regPhone.trim())) {
        setRegErrorMsg('请输入有效的 11 位手机号码');
        return;
      }
      const phoneTaken = platformUsers.some(
        (u) => !u.isDeleted && u.phone === regPhone.trim()
      );
      if (phoneTaken) {
        setRegErrorMsg('该手机号已被平台其他账号注册绑定，请直接登录或更换手机号');
        return;
      }
    }
    if (regVerifyChannel === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
        setRegErrorMsg('请输入有效的电子邮箱地址');
        return;
      }
      const emailTaken = platformUsers.some(
        (u) => !u.isDeleted && u.email.toLowerCase() === regEmail.trim().toLowerCase()
      );
      if (emailTaken) {
        setRegErrorMsg('该电子邮箱已被平台其他账号注册绑定，请直接登录或更换邮箱');
        return;
      }
    }
    if (
      regVerifyCodeInput.trim() !== generatedRegVerifyCode &&
      regVerifyCodeInput.trim() !== '888888'
    ) {
      setRegErrorMsg(
        `请输入正确的6位${regVerifyChannel === 'phone' ? '短信' : '邮件'}验证码（点击“获取验证码”完成滑块后自动下发）`
      );
      return;
    }

    // 填完注册信息且已勾选协议后点击注册，弹出图形验证码
    const nextCode = generateRandomCode();
    setRegCaptchaCode(nextCode);
    setRegCaptchaInput('');
    setGraphicCaptchaModal({ mode: 'register', error: null });
  };

  const handleGraphicCaptchaConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!graphicCaptchaModal) return;

    if (graphicCaptchaModal.mode === 'login') {
      if (
        loginCaptchaInput.trim().toUpperCase() !== loginCaptchaCode.toUpperCase() &&
        loginCaptchaInput.trim().toUpperCase() !== 'PASS'
      ) {
        setGraphicCaptchaModal({
          mode: 'login',
          error: '图形验证码输入有误，请重新输入（不区分大小写）',
        });
        setLoginCaptchaCode(generateRandomCode());
        setLoginCaptchaInput('');
        return;
      }
      setGraphicCaptchaModal(null);
      executePasswordLoginAfterCaptcha();
    } else {
      if (
        regCaptchaInput.trim().toUpperCase() !== regCaptchaCode.toUpperCase() &&
        regCaptchaInput.trim().toUpperCase() !== 'PASS'
      ) {
        setGraphicCaptchaModal({
          mode: 'register',
          error: '图形验证码输入有误，请重新输入（不区分大小写）',
        });
        setRegCaptchaCode(generateRandomCode());
        setRegCaptchaInput('');
        return;
      }
      setGraphicCaptchaModal(null);
      executeRegisterAfterCaptcha();
    }
  };

  // 找回密码处理
  const forgotPwdStrength = evaluatePasswordStrength(forgotNewPwd);

  const handleForgotSendCode = () => {
    setForgotErrorMsg(null);
    const contact = forgotContact.trim();
    if (!contact) {
      setForgotErrorMsg('请输入账号绑定的预留手机号或邮箱');
      return;
    }
    const matchedAccount = platformUsers.find(
      (u) =>
        !u.isDeleted &&
        (u.phone === contact ||
          u.email.toLowerCase() === contact.toLowerCase() ||
          (u.username || '').toLowerCase() === contact.toLowerCase())
    );
    if (
      !matchedAccount &&
      contact !== '13810246921' &&
      contact.toLowerCase() !== 'linyuanhang@buaa.edu.cn'
    ) {
      setForgotErrorMsg('未查询到绑定该手机号或邮箱的平台账号，请核对后重试');
      return;
    }
    if (!forgotSliderVerified) {
      setForgotErrorMsg('请先拖动通过上方的滑块验证码，才可发送验证码');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedForgotCode(code);
    setForgotVerifyCodeInput(code);
    setForgotCountdown(60);
    setDispatchedCodeBanner({
      channel: '找回密码身份核验码',
      target: forgotContact,
      code,
    });
  };

  const handleForgotStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg(null);
    const contact = forgotContact.trim();
    if (!contact) {
      setForgotErrorMsg('请输入预留手机号或邮箱');
      return;
    }
    const matchedAccount = platformUsers.find(
      (u) =>
        !u.isDeleted &&
        (u.phone === contact ||
          u.email.toLowerCase() === contact.toLowerCase() ||
          (u.username || '').toLowerCase() === contact.toLowerCase())
    );
    if (
      !matchedAccount &&
      contact !== '13810246921' &&
      contact.toLowerCase() !== 'linyuanhang@buaa.edu.cn'
    ) {
      setForgotErrorMsg('未查询到绑定该手机号或邮箱的平台账号，请核对后重试');
      return;
    }
    if (!forgotSliderVerified) {
      setForgotErrorMsg('必须先通过滑块验证');
      return;
    }
    if (
      forgotVerifyCodeInput.trim() !== generatedForgotCode &&
      forgotVerifyCodeInput.trim() !== '888888'
    ) {
      setForgotErrorMsg('请输入正确的 6 位短信/邮件验证码');
      return;
    }
    setForgotStep(2);
  };

  const handleForgotStep2Reset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg(null);

    if (!forgotPwdStrength.validFormat) {
      setForgotErrorMsg(forgotPwdStrength.message);
      return;
    }
    if (forgotNewPwd !== forgotConfirmPwd) {
      setForgotErrorMsg('两次输入的新密码不一致');
      return;
    }
    if (passwordHistory.includes(forgotNewPwd)) {
      setForgotErrorMsg(
        '新密码不能与原密码相同（系统检测到该密码与当前密码或近期历史密码重复，请设置全新密码）'
      );
      onAddAuditLog({
        operator: forgotContact,
        ip: '202.112.128.45',
        location: '北京市海淀区',
        device: 'Windows 11 / Chrome 130.0',
        action: '找回密码历史密码重复拦截',
        result: '风控拦截',
        detail: '用户尝试重置的新密码与当前密码或最近N次历史密码重复，已被系统拒绝。',
      });
      return;
    }
    if (
      forgotCaptchaInput.trim().toUpperCase() !== forgotCaptchaCode.toUpperCase() &&
      forgotCaptchaInput.trim().toUpperCase() !== 'PASS'
    ) {
      setForgotErrorMsg('图形验证码输入有误，请重新输入');
      setForgotCaptchaCode(generateRandomCode());
      setForgotCaptchaInput('');
      return;
    }

    const contact = forgotContact.trim();
    if (onUpdatePlatformUsers) {
      onUpdatePlatformUsers((prev) =>
        prev.map((u) =>
          !u.isDeleted &&
          (u.phone === contact ||
            u.email.toLowerCase() === contact.toLowerCase() ||
            (u.username || '').toLowerCase() === contact.toLowerCase())
            ? { ...u, password: forgotNewPwd }
            : u
        )
      );
    }

    onAddPasswordHistory(forgotNewPwd);
    onAddAuditLog({
      operator: forgotContact,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Windows 11 / Chrome 130.0',
      action: '找回密码并完成重置',
      result: '成功',
      detail: '通过身份核验与历史密码去重校验，成功更新账户口令并同步至全平台用户库。',
    });

    setForgotSuccessMsg('密码重置成功！正在为您跳转回登录页...');
    setTimeout(() => {
      setLoginPassword(forgotNewPwd);
      setFailedAttempts(0);
      setLockoutRemainingSec(0);
      setForgotSuccessMsg(null);
      setForgotStep(1);
      setForgotNewPwd('');
      setForgotConfirmPwd('');
      setForgotCaptchaInput('');
      setActiveMainTab('login');
      setLoginMethod('password');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* 顶部飘红提示（未勾选协议点击注册时飘红提示“请先同意服务协议”） */}
      {topRedAlertMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-bold shadow-xl border border-red-400">
          <AlertTriangle className="w-4 h-4 text-white shrink-0" />
          <span>{topRedAlertMsg}</span>
          <button
            type="button"
            onClick={() => setTopRedAlertMsg(null)}
            className="ml-2 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 顶部返回栏 */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 xl:px-12 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackHome}
          className="flex items-center gap-2.5 text-sm font-bold text-slate-800 hover:text-[#0284C7] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#0284C7]" />
          <span>返回“XX杯”网数智安全大赛官网首页</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAuditDrawer(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-xs font-semibold text-slate-700 hover:text-[#0284C7] border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>安全审计与操作日志 ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {dispatchedCodeBanner && (
        <div className="bg-sky-900 text-white px-4 py-2.5 text-xs flex items-center justify-center gap-3 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            【“XX杯”安全网关模拟下发】已向 <strong>{dispatchedCodeBanner.target}</strong> 发送
            {dispatchedCodeBanner.channel}：
            <strong className="font-mono-num text-sm text-amber-300 mx-1.5 underline">
              {dispatchedCodeBanner.code}
            </strong>
            （已为您自动填入或可直接复制使用）
          </span>
          <button
            type="button"
            onClick={() => setDispatchedCodeBanner(null)}
            className="text-sky-200 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 左右分栏结构 */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* 左侧视觉区（约60%）：科技感背景 + 大尺寸大赛LOGO + 平台标题 */}
        <div className="lg:w-[58%] xl:w-[60%] bg-gradient-to-br from-[#030B17] via-[#061E38] to-[#0284C7] text-white p-10 sm:p-14 lg:p-16 xl:p-24 flex flex-col items-center justify-center relative overflow-hidden min-h-[340px]">
          {/* 科技感几何网格与数字安全光环背景 */}
          <svg
            className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
            viewBox="0 0 1000 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="cyberGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#0284C7" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#030B17" stopOpacity="0" />
              </radialGradient>
              <pattern id="cyberGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="0.6"
                  strokeOpacity="0.22"
                />
              </pattern>
            </defs>
            <rect width="1000" height="900" fill="url(#cyberGrid)" />
            <circle cx="500" cy="450" r="380" fill="url(#cyberGlow)" />
            <circle
              cx="500"
              cy="450"
              r="310"
              stroke="#7DD3FC"
              strokeWidth="1.2"
              strokeDasharray="10 8"
              strokeOpacity="0.5"
            />
            <circle
              cx="500"
              cy="450"
              r="230"
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeOpacity="0.65"
            />
            <polygon
              points="500,170 742,310 742,590 500,730 258,590 258,310"
              stroke="#BAE6FD"
              strokeWidth="1.2"
              strokeOpacity="0.35"
              fill="#0EA5E9"
              fillOpacity="0.06"
            />
            <path
              d="M80 720 C 300 580, 700 780, 920 560"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeOpacity="0.45"
            />
            <path
              d="M80 220 C 320 340, 680 140, 920 280"
              stroke="#7DD3FC"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              strokeOpacity="0.35"
            />
          </svg>

          {/* 居中核心品牌区：大LOGO + 平台标题 */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-sky-400/25 via-sky-500/15 to-blue-900/40 backdrop-blur-xl border-2 border-sky-300/40 shadow-[0_0_60px_rgba(56,189,248,0.35)] flex items-center justify-center mb-8">
              <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-sky-200 drop-shadow-[0_0_16px_rgba(125,211,252,0.6)]" />
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
              “XX杯”网数智安全大赛
            </h1>

            <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-80" />

            <p className="mt-4 text-xs sm:text-sm font-mono tracking-[0.2em] text-sky-200/80 uppercase">
              NATIONAL CYBER, DATA &amp; AI SECURITY COMPETITION
            </p>
          </div>
        </div>

        {/* 右侧表单区（约40%） */}
        <div className="lg:w-[42%] xl:w-[40%] flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-[#F8FAFC]">
          <div className="w-full max-w-md xl:max-w-[480px] bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 sm:p-8 xl:p-9">
            {activeMainTab !== 'forgot' ? (
              <div className="grid grid-cols-2 border-b border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('login');
                    setLoginErrorMsg(null);
                    setTopRedAlertMsg(null);
                  }}
                  className={`pb-3.5 text-base font-extrabold tracking-tight border-b-2 transition-colors cursor-pointer ${
                    activeMainTab === 'login'
                      ? 'border-[#0284C7] text-[#0284C7]'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  登 录
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('register');
                    setRegErrorMsg(null);
                    setTopRedAlertMsg(null);
                  }}
                  className={`pb-3.5 text-base font-extrabold tracking-tight border-b-2 transition-colors cursor-pointer ${
                    activeMainTab === 'register'
                      ? 'border-[#0284C7] text-[#0284C7]'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  注 册
                </button>
              </div>
            ) : (
              <div className="pb-4 mb-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">找回密码</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    第 {forgotStep} 步 / 共 2 步：{forgotStep === 1 ? '身份验证' : '重置密码与历史口令校验'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('login');
                    setForgotStep(1);
                    setForgotErrorMsg(null);
                  }}
                  className="text-xs font-semibold text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>返回登录</span>
                </button>
              </div>
            )}

            {/* 登录模块 */}
            {activeMainTab === 'login' && (
              <>
                {twoFactorStep ? (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-slate-700 space-y-1.5">
                      <div className="font-bold text-[#0369A1] flex items-center gap-1.5 text-sm">
                        <KeyRound className="w-4 h-4" />
                        <span>管理端双因子认证（2FA）</span>
                      </div>
                      <p>
                        系统检测到当前登录账号 <strong>{twoFactorStep.pendingAdminUser.username}</strong> 具有
                        <strong>【管理员/高校管理员】</strong>权限。请输入发送至您手机/邮箱的 6 位动态验证码。
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        6位动态安全验证码
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="请输入6位数字动态验证码"
                        value={twoFactorStep.inputCode}
                        onChange={(e) =>
                          setTwoFactorStep({ ...twoFactorStep, inputCode: e.target.value, error: '' })
                        }
                        className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num tracking-widest focus:outline-none"
                      />
                      <div className="text-[11px] text-slate-500 mt-1.5">
                        演示动态码：
                        <strong className="font-mono-num text-[#0284C7]">{twoFactorStep.sentCode}</strong>
                        <button
                          type="button"
                          onClick={() =>
                            setTwoFactorStep({ ...twoFactorStep, inputCode: twoFactorStep.sentCode })
                          }
                          className="ml-2 text-[#0284C7] underline cursor-pointer"
                        >
                          一键填入
                        </button>
                      </div>
                    </div>

                    {twoFactorStep.error && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                        {twoFactorStep.error}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setTwoFactorStep(null)}
                        className="flex-1 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        返回上一步
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            twoFactorStep.inputCode.trim() !== twoFactorStep.sentCode &&
                            twoFactorStep.inputCode.trim() !== '888888'
                          ) {
                            setTwoFactorStep({
                              ...twoFactorStep,
                              error: '双因子动态验证码不正确，请核对后重试',
                            });
                            return;
                          }
                          const adminUser = twoFactorStep.pendingAdminUser;
                          setTwoFactorStep(null);
                          if (simulateActiveSessionConflict) {
                            setSessionConflictModal({
                              pendingUser: adminUser,
                              deviceInfo: 'Windows 11 - Chrome 129.0',
                              ipInfo: '114.247.50.12 (北京市海淀区)',
                            });
                          } else {
                            onLoginSuccess(adminUser, 'home', {
                              abnormalLocationAlert: simulateAbnormalLocation,
                            });
                          }
                        }}
                        className="flex-1 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        完成2FA验证并进入系统
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('password');
                          setLoginErrorMsg(null);
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                          loginMethod === 'password'
                            ? 'bg-white text-[#0284C7] shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        密码登录
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('sms');
                          setLoginErrorMsg(null);
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                          loginMethod === 'sms'
                            ? 'bg-white text-[#0284C7] shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        验证码登录
                      </button>
                    </div>

                    {lockoutRemainingSec > 0 && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                        <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-bold">账号已被安全风控临时锁定</div>
                          <p className="mt-0.5">
                            因连续 5 次输入错误密码，该账号剩余锁定时间：
                            <strong className="font-mono-num text-red-600 ml-1">
                              {String(Math.floor(lockoutRemainingSec / 60)).padStart(2, '0')}:
                              {String(lockoutRemainingSec % 60).padStart(2, '0')}
                            </strong>
                          </p>
                        </div>
                      </div>
                    )}

                    {loginErrorMsg && (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{loginErrorMsg}</span>
                      </div>
                    )}

                    {loginMethod === 'password' ? (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            登录账号
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              disabled={lockoutRemainingSec > 0}
                              value={loginAccount}
                              onChange={(e) => setLoginAccount(e.target.value)}
                              placeholder="请输入用户名/手机号/邮箱"
                              className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none disabled:bg-slate-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            登录密码
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showLoginPwd ? 'text' : 'password'}
                              disabled={lockoutRemainingSec > 0}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="请输入登录密码"
                              className="w-full pl-10 pr-10 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none disabled:bg-slate-100"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPwd((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                              aria-label={showLoginPwd ? '隐藏密码' : '显示密码'}
                            >
                              {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {failedAttempts >= 3 && (
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-semibold text-amber-700">
                                安全升级：滑块验证码（因连续输错密码满3次触发）
                              </span>
                            </div>
                            <SliderCaptcha
                              verified={loginInlineSliderVerified}
                              onSuccess={() => setLoginInlineSliderVerified(true)}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span>快捷体验：</span>
                            <button
                              type="button"
                              onClick={() => {
                                setLoginAccount('linyuanhang');
                                setLoginPassword('Sec2026Pass');
                                setLoginErrorMsg(null);
                              }}
                              className="text-[#0284C7] hover:underline cursor-pointer"
                            >
                              正常学生
                            </button>
                            <span>·</span>
                            <button
                              type="button"
                              onClick={() => {
                                setLoginAccount('zhouming_exp');
                                setLoginPassword('Sec2026Pass');
                                setLoginErrorMsg(null);
                              }}
                              className="text-red-600 hover:underline cursor-pointer"
                            >
                              过期账号(zhouming_exp)
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMainTab('forgot');
                              setForgotStep(1);
                              setForgotErrorMsg(null);
                            }}
                            className="font-semibold text-[#0284C7] hover:text-[#0369A1] hover:underline cursor-pointer"
                          >
                            忘记密码？
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            手机号码
                          </label>
                          <div className="relative">
                            <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              maxLength={11}
                              value={smsPhone}
                              onChange={(e) => setSmsPhone(e.target.value)}
                              placeholder="请输入手机号"
                              className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            短信验证码（6位）
                          </label>
                          <div className="flex items-center gap-2.5">
                            <input
                              type="text"
                              maxLength={6}
                              value={smsCodeInput}
                              onChange={(e) => setSmsCodeInput(e.target.value)}
                              placeholder="请输入6位短信验证码"
                              className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={smsCountdown > 0}
                              onClick={handleTriggerSmsCode}
                              className="px-3.5 py-2.5 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                            >
                              {smsCountdown > 0 ? `${smsCountdown}秒后重发` : '获取验证码'}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => setLoginMethod('password')}
                            className="font-semibold text-[#0284C7] hover:underline cursor-pointer"
                          >
                            切换到密码登录
                          </button>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={lockoutRemainingSec > 0}
                      className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-300 text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer mt-2"
                    >
                      登 录
                    </button>

                    <div className="pt-2 text-center text-xs text-slate-500 leading-relaxed">
                      登录即代表您已同意
                      <button
                        type="button"
                        onClick={() => setAgreementModal('service')}
                        className="text-[#0284C7] font-semibold hover:underline mx-0.5 cursor-pointer"
                      >
                        《用户服务协议》
                      </button>
                      和
                      <button
                        type="button"
                        onClick={() => setAgreementModal('privacy')}
                        className="text-[#0284C7] font-semibold hover:underline mx-0.5 cursor-pointer"
                      >
                        《隐私政策》
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* 注册模块 */}
            {activeMainTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                {regErrorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-300 text-xs font-semibold text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{regErrorMsg}</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">
                      第1步：填写基础账号信息
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRegUsername('buaa_cyber26');
                        setRegUsernameStatus('valid');
                        setRegPassword('Cyber2026#Sec');
                        setRegConfirmPassword('Cyber2026#Sec');
                        setRegPhone('13910882026');
                        setRegEmail('buaa_cyber26@buaa.edu.cn');
                        setRegVerifyCodeInput(generatedRegVerifyCode);
                        setRegAgreeTerms(true);
                        setRegErrorMsg(null);
                        setTopRedAlertMsg(null);
                      }}
                      className="text-[11px] text-[#0284C7] hover:underline cursor-pointer"
                    >
                      一键填入合规演示注册信息
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      用户名 *
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => {
                        setRegUsername(e.target.value);
                        checkUsernameUniqueness(e.target.value);
                      }}
                      placeholder="请输入用户名（4-20位字母或数字）"
                      className="w-full px-3.5 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                    />
                    {regUsernameStatus === 'valid' && (
                      <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>该用户名格式合规且唯一可用</span>
                      </div>
                    )}
                    {regUsernameStatus === 'taken' && (
                      <div className="text-[11px] text-red-600 mt-1">
                        该用户名已被占用（如 linyuanhang / admin），请更换其他用户名
                      </div>
                    )}
                    {regUsernameStatus === 'invalid' && (
                      <div className="text-[11px] text-amber-600 mt-1">
                        用户名须由 4-20 位英文字母或数字组成
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <label className="font-semibold text-slate-700">设置密码 *</label>
                      {regPwdStrength.level !== 'empty' && (
                        <span
                          className={`font-bold ${
                            regPwdStrength.level === 'strong'
                              ? 'text-emerald-600'
                              : regPwdStrength.level === 'medium'
                              ? 'text-sky-600'
                              : 'text-red-600'
                          }`}
                        >
                          密码强度：{regPwdStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showRegPwd ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="请设置8-20位登录密码"
                        className="w-full pl-3.5 pr-10 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showRegPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          regPwdStrength.level === 'weak'
                            ? 'bg-red-500'
                            : regPwdStrength.level === 'medium'
                            ? 'bg-sky-500'
                            : regPwdStrength.level === 'strong'
                            ? 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          regPwdStrength.level === 'medium'
                            ? 'bg-sky-500'
                            : regPwdStrength.level === 'strong'
                            ? 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          regPwdStrength.level === 'strong' ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    </div>
                    <div
                      className={`text-[11px] mt-1 ${
                        regPwdStrength.isWeakDict ? 'text-red-600 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {regPwdStrength.message}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      确认密码 *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPwd ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="请再次输入密码"
                        className="w-full pl-3.5 pr-10 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showRegConfirmPwd ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {regConfirmPassword && regPassword !== regConfirmPassword && (
                      <div className="text-[11px] text-red-600 mt-1">两次输入的密码不一致</div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-[#0284C7] uppercase tracking-wider">
                    第2步：选择注册验证方式
                  </div>

                  <div className="flex items-center gap-6 text-xs font-semibold text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="regChannel"
                        checked={regVerifyChannel === 'phone'}
                        onChange={() => {
                          setRegVerifyChannel('phone');
                          setRegVerifyCodeInput('');
                        }}
                        className="text-[#0284C7] focus:ring-[#0284C7]"
                      />
                      <span>手机号注册</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="regChannel"
                        checked={regVerifyChannel === 'email'}
                        onChange={() => {
                          setRegVerifyChannel('email');
                          setRegVerifyCodeInput('');
                        }}
                        className="text-[#0284C7] focus:ring-[#0284C7]"
                      />
                      <span>邮箱注册</span>
                    </label>
                  </div>

                  {regVerifyChannel === 'phone' ? (
                    <div className="space-y-2.5">
                      <input
                        type="tel"
                        maxLength={11}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="请输入11位手机号码"
                        className="w-full px-3.5 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={regVerifyCodeInput}
                          onChange={(e) => setRegVerifyCodeInput(e.target.value)}
                          placeholder="请输入6位短信验证码"
                          className="flex-1 px-3.5 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={regVerifyCountdown > 0}
                          onClick={handleTriggerRegVerifyCode}
                          className="px-3.5 py-2 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {regVerifyCountdown > 0 ? `${regVerifyCountdown}秒后重发` : '获取验证码'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="请输入高校教育邮箱或常用邮箱"
                        className="w-full px-3.5 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={regVerifyCodeInput}
                          onChange={(e) => setRegVerifyCodeInput(e.target.value)}
                          placeholder="请输入6位邮件验证码"
                          className="flex-1 px-3.5 py-2 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={regVerifyCountdown > 0}
                          onClick={handleTriggerRegVerifyCode}
                          className="px-3.5 py-2 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {regVerifyCountdown > 0 ? `${regVerifyCountdown}秒后重发` : '获取验证码'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={regAgreeTerms}
                      onChange={(e) => {
                        setRegAgreeTerms(e.target.checked);
                        if (e.target.checked && regErrorMsg === '请先同意服务协议') {
                          setRegErrorMsg(null);
                          setTopRedAlertMsg(null);
                        }
                      }}
                      className="mt-0.5 rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7] cursor-pointer"
                    />
                    <span>
                      我已阅读并同意
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAgreementModal('service');
                        }}
                        className="text-[#0284C7] font-semibold hover:underline mx-0.5 cursor-pointer"
                      >
                        《用户服务协议》
                      </button>
                      和
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAgreementModal('privacy');
                        }}
                        className="text-[#0284C7] font-semibold hover:underline mx-0.5 cursor-pointer"
                      >
                        《隐私政策》
                      </button>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  注 册
                </button>
              </form>
            )}

            {/* 找回密码模块 */}
            {activeMainTab === 'forgot' && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                      forgotStep === 1
                        ? 'bg-[#0284C7] text-white'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-mono-num">
                      1
                    </span>
                    <span>第一步：身份验证</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <div
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                      forgotStep === 2 ? 'bg-[#0284C7] text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200/70 flex items-center justify-center font-mono-num">
                      2
                    </span>
                    <span>第二步：重置密码</span>
                  </div>
                </div>

                {forgotErrorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 mb-4 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{forgotErrorMsg}</span>
                  </div>
                )}

                {forgotSuccessMsg && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 mb-4 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{forgotSuccessMsg}</span>
                  </div>
                )}

                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotStep1Next} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        预留手机 / 邮箱
                      </label>
                      <input
                        type="text"
                        value={forgotContact}
                        onChange={(e) => setForgotContact(e.target.value)}
                        placeholder="请输入账号绑定的手机号或邮箱"
                        className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        滑块验证码（固定展示，须先通过才可发送验证码）
                      </label>
                      <SliderCaptcha
                        verified={forgotSliderVerified}
                        onSuccess={() => setForgotSliderVerified(true)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        短信 / 邮件验证码
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="text"
                          maxLength={6}
                          value={forgotVerifyCodeInput}
                          onChange={(e) => setForgotVerifyCodeInput(e.target.value)}
                          placeholder="请输入收到的6位验证码"
                          className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={!forgotSliderVerified || forgotCountdown > 0}
                          onClick={handleForgotSendCode}
                          className="px-3.5 py-2.5 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {forgotCountdown > 0 ? `${forgotCountdown}秒后重发` : '发送验证码'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      下一步
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotStep2Reset} className="space-y-4">
                    <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-slate-600">
                      <div className="font-semibold text-slate-800 mb-0.5">
                        历史密码不可重复校验（指标2）：
                      </div>
                      <div>
                        当前及最近历史密码记录：
                        <span className="font-mono-num text-[#0369A1] ml-1">
                          {passwordHistory.join(' , ')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <label className="font-semibold text-slate-700">新密码 *</label>
                        {forgotPwdStrength.level !== 'empty' && (
                          <span
                            className={`font-bold ${
                              forgotPwdStrength.level === 'strong'
                                ? 'text-emerald-600'
                                : forgotPwdStrength.level === 'medium'
                                ? 'text-sky-600'
                                : 'text-red-600'
                            }`}
                          >
                            强度：{forgotPwdStrength.label}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showForgotNewPwd ? 'text' : 'password'}
                          value={forgotNewPwd}
                          onChange={(e) => setForgotNewPwd(e.target.value)}
                          placeholder="请输入8-20位新密码（含字母和数字）"
                          className="w-full pl-3.5 pr-10 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotNewPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showForgotNewPwd ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{forgotPwdStrength.message}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotNewPwd(passwordHistory[0] || 'Sec2026Pass');
                            setForgotConfirmPwd(passwordHistory[0] || 'Sec2026Pass');
                            setForgotCaptchaInput(forgotCaptchaCode);
                          }}
                          className="text-amber-700 hover:underline shrink-0 ml-2 cursor-pointer"
                        >
                          测试填入原密码
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        确认新密码 *
                      </label>
                      <input
                        type="password"
                        value={forgotConfirmPwd}
                        onChange={(e) => setForgotConfirmPwd(e.target.value)}
                        placeholder="请再次输入新密码"
                        className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <label className="font-semibold text-slate-700">图形验证码（固定展示）</label>
                        <button
                          type="button"
                          onClick={() => setForgotCaptchaInput(forgotCaptchaCode)}
                          className="text-[11px] text-[#0284C7] hover:underline cursor-pointer"
                        >
                          一键填入({forgotCaptchaCode})
                        </button>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="text"
                          maxLength={4}
                          value={forgotCaptchaInput}
                          onChange={(e) => setForgotCaptchaInput(e.target.value)}
                          placeholder="请输入4位图形验证码"
                          className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num uppercase focus:outline-none"
                        />
                        <GraphicCaptcha
                          code={forgotCaptchaCode}
                          onRefresh={() => setForgotCaptchaCode(generateRandomCode())}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      确认重置
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 点击【登录】或【注册】后触发的图形验证码安全核验弹窗 */}
      {graphicCaptchaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {graphicCaptchaModal.mode === 'login'
                    ? '安全验证 — 请输入图形验证码完成登录'
                    : '安全验证 — 请输入图形验证码完成注册'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGraphicCaptchaModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGraphicCaptchaConfirm} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                请识别右侧图形中的 4 位字符并填入下方输入框（不区分大小写，点击图片可刷新验证码）：
              </p>

              {graphicCaptchaModal.error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{graphicCaptchaModal.error}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-semibold text-slate-700">图形验证码</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (graphicCaptchaModal.mode === 'login') {
                        setLoginCaptchaInput(loginCaptchaCode);
                      } else {
                        setRegCaptchaInput(regCaptchaCode);
                      }
                      setGraphicCaptchaModal({ ...graphicCaptchaModal, error: null });
                    }}
                    className="text-[11px] text-[#0284C7] hover:underline cursor-pointer"
                  >
                    一键填入当前验证码(
                    {graphicCaptchaModal.mode === 'login' ? loginCaptchaCode : regCaptchaCode})
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    autoFocus
                    maxLength={4}
                    value={graphicCaptchaModal.mode === 'login' ? loginCaptchaInput : regCaptchaInput}
                    onChange={(e) => {
                      if (graphicCaptchaModal.mode === 'login') {
                        setLoginCaptchaInput(e.target.value);
                      } else {
                        setRegCaptchaInput(e.target.value);
                      }
                      if (graphicCaptchaModal.error) {
                        setGraphicCaptchaModal({ ...graphicCaptchaModal, error: null });
                      }
                    }}
                    placeholder="请输入4位图形验证码"
                    className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num uppercase focus:outline-none"
                  />
                  <GraphicCaptcha
                    code={graphicCaptchaModal.mode === 'login' ? loginCaptchaCode : regCaptchaCode}
                    onRefresh={() => {
                      if (graphicCaptchaModal.mode === 'login') {
                        setLoginCaptchaCode(generateRandomCode());
                        setLoginCaptchaInput('');
                      } else {
                        setRegCaptchaCode(generateRandomCode());
                        setRegCaptchaInput('');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGraphicCaptchaModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  {graphicCaptchaModal.mode === 'login' ? '确认并登录' : '确认并完成注册'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 防刷滑块弹窗 */}
      {sliderModalConfig && sliderModalConfig.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="text-sm font-bold">{sliderModalConfig.title}</span>
              <button
                type="button"
                onClick={() => setSliderModalConfig(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                为防止自动化脚本恶意刷取短信/邮件通道，请先拖动下方滑块完成人机核验，验证通过后将立即下发 6 位验证码。
              </p>
              <SliderCaptcha
                verified={false}
                onSuccess={() => {
                  setTimeout(() => {
                    sliderModalConfig.onVerifiedCallback();
                  }, 250);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 单点会话控制弹窗 */}
      {sessionConflictModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center gap-2">
              <Laptop className="w-5 h-5" />
              <span className="font-bold text-base">单点会话控制提醒（指标2）</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                您的账号已在其他设备（如：Windows-Chrome）登录，是否强制下线原设备？
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 font-mono-num">
                <div>当前在线设备：{sessionConflictModal.deviceInfo}</div>
                <div>活跃会话 IP：{sessionConflictModal.ipInfo}</div>
                <div>会话建立时间：2026-10-28 09:42:18</div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onAddAuditLog({
                      operator: sessionConflictModal.pendingUser.username,
                      ip: sessionConflictModal.pendingUser.currentLoginIp,
                      location: sessionConflictModal.pendingUser.currentLoginLocation,
                      device: 'Windows 11 / Chrome 130.0',
                      action: '单点会话冲突-用户取消登录',
                      result: '失败',
                      detail: '检测到其他设备活跃会话，用户选择保留原设备并取消本次登录。',
                    });
                    setSessionConflictModal(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消本次登录
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const u = sessionConflictModal.pendingUser;
                    onAddAuditLog({
                      operator: u.username,
                      ip: u.currentLoginIp,
                      location: u.currentLoginLocation,
                      device: 'Windows 11 / Chrome 130.0',
                      action: '单点会话控制-强制下线原设备并登录',
                      result: '成功',
                      detail: `已销毁原设备(${sessionConflictModal.deviceInfo})会话Token，完成新会话建立。`,
                    });
                    setSessionConflictModal(null);
                    onLoginSuccess(u, 'home', { abnormalLocationAlert: simulateAbnormalLocation });
                  }}
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  强制下线原设备并登录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 协议弹窗（区分《用户服务协议》与《隐私政策》对应内容） */}
      {agreementModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">
                {agreementModal === 'service'
                  ? '“XX杯”网数智安全大赛平台《用户服务协议》'
                  : '“XX杯”网数智安全大赛平台《隐私政策》'}
              </span>
              <button
                type="button"
                onClick={() => setAgreementModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {agreementModal === 'service' ? (
              <div className="p-6 text-xs text-slate-600 space-y-3 leading-relaxed max-h-[65vh] overflow-y-auto">
                <p className="font-bold text-slate-900">第一条 服务总则与适用范围</p>
                <p>
                  本协议由注册及登录用户与“XX杯”全国网数智安全大赛组委会共同缔结。用户在使用本平台提供的赛事报名、团队组建、线上靶场演练及证书核验服务前，应仔细阅读并遵守本协议全部条款。
                </p>
                <p className="font-bold text-slate-900">第二条 实名与学籍/教职工合规要求</p>
                <p>
                  参赛用户注册账号后，在参与具体赛道组队及靶场演练前，须按照大赛章程完成真实姓名与教育部学籍在线验证（或指导教师工号核验），严禁冒用他人身份信息参赛。
                </p>
                <p className="font-bold text-slate-900">第三条 账号安全与禁止作弊行为</p>
                <p>
                  用户应妥善保管账号及密码，不得将账号出借他人、跨队共享 Flag 或对大赛平台基础设施实施非授权DDoS攻击。平台依据国家网络安全等级保护三级规范，全程记录登录IP、设备指纹及攻防审计日志。
                </p>
                <p className="font-bold text-slate-900">第四条 赛事成果与知识产权说明</p>
                <p>
                  参赛战队在比赛过程中提交的 WriteUp 解题报告、防御加固补丁与创新算法模型，其署名权归参赛团队所有，大赛组委会享有用于赛事评审、防作弊复核及优秀成果汇编展示的权利。
                </p>
              </div>
            ) : (
              <div className="p-6 text-xs text-slate-600 space-y-3 leading-relaxed max-h-[65vh] overflow-y-auto">
                <p className="font-bold text-slate-900">第一条 个人信息的收集范围与目的</p>
                <p>
                  为完成赛事报名资格审核、组队邀请通知下发及防伪电子证书签发，平台将根据最小必要原则收集您的用户名、手机号码、电子邮箱、真实姓名、所属高等院校及学号/教工号信息。
                </p>
                <p className="font-bold text-slate-900">第二条 信息存储与国密加密保护</p>
                <p>
                  平台严格遵循《中华人民共和国个人信息保护法》与网络安全等级保护 2.0 三级规范，对用户身份证号、手机号、邮箱及口令采用国密 SM3/SM4 算法加密存储，前端界面默认执行隐私脱敏展示。
                </p>
                <p className="font-bold text-slate-900">第三条 信息使用与第三方披露限制</p>
                <p>
                  您的个人信息仅用于“XX杯”网数智安全大赛赛事组织、教育部学籍接口核验及获奖公示。未经您本人明确授权，平台绝不向任何无关第三方机构或个人出售、出租或共享您的数据。
                </p>
                <p className="font-bold text-slate-900">第四条 用户权利与安全审计保障</p>
                <p>
                  您可随时在“个人中心”查阅、更正绑定手机与邮箱信息。系统对所有涉及个人敏感数据的核验与访问均留存不可篡改的安全审计日志，全方位保障您的个人隐私权益。
                </p>
              </div>
            )}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAgreementModal(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg cursor-pointer"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeMainTab === 'register') {
                    setRegAgreeTerms(true);
                    if (regErrorMsg === '请先同意服务协议') {
                      setRegErrorMsg(null);
                      setTopRedAlertMsg(null);
                    }
                  }
                  setAgreementModal(null);
                }}
                className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                我已阅读并同意
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 安全审计与操作日志抽屉 */}
      {showAuditDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>安全审计与操作日志（指标20）</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  后端静默记录：操作人、IP、时间、设备、行为、结果（成功/失败/锁定/风控拦截）
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditDrawer(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        log.result === '成功'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.result === '锁定'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      结果：{log.result}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 font-mono-num">
                    <div>操作人：{log.operator}</div>
                    <div>
                      IP：{log.ip} ({log.location})
                    </div>
                    <div>时间：{log.time}</div>
                    <div className="col-span-2">设备：{log.device}</div>
                  </div>
                  <div className="text-slate-600 pt-1 border-t border-slate-200/70">
                    详情：{log.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 独立全屏页面：个人中心（【个人信息】 + 【用户认证】双卡片状态机）
// ============================================================================
export const StandaloneUserCenterPage: React.FC<{
  user: UserProfileData;
  initialTab?: 'profile' | 'certification' | 'registrations' | 'competitions' | 'messages';
  onUpdateUser: (updated: UserProfileData) => void;
  onBackHome: () => void;
  onLogout: () => void;
  registrations: RegistrationSubmission[];
  captainTeams: CaptainTeamRecord[];
  onUpdateCaptainTeams: (next: CaptainTeamRecord[]) => void;
  participatedTeams: ParticipatedTeamRecord[];
  onUpdateParticipatedTeams: (next: ParticipatedTeamRecord[]) => void;
  onContinueEditDraft: (team: CaptainTeamRecord) => void;
  onAddAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'time'>) => void;
  enabledSchools?: string[];
  competitions?: CompetitionCatalogItem[];
  platformUsers?: PlatformDirectoryUser[];
  registrationConfigs?: EventRegistrationConfig[];
  onViewCompetitionDetail?: (competitionId: string) => void;
  onSubmitVerificationApplication?: (
    record: Omit<VerificationApplicationRecord, 'id' | 'reviewStatus'>
  ) => void;
  messages?: PlatformMessageItem[];
  onMarkAllMessagesRead?: () => void;
  onMarkMessageRead?: (msgId: string) => void;
  onAcceptInviteMessage?: (msg: PlatformMessageItem) => void;
  onRejectInviteMessage?: (msg: PlatformMessageItem) => void;
  onGoToAdminBackend?: () => void;
}> = ({
  user,
  initialTab = 'profile',
  onUpdateUser,
  onBackHome,
  onLogout,
  captainTeams,
  onUpdateCaptainTeams,
  participatedTeams,
  onUpdateParticipatedTeams,
  onContinueEditDraft,
  onAddAuditLog,
  enabledSchools,
  competitions = [],
  platformUsers,
  registrationConfigs,
  onViewCompetitionDetail,
  onSubmitVerificationApplication,
  messages = INITIAL_PLATFORM_MESSAGES,
  onMarkAllMessagesRead,
  onMarkMessageRead,
  onAcceptInviteMessage,
  onRejectInviteMessage,
  onGoToAdminBackend,
}) => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'certification' | 'registrations' | 'competitions' | 'messages'
  >(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // “我的消息”页面内部筛选状态：分类Tab（全部 / 组队邀请 / 审核与反馈 / 系统通知）与角色视角筛选
  const [msgCategoryTab, setMsgCategoryTab] = useState<'all' | MessageCategoryTab>('all');
  const [msgRoleFilter, setMsgRoleFilter] = useState<'all' | MessageRolePerspective>('all');
  const [detailModalMessage, setDetailModalMessage] = useState<PlatformMessageItem | null>(null);

  const unreadMsgCount = React.useMemo(
    () => messages.filter((m) => m.unread).length,
    [messages]
  );

  const filteredMessages = React.useMemo(() => {
    return messages.filter((m) => {
      const resolvedCat: MessageCategoryTab =
        m.category ||
        (m.scenarioType === 'team_invite'
          ? 'invite'
          : m.scenarioType === 'removed_from_team' ||
            m.scenarioType === 'univ_channel_open' ||
            m.scenarioType === 'cert_result'
          ? 'system'
          : 'review');
      if (msgCategoryTab !== 'all' && resolvedCat !== msgCategoryTab) {
        return false;
      }
      if (msgRoleFilter !== 'all' && (m.rolePerspective || '全角色通用') !== msgRoleFilter) {
        return false;
      }
      return true;
    });
  }, [messages, msgCategoryTab, msgRoleFilter]);

  const [snapshotDrawerItem, setSnapshotDrawerItem] = useState<{
    competitionTitle: string;
    myRole: '队长' | '队员' | '指导教师';
    snapshot: TeamApprovedSnapshot;
  } | null>(null);

  // 准入规则极度收紧：只拉取当前用户参与、通过秘书处终审、整体报名状态为【报名成功（已晋级决赛）】的最终队伍档案
  const myApprovedCompetitions = React.useMemo(() => {
    const currentName = (user.name || '').trim();
    const list: {
      id: string;
      competitionId: string;
      competitionTitle: string;
      startDate: string;
      endDate: string;
      subTrackName: string;
      statusKey: 'upcoming' | 'ongoing' | 'ended';
      statusLabel: '未开始' | '进行中' | '已结束';
      teamName: string;
      myRole: '队长' | '队员' | '指导教师';
      schoolRank: number;
      snapshot: TeamApprovedSnapshot;
    }[] = [];

    // 1. 从 captainTeams 中拉取当前用户参与（作为队长、已同意队员或已同意指导教师）且通过秘书处终审【报名成功（已晋级决赛）】的队伍
    captainTeams.forEach((team) => {
      const stages = resolveTeamAuditStages(team);
      if (stages.regStatusKey !== 'approved') return;

      const isCaptain = isTeamOwnedByUser(team, user);
      const isMember =
        Boolean(currentName) &&
        team.members.some(
          (m) =>
            m.confirmStatus === 'accepted' &&
            (m.name.includes(currentName) || (user.phone && m.phone === user.phone))
        );
      const isAdvisor =
        Boolean(currentName) &&
        team.advisors.some(
          (a) =>
            a.confirmStatus === 'accepted' &&
            (a.name.includes(currentName) || (user.phone && a.phone === user.phone))
        );

      if (!isCaptain && !isMember && !isAdvisor) return;

      const myRole: '队长' | '队员' | '指导教师' = isCaptain
        ? '队长'
        : isAdvisor
        ? '指导教师'
        : '队员';
      const comp = competitions.find((c) => c.id === team.competitionId);
      const statusKey = comp ? computeCompetitionStatus(comp.startDate, comp.endDate) : 'ongoing';
      const statusLabel = getCompetitionStatusLabel(statusKey);
      const baseGenerated = buildApprovedSnapshotFromCaptainTeam(team);
      const rawSnap = team.approvedSnapshot || baseGenerated;
      const resolvedSchoolRank =
        rawSnap.schoolRank || team.schoolRank || stages.schoolRank || 1;
      const snapshot: TeamApprovedSnapshot = {
        ...baseGenerated,
        ...rawSnap,
        schoolRank: resolvedSchoolRank,
        competitionTitle:
          rawSnap.competitionTitle || comp?.title || team.competitionTitle,
        teamLogo: rawSnap.teamLogo || team.teamLogo || 'default-logo',
        teamIntro:
          rawSnap.teamIntro ||
          team.teamIntro ||
          '专注网络与数据安全攻防技术研究。',
        captainPhone: rawSnap.captainPhone || baseGenerated.captainPhone,
        captainEmail: rawSnap.captainEmail || baseGenerated.captainEmail,
        createdAt: rawSnap.createdAt || team.createdAt || rawSnap.approvedAt,
        members: rawSnap.members.map((m) => {
          const contact = resolvePersonContactByName(
            m.name,
            m.phone,
            m.email,
            platformUsers
          );
          return {
            ...m,
            phone: contact.phone,
            email: contact.email,
          };
        }),
      };

      list.push({
        id: `my-comp-cap-${team.id}`,
        competitionId: team.competitionId,
        competitionTitle: comp?.title || team.competitionTitle,
        startDate: comp?.startDate || '2026-06-01',
        endDate: comp?.endDate || '2026-11-25',
        subTrackName: snapshot.subTrackName,
        statusKey,
        statusLabel,
        teamName: snapshot.teamName,
        myRole,
        schoolRank: resolvedSchoolRank,
        snapshot,
      });
    });

    // 2. 从 participatedTeams 中拉取状态为 team_approved（报名成功）且属于当前用户的记录
    const isLinDemoAccount =
      user.username === 'linyuanhang' ||
      user.name === '林远航' ||
      user.phone === '13810246921';
    if (isLinDemoAccount) {
      participatedTeams.forEach((pt) => {
        if (pt.status !== 'team_approved') return;
        const comp = competitions.find((c) => c.id === pt.competitionId);
        const statusKey = comp ? computeCompetitionStatus(comp.startDate, comp.endDate) : 'ended';
        const statusLabel = getCompetitionStatusLabel(statusKey);
        const myRole: '队长' | '队员' | '指导教师' =
          pt.myRoleInTeam === '指导教师' ? '指导教师' : '队员';

        const capContact = resolvePersonContactByName(
          pt.captainName,
          pt.approvedSnapshot?.captainPhone || pt.captainPhone,
          pt.approvedSnapshot?.captainEmail,
          platformUsers
        );

        const rawMembers: TeamApprovedSnapshot['members'] =
          pt.approvedSnapshot?.members ||
          (pt.teamMembersDetail
            ? pt.teamMembersDetail.map((d) => ({
                name: d.name,
                role: d.role,
                university: d.university,
                ctfRoles: d.ctfRoles,
              }))
            : pt.teammatesSummary.map((raw) => {
                const role: '队长' | '队员' | '指导教师' = raw.includes('队长')
                  ? '队长'
                  : raw.includes('指导教师')
                  ? '指导教师'
                  : '队员';
                const name = raw.replace(/（.*?）/g, '').trim();
                return {
                  name,
                  role,
                  university: pt.university,
                  ctfRoles: name === '林远航' ? pt.myCtfRoles : undefined,
                };
              }));

        const resolvedPtRank =
          pt.approvedSnapshot?.schoolRank || pt.schoolRank || 1;
        const fallbackSnapshot: TeamApprovedSnapshot = {
          competitionTitle:
            pt.approvedSnapshot?.competitionTitle ||
            comp?.title ||
            pt.competitionTitle,
          teamName: pt.approvedSnapshot?.teamName || pt.teamName,
          teamLogo: pt.approvedSnapshot?.teamLogo || pt.teamLogo || 'default-logo',
          teamIntro:
            pt.approvedSnapshot?.teamIntro ||
            pt.teamIntro ||
            '专注网络与数据安全攻防技术研究。',
          subTrackName: pt.approvedSnapshot?.subTrackName || pt.subTrackName,
          university: pt.approvedSnapshot?.university || pt.university,
          captainName: pt.approvedSnapshot?.captainName || pt.captainName,
          captainPhone: capContact.phone,
          captainEmail: capContact.email,
          createdAt: pt.approvedSnapshot?.createdAt || pt.invitedAt,
          approvedAt: pt.approvedSnapshot?.approvedAt || pt.invitedAt,
          schoolRank: resolvedPtRank,
          members: rawMembers.map((m) => {
            const contact = resolvePersonContactByName(
              m.name,
              m.phone,
              m.email,
              platformUsers
            );
            return {
              ...m,
              phone: contact.phone,
              email: contact.email,
            };
          }),
        };

        list.push({
          id: `my-comp-part-${pt.id}`,
          competitionId: pt.competitionId,
          competitionTitle: comp?.title || pt.competitionTitle,
          startDate: comp?.startDate || '2025-10-01',
          endDate: comp?.endDate || '2025-12-20',
          subTrackName: fallbackSnapshot.subTrackName,
          statusKey,
          statusLabel,
          teamName: fallbackSnapshot.teamName,
          myRole,
          schoolRank: resolvedPtRank,
          snapshot: fallbackSnapshot,
        });
      });
    }

    return list;
  }, [captainTeams, participatedTeams, competitions, user, platformUsers]);

  // --------------------------------------------------------------------------
  // 1、【个人信息】修改/绑定弹窗状态（用户名、手机号、邮箱）
  // --------------------------------------------------------------------------
  const [editFieldModal, setEditFieldModal] = useState<{
    type: 'username' | 'phone' | 'email';
    mode: 'bind' | 'modify';
  } | null>(null);
  const [fieldInputValue, setFieldInputValue] = useState('');
  const [fieldSmsCode, setFieldSmsCode] = useState('628190');
  const [fieldCountdown, setFieldCountdown] = useState(0);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (fieldCountdown <= 0) return;
    const t = setInterval(() => setFieldCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [fieldCountdown]);

  const handleOpenEditModal = (
    type: 'username' | 'phone' | 'email',
    mode: 'bind' | 'modify'
  ) => {
    setFieldError(null);
    if (type === 'username') {
      setFieldInputValue(user.username);
    } else if (type === 'phone') {
      setFieldInputValue(mode === 'modify' ? user.phone.replace(/\*/g, '1') : '13810246921');
    } else {
      setFieldInputValue(mode === 'modify' ? user.email : 'linyuanhang@buaa.edu.cn');
    }
    setFieldSmsCode('628190');
    setEditFieldModal({ type, mode });
  };

  const handleSaveFieldModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFieldModal) return;
    const val = fieldInputValue.trim();

    if (editFieldModal.type === 'username') {
      if (!/^[a-zA-Z0-9]{4,20}$/.test(val)) {
        setFieldError('用户名须为 4-20 位英文字母或数字');
        return;
      }
      onUpdateUser({ ...user, username: val });
      onAddAuditLog({
        operator: val,
        ip: user.currentLoginIp,
        location: user.currentLoginLocation,
        device: 'Windows 11 / Chrome 130.0',
        action: '修改个人用户名',
        result: '成功',
        detail: `用户名由 ${user.username} 更新为 ${val}`,
      });
    } else if (editFieldModal.type === 'phone') {
      if (!/^1[3-9]\d{9}$/.test(val)) {
        setFieldError('请输入有效的 11 位手机号码');
        return;
      }
      if (!fieldSmsCode.trim()) {
        setFieldError('请输入6位短信验证码');
        return;
      }
      onUpdateUser({ ...user, phone: val });
      onAddAuditLog({
        operator: user.username,
        ip: user.currentLoginIp,
        location: user.currentLoginLocation,
        device: 'Windows 11 / Chrome 130.0',
        action: editFieldModal.mode === 'bind' ? '绑定手机号码' : '修改手机号码',
        result: '成功',
        detail: `已绑定手机号 ${maskPhone(val)}`,
      });
    } else if (editFieldModal.type === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setFieldError('请输入有效的电子邮箱地址');
        return;
      }
      if (!fieldSmsCode.trim()) {
        setFieldError('请输入6位邮件验证码');
        return;
      }
      onUpdateUser({ ...user, email: val });
      onAddAuditLog({
        operator: user.username,
        ip: user.currentLoginIp,
        location: user.currentLoginLocation,
        device: 'Windows 11 / Chrome 130.0',
        action: editFieldModal.mode === 'bind' ? '绑定电子邮箱' : '修改电子邮箱',
        result: '成功',
        detail: `已绑定邮箱 ${val}`,
      });
    }

    setEditFieldModal(null);
  };

  // --------------------------------------------------------------------------
  // 2、【用户认证】模块一：实名认证 状态与弹窗流
  // --------------------------------------------------------------------------
  // 弹窗类型：'unbound-phone' | 'sms-verify' | 'realname-form' | null
  const [realNameModalStep, setRealNameModalStep] = useState<
    'unbound-phone' | 'sms-verify' | 'realname-form' | null
  >(null);

  const [rnSmsCode, setRnSmsCode] = useState('839201');
  const [rnSmsCountdown, setRnSmsCountdown] = useState(0);
  const [rnSmsError, setRnSmsError] = useState<string | null>(null);

  useEffect(() => {
    if (rnSmsCountdown <= 0) return;
    const t = setInterval(() => setRnSmsCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [rnSmsCountdown]);

  const [rnNameInput, setRnNameInput] = useState(user.name || '张三');
  const [rnIdCardInput, setRnIdCardInput] = useState('110108200305162819');
  const [rnPromiseChecked, setRnPromiseChecked] = useState(false);
  const [rnSubmitting, setRnSubmitting] = useState(false);
  const [rnFormError, setRnFormError] = useState<string | null>(null);
  // 用于演示公安接口返回“成功”或“姓名与身份证号不匹配”
  const [rnSimulateMismatch, setRnSimulateMismatch] = useState(false);

  // 点击实名认证【去验证】
  const handleStartRealNameVerify = () => {
    if (user.realNameLockedUntil) {
      return;
    }
    // 检测当前账号是否已绑定手机号
    if (!user.phone || !user.phone.trim()) {
      setRealNameModalStep('unbound-phone');
      return;
    }
    setRnSmsError(null);
    setRnSmsCode('839201');
    setRealNameModalStep('sms-verify');
  };

  // 短信校验下一步 -> 弹出实名信息填写弹窗
  const handleRnSmsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (rnSmsCode.trim().length !== 6) {
      setRnSmsError('请输入6位短信验证码');
      return;
    }
    setRnFormError(null);
    setRealNameModalStep('realname-form');
  };

  // 提交实名信息 -> Loading 1.5秒 -> 调用公安接口返回结果
  const handleRnFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRnFormError(null);

    if (!rnNameInput.trim()) {
      setRnFormError('请输入真实姓名');
      return;
    }
    if (!/^\d{17}[\dXx]$/.test(rnIdCardInput.trim())) {
      setRnFormError('请输入有效的18位居民身份证号码');
      return;
    }
    if (!rnPromiseChecked) {
      setRnFormError('请勾选底部“本人承诺所填信息真实有效”');
      return;
    }

    setRnSubmitting(true);
    setTimeout(() => {
      setRnSubmitting(false);
      // 若模拟不匹配 或 输入姓名包含“错”/“不匹配”
      if (rnSimulateMismatch || rnNameInput.includes('不匹配')) {
        const nextFailCount = (user.realNameFailCount || 0) + 1;
        const isLocked = nextFailCount >= 3;
        const updatedUser: UserProfileData = {
          ...user,
          realNameStatus: 'failed',
          realNameFailCount: nextFailCount,
          realNameLockedUntil: isLocked ? '2026-10-29 10:00:00（锁定24小时）' : null,
        };
        onUpdateUser(updatedUser);
        onAddAuditLog({
          operator: user.username,
          ip: user.currentLoginIp,
          location: user.currentLoginLocation,
          device: 'Windows 11 / Chrome 130.0',
          action: `公安实名认证核验失败(第${nextFailCount}次)`,
          result: isLocked ? '锁定' : '失败',
          detail: isLocked
            ? '连续3次实名验证失败，防止恶意穷举身份证号，已锁定24小时后再试'
            : '公安接口返回：姓名与身份证号不匹配',
        });

        if (isLocked) {
          setRnFormError(
            '姓名与身份证号不匹配！您已连续错误达 3 次，为防止恶意穷举他人身份证号，实名认证功能已锁定 24 小时后再试。'
          );
        } else {
          setRnFormError(
            `姓名与身份证号不匹配，请检查后重试（当前已连续失败 ${nextFailCount}/3 次，连续错3次将锁定24小时）`
          );
        }
        return;
      }

      // 验证成功
      const nowTime = '2026-10-28 10:00:00';
      const updatedUser: UserProfileData = {
        ...user,
        name: rnNameInput.trim(),
        idCard: rnIdCardInput.trim(),
        realNameStatus: 'verified',
        realNameVerifiedAt: nowTime,
        realNameFailCount: 0,
        realNameLockedUntil: null,
        isVerified: user.academicStatus === 'verified',
      };
      onUpdateUser(updatedUser);
      onAddAuditLog({
        operator: user.username,
        ip: user.currentLoginIp,
        location: user.currentLoginLocation,
        device: 'Windows 11 / Chrome 130.0',
        action: '公安接口实名认证通过',
        result: '成功',
        detail: `真实姓名：${updatedUser.name}，实名核验通过，已解锁【学生/教师认证】模块`,
      });
      setRealNameModalStep(null);
    }, 1400);
  };

  // --------------------------------------------------------------------------
  // 3、【用户认证】模块二：学生/教师认证 状态与弹窗流
  // --------------------------------------------------------------------------
  const [selectedIdentityRadio, setSelectedIdentityRadio] = useState<'student' | 'teacher'>(
    user.identityType || 'student'
  );
  const [academicModalOpen, setAcademicModalOpen] = useState<'student' | 'teacher' | null>(null);

  // 学生认证表单状态（所属院校、学历层次、专业、入学时间、毕业时间（预计）、身份辅助证明[选填]）
  const [stuSchool, setStuSchool] = useState(user.university || '');
  const [stuEducation, setStuEducation] = useState<string>(user.educationLevel || '本科');
  const [stuMajor, setStuMajor] = useState(user.majorOrDept || '');
  const [stuEnrollDate, setStuEnrollDate] = useState(user.enrollmentDate || '2024-09');
  const [stuGradDate, setStuGradDate] = useState(user.graduationDate || '2028-06');
  const [stuManualFiles, setStuManualFiles] = useState<VerificationAttachmentItem[]>(
    user.studentProofFiles || []
  );
  const [stuFormError, setStuFormError] = useState<string | null>(null);

  // 教师认证表单状态（院校、院系部门、专业、学历层次）
  const [teaSchool, setTeaSchool] = useState(user.university || '');
  const [teaDept, setTeaDept] = useState(user.majorOrDept || '');
  const [teaMajor, setTeaMajor] = useState(user.teacherMajor || '网络空间安全');
  const [teaEducation, setTeaEducation] = useState<string>(user.educationLevel || '博士及以上');
  const [teaStaffId, setTeaStaffId] = useState(user.studentId || '');
  const [teaFiles, setTeaFiles] = useState<VerificationAttachmentItem[]>([]);
  const [teaFormError, setTeaFormError] = useState<string | null>(null);
  const [adminNotificationBanner, setAdminNotificationBanner] = useState<string | null>(null);

  // 前置校验：学生认证、教师认证前需要进行实名认证并完善手机号、邮箱
  const isRealNameDone = user.realNameStatus === 'verified';
  const isPhoneBound = Boolean(user.phone && user.phone.trim() && user.phone.trim() !== '未绑定手机');
  const isEmailBound = Boolean(user.email && user.email.trim() && user.email.trim() !== '未绑定邮箱');
  const isAcademicPrereqMet = isRealNameDone && isPhoneBound && isEmailBound;

  const ALLOWED_CERT_EXTS = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'rar'];
  const ALLOWED_STUDENT_PROOF_EXTS = ['jpg', 'jpeg', 'png', 'pdf'];
  const MAX_STUDENT_PROOF_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  const handleAddCertFiles = (
    fileList: FileList | null,
    currentFiles: VerificationAttachmentItem[],
    setFiles: React.Dispatch<React.SetStateAction<VerificationAttachmentItem[]>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const incoming = Array.from(fileList);

    if (currentFiles.length + incoming.length > 10) {
      setError(`上传的附件最多不超过 10 个（当前已上传 ${currentFiles.length} 个，本次选择了 ${incoming.length} 个）`);
      return;
    }

    const nextItems: VerificationAttachmentItem[] = [];
    for (const file of incoming) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!ALLOWED_CERT_EXTS.includes(ext)) {
        setError(
          `文件「${file.name}」格式不支持，请上传 jpg、jpeg、png、pdf、doc、docx、ppt、pptx、zip、rar 等常见格式`
        );
        return;
      }
      const sizeKb = Math.max(1, Math.round(file.size / 1024));
      const sizeStr =
        sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(2)} MB` : `${sizeKb} KB`;
      const isImage = ['jpg', 'jpeg', 'png'].includes(ext);
      const url = isImage
        ? URL.createObjectURL(file)
        : 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80';
      nextItems.push({
        id: `cert-att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: sizeStr,
        url,
        fileType: ext,
      });
    }

    setFiles((prev) => [...prev, ...nextItems]);
  };

  // 学生认证：身份辅助证明（选填，限制 jpg/png/pdf，限制 5MB 以内）
  const handleAddStudentProofFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setStuFormError(null);
    const incoming = Array.from(fileList);

    const nextItems: VerificationAttachmentItem[] = [];
    for (const file of incoming) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!ALLOWED_STUDENT_PROOF_EXTS.includes(ext)) {
        setStuFormError(
          `文件「${file.name}」格式不支持，身份辅助证明仅支持上传 jpg / png / pdf 格式`
        );
        return;
      }
      if (file.size > MAX_STUDENT_PROOF_SIZE_BYTES) {
        setStuFormError(
          `文件「${file.name}」超过 5MB 大小限制，请上传 5MB 以内的学生证内页或证明材料`
        );
        return;
      }
      const sizeKb = Math.max(1, Math.round(file.size / 1024));
      const sizeStr =
        sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(2)} MB` : `${sizeKb} KB`;
      const isImage = ['jpg', 'jpeg', 'png'].includes(ext);
      const url = isImage
        ? URL.createObjectURL(file)
        : 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80';
      nextItems.push({
        id: `stu-proof-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: sizeStr,
        url,
        fileType: ext,
      });
    }

    setStuManualFiles((prev) => [...prev, ...nextItems]);
  };

  // 点击模块二【去验证】或驳回后的【重新验证】（带着原数据回显到表单）
  const handleOpenAcademicModal = (forceIdentity?: 'student' | 'teacher') => {
    if (!isAcademicPrereqMet) {
      const missingItems: string[] = [];
      if (!isRealNameDone) missingItems.push('实名认证');
      if (!isPhoneBound) missingItems.push('手机号绑定');
      if (!isEmailBound) missingItems.push('邮箱绑定');
      setAdminNotificationBanner(
        `请先完成【${missingItems.join('、')}】后，再进行学生/教师认证！`
      );
      return;
    }
    setStuFormError(null);
    setTeaFormError(null);
    const targetIdentity = forceIdentity || selectedIdentityRadio;
    if (targetIdentity === 'student') {
      // 回显原数据到表单，支持驳回后根据原因修改再提交
      setStuSchool(user.university || '');
      setStuEducation(
        user.educationLevel &&
          ['专科', '本科', '硕士', '博士及以上'].includes(user.educationLevel)
          ? user.educationLevel
          : '本科'
      );
      setStuMajor(user.majorOrDept || '');
      setStuEnrollDate(user.enrollmentDate || '2024-09');
      setStuGradDate(user.graduationDate || '2028-06');
      setStuManualFiles(user.studentProofFiles || []);
      setAcademicModalOpen('student');
    } else {
      setTeaSchool(user.university || '');
      setTeaDept(user.majorOrDept || '');
      setTeaMajor(user.teacherMajor || '网络空间安全');
      setTeaEducation(
        user.educationLevel &&
          ['专科', '本科', '硕士', '博士及以上'].includes(user.educationLevel)
          ? user.educationLevel
          : '博士及以上'
      );
      setTeaStaffId(user.studentId || '');
      setAcademicModalOpen('teacher');
    }
  };

  // 学生认证【提交审核】 -> 状态变为“审核中”（橙色），直接将数据推送到该院校绑定的【高校管理员】后台
  const handleStudentSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    setStuFormError(null);

    if (!stuSchool) {
      setStuFormError('请在“所属院校”搜索下拉框中输入关键字并点选院校（不可自由输入）');
      return;
    }
    if (!['专科', '本科', '硕士', '博士及以上'].includes(stuEducation)) {
      setStuFormError('请选择您的学历层次（专科 / 本科 / 硕士 / 博士及以上）');
      return;
    }
    if (!stuMajor.trim()) {
      setStuFormError('请填写您就读的专业名称');
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(stuEnrollDate)) {
      setStuFormError('请选择有效的入学时间（格式 YYYY-MM）');
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(stuGradDate)) {
      setStuFormError('请选择有效的毕业时间（预计）（格式 YYYY-MM）');
      return;
    }
    if (stuGradDate <= stuEnrollDate) {
      setStuFormError('毕业时间（预计）必须晚于入学时间，请核对后重新选择');
      return;
    }

    const nowStr = '2026-10-28 10:25:00';
    const firstFile = stuManualFiles[0];
    const updated: UserProfileData = {
      ...user,
      role: 'student',
      roleLabel: '参赛学生',
      identityType: 'student',
      university: stuSchool,
      educationLevel: stuEducation,
      majorOrDept: stuMajor.trim(),
      enrollmentDate: stuEnrollDate,
      graduationDate: stuGradDate,
      studentProofFiles: stuManualFiles,
      academicStatus: 'pending',
      academicSubmittedAt: nowStr,
      academicRejectReason: undefined,
      isVerified: false,
    };
    onUpdateUser(updated);

    onSubmitVerificationApplication?.({
      applicantType: 'student',
      username: user.username,
      realName: user.name || user.username,
      idCard: user.idCard || '110108200305162819',
      phone: user.phone || '13810246921',
      email: user.email || `${user.username}@edu.cn`,
      university: stuSchool,
      institutionCode: '4111010006',
      majorOrDept: stuMajor.trim(),
      studentOrStaffId: user.studentId || 'STU2026001',
      levelOrTitle: stuEducation,
      enrollmentDate: stuEnrollDate,
      graduationDate: stuGradDate,
      submitChannel: '学生身份认证 · 高校管理员审核',
      materialFileName: firstFile?.name,
      materialPreviewUrl: firstFile?.url,
      attachments: stuManualFiles,
      applicantNote: `学历：${stuEducation}，专业：${stuMajor.trim()}，就读周期：${stuEnrollDate} 至 ${stuGradDate}`,
      submittedAt: nowStr,
    });

    setAdminNotificationBanner(
      `【系统通知】您的学生认证信息已直接推送至【${stuSchool}】高校管理员后台（认证管理 -> 学生认证）待审。`
    );
    onAddAuditLog({
      operator: user.username,
      ip: user.currentLoginIp,
      location: user.currentLoginLocation,
      device: 'Windows 11 / Chrome 130.0',
      action: '提交学生认证审核',
      result: '成功',
      detail: `院校：${stuSchool}，学历：${stuEducation}，专业：${stuMajor.trim()}，入学-毕业：${stuEnrollDate} 至 ${stuGradDate}`,
    });
    setAcademicModalOpen(null);
  };

  // 教师认证表单提交（直接变为“审核中”，并推送至后台【认证管理 -> 教师认证】）
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeaFormError(null);
    if (!teaSchool) {
      setTeaFormError('请从院校库下拉列表中选中标准学校名称');
      return;
    }
    if (!teaDept.trim()) {
      setTeaFormError('请填写所属院系/部门（如：计算机科学与技术学院）');
      return;
    }
    if (!teaMajor.trim()) {
      setTeaFormError('请填写您的专业名称（如：网络空间安全）');
      return;
    }
    if (!['专科', '本科', '硕士', '博士及以上'].includes(teaEducation)) {
      setTeaFormError('请选择您的学历层次（专科 / 本科 / 硕士 / 博士及以上）');
      return;
    }
    if (!teaStaffId.trim()) {
      setTeaFormError('请填写教工号');
      return;
    }
    if (teaFiles.length === 0) {
      setTeaFormError('请上传教师资格证或学校工作证/工牌等证明材料（最多不超过 10 个）');
      return;
    }
    if (teaFiles.length > 10) {
      setTeaFormError('上传的附件最多不超过 10 个');
      return;
    }

    const nowStr = '2026-10-28 10:30:00';
    const firstFile = teaFiles[0];
    const updated: UserProfileData = {
      ...user,
      role: 'teacher',
      roleLabel: '指导教师',
      identityType: 'teacher',
      university: teaSchool,
      majorOrDept: teaDept.trim(),
      teacherMajor: teaMajor.trim(),
      educationLevel: teaEducation,
      studentId: teaStaffId.trim(),
      academicStatus: 'pending',
      academicSubmittedAt: nowStr,
      academicRejectReason: undefined,
      isVerified: false,
    };
    onUpdateUser(updated);
    onSubmitVerificationApplication?.({
      applicantType: 'teacher',
      username: user.username,
      realName: user.name || user.username,
      idCard: user.idCard || '110108198505162819',
      phone: user.phone || '13810246921',
      email: user.email || `${user.username}@edu.cn`,
      university: teaSchool,
      institutionCode: '4111010006',
      majorOrDept: teaDept.trim(),
      teacherMajor: teaMajor.trim(),
      educationLevel: teaEducation,
      studentOrStaffId: teaStaffId.trim(),
      levelOrTitle: teaEducation,
      submitChannel: '指导教师资格人工审核（工作证 + 教师资格证）',
      materialFileName: firstFile.name,
      materialPreviewUrl: firstFile.url,
      attachments: teaFiles,
      applicantNote: `院系：${teaDept.trim()}，专业：${teaMajor.trim()}，学历层次：${teaEducation}`,
      submittedAt: nowStr,
    });
    setAdminNotificationBanner(
      `【系统通知】已根据您填写的学校（${teaSchool}），自动向后台【认证管理 -> 教师认证】发送指导教师资格待审核通知（共 ${teaFiles.length} 份附件）。`
    );
    onAddAuditLog({
      operator: user.username,
      ip: user.currentLoginIp,
      location: user.currentLoginLocation,
      device: 'Windows 11 / Chrome 130.0',
      action: '提交指导教师资格认证申请',
      result: '成功',
      detail: `学校：${teaSchool}，院系：${teaDept.trim()}，专业：${teaMajor.trim()}，学历：${teaEducation}，教工号：${teaStaffId.trim()}，附件数：${teaFiles.length}，状态已更新为【审核中】`,
    });
    setAcademicModalOpen(null);
  };

  // 高校管理员认证申请状态与逻辑
  const [univAdminModalOpen, setUnivAdminModalOpen] = useState(false);
  const [univAdminApplyNote, setUnivAdminApplyNote] = useState('');
  const [univAdminFormError, setUnivAdminFormError] = useState<string | null>(null);

  const handleOpenUnivAdminModal = () => {
    setUnivAdminApplyNote(
      user.univAdminRejectReason
        ? `针对上次驳回原因已重新核验授权资质：承诺如实履行【${user.university || '本校'}】网数智安全大赛高校管理员审核与提报职责。`
        : `本人系【${user.university || '北京大学'}】已认证指导教师，现申请本校网数智安全大赛高校管理员工作台权限，负责本校学生参赛身份认证、指导教师资质以及参赛队伍进行资格审核与校赛晋级名单提报。`
    );
    setUnivAdminFormError(null);
    setUnivAdminModalOpen(true);
  };

  const handleSubmitUnivAdminApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const nowStr = '2026-10-28 16:10:00';
    const updated: UserProfileData = {
      ...user,
      univAdminStatus: 'pending',
      univAdminSubmittedAt: nowStr,
      univAdminRejectReason: undefined,
    };
    onUpdateUser(updated);

    onSubmitVerificationApplication?.({
      applicantType: 'univ_admin',
      username: user.username,
      realName: user.name || user.username,
      idCard: user.idCard || '110108198505162819',
      phone: user.phone || '13810246921',
      email: user.email || `${user.username}@edu.cn`,
      university: user.university || '北京大学',
      institutionCode: '4111010006',
      majorOrDept: user.majorOrDept || '计算机科学与技术学院',
      teacherMajor: user.teacherMajor || '网络空间安全',
      educationLevel: user.educationLevel || '博士及以上',
      studentOrStaffId: user.studentId || 'T-20240901',
      levelOrTitle: user.educationLevel || '博士及以上',
      submitChannel: '高校管理员人工审核 · 组委会核验',
      applicantNote: univAdminApplyNote.trim() || '申请本校网数智安全大赛高校管理员工作台权限。',
      submittedAt: nowStr,
    });

    setAdminNotificationBanner(
      `【系统通知】已向大赛组委会提交【${user.university || '本校'}】高校管理员认证申请，审核通过后即可获得高校管理工作台权限！`
    );
    onAddAuditLog({
      operator: user.username,
      ip: user.currentLoginIp,
      location: user.currentLoginLocation,
      device: 'Windows 11 / Chrome 130.0',
      action: '提交高校管理员认证申请',
      result: '成功',
      detail: `申请人：${user.name || user.username}，学校：${user.university || '本校'}，状态已更新为【审核中】`,
    });
    setUnivAdminModalOpen(false);
  };

  // 判断学校与专业在【个人信息】中是否显示“未验证”
  const isAcademicVerified = user.academicStatus === 'verified';
  const isRealNameVerified = user.realNameStatus === 'verified';

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* 个人中心面包屑与快捷信息栏（顶部已展示平台主导航栏） */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <button
              type="button"
              onClick={onBackHome}
              className="flex items-center gap-1.5 font-bold text-[#1664FF] hover:text-[#0E4FD6] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回大赛首页</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">
              个人中心 &rsaquo;{' '}
              {activeTab === 'profile'
                ? '个人信息'
                : activeTab === 'certification'
                ? '用户认证'
                : activeTab === 'registrations'
                ? '我的报名'
                : activeTab === 'competitions'
                ? '我的竞赛'
                : '我的消息'}
            </span>
          </div>
        </div>
      </div>

      {/* 未完成实名与学生/教师认证时：顶部黄色引导横幅 */}
      {(!isRealNameVerified || !isAcademicVerified) && (
        <div className="bg-amber-50 border-b border-amber-300">
          <div className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                欢迎您！为了顺利报名参赛，请尽快完成实名认证与学生/教师认证。
              </span>
            </div>
            {activeTab !== 'certification' && (
              <button
                type="button"
                onClick={() => setActiveTab('certification')}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors self-start sm:self-auto"
              >
                前往【用户认证】 &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* 系统自动向高校管理员发送待审核通知提示条 */}
      {adminNotificationBanner && (
        <div className="bg-sky-900 text-white px-4 py-2.5 text-xs flex items-center justify-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{adminNotificationBanner}</span>
          <button
            type="button"
            onClick={() => setAdminNotificationBanner(null)}
            className="text-sky-200 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 flex-1 w-full flex flex-col lg:flex-row gap-8 items-start">
        {/* 左侧个人中心菜单 */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white text-lg font-extrabold flex items-center justify-center">
                {(user.name || user.username).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-slate-900 truncate">
                  {isRealNameVerified && user.name ? user.name : user.username}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {isAcademicVerified && user.university ? user.university : '学生/教师未验证'}
                </div>
              </div>
            </div>
          </div>

          <nav className="bg-white rounded-xl border border-slate-200 p-2 space-y-1">
            {[
              { id: 'profile', label: '个人信息', icon: User },
              { id: 'certification', label: '用户认证', icon: BadgeCheck },
              {
                id: 'registrations',
                label: `我的报名 (${
                  captainTeams.filter((t) => isTeamOwnedByUser(t, user)).length +
                  (user.username === 'linyuanhang' || user.name === '林远航'
                    ? participatedTeams.length
                    : 0)
                })`,
                icon: FileText,
              },
              {
                id: 'competitions',
                label: `我的竞赛 (${myApprovedCompetitions.length})`,
                icon: Trophy,
              },
              {
                id: 'messages',
                label: '我的消息',
                icon: Bell,
                badgeCount: unreadMsgCount,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`w-full px-4 py-2.5 rounded-lg text-left text-xs font-bold flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                    active
                      ? 'bg-[#0284C7] text-white'
                      : 'text-slate-700 hover:bg-sky-50 hover:text-[#0284C7]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  {'badgeCount' in item && typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                    <span
                      className={`min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center font-mono-num ${
                        active ? 'bg-white text-[#0284C7]' : 'bg-[#F53F3F] text-white'
                      }`}
                    >
                      {item.badgeCount > 99 ? '99+' : item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 右侧主体内容 */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* =================================================================
              Tab 1：个人信息（严格仅展示要求的 7 个字段，其他字段全部移除）
              1. 用户名（旁边显示修改按钮）
              2. 真实姓名
              3. 身份（参赛学生/指导教师）
              4. 学校（没验证过就显示未验证）
              5. 专业（没验证过就显示未验证）
              6. 手机（没绑定显示绑定按钮；绑定了显示中间四位变星号 + 修改按钮）
              7. 邮箱（没绑定显示绑定按钮；绑定了显示邮箱地址 + 修改按钮）
             ================================================================= */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                <h2 className="text-lg font-bold text-slate-900">个人信息</h2>
                {/* 便捷演示按钮：一键切换手机/邮箱绑定状态以测试未绑定拦截 */}
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        phone: user.phone ? '' : '13810246921',
                      })
                    }
                    className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                  >
                    {user.phone ? '演示：解绑手机号' : '演示：恢复手机号'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        email: user.email ? '' : 'linyuanhang@buaa.edu.cn',
                      })
                    }
                    className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                  >
                    {user.email ? '演示：解绑邮箱' : '演示：恢复邮箱'}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 px-6">
                {/* 1. 用户名（旁边显示修改按钮） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">用户名</span>
                  <div className="flex-1 flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-sm font-bold text-slate-900 font-mono-num">
                      {user.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal('username', 'modify')}
                      className="px-2.5 py-1 text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>修改</span>
                    </button>
                  </div>
                </div>

                {/* 2. 真实姓名 */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">真实姓名</span>
                  <div className="flex-1">
                    {isRealNameVerified && user.name ? (
                      <span className="text-sm font-bold text-slate-900">{user.name}</span>
                    ) : (
                      <span className="text-sm text-slate-400">未验证</span>
                    )}
                  </div>
                </div>

                {/* 3. 身份（参赛学生/指导教师） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">身份</span>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-slate-900">
                      {user.identityType === 'teacher' ? '指导教师' : '参赛学生'}
                    </span>
                  </div>
                </div>

                {/* 4. 学校（没验证过就显示未验证） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">学校</span>
                  <div className="flex-1">
                    {isAcademicVerified && user.university ? (
                      <span className="text-sm font-bold text-slate-900">{user.university}</span>
                    ) : (
                      <span className="text-sm text-slate-400">未验证</span>
                    )}
                  </div>
                </div>

                {/* 5. 专业（没验证过就显示未验证） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">专业</span>
                  <div className="flex-1">
                    {isAcademicVerified && user.majorOrDept ? (
                      <span className="text-sm font-bold text-slate-900">{user.majorOrDept}</span>
                    ) : (
                      <span className="text-sm text-slate-400">未验证</span>
                    )}
                  </div>
                </div>

                {/* 6. 手机（没绑定就显示绑定按钮，绑定了就显示手机号中间四位变星号，旁边显示修改按钮） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">手机</span>
                  <div className="flex-1 flex items-center justify-between sm:justify-start gap-4">
                    {user.phone && user.phone.trim() ? (
                      <>
                        <span className="text-sm font-bold text-slate-900 font-mono-num">
                          {maskPhone(user.phone)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal('phone', 'modify')}
                          className="px-2.5 py-1 text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>修改</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal('phone', 'bind')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>绑定</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 7. 邮箱（没绑定就显示绑定按钮，绑定了就显示邮箱地址，旁边显示修改按钮） */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500 w-28 shrink-0">邮箱</span>
                  <div className="flex-1 flex items-center justify-between sm:justify-start gap-4">
                    {user.email && user.email.trim() ? (
                      <>
                        <span className="text-sm font-bold text-slate-900 font-mono-num">
                          {user.email}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal('email', 'modify')}
                          className="px-2.5 py-1 text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>修改</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal('email', 'bind')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>绑定</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              Tab 2：用户认证（从上至下分为两个独立卡片区块：【实名认证】、【学生/教师认证】）
             ================================================================= */}
          {activeTab === 'certification' && (
            <div className="space-y-6">
              {/* 顶部调试/状态快速预览切换条（方便评审者一键切换测试所有状态分支） */}
              <div className="bg-slate-900 text-white rounded-xl p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>【用户认证】全状态分支演示切换台（可一键切换不同状态体验）</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        realNameStatus: 'unverified',
                        realNameFailCount: 0,
                        realNameLockedUntil: null,
                        academicStatus: 'unverified',
                        isVerified: false,
                      })
                    }
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    重置为：全部未认证(置灰模块二)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        ...user,
                        name: '林远航',
                        idCard: '110108200305162819',
                        realNameStatus: 'verified',
                        realNameVerifiedAt: '2026-10-28 10:00:00',
                        academicStatus: 'unverified',
                        isVerified: false,
                      })
                    }
                    className="px-2.5 py-1 rounded bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-300/30 text-emerald-100 cursor-pointer"
                  >
                    模拟：学生【未认证】（可点去验证）
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdentityRadio('student');
                      onUpdateUser({
                        ...user,
                        name: '林远航',
                        idCard: '110108200305162819',
                        realNameStatus: 'verified',
                        realNameVerifiedAt: '2026-10-28 10:00:00',
                        identityType: 'student',
                        university: '北京航空航天大学',
                        educationLevel: '本科',
                        majorOrDept: '网络空间安全',
                        enrollmentDate: '2024-09',
                        graduationDate: '2028-06',
                        academicStatus: 'pending',
                        academicSubmittedAt: '2026-10-28 10:30:00',
                        isVerified: false,
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-amber-500/25 hover:bg-amber-500/40 border border-amber-300/30 text-amber-100 cursor-pointer"
                  >
                    模拟：学生认证【审核中】
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdentityRadio('student');
                      onUpdateUser({
                        ...user,
                        name: '林远航',
                        idCard: '110108200305162819',
                        realNameStatus: 'verified',
                        realNameVerifiedAt: '2026-10-28 10:00:00',
                        identityType: 'student',
                        university: '北京航空航天大学',
                        educationLevel: '本科',
                        majorOrDept: '网络空间安全',
                        enrollmentDate: '2024-09',
                        graduationDate: '2028-06',
                        academicStatus: 'verified',
                        academicVerifiedAt: '2026-10-28',
                        isVerified: true,
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-sky-500/30 hover:bg-sky-500/50 border border-sky-300/30 text-white cursor-pointer"
                  >
                    模拟：学生【验证成功】
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdentityRadio('teacher');
                      onUpdateUser({
                        ...user,
                        name: '沈星河',
                        realNameStatus: 'verified',
                        identityType: 'teacher',
                        university: '北京大学',
                        majorOrDept: '网络空间安全学院',
                        teacherMajor: '网络空间安全',
                        educationLevel: '博士及以上',
                        academicStatus: 'pending',
                        academicSubmittedAt: '2026-10-28 10:30:00',
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-amber-500/25 hover:bg-amber-500/40 border border-amber-300/30 text-amber-100 cursor-pointer"
                  >
                    模拟：教师认证【审核中】
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdentityRadio('teacher');
                      onUpdateUser({
                        ...user,
                        name: '沈星河',
                        realNameStatus: 'verified',
                        identityType: 'teacher',
                        university: '北京大学',
                        majorOrDept: '网络空间安全学院',
                        teacherMajor: '网络空间安全',
                        educationLevel: '博士及以上',
                        academicStatus: 'verified',
                        academicVerifiedAt: '2026-10-28',
                        univAdminStatus: 'unverified',
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-sky-500/30 hover:bg-sky-500/50 border border-sky-300/30 text-white cursor-pointer"
                  >
                    模拟：教师【验证成功】
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdentityRadio('teacher');
                      onUpdateUser({
                        ...user,
                        name: '沈星河',
                        realNameStatus: 'verified',
                        identityType: 'teacher',
                        university: '北京大学',
                        majorOrDept: '网络空间安全学院',
                        teacherMajor: '网络空间安全',
                        educationLevel: '博士及以上',
                        academicStatus: 'rejected',
                        academicRejectReason: '院系部门与教工人事库信息不匹配，请补充工作证照片',
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-red-500/25 hover:bg-red-500/40 border border-red-300/30 text-red-100 cursor-pointer"
                  >
                    模拟：教师驳回【验证失败】
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdentityRadio('teacher');
                      onUpdateUser({
                        ...user,
                        name: '沈星河',
                        realNameStatus: 'verified',
                        identityType: 'teacher',
                        university: '北京大学',
                        majorOrDept: '网络空间安全学院',
                        teacherMajor: '网络空间安全',
                        educationLevel: '博士及以上',
                        academicStatus: 'verified',
                        univAdminStatus: 'pending',
                        univAdminSubmittedAt: '2026-10-28 16:10:00',
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-amber-500/25 hover:bg-amber-500/40 border border-amber-300/30 text-amber-100 cursor-pointer"
                  >
                    模拟：高校管理员【审核中】
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdentityRadio('teacher');
                      onUpdateUser({
                        ...user,
                        name: '沈星河',
                        realNameStatus: 'verified',
                        identityType: 'teacher',
                        university: '北京大学',
                        majorOrDept: '网络空间安全学院',
                        teacherMajor: '网络空间安全',
                        educationLevel: '博士及以上',
                        academicStatus: 'verified',
                        univAdminStatus: 'rejected',
                        univAdminRejectReason: '未提供加盖高校官方教务处或院系公章的管理授权委托证明',
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-red-500/25 hover:bg-red-500/40 border border-red-300/30 text-red-100 cursor-pointer"
                  >
                    模拟：高校管理员【被驳回】
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdentityRadio('teacher');
                      onUpdateUser({
                        ...user,
                        name: '沈星河',
                        realNameStatus: 'verified',
                        identityType: 'teacher',
                        university: '北京大学',
                        majorOrDept: '网络空间安全学院',
                        teacherMajor: '网络空间安全',
                        educationLevel: '博士及以上',
                        academicStatus: 'verified',
                        univAdminStatus: 'verified',
                        univAdminVerifiedAt: '2026-10-28 16:30:00',
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-300/30 text-emerald-100 cursor-pointer"
                  >
                    模拟：高校管理员【验证成功】
                  </button>
                </div>
              </div>

              {/* =============================================================
                  区块一：【实名认证】独立卡片
                 ============================================================= */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">实名认证</h3>
                  </div>

                  {/* 状态1：未认证 / 验证失败 时右侧显示【去验证】按钮；状态2：验证成功时按钮消失 */}
                  {user.realNameStatus !== 'verified' && (
                    <button
                      type="button"
                      disabled={Boolean(user.realNameLockedUntil)}
                      onClick={handleStartRealNameVerify}
                      className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      去验证
                    </button>
                  )}
                </div>

                <div className="pt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 w-24 shrink-0">认证状态：</span>
                    {user.realNameStatus === 'verified' ? (
                      <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>验证成功</span>
                      </span>
                    ) : user.realNameStatus === 'failed' ? (
                      <span className="font-bold text-red-600 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        <span>验证失败</span>
                      </span>
                    ) : (
                      <span className="font-bold text-red-600">未认证</span>
                    )}
                  </div>

                  {/* 连续错3次锁定24小时提示 */}
                  {user.realNameLockedUntil && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
                      <span>
                        由于连续 3 次实名认证失败，为防止恶意穷举他人身份证号，已锁定 24 小时后再试（解锁时间：
                        {user.realNameLockedUntil}）。
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateUser({
                            ...user,
                            realNameFailCount: 0,
                            realNameLockedUntil: null,
                          })
                        }
                        className="text-[#0284C7] font-bold underline ml-3 shrink-0 cursor-pointer"
                      >
                        演示解除锁定
                      </button>
                    </div>
                  )}

                  {/* 状态2：验证成功下方明细展示 */}
                  {user.realNameStatus === 'verified' && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">真实姓名：</span>
                        <span className="font-bold text-slate-900">{user.name || '林远航'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">身份证号：</span>
                        <span className="font-mono-num text-slate-700">
                          {(user.idCard || '110108200305162819').replace(
                            /^(\d{6})\d{8}(\w{4})$/,
                            '$1********$2'
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-24 shrink-0">验证时间：</span>
                        <span className="font-mono-num text-slate-700">
                          {user.realNameVerifiedAt || '2026-10-28 10:00:00'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* =============================================================
                  区块二：【学生/教师认证】独立卡片
                  前置依赖：必须完成实名认证，且已完善手机号、邮箱后解锁
                 ============================================================= */}
              <div
                className={`rounded-xl border transition-all p-6 relative ${
                  !isAcademicPrereqMet
                    ? 'bg-slate-100 border-slate-200 opacity-85'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        !isAcademicPrereqMet
                          ? 'bg-slate-200 text-slate-500'
                          : 'bg-sky-100 text-[#0284C7]'
                      }`}
                    >
                      <BadgeCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">学生/教师认证</h3>
                  </div>

                  {/* 操作按钮：
                      - 未认证：右侧显示【去验证】
                      - 审核中：【去验证】按钮消失
                      - 验证失败（驳回）：右侧按钮变为【重新验证】，点击后带着原数据回显到表单
                      - 验证成功：提供【修改认证信息】入口（修改后需重新走审核） */}
                  {isAcademicPrereqMet &&
                    (user.academicStatus === 'unverified' || user.academicStatus === 'rejected') && (
                      <button
                        type="button"
                        onClick={() => handleOpenAcademicModal()}
                        className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                      >
                        {user.academicStatus === 'rejected' ? '重新验证' : '去验证'}
                      </button>
                    )}

                  {isAcademicPrereqMet && user.academicStatus === 'verified' && (
                    <button
                      type="button"
                      onClick={() => handleOpenAcademicModal(user.identityType || 'student')}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-[#0284C7] border border-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      修改认证信息（需重新审核）
                    </button>
                  )}
                </div>

                {/* 前置条件检查提示条（实名认证 + 手机号 + 邮箱） */}
                {!isAcademicPrereqMet && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5 text-xs">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>申请学生认证或教师认证前，请先完成以下 3 项基础信息认证与绑定：</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold border ${
                          isRealNameDone
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white text-amber-800 border-amber-300'
                        }`}
                      >
                        {isRealNameDone ? '✓ 1. 实名认证已完成' : '○ 1. 实名认证（未完成）'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold border ${
                          isPhoneBound
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white text-amber-800 border-amber-300'
                        }`}
                      >
                        {isPhoneBound ? `✓ 2. 手机号已绑定（${maskPhone(user.phone)}）` : '○ 2. 手机号（未绑定）'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold border ${
                          isEmailBound
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white text-amber-800 border-amber-300'
                        }`}
                      >
                        {isEmailBound ? `✓ 3. 邮箱已绑定（${user.email}）` : '○ 3. 邮箱（未绑定）'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 卡片内容区 */}
                <div
                  className={`pt-5 space-y-4 text-sm ${
                    !isAcademicPrereqMet ? 'pointer-events-none opacity-60' : ''
                  }`}
                >
                  {/* 状态1：未认证 */}
                  {user.academicStatus === 'unverified' && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-28 shrink-0">身份选择：</span>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="academicIdentity"
                              checked={selectedIdentityRadio === 'student'}
                              onChange={() => setSelectedIdentityRadio('student')}
                              className="text-[#0284C7] focus:ring-[#0284C7]"
                            />
                            <span>参赛学生</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="academicIdentity"
                              checked={selectedIdentityRadio === 'teacher'}
                              onChange={() => setSelectedIdentityRadio('teacher')}
                              className="text-[#0284C7] focus:ring-[#0284C7]"
                            />
                            <span>指导教师</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-28 shrink-0">认证状态：</span>
                        <span className="font-bold text-slate-500">未认证</span>
                      </div>
                    </>
                  )}

                  {/* 状态2：审核中（橙色，【去验证】按钮消失，下方显示“已提交至 XX 院校管理员审核，请耐心等待”） */}
                  {user.academicStatus === 'pending' && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-28 shrink-0">我的身份：</span>
                        <span className="font-bold text-slate-900">
                          {user.identityType === 'teacher' ? '指导教师' : '参赛学生'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-28 shrink-0">认证状态：</span>
                        <span className="font-bold text-amber-600 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>审核中</span>
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 bg-amber-50/80 p-4 rounded-xl border border-amber-200">
                        <p className="text-amber-800 font-bold text-sm">
                          已提交至 {user.university || '北京航空航天大学'} 院校管理员审核，请耐心等待
                        </p>
                        {user.identityType === 'teacher' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-700">
                            <div>
                              <span className="text-slate-500">所属院校：</span>
                              <span className="font-bold text-slate-900">
                                {user.university || '北京航空航天大学'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">院系/部门：</span>
                              <span className="font-bold text-slate-900">
                                {user.majorOrDept || '网络空间安全学院'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">专业：</span>
                              <span className="font-bold text-slate-900">
                                {user.teacherMajor || '网络空间安全'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">学历层次：</span>
                              <span className="font-bold text-slate-900">
                                {user.educationLevel || '博士及以上'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-700">
                            <div>
                              <span className="text-slate-500">所属院校：</span>
                              <span className="font-bold text-slate-900">
                                {user.university || '北京航空航天大学'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">学历层次：</span>
                              <span className="font-bold text-slate-900">
                                {user.educationLevel || '本科'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">专业：</span>
                              <span className="font-bold text-slate-900">
                                {user.majorOrDept || '网络空间安全'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">入学 - 毕业时间：</span>
                              <span className="font-mono font-bold text-slate-900">
                                {user.enrollmentDate || '2024-09'} 至{' '}
                                {user.graduationDate || '2028-06'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* 状态3：认证成功（显示“验证成功”，下方展示填写的所有明细：院校、学历、专业、入学/毕业时间） */}
                  {user.academicStatus === 'verified' && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-28 shrink-0">我的身份：</span>
                        <span className="font-bold text-slate-900">
                          {user.identityType === 'teacher' ? '指导教师' : '参赛学生'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-28 shrink-0">认证状态：</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>验证成功</span>
                        </span>
                      </div>

                      {user.identityType === 'teacher' ? (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 w-28 shrink-0">所属院校：</span>
                            <span className="font-bold text-slate-900">
                              {user.university || '北京大学'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 w-28 shrink-0">院系/部门：</span>
                            <span className="font-bold text-slate-900">
                              {user.majorOrDept || '计算机科学与技术学院'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 w-28 shrink-0">专业：</span>
                            <span className="font-bold text-slate-900">
                              {user.teacherMajor || '网络空间安全'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 w-28 shrink-0">学历层次：</span>
                            <span className="px-2.5 py-0.5 rounded bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-bold">
                              {user.educationLevel || '博士及以上'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 w-28 shrink-0">认证时间：</span>
                            <span className="font-mono-num text-slate-700">
                              {user.academicVerifiedAt || '2026-10-28'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 w-28 shrink-0">所属院校：</span>
                            <span className="font-bold text-slate-900">
                              {user.university || '北京航空航天大学'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 w-28 shrink-0">学历层次：</span>
                            <span className="px-2.5 py-0.5 rounded bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-bold">
                              {user.educationLevel || '本科'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 w-28 shrink-0">专业：</span>
                            <span className="font-bold text-slate-900">
                              {user.majorOrDept || '网络空间安全'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 w-28 shrink-0">入学/毕业时间：</span>
                            <span className="font-mono-num font-bold text-slate-900">
                              {user.enrollmentDate || '2024-09'} 至{' '}
                              {user.graduationDate || '2028-06'}（预计）
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 pt-1">
                            说明：报名表中的“所属院校”、“学历”等字段将直接读取以上认证库数据且不可在报名表修改；如需变更，请点击右上角【修改认证信息（需重新审核）】。
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* 状态4：认证失败（驳回）—— 显示“验证失败（红色）”，下方展示驳回原因，按钮变为【重新验证】，点击后带着原数据回显到表单 */}
                  {user.academicStatus === 'rejected' && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-28 shrink-0">身份选择：</span>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="academicIdentityRe"
                              checked={selectedIdentityRadio === 'student'}
                              onChange={() => setSelectedIdentityRadio('student')}
                              className="text-[#0284C7]"
                            />
                            <span>参赛学生</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                            <input
                              type="radio"
                              name="academicIdentityRe"
                              checked={selectedIdentityRadio === 'teacher'}
                              onChange={() => setSelectedIdentityRadio('teacher')}
                              className="text-[#0284C7]"
                            />
                            <span>指导教师</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 w-28 shrink-0">认证状态：</span>
                        <span className="font-bold text-red-600 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>验证失败</span>
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
                        <div>
                          <span className="font-bold">驳回原因：</span>
                          <span>
                            {user.academicRejectReason ||
                              '专业名称与本校不符或预计毕业时间有误，请核对修改后重新提交'}
                          </span>
                        </div>
                        {user.identityType !== 'teacher' && (
                          <div className="pt-2 border-t border-red-200/70 text-[11px] text-red-700/90 flex flex-wrap gap-x-4 gap-y-1">
                            <span>上次填报院校：{user.university || '—'}</span>
                            <span>学历层次：{user.educationLevel || '本科'}</span>
                            <span>专业：{user.majorOrDept || '—'}</span>
                            <span>
                              入学-毕业：{user.enrollmentDate || '2024-09'} 至{' '}
                              {user.graduationDate || '2028-06'}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* =============================================================
                  区块三：【高校管理员认证】独立卡片
                  前置条件：只有已通过【指导教师认证】的教师账号方可申请
                 ============================================================= */}
              {(() => {
                const isTeacherVerified =
                  user.academicStatus === 'verified' && user.identityType === 'teacher';
                const adminStatus = user.univAdminStatus || 'unverified';

                return (
                  <div
                    className={`rounded-xl border transition-all p-6 relative ${
                      !isTeacherVerified
                        ? 'bg-slate-50/80 border-slate-200'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            !isTeacherVerified
                              ? 'bg-slate-200 text-slate-500'
                              : 'bg-sky-100 text-[#0284C7]'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span>高校管理员认证</span>
                            {!isTeacherVerified && (
                              <span className="text-[11px] font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                仅限已认证指导教师申请
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>

                      {/* 申请/重新申请认证按钮 */}
                      {isTeacherVerified && (
                        <div>
                          {adminStatus === 'unverified' && (
                            <button
                              type="button"
                              onClick={handleOpenUnivAdminModal}
                              className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                            >
                              申请认证
                            </button>
                          )}
                          {adminStatus === 'rejected' && (
                            <button
                              type="button"
                              onClick={handleOpenUnivAdminModal}
                              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                            >
                              重新申请认证
                            </button>
                          )}
                          {adminStatus === 'verified' && (
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>已是高校管理员</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 提示文案：高校管理员职责说明 */}
                    <div className="mt-4 p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-[#0369A1] flex items-start gap-2.5 leading-relaxed">
                      <Building2 className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0284C7]">高校管理员职责说明：</span>
                        高校管理员负责对本校学生的参赛身份认证、指导教师资质以及参赛队伍进行资格审核与校赛晋级名单提报。
                      </div>
                    </div>

                    {/* 未满足指导教师认证前置条件时的提示栏与快捷测试切换 */}
                    {!isTeacherVerified ? (
                      <div className="mt-4 p-4 rounded-xl bg-amber-50/90 border border-amber-200 space-y-3 text-xs">
                        <div className="font-bold text-amber-900 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>申请资格说明：目前仅支持通过【指导教师认证】的教师申请成为本校“高校管理员”</span>
                        </div>
                        <p className="text-amber-800 leading-relaxed">
                          您当前账号身份为【{user.roleLabel || (user.identityType === 'teacher' ? '指导教师' : '参赛学生')}】，
                          尚未通过教师资格认证。请先在上方完成指导教师资质认证后，即可开通高校管理员申请通道。
                        </p>
                      </div>
                    ) : (
                      /* 教师已通过认证：显示高校管理员审核状态及明细 */
                      <div className="pt-5 space-y-4 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 w-28 shrink-0">认证状态：</span>
                          {adminStatus === 'unverified' && (
                            <span className="font-bold text-slate-500">未认证</span>
                          )}
                          {adminStatus === 'pending' && (
                            <span className="font-bold text-amber-600 flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>审核中</span>
                            </span>
                          )}
                          {adminStatus === 'verified' && (
                            <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>验证成功</span>
                            </span>
                          )}
                          {adminStatus === 'rejected' && (
                            <span className="font-bold text-red-600 flex items-center gap-1.5">
                              <XCircle className="w-4 h-4" />
                              <span>验证失败</span>
                            </span>
                          )}
                        </div>

                        {/* 状态 1：未认证 */}
                        {adminStatus === 'unverified' && (
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                            <div className="font-bold text-slate-800">
                              申请高校：{user.university || '北京大学'} · 申请人：{user.name || user.username}
                            </div>
                            <p className="text-slate-500 leading-relaxed">
                              您已具备指导教师资质，点击右上角【申请认证】提交后，组委会/秘书处将进行资格复核，审核通过后您将拥有本校队伍初审与校赛晋级名单提报权限。
                            </p>
                          </div>
                        )}

                        {/* 状态 2：审核中 */}
                        {adminStatus === 'pending' && (
                          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-slate-700 space-y-2.5">
                            <div className="text-amber-800 font-bold text-sm flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>已提交至大赛组委会/秘书处审核，请耐心等待</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-amber-200/70">
                              <div>
                                <span className="text-slate-500">申请高校：</span>
                                <span className="font-bold text-slate-900">{user.university}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">申请教师：</span>
                                <span className="font-bold text-slate-900">{user.name || user.username}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">联系手机：</span>
                                <span className="font-mono font-bold text-slate-900">{user.phone}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">提交时间：</span>
                                <span className="font-mono text-slate-700">{user.univAdminSubmittedAt || '2026-10-28 16:10:00'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 状态 3：已通过 */}
                        {adminStatus === 'verified' && (
                          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-slate-700 space-y-2.5">
                            <div className="text-emerald-800 font-bold text-sm flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>您已成功获得【{user.university}】高校管理员权限</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-emerald-200/70">
                              <div>
                                <span className="text-slate-500">所属高校：</span>
                                <span className="font-bold text-slate-900">{user.university}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">审核人：</span>
                                <span className="font-bold text-slate-900">{user.univAdminReviewer || '组委会超级管理员'}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">通过时间：</span>
                                <span className="font-mono text-slate-700">{user.univAdminVerifiedAt || '2026-10-28 16:30:00'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 状态 4：已驳回（显示驳回原因，提供重新申请认证入口） */}
                        {adminStatus === 'rejected' && (
                          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-red-700">
                              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>高校管理员认证申请未通过（已驳回）</span>
                            </div>
                            <div className="p-3 rounded-lg bg-white/80 border border-red-200 text-red-900 font-medium">
                              <span className="font-bold text-red-600">驳回原因：</span>
                              {user.univAdminRejectReason ||
                                '未提供加盖高校官方教务处或院系公章的管理授权委托证明，请重新核实后提交。'}
                            </div>
                            <p className="text-slate-600 leading-relaxed pt-1">
                              您可以核对驳回原因后，点击右上角【重新申请认证】更新申请说明或补充材料后再次提交。
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Tab 3：我的报名（四页面完整闭环：我发起的[队长视角] / 我参与的[队员与指导教师视角]） */}
          {activeTab === 'registrations' && (
            <MyRegistrationsClosedLoopModule
              currentUser={user}
              captainTeams={captainTeams}
              onUpdateCaptainTeams={onUpdateCaptainTeams}
              participatedTeams={participatedTeams}
              onUpdateParticipatedTeams={onUpdateParticipatedTeams}
              platformUsers={platformUsers}
              competitions={competitions}
              registrationConfigs={registrationConfigs}
              onContinueEditDraft={onContinueEditDraft}
              onJumpToCertification={() => setActiveTab('certification')}
            />
          )}

          {/* Tab 4：我的竞赛（准入规则收紧：仅展示通过秘书处终审、状态为【报名成功】的最终参赛队伍档案） */}
          {activeTab === 'competitions' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">我的竞赛</h2>
                </div>
              </div>

              {myApprovedCompetitions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  暂无通过秘书处终审、报名状态为“报名成功”的赛事档案。请先在【我的报名】中查看报名与审核进度。
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                        <th className="py-3.5 px-4 min-w-[200px]">赛事名称</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">起止时间</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">赛事状态</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">参赛队伍名称</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">校内排名</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">我的身份</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs sm:text-sm bg-white">
                      {myApprovedCompetitions.map((item) => (
                        <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                          {/* 1. 赛事名称 */}
                          <td className="py-4 px-4 align-middle">
                            <div className="font-bold text-slate-900 line-clamp-2">
                              {item.competitionTitle}
                            </div>
                          </td>

                          {/* 2. 起止时间 */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap font-mono-num text-xs text-slate-600">
                            <div>{item.startDate}</div>
                            <div className="text-slate-400">至 {item.endDate}</div>
                          </td>

                          {/* 4. 赛事状态（未开始/进行中/已结束） */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            {item.statusKey === 'ongoing' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>{item.statusLabel}</span>
                              </span>
                            )}
                            {item.statusKey === 'upcoming' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>{item.statusLabel}</span>
                              </span>
                            )}
                            {item.statusKey === 'ended' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>{item.statusLabel}</span>
                              </span>
                            )}
                          </td>

                          {/* 5. 参赛队伍名称 */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap font-extrabold text-slate-900">
                            {item.teamName}
                          </td>

                          {/* 6. 最终校内排名 */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold">
                              <Trophy className="w-3.5 h-3.5 text-amber-600" />
                              <span>校内排名：第{item.schoolRank || 1}名</span>
                            </span>
                          </td>

                          {/* 7. 我的身份（队长/队员/指导教师） */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${
                                item.myRole === '队长'
                                  ? 'bg-sky-50 text-[#0284C7] border-sky-200'
                                  : item.myRole === '指导教师'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {item.myRole}
                            </span>
                          </td>

                          {/* 8. 交互操作：【查看赛事详情】、【查看队伍详情】 */}
                          <td className="py-4 px-4 align-middle text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  onViewCompetitionDetail &&
                                  onViewCompetitionDetail(item.competitionId)
                                }
                                className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer transition-colors"
                              >
                                查看赛事详情
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setSnapshotDrawerItem({
                                    competitionTitle: item.competitionTitle,
                                    myRole: item.myRole,
                                    snapshot: item.snapshot,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold cursor-pointer transition-colors"
                              >
                                查看队伍详情
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              Tab 5：我的消息（与顶部导航栏右侧铃铛按钮消息内容 100% 同步）
             ================================================================= */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* 1. 顶部区：左侧显示“我的消息”，右侧显示“未读消息：X 条” + 【全部标记为已读】文本按钮 */}
              <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">我的消息</h2>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* 便捷演示开关：一键切换实名/学籍认证状态以测试点击【同意】时的未认证拦截弹窗 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (user.isVerified && user.realNameStatus === 'verified' && user.academicStatus === 'verified') {
                        onUpdateUser({
                          ...user,
                          isVerified: false,
                          academicStatus: 'unverified',
                        });
                      } else {
                        onUpdateUser({
                          ...user,
                          name: user.name || '林远航',
                          university: user.university || '北京航空航天大学',
                          majorOrDept: user.majorOrDept || '网络空间安全学院',
                          realNameStatus: 'verified',
                          academicStatus: 'verified',
                          isVerified: true,
                        });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      user.isVerified && user.realNameStatus === 'verified' && user.academicStatus === 'verified'
                        ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800'
                        : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800'
                    }`}
                  >
                    {user.isVerified && user.realNameStatus === 'verified' && user.academicStatus === 'verified'
                      ? '演示测试：模拟未完成认证（测试点击【同意】弹窗拦截）'
                      : '当前为未认证状态（点击恢复为已认证）'}
                  </button>

                  <div className="flex items-center gap-3 text-xs sm:text-sm">
                    <span className="text-slate-600 font-medium">
                      未读消息：
                      <strong
                        className={`font-mono-num font-extrabold ${
                          unreadMsgCount > 0 ? 'text-[#F53F3F]' : 'text-slate-900'
                        }`}
                      >
                        {unreadMsgCount}
                      </strong>{' '}
                      条
                    </span>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      disabled={unreadMsgCount === 0}
                      onClick={() => onMarkAllMessagesRead && onMarkAllMessagesRead()}
                      className={`font-bold transition-colors ${
                        unreadMsgCount > 0
                          ? 'text-[#0284C7] hover:text-[#0369A1] hover:underline cursor-pointer'
                          : 'text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      全部标记为已读
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. 分类Tab区：【全部】、【组队邀请】、【审核与反馈】、【系统通知】 + 角色视角切换 */}
              <div className="px-6 pt-3 pb-3 bg-slate-50/70 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {(
                    [
                      { id: 'all', label: '全部' },
                      { id: 'invite', label: '组队邀请' },
                      { id: 'review', label: '审核与反馈' },
                      { id: 'system', label: '系统通知' },
                    ] as const
                  ).map((tab) => {
                    const active = msgCategoryTab === tab.id;
                    const catList = messages.filter((m) => {
                      if (tab.id === 'all') return true;
                      const resolvedCat: MessageCategoryTab =
                        m.category ||
                        (m.scenarioType === 'team_invite'
                          ? 'invite'
                          : m.scenarioType === 'removed_from_team' ||
                            m.scenarioType === 'univ_channel_open' ||
                            m.scenarioType === 'cert_result'
                          ? 'system'
                          : 'review');
                      return resolvedCat === tab.id;
                    });
                    const catUnread = catList.filter((m) => m.unread).length;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setMsgCategoryTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
                          active
                            ? 'bg-[#0284C7] text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-[#0284C7] hover:text-[#0284C7]'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`text-[11px] font-mono-num px-1.5 py-0.2 rounded-full ${
                            active
                              ? 'bg-white/20 text-white'
                              : catUnread > 0
                              ? 'bg-red-50 text-[#F53F3F] font-extrabold'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {catList.length}
                        </span>
                        {catUnread > 0 && !active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F53F3F]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 辅助角色视角筛选（展示队长、队员/指导教师、高校管理员、秘书处、全角色通用 5 类视角） */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-slate-400 font-medium mr-1">角色场景预览：</span>
                  {(
                    [
                      { id: 'all', label: '全部角色' },
                      { id: '队长视角', label: '队长视角' },
                      { id: '队员/指导教师视角', label: '队员/指导教师' },
                      { id: '高校管理员视角', label: '高校管理员' },
                      { id: '秘书处视角', label: '秘书处' },
                      { id: '全角色通用', label: '通用系统' },
                    ] as const
                  ).map((rp) => {
                    const isSelected = msgRoleFilter === rp.id;
                    return (
                      <button
                        key={rp.id}
                        type="button"
                        onClick={() => setMsgRoleFilter(rp.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-100 text-[#0284C7] border border-sky-300 font-bold'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {rp.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. 列表区：消息流横向卡片，按时间倒序排列，左中右结构 */}
              <div className="divide-y divide-slate-100">
                {filteredMessages.length === 0 ? (
                  <div className="py-16 text-center text-xs sm:text-sm text-slate-400 space-y-2">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5]" />
                    <div>当前分类下暂无消息通知</div>
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isUserAvatar = msg.iconStyle === 'avatar' || Boolean(msg.senderName);
                    const resolvedAction: MessageRightActionType =
                      msg.actionType ||
                      (msg.scenarioType === 'team_invite'
                        ? 'invite_actions'
                        : msg.scenarioType === 'review_rejected'
                        ? 'go_modify'
                        : msg.scenarioType === 'removed_from_team'
                        ? 'none'
                        : msg.scenarioType === 'univ_todo' ||
                          msg.scenarioType === 'univ_channel_open' ||
                          msg.scenarioType === 'sec_todo'
                        ? 'go_admin'
                        : msg.scenarioType === 'cert_result'
                        ? 'go_cert'
                        : 'view_detail');

                    return (
                      <div
                        key={msg.id}
                        onClick={() => {
                          if (msg.unread && onMarkMessageRead) {
                            onMarkMessageRead(msg.id);
                          }
                        }}
                        className={`px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
                          msg.unread ? 'bg-sky-50/35 hover:bg-sky-50/70' : 'bg-white hover:bg-slate-50/80'
                        }`}
                      >
                        {/* 左侧头像/图标：用户交互类显示对方头像；系统/审核类显示带颜色的系统Icon */}
                        <div className="shrink-0">
                          {isUserAvatar ? (
                            msg.senderAvatarUrl ? (
                              <img
                                src={msg.senderAvatarUrl}
                                alt={msg.senderName || '用户头像'}
                                className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white text-sm font-extrabold flex items-center justify-center shadow-2xs">
                                {(msg.senderName || msg.title).slice(0, 1)}
                              </div>
                            )
                          ) : msg.iconStyle === 'success' ? (
                            <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          ) : msg.iconStyle === 'error' ? (
                            <div className="w-11 h-11 rounded-full bg-red-50 border border-red-200 text-[#F53F3F] flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                          ) : msg.iconStyle === 'warning' ? (
                            <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-sky-50 border border-sky-200 text-[#0284C7] flex items-center justify-center">
                              <Bell className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        {/* 中部内容：第一行标题（未读时加粗，带小红点）；第二行摘要内容（超过一行省略号截断）；第三行时间 */}
                        <div className="flex-1 min-w-0 space-y-1">
                          {/* 第一行：标题（未读加粗 + 小红点 + 角色/类型标签） */}
                          <div className="flex items-center gap-2 min-w-0">
                            {msg.unread && (
                              <span
                                className="w-2 h-2 rounded-full bg-[#F53F3F] shrink-0"
                                title="未读消息"
                              />
                            )}
                            <span
                              className={`text-sm truncate ${
                                msg.unread
                                  ? 'font-extrabold text-slate-900'
                                  : 'font-medium text-slate-700'
                              }`}
                            >
                              {msg.title}
                            </span>
                            {msg.messageTypeLabel && (
                              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                {msg.messageTypeLabel}
                              </span>
                            )}
                            {msg.rolePerspective && (
                              <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-[#0284C7] border border-sky-200/80 shrink-0">
                                {msg.rolePerspective}
                              </span>
                            )}
                          </div>

                          {/* 第二行：摘要内容（超过一行省略号截断） */}
                          <p
                            className={`text-xs sm:text-sm truncate ${
                              msg.unread ? 'text-slate-700 font-medium' : 'text-slate-500'
                            }`}
                            title={msg.desc}
                          >
                            {msg.desc}
                          </p>

                          {/* 若为入队邀请消息，展示队伍名、队长名及队长分配的初始角色标签 */}
                          {msg.scenarioType === 'team_invite' && (() => {
                            const inviteTeam =
                              msg.inviteTeamPayload ||
                              participatedTeams.find((pt) => pt.id === msg.relatedParticipatedTeamId);
                            if (!inviteTeam) return null;
                            const isAdvisorInvite = inviteTeam.myRoleInTeam === '指导教师';
                            return (
                              <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                                <span className="text-slate-500">
                                  队伍：<strong className="text-slate-800">{inviteTeam.teamName}</strong>
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-500">
                                  队长：<strong className="text-slate-800">{inviteTeam.captainName}</strong>
                                </span>
                                {!isAdvisorInvite && (
                                  <>
                                    <span className="text-slate-300">|</span>
                                    <div className="inline-flex items-center gap-1.5 flex-wrap">
                                      <span className="text-slate-500">队长分配初始角色：</span>
                                      <CtfRoleBadges
                                        roles={inviteTeam.myCtfRoles}
                                        emptyText="待分配"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })()}

                          {/* 第三行：时间 */}
                          <div className="text-xs text-slate-400 font-mono-num">
                            {msg.time}
                          </div>
                        </div>

                        {/* 右侧操作区 */}
                        <div
                          className="shrink-0 flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* 1. 邀请类：支持点开邀请详情查看角色，未处理显示高亮主色【同意加入】和普通【拒绝】按钮；已处理显示灰色文字 已同意 或 已拒绝 */}
                          {resolvedAction === 'invite_actions' && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (msg.unread && onMarkMessageRead) {
                                    onMarkMessageRead(msg.id);
                                  }
                                  setDetailModalMessage(msg);
                                }}
                                className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] hover:underline px-2 py-1 cursor-pointer transition-colors"
                              >
                                邀请详情
                              </button>
                              {(!msg.inviteStatus || msg.inviteStatus === 'pending') ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onAcceptInviteMessage && onAcceptInviteMessage(msg)
                                    }
                                    className="px-3.5 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                                  >
                                    同意加入
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onRejectInviteMessage && onRejectInviteMessage(msg)
                                    }
                                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold cursor-pointer transition-colors"
                                  >
                                    拒绝
                                  </button>
                                </div>
                              ) : msg.inviteStatus === 'accepted' ? (
                                <span className="text-xs font-semibold text-slate-400 px-2 py-1 select-none">
                                  已同意
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-slate-400 px-2 py-1 select-none">
                                  已拒绝
                                </span>
                              )}
                            </div>
                          )}

                          {/* 2. 需处理类（如被驳回）：展示【去修改】按钮 */}
                          {resolvedAction === 'go_modify' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (msg.unread && onMarkMessageRead) {
                                  onMarkMessageRead(msg.id);
                                }
                                setActiveTab('registrations');
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-colors"
                            >
                              去修改
                            </button>
                          )}

                          {/* 3. 高校管理员 / 秘书处待办或通道开启：展示【去后台处理】按钮 */}
                          {resolvedAction === 'go_admin' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (msg.unread && onMarkMessageRead) {
                                  onMarkMessageRead(msg.id);
                                }
                                if (onGoToAdminBackend) {
                                  onGoToAdminBackend();
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer transition-colors"
                            >
                              去后台处理
                            </button>
                          )}

                          {/* 4. 全角色通用认证结果类：展示【去查看】按钮 */}
                          {resolvedAction === 'go_cert' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (msg.unread && onMarkMessageRead) {
                                  onMarkMessageRead(msg.id);
                                }
                                setActiveTab('certification');
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-bold cursor-pointer transition-colors"
                            >
                              去查看
                            </button>
                          )}

                          {/* 5. 纯通知类（除“被移出队伍”无按钮外）：展示【查看详情】文本链接 */}
                          {resolvedAction === 'view_detail' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (msg.unread && onMarkMessageRead) {
                                  onMarkMessageRead(msg.id);
                                }
                                setDetailModalMessage(msg);
                              }}
                              className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] hover:underline px-2 py-1 cursor-pointer transition-colors"
                            >
                              查看详情
                            </button>
                          )}

                          {/* 6. 被移出队伍：无操作按钮（纯通知） */}
                          {resolvedAction === 'none' && null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          弹窗：【我的消息 -> 查看详情】消息全文与关联业务跳转弹窗
         ===================================================================== */}
      {detailModalMessage && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="font-bold text-sm">
                  消息详情{detailModalMessage.messageTypeLabel ? ` · ${detailModalMessage.messageTypeLabel}` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalMessage(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">
                  {detailModalMessage.title}
                </h3>
                <span className="text-xs text-slate-400 font-mono-num shrink-0">
                  {detailModalMessage.time}
                </span>
              </div>
              {detailModalMessage.rolePerspective && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">触发角色场景：</span>
                  <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[#0284C7] font-bold">
                    {detailModalMessage.rolePerspective}
                  </span>
                </div>
              )}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {detailModalMessage.desc}
              </div>

              {/* 队员视角：在【消息中心】点开邀请详情时，展示队伍名、队长名以及队长分配的初始角色标签 */}
              {detailModalMessage.scenarioType === 'team_invite' && (() => {
                const inviteTeam =
                  detailModalMessage.inviteTeamPayload ||
                  participatedTeams.find(
                    (pt) => pt.id === detailModalMessage.relatedParticipatedTeamId
                  );
                if (!inviteTeam) return null;
                const isAdvisorInvite = inviteTeam.myRoleInTeam === '指导教师';
                return (
                  <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2.5 text-xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>入队邀请详情单</span>
                      <span className="text-[11px] font-semibold text-[#0284C7]">
                        受激身份：{inviteTeam.myRoleInTeam}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-500">队伍名称：</span>
                        <strong className="text-slate-900">{inviteTeam.teamName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">发起队长：</span>
                        <strong className="text-slate-900">{inviteTeam.captainName}</strong>
                      </div>
                    </div>
                    {!isAdvisorInvite && (
                      <div className="pt-2 border-t border-sky-200/70 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-600 font-semibold">
                            队长给您分配的初始角色标签：
                          </span>
                          <CtfRoleBadges
                            roles={inviteTeam.myCtfRoles}
                            emptyText="待分配"
                          />
                        </div>
                        <span className="text-[11px] text-slate-500">
                          点击【同意加入】后角色标签正式生效（如需调整请联系队长修改）
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDetailModalMessage(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  关闭
                </button>
                {detailModalMessage.scenarioType === 'team_invite' &&
                  (!detailModalMessage.inviteStatus ||
                    detailModalMessage.inviteStatus === 'pending') && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (onRejectInviteMessage) {
                            onRejectInviteMessage(detailModalMessage);
                          }
                          setDetailModalMessage(null);
                        }}
                        className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        拒绝邀请
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onAcceptInviteMessage) {
                            onAcceptInviteMessage(detailModalMessage);
                          }
                          setDetailModalMessage(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer shadow-xs"
                      >
                        同意加入
                      </button>
                    </>
                  )}
                {(detailModalMessage.relatedCaptainTeamId ||
                  detailModalMessage.relatedParticipatedTeamId ||
                  detailModalMessage.category === 'review') && (
                  <button
                    type="button"
                    onClick={() => {
                      setDetailModalMessage(null);
                      setActiveTab('registrations');
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                  >
                    前往【我的报名】查看队伍 &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗：【我的竞赛 -> 查看队伍详情】（完整回显报名时填写的所有队伍字段 + 每个队员的手机号与邮箱）
         ===================================================================== */}
      {snapshotDrawerItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden my-auto">
            {/* 弹窗顶部栏 */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between shrink-0">
              <div>
                <div className="text-[11px] text-sky-100 font-semibold">
                  报名成功队伍档案 · 完整报名信息
                </div>
                <h3 className="text-base sm:text-lg font-extrabold mt-0.5">
                  查看队伍详情（{snapshotDrawerItem.snapshot.teamName}）
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSnapshotDrawerItem(null)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 弹窗主体内容区 */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* 一、赛事与队伍基本信息（对应报名表第一部分所有字段） */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[#0284C7]" />
                    <span>一、赛事与队伍基本信息</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold">
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        校内排名：第{snapshotDrawerItem.snapshot.schoolRank || 1}名
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>报名成功</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4 text-xs">
                  {/* 队伍 LOGO + 队伍名称 + 我的参赛身份 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                    <div className="flex items-center gap-3.5">
                      <TeamLogoAvatar
                        logo={snapshotDrawerItem.snapshot.teamLogo}
                        teamName={snapshotDrawerItem.snapshot.teamName}
                        size="lg"
                      />
                      <div className="space-y-1">
                        <div className="text-[11px] text-slate-400 font-semibold">
                          队伍名称 &amp; 队伍 LOGO
                        </div>
                        <div className="text-base sm:text-lg font-extrabold text-slate-900">
                          {snapshotDrawerItem.snapshot.teamName}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <span>
                            所属院校：
                            <strong className="text-[#0369A1]">
                              {snapshotDrawerItem.snapshot.university}
                            </strong>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span>
                            校内排名：
                            <strong className="text-amber-700">
                              第{snapshotDrawerItem.snapshot.schoolRank || 1}名
                            </strong>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span>
                            发起队长：
                            <strong className="text-slate-900">
                              {snapshotDrawerItem.snapshot.captainName}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-slate-400 block mb-1">我的参赛身份</span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-extrabold border ${
                          snapshotDrawerItem.myRole === '队长'
                            ? 'bg-sky-50 text-[#0284C7] border-sky-200'
                            : snapshotDrawerItem.myRole === '指导教师'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {snapshotDrawerItem.myRole}
                      </span>
                    </div>
                  </div>

                  {/* 赛事名称、所属院校、报名时间等完整字段 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block mb-1">赛事名称</span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {snapshotDrawerItem.snapshot.competitionTitle ||
                          snapshotDrawerItem.competitionTitle}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">所属院校</span>
                      <span className="font-bold text-slate-800">
                        {snapshotDrawerItem.snapshot.university}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">校内排名</span>
                      <span className="font-extrabold text-amber-700">
                        校内排名：第{snapshotDrawerItem.snapshot.schoolRank || 1}名（高校晋级提报确认）
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">发起队长及联系方式</span>
                      <span className="font-semibold text-slate-800 font-mono-num">
                        {snapshotDrawerItem.snapshot.captainName}
                        {snapshotDrawerItem.snapshot.captainPhone
                          ? ` · ${snapshotDrawerItem.snapshot.captainPhone}`
                          : ''}
                        {snapshotDrawerItem.snapshot.captainEmail
                          ? ` · ${snapshotDrawerItem.snapshot.captainEmail}`
                          : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">秘书处终审通过时间</span>
                      <span className="font-mono-num text-slate-700">
                        {snapshotDrawerItem.snapshot.approvedAt}
                      </span>
                    </div>

                    {/* 队伍介绍（报名表必填项） */}
                    <div className="sm:col-span-2 pt-3 border-t border-slate-200/80">
                      <span className="text-slate-400 block mb-1">队伍介绍（简短介绍）</span>
                      <p className="text-slate-800 text-xs sm:text-sm leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                        {snapshotDrawerItem.snapshot.teamIntro || '专注网络与数据安全攻防技术研究。'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 二、成员管理明细（完整回显队长、团队成员、指导教师的姓名、身份、院校、手机号、邮箱） */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#0284C7]" />
                    <span>
                      二、队伍成员与指导教师名单（共 {snapshotDrawerItem.snapshot.members.length} 人）
                    </span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    含队长、团队成员及指导教师完整联系方式
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                        <th className="py-3 px-3.5 whitespace-nowrap">姓名 / 队内角色</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">队伍身份</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">队内角色</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">所属院校</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">手机号</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">电子邮箱</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {snapshotDrawerItem.snapshot.members.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="font-bold text-slate-900">{m.name}</div>
                            {m.role !== '指导教师' && (
                              <div className="mt-1">
                                <CtfRoleBadges roles={m.ctfRoles} emptyText="待分配" />
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border ${
                                m.role === '队长'
                                  ? 'bg-sky-50 text-[#0284C7] border-sky-200'
                                  : m.role === '指导教师'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {m.role}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <CtfRoleBadges
                              roles={m.ctfRoles}
                              isAdvisor={m.role === '指导教师'}
                              emptyText="-"
                            />
                          </td>
                          <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                            {m.university}
                          </td>
                          <td className="py-3 px-3.5 font-mono-num text-slate-700 whitespace-nowrap">
                            {m.phone || '-'}
                          </td>
                          <td className="py-3 px-3.5 font-mono-num text-slate-700 whitespace-nowrap">
                            {m.email || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 弹窗底部栏 */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSnapshotDrawerItem(null)}
                className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                关闭弹窗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 A：【个人信息】修改用户名 / 绑定或修改手机 / 绑定或修改邮箱
         ===================================================================== */}
      {editFieldModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-base">
                {editFieldModal.type === 'username'
                  ? '修改用户名'
                  : editFieldModal.type === 'phone'
                  ? editFieldModal.mode === 'bind'
                    ? '绑定手机号码'
                    : '修改手机号码'
                  : editFieldModal.mode === 'bind'
                  ? '绑定电子邮箱'
                  : '修改电子邮箱'}
              </span>
              <button
                type="button"
                onClick={() => setEditFieldModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFieldModal} className="p-6 space-y-4">
              {fieldError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {fieldError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {editFieldModal.type === 'username'
                    ? '新用户名（4-20位字母或数字）'
                    : editFieldModal.type === 'phone'
                    ? '手机号码（11位）'
                    : '电子邮箱地址'}
                </label>
                <input
                  type="text"
                  required
                  value={fieldInputValue}
                  onChange={(e) => setFieldInputValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                />
              </div>

              {editFieldModal.type !== 'username' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {editFieldModal.type === 'phone' ? '短信验证码' : '邮件验证码'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={fieldSmsCode}
                      onChange={(e) => setFieldSmsCode(e.target.value)}
                      placeholder="请输入6位验证码"
                      className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={fieldCountdown > 0}
                      onClick={() => {
                        setFieldCountdown(60);
                        setFieldSmsCode('829104');
                      }}
                      className="px-3.5 py-2.5 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      {fieldCountdown > 0 ? `${fieldCountdown}秒后重发` : '获取验证码'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditFieldModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 B1：实名认证 — 未绑定手机号提示弹窗
         ===================================================================== */}
      {realNameModalStep === 'unbound-phone' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <span className="font-bold text-base">需要绑定手机号</span>
              <button
                type="button"
                onClick={() => setRealNameModalStep(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                您尚未绑定手机号，请先前往【个人信息】完成绑定
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRealNameModalStep(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRealNameModalStep(null);
                    setActiveTab('profile');
                    handleOpenEditModal('phone', 'bind');
                  }}
                  className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  去绑定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 B2：实名认证 — 第一步：已绑定手机号原地弹出短信验证码弹窗
         ===================================================================== */}
      {realNameModalStep === 'sms-verify' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-base">实名认证 — 手机短信核验</span>
              <button
                type="button"
                onClick={() => setRealNameModalStep(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRnSmsNext} className="p-6 space-y-4">
              {rnSmsError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {rnSmsError}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span>已绑定手机号：</span>
                <strong className="font-mono-num text-sm text-slate-900 ml-1">
                  {maskPhone(user.phone)}
                </strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  短信验证码（6位）
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    maxLength={6}
                    value={rnSmsCode}
                    onChange={(e) => setRnSmsCode(e.target.value)}
                    placeholder="请输入6位验证码"
                    className="flex-1 px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={rnSmsCountdown > 0}
                    onClick={() => {
                      setRnSmsCountdown(60);
                      setRnSmsCode('839201');
                    }}
                    className="px-3.5 py-2.5 rounded-lg text-xs font-bold border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {rnSmsCountdown > 0 ? `${rnSmsCountdown}秒后重发` : '获取验证码'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRealNameModalStep(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  下一步
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 B3：实名认证 — 第二步：实名信息填写弹窗（含公安接口Loading与失败重试）
         ===================================================================== */}
      {realNameModalStep === 'realname-form' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-base">实名信息填写</span>
              <button
                type="button"
                disabled={rnSubmitting}
                onClick={() => setRealNameModalStep(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rnSubmitting ? (
              <div className="p-10 text-center space-y-3">
                <Loader2 className="w-9 h-9 text-[#0284C7] animate-spin mx-auto" />
                <div className="text-base font-bold text-slate-900">验证中...</div>
                <p className="text-xs text-slate-500">
                  正在调用公安人口库实名核验接口比对姓名与身份证号，请稍候（约1-3秒）...
                </p>
              </div>
            ) : (
              <form onSubmit={handleRnFormSubmit} className="p-6 space-y-4">
                {rnFormError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{rnFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    真实姓名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={rnNameInput}
                    onChange={(e) => setRnNameInput(e.target.value)}
                    placeholder="请输入您的真实姓名"
                    className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    身份证号码 *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={18}
                    value={rnIdCardInput}
                    onChange={(e) => setRnIdCardInput(e.target.value)}
                    placeholder="请输入18位二代居民身份证号码"
                    className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num uppercase focus:outline-none"
                  />
                </div>

                {/* 演示开关：可勾选模拟“公安接口返回姓名与身份证号不匹配” */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rnSimulateMismatch}
                      onChange={(e) => setRnSimulateMismatch(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600"
                    />
                    <span>演示测试：模拟公安接口返回“姓名与身份证号不匹配”</span>
                  </label>
                </div>

                {/* 合规提示：底部勾选“本人承诺所填信息真实有效” */}
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={rnPromiseChecked}
                    onChange={(e) => setRnPromiseChecked(e.target.checked)}
                    className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                  />
                  <span>本人承诺所填信息真实有效</span>
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRealNameModalStep(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={Boolean(user.realNameLockedUntil)}
                    className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-300 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    提交验证
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 C1：学生认证表单弹窗（个人中心 -> 用户认证 -> 学生/教师认证 -> 身份选择“参赛学生” -> 点击【去验证】/【重新验证】）
          字段：
          1. 所属院校（搜索下拉框，必填，必须选中下拉项，不可自由输入，选中后锁定）
          2. 学历层次（下拉单选，必填：专科、本科、硕士、博士及以上）
          3. 专业（输入框，必填）
          4. 入学时间（年月选择器 YYYY-MM，必填）
          5. 毕业时间（预计）（年月选择器 YYYY-MM，必填，必须晚于入学时间）
          6. 身份辅助证明（选填：支持上传学生证内页或其他证明材料，限制格式 jpg/png/pdf，限制大小 5MB 以内）
         ===================================================================== */}
      {academicModalOpen === 'student' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-base">参赛学生 — 学生认证</span>
              <button
                type="button"
                onClick={() => setAcademicModalOpen(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {user.academicStatus === 'rejected' && user.academicRejectReason && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>上次审核驳回原因（已为您回显原填报数据，请修改后重新提交）：</span>
                  </div>
                  <p className="pl-5 text-red-800">{user.academicRejectReason}</p>
                </div>
              )}

              {stuFormError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{stuFormError}</span>
                </div>
              )}

              <form onSubmit={handleStudentSubmitAudit} className="space-y-4">
                {/* 实名信息只读带出提示 */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">申请人姓名：</span>
                    <span className="font-bold text-slate-900">{user.name || '林远航'}</span>
                  </div>
                  <div className="font-mono text-slate-500">
                    {(user.idCard || '110108200305162819').replace(
                      /^(\d{6})\d{8}(\w{4})$/,
                      '$1********$2'
                    )}
                  </div>
                </div>

                {/* 1. 所属院校 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    所属院校 <span className="text-red-500">*</span>
                  </label>
                  <DebouncedUniversitySelect
                    selectedSchool={stuSchool}
                    onSelectSchool={(s) => setStuSchool(s)}
                    enabledSchools={enabledSchools}
                  />
                </div>

                {/* 2. 学历层次（下拉单选，必填：专科、本科、硕士、博士及以上） */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    学历层次 <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={stuEducation}
                    onChange={(e) => setStuEducation(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm bg-white text-slate-900 focus:outline-none"
                  >
                    <option value="专科">专科</option>
                    <option value="本科">本科</option>
                    <option value="硕士">硕士</option>
                    <option value="博士及以上">博士及以上</option>
                  </select>
                </div>

                {/* 3. 专业（输入框，必填） */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    专业 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={stuMajor}
                    onChange={(e) => setStuMajor(e.target.value)}
                    placeholder="请输入您就读的专业名称，例如：网络空间安全"
                    className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                  />
                </div>

                {/* 4. 入学时间 & 5. 毕业时间（预计）（年月选择器 YYYY-MM，毕业时间必须晚于入学时间） */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      入学时间 <span className="text-red-500">*</span>
                      <span className="text-slate-400 font-normal ml-1">(YYYY-MM)</span>
                    </label>
                    <input
                      type="month"
                      required
                      value={stuEnrollDate}
                      onChange={(e) => setStuEnrollDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      毕业时间（预计） <span className="text-red-500">*</span>
                      <span className="text-slate-400 font-normal ml-1">(晚于入学时间)</span>
                    </label>
                    <input
                      type="month"
                      required
                      min={stuEnrollDate || undefined}
                      value={stuGradDate}
                      onChange={(e) => setStuGradDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* 6. 身份辅助证明（选填：支持上传学生证内页或其他证明材料，非必填，限制格式 jpg/png/pdf，限制大小 5MB 以内） */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      身份辅助证明（选填）
                    </label>
                    <span className="text-[11px] text-slate-400">
                      非必填 · 格式 jpg/png/pdf · 5MB 以内
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    支持上传学生证内页或其他证明材料
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <label className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:border-[#0284C7] text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>上传辅助证明材料（选填）</span>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          handleAddStudentProofFiles(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    {stuManualFiles.length > 0 && (
                      <span className="text-[11px] font-mono text-slate-500">
                        已选 {stuManualFiles.length} 份文件
                      </span>
                    )}
                  </div>

                  {stuManualFiles.length > 0 && (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                      {stuManualFiles.map((f, idx) => (
                        <div
                          key={f.id}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-[11px] font-mono text-[#0284C7] font-bold">
                              #{idx + 1}
                            </span>
                            <FileText className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                            <span className="text-slate-800 font-medium truncate">{f.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0">
                              ({f.size})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setStuManualFiles((prev) => prev.filter((item) => item.id !== f.id))
                            }
                            className="text-slate-400 hover:text-red-600 cursor-pointer p-0.5"
                            title="移除该附件"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAcademicModalOpen(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                  >
                    提交审核
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          弹窗 C2：教师认证表单弹窗（防抖必选学校 + 院系/部门 + 教工号 + 证明材料上传）
         ===================================================================== */}
      {academicModalOpen === 'teacher' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between">
              <span className="font-bold text-base">指导教师 — 教师资格认证</span>
              <button
                type="button"
                onClick={() => setAcademicModalOpen(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTeacherSubmit} className="p-6 space-y-4">
              {teaFormError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{teaFormError}</span>
                </div>
              )}

              {/* 学校 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  学校 <span className="text-red-500">*</span>
                </label>
                <DebouncedUniversitySelect
                  selectedSchool={teaSchool}
                  onSelectSchool={(s) => setTeaSchool(s)}
                  enabledSchools={enabledSchools}
                />
              </div>

              {/* 院系/部门 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  院系/部门 *
                </label>
                <input
                  type="text"
                  required
                  value={teaDept}
                  onChange={(e) => setTeaDept(e.target.value)}
                  placeholder="如：计算机科学与技术学院"
                  className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                />
              </div>

              {/* 学历层次 + 专业（与学生认证一致） */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    学历层次 *
                  </label>
                  <select
                    value={teaEducation}
                    onChange={(e) => setTeaEducation(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm bg-white focus:outline-none"
                  >
                    <option value="专科">专科</option>
                    <option value="本科">本科</option>
                    <option value="硕士">硕士</option>
                    <option value="博士及以上">博士及以上</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    专业 *
                  </label>
                  <input
                    type="text"
                    required
                    value={teaMajor}
                    onChange={(e) => setTeaMajor(e.target.value)}
                    placeholder="如：网络空间安全"
                    className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* 教工号 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  教工号 *（作为高校管理员审核的辅助凭证）
                </label>
                <input
                  type="text"
                  required
                  value={teaStaffId}
                  onChange={(e) => setTeaStaffId(e.target.value)}
                  placeholder="请输入您的学校教工号"
                  className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-lg text-sm font-mono-num focus:outline-none"
                />
              </div>

              {/* 证明材料：[ 上传附件 ]（最多不超过10个） */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  证明材料 *（请上传教师资格证或学校工作证/工牌等证明材料，仅用于审核）
                </label>
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 space-y-3">
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    支持上传最多不超过 <strong>10 个</strong>附件，格式支持：<strong>jpg、jpeg、png、pdf、doc、docx、ppt、pptx、zip、rar</strong> 等常见文件格式。
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <label
                        className={`px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:border-[#0284C7] text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          teaFiles.length >= 10 ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        <Upload className="w-4 h-4 text-[#0284C7]" />
                        <span>上传附件（可多选）</span>
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                          className="hidden"
                          onChange={(e) => {
                            handleAddCertFiles(
                              e.target.files,
                              teaFiles,
                              setTeaFiles,
                              setTeaFormError
                            );
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setTeaFormError(null);
                          if (!teaSchool) setTeaSchool('北京大学');
                          if (!teaDept) setTeaDept('计算机科学与技术学院');
                          if (!teaMajor) setTeaMajor('网络空间安全');
                          if (!teaEducation) setTeaEducation('博士及以上');
                          if (!teaStaffId) setTeaStaffId('PKU-T2019086');
                          setTeaFiles([
                            {
                              id: `demo-tea-1-${Date.now()}`,
                              name: '高校教职工工作证正反面扫描件.jpg',
                              size: '1.12 MB',
                              url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=900&q=80',
                              fileType: 'jpg',
                            },
                            {
                              id: `demo-tea-2-${Date.now()}`,
                              name: '高等学校教师资格证书.pdf',
                              size: '1.56 MB',
                              url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
                              fileType: 'pdf',
                            },
                          ]);
                        }}
                        className="text-xs text-[#0284C7] underline cursor-pointer"
                      >
                        一键填入演示教师材料
                      </button>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600">
                      已上传 <strong>{teaFiles.length}</strong> / 10 个附件
                    </span>
                  </div>
                  {teaFiles.length > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {teaFiles.map((f, idx) => (
                        <div
                          key={f.id}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-[11px] font-mono text-[#0284C7] font-bold">
                              #{idx + 1}
                            </span>
                            <FileText className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                            <span className="text-slate-800 font-medium truncate">{f.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0">
                              ({f.size})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setTeaFiles((prev) => prev.filter((item) => item.id !== f.id))
                            }
                            className="text-slate-400 hover:text-red-600 cursor-pointer p-0.5"
                            title="移除该附件"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAcademicModalOpen(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  提交
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 弹窗：高校管理员认证申请与重新申请弹窗 */}
      {univAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {user.univAdminStatus === 'rejected'
                      ? '重新申请高校管理员认证'
                      : '申请高校管理员认证'}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    面向已通过【指导教师认证】的高校老师开通
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUnivAdminModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUnivAdminApplication} className="space-y-4">
              {/* 职责说明提示条 */}
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-[#0369A1] leading-relaxed">
                <span className="font-bold text-[#0284C7]">高校管理员职责承诺：</span>
                高校管理员负责对本校学生的参赛身份认证、指导教师资质以及参赛队伍进行资格审核与校赛晋级名单提报。
              </div>

              {/* 自动读取当前已认证教师资质 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-700 pb-1.5 border-b border-slate-200/80">
                  当前教师资质信息（已核验）：
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400">申请高校：</span>
                    <span className="font-bold text-slate-900">{user.university || '北京大学'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">教师姓名：</span>
                    <span className="font-bold text-slate-900">{user.name || user.username}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">联系手机：</span>
                    <span className="font-mono font-bold text-slate-900">{user.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">学历：</span>
                    <span className="font-bold text-slate-900">{user.educationLevel || '博士及以上'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">所属院系：</span>
                    <span className="font-bold text-slate-900">{user.majorOrDept || '计算机科学与技术学院'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">教工号：</span>
                    <span className="font-mono font-bold text-slate-900">{user.studentId || 'TEA-2024098'}</span>
                  </div>
                </div>
              </div>

              {/* 上次驳回原因提示（如果是重新申请） */}
              {user.univAdminStatus === 'rejected' && user.univAdminRejectReason && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                  <span className="font-bold">上次驳回原因：</span>
                  {user.univAdminRejectReason}
                </div>
              )}

              {/* 申请说明 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  申请说明 / 审核职责承诺
                </label>
                <textarea
                  rows={3}
                  value={univAdminApplyNote}
                  onChange={(e) => setUnivAdminApplyNote(e.target.value)}
                  placeholder="请简要说明您的申请原由及工作职责承诺..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#0284C7] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {univAdminFormError && (
                <div className="text-xs text-red-600 font-bold">{univAdminFormError}</div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUnivAdminModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors"
                >
                  确认提交申请
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
