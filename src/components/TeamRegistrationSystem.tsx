import React, { useState, useMemo } from 'react';
import {
  Shield,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Send,
  Save,
  BellRing,
  Trash2,
  Lock,
  Unlock,
  Building2,
  Award,
  Search,
  Sparkles,
  Check,
  X,
  ChevronRight,
  GraduationCap,
  Edit3,
  ChevronDown,
} from 'lucide-react';
import type { CompetitionCatalogItem } from '../data/competitionData';
import type { UserProfileData } from './AuthAndUserCenter';
import type { EventRegistrationConfig } from './AdminRegistrationManagement';

// ============================================================================
// 数据结构定义：队伍状态机、被邀请成员状态机、平台已注册用户库
// ============================================================================
export type TeamLifecycleStatus =
  | 'draft' // 组建中（暂存，未发通知）
  | 'inviting' // 邀请中（已向队员/老师发通知，不管有无成员拒绝只要未提交审核均为邀请中）
  | 'pending_review' // 已提交（处于高校审核或秘书处审核流程中）
  | 'rejected' // 兼容历史驳回状态（在前台报名状态中统一展示为“已提交”，由高校审核/秘书处审核列展示“已驳回”）
  | 'approved'; // 报名成功（高校审核与秘书处审核均通过）

export type TwoStageAuditStatus =
  | 'none' // 尚未进入该审核阶段
  | 'pending' // 待审核
  | 'approved' // 已通过
  | 'rejected'; // 已驳回

export type MemberConfirmStatus =
  | 'draft' // 组建中草稿态（尚未发送邀请）
  | 'pending' // 待确认（灰色）
  | 'accepted' // 已同意（绿色）
  | 'rejected'; // 已拒绝（红色）

export type CtfRoleType = 'Web手' | '逆向手' | 'Pwn手' | '密码学手' | '杂项手' | '取证手';

export const CTF_ROLE_OPTIONS: CtfRoleType[] = [
  'Web手',
  '逆向手',
  'Pwn手',
  '密码学手',
  '杂项手',
  '取证手',
];

export function formatCtfRolesText(roles?: CtfRoleType[], isAdvisor?: boolean): string {
  if (isAdvisor) return '-';
  if (!roles || roles.length === 0) return '-';
  return roles.join(',');
}

export function checkSingleCtfRoleWarning(
  captainRoles?: CtfRoleType[],
  memberRolesList?: (CtfRoleType[] | undefined)[]
): { isSingleRole: boolean; roleName: CtfRoleType | null } {
  const allRoles: CtfRoleType[] = [];
  if (captainRoles && captainRoles.length > 0) {
    allRoles.push(...captainRoles);
  }
  if (memberRolesList && memberRolesList.length > 0) {
    memberRolesList.forEach((rList) => {
      if (rList && rList.length > 0) {
        allRoles.push(...rList);
      }
    });
  }
  const unique = Array.from(new Set(allRoles));
  if (unique.length === 1) {
    return { isSingleRole: true, roleName: unique[0] };
  }
  return { isSingleRole: false, roleName: null };
}

export const CtfRoleBadges: React.FC<{
  roles?: CtfRoleType[];
  isAdvisor?: boolean;
  emptyText?: string;
}> = ({ roles, isAdvisor = false, emptyText = '待分配' }) => {
  if (isAdvisor) {
    return <span className="text-xs text-slate-400 font-mono-num">-</span>;
  }
  if (!roles || roles.length === 0) {
    if (emptyText === '-') {
      return <span className="text-xs text-slate-400 font-mono-num">-</span>;
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-medium">
        {emptyText}
      </span>
    );
  }
  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      {roles.map((role) => (
        <span
          key={role}
          className="inline-flex items-center px-2 py-0.5 rounded-full bg-sky-50 text-[#0284C7] border border-sky-200 text-[11px] font-bold"
        >
          {role}
        </span>
      ))}
    </div>
  );
};

export const CtfRoleSelectorDropdown: React.FC<{
  selectedRoles?: CtfRoleType[];
  onChange: (nextRoles: CtfRoleType[]) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  triggerLabel?: string;
  compactTrigger?: boolean;
  align?: 'left' | 'right';
}> = ({
  selectedRoles = [],
  onChange,
  isOpen,
  onToggleOpen,
  onClose,
  triggerLabel = '设置角色',
  compactTrigger = false,
  align = 'right',
}) => {
  const handleToggleRole = (role: CtfRoleType) => {
    const exists = selectedRoles.includes(role);
    const next = exists
      ? selectedRoles.filter((r) => r !== role)
      : CTF_ROLE_OPTIONS.filter((r) => r === role || selectedRoles.includes(r));
    onChange(next);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={onToggleOpen}
        className={
          compactTrigger
            ? 'px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors'
            : 'px-3 py-1.5 rounded-lg bg-white hover:bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors'
        }
        title="点击设置或修改队员CTF角色标签（可多选）"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>{triggerLabel}</span>
        {selectedRoles.length > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-[#0284C7] text-white text-[10px] font-mono-num">
            {selectedRoles.length}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>

      {isOpen && (
        <div
          className={`absolute z-30 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-3.5 space-y-2.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              分配队内角色（可多选 0-6 项）
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {CTF_ROLE_OPTIONS.map((role) => {
              const checked = selectedRoles.includes(role);
              return (
                <label
                  key={role}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    checked
                      ? 'bg-sky-50 border-[#0284C7] text-[#0369A1]'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleRole(role)}
                    className="w-3.5 h-3.5 rounded text-[#0284C7] focus:ring-[#0284C7] cursor-pointer"
                  />
                  <span>{role}</span>
                </label>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange([...CTF_ROLE_OPTIONS])}
                className="text-[11px] font-semibold text-[#0284C7] hover:underline cursor-pointer"
              >
                全选
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                清空
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
            >
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export interface InvitedTeamPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  university: string;
  role: 'member' | 'advisor'; // 团队成员 | 指导教师
  ctfRoles?: CtfRoleType[]; // 队长分配的CTF队内角色标签（多选，仅团队成员有效，指导教师不参与）
  isVerified: boolean;
  confirmStatus: MemberConfirmStatus;
  rejectReason?: string;
  lastRemindedAt?: string;
}

export type AdvancementStageStatus =
  | 'none' // 尚未进入校赛晋级阶段（组建中/邀请中/高校待审核/高校已驳回）
  | 'wait_school_match' // 高校已通过（待校赛）——高校资格审核通过，尚未提报晋级名单
  | 'not_advanced' // 未晋级（止步校赛）——高校已提交晋级名单，但本队伍不在名单内
  | 'pending_secretariat' // 待秘书处终审——高校已提交晋级名单（本队伍在名单内），等待秘书处终审
  | 'secretariat_rejected' // 待秘书处终审（名单被驳回）——秘书处驳回该校晋级名单，待高校重报
  | 'advanced'; // 🎉 报名成功（已晋级决赛）——秘书处终审通过

export interface AdvancementProofFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'excel' | 'image' | 'other';
  uploadedAt: string;
  url?: string;
}

export interface UniversityAdvancementSubmission {
  id: string;
  competitionId: string;
  competitionTitle: string;
  university: string;
  teamIds: string[]; // 按校内排名 1, 2, 3... 排序的晋级队伍ID列表
  proofFiles: AdvancementProofFile[]; // 校赛成绩单/证明材料列表
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  rejectReason?: string;
  submittedBy: string;
  submittedAt: string;
  auditedBy?: string;
  auditedAt?: string;
}

export interface TeamApprovedSnapshotMember {
  name: string;
  role: '队长' | '队员' | '指导教师';
  university: string;
  phone?: string;
  email?: string;
  ctfRoles?: CtfRoleType[];
}

export interface TeamApprovedSnapshot {
  competitionTitle?: string;
  teamName: string;
  teamLogo?: string;
  teamIntro?: string;
  subTrackName: string;
  university: string;
  captainName: string;
  captainPhone?: string;
  captainEmail?: string;
  schoolRank?: number; // 最终校内排名（如：1 代表校内第1名）
  createdAt?: string;
  approvedAt: string;
  members: TeamApprovedSnapshotMember[];
}

export interface CaptainTeamRecord {
  id: string;
  competitionId: string;
  competitionTitle: string;
  subTrackName: string;
  teamName: string;
  teamLogo?: string; // 队伍LOGO（支持本地上传Base64图片或默认LOGO）
  teamIntro?: string; // 简短的队伍介绍
  university: string; // 自动带出队长认证所属院校（只读）
  captainName: string;
  captainPhone?: string;
  captainEmail?: string;
  captainUniversity: string;
  captainVerified: boolean;
  captainCtfRoles?: CtfRoleType[]; // 队长给自己勾选的CTF角色标签
  captainOrderIndex?: number; // 队长在参赛队员（含队长）中的排序索引（0代表第1顺位，默认0；该顺序即最终获奖证书打印顺序）
  status: TeamLifecycleStatus;
  members: InvitedTeamPerson[]; // 团队成员列表
  advisors: InvitedTeamPerson[]; // 指导教师列表（不参与队员排序）
  schoolAuditStatus?: TwoStageAuditStatus; // 第一段：高校资格审核状态（待审核 / 已通过 / 已驳回）
  schoolRejectReason?: string; // 高校资格审核驳回原因
  schoolAuditedAt?: string; // 高校资格审核时间
  advancementStatus?: AdvancementStageStatus; // 第二段：高校晋级提报状态（待校赛 / 未晋级 / 待秘书处终审 / 名单被驳回 / 已晋级）
  schoolRank?: number; // 校内排名（1, 2, 3...）
  advancementSubmittedAt?: string; // 高校提报晋级名单时间
  secretariatAuditStatus?: TwoStageAuditStatus; // 第三段：秘书处终审状态（待审核 / 已通过 / 已驳回）
  secretariatRejectReason?: string; // 秘书处终审驳回原因
  secretariatAuditedAt?: string; // 秘书处终审时间
  approvedSnapshot?: TeamApprovedSnapshot; // 报名成功时的只读快照
  createdAt: string;
  updatedAt: string;
}

/**
 * 判断某支队伍是否属于当前登录用户（作为队长发起的队伍）
 */
export function isTeamOwnedByUser(
  team: CaptainTeamRecord,
  user: UserProfileData
): boolean {
  const cleanCaptainName = team.captainName.replace(/（.*?）/g, '').trim();
  const cleanUserName = (user.name || '').replace(/（.*?）/g, '').trim();
  const cleanUsername = (user.username || '').trim();

  if (team.captainPhone && user.phone && team.captainPhone === user.phone) {
    return true;
  }
  if (
    team.captainEmail &&
    user.email &&
    team.captainEmail.toLowerCase() === user.email.toLowerCase()
  ) {
    return true;
  }
  if (cleanUserName && cleanCaptainName === cleanUserName) {
    return true;
  }
  if (cleanUsername && cleanCaptainName.toLowerCase() === cleanUsername.toLowerCase()) {
    return true;
  }
  if (cleanUsername === 'linyuanhang' && cleanCaptainName === '林远航') {
    return true;
  }
  return false;
}

/**
 * 解析队伍队长的真实联系电话与邮箱（避免非林远航队长错误显示林远航的手机和邮箱）
 */
export function resolveTeamCaptainContact(
  team: CaptainTeamRecord,
  platformUsers: PlatformDirectoryUser[] = PLATFORM_DIRECTORY_USERS
): { phone: string; email: string } {
  if (team.captainPhone && team.captainEmail) {
    return { phone: team.captainPhone, email: team.captainEmail };
  }
  const cleanCaptainName = team.captainName.replace(/（.*?）/g, '').trim();
  const matchedUser =
    platformUsers.find(
      (u) =>
        !u.isDeleted &&
        (u.realName === cleanCaptainName ||
          u.name.replace(/（.*?）/g, '').trim() === cleanCaptainName ||
          (u.username || '').toLowerCase() === cleanCaptainName.toLowerCase())
    ) ||
    PLATFORM_DIRECTORY_USERS.find(
      (u) =>
        u.realName === cleanCaptainName ||
        u.name.replace(/（.*?）/g, '').trim() === cleanCaptainName ||
        (u.username || '').toLowerCase() === cleanCaptainName.toLowerCase()
    );

  if (matchedUser) {
    return {
      phone: team.captainPhone || matchedUser.phone || '13810246921',
      email: team.captainEmail || matchedUser.email || 'linyuanhang@buaa.edu.cn',
    };
  }

  if (cleanCaptainName === '林远航') {
    return {
      phone: team.captainPhone || '13810246921',
      email: team.captainEmail || 'linyuanhang@buaa.edu.cn',
    };
  }

  // 根据队长姓名与队伍ID生成稳定的专属演示联系方式
  let hash = 0;
  const seedStr = `${cleanCaptainName}-${team.id}`;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) % 100000000;
  }
  const suffix8 = String(Math.abs(hash)).padStart(8, '0');
  return {
    phone: team.captainPhone || `139${suffix8}`,
    email: team.captainEmail || `cap_${suffix8.slice(0, 6)}@edu.cn`,
  };
}

export type ParticipatedInviteStatus =
  | 'pending_invite' // 待处理邀请（高亮）
  | 'joined' // 已加入
  | 'declined' // 已拒绝
  | 'team_pending_review' // 队伍已提交审核
  | 'team_approved'; // 队伍报名成功

export interface ParticipatedTeamMemberBrief {
  name: string;
  role: '队长' | '队员' | '指导教师';
  university: string;
  ctfRoles?: CtfRoleType[];
  statusLabel?: string;
}

export interface ParticipatedTeamRecord {
  id: string;
  competitionId: string;
  competitionTitle: string;
  subTrackName: string;
  teamName: string;
  teamLogo?: string; // 队伍LOGO
  teamIntro?: string; // 简短的队伍介绍
  captainName: string;
  captainPhone: string;
  university: string; // 队伍所属院校
  myRoleInTeam: '参赛队员' | '指导教师';
  myCtfRoles?: CtfRoleType[]; // 队长给当前受邀队员分配的初始CTF角色标签（指导教师不参与）
  schoolRank?: number; // 校内排名
  status: ParticipatedInviteStatus;
  invitedAt: string;
  teammatesSummary: string[];
  teamMembersDetail?: ParticipatedTeamMemberBrief[]; // 队伍成员及各自角色标签明细
  declineReason?: string;
  approvedSnapshot?: TeamApprovedSnapshot; // 报名成功时的只读快照
}

// 解析任意成员（队长/队员/指导教师）的手机号与邮箱（若快照或条目未显式携带则从通讯录解析）
export function resolvePersonContactByName(
  rawName: string,
  fallbackPhone?: string,
  fallbackEmail?: string,
  platformUsers: PlatformDirectoryUser[] = PLATFORM_DIRECTORY_USERS
): { phone: string; email: string } {
  const clean = (rawName || '').replace(/（.*?）/g, '').trim();
  const matched =
    platformUsers.find(
      (u) =>
        !u.isDeleted &&
        (u.realName === clean ||
          u.name.replace(/（.*?）/g, '').trim() === clean ||
          (u.username || '').toLowerCase() === clean.toLowerCase())
    ) ||
    PLATFORM_DIRECTORY_USERS.find(
      (u) =>
        u.realName === clean ||
        u.name.replace(/（.*?）/g, '').trim() === clean ||
        (u.username || '').toLowerCase() === clean.toLowerCase()
    );

  const validPhone =
    fallbackPhone && !fallbackPhone.includes('*') ? fallbackPhone : matched?.phone;
  const validEmail =
    fallbackEmail && !fallbackEmail.includes('*') ? fallbackEmail : matched?.email;

  if (validPhone && validEmail) {
    return { phone: validPhone, email: validEmail };
  }

  if (clean === '林远航') {
    return {
      phone: validPhone || '13810246921',
      email: validEmail || 'linyuanhang@buaa.edu.cn',
    };
  }

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) % 100000000;
  }
  const suffix8 = String(Math.abs(hash)).padStart(8, '0');
  return {
    phone: validPhone || `139${suffix8}`,
    email: validEmail || `member_${suffix8.slice(0, 6)}@buaa.edu.cn`,
  };
}

// 将队长按 captainOrderIndex 插入到团队成员数组中，生成包含队长在内的完整参赛队员排序列表（即最终获奖证书打印顺序）
export function insertCaptainAtOrderIndex<C, M = C>(
  captainItem: C,
  memberItems: M[],
  captainOrderIndex?: number
): (C | M)[] {
  const safeIdx = Math.max(
    0,
    Math.min(memberItems.length, captainOrderIndex ?? 0)
  );
  return [
    ...memberItems.slice(0, safeIdx),
    captainItem,
    ...memberItems.slice(safeIdx),
  ];
}

// 调整包括队长在内的所有参赛队员的排序（上移 / 下移）
export function reorderContestantsWithCaptain(
  members: InvitedTeamPerson[],
  captainOrderIndex: number | undefined,
  combinedFromIndex: number,
  direction: -1 | 1
): { nextMembers: InvitedTeamPerson[]; nextCaptainOrderIndex: number } {
  const totalCount = 1 + members.length;
  const safeCapIdx = Math.max(0, Math.min(members.length, captainOrderIndex ?? 0));
  const targetIndex = combinedFromIndex + direction;
  if (targetIndex < 0 || targetIndex >= totalCount) {
    return { nextMembers: members, nextCaptainOrderIndex: safeCapIdx };
  }
  if (combinedFromIndex === safeCapIdx) {
    return { nextMembers: members, nextCaptainOrderIndex: targetIndex };
  }
  if (targetIndex === safeCapIdx) {
    return { nextMembers: members, nextCaptainOrderIndex: combinedFromIndex };
  }
  const memIdxA =
    combinedFromIndex > safeCapIdx ? combinedFromIndex - 1 : combinedFromIndex;
  const memIdxB = targetIndex > safeCapIdx ? targetIndex - 1 : targetIndex;
  const nextMembers = [...members];
  const temp = nextMembers[memIdxA];
  nextMembers[memIdxA] = nextMembers[memIdxB];
  nextMembers[memIdxB] = temp;
  return { nextMembers, nextCaptainOrderIndex: safeCapIdx };
}

// 移除队员时同步维护队长的排序索引
export function removeMemberAdjustingCaptainOrder(
  members: InvitedTeamPerson[],
  captainOrderIndex: number | undefined,
  memberIdToRemove: string
): { nextMembers: InvitedTeamPerson[]; nextCaptainOrderIndex: number } {
  const safeCapIdx = Math.max(0, Math.min(members.length, captainOrderIndex ?? 0));
  const removedIdx = members.findIndex((m) => m.id === memberIdToRemove);
  const nextMembers = members.filter((m) => m.id !== memberIdToRemove);
  if (removedIdx === -1) {
    return {
      nextMembers,
      nextCaptainOrderIndex: Math.min(safeCapIdx, nextMembers.length),
    };
  }
  const nextCapIdx =
    removedIdx < safeCapIdx ? Math.max(0, safeCapIdx - 1) : safeCapIdx;
  return {
    nextMembers,
    nextCaptainOrderIndex: Math.min(nextCapIdx, nextMembers.length),
  };
}

// 根据队伍数据生成【报名成功】时刻的只读快照（严格按照队长调整后的队员报名顺序生成，该顺序即获奖证书打印顺序）
export function buildApprovedSnapshotFromCaptainTeam(
  team: CaptainTeamRecord,
  approvedAt?: string
): TeamApprovedSnapshot {
  const cleanName = (raw: string) => raw.replace(/（.*?）/g, '').trim();
  const captainContact = resolveTeamCaptainContact(team);
  const captainSnapshotItem: TeamApprovedSnapshotMember = {
    name: cleanName(team.captainName),
    role: '队长',
    university: team.captainUniversity || team.university,
    phone: captainContact.phone,
    email: captainContact.email,
    ctfRoles: team.captainCtfRoles || ['Web手'],
  };
  const acceptedMemberItems: TeamApprovedSnapshotMember[] = team.members
    .filter((m) => m.confirmStatus === 'accepted')
    .map((m) => {
      const contact = resolvePersonContactByName(m.name, m.phone, m.email);
      return {
        name: cleanName(m.name),
        role: '队员' as const,
        university: m.university,
        phone: contact.phone,
        email: contact.email,
        ctfRoles: m.ctfRoles || [],
      };
    });
  const orderedContestants = insertCaptainAtOrderIndex(
    captainSnapshotItem,
    acceptedMemberItems,
    team.captainOrderIndex
  );
  const snapshotMembers: TeamApprovedSnapshotMember[] = [
    ...orderedContestants,
    ...team.advisors
      .filter((a) => a.confirmStatus === 'accepted')
      .map((a) => {
        const contact = resolvePersonContactByName(a.name, a.phone, a.email);
        return {
          name: cleanName(a.name),
          role: '指导教师' as const,
          university: a.university,
          phone: contact.phone,
          email: contact.email,
        };
      }),
  ];
  return {
    competitionTitle: team.competitionTitle,
    teamName: team.teamName,
    teamLogo: team.teamLogo || 'default-logo',
    teamIntro: team.teamIntro || '',
    subTrackName: team.subTrackName,
    university: team.university,
    captainName: cleanName(team.captainName),
    captainPhone: captainContact.phone,
    captainEmail: captainContact.email,
    schoolRank: team.schoolRank || 1,
    createdAt: team.createdAt,
    approvedAt: approvedAt || team.updatedAt || '2026-10-28 10:00',
    members: snapshotMembers,
  };
}

export type UserBaseRole = '普通用户' | '学生' | '教师';
export type UserExtendedRole = '专家' | '高校管理员' | '秘书处';
export type UserAccountStatus = '正常' | '停用';
export type UserIdCardType = '身份证' | '护照';

// 平台内置可查询用户目录（供【+ 邀请队员】、【+ 邀请指导教师】、后台【院校管理-分配管理员】及【系统管理-用户管理】共用）
export interface PlatformDirectoryUser {
  id: string;
  username?: string; // 用户名（全局唯一，主账号标识）
  password?: string; // 登录密码
  avatar?: string; // 头像URL或Base64
  name: string; // 显示名称（含备注标签，兼容组队检索）
  realName?: string; // 真实姓名（未认证显示 "-"）
  phone: string; // 手机号（全局唯一）
  email: string; // 邮箱（全局唯一）
  idType?: UserIdCardType; // 证件类型：身份证 / 护照
  idNumber?: string; // 证件号（全局唯一）
  baseRole?: UserBaseRole; // 基础身份（三选一互斥）：普通用户 / 学生 / 教师
  extendedRoles?: UserExtendedRole[]; // 扩展身份（可多选叠加）：专家 / 高校管理员 / 秘书处
  assignedViaInstitutionModule?: boolean; // 是否由【院校管理】模块分配高校管理员（若是则表单中所属院校只读回显）
  expireTime?: string | null; // 账号过期时间（YYYY-MM-DD HH:mm:ss，null或空代表永久有效）
  status?: UserAccountStatus; // 账号状态：正常 / 停用
  isDeleted?: boolean; // 软删除标记（is_deleted = 1），仅后台列表不展示，保留外键关联
  createdAt?: string; // 创建时间
  university: string;
  educationLevel?: string; // 学历层次：专科 / 本科 / 硕士 / 博士及以上
  majorOrDept?: string; // 专业或院系
  enrollmentDate?: string; // 入学时间 YYYY-MM
  graduationDate?: string; // 预计毕业时间 YYYY-MM
  identityType: 'student' | 'teacher';
  isRealNameVerified: boolean;
  isAcademicOrTeacherVerified: boolean;
  tagHint: string;
  tags?: string[]; // 用户角色标签，如 ['高校管理员']、['秘书处管理员']
  managedInstitutionId?: string; // 绑定的院校ID（对应 InstitutionRecord.id，如 'inst-3'）
}

// 判断用户账号是否已过有效期
export function isUserAccountExpired(expireTime?: string | null): boolean {
  if (!expireTime || !expireTime.trim()) return false;
  const parsed = new Date(expireTime.trim().replace(' ', 'T')).getTime();
  if (Number.isNaN(parsed)) return false;
  return Date.now() > parsed;
}

// 获取用户实际生效状态（当 当前时间 > 用户过期时间 时，账号状态自动转为“停用”）
export function getEffectiveUserStatus(user: PlatformDirectoryUser): UserAccountStatus {
  if (isUserAccountExpired(user.expireTime)) {
    return '停用';
  }
  return user.status || '正常';
}

export const PLATFORM_DIRECTORY_USERS: PlatformDirectoryUser[] = [
  {
    id: 'u-super-admin',
    username: 'admin',
    password: 'Admin2026Pass',
    name: '陈建国（超级管理员）',
    realName: '陈建国',
    phone: '13810998800',
    email: 'admin@tsinghua.edu.cn',
    idType: '身份证',
    idNumber: '110108197805123419',
    baseRole: '教师',
    extendedRoles: ['专家', '秘书处'],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-01-10 09:00:00',
    university: '清华大学',
    identityType: 'teacher',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '组委会超级管理员 · 总裁判长',
    tags: ['专家', '秘书处', '秘书处管理员'],
  },
  {
    id: 'u-captain-self',
    username: 'linyuanhang',
    password: 'Sec2026Pass',
    name: '林远航',
    realName: '林远航',
    phone: '13810246921',
    email: 'linyuanhang@buaa.edu.cn',
    idType: '身份证',
    idNumber: '110108200403156812',
    baseRole: '学生',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-09-01 10:15:30',
    university: '北京航空航天大学',
    educationLevel: '本科',
    majorOrDept: '网络空间安全',
    enrollmentDate: '2024-09',
    graduationDate: '2028-06',
    identityType: 'student',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '当前登录参赛学生账号',
    tags: [],
  },
  {
    id: 'u-tea-d',
    username: 'zhaozhenyu',
    password: 'Sec2026Pass',
    name: '赵振宇 教授（老师D）',
    realName: '赵振宇',
    phone: '13800138001',
    email: 'zhaozhenyu@buaa.edu.cn',
    idType: '身份证',
    idNumber: '11010819801120451X',
    baseRole: '教师',
    extendedRoles: ['高校管理员', '专家'],
    assignedViaInstitutionModule: true,
    expireTime: '2027-12-31 23:59:59',
    status: '正常',
    isDeleted: false,
    createdAt: '2026-03-15 14:20:00',
    university: '北京航空航天大学',
    identityType: 'teacher',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '老师D · 本校合规指导教师 / 北航高校管理员',
    tags: ['高校管理员', '专家'],
    managedInstitutionId: 'inst-3',
  },
  {
    id: 'u-tea-f',
    username: 'fengwenbo',
    password: 'Sec2026Pass',
    name: '冯文博 副教授（老师E）',
    realName: '冯文博',
    phone: '13800138005',
    email: 'fengwenbo@buaa.edu.cn',
    idType: '身份证',
    idNumber: '110108198506182314',
    baseRole: '教师',
    extendedRoles: ['高校管理员'],
    assignedViaInstitutionModule: true,
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-03-18 11:05:12',
    university: '北京航空航天大学',
    identityType: 'teacher',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '老师E · 本校已认证指导教师（可测试双指导教师配置）',
    tags: ['高校管理员'],
    managedInstitutionId: 'inst-3',
  },
  {
    id: 'u-tea-b',
    username: 'sunliqun',
    password: 'Sec2026Pass',
    name: '孙立群 教授（外校教师）',
    realName: '孙立群',
    phone: '13800138002',
    email: 'sunliqun@tsinghua.edu.cn',
    idType: '身份证',
    idNumber: '110108197908245137',
    baseRole: '教师',
    extendedRoles: ['高校管理员', '专家'],
    assignedViaInstitutionModule: true,
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-03-20 09:30:00',
    university: '清华大学',
    identityType: 'teacher',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '外校已认证教师 · 清华大学 / 清华高校管理员',
    tags: ['高校管理员', '专家'],
    managedInstitutionId: 'inst-2',
  },
  {
    id: 'u-admin-pku',
    username: 'peiwenyuan',
    password: 'Sec2026Pass',
    name: '裴文远 教授',
    realName: '裴文远',
    phone: '13810097711',
    email: 'peiwenyuan@pku.edu.cn',
    idType: '身份证',
    idNumber: '110108198204103318',
    baseRole: '教师',
    extendedRoles: ['高校管理员'],
    assignedViaInstitutionModule: true,
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-03-22 16:00:00',
    university: '北京大学',
    identityType: 'teacher',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '北京大学网络安全学院联络人 · 北大高校管理员',
    tags: ['高校管理员'],
    managedInstitutionId: 'inst-1',
  },
  {
    id: 'u-admin-fudan',
    username: 'shenghuaian',
    password: 'Sec2026Pass',
    name: '盛怀安 教授',
    realName: '盛怀安',
    phone: '13701920012',
    email: 'shenghuaian@fudan.edu.cn',
    idType: '身份证',
    idNumber: '310110198109124015',
    baseRole: '教师',
    extendedRoles: ['高校管理员'],
    assignedViaInstitutionModule: false,
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-03-25 10:40:00',
    university: '复旦大学',
    identityType: 'teacher',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '复旦大学联络负责人 · 复旦高校管理员（无待办审核，可测试回收高校管理员权限）',
    tags: ['高校管理员'],
    managedInstitutionId: 'inst-7',
  },
  {
    id: 'u-admin-sec',
    username: 'wangmishu',
    password: 'Sec2026Pass',
    name: '王秘书（秘书处审核专员）',
    realName: '王静怡',
    phone: '13600136000',
    email: 'secretariat@gwc-sec.org.cn',
    idType: '身份证',
    idNumber: '110101199002142826',
    baseRole: '普通用户',
    extendedRoles: ['秘书处'],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-02-01 09:00:00',
    university: '大赛组委会秘书处',
    identityType: 'teacher',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '大赛秘书处审核管理员（具有“秘书处”扩展身份）',
    tags: ['秘书处', '秘书处管理员'],
  },
  {
    id: 'u-stu-a',
    username: 'zhangzixuan',
    password: 'Sec2026Pass',
    name: '张子轩（队员A）',
    realName: '张子轩',
    phone: '13910010001',
    email: 'zhangzixuan@buaa.edu.cn',
    idType: '身份证',
    idNumber: '110108200501123011',
    baseRole: '学生',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-09-05 15:20:00',
    university: '北京航空航天大学',
    identityType: 'student',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '队员A · 本校已认证学生（可用于测试拒绝邀请）',
  },
  {
    id: 'u-stu-c',
    username: 'chensiyuan',
    password: 'Sec2026Pass',
    name: '陈思远（队员C）',
    realName: '陈思远',
    phone: '13910010002',
    email: 'chensiyuan@buaa.edu.cn',
    idType: '身份证',
    idNumber: '110108200407234152',
    baseRole: '学生',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-09-06 11:10:00',
    university: '北京航空航天大学',
    identityType: 'student',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '队员C · 本校已认证学生（可用于替补加入）',
  },
  {
    id: 'u-stu-e',
    username: 'liuyutong',
    password: 'Sec2026Pass',
    name: '刘语桐（队员E）',
    realName: '刘语桐',
    phone: '13910010003',
    email: 'liuyutong@buaa.edu.cn',
    idType: '身份证',
    idNumber: '110108200509182246',
    baseRole: '学生',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-09-08 16:45:00',
    university: '北京航空航天大学',
    identityType: 'student',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '队员E · 本校已认证学生',
  },
  {
    id: 'u-stu-g',
    username: 'songzhixing',
    password: 'Sec2026Pass',
    name: '宋知行（队员G）',
    realName: '宋知行',
    phone: '13910010004',
    email: 'songzhixing@buaa.edu.cn',
    idType: '身份证',
    idNumber: '110108200412055319',
    baseRole: '学生',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-09-10 09:30:00',
    university: '北京航空航天大学',
    identityType: 'student',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '队员G · 本校已认证学生（二进制漏洞挖掘方向）',
  },
  {
    id: 'u-stu-h',
    username: 'shenqingxue',
    password: 'Sec2026Pass',
    name: '沈清雪（队员H）',
    realName: '沈清雪',
    phone: '13910010005',
    email: 'shenqingxue@buaa.edu.cn',
    idType: '身份证',
    idNumber: '110108200504216628',
    baseRole: '学生',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-09-11 13:20:00',
    university: '北京航空航天大学',
    identityType: 'student',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '队员H · 本校已认证学生（密码学与隐私计算方向）',
  },
  {
    id: 'u-stu-unv',
    username: 'lihaoran',
    password: 'Sec2026Pass',
    name: '李昊然（未学籍认证学生）',
    realName: '',
    phone: '13910010009',
    email: 'lihaoran@buaa.edu.cn',
    idType: '身份证',
    idNumber: '110108200511097135',
    baseRole: '普通用户',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-10-01 18:00:00',
    university: '北京航空航天大学',
    identityType: 'student',
    isRealNameVerified: false,
    isAcademicOrTeacherVerified: false,
    tagHint: '未完成实名与学籍认证用户（真实姓名显示为 "-"）',
  },
  {
    id: 'u-normal-1',
    username: 'xuruiyang',
    password: 'Sec2026Pass',
    name: '许睿阳',
    realName: '许睿阳',
    phone: '13910010015',
    email: 'xuruiyang@buaa.edu.cn',
    idType: '身份证',
    idNumber: '110108200503184217',
    baseRole: '普通用户',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-10-12 10:15:00',
    university: '未绑定院校',
    identityType: 'student',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: false,
    tagHint: '已完成实名认证的普通用户（待完成学生/教师认证）',
  },
  {
    id: 'u-normal-2',
    username: 'tangwanqing',
    password: 'Sec2026Pass',
    name: '唐婉清',
    realName: '唐婉清',
    phone: '13810010018',
    email: 'tangwanqing@pku.edu.cn',
    idType: '身份证',
    idNumber: '110101198806213529',
    baseRole: '普通用户',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-10-14 14:30:00',
    university: '未绑定院校',
    identityType: 'teacher',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: false,
    tagHint: '已完成实名认证的普通用户（待完成教师/学生认证）',
  },
  {
    id: 'u-stu-cross',
    username: 'wangzihan',
    password: 'Sec2026Pass',
    name: '王子涵（外校学生）',
    realName: '王子涵',
    phone: '13910010006',
    email: 'wangzihan@tsinghua.edu.cn',
    idType: '身份证',
    idNumber: '110108200408193814',
    baseRole: '学生',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-09-15 10:00:00',
    university: '清华大学',
    identityType: 'student',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '外校已认证学生 · 清华大学（测试禁止跨校组队拦截）',
  },
  {
    id: 'u-stu-cross-zju',
    username: 'yeshuting',
    password: 'Sec2026Pass',
    name: '叶书婷（外校学生）',
    realName: '叶书婷',
    phone: '13910010007',
    email: 'yeshuting@zju.edu.cn',
    idType: '护照',
    idNumber: 'EB8923410',
    baseRole: '学生',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-09-16 14:12:00',
    university: '浙江大学',
    identityType: 'student',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '外校已认证学生 · 浙江大学',
  },
  {
    id: 'u-stu-cross-bupt',
    username: 'hejingyao',
    password: 'Sec2026Pass',
    name: '何景曜（外校学生）',
    realName: '何景曜',
    phone: '13910010008',
    email: 'hejingyao@bupt.edu.cn',
    idType: '身份证',
    idNumber: '110108200402281930',
    baseRole: '学生',
    extendedRoles: [],
    expireTime: null,
    status: '正常',
    isDeleted: false,
    createdAt: '2026-09-18 11:25:00',
    university: '北京邮电大学',
    identityType: 'student',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: true,
    tagHint: '外校已认证学生 · 北京邮电大学',
  },
  {
    id: 'u-tea-unverified',
    username: 'zhouming_exp',
    password: 'Sec2026Pass',
    name: '周明（未认证教师）',
    realName: '周明',
    phone: '13800138003',
    email: 'zhouming@buaa.edu.cn',
    idType: '身份证',
    idNumber: '110108198610154912',
    baseRole: '教师',
    extendedRoles: ['专家'],
    expireTime: '2026-05-01 00:00:00', // 已过期的账号，状态自动转为停用，登录拦截提示“账号已过期，请联系管理员”
    status: '停用',
    isDeleted: false,
    createdAt: '2025-05-01 09:00:00',
    university: '北京航空航天大学',
    identityType: 'teacher',
    isRealNameVerified: true,
    isAcademicOrTeacherVerified: false,
    tagHint: '已过期专家账号（用于测试过期自动转停用及前台登录拦截）',
    tags: ['专家'],
  },
];

// 初始预置队伍列表：
// - cap-team-1 ~ cap-team-8：当前登录队长（林远航）发起的8支队伍，完整覆盖：
//   ① 邀请中（含成员拒绝+待确认）
//   ② 组建中（草稿未发通知）
//   ③ 报名成功（高校审核已通过 + 秘书处审核已通过）
//   ④ 已提交 · 高校审核已驳回（悬浮图标显示高校驳回原因，支持修改后重新提交进入高校审核、秘书处审核流程）
//   ⑤ 已提交 · 高校审核待审核（尚未进入秘书处审核）
//   ⑥ 邀请中（全员已同意，可随时修改队伍信息/成员并一键提交高校审核）
//   ⑦ 已提交 · 高校审核已通过 + 秘书处审核待审核
//   ⑧ 已提交 · 高校审核已通过 + 秘书处审核已驳回（悬浮图标显示秘书处驳回原因，支持修改后重新提交，重新进入高校审核、秘书处审核流程）
// - admin-team-1 ~ admin-team-16：全国各大高校在各赛事下的报名队伍，供后台【报名管理 -> 查看报名（高校审核 / 秘书处审核）】全面演示
export const INITIAL_CAPTAIN_TEAMS: CaptainTeamRecord[] = [
  // ================= 1. 当前队长（林远航）发起的 8 支全场景队伍 =================
  {
    id: 'cap-team-1',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: 'Web应用与云原生攻防赛道',
    teamName: '北航天枢攻防战队',
    teamLogo: 'default-logo',
    teamIntro: '专注云原生容器逃逸、K8s集群渗透与Web高阶漏洞挖掘，以攻促防守护空天数字基础设施。',
    university: '北京航空航天大学',
    captainName: '林远航',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['Web手', '密码学手'],
    status: 'inviting',
    schoolAuditStatus: 'none',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'm-init-1',
        name: '张子轩（队员A）',
        phone: '13910010001',
        email: 'zhangzixuan@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['Pwn手', '逆向手'],
        isVerified: true,
        confirmStatus: 'rejected',
        rejectReason: '下周有操作系统课程设计答辩，时间冲突',
      },
      {
        id: 'm-init-2',
        name: '刘语桐（队员E）',
        phone: '13910010003',
        email: 'liuyutong@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['Web手', '杂项手'],
        isVerified: true,
        confirmStatus: 'pending',
      },
    ],
    advisors: [
      {
        id: 'adv-init-1',
        name: '赵振宇 教授（老师D）',
        phone: '13800138001',
        email: 'zhaozhenyu@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-26 14:20',
    updatedAt: '2026-10-28 09:30',
  },
  {
    id: 'cap-team-2',
    competitionId: 'comp-2026-data',
    competitionTitle: '2026“XX杯”全国网数智安全大赛 · 数据安全与隐私计算专项挑战赛',
    subTrackName: '联邦学习隐私保护与投毒防御赛道',
    teamName: '北航隐私计算先锋队',
    teamLogo: 'default-logo',
    teamIntro: '聚焦多方安全计算（MPC）、同态加密与联邦学习差分隐私防御算法研究。',
    university: '北京航空航天大学',
    captainName: '林远航',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['密码学手'],
    status: 'draft',
    schoolAuditStatus: 'none',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'm-draft-1',
        name: '陈思远（队员C）',
        phone: '13910010002',
        email: 'chensiyuan@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['密码学手', '逆向手'],
        isVerified: true,
        confirmStatus: 'draft',
      },
      {
        id: 'm-draft-2',
        name: '沈清雪（队员H）',
        phone: '13910010005',
        email: 'shenqingxue@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['取证手', '杂项手'],
        isVerified: true,
        confirmStatus: 'draft',
      },
    ],
    advisors: [
      {
        id: 'adv-draft-1',
        name: '赵振宇 教授（老师D）',
        phone: '13800138001',
        email: 'zhaozhenyu@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'draft',
      },
    ],
    createdAt: '2026-10-27 16:10',
    updatedAt: '2026-10-27 16:10',
  },
  {
    id: 'cap-team-3',
    competitionId: 'comp-2026-ai-pilot',
    competitionTitle: '2026“XX杯”全国网数智安全大赛 · 大模型与人工智能安全先导赛',
    subTrackName: 'LLM红蓝越狱对抗与安全对齐赛道',
    teamName: '北航智盾先锋队',
    teamLogo: 'default-logo',
    teamIntro: '深耕大语言模型越狱攻击检测、提示词注入防御与多模态安全内生对齐技术。',
    university: '北京航空航天大学',
    captainName: '林远航',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['Web手', '杂项手'],
    status: 'approved',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-06-13 11:20:00',
    advancementStatus: 'advanced',
    schoolRank: 1,
    advancementSubmittedAt: '2026-06-14 16:00:00',
    secretariatAuditStatus: 'approved',
    secretariatAuditedAt: '2026-06-15 10:00:00',
    members: [
      {
        id: 'm-app-1',
        name: '陈思远（队员C）',
        phone: '13910010002',
        email: 'chensiyuan@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['逆向手', 'Pwn手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'm-app-2',
        name: '宋知行（队员G）',
        phone: '13910010004',
        email: 'songzhixing@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['密码学手', '取证手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adv-app-1',
        name: '赵振宇 教授（老师D）',
        phone: '13800138001',
        email: 'zhaozhenyu@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-06-12 14:30',
    updatedAt: '2026-06-15 10:00',
    approvedSnapshot: {
      competitionTitle: '2026“XX杯”全国网数智安全大赛 · 大模型与人工智能安全先导赛',
      teamName: '北航智盾先锋队',
      teamLogo: 'default-logo',
      teamIntro: '深耕大语言模型越狱攻击检测、提示词注入防御与多模态安全内生对齐技术。',
      subTrackName: 'LLM红蓝越狱对抗与安全对齐赛道',
      university: '北京航空航天大学',
      captainName: '林远航',
      captainPhone: '13810246921',
      captainEmail: 'linyuanhang@buaa.edu.cn',
      schoolRank: 1,
      createdAt: '2026-06-12 14:30',
      approvedAt: '2026-06-15 10:00',
      members: [
        {
          name: '林远航',
          role: '队长',
          university: '北京航空航天大学',
          phone: '13810246921',
          email: 'linyuanhang@buaa.edu.cn',
          ctfRoles: ['Web手', '杂项手'],
        },
        {
          name: '陈思远',
          role: '队员',
          university: '北京航空航天大学',
          phone: '13910010002',
          email: 'chensiyuan@buaa.edu.cn',
          ctfRoles: ['逆向手', 'Pwn手'],
        },
        {
          name: '宋知行',
          role: '队员',
          university: '北京航空航天大学',
          phone: '13910010004',
          email: 'songzhixing@buaa.edu.cn',
          ctfRoles: ['密码学手', '取证手'],
        },
        {
          name: '赵振宇 教授',
          role: '指导教师',
          university: '北京航空航天大学',
          phone: '13800138001',
          email: 'zhaozhenyu@buaa.edu.cn',
        },
      ],
    },
  },
  {
    id: 'cap-team-4',
    competitionId: 'comp-2026-crypto-deadline',
    competitionTitle: '2026“XX杯”商用密码应用与后量子密码算法挑战赛',
    subTrackName: '国密算法协议分析与白盒密码逆向赛道',
    teamName: '北航凌云密算战队',
    teamLogo: 'default-logo',
    teamIntro: '主攻国密SM2/SM4白盒密码抗DFA故障注入分析与零知识证明电路加速。',
    university: '北京航空航天大学',
    captainName: '林远航',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['密码学手', '逆向手'],
    status: 'pending_review',
    schoolAuditStatus: 'rejected',
    schoolRejectReason:
      '经高校管理员核查：队伍简介中未注明所依托的学院实验室安全合规备案号，且指导教师信息需补充确认，请修改完善后重新提交高校审核。',
    advancementStatus: 'none',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'm-rej-1',
        name: '沈清雪（队员H）',
        phone: '13910010005',
        email: 'shenqingxue@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['密码学手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'm-rej-2',
        name: '陈思远（队员C）',
        phone: '13910010002',
        email: 'chensiyuan@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['逆向手', '杂项手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adv-rej-1',
        name: '赵振宇 教授（老师D）',
        phone: '13800138001',
        email: 'zhaozhenyu@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-14 11:20',
    updatedAt: '2026-10-25 16:40',
  },
  {
    id: 'cap-team-5',
    competitionId: 'comp-2026-iot-earlyclose',
    competitionTitle: '2026“XX杯”物联网固件逆向与智能终端安全挑战赛',
    subTrackName: '智能网关与路由器固件漏洞挖掘赛道',
    teamName: '北航猎鹰固件逆向组',
    teamLogo: 'default-logo',
    teamIntro: '深耕MIPS/ARM嵌入式固件自动化解包、RTOS内存破坏漏洞利用与JTAG硬件调试。',
    university: '北京航空航天大学',
    captainName: '林远航',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['逆向手', 'Pwn手'],
    status: 'pending_review',
    schoolAuditStatus: 'pending',
    advancementStatus: 'none',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'm-pr-1',
        name: '宋知行（队员G）',
        phone: '13910010004',
        email: 'songzhixing@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['Pwn手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'm-pr-2',
        name: '刘语桐（队员E）',
        phone: '13910010003',
        email: 'liuyutong@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['逆向手', '取证手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adv-pr-1',
        name: '冯文博 副教授（老师E）',
        phone: '13800138005',
        email: 'fengwenbo@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-21 15:10',
    updatedAt: '2026-10-26 19:20',
  },
  {
    id: 'cap-team-6',
    competitionId: 'comp-2026-redblue-internal',
    competitionTitle: '2026“XX杯”高校实网蓝军应急响应与威胁狩猎特训赛（内部演练）',
    subTrackName: '全流量威胁狩猎与APT攻击链还原赛道',
    teamName: '北航苍穹蓝军狩猎队',
    teamLogo: 'default-logo',
    teamIntro: '全员已完成入队确认并通过高校资格核验，当前处于“高校已通过（待校赛）”阶段，等待高校管理员提报晋级名单。',
    university: '北京航空航天大学',
    captainName: '林远航',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['Web手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-28 09:20:00',
    advancementStatus: 'wait_school_match',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'm-allok-1',
        name: '陈思远（队员C）',
        phone: '13910010002',
        email: 'chensiyuan@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['Web手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'm-allok-2',
        name: '宋知行（队员G）',
        phone: '13910010004',
        email: 'songzhixing@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['Web手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adv-allok-1',
        name: '赵振宇 教授（老师D）',
        phone: '13800138001',
        email: 'zhaozhenyu@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-24 10:05',
    updatedAt: '2026-10-28 10:15',
  },
  {
    id: 'cap-team-7',
    competitionId: 'comp-2026-solo-vuln',
    competitionTitle: '2026“XX杯”零日漏洞挖掘与二进制极客个人挑战赛（单兵赛制）',
    subTrackName: '操作系统内核与虚拟化逃逸个人赛道',
    teamName: 'SkyHawk-0day（林远航单兵队）',
    teamLogo: 'default-logo',
    teamIntro: '个人单兵参赛模式（1人/队），主攻Linux Kernel eBPF/io_uring子系统提权与QEMU逃逸。已由北航提报晋级（校内第1名），待秘书处终审。',
    university: '北京航空航天大学',
    captainName: '林远航',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['Pwn手', '逆向手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-25 14:00:00',
    advancementStatus: 'pending_secretariat',
    schoolRank: 1,
    advancementSubmittedAt: '2026-10-27 14:30:00',
    secretariatAuditStatus: 'pending',
    members: [],
    advisors: [
      {
        id: 'adv-solo-1',
        name: '赵振宇 教授（老师D）',
        phone: '13800138001',
        email: 'zhaozhenyu@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-23 09:00',
    updatedAt: '2026-10-27 14:30',
  },
  {
    id: 'cap-team-8',
    competitionId: 'comp-2026-cloud-def',
    competitionTitle: '2026“XX杯”云原生与零信任架构安全攻防挑战赛',
    subTrackName: '基于eBPF的零信任微隔离与流量审计赛道',
    teamName: '北航零信任微隔离战队',
    teamLogo: 'default-logo',
    teamIntro: '专注云原生环境下基于eBPF的容器东西向流量细粒度微隔离与异常行为阻断。高校已提报（校内第2名），因校赛证明材料模糊被秘书处打回重报。',
    university: '北京航空航天大学',
    captainName: '林远航',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['Web手', '取证手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-22 10:30:00',
    advancementStatus: 'secretariat_rejected',
    schoolRank: 2,
    advancementSubmittedAt: '2026-10-26 16:00:00',
    secretariatAuditStatus: 'rejected',
    secretariatAuditedAt: '2026-10-27 17:15:00',
    secretariatRejectReason:
      '经大赛组委会秘书处终审：北京航空航天大学提报的校赛成绩单扫描件分辨率较低（学院公章区域模糊），已打回高校管理员重新上传清晰证明材料后再行提报（队长无需修改队伍信息）。',
    members: [
      {
        id: 'm-sec-rej-1',
        name: '陈思远（队员C）',
        phone: '13910010002',
        email: 'chensiyuan@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['Pwn手', '逆向手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'm-sec-rej-2',
        name: '刘语桐（队员E）',
        phone: '13910010003',
        email: 'liuyutong@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['Web手', '杂项手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adv-sec-rej-1',
        name: '冯文博 副教授（老师E）',
        phone: '13800138005',
        email: 'fengwenbo@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-20 11:00',
    updatedAt: '2026-10-27 17:15',
  },
  {
    id: 'cap-team-9',
    competitionId: 'comp-2025-archive-ctf',
    competitionTitle: '2025第四届“XX杯”全国网数智安全大赛 · 年度总决赛历史归档',
    subTrackName: '第四届网络安全攻防实战总决赛归档',
    teamName: '北航星火二进制青训队',
    teamLogo: 'default-logo',
    teamIntro: '通过本校参赛资格核验并参加校内选拔赛，最终校内排名第5名，未进入本校前3名晋级提报名单（止步校赛）。',
    university: '北京航空航天大学',
    captainName: '林远航',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['逆向手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2025-09-18 15:00:00',
    advancementStatus: 'not_advanced',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'm-notadv-1',
        name: '张子轩（队员A）',
        phone: '13910010001',
        email: 'zhangzixuan@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['Pwn手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adv-notadv-1',
        name: '赵振宇 教授（老师D）',
        phone: '13800138001',
        email: 'zhaozhenyu@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2025-09-12 10:00',
    updatedAt: '2025-09-25 18:00',
  },

  // ================= 2. 全国各高校战队示例数据（供后台【报名管理 -> 查看报名（三大Tab）】全面展示三段式审核与晋级提报） =================
  {
    id: 'admin-team-buaa-1',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: '二进制漏洞挖掘与Pwn赛道',
    teamName: '北航长空玄甲战队',
    teamLogo: 'default-logo',
    teamIntro: '北京航空航天大学网安学院主力战队，校内选拔赛总分第1名，专注内核漏洞利用与固件逆向。',
    university: '北京航空航天大学',
    captainName: '陈思远',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['Pwn手', '逆向手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-25 10:30:00',
    advancementStatus: 'wait_school_match',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'adm-buaa-m1',
        name: '宋知行（队员G）',
        phone: '13910010004',
        email: 'songzhixing@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['Web手', '密码学手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'adm-buaa-m2',
        name: '沈清雪（队员H）',
        phone: '13910010005',
        email: 'shenqingxue@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['杂项手', '取证手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-buaa-adv1',
        name: '赵振宇 教授（老师D）',
        phone: '13800138001',
        email: 'zhaozhenyu@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-18 09:20',
    updatedAt: '2026-10-25 10:30',
  },
  {
    id: 'admin-team-buaa-2',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: 'Web应用与云原生攻防赛道',
    teamName: '北航惊蛰云攻防联队',
    teamLogo: 'default-logo',
    teamIntro: '北京航空航天大学云原生与Web安全实验室联队，校内选拔赛总分第2名。',
    university: '北京航空航天大学',
    captainName: '宋知行',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['Web手', '取证手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-25 11:15:00',
    advancementStatus: 'wait_school_match',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'adm-buaa-201',
        name: '刘语桐（队员E）',
        phone: '13910010003',
        email: 'liuyutong@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['Web手', '杂项手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-buaa-adv2',
        name: '冯文博 副教授（老师E）',
        phone: '13800138005',
        email: 'fengwenbo@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-19 14:10',
    updatedAt: '2026-10-25 11:15',
  },
  {
    id: 'admin-team-buaa-3',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: '密码学与区块链协议安全赛道',
    teamName: '北航星河密码攻坚队',
    teamLogo: 'default-logo',
    teamIntro: '北京航空航天大学密码学与零知识证明团队，校内选拔赛总分第3名。',
    university: '北京航空航天大学',
    captainName: '沈清雪',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['密码学手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-25 15:40:00',
    advancementStatus: 'wait_school_match',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'adm-buaa-301',
        name: '张子轩（队员A）',
        phone: '13910010001',
        email: 'zhangzixuan@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['逆向手', '密码学手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-buaa-adv3',
        name: '赵振宇 教授（老师D）',
        phone: '13800138001',
        email: 'zhaozhenyu@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-20 10:00',
    updatedAt: '2026-10-25 15:40',
  },
  {
    id: 'admin-team-buaa-4',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: 'Web应用与云原生攻防赛道',
    teamName: '北航凌霄网安预备队',
    teamLogo: 'default-logo',
    teamIntro: '北京航空航天大学大二网安实验班战队，校内选拔赛第4名（可用于测试提报弹窗超额防呆与未晋级流转）。',
    university: '北京航空航天大学',
    captainName: '张子轩',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['Web手', '杂项手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-25 16:20:00',
    advancementStatus: 'wait_school_match',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'adm-buaa-401',
        name: '刘语桐（队员E）',
        phone: '13910010003',
        email: 'liuyutong@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['取证手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-buaa-adv4',
        name: '冯文博 副教授（老师E）',
        phone: '13800138005',
        email: 'fengwenbo@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-21 11:30',
    updatedAt: '2026-10-25 16:20',
  },
  {
    id: 'admin-team-1',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: '二进制漏洞挖掘与Pwn赛道',
    teamName: '清华紫荆星盾战队',
    teamLogo: 'default-logo',
    teamIntro: '清华大学网络研究院二进制安全联队，专注内核漏洞利用与自动化符号执行。',
    university: '清华大学',
    captainName: '张明远',
    captainUniversity: '清华大学',
    captainVerified: true,
    captainCtfRoles: ['Pwn手', '逆向手'],
    status: 'approved',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-18 14:00:00',
    advancementStatus: 'advanced',
    schoolRank: 1,
    advancementSubmittedAt: '2026-10-19 16:30:00',
    secretariatAuditStatus: 'approved',
    secretariatAuditedAt: '2026-10-20 15:00:00',
    members: [
      {
        id: 'adm-m-101',
        name: '王子涵',
        phone: '13910010006',
        email: 'wangzihan@tsinghua.edu.cn',
        university: '清华大学',
        role: 'member',
        ctfRoles: ['Web手', '密码学手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'adm-m-102',
        name: '周牧野',
        phone: '13910228811',
        email: 'zhoumuye@tsinghua.edu.cn',
        university: '清华大学',
        role: 'member',
        ctfRoles: ['Pwn手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'adm-m-103',
        name: '林知夏',
        phone: '13910228812',
        email: 'linzhixia@tsinghua.edu.cn',
        university: '清华大学',
        role: 'member',
        ctfRoles: ['杂项手', '取证手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-101',
        name: '孙立群 教授',
        phone: '13800138002',
        email: 'sunliqun@tsinghua.edu.cn',
        university: '清华大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-16 10:12',
    updatedAt: '2026-10-20 15:00',
  },
  {
    id: 'admin-team-2',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: '密码学与区块链协议安全赛道',
    teamName: '浙大木兰Sec战队',
    teamLogo: 'default-logo',
    teamIntro: '浙江大学密码学与区块链安全女子战队，深耕零知识证明电路审计与商密实现分析。',
    university: '浙江大学',
    captainName: '苏婉清',
    captainUniversity: '浙江大学',
    captainVerified: true,
    captainCtfRoles: ['密码学手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-20 11:00:00',
    advancementStatus: 'pending_secretariat',
    schoolRank: 1,
    advancementSubmittedAt: '2026-10-22 09:30:00',
    secretariatAuditStatus: 'pending',
    members: [
      {
        id: 'adm-m-201',
        name: '叶书婷',
        phone: '13910010007',
        email: 'yeshuting@zju.edu.cn',
        university: '浙江大学',
        role: 'member',
        ctfRoles: ['密码学手', '逆向手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'adm-m-202',
        name: '沈若雪',
        phone: '13757119022',
        email: 'shenruoxue@zju.edu.cn',
        university: '浙江大学',
        role: 'member',
        ctfRoles: ['Web手', '杂项手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-201',
        name: '周建勋 博导',
        phone: '13857100991',
        email: 'zhoujianxun@zju.edu.cn',
        university: '浙江大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-17 11:45',
    updatedAt: '2026-10-22 09:30',
  },
  {
    id: 'admin-team-2b',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: 'Web应用与云原生攻防赛道',
    teamName: '浙大求是云剑战队',
    teamLogo: 'default-logo',
    teamIntro: '浙江大学网络空间安全学院战队，校内选拔赛第2名，专注云原生API网关与容器逃逸检测。',
    university: '浙江大学',
    captainName: '林星河',
    captainUniversity: '浙江大学',
    captainVerified: true,
    captainCtfRoles: ['Web手', 'Pwn手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-20 11:20:00',
    advancementStatus: 'pending_secretariat',
    schoolRank: 2,
    advancementSubmittedAt: '2026-10-22 09:30:00',
    secretariatAuditStatus: 'pending',
    members: [
      {
        id: 'adm-m-205',
        name: '许知远',
        phone: '13757119088',
        email: 'xuzhiyuan@zju.edu.cn',
        university: '浙江大学',
        role: 'member',
        ctfRoles: ['逆向手', '取证手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-205',
        name: '周建勋 博导',
        phone: '13857100991',
        email: 'zhoujianxun@zju.edu.cn',
        university: '浙江大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-18 09:10',
    updatedAt: '2026-10-22 09:30',
  },
  {
    id: 'admin-team-3',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: 'Web应用与云原生攻防赛道',
    teamName: '上交0ops-Next青年队',
    teamLogo: 'default-logo',
    teamIntro: '上海交通大学网络安全战队，主攻云原生微服务链路渗透与自动化WAF防御补丁。',
    university: '上海交通大学',
    captainName: '陈哲瀚',
    captainUniversity: '上海交通大学',
    captainVerified: true,
    captainCtfRoles: ['Web手'],
    status: 'pending_review',
    schoolAuditStatus: 'pending',
    advancementStatus: 'none',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'adm-m-301',
        name: '顾怀瑾',
        phone: '13621004512',
        email: 'guhuaijin@sjtu.edu.cn',
        university: '上海交通大学',
        role: 'member',
        ctfRoles: ['Web手', 'Pwn手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'adm-m-302',
        name: '唐亦凡',
        phone: '13621004519',
        email: 'tangyifan@sjtu.edu.cn',
        university: '上海交通大学',
        role: 'member',
        ctfRoles: ['逆向手', '取证手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-301',
        name: '王志远 副教授',
        phone: '13916008821',
        email: 'wangzhiyuan@sjtu.edu.cn',
        university: '上海交通大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-21 16:08',
    updatedAt: '2026-10-27 14:20',
  },
  {
    id: 'admin-team-4',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: '二进制漏洞挖掘与Pwn赛道',
    teamName: '西电秦岭玄甲战队',
    teamLogo: 'default-logo',
    teamIntro: '西安电子科技大学玄甲攻防实验室战队，专攻路由器固件逆向与内核态堆利用。',
    university: '西安电子科技大学',
    captainName: '陆景琛',
    captainUniversity: '西安电子科技大学',
    captainVerified: true,
    captainCtfRoles: ['Pwn手', '逆向手'],
    status: 'pending_review',
    schoolAuditStatus: 'pending',
    advancementStatus: 'none',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'adm-m-401',
        name: '赵子昂',
        phone: '15829013341',
        email: 'zhaoziang@xidian.edu.cn',
        university: '西安电子科技大学',
        role: 'member',
        ctfRoles: ['Pwn手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'adm-m-402',
        name: '魏星河',
        phone: '15829013349',
        email: 'weixinghe@xidian.edu.cn',
        university: '西安电子科技大学',
        role: 'member',
        ctfRoles: ['逆向手', '杂项手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-401',
        name: '郭建华 教授',
        phone: '13991807712',
        email: 'guojianhua@xidian.edu.cn',
        university: '西安电子科技大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-22 09:50',
    updatedAt: '2026-10-27 18:10',
  },
  {
    id: 'admin-team-5',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: '密码学与区块链协议安全赛道',
    teamName: '北邮天枢星云战队',
    teamLogo: 'default-logo',
    teamIntro: '北京邮电大学密码工程战队，专注后量子密码实现与智能合约形式化验证。',
    university: '北京邮电大学',
    captainName: '何景曜',
    captainUniversity: '北京邮电大学',
    captainVerified: true,
    captainCtfRoles: ['密码学手'],
    status: 'pending_review',
    schoolAuditStatus: 'rejected',
    schoolRejectReason: '队员谢明轩提交的学生证扫描件非本学期注册页，请重新核验学籍材料后提交高校审核。',
    advancementStatus: 'none',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'adm-m-501',
        name: '许知夏',
        phone: '13520886102',
        email: 'xuzhixia@bupt.edu.cn',
        university: '北京邮电大学',
        role: 'member',
        ctfRoles: ['密码学手', 'Web手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'adm-m-502',
        name: '谢明轩',
        phone: '13520886109',
        email: 'xiemingxuan@bupt.edu.cn',
        university: '北京邮电大学',
        role: 'member',
        ctfRoles: ['逆向手'],
        isVerified: false,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-501',
        name: '唐卫东 副教授',
        phone: '13810559920',
        email: 'tangweidong@bupt.edu.cn',
        university: '北京邮电大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-19 14:15',
    updatedAt: '2026-10-26 11:30',
  },
  {
    id: 'admin-team-6',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: 'Web应用与云原生攻防赛道',
    teamName: '哈工大紫丁香Sec战队',
    teamLogo: 'default-logo',
    teamIntro: '哈尔滨工业大学紫丁香网络安全战队，深耕工控与Web复合型靶场攻防对抗。',
    university: '哈尔滨工业大学',
    captainName: '韩振东',
    captainUniversity: '哈尔滨工业大学',
    captainVerified: true,
    captainCtfRoles: ['Web手', 'Pwn手'],
    status: 'approved',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-21 10:00:00',
    advancementStatus: 'advanced',
    schoolRank: 1,
    advancementSubmittedAt: '2026-10-22 14:00:00',
    secretariatAuditStatus: 'approved',
    secretariatAuditedAt: '2026-10-23 16:00:00',
    members: [
      {
        id: 'adm-m-601',
        name: '梁博文',
        phone: '13945016621',
        email: 'liangbowen@hit.edu.cn',
        university: '哈尔滨工业大学',
        role: 'member',
        ctfRoles: ['逆向手', '取证手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-601',
        name: '曲向东 教授',
        phone: '13945010088',
        email: 'quxiangdong@hit.edu.cn',
        university: '哈尔滨工业大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-18 08:40',
    updatedAt: '2026-10-23 16:00',
  },
  {
    id: 'admin-team-7',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    subTrackName: '二进制漏洞挖掘与Pwn赛道',
    teamName: '中科大星火极客队',
    teamLogo: 'default-logo',
    teamIntro: '中国科学技术大学二进制与系统安全研究小组，专注编译器插桩与Fuzzing优化。',
    university: '中国科学技术大学',
    captainName: '顾言蹊',
    captainUniversity: '中国科学技术大学',
    captainVerified: true,
    captainCtfRoles: ['Pwn手', '逆向手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-25 14:20:00',
    advancementStatus: 'secretariat_rejected',
    schoolRank: 1,
    advancementSubmittedAt: '2026-10-26 16:00:00',
    secretariatAuditStatus: 'rejected',
    secretariatAuditedAt: '2026-10-27 20:15:00',
    secretariatRejectReason: '上传的校赛成绩单扫描件缺少学院教务公章，请高校管理员补盖公章后重新提报晋级名单。',
    members: [
      {
        id: 'adm-m-701',
        name: '方慕白',
        phone: '13855129901',
        email: 'fangmubai@ustc.edu.cn',
        university: '中国科学技术大学',
        role: 'member',
        ctfRoles: ['Web手', '密码学手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-701',
        name: '沈怀瑾 教授',
        phone: '13855120011',
        email: 'shenhuaijin@ustc.edu.cn',
        university: '中国科学技术大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-24 20:15',
    updatedAt: '2026-10-27 20:15',
  },
  {
    id: 'admin-team-8',
    competitionId: 'comp-2026-cloud-def',
    competitionTitle: '2026“XX杯”云原生与零信任架构安全攻防挑战赛',
    subTrackName: '基于eBPF的零信任微隔离与流量审计赛道',
    teamName: '清华云原生星盾联队',
    teamLogo: 'default-logo',
    teamIntro: '清华大学网络空间安全实验室团队，专攻eBPF内核态零信任微隔离。',
    university: '清华大学',
    captainName: '王子涵',
    captainUniversity: '清华大学',
    captainVerified: true,
    captainCtfRoles: ['Web手', 'Pwn手'],
    status: 'approved',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-21 09:00:00',
    advancementStatus: 'advanced',
    schoolRank: 1,
    advancementSubmittedAt: '2026-10-22 15:00:00',
    secretariatAuditStatus: 'approved',
    secretariatAuditedAt: '2026-10-24 14:00:00',
    members: [
      {
        id: 'adm-m-801',
        name: '周牧野',
        phone: '13910228811',
        email: 'zhoumuye@tsinghua.edu.cn',
        university: '清华大学',
        role: 'member',
        ctfRoles: ['逆向手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
      {
        id: 'adm-m-802',
        name: '林知夏',
        phone: '13910228812',
        email: 'linzhixia@tsinghua.edu.cn',
        university: '清华大学',
        role: 'member',
        ctfRoles: ['取证手', '杂项手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-801',
        name: '孙立群 教授',
        phone: '13800138002',
        email: 'sunliqun@tsinghua.edu.cn',
        university: '清华大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-19 10:30',
    updatedAt: '2026-10-24 14:00',
  },
  {
    id: 'admin-team-9',
    competitionId: 'comp-2026-cloud-def',
    competitionTitle: '2026“XX杯”云原生与零信任架构安全攻防挑战赛',
    subTrackName: '云原生容器集群渗透与逃逸防御赛道',
    teamName: '武大珞珈云盾战队',
    teamLogo: 'default-logo',
    teamIntro: '武汉大学国家网络安全学院容器安全团队，研究runc/containerd逃逸检测。',
    university: '武汉大学',
    captainName: '江明澈',
    captainUniversity: '武汉大学',
    captainVerified: true,
    captainCtfRoles: ['Web手'],
    status: 'pending_review',
    schoolAuditStatus: 'pending',
    advancementStatus: 'none',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'adm-m-901',
        name: '楚天舒',
        phone: '13971024418',
        email: 'chutianshu@whu.edu.cn',
        university: '武汉大学',
        role: 'member',
        ctfRoles: ['Pwn手', '取证手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-901',
        name: '严正华 教授',
        phone: '13971020009',
        email: 'yanzhenghua@whu.edu.cn',
        university: '武汉大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-23 13:20',
    updatedAt: '2026-10-27 17:45',
  },
  {
    id: 'admin-team-10',
    competitionId: 'comp-2026-cloud-def',
    competitionTitle: '2026“XX杯”云原生与零信任架构安全攻防挑战赛',
    subTrackName: 'Serverless与微服务API网关供应链安全赛道',
    teamName: '华科喻家山零信任战队',
    teamLogo: 'default-logo',
    teamIntro: '华中科技大学网络空间安全学院战队，聚焦API网关鉴权漏洞挖掘与服务网格审计。',
    university: '华中科技大学',
    captainName: '程思源',
    captainUniversity: '华中科技大学',
    captainVerified: true,
    captainCtfRoles: ['Web手', '密码学手'],
    status: 'pending_review',
    schoolAuditStatus: 'rejected',
    schoolRejectReason: '参赛赛道填报与提交的容器基线配置不符，且缺少指导教师备案信息，请核实后重提。',
    advancementStatus: 'none',
    secretariatAuditStatus: 'none',
    members: [
      {
        id: 'adm-m-1001',
        name: '罗一鸣',
        phone: '13871193320',
        email: 'luoyiming@hust.edu.cn',
        university: '华中科技大学',
        role: 'member',
        ctfRoles: ['逆向手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [],
    createdAt: '2026-10-20 15:50',
    updatedAt: '2026-10-26 10:10',
  },
  {
    id: 'admin-team-11',
    competitionId: 'comp-2026-solo-vuln',
    competitionTitle: '2026“XX杯”零日漏洞挖掘与二进制极客个人挑战赛（单兵赛制）',
    subTrackName: '浏览器引擎与编译器漏洞挖掘个人赛道',
    teamName: 'PKU-V8Hunter（单兵队）',
    teamLogo: 'default-logo',
    teamIntro: '北京大学软件安全实验室个人极客，专注Chrome V8 TurboFan JIT漏洞挖掘。',
    university: '北京大学',
    captainName: '温景行',
    captainUniversity: '北京大学',
    captainVerified: true,
    captainCtfRoles: ['Pwn手', '逆向手'],
    status: 'pending_review',
    schoolAuditStatus: 'pending',
    advancementStatus: 'none',
    secretariatAuditStatus: 'none',
    members: [],
    advisors: [
      {
        id: 'adm-adv-1101',
        name: '裴文远 教授',
        phone: '13810097711',
        email: 'peiwenyuan@pku.edu.cn',
        university: '北京大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-25 11:00',
    updatedAt: '2026-10-27 09:30',
  },
  {
    id: 'admin-team-12',
    competitionId: 'comp-2026-iot-earlyclose',
    competitionTitle: '2026“XX杯”物联网固件逆向与智能终端安全挑战赛',
    subTrackName: '智能终端TEE可信执行环境与侧信道安全赛道',
    teamName: '成电银杏硬件安全队',
    teamLogo: 'default-logo',
    teamIntro: '电子科技大学硬件与嵌入式安全实验室，专攻ARM TrustZone漏洞挖掘与故障注入。',
    university: '电子科技大学',
    captainName: '萧景琰',
    captainUniversity: '电子科技大学',
    captainVerified: true,
    captainCtfRoles: ['逆向手', 'Pwn手'],
    status: 'approved',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-16 10:00:00',
    advancementStatus: 'advanced',
    schoolRank: 1,
    advancementSubmittedAt: '2026-10-18 11:00:00',
    secretariatAuditStatus: 'approved',
    secretariatAuditedAt: '2026-10-19 16:40:00',
    members: [
      {
        id: 'adm-m-1201',
        name: '秦明月',
        phone: '13880912231',
        email: 'qinmingyue@uestc.edu.cn',
        university: '电子科技大学',
        role: 'member',
        ctfRoles: ['密码学手', '取证手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-1201',
        name: '贺振邦 教授',
        phone: '13880910002',
        email: 'hezhenbang@uestc.edu.cn',
        university: '电子科技大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-12 14:20',
    updatedAt: '2026-10-19 16:40',
  },
  {
    id: 'admin-team-13',
    competitionId: 'comp-2026-crypto-deadline',
    competitionTitle: '2026“XX杯”商用密码应用与后量子密码算法挑战赛',
    subTrackName: '政务信息系统商用密码密评改造方案赛道',
    teamName: '复旦卿云密码工程队',
    teamLogo: 'default-logo',
    teamIntro: '复旦大学密码工程与数据安全团队，专注高并发TLS国密套件卸载加速与密评合规。',
    university: '复旦大学',
    captainName: '纪云深',
    captainUniversity: '复旦大学',
    captainVerified: true,
    captainCtfRoles: ['密码学手'],
    status: 'approved',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-05 14:00:00',
    advancementStatus: 'advanced',
    schoolRank: 1,
    advancementSubmittedAt: '2026-10-06 16:00:00',
    secretariatAuditStatus: 'approved',
    secretariatAuditedAt: '2026-10-08 15:20:00',
    members: [
      {
        id: 'adm-m-1301',
        name: '白若溪',
        phone: '13701928831',
        email: 'bairuoxi@fudan.edu.cn',
        university: '复旦大学',
        role: 'member',
        ctfRoles: ['Web手', '密码学手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-1301',
        name: '盛怀安 教授',
        phone: '13701920012',
        email: 'shenghuaian@fudan.edu.cn',
        university: '复旦大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-09-25 10:00',
    updatedAt: '2026-10-08 15:20',
  },
  {
    id: 'admin-team-14',
    competitionId: 'comp-2026-ai-pilot',
    competitionTitle: '2026“XX杯”全国网数智安全大赛 · 大模型与人工智能安全先导赛',
    subTrackName: 'AIGC音视频深度伪造（Deepfake）鉴伪溯源赛道',
    teamName: '东大金陵智鉴战队',
    teamLogo: 'default-logo',
    teamIntro: '东南大学网络空间安全学院多模态鉴伪团队，专注扩散模型生成伪影频域检测。',
    university: '东南大学',
    captainName: '慕容轩',
    captainUniversity: '东南大学',
    captainVerified: true,
    captainCtfRoles: ['杂项手', '取证手'],
    status: 'approved',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-06-21 10:00:00',
    advancementStatus: 'advanced',
    schoolRank: 1,
    advancementSubmittedAt: '2026-06-23 15:00:00',
    secretariatAuditStatus: 'approved',
    secretariatAuditedAt: '2026-06-25 11:15:00',
    members: [
      {
        id: 'adm-m-1401',
        name: '姜知微',
        phone: '13951608823',
        email: 'jiangzhiwei@seu.edu.cn',
        university: '东南大学',
        role: 'member',
        ctfRoles: ['Web手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-1401',
        name: '钟文瀚 教授',
        phone: '13951600018',
        email: 'zhongwenhan@seu.edu.cn',
        university: '东南大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-06-18 09:40',
    updatedAt: '2026-06-25 11:15',
  },
  {
    id: 'admin-team-15',
    competitionId: 'comp-2026-ics-special',
    competitionTitle: '2026“XX杯”车联网与智能工业控制系统安全极客邀请赛',
    subTrackName: '智能网联汽车CAN/车载以太网渗透与防护赛道',
    teamName: '北航车联护盾联队',
    teamLogo: 'default-logo',
    teamIntro: '专注智能网联汽车CAN总线与车载以太网安全防护。',
    university: '北京航空航天大学',
    captainName: '周子航',
    captainUniversity: '北京航空航天大学',
    captainVerified: true,
    captainCtfRoles: ['Web手', '取证手'],
    status: 'approved',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-22 10:00:00',
    advancementStatus: 'advanced',
    schoolRank: 1,
    advancementSubmittedAt: '2026-10-22 17:00:00',
    secretariatAuditStatus: 'approved',
    secretariatAuditedAt: '2026-10-23 16:30:00',
    members: [
      {
        id: 'adm-m-1501',
        name: '宋知行（队员G）',
        phone: '13910010004',
        email: 'songzhixing@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'member',
        ctfRoles: ['逆向手', 'Pwn手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [
      {
        id: 'adm-adv-1501',
        name: '赵振宇 教授（老师D）',
        phone: '13800138001',
        email: 'zhaozhenyu@buaa.edu.cn',
        university: '北京航空航天大学',
        role: 'advisor',
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    createdAt: '2026-10-21 10:00',
    updatedAt: '2026-10-23 16:30',
  },
  {
    id: 'admin-team-16',
    competitionId: 'comp-2026-ics-special',
    competitionTitle: '2026“XX杯”车联网与智能工业控制系统安全极客邀请赛',
    subTrackName: '新型电力系统与工业PLC固件安全赛道',
    teamName: '国防科大长城工控卫士队',
    teamLogo: 'default-logo',
    teamIntro: '专注电力SCADA系统Modbus/S7协议深度解析与工业PLC微隔离防御。',
    university: '国防科技大学',
    captainName: '雷振庭',
    captainUniversity: '国防科技大学',
    captainVerified: true,
    captainCtfRoles: ['逆向手', 'Pwn手'],
    status: 'pending_review',
    schoolAuditStatus: 'approved',
    schoolAuditedAt: '2026-10-23 15:00:00',
    advancementStatus: 'pending_secretariat',
    schoolRank: 1,
    advancementSubmittedAt: '2026-10-24 09:00:00',
    secretariatAuditStatus: 'pending',
    members: [
      {
        id: 'adm-m-1601',
        name: '霍承宇',
        phone: '13787109921',
        email: 'huochengyu@nudt.edu.cn',
        university: '国防科技大学',
        role: 'member',
        ctfRoles: ['Web手', '杂项手'],
        isVerified: true,
        confirmStatus: 'accepted',
      },
    ],
    advisors: [],
    createdAt: '2026-10-22 14:15',
    updatedAt: '2026-10-24 09:00',
  },
];

// 初始预置各高校在各赛事下的【第二段：高校晋级名单提报】聚合记录（供后台 Tab 1 & Tab 2 秘书处终审联动）
export const INITIAL_UNIVERSITY_ADVANCEMENT_SUBMISSIONS: UniversityAdvancementSubmission[] = [
  {
    id: 'adv-sub-zju-main',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    university: '浙江大学',
    teamIds: ['admin-team-2', 'admin-team-2b'],
    proofFiles: [
      {
        id: 'pf-zju-1',
        name: '2026浙江大学校内选拔赛官方成绩单(盖章扫描件).pdf',
        size: '2.4 MB',
        type: 'pdf',
        uploadedAt: '2026-10-22 09:28',
      },
      {
        id: 'pf-zju-2',
        name: '浙江大学网络空间安全学院晋级推荐名单汇总表.xlsx',
        size: '418 KB',
        type: 'excel',
        uploadedAt: '2026-10-22 09:29',
      },
    ],
    status: 'pending',
    submittedBy: '周建勋',
    submittedAt: '2026-10-22 09:30:00',
  },
  {
    id: 'adv-sub-thu-main',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    university: '清华大学',
    teamIds: ['admin-team-1'],
    proofFiles: [
      {
        id: 'pf-thu-1',
        name: '清华大学2026网数智安全校内选拔赛成绩单与公章证明.pdf',
        size: '3.1 MB',
        type: 'pdf',
        uploadedAt: '2026-10-19 16:25',
      },
      {
        id: 'pf-thu-2',
        name: '清华大学晋级决赛队伍排名确认函.png',
        size: '1.6 MB',
        type: 'image',
        uploadedAt: '2026-10-19 16:28',
      },
    ],
    status: 'approved',
    submittedBy: '孙立群',
    submittedAt: '2026-10-19 16:30:00',
    auditedBy: '王静怡（大赛组委会秘书处）',
    auditedAt: '2026-10-20 15:00:00',
  },
  {
    id: 'adv-sub-hit-main',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    university: '哈尔滨工业大学',
    teamIds: ['admin-team-6'],
    proofFiles: [
      {
        id: 'pf-hit-1',
        name: '哈尔滨工业大学校内选拔赛决赛成绩公示单.pdf',
        size: '1.9 MB',
        type: 'pdf',
        uploadedAt: '2026-10-22 13:55',
      },
    ],
    status: 'approved',
    submittedBy: '曲向东',
    submittedAt: '2026-10-22 14:00:00',
    auditedBy: '王静怡（大赛组委会秘书处）',
    auditedAt: '2026-10-23 16:00:00',
  },
  {
    id: 'adv-sub-ustc-main',
    competitionId: 'comp-2026-main',
    competitionTitle: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    university: '中国科学技术大学',
    teamIds: ['admin-team-7'],
    proofFiles: [
      {
        id: 'pf-ustc-1',
        name: '中科大2026网安校内赛成绩表(未盖章初稿).pdf',
        size: '1.2 MB',
        type: 'pdf',
        uploadedAt: '2026-10-26 15:58',
      },
    ],
    status: 'rejected',
    rejectReason: '上传的校赛成绩单扫描件缺少学院教务公章，请高校管理员补盖公章后重新提报晋级名单。',
    submittedBy: '沈怀瑾',
    submittedAt: '2026-10-26 16:00:00',
    auditedBy: '王静怡（大赛组委会秘书处）',
    auditedAt: '2026-10-27 20:15:00',
  },
  {
    id: 'adv-sub-buaa-solo',
    competitionId: 'comp-2026-solo-vuln',
    competitionTitle: '2026“XX杯”零日漏洞挖掘与二进制极客个人挑战赛（单兵赛制）',
    university: '北京航空航天大学',
    teamIds: ['cap-team-7'],
    proofFiles: [
      {
        id: 'pf-buaa-solo-1',
        name: '北京航空航天大学单兵漏洞挑战赛校内积分榜(盖章版).pdf',
        size: '2.2 MB',
        type: 'pdf',
        uploadedAt: '2026-10-27 14:25',
      },
      {
        id: 'pf-buaa-solo-2',
        name: '北航网安学院晋级单兵选手推荐表.xlsx',
        size: '350 KB',
        type: 'excel',
        uploadedAt: '2026-10-27 14:28',
      },
    ],
    status: 'pending',
    submittedBy: '赵振宇',
    submittedAt: '2026-10-27 14:30:00',
  },
  {
    id: 'adv-sub-buaa-cloud',
    competitionId: 'comp-2026-cloud-def',
    competitionTitle: '2026“XX杯”云原生与零信任架构安全攻防挑战赛',
    university: '北京航空航天大学',
    teamIds: ['cap-team-8'],
    proofFiles: [
      {
        id: 'pf-buaa-cloud-1',
        name: '北航云原生安全校内赛成绩单扫描件_低分辨率.jpg',
        size: '680 KB',
        type: 'image',
        uploadedAt: '2026-10-26 15:55',
      },
    ],
    status: 'rejected',
    rejectReason:
      '经大赛组委会秘书处终审：北京航空航天大学提报的校赛成绩单扫描件分辨率较低（学院公章区域模糊），已打回高校管理员重新上传清晰证明材料后再行提报。',
    submittedBy: '赵振宇',
    submittedAt: '2026-10-26 16:00:00',
    auditedBy: '陈建国（大赛组委会总裁判长）',
    auditedAt: '2026-10-27 17:15:00',
  },
  {
    id: 'adv-sub-thu-cloud',
    competitionId: 'comp-2026-cloud-def',
    competitionTitle: '2026“XX杯”云原生与零信任架构安全攻防挑战赛',
    university: '清华大学',
    teamIds: ['admin-team-8'],
    proofFiles: [
      {
        id: 'pf-thu-cloud-1',
        name: '清华大学云原生安全赛道校内选拔赛成绩证明.pdf',
        size: '2.7 MB',
        type: 'pdf',
        uploadedAt: '2026-10-22 14:55',
      },
    ],
    status: 'approved',
    submittedBy: '孙立群',
    submittedAt: '2026-10-22 15:00:00',
    auditedBy: '王静怡（大赛组委会秘书处）',
    auditedAt: '2026-10-24 14:00:00',
  },
  {
    id: 'adv-sub-buaa-aipilot',
    competitionId: 'comp-2026-ai-pilot',
    competitionTitle: '2026“XX杯”全国网数智安全大赛 · 大模型与人工智能安全先导赛',
    university: '北京航空航天大学',
    teamIds: ['cap-team-3'],
    proofFiles: [
      {
        id: 'pf-buaa-ai-1',
        name: '北航人工智能安全先导赛校内选拔成绩单(盖章).pdf',
        size: '2.8 MB',
        type: 'pdf',
        uploadedAt: '2026-06-14 15:50',
      },
      {
        id: 'pf-buaa-ai-2',
        name: '北航晋级总决赛战队名单公示截图.png',
        size: '1.4 MB',
        type: 'image',
        uploadedAt: '2026-06-14 15:55',
      },
    ],
    status: 'approved',
    submittedBy: '赵振宇',
    submittedAt: '2026-06-14 16:00:00',
    auditedBy: '王静怡（大赛组委会秘书处）',
    auditedAt: '2026-06-15 10:00:00',
  },
  {
    id: 'adv-sub-seu-aipilot',
    competitionId: 'comp-2026-ai-pilot',
    competitionTitle: '2026“XX杯”全国网数智安全大赛 · 大模型与人工智能安全先导赛',
    university: '东南大学',
    teamIds: ['admin-team-14'],
    proofFiles: [
      {
        id: 'pf-seu-ai-1',
        name: '东南大学AIGC鉴伪赛道校赛成绩单.pdf',
        size: '2.1 MB',
        type: 'pdf',
        uploadedAt: '2026-06-23 14:55',
      },
    ],
    status: 'approved',
    submittedBy: '钟文瀚',
    submittedAt: '2026-06-23 15:00:00',
    auditedBy: '王静怡（大赛组委会秘书处）',
    auditedAt: '2026-06-25 11:15:00',
  },
  {
    id: 'adv-sub-buaa-ics',
    competitionId: 'comp-2026-ics-special',
    competitionTitle: '2026“XX杯”车联网与智能工业控制系统安全极客邀请赛',
    university: '北京航空航天大学',
    teamIds: ['admin-team-15'],
    proofFiles: [
      {
        id: 'pf-buaa-ics-1',
        name: '北航车联网安全极客赛校内选拔成绩单.pdf',
        size: '1.8 MB',
        type: 'pdf',
        uploadedAt: '2026-10-22 16:55',
      },
    ],
    status: 'approved',
    submittedBy: '赵振宇',
    submittedAt: '2026-10-22 17:00:00',
    auditedBy: '王静怡（大赛组委会秘书处）',
    auditedAt: '2026-10-23 16:30:00',
  },
  {
    id: 'adv-sub-nudt-ics',
    competitionId: 'comp-2026-ics-special',
    competitionTitle: '2026“XX杯”车联网与智能工业控制系统安全极客邀请赛',
    university: '国防科技大学',
    teamIds: ['admin-team-16'],
    proofFiles: [
      {
        id: 'pf-nudt-ics-1',
        name: '国防科技大学工控安全赛道校内选拔成绩证明.pdf',
        size: '2.5 MB',
        type: 'pdf',
        uploadedAt: '2026-10-24 08:55',
      },
    ],
    status: 'pending',
    submittedBy: '雷振庭',
    submittedAt: '2026-10-24 09:00:00',
  },
];

// 初始预置“我参与的（队员/老师视角）”受邀记录
export const INITIAL_PARTICIPATED_TEAMS: ParticipatedTeamRecord[] = [
  {
    id: 'part-team-1',
    competitionId: 'comp-2026-ics-special',
    competitionTitle: '2026“XX杯”车联网与智能工业控制系统安全极客邀请赛',
    subTrackName: '智能网联汽车CAN/车载以太网渗透与防护赛道',
    teamName: '北航车联护盾联队',
    teamLogo: 'default-logo',
    teamIntro: '专注智能网联汽车车载总线固件逆向、CAN报文入侵检测与V2X通信安全防护（同校合规邀请，点击同意可直接通过）。',
    captainName: '周子航',
    captainPhone: '137****8821',
    university: '北京航空航天大学',
    myRoleInTeam: '参赛队员',
    myCtfRoles: ['逆向手', 'Pwn手'],
    status: 'pending_invite',
    invitedAt: '2026-10-28 09:45',
    teammatesSummary: ['周子航（队长 · 北京航空航天大学）', '赵振宇 教授（指导教师 · 已同意）'],
    teamMembersDetail: [
      {
        name: '周子航',
        role: '队长',
        university: '北京航空航天大学',
        ctfRoles: ['Web手', '取证手'],
        statusLabel: '队长本人',
      },
      {
        name: '林远航',
        role: '队员',
        university: '北京航空航天大学',
        ctfRoles: ['逆向手', 'Pwn手'],
        statusLabel: '待确认（本人）',
      },
      {
        name: '赵振宇 教授',
        role: '指导教师',
        university: '北京航空航天大学',
        statusLabel: '已同意',
      },
    ],
  },
  {
    id: 'part-team-3',
    competitionId: 'comp-2026-cloud-def',
    competitionTitle: '2026“XX杯”云原生与零信任架构安全攻防挑战赛',
    subTrackName: '云原生容器集群渗透与逃逸防御赛道',
    teamName: '北航云原生星云战队',
    teamLogo: 'default-logo',
    teamIntro: '围绕Kubernetes生产集群RBAC权限逃逸、Service Mesh流量劫持防御展开联合攻关。',
    captainName: '宋知行',
    captainPhone: '139****0004',
    university: '北京航空航天大学',
    myRoleInTeam: '参赛队员',
    myCtfRoles: ['Web手', '密码学手'],
    status: 'pending_invite',
    invitedAt: '2026-10-28 10:20',
    teammatesSummary: ['宋知行（队长 · 北京航空航天大学）', '陈思远（队员 · 已同意）'],
    teamMembersDetail: [
      {
        name: '宋知行',
        role: '队长',
        university: '北京航空航天大学',
        ctfRoles: ['Pwn手', '杂项手'],
        statusLabel: '队长本人',
      },
      {
        name: '陈思远',
        role: '队员',
        university: '北京航空航天大学',
        ctfRoles: ['逆向手'],
        statusLabel: '已同意',
      },
      {
        name: '林远航',
        role: '队员',
        university: '北京航空航天大学',
        ctfRoles: ['Web手', '密码学手'],
        statusLabel: '待确认（本人）',
      },
    ],
  },
  {
    id: 'part-team-4',
    competitionId: 'comp-2026-data',
    competitionTitle: '2026“XX杯”全国网数智安全大赛 · 数据安全与隐私计算专项挑战赛',
    subTrackName: '金融跨境数据合规与智能脱敏水印赛道',
    teamName: '北航数安暗水印突击队',
    teamLogo: 'default-logo',
    teamIntro: '研究高吞吐量数据库无损暗水印嵌入与跨境数据流转合规审计（状态：已同意加入，等待队长提交高校审核）。',
    captainName: '沈清雪',
    captainPhone: '139****0005',
    university: '北京航空航天大学',
    myRoleInTeam: '参赛队员',
    myCtfRoles: ['密码学手', '取证手'],
    status: 'joined',
    invitedAt: '2026-10-26 16:40',
    teammatesSummary: ['沈清雪（队长 · 北京航空航天大学）', '林远航（队员 · 已同意）', '赵振宇 教授（指导教师 · 已同意）'],
    teamMembersDetail: [
      {
        name: '沈清雪',
        role: '队长',
        university: '北京航空航天大学',
        ctfRoles: ['密码学手', '杂项手'],
        statusLabel: '队长本人',
      },
      {
        name: '林远航',
        role: '队员',
        university: '北京航空航天大学',
        ctfRoles: ['密码学手', '取证手'],
        statusLabel: '已同意（本人）',
      },
      {
        name: '赵振宇 教授',
        role: '指导教师',
        university: '北京航空航天大学',
        statusLabel: '已同意',
      },
    ],
  },
  {
    id: 'part-team-5',
    competitionId: 'comp-2026-iot-earlyclose',
    competitionTitle: '2026“XX杯”物联网固件逆向与智能终端安全挑战赛',
    subTrackName: '智能终端TEE可信执行环境与侧信道安全赛道',
    teamName: '北航可信终端安全联队',
    teamLogo: 'default-logo',
    teamIntro: '针对智能终端TEE可信执行环境开展故障注入与侧信道防护评测（状态：全员已确认，队长已提交审核中）。',
    captainName: '陈思远',
    captainPhone: '139****0002',
    university: '北京航空航天大学',
    myRoleInTeam: '参赛队员',
    myCtfRoles: ['逆向手', 'Pwn手'],
    status: 'team_pending_review',
    invitedAt: '2026-10-22 14:00',
    teammatesSummary: ['陈思远（队长 · 北京航空航天大学）', '林远航（队员 · 已同意）', '冯文博 副教授（指导教师 · 已同意）'],
    teamMembersDetail: [
      {
        name: '陈思远',
        role: '队长',
        university: '北京航空航天大学',
        ctfRoles: ['逆向手'],
        statusLabel: '队长本人',
      },
      {
        name: '林远航',
        role: '队员',
        university: '北京航空航天大学',
        ctfRoles: ['逆向手', 'Pwn手'],
        statusLabel: '已同意（本人）',
      },
      {
        name: '冯文博 副教授',
        role: '指导教师',
        university: '北京航空航天大学',
        statusLabel: '已同意',
      },
    ],
  },
  {
    id: 'part-team-6',
    competitionId: 'comp-2026-crypto-deadline',
    competitionTitle: '2026“XX杯”商用密码应用与后量子密码算法挑战赛',
    subTrackName: '政务信息系统商用密码密评改造方案赛道',
    teamName: '北航后量子格密码研究组',
    teamLogo: 'default-logo',
    teamIntro: '聚焦抗量子计算格密码NIST标准算法硬件加速实现（状态：本人已拒绝该入队邀请）。',
    captainName: '刘语桐',
    captainPhone: '139****0003',
    university: '北京航空航天大学',
    myRoleInTeam: '参赛队员',
    myCtfRoles: ['密码学手'],
    status: 'declined',
    invitedAt: '2026-10-15 19:30',
    teammatesSummary: ['刘语桐（队长 · 北京航空航天大学）'],
    teamMembersDetail: [
      {
        name: '刘语桐',
        role: '队长',
        university: '北京航空航天大学',
        ctfRoles: ['密码学手', 'Web手'],
        statusLabel: '队长本人',
      },
      {
        name: '林远航',
        role: '队员',
        university: '北京航空航天大学',
        ctfRoles: ['密码学手'],
        statusLabel: '已拒绝（本人）',
      },
    ],
    declineReason: '已作为队长组建同赛事“国密算法协议分析与白盒密码逆向赛道”战队，同一赛事无法兼报两支队伍',
  },
  {
    id: 'part-team-7',
    competitionId: 'comp-2026-ai-pilot',
    competitionTitle: '2026“XX杯”全国网数智安全大赛 · 大模型与人工智能安全先导赛',
    subTrackName: 'AIGC音视频深度伪造（Deepfake）鉴伪溯源赛道',
    teamName: '北航多模态鉴伪实验室战队',
    teamLogo: 'default-logo',
    teamIntro: '结合频域伪影捕捉与生物信号一致性分析，实现高精度AIGC音视频伪造鉴伪溯源（状态：队伍已通过高校与秘书处双级审核，报名成功）。',
    captainName: '韩明轩',
    captainPhone: '135****9012',
    university: '北京航空航天大学',
    myRoleInTeam: '参赛队员',
    myCtfRoles: ['取证手', '杂项手'],
    schoolRank: 2,
    status: 'team_approved',
    invitedAt: '2026-06-05 11:20',
    teammatesSummary: ['韩明轩（队长）', '林远航（队员）', '赵振宇 教授（指导教师）'],
    approvedSnapshot: {
      competitionTitle: '2026“XX杯”全国网数智安全大赛 · 大模型与人工智能安全先导赛',
      teamName: '北航多模态鉴伪实验室战队',
      teamLogo: 'default-logo',
      teamIntro: '结合频域伪影捕捉与生物信号一致性分析，实现高精度AIGC音视频伪造鉴伪溯源（状态：队伍已通过高校与秘书处双级审核，报名成功）。',
      subTrackName: 'AIGC音视频深度伪造（Deepfake）鉴伪溯源赛道',
      university: '北京航空航天大学',
      captainName: '韩明轩',
      captainPhone: '13510099012',
      captainEmail: 'hanmingxuan@buaa.edu.cn',
      schoolRank: 2,
      createdAt: '2026-06-05 11:20',
      approvedAt: '2026-06-16 14:20',
      members: [
        {
          name: '韩明轩',
          role: '队长',
          university: '北京航空航天大学',
          phone: '13510099012',
          email: 'hanmingxuan@buaa.edu.cn',
          ctfRoles: ['Web手', '取证手'],
        },
        {
          name: '林远航',
          role: '队员',
          university: '北京航空航天大学',
          phone: '13810246921',
          email: 'linyuanhang@buaa.edu.cn',
          ctfRoles: ['取证手', '杂项手'],
        },
        {
          name: '刘语桐',
          role: '队员',
          university: '北京航空航天大学',
          phone: '13910010003',
          email: 'liuyutong@buaa.edu.cn',
          ctfRoles: ['逆向手', '密码学手'],
        },
        {
          name: '赵振宇 教授',
          role: '指导教师',
          university: '北京航空航天大学',
          phone: '13800138001',
          email: 'zhaozhenyu@buaa.edu.cn',
        },
      ],
    },
  },
  {
    id: 'part-team-8',
    competitionId: 'comp-2025-archive-ctf',
    competitionTitle: '2025第四届“XX杯”全国网数智安全大赛 · 年度总决赛历史归档',
    subTrackName: '第四届网络安全攻防实战总决赛归档',
    teamName: '北航苍穹防线2025战队（指导教师视角示例）',
    teamLogo: 'default-logo',
    teamIntro: '展示指导教师受邀并完成双级终审通过的历史参赛记录。',
    captainName: '秦昊天',
    captainPhone: '138****6610',
    university: '北京航空航天大学',
    myRoleInTeam: '指导教师',
    schoolRank: 1,
    status: 'team_approved',
    invitedAt: '2025-10-08 10:00',
    teammatesSummary: ['秦昊天（队长）', '苏子墨（队员）', '林远航（指导教师视角演示）'],
    approvedSnapshot: {
      competitionTitle: '2025第四届“XX杯”全国网数智安全大赛 · 年度总决赛历史归档',
      teamName: '北航苍穹防线2025战队（指导教师视角示例）',
      teamLogo: 'default-logo',
      teamIntro: '展示指导教师受邀并完成双级终审通过的历史参赛记录。',
      subTrackName: '第四届网络安全攻防实战总决赛归档',
      university: '北京航空航天大学',
      captainName: '秦昊天',
      captainPhone: '13810086610',
      captainEmail: 'qinhaotian@buaa.edu.cn',
      schoolRank: 1,
      createdAt: '2025-10-08 10:00',
      approvedAt: '2025-10-12 18:00',
      members: [
        {
          name: '秦昊天',
          role: '队长',
          university: '北京航空航天大学',
          phone: '13810086610',
          email: 'qinhaotian@buaa.edu.cn',
          ctfRoles: ['Pwn手', '逆向手'],
        },
        {
          name: '苏子墨',
          role: '队员',
          university: '北京航空航天大学',
          phone: '13910087721',
          email: 'suzimo@buaa.edu.cn',
          ctfRoles: ['Web手', '密码学手'],
        },
        {
          name: '林远航',
          role: '指导教师',
          university: '北京航空航天大学',
          phone: '13810246921',
          email: 'linyuanhang@buaa.edu.cn',
        },
      ],
    },
  },
];

// 计算队伍成员确认进度：固定显示格式为“邀请X人，X人已同意，X人已拒绝”
export function computeTeamConfirmProgress(team: CaptainTeamRecord): {
  confirmedCount: number;
  totalCount: number;
  invitedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  label: string;
} {
  const allInvited = [...team.members, ...team.advisors];
  const invitedCount = allInvited.length;
  const acceptedCount = allInvited.filter((p) => p.confirmStatus === 'accepted').length;
  const rejectedCount = allInvited.filter((p) => p.confirmStatus === 'rejected').length;
  const confirmedCount = 1 + acceptedCount;
  const totalCount = 1 + invitedCount;
  return {
    confirmedCount,
    totalCount,
    invitedCount,
    acceptedCount,
    rejectedCount,
    label: `邀请${invitedCount}人，${acceptedCount}人已同意，${rejectedCount}人已拒绝`,
  };
}

export type RefinedRegistrationStatusKey =
  | 'draft'
  | 'inviting'
  | 'submitted'
  | 'school_rejected'
  | 'wait_school_match'
  | 'not_advanced'
  | 'pending_secretariat'
  | 'secretariat_rejected'
  | 'approved';

// 解析队伍的三段式审核状态（第一段：高校资格审核 -> 第二段：高校晋级提报 -> 第三段：秘书处终审）与前台【我的报名】状态
export function resolveTeamAuditStages(team: CaptainTeamRecord): {
  regStatusKey: RefinedRegistrationStatusKey;
  regStatusLabel: string;
  regColorClass: string;
  regStatusClass: string;
  regDotClass: string;
  schoolStatus: TwoStageAuditStatus;
  schoolBadgeLabel?: string;
  schoolRejectReason?: string;
  schoolReason?: string;
  schoolAuditedAt?: string;
  advancementStatus: AdvancementStageStatus;
  schoolRank?: number;
  advancementSubmittedAt?: string;
  secretariatStatus: TwoStageAuditStatus;
  secretariatBadgeLabel?: string;
  secretariatRejectReason?: string;
  secretariatReason?: string;
  secretariatAuditedAt?: string;
  isRejectedBySchool: boolean;
  isRejectedBySecretariat: boolean;
  canModifyTeam: boolean;
  canEditTeam: boolean;
  canDownloadReceipt: boolean;
  actionSummaryLabel: string;
} {
  if (team.status === 'draft') {
    return {
      regStatusKey: 'draft',
      regStatusLabel: '组建中',
      regColorClass: 'text-slate-600 font-bold',
      regStatusClass: 'text-slate-700 bg-slate-100 border-slate-200',
      regDotClass: 'bg-slate-400',
      schoolStatus: 'none',
      advancementStatus: 'none',
      secretariatStatus: 'none',
      isRejectedBySchool: false,
      isRejectedBySecretariat: false,
      canModifyTeam: true,
      canEditTeam: true,
      canDownloadReceipt: false,
      actionSummaryLabel: '继续编辑',
    };
  }

  if (team.status === 'inviting') {
    return {
      regStatusKey: 'inviting',
      regStatusLabel: '邀请中',
      regColorClass: 'text-[#0284C7] font-bold',
      regStatusClass: 'text-[#0284C7] bg-sky-50 border-sky-200',
      regDotClass: 'bg-[#0284C7] animate-pulse',
      schoolStatus: 'none',
      advancementStatus: 'none',
      secretariatStatus: 'none',
      isRejectedBySchool: false,
      isRejectedBySecretariat: false,
      canModifyTeam: true,
      canEditTeam: true,
      canDownloadReceipt: false,
      actionSummaryLabel: '修改队伍与成员',
    };
  }

  // 第一段：高校资格审核状态
  const schoolStatus: TwoStageAuditStatus =
    team.schoolAuditStatus && team.schoolAuditStatus !== 'none'
      ? team.schoolAuditStatus
      : team.status === 'approved'
      ? 'approved'
      : team.status === 'rejected'
      ? 'rejected'
      : 'pending';

  // 第二段：高校晋级提报状态
  const advancementStatus: AdvancementStageStatus =
    schoolStatus !== 'approved'
      ? 'none'
      : team.advancementStatus && team.advancementStatus !== 'none'
      ? team.advancementStatus
      : team.status === 'approved' || team.secretariatAuditStatus === 'approved'
      ? 'advanced'
      : team.secretariatAuditStatus === 'rejected'
      ? 'secretariat_rejected'
      : team.secretariatAuditStatus === 'pending'
      ? 'pending_secretariat'
      : 'wait_school_match';

  // 第三段：秘书处终审状态（仅当高校已提报晋级名单后才进入秘书处终审）
  const secretariatStatus: TwoStageAuditStatus =
    schoolStatus !== 'approved' ||
    advancementStatus === 'wait_school_match' ||
    advancementStatus === 'not_advanced'
      ? 'none'
      : advancementStatus === 'advanced' || team.secretariatAuditStatus === 'approved'
      ? 'approved'
      : advancementStatus === 'secretariat_rejected' ||
        team.secretariatAuditStatus === 'rejected'
      ? 'rejected'
      : 'pending';

  const normalizedUpdatedAt =
    team.updatedAt && team.updatedAt.length === 16 ? `${team.updatedAt}:00` : team.updatedAt;
  const normalizedApprovedAt =
    team.approvedSnapshot?.approvedAt && team.approvedSnapshot.approvedAt.length === 16
      ? `${team.approvedSnapshot.approvedAt}:00`
      : team.approvedSnapshot?.approvedAt;

  const schoolAuditedAt =
    schoolStatus === 'approved' || schoolStatus === 'rejected'
      ? team.schoolAuditedAt || normalizedUpdatedAt
      : undefined;

  const secretariatAuditedAt =
    secretariatStatus === 'approved' || secretariatStatus === 'rejected'
      ? team.secretariatAuditedAt || normalizedApprovedAt || normalizedUpdatedAt
      : undefined;

  const schoolRank = team.schoolRank || team.approvedSnapshot?.schoolRank;

  // 7. 秘书处终审通过 -> 报名成功
  if (schoolStatus === 'approved' && secretariatStatus === 'approved') {
    return {
      regStatusKey: 'approved',
      regStatusLabel: '报名成功',
      regColorClass: 'text-emerald-700 font-extrabold',
      regStatusClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      regDotClass: 'bg-emerald-500',
      schoolStatus: 'approved',
      schoolBadgeLabel: '已通过',
      schoolAuditedAt,
      advancementStatus: 'advanced',
      schoolRank: schoolRank || 1,
      advancementSubmittedAt: team.advancementSubmittedAt,
      secretariatStatus: 'approved',
      secretariatBadgeLabel: '终审通过',
      secretariatAuditedAt,
      isRejectedBySchool: false,
      isRejectedBySecretariat: false,
      canModifyTeam: false,
      canEditTeam: false,
      canDownloadReceipt: true,
      actionSummaryLabel: '可下载回执',
    };
  }

  // 2. 高校资格审核驳回 -> 已驳回（显示原因，队长可修改并重新提交）
  if (schoolStatus === 'rejected') {
    return {
      regStatusKey: 'school_rejected',
      regStatusLabel: '已驳回',
      regColorClass: 'text-red-600 font-bold',
      regStatusClass: 'text-red-700 bg-red-50 border-red-200',
      regDotClass: 'bg-red-500',
      schoolStatus: 'rejected',
      schoolBadgeLabel: '已驳回',
      schoolRejectReason: team.schoolRejectReason,
      schoolReason: team.schoolRejectReason,
      schoolAuditedAt,
      advancementStatus: 'none',
      secretariatStatus: 'none',
      isRejectedBySchool: true,
      isRejectedBySecretariat: false,
      canModifyTeam: true,
      canEditTeam: true,
      canDownloadReceipt: false,
      actionSummaryLabel: '修改并重新提交',
    };
  }

  // 1. 队长提交报名，等待高校资格审核 -> 已提交
  if (schoolStatus === 'pending') {
    return {
      regStatusKey: 'submitted',
      regStatusLabel: '已提交',
      regColorClass: 'text-amber-600 font-bold',
      regStatusClass: 'text-amber-700 bg-amber-50 border-amber-200',
      regDotClass: 'bg-amber-500 animate-pulse',
      schoolStatus: 'pending',
      schoolBadgeLabel: '待审核',
      advancementStatus: 'none',
      secretariatStatus: 'none',
      isRejectedBySchool: false,
      isRejectedBySecretariat: false,
      canModifyTeam: false,
      canEditTeam: false,
      canDownloadReceipt: false,
      actionSummaryLabel: '等待高校审核',
    };
  }

  // 3. 高校资格审核通过（提报晋级前） -> 高校已通过
  if (advancementStatus === 'wait_school_match') {
    return {
      regStatusKey: 'wait_school_match',
      regStatusLabel: '高校已通过',
      regColorClass: 'text-[#0284C7] font-bold',
      regStatusClass: 'text-[#0369A1] bg-sky-50 border-sky-200',
      regDotClass: 'bg-[#0284C7]',
      schoolStatus: 'approved',
      schoolBadgeLabel: '已通过',
      schoolAuditedAt,
      advancementStatus: 'wait_school_match',
      secretariatStatus: 'none',
      isRejectedBySchool: false,
      isRejectedBySecretariat: false,
      canModifyTeam: false,
      canEditTeam: false,
      canDownloadReceipt: false,
      actionSummaryLabel: '只能查看，不可修改',
    };
  }

  // 4. 高校提交晋级名单（队伍不在名单内） -> 未晋级
  if (advancementStatus === 'not_advanced') {
    return {
      regStatusKey: 'not_advanced',
      regStatusLabel: '未晋级',
      regColorClass: 'text-slate-500 font-bold',
      regStatusClass: 'text-slate-600 bg-slate-100 border-slate-300',
      regDotClass: 'bg-slate-400',
      schoolStatus: 'approved',
      schoolBadgeLabel: '已通过',
      schoolAuditedAt,
      advancementStatus: 'not_advanced',
      advancementSubmittedAt: team.advancementSubmittedAt,
      secretariatStatus: 'none',
      isRejectedBySchool: false,
      isRejectedBySecretariat: false,
      canModifyTeam: false,
      canEditTeam: false,
      canDownloadReceipt: false,
      actionSummaryLabel: '只能查看，流程结束',
    };
  }

  // 6. 秘书处终审驳回该校晋级名单 -> 待秘书处终审（名单被驳回），等待高校重报，队长不可修改
  if (advancementStatus === 'secretariat_rejected' || secretariatStatus === 'rejected') {
    return {
      regStatusKey: 'secretariat_rejected',
      regStatusLabel: '待秘书处终审（名单被驳回）',
      regColorClass: 'text-amber-700 font-bold',
      regStatusClass: 'text-amber-800 bg-amber-50 border-amber-300',
      regDotClass: 'bg-amber-500',
      schoolStatus: 'approved',
      schoolBadgeLabel: '已通过',
      schoolAuditedAt,
      advancementStatus: 'secretariat_rejected',
      schoolRank,
      advancementSubmittedAt: team.advancementSubmittedAt,
      secretariatStatus: 'rejected',
      secretariatBadgeLabel: '名单被驳回（待高校重报）',
      secretariatRejectReason: team.secretariatRejectReason,
      secretariatReason: team.secretariatRejectReason,
      secretariatAuditedAt,
      isRejectedBySchool: false,
      isRejectedBySecretariat: true,
      canModifyTeam: false, // 队长不可修改，由高校管理员重新提报晋级名单
      canEditTeam: false,
      canDownloadReceipt: false,
      actionSummaryLabel: '等待高校重新提报，队长不可修改',
    };
  }

  // 5. 高校提交晋级名单（队伍在名单内） -> 待秘书处终审
  return {
    regStatusKey: 'pending_secretariat',
    regStatusLabel: '待秘书处终审',
    regColorClass: 'text-indigo-700 font-bold',
    regStatusClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    regDotClass: 'bg-indigo-500 animate-pulse',
    schoolStatus: 'approved',
    schoolBadgeLabel: '已通过',
    schoolAuditedAt,
    advancementStatus: 'pending_secretariat',
    schoolRank,
    advancementSubmittedAt: team.advancementSubmittedAt,
    secretariatStatus: 'pending',
    secretariatBadgeLabel: '待终审',
    isRejectedBySchool: false,
    isRejectedBySecretariat: false,
    canModifyTeam: false,
    canEditTeam: false,
    canDownloadReceipt: false,
    actionSummaryLabel: '等待秘书处终审',
  };
}

// 报名状态显示元数据
export function getTeamStatusMeta(
  status: TeamLifecycleStatus,
  team?: CaptainTeamRecord
): {
  label: string;
  colorClass: string;
  dotClass: string;
} {
  if (team) {
    const resolved = resolveTeamAuditStages(team);
    return {
      label: resolved.regStatusLabel,
      colorClass: resolved.regColorClass,
      dotClass: resolved.regDotClass,
    };
  }
  switch (status) {
    case 'draft':
      return {
        label: '组建中',
        colorClass: 'text-slate-600 font-bold',
        dotClass: 'bg-slate-400',
      };
    case 'inviting':
      return {
        label: '邀请中',
        colorClass: 'text-[#0284C7] font-bold',
        dotClass: 'bg-[#0284C7] animate-pulse',
      };
    case 'pending_review':
      return {
        label: '已提交',
        colorClass: 'text-amber-600 font-bold',
        dotClass: 'bg-amber-500',
      };
    case 'rejected':
      return {
        label: '已驳回',
        colorClass: 'text-red-600 font-bold',
        dotClass: 'bg-red-500',
      };
    case 'approved':
      return {
        label: '报名成功',
        colorClass: 'text-emerald-700 font-bold',
        dotClass: 'bg-emerald-500',
      };
  }
}

// 隐私保护脱敏工具函数：手机号中间4位脱敏、邮箱前缀脱敏
export function maskPhone(phone?: string): string {
  if (!phone) return '未绑定';
  const trimmed = phone.trim();
  if (trimmed.includes('*')) return trimmed;
  if (trimmed.length === 11) {
    return `${trimmed.slice(0, 3)}****${trimmed.slice(7)}`;
  }
  if (trimmed.length > 5) {
    return `${trimmed.slice(0, 2)}****${trimmed.slice(-2)}`;
  }
  return '****';
}

export function maskEmail(email?: string): string {
  if (!email) return '未绑定';
  const trimmed = email.trim();
  if (trimmed.includes('*')) return trimmed;
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return '****';
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex);
  if (local.length <= 2) {
    return `${local.slice(0, 1)}***${domain}`;
  }
  return `${local.slice(0, 2)}***${local.slice(-1)}${domain}`;
}

// 通用队伍LOGO渲染组件（仅保留一个官方默认LOGO + 支持本地图片上传）
export const TEAM_LOGO_PRESETS = [
  { id: 'default-logo', label: '默认队徽', bg: 'from-[#0369A1] to-[#0284C7]' },
] as const;

export const TeamLogoAvatar: React.FC<{
  logo?: string;
  teamName?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ logo, teamName = '战队', size = 'md' }) => {
  const sizeClasses =
    size === 'sm'
      ? 'w-9 h-9 rounded-lg text-xs'
      : size === 'lg'
      ? 'w-16 h-16 rounded-2xl text-lg'
      : 'w-12 h-12 rounded-xl text-sm';

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  // 若用户上传了自定义图片（data:image/... 或 http）
  if (logo && (logo.startsWith('data:image') || logo.startsWith('http'))) {
    return (
      <img
        src={logo}
        alt={teamName}
        className={`${sizeClasses} object-cover border border-slate-200 shrink-0 bg-white`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} bg-gradient-to-br from-[#0369A1] to-[#0284C7] text-white font-extrabold flex items-center justify-center shadow-2xs shrink-0 select-none`}
      title={teamName}
    >
      <Shield className={iconSize} />
    </div>
  );
};

// ============================================================================
// 页面 1：报名表填写页（首次填写 & “组建中”继续编辑）
// ============================================================================
interface TeamRegistrationFormPageProps {
  competition: CompetitionCatalogItem;
  registrationConfig?: EventRegistrationConfig;
  initialSubTrackName?: string;
  editingDraftTeam?: CaptainTeamRecord | null;
  existingTeam?: CaptainTeamRecord | null;
  currentUser: UserProfileData;
  platformUsers?: PlatformDirectoryUser[];
  onCancel?: () => void;
  onBack?: () => void;
  onSaveDraft: (draftTeam: CaptainTeamRecord) => void;
  onSendInvitations: (invitingTeam: CaptainTeamRecord) => void;
}

export const TeamRegistrationFormPage: React.FC<TeamRegistrationFormPageProps> = ({
  competition,
  registrationConfig,
  initialSubTrackName,
  editingDraftTeam: propEditingDraftTeam,
  existingTeam,
  currentUser,
  platformUsers = PLATFORM_DIRECTORY_USERS,
  onCancel,
  onBack,
  onSaveDraft,
  onSendInvitations,
}) => {
  const activePlatformUsers = useMemo(
    () =>
      (platformUsers.length > 0 ? platformUsers : PLATFORM_DIRECTORY_USERS).filter(
        (u) => !u.isDeleted && getEffectiveUserStatus(u) === '正常'
      ),
    [platformUsers]
  );
  const editingDraftTeam = propEditingDraftTeam ?? existingTeam ?? null;
  const includeAdvisor = registrationConfig?.includeAdvisor ?? true;
  const minAdvisors = registrationConfig?.minAdvisors ?? 0;
  const maxAdvisors = registrationConfig?.maxAdvisors ?? 2;
  const minTeamSize = registrationConfig?.minTeamSize ?? 2;
  const maxTeamSize = registrationConfig?.maxTeamSize ?? 4;
  const handleBackOrCancel = () => {
    if (onCancel) onCancel();
    else if (onBack) onBack();
  };
  const captainSchool =
    currentUser.academicStatus === 'verified' && currentUser.university
      ? currentUser.university
      : currentUser.university || '北京航空航天大学';
  const captainEducation = currentUser.educationLevel || '本科';
  const captainMajor = currentUser.majorOrDept || '网络空间安全';
  const captainEnrollRange = `${currentUser.enrollmentDate || '2024-09'} 至 ${
    currentUser.graduationDate || '2028-06'
  }`;

  const trackOptions =
    competition.tracks.length > 0
      ? competition.tracks.map((t) => t.name)
      : ['综合主赛道'];

  const [teamName, setTeamName] = useState(editingDraftTeam?.teamName || '');
  const [teamLogo, setTeamLogo] = useState<string>(
    editingDraftTeam?.teamLogo &&
      (editingDraftTeam.teamLogo.startsWith('data:image') ||
        editingDraftTeam.teamLogo.startsWith('http'))
      ? editingDraftTeam.teamLogo
      : 'default-logo'
  );
  const [teamIntro, setTeamIntro] = useState<string>(
    editingDraftTeam?.teamIntro || ''
  );
  const [selectedTrack] = useState(
    editingDraftTeam?.subTrackName || initialSubTrackName || trackOptions[0] || '默认参赛组'
  );
  const [members, setMembers] = useState<InvitedTeamPerson[]>(
    editingDraftTeam?.members || []
  );
  const [advisors, setAdvisors] = useState<InvitedTeamPerson[]>(
    editingDraftTeam?.advisors || []
  );
  // 队长给自己分配的 CTF 角色标签（完全选填，队长和队员均可不选）
  const [captainCtfRoles, setCaptainCtfRoles] = useState<CtfRoleType[]>(
    editingDraftTeam?.captainCtfRoles || []
  );
  // 队长在参赛队员（含队长本人）中的排序索引（0代表第1顺位，默认0）
  const [captainOrderIndex, setCaptainOrderIndex] = useState<number>(
    editingDraftTeam?.captainOrderIndex ?? 0
  );
  // 当前打开“设置角色”下拉多选框的成员 ID（或 'captain'）
  const [openRolePopoverId, setOpenRolePopoverId] = useState<string | null>(null);
  // 角色分配单一防呆弱提示弹窗
  const [singleRoleFormWarnModal, setSingleRoleFormWarnModal] = useState<CtfRoleType | null>(
    null
  );

  // 处理本地上传队伍 LOGO 图片
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('请上传 PNG、JPG、SVG 或 WebP 格式的图片文件');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError('队伍 LOGO 图片大小不能超过 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTeamLogo(reader.result);
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // 查询添加队员 / 指导教师输入框状态
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchFeedback, setMemberSearchFeedback] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  const [advisorSearchQuery, setAdvisorSearchQuery] = useState('');
  const [advisorSearchFeedback, setAdvisorSearchFeedback] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  // 查询并添加队员（联动后台报名管理配置：队伍人数上限，固定不允许跨校组队）
  const handleQueryAndAddMember = (presetQuery?: string) => {
    setMemberSearchFeedback(null);
    const q = (presetQuery !== undefined ? presetQuery : memberSearchQuery).trim();
    if (!q) {
      setMemberSearchFeedback({ type: 'error', text: '请输入要邀请队员的手机号或邮箱' });
      return;
    }

    if (
      q === (currentUser.phone || '') ||
      q.toLowerCase() === (currentUser.email || '').toLowerCase()
    ) {
      setMemberSearchFeedback({
        type: 'error',
        text: '您已是本队队长，无需重复添加自己为队员。',
      });
      return;
    }

    if (1 + members.length >= maxTeamSize) {
      setMemberSearchFeedback({
        type: 'error',
        text: `人数超限拦截：本赛事配置队伍人数上限为 ${maxTeamSize} 人（含队长本人），当前已达上限，无法继续添加队员。`,
      });
      return;
    }

    const found = activePlatformUsers.find(
      (u) => u.phone === q || u.email.toLowerCase() === q.toLowerCase()
    );

    if (!found) {
      setMemberSearchFeedback({
        type: 'error',
        text: `未查询到正常状态的账号「${q}」：该用户尚未注册或账号已停用。`,
      });
      return;
    }

    if (found.identityType !== 'student') {
      setMemberSearchFeedback({
        type: 'error',
        text: `「${found.name}」认证身份为指导教师，请在下方【指导教师】区域添加。`,
      });
      return;
    }

    if (found.university !== captainSchool) {
      setMemberSearchFeedback({
        type: 'error',
        text: `同校校验拦截：平台不允许跨校组队，仅限邀请与队长同一所属院校（${captainSchool}）的认证学生，「${found.name}（${found.university}）」无法添加。`,
      });
      return;
    }

    if (members.some((m) => m.phone === found.phone)) {
      setMemberSearchFeedback({
        type: 'error',
        text: `队员「${found.name}」已在当前拟邀请名单中，请勿重复添加。`,
      });
      return;
    }

    const newPerson: InvitedTeamPerson = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: found.name,
      phone: found.phone,
      email: found.email,
      university: found.university,
      role: 'member',
      ctfRoles: [],
      isVerified: found.isRealNameVerified && found.isAcademicOrTeacherVerified,
      confirmStatus: 'draft',
    };

    setMembers((prev) => [...prev, newPerson]);
    setMemberSearchQuery('');
    setMemberSearchFeedback({
      type: 'success',
      text: `已将队员「${found.name}（${found.university}）」加入拟邀请名单，队内角色（Web手/Pwn手等）为选填项，可按需在卡片右侧分配或不选。`,
    });
  };

  // 查询并添加指导教师（要求已教师认证 + 同校校验 + 校验教师人数上限）
  const handleQueryAndAddAdvisor = (presetQuery?: string) => {
    setAdvisorSearchFeedback(null);
    const q = (presetQuery !== undefined ? presetQuery : advisorSearchQuery).trim();
    if (!q) {
      setAdvisorSearchFeedback({ type: 'error', text: '请输入要邀请指导教师的手机号或邮箱' });
      return;
    }

    if (!includeAdvisor) {
      setAdvisorSearchFeedback({
        type: 'error',
        text: '本赛事报名配置未开启指导教师模块。',
      });
      return;
    }

    if (advisors.length >= maxAdvisors) {
      setAdvisorSearchFeedback({
        type: 'error',
        text: `人数超限拦截：本赛事配置指导教师人数上限为 ${maxAdvisors} 人，当前已达上限。`,
      });
      return;
    }

    const found = activePlatformUsers.find(
      (u) => u.phone === q || u.email.toLowerCase() === q.toLowerCase()
    );

    if (!found) {
      setAdvisorSearchFeedback({
        type: 'error',
        text: `未查询到正常状态的账号「${q}」：该用户尚未注册或账号已停用。`,
      });
      return;
    }

    if (found.identityType !== 'teacher') {
      setAdvisorSearchFeedback({
        type: 'error',
        text: `「${found.name}」不是教师身份账号，无法作为指导教师添加。`,
      });
      return;
    }

    if (!found.isAcademicOrTeacherVerified) {
      setAdvisorSearchFeedback({
        type: 'error',
        text: `校验拦截：「${found.name}」尚未完成【指导教师认证】，系统要求指导教师必须已完成教师认证方可被邀请。`,
      });
      return;
    }

    if (found.university !== captainSchool) {
      setAdvisorSearchFeedback({
        type: 'error',
        text: `同校校验拦截：平台不允许跨校指导，仅限邀请与队长同一所属院校（${captainSchool}）的认证教师，「${found.name}（${found.university}）」无法添加。`,
      });
      return;
    }

    if (advisors.some((a) => a.phone === found.phone)) {
      setAdvisorSearchFeedback({
        type: 'error',
        text: `指导教师「${found.name}」已在当前拟邀请名单中。`,
      });
      return;
    }

    const newAdvisor: InvitedTeamPerson = {
      id: `adv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: found.name,
      phone: found.phone,
      email: found.email,
      university: found.university,
      role: 'advisor',
      isVerified: true,
      confirmStatus: 'draft',
    };

    setAdvisors((prev) => [...prev, newAdvisor]);
    setAdvisorSearchQuery('');
    setAdvisorSearchFeedback({
      type: 'success',
      text: `已将指导教师「${found.name}（${found.university}）」加入拟邀请名单（尚未发送通知）。`,
    });
  };

  const buildTeamRecord = (targetStatus: 'draft' | 'inviting'): CaptainTeamRecord => {
    const nowStr = '2026-10-28 10:45';
    const mappedMembers: InvitedTeamPerson[] = members.map((m) => ({
      ...m,
      confirmStatus:
        targetStatus === 'inviting'
          ? m.confirmStatus === 'accepted' || m.confirmStatus === 'rejected'
            ? m.confirmStatus
            : 'pending'
          : 'draft',
    }));
    const mappedAdvisors: InvitedTeamPerson[] = advisors.map((a) => ({
      ...a,
      confirmStatus:
        targetStatus === 'inviting'
          ? a.confirmStatus === 'accepted' || a.confirmStatus === 'rejected'
            ? a.confirmStatus
            : 'pending'
          : 'draft',
    }));

    return {
      id: editingDraftTeam?.id || `cap-team-${Date.now()}`,
      competitionId: competition.id,
      competitionTitle: competition.title,
      subTrackName: selectedTrack,
      teamName: teamName.trim() || '未命名战队',
      teamLogo: teamLogo || 'default-logo',
      teamIntro: teamIntro.trim() || '专注网络与数据安全攻防技术研究。',
      university: captainSchool,
      captainName: currentUser.name || currentUser.username,
      captainPhone: currentUser.phone,
      captainEmail: currentUser.email,
      captainUniversity: captainSchool,
      captainVerified: currentUser.isVerified,
      captainCtfRoles,
      captainOrderIndex: Math.max(
        0,
        Math.min(mappedMembers.length, captainOrderIndex)
      ),
      status: targetStatus,
      schoolAuditStatus: 'none',
      secretariatAuditStatus: 'none',
      members: mappedMembers,
      advisors: mappedAdvisors,
      createdAt: editingDraftTeam?.createdAt || nowStr,
      updatedAt: nowStr,
    };
  };

  // 点击【暂存】
  const handleSaveDraftClick = () => {
    setFormError(null);
    const record = buildTeamRecord('draft');
    onSaveDraft(record);
  };

  // 点击【发出邀请 / 保存并邀请】
  const handleSendInviteClick = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!teamName.trim()) {
      setFormError('请填写队伍名称（最多20个字符）');
      return;
    }
    if (teamName.trim().length > 20) {
      setFormError('队伍名称不能超过20个字符');
      return;
    }
    if (!teamIntro.trim()) {
      setFormError('请填写简短的队伍介绍（100字以内）');
      return;
    }
    const activeMembers = maxTeamSize === 1 ? [] : members;
    const totalPersonCount = 1 + activeMembers.length;
    if (totalPersonCount < minTeamSize) {
      setFormError(
        `本赛事要求队伍最少 ${minTeamSize} 人（含队长），当前共 ${totalPersonCount} 人，请继续添加至少 ${
          minTeamSize - totalPersonCount
        } 名团队成员（若暂未确定队员，可先点击左下方【暂存】）`
      );
      return;
    }
    if (totalPersonCount > maxTeamSize) {
      setFormError(
        `本赛事要求队伍最多 ${maxTeamSize} 人（含队长），当前共 ${totalPersonCount} 人，请移除多余成员`
      );
      return;
    }
    if (includeAdvisor && minAdvisors > 0 && advisors.length < minAdvisors) {
      setFormError(
        `本赛事要求队伍最少邀请 ${minAdvisors} 名指导教师，当前已添加 ${advisors.length} 名，请继续添加指导教师`
      );
      return;
    }

    // 防呆弱提示：如果队伍满员（或已添加队员）且6个角色只覆盖了1个角色
    if (activeMembers.length > 0) {
      const warnCheck = checkSingleCtfRoleWarning(
        captainCtfRoles,
        activeMembers.map((m) => m.ctfRoles)
      );
      if (warnCheck.isSingleRole && warnCheck.roleName) {
        setSingleRoleFormWarnModal(warnCheck.roleName);
        return;
      }
    }

    const record = buildTeamRecord('inviting');
    onSendInvitations(record);
  };

  const isCustomUploadedLogo =
    teamLogo.startsWith('data:image') || teamLogo.startsWith('http');

  return (
    <main className="max-w-6xl xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full">
      {/* 顶部返回导航 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBackOrCancel}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0284C7] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回上一页</span>
        </button>
        <span className="text-xs text-slate-400">
          {editingDraftTeam ? '编辑队伍报名信息' : '首次填写赛事报名表'}
        </span>
      </div>

      <form
        onSubmit={handleSendInviteClick}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
      >
        {/* 页面标题 Banner */}
        <div className="px-6 sm:px-8 py-5 bg-gradient-to-r from-[#072A47] via-[#0369A1] to-[#0284C7] text-white">
          <div className="text-xs text-sky-200 font-medium mb-1">
            “XX杯”全国网数智安全大赛 · 队长建队与成员邀请
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
            赛事报名表填写
          </h1>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {formError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm font-semibold text-red-700 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 第一部分：赛事信息 & 队伍信息 */}
          <section className="space-y-5">
            <h2 className="text-base font-bold text-slate-900 pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0284C7]" />
              <span>一、赛事与队伍基本信息</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 赛事名称 */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  赛事名称
                </label>
                <input
                  type="text"
                  readOnly
                  value={competition.title}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>

              {/* 所属院校 */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  所属院校
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={captainSchool}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 队长学历层次 */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  学历层次
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={captainEducation}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 队长专业及就读周期 */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  就读专业 / 入学-毕业时间
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={`${captainMajor}（${captainEnrollRange}）`}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 队伍名称（输入框，20字） */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    队伍名称 <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono-num text-slate-400">
                    {teamName.length}/20 字
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={20}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="请输入队伍名称（20字以内）"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>
            </div>

            {/* 队伍 LOGO 上传（仅保留一个默认LOGO + 本地上传） + 简短队伍介绍 */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-2">
              {/* 左侧：上传队伍 LOGO（占 5 列） */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  队伍 LOGO <span className="text-red-500">*</span>
                </label>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-4 h-[106px]">
                  <TeamLogoAvatar
                    logo={teamLogo}
                    teamName={teamName || '战队'}
                    size="lg"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer transition-colors">
                        <span>上传本地LOGO</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>
                      {isCustomUploadedLogo ? (
                        <button
                          type="button"
                          onClick={() => setTeamLogo('default-logo')}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                        >
                          恢复默认LOGO
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500">
                          当前使用系统默认LOGO
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      支持 PNG / JPG / SVG，建议尺寸 200×200px，不超过 2MB
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：简短的队伍介绍（占 7 列） */}
              <div className="sm:col-span-7 flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    队伍介绍（简短介绍） <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono-num text-slate-400">
                    {teamIntro.length}/100 字
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={100}
                  value={teamIntro}
                  onChange={(e) => setTeamIntro(e.target.value)}
                  placeholder="请填写一段简短的队伍介绍（如战队攻防研究方向、团队优势或参赛口号，100字以内）..."
                  className="w-full flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none leading-relaxed resize-none"
                />
              </div>
            </div>
          </section>

          {/* 第二部分：成员管理（核心，受后台【报名管理】配置联动控制） */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0284C7]" />
                <span>二、成员管理（队长、团队成员、指导教师）</span>
              </h2>
              <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/80">
                注意：此时添加的成员仅代表拟邀请名单，点击底部【保存并发出邀请】后才会正式发送通知
              </span>
            </div>

            {/* 赛事报名配置规则提示条 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  队伍人数限制：
                  <strong className="font-mono-num text-slate-900">
                    {minTeamSize} ~ {maxTeamSize} 人（含队长）
                  </strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  所属院校要求：
                  <strong className="text-[#0369A1]">
                    仅限本校（{captainSchool}）师生组队
                  </strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  指导教师：
                  <strong className="text-slate-900">
                    {includeAdvisor
                      ? minAdvisors > 0
                        ? `需邀请 ${minAdvisors} ~ ${maxAdvisors} 人`
                        : `可邀请（上限 ${maxAdvisors} 人）`
                      : '本赛事无需指导教师'}
                  </strong>
                </span>
              </div>
            </div>

            {/* 证书打印顺序醒目提醒横幅 */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-900">
              <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">获奖证书打印顺序提醒：</span>
                队长可自由调整<strong>包括队长本人在内的所有参赛队员</strong>的先后排序（点击队员卡片右侧的【上移】/【下移】按钮），
                <strong className="text-amber-800 underline underline-offset-2">
                  当前的报名人员顺序即为最终获奖证书上的姓名打印顺序
                </strong>
                。
              </div>
            </div>

            {/* 1. 参赛队员名单与排序（含队长本人 + 团队成员，支持统一上下移动调整顺位） */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-700">
                  1. 参赛队员名单与证书打印顺位（含队长共 {1 + (maxTeamSize === 1 ? 0 : members.length)}/
                  {maxTeamSize} 人，最少需 {minTeamSize} 人）
                </div>
                <span className="text-[11px] text-slate-500">
                  点击右侧【上移 / 下移】可调整包含队长在内的所有队员顺位 · 队内角色为选填项
                </span>
              </div>

              {(() => {
                const activeMemberList = maxTeamSize === 1 ? [] : members;
                const combinedContestants = insertCaptainAtOrderIndex(
                  { kind: 'captain' as const },
                  activeMemberList.map((m) => ({ kind: 'member' as const, person: m })),
                  captainOrderIndex
                );
                const totalContestants = combinedContestants.length;

                const handleMoveFormContestant = (fromIdx: number, dir: -1 | 1) => {
                  const { nextMembers, nextCaptainOrderIndex } =
                    reorderContestantsWithCaptain(
                      activeMemberList,
                      captainOrderIndex,
                      fromIdx,
                      dir
                    );
                  setMembers(nextMembers);
                  setCaptainOrderIndex(nextCaptainOrderIndex);
                };

                return (
                  <div className="space-y-2.5">
                    {combinedContestants.map((entry, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === totalContestants - 1;

                      if (entry.kind === 'captain') {
                        return (
                          <div
                            key="captain-row"
                            className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                                <span className="px-2 py-0.5 rounded-md bg-[#0284C7] text-white text-[11px] font-mono-num font-bold">
                                  第 {idx + 1} 顺位
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-sky-100 text-[#0369A1] text-[10px] font-bold">
                                  队长
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2">
                                  <span>{currentUser.name || currentUser.username}</span>
                                  <span className="px-2 py-0.5 rounded bg-[#0284C7]/10 text-[#0369A1] text-[11px] font-bold">
                                    队长本人
                                  </span>
                                  <span className="text-xs font-normal text-slate-500">·</span>
                                  <span className="text-xs font-semibold text-[#0369A1]">
                                    {captainSchool}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-white text-[#0284C7] border border-sky-200 text-[11px] font-bold">
                                    {captainEducation}
                                  </span>
                                  <span className="text-xs text-slate-600 font-semibold">
                                    {captainMajor}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-slate-500 font-semibold">
                                    队内角色：
                                  </span>
                                  <CtfRoleBadges roles={captainCtfRoles} emptyText="待分配" />
                                </div>
                                <div className="text-xs text-slate-500 font-mono-num">
                                  手机：{maskPhone(currentUser.phone || '13810246921')} | 邮箱：
                                  {maskEmail(currentUser.email || 'linyuanhang@buaa.edu.cn')} | 学籍周期：
                                  {captainEnrollRange}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center shrink-0">
                              {totalContestants > 1 && (
                                <div className="inline-flex items-center gap-1 mr-1 pr-2 border-r border-sky-200">
                                  <button
                                    type="button"
                                    disabled={isFirst}
                                    onClick={() => handleMoveFormContestant(idx, -1)}
                                    title="上移顺位（调整获奖证书打印顺序）"
                                    className={`px-2 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                                      isFirst
                                        ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'border-sky-200 bg-white hover:bg-sky-100 text-[#0284C7] cursor-pointer'
                                    }`}
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                    <span>上移</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isLast}
                                    onClick={() => handleMoveFormContestant(idx, 1)}
                                    title="下移顺位（调整获奖证书打印顺序）"
                                    className={`px-2 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                                      isLast
                                        ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'border-sky-200 bg-white hover:bg-sky-100 text-[#0284C7] cursor-pointer'
                                    }`}
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                    <span>下移</span>
                                  </button>
                                </div>
                              )}
                              <CtfRoleSelectorDropdown
                                selectedRoles={captainCtfRoles}
                                onChange={(nextRoles) => setCaptainCtfRoles(nextRoles)}
                                isOpen={openRolePopoverId === 'captain'}
                                onToggleOpen={() =>
                                  setOpenRolePopoverId((prev) =>
                                    prev === 'captain' ? null : 'captain'
                                  )
                                }
                                onClose={() => setOpenRolePopoverId(null)}
                                triggerLabel="设置角色"
                              />
                              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>已实名 · 已学生认证</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const m = entry.person;
                      return (
                        <div
                          key={m.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px] font-mono-num font-bold">
                                第 {idx + 1} 顺位
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                                队员
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <span>{m.name}</span>
                                <span className="text-xs text-slate-400">·</span>
                                <span className="text-xs font-semibold text-slate-700">
                                  {m.university}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500 font-semibold">
                                  队内角色：
                                </span>
                                <CtfRoleBadges roles={m.ctfRoles} emptyText="待分配" />
                              </div>
                              <div className="text-xs text-slate-500 font-mono-num">
                                手机：{maskPhone(m.phone)} | 邮箱：{maskEmail(m.email)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
                            {totalContestants > 1 && (
                              <div className="inline-flex items-center gap-1 mr-1 pr-2 border-r border-slate-200">
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => handleMoveFormContestant(idx, -1)}
                                  title="上移顺位（调整获奖证书打印顺序）"
                                  className={`px-2 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                                    isFirst
                                      ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                                      : 'border-slate-300 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#0284C7] cursor-pointer'
                                  }`}
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                  <span>上移</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => handleMoveFormContestant(idx, 1)}
                                  title="下移顺位（调整获奖证书打印顺序）"
                                  className={`px-2 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                                    isLast
                                      ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                                      : 'border-slate-300 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#0284C7] cursor-pointer'
                                  }`}
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                  <span>下移</span>
                                </button>
                              </div>
                            )}
                            <CtfRoleSelectorDropdown
                              selectedRoles={m.ctfRoles || []}
                              onChange={(nextRoles) =>
                                setMembers((prev) =>
                                  prev.map((item) =>
                                    item.id === m.id ? { ...item, ctfRoles: nextRoles } : item
                                  )
                                )
                              }
                              isOpen={openRolePopoverId === m.id}
                              onToggleOpen={() =>
                                setOpenRolePopoverId((prev) => (prev === m.id ? null : m.id))
                              }
                              onClose={() => setOpenRolePopoverId(null)}
                              triggerLabel="设置角色"
                            />
                            <span className="text-xs text-slate-500">拟邀请（待发通知）</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (openRolePopoverId === m.id) setOpenRolePopoverId(null);
                                const { nextMembers, nextCaptainOrderIndex } =
                                  removeMemberAdjustingCaptainOrder(
                                    members,
                                    captainOrderIndex,
                                    m.id
                                  );
                                setMembers(nextMembers);
                                setCaptainOrderIndex(nextCaptainOrderIndex);
                              }}
                              className="text-xs font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>移除</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* 若最多人数限制 > 1，展示【 + 邀请队员】查询框 */}
              {maxTeamSize > 1 ? (
                <div className="p-4 rounded-xl border border-dashed border-sky-300 bg-sky-50/30 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-[#0284C7]" />
                    <span>
                      【 + 邀请队员】输入手机号或邮箱查询并添加（仅限{captainSchool}本校学生）
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQueryAndAddMember();
                          }
                        }}
                        placeholder="请输入队员已注册的手机号或邮箱（查不到将提示“未注册”）"
                        className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQueryAndAddMember()}
                      className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
                    >
                      + 查询并添加队员
                    </button>
                  </div>

                  {/* 快捷测试账号点击即填 */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>快捷测试查询：</span>
                    {activePlatformUsers
                      .filter(
                        (u) =>
                          u.identityType === 'student' &&
                          u.university === captainSchool &&
                          u.phone !== currentUser.phone &&
                          u.username !== currentUser.username
                      )
                      .map((stu) => (
                      <button
                        key={stu.id}
                        type="button"
                        onClick={() => handleQueryAndAddMember(stu.phone)}
                        className="px-2.5 py-1 rounded bg-white hover:bg-sky-50 text-[#0369A1] border border-sky-200 font-mono-num cursor-pointer"
                      >
                        + {stu.name} ({stu.university})
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleQueryAndAddMember('13999998888')}
                      className="px-2.5 py-1 rounded bg-white hover:bg-red-50 text-red-600 border border-red-200 font-mono-num cursor-pointer"
                    >
                      测未注册号 (13999998888)
                    </button>
                  </div>

                  {memberSearchFeedback && (
                    <div
                      className={`p-2.5 rounded-lg text-xs font-medium ${
                        memberSearchFeedback.type === 'error'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {memberSearchFeedback.text}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0284C7] shrink-0" />
                  <span>
                    本赛事报名配置队伍人数上限为 <strong>1 人（单人赛制）</strong>，已自动隐藏“邀请队员”模块，您可直接作为单人战队提交报名。
                  </span>
                </div>
              )}
            </div>

            {/* 2. 指导教师（当后台配置开启“包含指导教师”时展示；不参与排序） */}
            {includeAdvisor && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700">
                  2. 指导教师（已添加 {advisors.length}/{maxAdvisors} 人，要求已完成本校教师认证）
                </div>

                {advisors.length > 0 && (
                  <div className="space-y-2">
                    {advisors.map((adv) => (
                      <div
                        key={adv.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-[#0369A1] text-xs font-bold shrink-0">
                            指导教师
                          </span>
                          <div>
                            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <span>{adv.name}</span>
                              <span className="text-xs text-slate-400">·</span>
                              <span className="text-xs font-semibold text-slate-700">
                                {adv.university}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-mono-num mt-0.5">
                              手机：{maskPhone(adv.phone)} | 邮箱：{maskEmail(adv.email)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className="text-xs text-emerald-700 font-semibold">已教师认证</span>
                          <button
                            type="button"
                            onClick={() =>
                              setAdvisors((prev) => prev.filter((item) => item.id !== adv.id))
                            }
                            className="text-xs font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>移除</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 【 + 邀请指导教师】查询框 */}
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#0284C7]" />
                    <span>
                      【 + 邀请指导教师】输入手机号或邮箱查询（仅限{captainSchool}已认证教师，上限 {maxAdvisors} 人）
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={advisorSearchQuery}
                        onChange={(e) => setAdvisorSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQueryAndAddAdvisor();
                          }
                        }}
                        placeholder="请输入指导教师手机号或邮箱..."
                        className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQueryAndAddAdvisor()}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
                    >
                      + 查询并添加指导教师
                    </button>
                  </div>

                  {/* 快捷测试教师点击即填 */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>快捷测试查询：</span>
                    {activePlatformUsers
                      .filter(
                        (u) => u.identityType === 'teacher' && u.university === captainSchool
                      )
                      .map((tea) => (
                      <button
                        key={tea.id}
                        type="button"
                        onClick={() => handleQueryAndAddAdvisor(tea.phone)}
                        className="px-2.5 py-1 rounded bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 font-mono-num cursor-pointer"
                      >
                        + {tea.name} ({tea.university})
                      </button>
                    ))}
                  </div>

                  {advisorSearchFeedback && (
                    <div
                      className={`p-2.5 rounded-lg text-xs font-medium ${
                        advisorSearchFeedback.type === 'error'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {advisorSearchFeedback.text}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* 底部按钮栏：【暂存】 与 【保存并发出邀请】 */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              点击【暂存】状态变为“组建中”（不发通知）；点击【保存并发出邀请】将向名单成员发送站内信/短信，状态变为“邀请中”。
            </div>

            <div className="flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleSaveDraftClick}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>暂存</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>保存并发出邀请</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 防呆弱提示弹窗：角色分配较单一 */}
      {singleRoleFormWarnModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-amber-300 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-amber-500 text-white font-bold text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>队伍角色配置防呆提示</span>
              </div>
              <button
                type="button"
                onClick={() => setSingleRoleFormWarnModal(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-bold leading-relaxed">
                当前队伍角色分配较单一（全是{singleRoleFormWarnModal}），请确认是否符合参赛策略？
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                提示：CTF 赛制支持策略性单兵或多角色分工，系统不做强拦截。若确认无误，点击下方【确认提交】即可直接放行。
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSingleRoleFormWarnModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  返回调整角色
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSingleRoleFormWarnModal(null);
                    const record = buildTeamRecord('inviting');
                    onSendInvitations(record);
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  确认提交
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

// ============================================================================
// 审核状态徽标（带已驳回悬浮原因小图标）
// ============================================================================
export const AuditStageBadgeWithTooltip: React.FC<{
  status: TwoStageAuditStatus;
  customLabel?: string;
  rejectReason?: string;
  stageLabel?: '高校审核' | '秘书处审核';
  stage?: 'school' | 'secretariat';
  hideRejectReason?: boolean;
}> = ({ status, customLabel, rejectReason, stageLabel, stage, hideRejectReason }) => {
  const displayStageLabel =
    stageLabel || (stage === 'secretariat' ? '秘书处审核' : '高校审核');
  if (status === 'none') {
    return <span className="text-xs font-mono-num text-slate-400">—</span>;
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>{customLabel || '待审核'}</span>
      </span>
    );
  }
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>{customLabel || '已通过'}</span>
      </span>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200/80 text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        <span>{customLabel || '已驳回'}</span>
      </span>
      {!hideRejectReason && (
        <div className="relative group inline-flex items-center">
          <span
            className="w-4 h-4 rounded-full bg-red-100 hover:bg-red-200 text-red-600 inline-flex items-center justify-center cursor-help transition-colors"
            title={rejectReason || `${displayStageLabel}未通过，请点击查看详情`}
          >
            <AlertTriangle className="w-3 h-3" />
          </span>
          {/* 悬浮气泡 Tooltip */}
          <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2.5 rounded-xl bg-slate-900 text-white text-[11px] leading-relaxed shadow-xl">
            <div className="font-bold text-red-300 mb-0.5">{displayStageLabel}驳回说明：</div>
            <div className="text-slate-100 break-words whitespace-normal">
              {rejectReason || '信息填写不完整或不符合赛事规定，请核实后处理。'}
            </div>
            <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 页面 2 + 页面 3 + 页面 4：个人中心【我的报名】完整闭环模块
// - Tab 1: 我发起的（队长视角：列表 + 页面3【队伍详情/管理页】）
// - Tab 2: 我参与的（队员/老师视角：列表 + 页面4【受邀详情与同意/拒绝前置校验】）
// ============================================================================
interface MyRegistrationsClosedLoopModuleProps {
  currentUser: UserProfileData;
  captainTeams: CaptainTeamRecord[];
  onUpdateCaptainTeams: (next: CaptainTeamRecord[]) => void;
  participatedTeams: ParticipatedTeamRecord[];
  onUpdateParticipatedTeams: (next: ParticipatedTeamRecord[]) => void;
  platformUsers?: PlatformDirectoryUser[];
  competitions?: CompetitionCatalogItem[];
  registrationConfigs?: EventRegistrationConfig[];
  onContinueEditDraft: (team: CaptainTeamRecord) => void;
  onJumpToCertification: () => void;
}

export const MyRegistrationsClosedLoopModule: React.FC<MyRegistrationsClosedLoopModuleProps> = ({
  currentUser,
  captainTeams,
  onUpdateCaptainTeams,
  participatedTeams,
  onUpdateParticipatedTeams,
  platformUsers = PLATFORM_DIRECTORY_USERS,
  competitions = [],
  registrationConfigs = [],
  onContinueEditDraft,
  onJumpToCertification,
}) => {
  const activePlatformUsers = useMemo(
    () =>
      (platformUsers.length > 0 ? platformUsers : PLATFORM_DIRECTORY_USERS).filter(
        (u) => !u.isDeleted && getEffectiveUserStatus(u) === '正常'
      ),
    [platformUsers]
  );

  // 顶层视角切换：'initiated' (我发起的 - 队长) | 'participated' (我参与的 - 队员/老师)
  const [roleViewTab, setRoleViewTab] = useState<'initiated' | 'participated'>('initiated');

  // 页面3：队长当前打开的【队伍详情/管理页】ID
  const [managingTeamId, setManagingTeamId] = useState<string | null>(null);
  // 页面4：队员/老师当前打开的【受邀队伍详情页】ID
  const [viewingParticipatedId, setViewingParticipatedId] = useState<string | null>(null);

  // 队长管理页内部状态（移除已同意成员警告弹窗、添加新成员输入框、高校/秘书处驳回输入等）
  const [removeAcceptedConfirmModal, setRemoveAcceptedConfirmModal] = useState<{
    teamId: string;
    person: InvitedTeamPerson;
  } | null>(null);
  const [schoolRejectModalOpen, setSchoolRejectModalOpen] = useState<string | null>(null);
  const [schoolRejectReasonInput, setSchoolRejectReasonInput] = useState(
    '经本校竞赛管理员核查：指导教师或团队成员信息需进一步补充核实，请调整后重新提交高校审核。'
  );
  const [secretariatRejectModalOpen, setSecretariatRejectModalOpen] = useState<string | null>(null);
  const [secretariatRejectReasonInput, setSecretariatRejectReasonInput] = useState(
    '经大赛秘书处复核：队伍介绍过于简略，请补充核心研究方向与参赛赛道技术方案摘要后重新修改提交，重新进入高校审核与秘书处审核流程。'
  );

  const [addMemberInput, setAddMemberInput] = useState('');
  const [addAdvisorInput, setAddAdvisorInput] = useState('');
  const [manageFeedback, setManageFeedback] = useState<{
    type: 'info' | 'success' | 'error';
    text: string;
  } | null>(null);
  // 队长在管理页点击【编辑】修改队长或队员角色标签的下拉框状态
  const [managingRolePopoverId, setManagingRolePopoverId] = useState<string | null>(null);
  // 队长点击提交审核时的“角色分配较单一”黄字弱提示弹窗
  const [singleRoleManageWarnModal, setSingleRoleManageWarnModal] = useState<{
    team: CaptainTeamRecord;
    roleName: CtfRoleType;
  } | null>(null);

  // 队员/老师视角（页面4）同意/拒绝前置校验拦截弹窗
  const [participateInterceptModal, setParticipateInterceptModal] = useState<{
    title: string;
    reason: string;
    canGoCertify: boolean;
  } | null>(null);
  const [declineReasonInput, setDeclineReasonInput] = useState('');
  const [declineModalTeamId, setDeclineModalTeamId] = useState<string | null>(null);

  // 🎉 报名成功（已晋级决赛）回执单预览与下载弹窗
  const [receiptModalTeam, setReceiptModalTeam] = useState<CaptainTeamRecord | null>(null);

  // 下载电子参赛回执单文件
  const handleDownloadReceiptFile = (team: CaptainTeamRecord) => {
    const stages = resolveTeamAuditStages(team);
    const snap = team.approvedSnapshot || buildApprovedSnapshotFromCaptainTeam(team);
    const rankNum = stages.schoolRank || snap.schoolRank || 1;
    const receiptNo = `GWC-2026-${team.university.slice(0, 2)}-${String(rankNum).padStart(2, '0')}-${team.id.slice(-4).toUpperCase()}`;
    const content = [
      '====================================================================',
      '          全国网数智安全大赛 · 晋级决赛报名成功确认回执单',
      '====================================================================',
      `回执编号：${receiptNo}`,
      `参赛赛事：${team.competitionTitle}`,
      `队伍名称：${team.teamName}`,
      `所属高校：${team.university}`,
      `校内排名：第 ${rankNum} 名`,
      `发起队长：${snap.captainName}（${snap.captainPhone || '已核验'}）`,
      `当前状态：🎉 报名成功（已晋级决赛）`,
      `高校资格审核：已通过（${stages.schoolAuditedAt || team.updatedAt}）`,
      `秘书处终审状态：终审通过（${stages.secretariatAuditedAt || snap.approvedAt}）`,
      '--------------------------------------------------------------------',
      '【正式参赛名单与队内CTF角色】',
      ...snap.members.map(
        (m, idx) =>
          `${idx + 1}. ${m.name} | 身份：${m.role} | 院校：${m.university} | 队内角色：${
            m.role === '指导教师'
              ? '-'
              : m.ctfRoles && m.ctfRoles.length > 0
              ? m.ctfRoles.join('、')
              : '未分配'
          }`
      ),
      '====================================================================',
      '大赛组委会秘书处 电子签章核验通过 · 凭本回执参加全国总决赛检录',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `参赛晋级回执单_${team.university}_${team.teamName}_第${rankNum}名.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 个人中心“我发起的（队长的队伍）”严格按当前登录账号匹配
  const myInitiatedTeams = captainTeams.filter((t) => isTeamOwnedByUser(t, currentUser));

  const activeManagingTeam = myInitiatedTeams.find((t) => t.id === managingTeamId) || null;
  const activeParticipatedTeam =
    participatedTeams.find((t) => t.id === viewingParticipatedId) || null;

  const pendingParticipatedCount = participatedTeams.filter(
    (p) => p.status === 'pending_invite'
  ).length;

  // --------------------------------------------------------------------------
  // 队长管理页（页面3）核心操作函数
  // --------------------------------------------------------------------------
  const updateSingleCaptainTeam = (
    teamId: string,
    updater: (prev: CaptainTeamRecord) => CaptainTeamRecord
  ) => {
    onUpdateCaptainTeams(
      captainTeams.map((t) => (t.id === teamId ? updater(t) : t))
    );
  };

  // 本地上传修改队伍 LOGO
  const handleManageTeamLogoUpload = (
    teamId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setManageFeedback({ type: 'error', text: '请上传 PNG、JPG、SVG 或 WebP 格式图片' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setManageFeedback({ type: 'error', text: '队伍 LOGO 图片大小不能超过 2MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const resultData = reader.result;
        updateSingleCaptainTeam(teamId, (prev) => ({
          ...prev,
          teamLogo: resultData,
          updatedAt: '2026-10-28 11:02',
        }));
        setManageFeedback({ type: 'success', text: '队伍 LOGO 已更新！' });
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. 针对“待确认”成员点击【催办】
  const handleRemindPendingPerson = (teamId: string, person: InvitedTeamPerson) => {
    const nowTime = '10:50';
    updateSingleCaptainTeam(teamId, (team) => ({
      ...team,
      members: team.members.map((m) =>
        m.id === person.id ? { ...m, lastRemindedAt: nowTime } : m
      ),
      advisors: team.advisors.map((a) =>
        a.id === person.id ? { ...a, lastRemindedAt: nowTime } : a
      ),
    }));
    setManageFeedback({
      type: 'success',
      text: `已向「${person.name} (${maskPhone(person.phone)})」发送催办站内信与短信提醒！`,
    });
  };

  // 2. 移除成员（区分 待确认/已拒绝 直接移除 vs 已同意 弹窗警告）
  const handleRequestRemovePerson = (teamId: string, person: InvitedTeamPerson) => {
    if (person.confirmStatus === 'accepted') {
      setRemoveAcceptedConfirmModal({ teamId, person });
      return;
    }
    executeRemovePerson(teamId, person);
  };

  const executeRemovePerson = (teamId: string, person: InvitedTeamPerson) => {
    updateSingleCaptainTeam(teamId, (team) => {
      if (person.role === 'member') {
        const { nextMembers, nextCaptainOrderIndex } =
          removeMemberAdjustingCaptainOrder(
            team.members,
            team.captainOrderIndex,
            person.id
          );
        return {
          ...team,
          members: nextMembers,
          captainOrderIndex: nextCaptainOrderIndex,
        };
      }
      return {
        ...team,
        advisors: team.advisors.filter((a) => a.id !== person.id),
      };
    });
    setRemoveAcceptedConfirmModal(null);
    setManageFeedback({
      type: 'info',
      text:
        person.confirmStatus === 'pending'
          ? `已将「${person.name}」移出队伍，系统已向对方发送取消邀请通知。`
          : `已将「${person.name}」移出队伍。`,
    });
  };

  // 在管理页调整参赛队员（含队长本人）的证书打印顺位
  const handleManageMoveContestant = (
    teamId: string,
    combinedFromIndex: number,
    direction: -1 | 1
  ) => {
    updateSingleCaptainTeam(teamId, (team) => {
      const { nextMembers, nextCaptainOrderIndex } =
        reorderContestantsWithCaptain(
          team.members,
          team.captainOrderIndex,
          combinedFromIndex,
          direction
        );
      return {
        ...team,
        members: nextMembers,
        captainOrderIndex: nextCaptainOrderIndex,
        updatedAt: '2026-10-28 11:04',
      };
    });
    setManageFeedback({
      type: 'info',
      text: '已更新参赛队员（含队长）报名排序！请注意：当前的报名人员顺序即为最终获奖证书的打印顺序。',
    });
  };

  // 3. 在管理页随时【+ 添加新成员 / 指导教师】（在组建中、邀请中或已驳回状态下添加，严格校验同校）
  const handleManageAddPerson = (
    teamId: string,
    role: 'member' | 'advisor',
    presetQuery?: string
  ) => {
    const rawQ =
      presetQuery !== undefined
        ? presetQuery
        : role === 'member'
        ? addMemberInput
        : addAdvisorInput;
    const q = rawQ.trim();
    if (!q) {
      setManageFeedback({
        type: 'error',
        text: `请输入要邀请${role === 'member' ? '队员' : '指导教师'}的手机号或邮箱`,
      });
      return;
    }

    const targetTeam = captainTeams.find((t) => t.id === teamId);
    if (!targetTeam) return;

    const regConfig = registrationConfigs.find(
      (rc) => rc.eventId === targetTeam.competitionId
    );
    const maxTeamSize = regConfig?.maxTeamSize ?? 4;
    const maxAdvisors = regConfig?.maxAdvisors ?? 2;

    if (role === 'member' && 1 + targetTeam.members.length >= maxTeamSize) {
      setManageFeedback({
        type: 'error',
        text: `人数超限拦截：本赛事配置队伍人数上限为 ${maxTeamSize} 人（含队长本人），当前已达上限，请先移除原队员后再添加。`,
      });
      return;
    }
    if (role === 'advisor' && targetTeam.advisors.length >= maxAdvisors) {
      setManageFeedback({
        type: 'error',
        text: `人数超限拦截：本赛事配置指导教师人数上限为 ${maxAdvisors} 人，当前已达上限，请先移除原指导教师后再添加。`,
      });
      return;
    }

    if (
      role === 'member' &&
      (q === (currentUser.phone || '') ||
        q.toLowerCase() === (currentUser.email || '').toLowerCase())
    ) {
      setManageFeedback({
        type: 'error',
        text: '您已是本队队长，无需重复添加自己为队员。',
      });
      return;
    }

    const found = activePlatformUsers.find(
      (u) => u.phone === q || u.email.toLowerCase() === q.toLowerCase()
    );
    if (!found) {
      setManageFeedback({
        type: 'error',
        text: `未查询到正常状态的账号「${q}」：该手机号/邮箱尚未注册或账号已停用。`,
      });
      return;
    }

    if (role === 'member' && found.identityType !== 'student') {
      setManageFeedback({
        type: 'error',
        text: `「${found.name}」为教师身份，请在指导教师栏添加。`,
      });
      return;
    }
    if (role === 'advisor') {
      if (found.identityType !== 'teacher') {
        setManageFeedback({
          type: 'error',
          text: `「${found.name}」不是教师账号，无法添加为指导教师。`,
        });
        return;
      }
      if (!found.isAcademicOrTeacherVerified) {
        setManageFeedback({
          type: 'error',
          text: `「${found.name}」尚未完成指导教师认证，无法邀请。`,
        });
        return;
      }
    }

    if (found.university !== targetTeam.university) {
      setManageFeedback({
        type: 'error',
        text: `同校校验拦截：平台不允许跨校组队，仅限添加「${targetTeam.university}」本校师生，「${found.name}（${found.university}）」无法添加。`,
      });
      return;
    }

    const exists = [...targetTeam.members, ...targetTeam.advisors].some(
      (p) => p.phone === found.phone
    );
    if (exists) {
      setManageFeedback({
        type: 'error',
        text: `「${found.name}」已在当前队伍列表中。`,
      });
      return;
    }

    const newPerson: InvitedTeamPerson = {
      id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: found.name,
      phone: found.phone,
      email: found.email,
      university: found.university,
      role,
      ctfRoles: role === 'member' ? [] : undefined,
      isVerified: true,
      confirmStatus: 'pending', // 自动向新成员发送邀请
    };

    updateSingleCaptainTeam(teamId, (team) => ({
      ...team,
      status: team.status === 'draft' ? 'inviting' : team.status,
      members: role === 'member' ? [...team.members, newPerson] : team.members,
      advisors: role === 'advisor' ? [...team.advisors, newPerson] : team.advisors,
      updatedAt: '2026-10-28 10:52',
    }));

    if (role === 'member') {
      setAddMemberInput('');
      // 新添加队员后，自动弹出该队员卡片旁的“设置角色”多选框
      setManagingRolePopoverId(newPerson.id);
    } else {
      setAddAdvisorInput('');
    }

    setManageFeedback({
      type: 'success',
      text:
        role === 'member'
          ? `已成功添加「${found.name}」并发送入队邀请！已为您展开该队员的【设置角色】多选框，可随时勾选角色标签。`
          : `已成功添加「${found.name}」并自动向其发送入队邀请通知（当前状态：待确认）！`,
    });
  };

  // 4. 模拟队员/老师在对方端点击“同意”或“拒绝”
  const handleSimulatePersonResponse = (
    teamId: string,
    personId: string,
    nextStatus: 'accepted' | 'rejected',
    reason?: string
  ) => {
    updateSingleCaptainTeam(teamId, (team) => ({
      ...team,
      members: team.members.map((m) =>
        m.id === personId
          ? {
              ...m,
              confirmStatus: nextStatus,
              rejectReason: nextStatus === 'rejected' ? reason || '个人时间安排冲突' : undefined,
            }
          : m
      ),
      advisors: team.advisors.map((a) =>
        a.id === personId
          ? {
              ...a,
              confirmStatus: nextStatus,
              rejectReason: nextStatus === 'rejected' ? reason || '指导名额已满' : undefined,
            }
          : a
      ),
    }));
    setManageFeedback({
      type: nextStatus === 'accepted' ? 'success' : 'error',
      text:
        nextStatus === 'accepted'
          ? '状态已更新：该成员已点击【同意加入】，成员状态变更为“已同意”！'
          : '状态已更新：该成员已点击【拒绝】，系统已通知队长处理！',
    });
  };

  // 5. 队长提交审核 / 重新提交审核（校验队员人数、教师人数是否符合报名要求，并校验所有已邀请人员是否均为“已同意”状态）
  const handleFormalSubmitForReview = (
    team: CaptainTeamRecord,
    skipRoleWarn = false
  ) => {
    if (!team.teamName.trim()) {
      setManageFeedback({
        type: 'error',
        text: '提交审核失败：请填写队伍名称（20字以内）！',
      });
      return;
    }
    if (!team.teamIntro || !team.teamIntro.trim()) {
      setManageFeedback({
        type: 'error',
        text: '提交审核失败：请填写队伍介绍（100字以内）！',
      });
      return;
    }

    const regConfig = registrationConfigs.find(
      (rc) => rc.eventId === team.competitionId
    );
    const includeAdvisor = regConfig?.includeAdvisor ?? true;
    const minAdvisors = regConfig?.minAdvisors ?? 0;
    const maxAdvisors = regConfig?.maxAdvisors ?? 2;
    const minTeamSize = regConfig?.minTeamSize ?? 2;
    const maxTeamSize = regConfig?.maxTeamSize ?? 4;

    // 1. 校验队员人数（含队长本人）是否符合报名要求
    const totalPersonCount = 1 + team.members.length;
    if (totalPersonCount < minTeamSize) {
      setManageFeedback({
        type: 'error',
        text: `提交审核失败：本赛事要求队伍总人数为 ${minTeamSize}~${maxTeamSize} 人（含队长，至少需 ${Math.max(
          0,
          minTeamSize - 1
        )} 名队员），当前共 ${totalPersonCount} 人（已邀请队员 ${
          team.members.length
        } 人），人数不足，请继续邀请队员！`,
      });
      return;
    }
    if (totalPersonCount > maxTeamSize) {
      setManageFeedback({
        type: 'error',
        text: `提交审核失败：本赛事要求队伍总人数最多 ${maxTeamSize} 人（含队长），当前共 ${totalPersonCount} 人，超出报名人数上限，请先移除多余队员！`,
      });
      return;
    }

    // 2. 校验指导教师人数是否符合报名要求
    if (!includeAdvisor && team.advisors.length > 0) {
      setManageFeedback({
        type: 'error',
        text: '提交审核失败：本赛事无需指导教师，请先移除已添加的指导教师！',
      });
      return;
    }
    if (includeAdvisor && minAdvisors > 0 && team.advisors.length < minAdvisors) {
      setManageFeedback({
        type: 'error',
        text: `提交审核失败：本赛事要求至少邀请 ${minAdvisors} 名指导教师，当前已邀请 ${team.advisors.length} 名，请先添加指导教师！`,
      });
      return;
    }
    if (includeAdvisor && team.advisors.length > maxAdvisors) {
      setManageFeedback({
        type: 'error',
        text: `提交审核失败：本赛事要求指导教师人数上限为 ${maxAdvisors} 名，当前已邀请 ${team.advisors.length} 名，请先移除多余指导教师！`,
      });
      return;
    }

    // 3. 校验已邀请的所有队员和指导教师是否均为“已同意”状态
    const unacceptedMembers = team.members.filter((m) => m.confirmStatus !== 'accepted');
    const unacceptedAdvisors = team.advisors.filter((a) => a.confirmStatus !== 'accepted');
    if (unacceptedMembers.length > 0 || unacceptedAdvisors.length > 0) {
      const detailParts: string[] = [];
      if (unacceptedMembers.length > 0) {
        detailParts.push(
          `队员：${unacceptedMembers
            .map((m) => `${m.name}（${m.confirmStatus === 'rejected' ? '已拒绝' : '待确认'}）`)
            .join('、')}`
        );
      }
      if (unacceptedAdvisors.length > 0) {
        detailParts.push(
          `指导教师：${unacceptedAdvisors
            .map((a) => `${a.name}（${a.confirmStatus === 'rejected' ? '已拒绝' : '待确认'}）`)
            .join('、')}`
        );
      }
      setManageFeedback({
        type: 'error',
        text: `提交审核失败：所有已邀请的队员和指导教师必须全部为“已同意”状态方可提交！当前未同意人员 —— ${detailParts.join(
          '；'
        )}。请等待对方同意，或移除未同意人员并补充符合人数要求的成员后再提交。`,
      });
      return;
    }

    // 防呆弱提示：如果6个角色只覆盖了1个角色（比如全队都是Web手），弹出黄字弱提示确认
    if (!skipRoleWarn && team.members.length > 0) {
      const warnCheck = checkSingleCtfRoleWarning(
        team.captainCtfRoles,
        team.members.map((m) => m.ctfRoles)
      );
      if (warnCheck.isSingleRole && warnCheck.roleName) {
        setSingleRoleManageWarnModal({
          team,
          roleName: warnCheck.roleName,
        });
        return;
      }
    }

    const stages = resolveTeamAuditStages(team);
    const isResubmittingAfterReject = stages.isRejectedBySchool;

    updateSingleCaptainTeam(team.id, (prev) => ({
      ...prev,
      status: 'pending_review',
      schoolAuditStatus: 'pending',
      schoolRejectReason: undefined,
      advancementStatus: 'none',
      schoolRank: undefined,
      secretariatAuditStatus: 'none',
      secretariatRejectReason: undefined,
      updatedAt: '2026-10-28 11:00',
    }));

    setSingleRoleManageWarnModal(null);
    setManageFeedback({
      type: 'success',
      text: isResubmittingAfterReject
        ? '修改已保存并重新提交高校审核！队伍已进入第一段【高校资格审核（待审核）】阶段。'
        : '已正式提交至【高校资格审核】！当前报名状态为“已提交（等待高校审核）”。',
    });
  };

  // 获取赛事报名截止时间
  const resolveRegEndTime = (competitionId: string): string => {
    const cfg = registrationConfigs.find((c) => c.eventId === competitionId);
    if (cfg?.regEndTime) return cfg.regEndTime;
    const comp = competitions.find((c) => c.id === competitionId);
    if (comp?.endDate) return `${comp.endDate} 23:59:59`;
    if (competitionId === 'comp-2026-ics-special') return '2026-11-12 23:59:59';
    if (competitionId === 'comp-2025-archive-ctf') return '2025-10-10 23:59:59';
    return '2026-11-15 23:59:59';
  };

  // ==========================================================================
  // 渲染分支 A：如果队长正在查看/管理某支队伍 -> 渲染【页面3：队伍详情/管理页】
  // ==========================================================================
  if (roleViewTab === 'initiated' && activeManagingTeam) {
    const team = activeManagingTeam;
    const auditStages = resolveTeamAuditStages(team);
    const isLocked = !auditStages.canEditTeam;
    const teamRegConfig = registrationConfigs.find(
      (rc) => rc.eventId === team.competitionId
    );
    const cfgIncludeAdvisor = teamRegConfig?.includeAdvisor ?? true;
    const cfgMinAdvisors = teamRegConfig?.minAdvisors ?? 0;
    const cfgMaxAdvisors = teamRegConfig?.maxAdvisors ?? 2;
    const cfgMinTeamSize = teamRegConfig?.minTeamSize ?? 2;
    const cfgMaxTeamSize = teamRegConfig?.maxTeamSize ?? 4;
    const allInvited = [...team.members, ...team.advisors];
    const totalPersonCount = 1 + team.members.length;
    const isCountValid =
      totalPersonCount >= cfgMinTeamSize &&
      totalPersonCount <= cfgMaxTeamSize &&
      (!cfgIncludeAdvisor
        ? team.advisors.length === 0
        : team.advisors.length >= cfgMinAdvisors &&
          team.advisors.length <= cfgMaxAdvisors);
    const allAccepted =
      isCountValid && allInvited.every((p) => p.confirmStatus === 'accepted');
    const progress = computeTeamConfirmProgress(team);
    const isCustomLogo =
      Boolean(team.teamLogo) &&
      (team.teamLogo!.startsWith('data:image') || team.teamLogo!.startsWith('http'));

    return (
      <div className="space-y-5">
        {/* 顶部返回栏与三段式审核模拟器 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setManagingTeamId(null);
              setManageFeedback(null);
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0284C7] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回【我的报名】列表</span>
          </button>

          {/* 三段式审核全景快捷模拟按钮（第一段：高校资格审核 -> 第二段：高校晋级提报 -> 第三段：秘书处终审） */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">三段式审核流程模拟：</span>
            {auditStages.schoolStatus === 'pending' && (
              <>
                <button
                  type="button"
                  onClick={() => setSchoolRejectModalOpen(team.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold cursor-pointer"
                >
                  ① 模拟高校资格【驳回】
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSingleCaptainTeam(team.id, (prev) => ({
                      ...prev,
                      status: 'pending_review',
                      schoolAuditStatus: 'approved',
                      schoolAuditedAt: '2026-10-28 11:05:00',
                      schoolRejectReason: undefined,
                      advancementStatus: 'wait_school_match',
                      secretariatAuditStatus: 'none',
                      updatedAt: '2026-10-28 11:05',
                    }));
                    setManageFeedback({
                      type: 'success',
                      text: '第一段【高校资格审核】已通过！队伍状态已变更为「高校已通过（待校赛）」，等待高校管理员在后台提报晋级名单。',
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0369A1] border border-sky-200 font-bold cursor-pointer"
                >
                  ① 模拟高校资格【通过 &rarr; 待校赛】
                </button>
              </>
            )}

            {(auditStages.advancementStatus === 'wait_school_match' ||
              auditStages.advancementStatus === 'secretariat_rejected' ||
              auditStages.advancementStatus === 'not_advanced') && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    updateSingleCaptainTeam(team.id, (prev) => ({
                      ...prev,
                      status: 'pending_review',
                      schoolAuditStatus: 'approved',
                      advancementStatus: 'pending_secretariat',
                      schoolRank: prev.schoolRank || 1,
                      advancementSubmittedAt: '2026-10-28 11:06:00',
                      secretariatAuditStatus: 'pending',
                      secretariatRejectReason: undefined,
                      updatedAt: '2026-10-28 11:06',
                    }));
                    setManageFeedback({
                      type: 'success',
                      text: '第二段【高校晋级提报】已完成！本队已作为「校内第 1 名」提报至秘书处，状态变更为「待秘书处终审」。',
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold cursor-pointer"
                >
                  ② 模拟高校【提报晋级(第1名) &rarr; 待终审】
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSingleCaptainTeam(team.id, (prev) => ({
                      ...prev,
                      status: 'pending_review',
                      schoolAuditStatus: 'approved',
                      advancementStatus: 'not_advanced',
                      schoolRank: undefined,
                      secretariatAuditStatus: 'none',
                      updatedAt: '2026-10-28 11:06',
                    }));
                    setManageFeedback({
                      type: 'info',
                      text: '已模拟高校提交晋级名单（本队未在名单内）：状态已变更为「未晋级（止步校赛）」，流程结束。',
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold cursor-pointer"
                >
                  ② 模拟高校提报【未入围 &rarr; 未晋级】
                </button>
              </>
            )}

            {auditStages.schoolStatus === 'approved' &&
              auditStages.secretariatStatus === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSecretariatRejectModalOpen(team.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold cursor-pointer"
                  >
                    ③ 模拟秘书处终审【驳回晋级名单】
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateSingleCaptainTeam(team.id, (prev) => {
                        const nextTeam: CaptainTeamRecord = {
                          ...prev,
                          status: 'approved',
                          schoolAuditStatus: 'approved',
                          advancementStatus: 'advanced',
                          schoolRank: prev.schoolRank || 1,
                          secretariatAuditStatus: 'approved',
                          secretariatAuditedAt: '2026-10-28 11:08:00',
                          secretariatRejectReason: undefined,
                          updatedAt: '2026-10-28 11:08',
                        };
                        return {
                          ...nextTeam,
                          approvedSnapshot: buildApprovedSnapshotFromCaptainTeam(
                            nextTeam,
                            '2026-10-28 11:08'
                          ),
                        };
                      });
                      setManageFeedback({
                        type: 'success',
                        text: '第三段【秘书处终审】已通过！队伍状态正式变更为「🎉 报名成功（已晋级决赛）」，已同步进入【我的竞赛】与后台【最终参赛队伍清单】！',
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    ③ 模拟秘书处终审【通过 &rarr; 晋级决赛】
                  </button>
                </>
              )}
          </div>
        </div>

        {manageFeedback && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between ${
              manageFeedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : manageFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-sky-50 border-sky-200 text-sky-900'
            }`}
          >
            <span>{manageFeedback.text}</span>
            <button
              type="button"
              onClick={() => setManageFeedback(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 状态2：被高校资格审核驳回时的醒目横幅（队长可修改并重新提交） */}
        {auditStages.isRejectedBySchool && (
          <div className="p-5 rounded-xl bg-red-50 border-2 border-red-300 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>高校资格审核已驳回 · 页面已解锁，请修改队伍信息或成员后点击底部【重新提交审核】</span>
              </div>
              <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5" />
                <span>可修改并重新提交</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
              <strong>高校审核驳回原因：</strong>
              {team.schoolRejectReason || '队伍信息或成员不符合本校审核要求，请修改后重新提交。'}
            </p>
          </div>
        )}

        {/* 状态3：高校资格审核通过（待校赛）横幅 */}
        {auditStages.regStatusKey === 'wait_school_match' && (
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-extrabold text-[#0369A1] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
                <span>第一段【高校资格审核】已通过 · 当前处于「高校已通过（待校赛）」阶段</span>
              </div>
              <p className="text-xs text-slate-600">
                队伍信息已锁定（只能查看，不可修改）。待校内选拔赛结束后，由本校高校管理员在后台勾选晋级队伍、排序并上传成绩单提报至大赛秘书处。
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-white border border-sky-200 text-xs font-bold text-[#0369A1] shrink-0">
              只能查看，不可修改
            </span>
          </div>
        )}

        {/* 状态4：未晋级（止步校赛）横幅 */}
        {auditStages.regStatusKey === 'not_advanced' && (
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>未晋级（止步校赛） · 本次参赛流程已结束</span>
              </div>
              <p className="text-xs text-slate-600">
                贵校管理员已完成本校晋级决赛名单提报，本战队未在本次校赛晋级推荐名单内。感谢您的参与，页面仅供只读归档查看。
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-600 shrink-0">
              只能查看，流程结束
            </span>
          </div>
        )}

        {/* 状态5：待秘书处终审（高校已提报晋级名单，本队在名单内）横幅 */}
        {auditStages.regStatusKey === 'pending_secretariat' && (
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-extrabold text-indigo-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  高校已提报晋级名单（校内排名：第 {auditStages.schoolRank || 1} 名） · 等待大赛秘书处终审
                </span>
              </div>
              <p className="text-xs text-indigo-700">
                本校管理员已将您的战队列入晋级名单并随附校赛成绩证明提交至秘书处，秘书处终审通过后即正式晋级决赛。
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-white border border-indigo-200 text-xs font-bold text-indigo-700 shrink-0">
              校内排名：第 {auditStages.schoolRank || 1} 名
            </span>
          </div>
        )}

        {/* 状态6：被秘书处驳回该校晋级名单时的醒目横幅（等待高校重新提报，队长不可修改，不向选手展示秘书处驳回说明） */}
        {auditStages.isRejectedBySecretariat && (
          <div className="p-5 rounded-xl bg-amber-50 border-2 border-amber-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  待秘书处终审（名单被驳回） · 当前校内排名：第 {auditStages.schoolRank || 1} 名
                </span>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-white px-3 py-1 rounded-lg border border-amber-300 flex items-center gap-1 shrink-0">
                <Lock className="w-3.5 h-3.5" />
                <span>等待高校重新提报，队长不可修改</span>
              </span>
            </div>
          </div>
        )}

        {/* 状态7：报名成功横幅 */}
        {auditStages.regStatusKey === 'approved' && (
          <div className="p-5 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm sm:text-base font-extrabold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  报名成功 · 校内排名：第 {auditStages.schoolRank || 1} 名
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                恭喜！您的战队已通过高校资格审核、高校晋级提报及大赛秘书处终审，正式列入【最终参赛队伍清单】。
              </p>
            </div>
          </div>
        )}

        {/* 主卡片：队伍详情与成员管理 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* 头部概要（含报名状态、高校审核、秘书处审核、成员确认进度） */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
            <div className="flex items-start gap-4">
              <TeamLogoAvatar logo={team.teamLogo} teamName={team.teamName} size="lg" />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${auditStages.regDotClass}`} />
                    <span className={auditStages.regColorClass}>
                      报名状态：{auditStages.regStatusLabel}
                    </span>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <span>高校审核：</span>
                    <AuditStageBadgeWithTooltip
                      status={auditStages.schoolStatus}
                      customLabel={auditStages.schoolBadgeLabel}
                      rejectReason={team.schoolRejectReason}
                      stageLabel="高校审核"
                    />
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <span>秘书处审核：</span>
                    <AuditStageBadgeWithTooltip
                      status={auditStages.secretariatStatus}
                      customLabel={auditStages.secretariatBadgeLabel}
                      stageLabel="秘书处审核"
                      hideRejectReason
                    />
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {team.teamName}
                </h2>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>
                    赛事：<strong className="text-slate-700">{team.competitionTitle}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    所属院校：<strong className="text-[#0369A1]">{team.university}</strong>
                  </span>
                  {auditStages.schoolRank && (
                    <>
                      <span>·</span>
                      <span>
                        校内排名：
                        <strong className="text-emerald-700 font-mono-num">
                          第 {auditStages.schoolRank} 名
                        </strong>
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span className="font-mono-num text-slate-700">
                    成员确认进度：<strong>{progress.label}</strong>
                  </span>
                </div>
              </div>
            </div>

            {!isLocked && (
              <div className="px-3.5 py-2 rounded-lg bg-sky-50 border border-sky-200 text-xs font-bold text-[#0369A1] flex items-center gap-1.5 shrink-0">
                <Unlock className="w-4 h-4 text-[#0284C7]" />
                <span>支持修改队伍信息与成员</span>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* 0. 队伍基本信息修改区（组建中 / 邀请中 / 高校驳回 / 秘书处驳回 均可直接修改队伍名称、赛道、LOGO、队伍介绍） */}
            {!isLocked ? (
              <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#0284C7]" />
                    <span>队伍基本信息修改（实时保存）</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    所属院校固定为：{team.university}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      队伍名称（20字以内）
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={team.teamName}
                      onChange={(e) =>
                        updateSingleCaptainTeam(team.id, (prev) => ({
                          ...prev,
                          teamName: e.target.value,
                          updatedAt: '2026-10-28 11:02',
                        }))
                      }
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      队伍 LOGO
                    </label>
                    <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center gap-3">
                      <TeamLogoAvatar logo={team.teamLogo} teamName={team.teamName} size="md" />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="px-2.5 py-1 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer">
                            <span>上传本地LOGO</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              onChange={(e) => handleManageTeamLogoUpload(team.id, e)}
                              className="hidden"
                            />
                          </label>
                          {isCustomLogo && (
                            <button
                              type="button"
                              onClick={() =>
                                updateSingleCaptainTeam(team.id, (prev) => ({
                                  ...prev,
                                  teamLogo: 'default-logo',
                                }))
                              }
                              className="px-2 py-1 rounded border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              恢复默认LOGO
                            </button>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">默认提供系统标准队徽</div>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      队伍介绍（100字以内）
                    </label>
                    <textarea
                      rows={2}
                      maxLength={100}
                      value={team.teamIntro || ''}
                      onChange={(e) =>
                        updateSingleCaptainTeam(team.id, (prev) => ({
                          ...prev,
                          teamIntro: e.target.value,
                          updatedAt: '2026-10-28 11:02',
                        }))
                      }
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#0284C7]" />
                    <span>赛事与队伍基本信息</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono-num">
                    报名提交时间：{team.createdAt}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/70">
                  <div>
                    <span className="text-slate-400 block mb-0.5">队伍名称</span>
                    <span className="font-bold text-slate-900">{team.teamName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">所属院校</span>
                    <span className="font-bold text-[#0369A1]">{team.university}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block mb-0.5">队伍介绍</span>
                    <span className="text-slate-700 leading-relaxed">
                      {team.teamIntro || '未填写队伍介绍'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 1. 参赛队员名单与证书打印顺序（含队长本人 + 团队成员，指导教师不参与排序） */}
            <div className="space-y-3">
              {/* 证书打印顺序醒目提醒 */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-900">
                <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">获奖证书打印顺序提醒：</span>
                  {!isLocked
                    ? '队长可自由调整包括队长本人在内的所有参赛队员的排序（点击卡片右侧【上移 / 下移】），'
                    : '以下参赛队员（含队长）排列顺位由队长在组队报名时确定，'}
                  <strong className="text-amber-800 underline underline-offset-2">
                    该报名顺序即为最终获奖证书上的姓名打印顺序
                  </strong>
                  。
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  参赛队员名单与证书打印顺位（含队长共 {1 + team.members.length} 人，其中受邀队员 {team.members.length} 人）
                </h3>
                <span className="text-xs text-slate-500">
                  赛事报名要求：队伍总人数 {cfgMinTeamSize}~{cfgMaxTeamSize} 人（含队长）
                </span>
              </div>

              {(() => {
                const combinedContestants = insertCaptainAtOrderIndex(
                  { kind: 'captain' as const },
                  team.members.map((m) => ({ kind: 'member' as const, person: m })),
                  team.captainOrderIndex
                );
                const totalContestants = combinedContestants.length;

                return (
                  <div className="space-y-2.5">
                    {combinedContestants.map((entry, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === totalContestants - 1;

                      if (entry.kind === 'captain') {
                        return (
                          <div
                            key="captain-manage-row"
                            className="p-4 rounded-xl bg-sky-50/50 border border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                                <span className="px-2 py-0.5 rounded-md bg-[#0284C7] text-white text-[11px] font-mono-num font-bold">
                                  第 {idx + 1} 顺位
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-sky-100 text-[#0369A1] text-[10px] font-bold">
                                  队长
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                <div className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2">
                                  <span>{team.captainName}</span>
                                  <span className="px-2 py-0.5 rounded bg-[#0284C7]/10 text-[#0369A1] text-[11px] font-bold">
                                    队长本人
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-slate-500 font-semibold">
                                    队内角色：
                                  </span>
                                  <CtfRoleBadges
                                    roles={team.captainCtfRoles}
                                    emptyText={isLocked ? '-' : '待分配'}
                                  />
                                </div>
                                <div className="text-xs text-slate-500">
                                  所属院校：{team.captainUniversity} · 实名与学籍已核验
                                </div>
                                <div className="text-xs text-slate-500 font-mono-num">
                                  {(() => {
                                    const capContact = resolveTeamCaptainContact(team);
                                    return `手机：${capContact.phone} | 邮箱：${capContact.email}`;
                                  })()}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center shrink-0">
                              {!isLocked && totalContestants > 1 && (
                                <div className="inline-flex items-center gap-1 mr-1 pr-2 border-r border-sky-200">
                                  <button
                                    type="button"
                                    disabled={isFirst}
                                    onClick={() =>
                                      handleManageMoveContestant(team.id, idx, -1)
                                    }
                                    title="上移顺位（调整获奖证书打印顺序）"
                                    className={`px-2 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                                      isFirst
                                        ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'border-sky-200 bg-white hover:bg-sky-100 text-[#0284C7] cursor-pointer'
                                    }`}
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                    <span>上移</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isLast}
                                    onClick={() =>
                                      handleManageMoveContestant(team.id, idx, 1)
                                    }
                                    title="下移顺位（调整获奖证书打印顺序）"
                                    className={`px-2 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                                      isLast
                                        ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'border-sky-200 bg-white hover:bg-sky-100 text-[#0284C7] cursor-pointer'
                                    }`}
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                    <span>下移</span>
                                  </button>
                                </div>
                              )}
                              {!isLocked && (
                                <CtfRoleSelectorDropdown
                                  selectedRoles={team.captainCtfRoles || []}
                                  onChange={(nextRoles) =>
                                    updateSingleCaptainTeam(team.id, (prev) => ({
                                      ...prev,
                                      captainCtfRoles: nextRoles,
                                      updatedAt: '2026-10-28 11:03',
                                    }))
                                  }
                                  isOpen={managingRolePopoverId === 'captain'}
                                  onToggleOpen={() =>
                                    setManagingRolePopoverId((prev) =>
                                      prev === 'captain' ? null : 'captain'
                                    )
                                  }
                                  onClose={() => setManagingRolePopoverId(null)}
                                  triggerLabel="编辑"
                                  compactTrigger
                                />
                              )}
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>已确认</span>
                              </span>
                            </div>
                          </div>
                        );
                      }

                      const mem = entry.person;
                      return (
                        <div
                          key={mem.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px] font-mono-num font-bold">
                                第 {idx + 1} 顺位
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                                队员
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="text-sm font-bold text-slate-900">
                                  {mem.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {mem.university}
                                </span>

                                {mem.confirmStatus === 'pending' && (
                                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                                    [ 待确认 ]
                                  </span>
                                )}
                                {mem.confirmStatus === 'accepted' && (
                                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                                    [ 已同意 ]
                                  </span>
                                )}
                                {mem.confirmStatus === 'rejected' && (
                                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded">
                                    [ 已拒绝 ]
                                  </span>
                                )}
                              </div>

                              {/* 姓名下方直接展示该队员的角色标签 */}
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500 font-semibold">
                                  队内角色：
                                </span>
                                <CtfRoleBadges
                                  roles={mem.ctfRoles}
                                  emptyText={isLocked ? '-' : '待分配'}
                                />
                              </div>

                              <div className="text-xs text-slate-500 font-mono-num">
                                手机：{maskPhone(mem.phone)} | 邮箱：{maskEmail(mem.email)}
                                {mem.lastRemindedAt && (
                                  <span className="ml-3 text-[#0284C7]">
                                    （已于 {mem.lastRemindedAt} 发送催办提醒）
                                  </span>
                                )}
                              </div>

                              {mem.confirmStatus === 'rejected' && (
                                <div className="text-xs text-red-600 font-medium">
                                  拒绝原因：{mem.rejectReason || '无理由'}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 队长可执行的操作（未锁定时） */}
                          {!isLocked && (
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {totalContestants > 1 && (
                                <div className="inline-flex items-center gap-1 mr-1 pr-2 border-r border-slate-200">
                                  <button
                                    type="button"
                                    disabled={isFirst}
                                    onClick={() =>
                                      handleManageMoveContestant(team.id, idx, -1)
                                    }
                                    title="上移顺位（调整获奖证书打印顺序）"
                                    className={`px-2 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                                      isFirst
                                        ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'border-slate-300 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#0284C7] cursor-pointer'
                                    }`}
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                    <span>上移</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isLast}
                                    onClick={() =>
                                      handleManageMoveContestant(team.id, idx, 1)
                                    }
                                    title="下移顺位（调整获奖证书打印顺序）"
                                    className={`px-2 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                                      isLast
                                        ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'border-slate-300 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#0284C7] cursor-pointer'
                                    }`}
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                    <span>下移</span>
                                  </button>
                                </div>
                              )}

                              {mem.confirmStatus === 'pending' && (
                                <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSimulatePersonResponse(team.id, mem.id, 'accepted')
                                    }
                                    className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold cursor-pointer"
                                  >
                                    模拟TA同意
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSimulatePersonResponse(
                                        team.id,
                                        mem.id,
                                        'rejected',
                                        '课程实验时间冲突'
                                      )
                                    }
                                    className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold cursor-pointer"
                                  >
                                    模拟TA拒绝
                                  </button>
                                </div>
                              )}

                              {/* 点击【编辑】图标随时修改该队员的角色标签 */}
                              <CtfRoleSelectorDropdown
                                selectedRoles={mem.ctfRoles || []}
                                onChange={(nextRoles) =>
                                  updateSingleCaptainTeam(team.id, (prev) => ({
                                    ...prev,
                                    members: prev.members.map((item) =>
                                      item.id === mem.id ? { ...item, ctfRoles: nextRoles } : item
                                    ),
                                    updatedAt: '2026-10-28 11:03',
                                  }))
                                }
                                isOpen={managingRolePopoverId === mem.id}
                                onToggleOpen={() =>
                                  setManagingRolePopoverId((prev) =>
                                    prev === mem.id ? null : mem.id
                                  )
                                }
                                onClose={() => setManagingRolePopoverId(null)}
                                triggerLabel="编辑"
                                compactTrigger
                              />

                              {mem.confirmStatus === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleRemindPendingPerson(team.id, mem)}
                                  className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <BellRing className="w-3.5 h-3.5" />
                                  <span>催办</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRequestRemovePerson(team.id, mem)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>移除</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* 未锁定时随时【+ 添加成员】 */}
              {!isLocked && (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2.5">
                  <div className="text-xs font-bold text-slate-700">
                    【 + 添加队员】（仅限{team.university}本校学生，添加后自动发送邀请并弹出角色设置）
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={addMemberInput}
                      onChange={(e) => setAddMemberInput(e.target.value)}
                      placeholder="输入新队员手机号或邮箱..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleManageAddPerson(team.id, 'member')}
                      className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
                    >
                      + 添加并发送邀请
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>快捷拉入本校学生：</span>
                    {activePlatformUsers
                      .filter(
                        (u) =>
                          u.identityType === 'student' &&
                          u.university === team.university &&
                          u.phone !== currentUser.phone &&
                          u.username !== currentUser.username
                      )
                      .map((stu) => (
                        <button
                          key={stu.id}
                          type="button"
                          onClick={() => handleManageAddPerson(team.id, 'member', stu.phone)}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-[#0284C7] text-[#0369A1] font-mono-num cursor-pointer"
                        >
                          + 拉入 {stu.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. 指导教师列表与状态操作（指导教师不参与排序与CTF角色分配，角色显示为“-”） */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  指导教师（共 {team.advisors.length} 人）
                </h3>
                <span className="text-xs text-slate-500">
                  赛事报名要求：
                  {cfgIncludeAdvisor
                    ? cfgMinAdvisors > 0
                      ? `需邀请 ${cfgMinAdvisors}~${cfgMaxAdvisors} 名指导教师`
                      : `可邀请 0~${cfgMaxAdvisors} 名指导教师`
                    : '本赛事无需指导教师'}
                </span>
              </div>

              <div className="space-y-2.5">
                {team.advisors.map((adv) => (
                  <div
                    key={adv.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-sm font-bold text-slate-900">{adv.name}</span>
                        <span className="text-xs font-semibold text-slate-600">
                          {adv.university}
                        </span>

                        {adv.confirmStatus === 'pending' && (
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                            [ 待确认 ]
                          </span>
                        )}
                        {adv.confirmStatus === 'accepted' && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                            [ 已同意 ]
                          </span>
                        )}
                        {adv.confirmStatus === 'rejected' && (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded">
                            [ 已拒绝 ]
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-semibold">
                          队内角色：
                        </span>
                        <CtfRoleBadges isAdvisor />
                      </div>

                      <div className="text-xs text-slate-500 font-mono-num">
                        手机：{maskPhone(adv.phone)} | 邮箱：{maskEmail(adv.email)}
                      </div>
                    </div>

                    {!isLocked && (
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {adv.confirmStatus === 'pending' && (
                          <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-slate-200">
                            <button
                              type="button"
                              onClick={() =>
                                handleSimulatePersonResponse(team.id, adv.id, 'accepted')
                              }
                              className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold cursor-pointer"
                            >
                              模拟老师同意
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSimulatePersonResponse(
                                  team.id,
                                  adv.id,
                                  'rejected',
                                  '指导名额已满'
                                )
                              }
                              className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold cursor-pointer"
                            >
                              模拟老师拒绝
                            </button>
                          </div>
                        )}

                        {adv.confirmStatus === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleRemindPendingPerson(team.id, adv)}
                            className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <BellRing className="w-3.5 h-3.5" />
                            <span>催办</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRequestRemovePerson(team.id, adv)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>移除</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!isLocked && (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2.5">
                  <div className="text-xs font-bold text-slate-700">
                    【 + 添加指导教师】（仅限{team.university}已认证教师，添加后自动发送邀请）
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={addAdvisorInput}
                      onChange={(e) => setAddAdvisorInput(e.target.value)}
                      placeholder="输入指导教师手机号或邮箱..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleManageAddPerson(team.id, 'advisor')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
                    >
                      + 添加并发送邀请
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>快捷拉入本校教师：</span>
                    {activePlatformUsers
                      .filter(
                        (u) => u.identityType === 'teacher' && u.university === team.university
                      )
                      .map((tea) => (
                        <button
                          key={tea.id}
                          type="button"
                          onClick={() => handleManageAddPerson(team.id, 'advisor', tea.phone)}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-[#0284C7] text-slate-700 font-mono-num cursor-pointer"
                        >
                          + 拉入 {tea.name} ({tea.university})
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. 底部：队长“正式提交高校审核”核心操作栏 */}
            {!isLocked && (
              <div className="pt-6 border-t border-slate-200 space-y-3">
                {manageFeedback && manageFeedback.type === 'error' && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm font-semibold text-red-700 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{manageFeedback.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setManageFeedback(null)}
                      className="text-red-400 hover:text-red-700 cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 space-y-1">
                    {allAccepted ? (
                      <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          当前队员与指导教师人数符合报名要求且全员均已同意加入！您可以直接点击右侧【正式提交高校审核】。
                        </span>
                      </div>
                    ) : (
                      <div>
                        点击【正式提交高校审核】时，系统将严格校验队员与指导教师人数是否符合报名要求（队伍总人数 {cfgMinTeamSize}~{cfgMaxTeamSize} 人，指导教师{' '}
                        {cfgIncludeAdvisor ? `${cfgMinAdvisors}~${cfgMaxAdvisors} 人` : '0 人'}），且所有已邀请人员均须为“已同意”状态，否则无法提交。
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleFormalSubmitForReview(team)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>正式提交高校审核</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 弹窗1：移除“已同意”成员的二次警告弹窗 */}
        {removeAcceptedConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-amber-600 text-white font-bold text-sm flex items-center justify-between">
                <span>移除已同意成员警告</span>
                <button
                  type="button"
                  onClick={() => setRemoveAcceptedConfirmModal(null)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-800 leading-relaxed">
                  成员 <strong>{removeAcceptedConfirmModal.person.name}</strong> 已经同意加入本战队。
                  <strong>对方已同意，移除后需重新邀请别人</strong>，是否确认将其移出队伍？
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRemoveAcceptedConfirmModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      executeRemovePerson(
                        removeAcceptedConfirmModal.teamId,
                        removeAcceptedConfirmModal.person
                      )
                    }
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    确认移除
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* 弹窗3：模拟高校管理员驳回弹窗 */}
        {schoolRejectModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-red-600 text-white font-bold text-sm flex items-center justify-between">
                <span>模拟高校审核驳回</span>
                <button
                  type="button"
                  onClick={() => setSchoolRejectModalOpen(null)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <label className="block text-xs font-bold text-slate-700">
                  填写高校审核驳回原因（将通知队长并解锁队伍修改权限）：
                </label>
                <textarea
                  rows={3}
                  value={schoolRejectReasonInput}
                  onChange={(e) => setSchoolRejectReasonInput(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSchoolRejectModalOpen(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateSingleCaptainTeam(team.id, (prev) => ({
                        ...prev,
                        status: 'rejected',
                        schoolAuditStatus: 'rejected',
                        schoolRejectReason: schoolRejectReasonInput.trim(),
                        secretariatAuditStatus: 'none',
                        updatedAt: '2026-10-28 11:10',
                      }));
                      setSchoolRejectModalOpen(null);
                      setManageFeedback({
                        type: 'error',
                        text: '已模拟【高校审核驳回】！当前报名状态为“已提交”，高校审核状态为“已驳回”，队长可修改队伍信息与成员后点击【重新提交审核】，重新进入高校审核与秘书处审核流程。',
                      });
                    }}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    确认驳回
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 弹窗4：模拟秘书处审核驳回弹窗 */}
        {secretariatRejectModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-red-600 text-white font-bold text-sm flex items-center justify-between">
                <span>模拟秘书处审核驳回</span>
                <button
                  type="button"
                  onClick={() => setSecretariatRejectModalOpen(null)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <label className="block text-xs font-bold text-slate-700">
                  填写秘书处审核驳回原因（将解锁队伍修改权限，队长修改重新提交后需重新进入高校审核、秘书处审核流程）：
                </label>
                <textarea
                  rows={3}
                  value={secretariatRejectReasonInput}
                  onChange={(e) => setSecretariatRejectReasonInput(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSecretariatRejectModalOpen(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateSingleCaptainTeam(team.id, (prev) => ({
                          ...prev,
                          status: 'pending_review',
                          schoolAuditStatus: 'approved',
                          advancementStatus: 'secretariat_rejected',
                          schoolRank: prev.schoolRank || 1,
                          secretariatAuditStatus: 'rejected',
                          secretariatRejectReason: secretariatRejectReasonInput.trim(),
                          updatedAt: '2026-10-28 11:12',
                        }));
                        setSecretariatRejectModalOpen(null);
                        setManageFeedback({
                          type: 'error',
                          text: '已模拟【秘书处终审驳回晋级名单】！状态变更为“待秘书处终审（名单被驳回）”，等待高校管理员重新提报，队长不可修改队伍。',
                        });
                      }}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      确认驳回
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* 弹窗5：角色分配较单一防呆弱提示弹窗 */}
        {singleRoleManageWarnModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-amber-300 max-w-md w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-amber-500 text-white font-bold text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>队伍角色配置防呆弱提示</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSingleRoleManageWarnModal(null)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-bold leading-relaxed">
                  当前队伍角色分配较单一（全是{singleRoleManageWarnModal.roleName}），请确认是否符合参赛策略？
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  提示：CTF 竞赛支持策略性全选同一角色或单兵作战，系统不做强制拦截。若确认符合队伍策略，请点击【确认提交】继续放行。
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSingleRoleManageWarnModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    返回调整角色
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleFormalSubmitForReview(
                        singleRoleManageWarnModal.team,
                        true
                      )
                    }
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    确认提交
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // 渲染分支 B：如果队员/老师正在查看某条受邀详情 -> 渲染【页面4：受邀详情页】
  // ==========================================================================
  if (roleViewTab === 'participated' && activeParticipatedTeam) {
    const item = activeParticipatedTeam;

    // 点击【同意加入】：前置校验【实名/学籍/教师认证】与【学校一致性】
    const handleAcceptInvite = () => {
      // 1. 校验实名与学籍/教师认证
      if (
        currentUser.realNameStatus !== 'verified' ||
        currentUser.academicStatus !== 'verified'
      ) {
        setParticipateInterceptModal({
          title: '实名或学籍/教师认证未完成',
          reason:
            '系统前置校验未通过：您当前尚未完成【实名认证】或【学籍/教师认证】。根据大赛规则，被邀请队员与指导教师须先完成身份认证方可同意加入战队。',
          canGoCertify: true,
        });
        return;
      }

      // 2. 校验学校一致性（用户认证学校 vs 队伍所属院校）
      if (currentUser.university !== item.university) {
        setParticipateInterceptModal({
          title: '所属院校一致性校验未通过（禁止跨校加入）',
          reason: `系统前置校验未通过：您当前认证的所属院校为「${currentUser.university}」，而该战队的所属院校为「${item.university}」。大赛严格要求同校组队与同校指导，您无法同意加入跨校队伍。`,
          canGoCertify: false,
        });
        return;
      }

      // 校验通过 -> 变更为“已加入（已同意）”
      onUpdateParticipatedTeams(
        participatedTeams.map((p) =>
          p.id === item.id ? { ...p, status: 'joined' } : p
        )
      );
    };

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewingParticipatedId(null)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0284C7] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回【我参与的】列表</span>
          </button>
          <span className="text-xs text-slate-400">被邀请者（队员/指导教师）详情页</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <TeamLogoAvatar logo={item.teamLogo} teamName={item.teamName} size="lg" />
              <div>
                <div className="text-xs text-[#0284C7] font-bold mb-1">
                  受邀角色：{item.myRoleInTeam} · 邀请时间：{item.invitedAt}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">{item.teamName}</h2>
                {item.teamIntro && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.teamIntro}</p>
                )}
              </div>
            </div>

            <div className="text-xs font-bold shrink-0">
              {item.status === 'pending_invite' && (
                <span className="text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                  待处理邀请
                </span>
              )}
              {item.status === 'joined' && (
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  已加入（已同意）
                </span>
              )}
              {item.status === 'declined' && (
                <span className="text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
                  已拒绝
                </span>
              )}
              {item.status === 'team_pending_review' && (
                <span className="text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg">
                  队伍待审核
                </span>
              )}
              {item.status === 'team_approved' && (
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  队伍报名成功
                </span>
              )}
            </div>
          </div>

          {/* 核心展示：队长是谁、队伍名称、所属院校、队长分配给我的初始角色标签、队伍介绍 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200/80 text-sm">
            <div>
              <span className="text-slate-500 text-xs block mb-0.5">参赛赛事</span>
              <span className="font-bold text-slate-900">
                {item.competitionTitle}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block mb-0.5">队伍名称</span>
              <span className="font-bold text-slate-900">{item.teamName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block mb-0.5">发起队长</span>
              <span className="font-bold text-slate-900">
                {item.captainName}（{maskPhone(item.captainPhone)}）
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block mb-0.5">队伍所属院校</span>
              <span className="font-bold text-[#0369A1]">{item.university}</span>
            </div>
            <div className="sm:col-span-2 p-3.5 rounded-xl bg-white border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <span className="text-slate-500 text-xs font-bold block">
                  队长为您分配的队内角色标签：
                </span>
                <div className="flex items-center gap-2">
                  <CtfRoleBadges
                    roles={item.myCtfRoles}
                    isAdvisor={item.myRoleInTeam === '指导教师'}
                    emptyText="待分配"
                  />
                  {item.myRoleInTeam === '指导教师' && (
                    <span className="text-xs text-slate-400">
                      （指导教师不参与 CTF 角色分配）
                    </span>
                  )}
                </div>
              </div>
              {item.myRoleInTeam === '参赛队员' && (
                <span className="text-[11px] text-slate-500">
                  {item.status === 'pending_invite'
                    ? '点击【同意加入】后角色标签正式生效（如需调整请联系队长修改）'
                    : '角色标签已生效（仅队长具备修改权限）'}
                </span>
              )}
            </div>
            {item.teamIntro && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 text-xs block mb-0.5">队伍介绍</span>
                <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {item.teamIntro}
                </span>
              </div>
            )}
          </div>

          {/* 队伍成员列表（每个队员姓名下方直接展示角色标签，指导教师显示“-”） */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                队伍成员与队内角色明细
              </h3>
              <span className="text-xs text-slate-400">
                队员角色由队长统一分配管理
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(item.approvedSnapshot?.members
                ? item.approvedSnapshot.members.map((m) => ({
                    name: m.name,
                    role: m.role,
                    university: m.university,
                    ctfRoles: m.ctfRoles,
                    statusLabel: '报名成功',
                  }))
                : item.teamMembersDetail || []
              ).map((mem, idx) => (
                <div
                  key={`${mem.name}-${idx}`}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{mem.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          mem.role === '队长'
                            ? 'bg-sky-100 text-[#0369A1]'
                            : mem.role === '指导教师'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {mem.role}
                      </span>
                      <span className="text-xs text-slate-500">{mem.university}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">队内角色：</span>
                      <CtfRoleBadges
                        roles={mem.ctfRoles}
                        isAdvisor={mem.role === '指导教师'}
                        emptyText="待分配"
                      />
                    </div>
                  </div>
                  {mem.statusLabel && (
                    <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                      {mem.statusLabel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-sky-50/60 border border-sky-100 rounded-xl p-4">
            <div className="font-bold text-slate-800 mb-1">点击【同意加入】前置校验说明：</div>
            <div>
              系统将自动核验您的 <strong>实名认证状态</strong>、<strong>学籍/教师认证状态</strong> 以及{' '}
              <strong>所属院校一致性</strong>（您当前认证院校：
              <strong className="text-slate-900">
                {currentUser.academicStatus === 'verified' ? currentUser.university : '未认证'}
              </strong>{' '}
              vs 队伍所属院校：<strong className="text-slate-900">{item.university}</strong>）。
            </div>
          </div>

          {/* 底部只有两个按钮：【同意加入】 和 【拒绝】 */}
          {item.status === 'pending_invite' && (
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeclineReasonInput('');
                  setDeclineModalTeamId(item.id);
                }}
                className="px-6 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-bold cursor-pointer"
              >
                拒 绝
              </button>
              <button
                type="button"
                onClick={handleAcceptInvite}
                className="px-7 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              >
                同意加入
              </button>
            </div>
          )}
        </div>

        {/* 拦截弹窗：认证未完成 或 跨校不一致 */}
        {participateInterceptModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-amber-600 text-white font-bold text-sm flex items-center justify-between">
                <span>{participateInterceptModal.title}</span>
                <button
                  type="button"
                  onClick={() => setParticipateInterceptModal(null)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {participateInterceptModal.reason}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setParticipateInterceptModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    我知道了
                  </button>
                  {participateInterceptModal.canGoCertify && (
                    <button
                      type="button"
                      onClick={() => {
                        setParticipateInterceptModal(null);
                        onJumpToCertification();
                      }}
                      className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      前往用户认证 &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 拒绝邀请确认弹窗 */}
        {declineModalTeamId && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-slate-900 text-white font-bold text-sm flex items-center justify-between">
                <span>确认拒绝入队邀请</span>
                <button
                  type="button"
                  onClick={() => setDeclineModalTeamId(null)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <label className="block text-xs font-bold text-slate-700">
                  拒绝原因（选填，队长端同步可见）：
                </label>
                <input
                  type="text"
                  value={declineReasonInput}
                  onChange={(e) => setDeclineReasonInput(e.target.value)}
                  placeholder="如：已有其他战队 / 时间冲突（不填默认显示“无理由”）"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeclineModalTeamId(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateParticipatedTeams(
                        participatedTeams.map((p) =>
                          p.id === declineModalTeamId
                            ? {
                                ...p,
                                status: 'declined',
                                declineReason: declineReasonInput.trim() || '无理由',
                              }
                            : p
                        )
                      );
                      setDeclineModalTeamId(null);
                    }}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    确认拒绝
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // 渲染分支 C：默认【我的报名】列表页（含 Tab 切换：我发起的 / 我参与的）
  // ==========================================================================
  return (
    <div className="space-y-5">
      {/* 顶部标题与双视角 Tab 切换栏 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">我的报名</h2>
            <p className="text-xs text-slate-500 mt-1">
              管理我作为队长发起的战队，或处理我作为队员/指导教师收到的组队邀请
            </p>
          </div>

          {/* Tab 切换：我发起的 vs 我参与的 */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setRoleViewTab('initiated')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                roleViewTab === 'initiated'
                  ? 'bg-[#0284C7] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              我发起的
            </button>
            <button
              type="button"
              onClick={() => setRoleViewTab('participated')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                roleViewTab === 'participated'
                  ? 'bg-[#0284C7] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>我参与的</span>
              {pendingParticipatedCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-num ${
                    roleViewTab === 'participated'
                      ? 'bg-white text-[#0284C7]'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {pendingParticipatedCount}待处理
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 列表内容区：常规表格列表 */}
        {roleViewTab === 'initiated' ? (
          /* ------------------------------------------------------------------
             页面2：【我的报名】列表（队长视角）
             表格列：赛事名称/参赛赛道、队伍名称、成员确认进度、报名状态、高校审核、秘书处审核、操作
             ------------------------------------------------------------------ */
          <div className="pt-5">
            {myInitiatedTeams.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                您尚未作为队长发起任何赛事报名，请前往「赛事目录 &rarr; 赛事详情页」点击【立即报名】创建队伍。
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                      <th className="py-3.5 px-4">赛事名称</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">队伍名称</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">报名截止时间</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">成员确认进度</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">报名状态</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">高校审核</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">秘书处审核</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm bg-white">
                    {myInitiatedTeams.map((team) => {
                      const auditStages = resolveTeamAuditStages(team);
                      const progress = computeTeamConfirmProgress(team);

                      return (
                        <tr
                          key={team.id}
                          className="hover:bg-sky-50/40 transition-colors"
                        >
                          {/* 赛事名称 */}
                          <td className="py-3.5 px-4 align-middle max-w-xs xl:max-w-md 2xl:max-w-lg">
                            <div className="font-bold text-slate-900 line-clamp-1">
                              {team.competitionTitle}
                            </div>
                          </td>

                          {/* 队伍名称 + LOGO + 简短介绍 */}
                          <td className="py-3.5 px-4 align-middle">
                            <div className="flex items-center gap-2.5">
                              <TeamLogoAvatar
                                logo={team.teamLogo}
                                teamName={team.teamName}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-900 whitespace-nowrap">
                                  {team.teamName}
                                </div>
                                {team.teamIntro ? (
                                  <div
                                    className="text-[11px] text-slate-500 max-w-[180px] xl:max-w-[260px] truncate mt-0.5"
                                    title={team.teamIntro}
                                  >
                                    {team.teamIntro}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400 font-mono-num mt-0.5">
                                    更新于 {team.updatedAt}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 报名截止时间 */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap font-mono-num text-xs text-slate-600">
                            {resolveRegEndTime(team.competitionId)}
                          </td>

                          {/* 成员确认进度：邀请X人，X人已同意，X人已拒绝 */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                            <span className="font-mono-num text-xs font-bold text-slate-800">
                              {progress.label}
                            </span>
                          </td>

                          {/* 报名状态 */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 text-xs">
                              <span className={`w-2 h-2 rounded-full ${auditStages.regDotClass}`} />
                              <span className={auditStages.regColorClass}>
                                {auditStages.regStatusLabel}
                              </span>
                            </div>
                          </td>

                          {/* 高校审核（双列状态第1列） */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                            <AuditStageBadgeWithTooltip
                              status={auditStages.schoolStatus}
                              customLabel={auditStages.schoolBadgeLabel}
                              rejectReason={team.schoolRejectReason}
                              stageLabel="高校审核"
                            />
                          </td>

                          {/* 秘书处审核（双列状态第2列：前台不展示驳回说明图标与内容） */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                            <AuditStageBadgeWithTooltip
                              status={auditStages.secretariatStatus}
                              customLabel={auditStages.secretariatBadgeLabel}
                              stageLabel="秘书处审核"
                              hideRejectReason
                            />
                          </td>

                          {/* 操作按钮（严格对应三段式状态机） */}
                          <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                            {team.status === 'draft' && (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onContinueEditDraft(team)}
                                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
                                >
                                  继续编辑
                                </button>
                              </div>
                            )}

                            {team.status === 'inviting' && (
                              <button
                                type="button"
                                onClick={() => setManagingTeamId(team.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
                              >
                                修改队伍与成员
                              </button>
                            )}

                            {/* 仅高校资格审核驳回时允许队长修改并重新提交 */}
                            {auditStages.isRejectedBySchool && (
                              <button
                                type="button"
                                onClick={() => setManagingTeamId(team.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                              >
                                修改并重新提交
                              </button>
                            )}

                            {/* 其余只读状态（含报名成功、等待高校审核、待校赛、未晋级、待终审等）：仅显示查看详情 */}
                            {!auditStages.canEditTeam && (
                              <button
                                type="button"
                                onClick={() => setManagingTeamId(team.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold cursor-pointer"
                              >
                                查看详情
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* ------------------------------------------------------------------
             页面4：【我的报名】列表（队员/老师视角 —— 常规表格列表）
             ------------------------------------------------------------------ */
          <div className="pt-5">
            {participatedTeams.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                暂无作为队员或指导教师受邀参与的队伍记录。
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                      <th className="py-3.5 px-4">赛事名称</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">队伍名称</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">报名截止时间</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">发起队长 / 所属院校</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">受邀角色</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">当前状态</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm bg-white">
                    {participatedTeams.map((item) => {
                      const isPendingInvite = item.status === 'pending_invite';
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setViewingParticipatedId(item.id)}
                          className={`transition-colors cursor-pointer ${
                            isPendingInvite
                              ? 'bg-amber-50/40 hover:bg-amber-50/80'
                              : 'hover:bg-sky-50/40'
                          }`}
                        >
                          {/* 赛事名称 */}
                          <td className="py-3.5 px-4 align-middle max-w-xs xl:max-w-md 2xl:max-w-lg">
                            <div className="font-bold text-slate-900 line-clamp-1">
                              {item.competitionTitle}
                            </div>
                          </td>

                          {/* 队伍名称 + LOGO + 简短介绍 */}
                          <td className="py-3.5 px-4 align-middle">
                            <div className="flex items-center gap-2.5">
                              <TeamLogoAvatar
                                logo={item.teamLogo}
                                teamName={item.teamName}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-900 whitespace-nowrap">
                                  {item.teamName}
                                </div>
                                {item.teamIntro ? (
                                  <div
                                    className="text-[11px] text-slate-500 max-w-[200px] xl:max-w-[280px] 2xl:max-w-[360px] truncate mt-0.5"
                                    title={item.teamIntro}
                                  >
                                    {item.teamIntro}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400 font-mono-num mt-0.5">
                                    受邀于 {item.invitedAt}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 报名截止时间 */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap font-mono-num text-xs text-slate-600">
                            {resolveRegEndTime(item.competitionId)}
                          </td>

                          {/* 发起队长 / 所属院校 */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                            <div className="text-xs font-bold text-slate-800">
                              {item.captainName}（{maskPhone(item.captainPhone)}）
                            </div>
                            <div className="text-xs text-[#0369A1] font-semibold mt-0.5">
                              {item.university}
                            </div>
                          </td>

                          {/* 受邀角色（含队长分配的队内角色标签） */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap text-xs font-semibold text-slate-700">
                            <div>{item.myRoleInTeam}</div>
                            <div className="mt-1">
                              <CtfRoleBadges
                                roles={item.myCtfRoles}
                                isAdvisor={item.myRoleInTeam === '指导教师'}
                                emptyText="待分配"
                              />
                            </div>
                          </td>

                          {/* 当前状态 */}
                          <td className="py-3.5 px-4 align-middle whitespace-nowrap text-xs">
                            {item.status === 'pending_invite' && (
                              <span className="font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded">
                                ● 待处理邀请
                              </span>
                            )}
                            {item.status === 'joined' && (
                              <span className="font-bold text-emerald-700">● 已加入</span>
                            )}
                            {item.status === 'declined' && (
                              <div
                                className="inline-flex items-center gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200/80 text-xs font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                  <span>已拒绝</span>
                                </span>
                                <div className="relative group inline-flex items-center">
                                  <span
                                    className="w-4 h-4 rounded-full bg-red-100 hover:bg-red-200 text-red-600 inline-flex items-center justify-center cursor-help transition-colors"
                                    title={item.declineReason || '无理由'}
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                  </span>
                                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2.5 rounded-xl bg-slate-900 text-white text-[11px] leading-relaxed shadow-xl">
                                    <div className="font-bold text-red-300 mb-0.5">
                                      拒绝原因：
                                    </div>
                                    <div className="text-slate-100 break-words whitespace-normal">
                                      {item.declineReason || '无理由'}
                                    </div>
                                    <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                                  </div>
                                </div>
                              </div>
                            )}
                            {item.status === 'team_pending_review' && (
                              <span className="font-bold text-[#0284C7]">● 队伍待审核</span>
                            )}
                            {item.status === 'team_approved' && (
                              <span className="font-bold text-emerald-700 block">
                                报名成功
                              </span>
                            )}
                          </td>

                          {/* 操作 */}
                          <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingParticipatedId(item.id);
                              }}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                isPendingInvite
                                  ? 'bg-[#0284C7] hover:bg-[#0369A1] text-white'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {isPendingInvite ? '处理邀请' : '查看详情'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🎉 报名成功（已晋级决赛）参赛确认回执单弹窗 */}
      {receiptModalTeam && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="font-extrabold text-sm sm:text-base">
                  🎉 全国网数智安全大赛 · 晋级决赛报名成功确认回执单
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalTeam(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const rStages = resolveTeamAuditStages(receiptModalTeam);
              const rSnap =
                receiptModalTeam.approvedSnapshot ||
                buildApprovedSnapshotFromCaptainTeam(receiptModalTeam);
              const rankNum = rStages.schoolRank || rSnap.schoolRank || 1;
              const receiptCode = `GWC-2026-${receiptModalTeam.id.slice(-4).toUpperCase()}-R${rankNum}`;

              return (
                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-emerald-700 font-bold">
                        电子回执核验编号：<span className="font-mono-num">{receiptCode}</span>
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-0.5">
                        {receiptModalTeam.teamName}（{receiptModalTeam.university}）
                      </div>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold font-mono-num self-start sm:self-center">
                      最终校内排名：第 {rankNum} 名
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block mb-0.5">参赛赛事</span>
                      <span className="font-bold text-slate-900">
                        {receiptModalTeam.competitionTitle}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">第一段：高校资格审核</span>
                      <span className="font-bold text-emerald-700">
                        已通过（{rStages.schoolAuditedAt || receiptModalTeam.updatedAt}）
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">第三段：秘书处终审</span>
                      <span className="font-bold text-emerald-700">
                        终审通过（{rStages.secretariatAuditedAt || rSnap.approvedAt}）
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">
                      晋级决赛正式成员名单（共 {rSnap.members.length} 人）
                    </div>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-2.5 px-3">姓名</th>
                            <th className="py-2.5 px-3">队内身份</th>
                            <th className="py-2.5 px-3">所属高校</th>
                            <th className="py-2.5 px-3">CTF角色分工</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {rSnap.members.map((m, idx) => (
                            <tr key={`${m.name}-${idx}`}>
                              <td className="py-2.5 px-3 font-bold text-slate-900">{m.name}</td>
                              <td className="py-2.5 px-3 text-slate-700">{m.role}</td>
                              <td className="py-2.5 px-3 text-slate-600">{m.university}</td>
                              <td className="py-2.5 px-3">
                                <CtfRoleBadges
                                  roles={m.ctfRoles}
                                  isAdvisor={m.role === '指导教师'}
                                  emptyText="-"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">
                      电子签章：全国网数智安全大赛组委会秘书处 · 终审有效
                    </span>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setReceiptModalTeam(null)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        关闭
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadReceiptFile(receiptModalTeam)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        立即下载回执单文件
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

