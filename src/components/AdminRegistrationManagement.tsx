import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Trophy,
  Users,
  Shield,
  Clock,
  FileSpreadsheet,
  Lock,
  Unlock,
  UserPlus,
  UserCheck,
  X,
  RefreshCw,
  Award,
  Sparkles,
  FileText,
} from 'lucide-react';
import {
  type CompetitionCatalogItem,
  type DivisionRecord,
  INITIAL_DIVISIONS,
  resolveUniversityLocationAndDivision,
} from '../data/competitionData';
import {
  type CaptainTeamRecord,
  type InvitedTeamPerson,
  type TwoStageAuditStatus,
  type PlatformDirectoryUser,
  type CtfRoleType,
  type AdvancementProofFile,
  type UniversityAdvancementSubmission,
  INITIAL_UNIVERSITY_ADVANCEMENT_SUBMISSIONS,
  CTF_ROLE_OPTIONS,
  formatCtfRolesText,
  CtfRoleBadges,
  CtfRoleSelectorDropdown,
  PLATFORM_DIRECTORY_USERS,
  TeamLogoAvatar,
  maskPhone,
  maskEmail,
  computeTeamConfirmProgress,
  resolveTeamAuditStages,
  resolveTeamCaptainContact,
  buildApprovedSnapshotFromCaptainTeam,
  AuditStageBadgeWithTooltip,
} from './TeamRegistrationSystem';
import type { AuditLogEntry } from './AuthAndUserCenter';

export type BackendAdminRoleType = 'super_admin' | 'school_admin' | 'secretariat_admin';

// ============================================================================
// 一、报名管理核心数据结构与状态计算函数
// ============================================================================
export type RegistrationConfigCalculatedStatus =
  | 'not_started' // 未开始
  | 'open' // 开启中
  | 'ended' // 已截止
  | 'disabled'; // 已停用

export interface EventRegistrationConfig {
  id: string;
  eventId: string; // 关联赛事 ID (CompetitionCatalogItem.id)
  regStartTime: string; // YYYY-MM-DD HH:mm:ss
  regEndTime: string; // YYYY-MM-DD HH:mm:ss
  earlyClosed: boolean; // 提前关闭开关（开启后立即停止报名，前端立刻显示“已关闭”）
  allowCrossSchool: boolean; // 允许跨校组队（默认关闭）
  includeAdvisor: boolean; // 包含指导教师（默认开启）
  minAdvisors?: number; // 指导教师最少人数（0-5人，可设为0人表示可邀请也可不邀请）
  maxAdvisors: number; // 指导教师人数上限（0-5人）
  minTeamSize: number; // 最少人数（含队长，1-5人）
  maxTeamSize: number; // 最多人数（1-20人；若为1人则前台隐藏邀请队员模块）
  isDisabled: boolean; // 是否已停用（当赛事从B切为A或C时置为true）
  schoolAuditEnabled?: boolean; // 开关1：高校审核阶段 [未开启 / 已开启]
  secretariatAuditEnabled?: boolean; // 开关2：秘书处审核阶段 [未开启 / 已开启]
  createdAt: string;
  updatedAt: string;
}

// 预置的【报名管理】配置表数据（覆盖：开启中、未开始、已截止、已关闭[提前关闭]、已停用[有队伍/无队伍]、单人赛、跨校赛等全部场景）
export const INITIAL_REGISTRATION_CONFIGS: EventRegistrationConfig[] = [
  {
    id: 'reg-cfg-main',
    eventId: 'comp-2026-main',
    regStartTime: '2026-10-15 09:00:00',
    regEndTime: '2026-11-15 23:59:59',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: false,
    schoolAuditEnabled: true,
    secretariatAuditEnabled: true,
    createdAt: '2026-09-28 09:30:00',
    updatedAt: '2026-10-28 09:00:00',
  },
  {
    id: 'reg-cfg-cloud',
    eventId: 'comp-2026-cloud-def',
    regStartTime: '2026-10-18 09:00:00',
    regEndTime: '2026-11-20 23:59:59',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: false,
    schoolAuditEnabled: true,
    secretariatAuditEnabled: false,
    createdAt: '2026-10-16 10:25:00',
    updatedAt: '2026-10-27 14:10:00',
  },
  {
    id: 'reg-cfg-solo',
    eventId: 'comp-2026-solo-vuln',
    regStartTime: '2026-10-22 09:00:00',
    regEndTime: '2026-11-18 23:59:59',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 1,
    minTeamSize: 1,
    maxTeamSize: 1, // 单人赛制：前台自动隐藏邀请队员模块
    isDisabled: false,
    schoolAuditEnabled: true,
    secretariatAuditEnabled: false,
    createdAt: '2026-10-18 15:05:00',
    updatedAt: '2026-10-26 16:00:00',
  },
  {
    id: 'reg-cfg-data',
    eventId: 'comp-2026-data',
    regStartTime: '2026-11-10 10:00:00',
    regEndTime: '2026-11-25 23:59:59',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 1,
    maxTeamSize: 4,
    isDisabled: false,
    schoolAuditEnabled: false,
    secretariatAuditEnabled: false,
    createdAt: '2026-10-08 14:15:00',
    updatedAt: '2026-10-20 11:00:00',
  },
  {
    id: 'reg-cfg-iot',
    eventId: 'comp-2026-iot-earlyclose',
    regStartTime: '2026-10-10 09:00:00',
    regEndTime: '2026-11-15 23:59:59',
    earlyClosed: true, // 开启“提前关闭”，状态显示为“已关闭（提前关闭）”
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: false,
    createdAt: '2026-10-05 09:10:00',
    updatedAt: '2026-10-27 18:00:00',
  },
  {
    id: 'reg-cfg-crypto',
    eventId: 'comp-2026-crypto-deadline',
    regStartTime: '2026-09-10 09:00:00',
    regEndTime: '2026-10-20 23:59:59', // 报名已自然截止，而赛事本身仍在进行中
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: false,
    createdAt: '2026-09-01 11:35:00',
    updatedAt: '2026-10-21 00:00:00',
  },
  {
    id: 'reg-cfg-ai',
    eventId: 'comp-2026-ai-pilot',
    regStartTime: '2026-06-01 09:00:00',
    regEndTime: '2026-07-10 23:59:59',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 1,
    minTeamSize: 1,
    maxTeamSize: 3,
    isDisabled: false,
    createdAt: '2026-05-18 11:00:00',
    updatedAt: '2026-07-11 00:00:00',
  },
  {
    id: 'reg-cfg-redblue',
    eventId: 'comp-2026-redblue-internal',
    regStartTime: '2026-10-16 09:00:00',
    regEndTime: '2026-11-18 23:59:59',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: false, // 不包含指导教师示例
    maxAdvisors: 1,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: false,
    createdAt: '2026-10-15 17:05:00',
    updatedAt: '2026-10-25 10:00:00',
  },
  {
    id: 'reg-cfg-ics',
    eventId: 'comp-2026-ics-special',
    regStartTime: '2026-10-20 09:00:00',
    regEndTime: '2026-11-08 23:59:59',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 1,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: true, // 已停用（含保留队伍数据，测试【删除】时的拦截保护）
    createdAt: '2026-10-12 16:40:00',
    updatedAt: '2026-10-25 15:20:00',
  },
  {
    id: 'reg-cfg-finsec',
    eventId: 'comp-2026-finsec-open',
    regStartTime: '2026-11-18 09:00:00',
    regEndTime: '2026-12-02 23:59:59',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: true, // 已停用（当前0支队伍，可用于直接测试无队伍时的【删除】操作）
    createdAt: '2026-10-20 13:15:00',
    updatedAt: '2026-10-26 09:40:00',
  },
  {
    id: 'reg-cfg-llm-redteam',
    eventId: 'comp-2026-llm-redteam',
    regStartTime: '2026-10-20 09:00:00',
    regEndTime: '2026-11-28 18:00:00',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: false,
    schoolAuditEnabled: true,
    secretariatAuditEnabled: true,
    createdAt: '2026-10-19 10:05:00',
    updatedAt: '2026-10-26 11:00:00',
  },
  {
    id: 'reg-cfg-telecom-antifraud',
    eventId: 'comp-2026-telecom-antifraud',
    regStartTime: '2026-10-24 09:00:00',
    regEndTime: '2026-11-26 18:00:00',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: false,
    schoolAuditEnabled: true,
    secretariatAuditEnabled: true,
    createdAt: '2026-10-21 14:35:00',
    updatedAt: '2026-10-26 15:00:00',
  },
  {
    id: 'reg-cfg-smartgrid-def',
    eventId: 'comp-2026-smartgrid-def',
    regStartTime: '2026-10-25 09:00:00',
    regEndTime: '2026-11-29 18:00:00',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: false,
    schoolAuditEnabled: true,
    secretariatAuditEnabled: true,
    createdAt: '2026-10-22 11:20:00',
    updatedAt: '2026-10-26 16:00:00',
  },
  {
    id: 'reg-cfg-openharmony-sec',
    eventId: 'comp-2026-openharmony-sec',
    regStartTime: '2026-10-26 09:00:00',
    regEndTime: '2026-11-30 23:59:59',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 1,
    maxTeamSize: 4,
    isDisabled: false,
    schoolAuditEnabled: true,
    secretariatAuditEnabled: true,
    createdAt: '2026-10-23 16:45:00',
    updatedAt: '2026-10-27 09:30:00',
  },
  {
    id: 'reg-cfg-satellite-sec',
    eventId: 'comp-2026-satellite-sec',
    regStartTime: '2026-10-22 09:00:00',
    regEndTime: '2026-11-27 18:00:00',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: false,
    schoolAuditEnabled: true,
    secretariatAuditEnabled: true,
    createdAt: '2026-10-20 09:25:00',
    updatedAt: '2026-10-26 10:15:00',
  },
  {
    id: 'reg-cfg-quantum-crypto',
    eventId: 'comp-2026-quantum-crypto',
    regStartTime: '2026-10-23 09:00:00',
    regEndTime: '2026-11-28 18:00:00',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 2,
    maxTeamSize: 4,
    isDisabled: false,
    schoolAuditEnabled: true,
    secretariatAuditEnabled: true,
    createdAt: '2026-10-22 15:15:00',
    updatedAt: '2026-10-26 17:00:00',
  },
];

// 当赛事选B（平台在线报名）且【报名管理】表中尚无该 Event_ID 时，自动插入一条默认状态为“未开始（未开启）”的报名数据
export function createDefaultRegistrationConfig(eventId: string): EventRegistrationConfig {
  const nowStr = '2026-10-28 12:00:00';
  return {
    id: `reg-cfg-${Date.now()}`,
    eventId,
    regStartTime: '2026-11-15 09:00:00', // 默认未来时间 -> 状态自动为“未开始（未开启）”
    regEndTime: '2026-12-15 23:59:59',
    earlyClosed: false,
    allowCrossSchool: false,
    includeAdvisor: true,
    maxAdvisors: 2,
    minTeamSize: 1,
    maxTeamSize: 4,
    isDisabled: false,
    createdAt: nowStr,
    updatedAt: nowStr,
  };
}

// 计算报名配置的实时状态（基准时间：2026-10-28 12:00:00）
export function computeRegistrationConfigStatus(
  config: EventRegistrationConfig | undefined,
  referenceDateTime = '2026-10-28 12:00:00'
): RegistrationConfigCalculatedStatus {
  if (!config) return 'not_started';
  if (config.isDisabled) return 'disabled';
  if (config.earlyClosed) return 'ended';

  const normStart = config.regStartTime.replace('T', ' ').trim();
  const normEnd = config.regEndTime.replace('T', ' ').trim();
  if (referenceDateTime < normStart) return 'not_started';
  if (referenceDateTime > normEnd) return 'ended';
  return 'open';
}

export function getRegistrationStatusMeta(
  status: RegistrationConfigCalculatedStatus,
  earlyClosed?: boolean
): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'not_started':
      return {
        label: '未开始',
        badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'open':
      return {
        label: '开启中',
        badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dotClass: 'bg-emerald-500 animate-pulse',
      };
    case 'ended':
      return {
        label: earlyClosed ? '已关闭（提前关闭）' : '已截止',
        badgeClass: 'text-slate-600 bg-slate-100 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    case 'disabled':
      return {
        label: '已停用',
        badgeClass: 'text-red-700 bg-red-50 border-red-200',
        dotClass: 'bg-red-500',
      };
  }
}

// 身份证号脱敏辅助函数（根据姓名/手机号生成确定性的脱敏身份证号）
export function getMaskedIdCard(seedStr: string): string {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) % 10000;
  }
  const suffix = String(1000 + (hash % 8999));
  return `110108********${suffix}`;
}

// 完整身份证号生成/解析辅助函数（用于最终参赛队伍清单 Excel 全量详细信息导出）
export function getFullIdCard(seedStr: string, role: 'captain' | 'member' | 'advisor' = 'member'): string {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) % 10000;
  }
  const suffix = String(1000 + (hash % 8999));
  const birthYear = role === 'advisor' ? '1984' : '2004';
  const birthMonth = String(1 + (hash % 12)).padStart(2, '0');
  const birthDay = String(1 + ((hash >> 2) % 28)).padStart(2, '0');
  return `110108${birthYear}${birthMonth}${birthDay}${suffix}`;
}

export function getPersonGender(name: string): '男' | '女' {
  if (name.includes('语桐') || name.includes('雪') || name.includes('婷')) return '女';
  return '男';
}

export function getCertSnapshotLabel(role: 'captain' | 'member' | 'advisor', isVerified: boolean): string {
  if (!isVerified) return '未完成实名/学籍核验（管理员特批加入）';
  if (role === 'advisor') return '银联三要素实名通过 / 教师资格证人工审核通过';
  return '银联三要素实名通过 / 学信网在线验证码核验通过';
}

// 将平台队伍状态映射为后台审核状态（未审核 / 通过 / 不通过）
export type AdminAuditStatus = 'unreviewed' | 'approved' | 'rejected';

export function mapTeamStatusToAdminAudit(teamStatus: CaptainTeamRecord['status']): {
  auditStatus: AdminAuditStatus;
  label: string;
  badgeClass: string;
} {
  if (teamStatus === 'approved') {
    return {
      auditStatus: 'approved',
      label: '通过',
      badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  }
  if (teamStatus === 'rejected') {
    return {
      auditStatus: 'rejected',
      label: '不通过',
      badgeClass: 'text-red-700 bg-red-50 border-red-200',
    };
  }
  return {
    auditStatus: 'unreviewed',
    label: teamStatus === 'pending_review' ? '未审核（待审）' : teamStatus === 'inviting' ? '未审核（邀请中）' : '未审核（组建中）',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
  };
}

// ============================================================================
// 二、后台【报名管理】主组件（含：1.报名列表页  2.新增/编辑配置页  3.队伍数据管理业务层）
// ============================================================================
interface AdminRegistrationManagementProps {
  competitions: CompetitionCatalogItem[];
  registrationConfigs: EventRegistrationConfig[];
  onUpdateRegistrationConfigs: (next: EventRegistrationConfig[]) => void;
  captainTeams: CaptainTeamRecord[];
  onUpdateCaptainTeams: (next: CaptainTeamRecord[]) => void;
  platformUsers?: PlatformDirectoryUser[];
  institutions?: Array<{
    name: string;
    location?: string;
    province?: string;
    city?: string;
    district?: string;
  }>;
  divisions?: DivisionRecord[];
  adminName: string;
  adminRole?: BackendAdminRoleType;
  adminInstitutionId?: string;
  adminInstitutionName?: string;
  onAddAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'time'>) => void;
  onSendSystemNotification: (title: string, desc: string) => void;
  onToast: (msg: string) => void;
}

export const AdminRegistrationManagement: React.FC<AdminRegistrationManagementProps> = ({
  competitions,
  registrationConfigs,
  onUpdateRegistrationConfigs,
  captainTeams,
  onUpdateCaptainTeams,
  platformUsers = PLATFORM_DIRECTORY_USERS,
  institutions,
  divisions = INITIAL_DIVISIONS,
  adminName,
  adminRole = 'super_admin',
  adminInstitutionId = 'inst-3',
  adminInstitutionName = '北京航空航天大学',
  onAddAuditLog,
  onSendSystemNotification,
  onToast,
}) => {
  // 子视图：'reg-list' (报名列表) | 'reg-form' (新增/编辑报名配置) | 'team-list' (队伍数据管理) | 'team-detail' (只读详情) | 'team-edit' (管理员特权后门编辑)
  const [subView, setSubView] = useState<
    'reg-list' | 'reg-form' | 'team-list' | 'team-detail' | 'team-edit'
  >('reg-list');

  // 当高校管理员或秘书处管理员点击【查看报名】遇到对应审核阶段未开启时的提示弹窗
  const [auditNotOpenBlockPrompt, setAuditNotOpenBlockPrompt] = useState<{
    eventTitle: string;
    message: string;
  } | null>(null);

  // --- 1. 报名列表页搜索与删除弹窗状态 ---
  const [listSearchEventName, setListSearchEventName] = useState('');
  const [listStatusFilter, setListStatusFilter] = useState<
    'all' | RegistrationConfigCalculatedStatus
  >('all');
  const [deleteConfigConfirmTarget, setDeleteConfigConfirmTarget] =
    useState<EventRegistrationConfig | null>(null);

  // --- 2. 新增/编辑报名配置页表单状态 ---
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [cfgEventId, setCfgEventId] = useState('');
  const [cfgStartTime, setCfgStartTime] = useState('2026-10-15T09:00:00');
  const [cfgEndTime, setCfgEndTime] = useState('2026-11-25T23:59:59');
  const [cfgEarlyClosed, setCfgEarlyClosed] = useState(false);
  const [cfgAllowCrossSchool, setCfgAllowCrossSchool] = useState(false);
  const [cfgIncludeAdvisor, setCfgIncludeAdvisor] = useState(true);
  const [cfgMinAdvisors, setCfgMinAdvisors] = useState(0);
  const [cfgMaxAdvisors, setCfgMaxAdvisors] = useState(2);
  const [cfgMinTeamSize, setCfgMinTeamSize] = useState(1);
  const [cfgMaxTeamSize, setCfgMaxTeamSize] = useState(4);
  const [cfgFormError, setCfgFormError] = useState<string | null>(null);

  // --- 3. 队伍数据管理（业务层）状态：分为【高校资格审核】、【晋级名单审核（秘书处终审）】、【最终参赛队伍清单】三大纯净Tab ---
  const [activeEventIdForTeams, setActiveEventIdForTeams] = useState<string>(
    INITIAL_REGISTRATION_CONFIGS[0].eventId
  );
  const [activeAuditTab, setActiveAuditTab] = useState<
    'school' | 'secretariat' | 'final_roster'
  >('school');

  // 高校晋级名单提报聚合表（秘书处以“高校维度”审核）
  const [universitySubmissions, setUniversitySubmissions] = useState<
    UniversityAdvancementSubmission[]
  >(INITIAL_UNIVERSITY_ADVANCEMENT_SUBMISSIONS);

  // Tab 1 高校资格审核：当前操作的高校上下文（高校管理员强制锁定本校；超管/秘书处可切换高校视角体验【申报晋级队伍】）
  const [activeSchoolContextInTab1, setActiveSchoolContextInTab1] = useState<string>(
    adminInstitutionName || '北京航空航天大学'
  );

  // 【晋级名单提报弹窗 (AdvancementSubmissionModal)】核心状态（不设晋级名额上限）
  const [advancementModalOpen, setAdvancementModalOpen] = useState(false);
  const [advancementModalUniversity, setAdvancementModalUniversity] = useState<string>(
    adminInstitutionName || '北京航空航天大学'
  );
  const [advancementPoolTrackFilter, setAdvancementPoolTrackFilter] = useState<string>('all');
  const [advancementPoolCheckedIds, setAdvancementPoolCheckedIds] = useState<string[]>([]);
  const [advancementSelectedTeamIds, setAdvancementSelectedTeamIds] = useState<string[]>([]);
  const [advancementProofFiles, setAdvancementProofFiles] = useState<AdvancementProofFile[]>([]);
  const [advancementDragIndex, setAdvancementDragIndex] = useState<number | null>(null);
  const [advancementError, setAdvancementError] = useState<string | null>(null);

  // Tab 2 秘书处审核（高校维度晋级名单审核）筛选与弹窗状态
  const [secFilterStatus, setSecFilterStatus] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');
  const [secFilterKeyword, setSecFilterKeyword] = useState<string>('');
  const [activeUniversitySubmissionDetail, setActiveUniversitySubmissionDetail] =
    useState<UniversityAdvancementSubmission | null>(null);
  // Tab 2 查看详情弹窗内点击【查看队伍详情】弹出的队伍详情弹窗 ID
  const [modalTeamDetailId, setModalTeamDetailId] = useState<string | null>(null);
  const [secBatchAuditModal, setSecBatchAuditModal] = useState<{
    submission: UniversityAdvancementSubmission;
    decision: 'approve' | 'reject';
  } | null>(null);
  const [secBatchRejectReason, setSecBatchRejectReason] = useState<string>('');
  const [secBatchAuditError, setSecBatchAuditError] = useState<string | null>(null);
  const [previewProofFileModal, setPreviewProofFileModal] =
    useState<AdvancementProofFile | null>(null);

  // Tab 3 最终参赛队伍清单（只读大名单）筛选状态
  const [finalRosterScopeEvent, setFinalRosterScopeEvent] = useState<'current' | 'all'>('current');
  const [finalRosterTrackFilter, setFinalRosterTrackFilter] = useState<string>('all');
  const [finalRosterSchoolFilter, setFinalRosterSchoolFilter] = useState<string>('');
  const [finalRosterKeyword, setFinalRosterKeyword] = useState<string>('');

  // 筛选表单状态（输入态）与生效筛选状态（点击【查询】后生效）
  const [filterKeywordInput, setFilterKeywordInput] = useState('');
  const [filterSchoolInput, setFilterSchoolInput] = useState('');
  const [filterTrackInput, setFilterTrackInput] = useState('all');
  const [filterAuditStatusInput, setFilterAuditStatusInput] = useState<
    'all' | TwoStageAuditStatus
  >('all');
  const [filterDateStartInput, setFilterDateStartInput] = useState('');
  const [filterDateEndInput, setFilterDateEndInput] = useState('');

  const [appliedTeamFilters, setAppliedTeamFilters] = useState({
    keyword: '',
    school: '',
    track: 'all',
    auditStatus: 'all' as 'all' | TwoStageAuditStatus,
    dateStart: '',
    dateEnd: '',
  });

  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  // 单条/批量审核弹窗状态（Tab 1 高校资格审核使用）
  const [auditModalState, setAuditModalState] = useState<{
    mode: 'single' | 'batch';
    stage: 'school' | 'secretariat';
    teamIds: string[];
    decision: 'approve' | 'reject';
  } | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [auditError, setAuditError] = useState<string | null>(null);

  // 导出 Excel 预览弹窗与 >5000条异步下载中心状态
  const [exportPreviewModal, setExportPreviewModal] = useState<{
    sheetTab: 'sheet1' | 'sheet2';
    teams: CaptainTeamRecord[];
  } | null>(null);
  const [asyncDownloadTasks, setAsyncDownloadTasks] = useState<
    {
      id: string;
      fileName: string;
      rowCount: number;
      status: 'generating' | 'ready';
      createdAt: string;
    }[]
  >([]);
  const [downloadCenterOpen, setDownloadCenterOpen] = useState(false);

  // 导入线下数据弹窗状态
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importErrorReport, setImportErrorReport] = useState<
    { row: number; teamName: string; field: string; reason: string }[] | null
  >(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // --- 4. 编辑队伍（管理员后门逻辑）状态 ---
  const [editTeamDraft, setEditTeamDraft] = useState<CaptainTeamRecord | null>(null);
  const [editTeamOriginalSnapshot, setEditTeamOriginalSnapshot] = useState<string>('');
  const [removeCaptainModalOpen, setRemoveCaptainModalOpen] = useState(false);
  const [selectedNewCaptainMemberId, setSelectedNewCaptainMemberId] = useState<string>('');
  const [newCaptainSearchQuery, setNewCaptainSearchQuery] = useState<string>('');
  const [newCaptainSearchError, setNewCaptainSearchError] = useState<string | null>(null);
  const [backdoorSearchQuery, setBackdoorSearchQuery] = useState('');
  const [backdoorAddRole, setBackdoorAddRole] = useState<'member' | 'advisor'>('member');
  const [backdoorAddCtfRoles, setBackdoorAddCtfRoles] = useState<CtfRoleType[]>([]);
  const [backdoorRolePopoverId, setBackdoorRolePopoverId] = useState<string | null>(null);
  const [backdoorInterceptAlert, setBackdoorInterceptAlert] = useState<{
    candidate: (typeof PLATFORM_DIRECTORY_USERS)[number];
    role: 'member' | 'advisor';
    reasons: string[];
  } | null>(null);
  const [backdoorForceOverrideChecked, setBackdoorForceOverrideChecked] = useState(false);
  const [backdoorFeedback, setBackdoorFeedback] = useState<string | null>(null);

  // 辅助获取赛事对象
  const getCompById = (eventId: string) =>
    competitions.find((c) => c.id === eventId);

  // 统计某个赛事下的实时已报名队伍数与已报名总人数（仅统计已提交进入高校审核流程的队伍，不含组建中/邀请中；若为高校管理员则仅统计本校队伍）
  const getEventTeamStats = (eventId: string) => {
    const eventTeams = captainTeams.filter(
      (t) =>
        t.competitionId === eventId &&
        t.status !== 'draft' &&
        t.status !== 'inviting' &&
        resolveTeamAuditStages(t).schoolStatus !== 'none' &&
        (adminRole === 'school_admin' ? t.university === adminInstitutionName : true)
    );
    const teamCount = eventTeams.length;
    const personCount = eventTeams.reduce(
      (sum, t) => sum + 1 + t.members.length,
      0
    );
    return { teamCount, personCount };
  };

  // 过滤后的【报名列表】
  const filteredRegConfigs = useMemo(() => {
    return registrationConfigs.filter((cfg) => {
      const comp = getCompById(cfg.eventId);
      const title = comp?.title || cfg.eventId;
      const calcStatus = computeRegistrationConfigStatus(cfg);

      if (listStatusFilter !== 'all' && calcStatus !== listStatusFilter) {
        return false;
      }
      if (listSearchEventName.trim()) {
        return title.toLowerCase().includes(listSearchEventName.trim().toLowerCase());
      }
      return true;
    });
  }, [registrationConfigs, competitions, listStatusFilter, listSearchEventName]);

  // 可供“新增报名配置”关联的赛事（展示尚未生成过报名配置数据的所有赛事）
  const availableEventsForNewConfig = useMemo(() => {
    const existingEventIds = new Set(registrationConfigs.map((r) => r.eventId));
    return competitions.filter((c) => !existingEventIds.has(c.id));
  }, [competitions, registrationConfigs]);

  // 打开【新增报名配置】
  const handleOpenNewConfigForm = () => {
    setEditingConfigId(null);
    setCfgEventId(availableEventsForNewConfig[0]?.id || '');
    setCfgStartTime('2026-10-28T09:00:00');
    setCfgEndTime('2026-11-30T23:59:59');
    setCfgEarlyClosed(false);
    setCfgAllowCrossSchool(false);
    setCfgIncludeAdvisor(true);
    setCfgMinAdvisors(0);
    setCfgMaxAdvisors(2);
    setCfgMinTeamSize(1);
    setCfgMaxTeamSize(4);
    setCfgFormError(null);
    setSubView('reg-form');
  };

  // 打开【编辑报名配置】
  const handleOpenEditConfigForm = (cfg: EventRegistrationConfig) => {
    setEditingConfigId(cfg.id);
    setCfgEventId(cfg.eventId);
    setCfgStartTime(cfg.regStartTime.replace(' ', 'T'));
    setCfgEndTime(cfg.regEndTime.replace(' ', 'T'));
    setCfgEarlyClosed(cfg.earlyClosed);
    setCfgAllowCrossSchool(false);
    setCfgIncludeAdvisor(cfg.includeAdvisor);
    setCfgMinAdvisors(cfg.minAdvisors ?? 0);
    setCfgMaxAdvisors(cfg.maxAdvisors);
    setCfgMinTeamSize(cfg.minTeamSize);
    setCfgMaxTeamSize(cfg.maxTeamSize);
    setCfgFormError(null);
    setSubView('reg-form');
  };

  // 保存【报名配置】
  const handleSaveConfigForm = (e: React.FormEvent) => {
    e.preventDefault();
    setCfgFormError(null);

    if (!cfgEventId) {
      setCfgFormError('请选择关联赛事');
      return;
    }
    if (!cfgStartTime || !cfgEndTime) {
      setCfgFormError('请完整选择报名开始时间与截止时间（精确到时分秒）');
      return;
    }
    const normStart = cfgStartTime.replace('T', ' ');
    const normEnd = cfgEndTime.replace('T', ' ');
    if (normStart >= normEnd) {
      setCfgFormError('报名截止时间必须晚于报名开始时间');
      return;
    }
    if (cfgIncludeAdvisor) {
      if (cfgMinAdvisors < 0 || cfgMinAdvisors > 5) {
        setCfgFormError('指导教师最少人数须限制在 0 - 5 人之间');
        return;
      }
      if (cfgMaxAdvisors < 0 || cfgMaxAdvisors > 5) {
        setCfgFormError('指导教师最多人数须限制在 0 - 5 人之间');
        return;
      }
      if (cfgMinAdvisors > cfgMaxAdvisors) {
        setCfgFormError('指导教师最少人数不能大于最多人数');
        return;
      }
    }
    if (cfgMinTeamSize < 1 || cfgMinTeamSize > 5) {
      setCfgFormError('队伍最少人数（含队长）须限制在 1 - 5 人之间');
      return;
    }
    if (cfgMaxTeamSize < 1 || cfgMaxTeamSize > 20) {
      setCfgFormError('队伍最多人数须限制在 1 - 20 人之间');
      return;
    }
    if (cfgMinTeamSize > cfgMaxTeamSize) {
      setCfgFormError('队伍最少人数不能大于最多人数');
      return;
    }

    const formattedStart = normStart.length === 16 ? `${normStart}:00` : normStart;
    const formattedEnd = normEnd.length === 16 ? `${normEnd}:00` : normEnd;
    const nowStr = '2026-10-28 12:05:00';
    const targetComp = getCompById(cfgEventId);

    if (editingConfigId) {
      const updated = registrationConfigs.map((item) =>
        item.id === editingConfigId
          ? {
              ...item,
              regStartTime: formattedStart,
              regEndTime: formattedEnd,
              earlyClosed: cfgEarlyClosed,
              allowCrossSchool: false,
              includeAdvisor: cfgIncludeAdvisor,
              minAdvisors: cfgIncludeAdvisor ? cfgMinAdvisors : 0,
              maxAdvisors: cfgIncludeAdvisor ? cfgMaxAdvisors : 0,
              minTeamSize: cfgMinTeamSize,
              maxTeamSize: cfgMaxTeamSize,
              updatedAt: nowStr,
            }
          : item
      );
      onUpdateRegistrationConfigs(updated);
      onAddAuditLog({
        operator: adminName,
        ip: '202.112.128.45',
        location: '北京市海淀区',
        device: 'Admin Console',
        action: `修改报名配置（${targetComp?.title || cfgEventId}）`,
        result: '成功',
        detail: `起止：${formattedStart} ~ ${formattedEnd}，提前关闭：${cfgEarlyClosed ? '开启' : '关闭'}，人数：${cfgMinTeamSize}-${cfgMaxTeamSize}人，指导教师：${cfgIncludeAdvisor ? `${cfgMinAdvisors}-${cfgMaxAdvisors}人` : '关闭'}`,
      });
      onToast(`已保存《${targetComp?.title || ''}》的报名规则配置，前台详情页与报名表单已实时生效！`);
    } else {
      const newCfg: EventRegistrationConfig = {
        id: `reg-cfg-${Date.now()}`,
        eventId: cfgEventId,
        regStartTime: formattedStart,
        regEndTime: formattedEnd,
        earlyClosed: cfgEarlyClosed,
        allowCrossSchool: false,
        includeAdvisor: cfgIncludeAdvisor,
        minAdvisors: cfgIncludeAdvisor ? cfgMinAdvisors : 0,
        maxAdvisors: cfgIncludeAdvisor ? cfgMaxAdvisors : 0,
        minTeamSize: cfgMinTeamSize,
        maxTeamSize: cfgMaxTeamSize,
        isDisabled: false,
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      onUpdateRegistrationConfigs([newCfg, ...registrationConfigs]);
      onAddAuditLog({
        operator: adminName,
        ip: '202.112.128.45',
        location: '北京市海淀区',
        device: 'Admin Console',
        action: `新增报名配置（${targetComp?.title || cfgEventId}）`,
        result: '成功',
        detail: `起止：${formattedStart} ~ ${formattedEnd}，人数：${cfgMinTeamSize}-${cfgMaxTeamSize}人`,
      });
      onToast(`已成功新增《${targetComp?.title || ''}》的报名配置！`);
    }

    setSubView('reg-list');
  };

  // 彻底删除“已停用”的报名配置（二次强确认后调用，写审计日志）
  const handleConfirmDeleteDisabledConfig = () => {
    if (!deleteConfigConfirmTarget) return;
    const comp = getCompById(deleteConfigConfirmTarget.eventId);
    const nextConfigs = registrationConfigs.filter(
      (c) => c.id !== deleteConfigConfirmTarget.id
    );
    onUpdateRegistrationConfigs(nextConfigs);
    onAddAuditLog({
      operator: adminName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: `彻底删除已停用报名配置（Event_ID: ${deleteConfigConfirmTarget.eventId}）`,
      result: '成功',
      detail: `管理员 ${adminName} 二次强确认彻底删除了《${comp?.title || deleteConfigConfirmTarget.eventId}》的报名配置数据`,
    });
    setDeleteConfigConfirmTarget(null);
    onToast(`已彻底删除《${comp?.title || ''}》的报名数据，并已写入系统审计日志！`);
  };

  // 进入某赛事的【队伍数据管理（业务层）】
  const handleEnterTeamDataManagement = (eventId: string) => {
    const targetCfg = registrationConfigs.find((c) => c.eventId === eventId);
    const targetComp = getCompById(eventId);
    const isSchoolOpen = targetCfg ? targetCfg.schoolAuditEnabled !== false : true;
    const isSecOpen = targetCfg ? targetCfg.secretariatAuditEnabled !== false : true;

    // 联动逻辑1：当“高校审核”未开启时，高校管理员点击【查看报名】，提示未开启，无法进入列表
    if (adminRole === 'school_admin' && !isSchoolOpen) {
      setAuditNotOpenBlockPrompt({
        eventTitle: targetComp?.title || eventId,
        message: '当前赛事高校审核暂未开启，请等待组委会通知',
      });
      return;
    }

    // 联动逻辑2：当“秘书处审核”未开启时，秘书处管理员点击进入，提示未开启，无法进入列表
    if (adminRole === 'secretariat_admin' && (!isSchoolOpen || !isSecOpen)) {
      setAuditNotOpenBlockPrompt({
        eventTitle: targetComp?.title || eventId,
        message: '当前赛事秘书处审核暂未开启，请等待组委会通知',
      });
      return;
    }

    setActiveEventIdForTeams(eventId);
    setActiveAuditTab(adminRole === 'secretariat_admin' ? 'secretariat' : 'school');
    setActiveSchoolContextInTab1(adminInstitutionName || '北京航空航天大学');
    setFilterKeywordInput('');
    setFilterSchoolInput(adminRole === 'school_admin' ? adminInstitutionName : '');
    setFilterTrackInput('all');
    setFilterAuditStatusInput('all');
    setFilterDateStartInput('');
    setFilterDateEndInput('');
    setAppliedTeamFilters({
      keyword: '',
      school: adminRole === 'school_admin' ? adminInstitutionName : '',
      track: 'all',
      auditStatus: 'all',
      dateStart: '',
      dateEnd: '',
    });
    setSelectedTeamIds([]);
    setSubView('team-list');
  };

  // 当前队伍数据管理所关联的赛事与报名配置
  const activeEventForTeams = getCompById(activeEventIdForTeams) || competitions[0];
  const activeConfigForTeams = registrationConfigs.find(
    (c) => c.eventId === activeEventIdForTeams
  );
  const isSchoolStageOpen = activeConfigForTeams
    ? activeConfigForTeams.schoolAuditEnabled !== false
    : true;
  const isSecretariatStageOpen = activeConfigForTeams
    ? activeConfigForTeams.secretariatAuditEnabled !== false
    : true;

  // 切换全局/赛事审核阶段开关（仅组委会超级管理员可操作）
  const handleToggleAuditStageSwitch = (stage: 'school' | 'secretariat') => {
    if (adminRole !== 'super_admin' || !activeConfigForTeams) return;
    const nextVal =
      stage === 'school' ? !isSchoolStageOpen : !isSecretariatStageOpen;
    const nowStr = '2026-10-28 12:20:00';

    const updated = registrationConfigs.map((cfg) => {
      if (cfg.id !== activeConfigForTeams.id) return cfg;
      if (stage === 'school') {
        return {
          ...cfg,
          schoolAuditEnabled: nextVal,
          updatedAt: nowStr,
        };
      }
      return {
        ...cfg,
        secretariatAuditEnabled: nextVal,
        updatedAt: nowStr,
      };
    });

    onUpdateRegistrationConfigs(updated);
    const stageLabel = stage === 'school' ? '高校审核阶段' : '秘书处审核阶段';
    onAddAuditLog({
      operator: adminName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: `切换审核开关：${stageLabel} -> ${nextVal ? '已开启' : '未开启'}`,
      result: '成功',
      detail: `赛事《${activeEventForTeams.title}》${stageLabel}已设为【${
        nextVal ? '已开启' : '未开启'
      }】（关闭时前台已有状态不倒退，后台暂停新审核操作）`,
    });
    onToast(
      `已将《${activeEventForTeams.title}》的【${stageLabel}】设为：${
        nextVal ? '已开启' : '未开启'
      }`
    );
  };

  // 统计当前赛事在三大纯净 TAB（Tab1 高校资格审核 / Tab2 晋级名单审核 / Tab3 最终参赛队伍清单）下的数量
  const eventAuditTabCounts = useMemo(() => {
    const eventTeams = captainTeams.filter(
      (t) =>
        t.competitionId === activeEventIdForTeams &&
        t.status !== 'draft' &&
        t.status !== 'inviting' &&
        resolveTeamAuditStages(t).schoolStatus !== 'none' &&
        (adminRole === 'school_admin' ? t.university === adminInstitutionName : true)
    );
    const schoolTabTotal = eventTeams.length;
    const schoolPendingCount = eventTeams.filter(
      (t) => resolveTeamAuditStages(t).schoolStatus === 'pending'
    ).length;

    // Tab 2 秘书处终审：按高校维度统计已提报（不含已撤回）的晋级名单数量
    const eventUnivSubs = universitySubmissions.filter(
      (sub) => sub.competitionId === activeEventIdForTeams && sub.status !== 'withdrawn'
    );
    const secretariatUnivTotal = eventUnivSubs.length;
    const secretariatUnivPendingCount = eventUnivSubs.filter(
      (sub) => sub.status === 'pending'
    ).length;

    // Tab 3 最终参赛队伍清单：统计秘书处终审已通过（regStatusKey === 'approved'）的最终晋级队伍数
    const finalRosterCurrentEventCount = captainTeams.filter(
      (t) =>
        t.competitionId === activeEventIdForTeams &&
        resolveTeamAuditStages(t).regStatusKey === 'approved' &&
        (adminRole === 'school_admin' ? t.university === adminInstitutionName : true)
    ).length;
    const finalRosterAllEventsCount = captainTeams.filter(
      (t) =>
        resolveTeamAuditStages(t).regStatusKey === 'approved' &&
        (adminRole === 'school_admin' ? t.university === adminInstitutionName : true)
    ).length;

    return {
      schoolTabTotal,
      schoolPendingCount,
      secretariatUnivTotal,
      secretariatUnivPendingCount,
      finalRosterCurrentEventCount,
      finalRosterAllEventsCount,
    };
  }, [
    captainTeams,
    universitySubmissions,
    activeEventIdForTeams,
    adminRole,
    adminInstitutionName,
  ]);

  // Tab 1 高校资格审核：根据筛选条件过滤出的队伍列表
  const filteredEventTeams = useMemo(() => {
    return captainTeams.filter((team) => {
      if (team.competitionId !== activeEventIdForTeams) return false;

      // 高校管理员数据权限隔离：强制 WHERE 院校ID = 当前登录用户的院校ID，只能看到本校队伍
      if (adminRole === 'school_admin' && team.university !== adminInstitutionName) {
        return false;
      }

      const stages = resolveTeamAuditStages(team);

      // 只有提交之后的报名信息才会进入高校资格审核流程，排除组建中和邀请中的队伍
      if (
        team.status === 'draft' ||
        team.status === 'inviting' ||
        stages.schoolStatus === 'none'
      ) {
        return false;
      }

      // 1. 关键字（队伍名称 / 队长姓名 / 队长手机号 单框多匹配）
      if (appliedTeamFilters.keyword.trim()) {
        const kw = appliedTeamFilters.keyword.trim().toLowerCase();
        const captainContact = resolveTeamCaptainContact(team, platformUsers);
        const matchTeamName = team.teamName.toLowerCase().includes(kw);
        const matchCaptain = team.captainName.toLowerCase().includes(kw);
        const matchPhone = captainContact.phone.includes(kw);
        if (!matchTeamName && !matchCaptain && !matchPhone) return false;
      }

      // 2. 所属院校（模糊匹配）
      if (appliedTeamFilters.school.trim()) {
        const sc = appliedTeamFilters.school.trim().toLowerCase();
        if (!team.university.toLowerCase().includes(sc)) return false;
      }

      // 3. 所选赛道
      if (
        appliedTeamFilters.track !== 'all' &&
        team.subTrackName !== appliedTeamFilters.track
      ) {
        return false;
      }

      // 4. 高校资格审核状态（全部 / 待审核 / 已通过 / 已驳回）
      if (appliedTeamFilters.auditStatus !== 'all') {
        if (stages.schoolStatus !== appliedTeamFilters.auditStatus) return false;
      }

      // 5. 报名时间范围
      const teamDate = team.createdAt.slice(0, 10);
      if (appliedTeamFilters.dateStart && teamDate < appliedTeamFilters.dateStart) {
        return false;
      }
      if (appliedTeamFilters.dateEnd && teamDate > appliedTeamFilters.dateEnd) {
        return false;
      }

      return true;
    });
  }, [
    captainTeams,
    activeEventIdForTeams,
    appliedTeamFilters,
    adminRole,
    adminInstitutionName,
    platformUsers,
  ]);

  // 当前赛事下拥有队伍的高校列表（供超级管理员在 Tab 1 切换视角体验各校【申报晋级队伍】）
  const availableSchoolsInCurrentEvent = useMemo(() => {
    const set = new Set<string>(['北京航空航天大学', '清华大学', '上海交通大学', '浙江大学']);
    captainTeams.forEach((t) => {
      if (t.competitionId === activeEventIdForTeams && t.university) {
        set.add(t.university);
      }
    });
    return Array.from(set);
  }, [captainTeams, activeEventIdForTeams]);

  // 当前在 Tab 1 选中的高校（高校管理员固定为 adminInstitutionName）
  const targetUniversityForAdvancement =
    adminRole === 'school_admin'
      ? adminInstitutionName
      : activeSchoolContextInTab1 || '北京航空航天大学';

  // 当前目标高校在当前赛事下的晋级提报单记录（若有）
  const currentSchoolSubmission = useMemo(() => {
    return (
      universitySubmissions.find(
        (sub) =>
          sub.competitionId === activeEventIdForTeams &&
          sub.university === targetUniversityForAdvancement
      ) || null
    );
  }, [universitySubmissions, activeEventIdForTeams, targetUniversityForAdvancement]);

  // 当前目标高校在当前赛事下“高校资格审核已通过”的所有候选队伍
  const currentSchoolApprovedTeams = useMemo(() => {
    return captainTeams.filter(
      (t) =>
        t.competitionId === activeEventIdForTeams &&
        t.university === targetUniversityForAdvancement &&
        t.status !== 'draft' &&
        t.status !== 'inviting' &&
        resolveTeamAuditStages(t).schoolStatus === 'approved'
    );
  }, [captainTeams, activeEventIdForTeams, targetUniversityForAdvancement]);

  // 打开【晋级名单提报弹窗】（支持驳回与撤回后的数据完整回显：原勾选队伍、校内排名顺序、已上传成绩证明附件）
  const handleOpenAdvancementModal = (universityName?: string) => {
    const univ =
      adminRole === 'school_admin'
        ? adminInstitutionName
        : universityName || targetUniversityForAdvancement;
    setAdvancementModalUniversity(univ);
    setAdvancementPoolTrackFilter('all');
    setAdvancementPoolCheckedIds([]);
    setAdvancementError(null);

    const existingSub = universitySubmissions.find(
      (sub) => sub.competitionId === activeEventIdForTeams && sub.university === univ
    );

    const univApprovedTeams = captainTeams.filter(
      (t) =>
        t.competitionId === activeEventIdForTeams &&
        t.university === univ &&
        t.status !== 'draft' &&
        t.status !== 'inviting' &&
        resolveTeamAuditStages(t).schoolStatus === 'approved'
    );
    const validApprovedIds = new Set(univApprovedTeams.map((t) => t.id));

    if (existingSub && existingSub.teamIds.length > 0) {
      // 驳回 / 撤回 / 已提报状态下重新打开：100% 回显之前选中的队伍顺序及已上传的证明材料
      const echoedIds = existingSub.teamIds.filter((id) => validApprovedIds.has(id));
      setAdvancementSelectedTeamIds(echoedIds);
      setAdvancementProofFiles([...existingSub.proofFiles]);
    } else {
      // 从队伍自身的 advancementStatus 回显（若存在已排名的队伍）
      const rankedTeams = univApprovedTeams
        .filter(
          (t) =>
            t.advancementStatus === 'pending_secretariat' ||
            t.advancementStatus === 'secretariat_rejected' ||
            t.advancementStatus === 'advanced'
        )
        .sort((a, b) => (a.schoolRank || 99) - (b.schoolRank || 99));

      if (rankedTeams.length > 0) {
        setAdvancementSelectedTeamIds(rankedTeams.map((t) => t.id));
        setAdvancementProofFiles([
          {
            id: `proof-default-${Date.now()}`,
            name: `${univ}_2026校内选拔赛官方成绩单与排名公示(教务盖章).pdf`,
            size: '2.35 MB',
            type: 'pdf',
            uploadedAt: '2026-10-28 09:30:00',
          },
        ]);
      } else {
        setAdvancementSelectedTeamIds([]);
        setAdvancementProofFiles([]);
      }
    }

    setAdvancementModalOpen(true);
  };

  // 【晋级名单提报弹窗】内：手动调整某支已选队伍的校内排名序号（1, 2, 3...）
  const handleManualRankInputChange = (teamId: string, targetRankOneBased: number) => {
    setAdvancementSelectedTeamIds((prev) => {
      const currentIndex = prev.indexOf(teamId);
      if (currentIndex === -1) return prev;
      const clampedIndex = Math.max(
        0,
        Math.min(prev.length - 1, targetRankOneBased - 1)
      );
      if (clampedIndex === currentIndex) return prev;
      const next = [...prev];
      next.splice(currentIndex, 1);
      next.splice(clampedIndex, 0, teamId);
      return next;
    });
  };

  // 【晋级名单提报弹窗】内：上下移动某支队伍的排名
  const handleMoveSelectedTeamRank = (index: number, direction: 'up' | 'down') => {
    setAdvancementSelectedTeamIds((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // 【晋级名单提报弹窗】内：上传校赛成绩单/证明材料（支持 PDF / Excel / 图片）
  const handleUploadAdvancementProofFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setAdvancementError(null);
    const added: AdvancementProofFile[] = Array.from(fileList).map((f, i) => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      const fileType: 'pdf' | 'excel' | 'image' =
        ext === 'xls' || ext === 'xlsx' || ext === 'csv'
          ? 'excel'
          : ext === 'jpg' || ext === 'jpeg' || ext === 'png'
          ? 'image'
          : 'pdf';
      const sizeMB = Math.max(0.15, f.size / (1024 * 1024)).toFixed(2);
      return {
        id: `proof-upload-${Date.now()}-${i}`,
        name: f.name,
        size: `${sizeMB} MB`,
        type: fileType,
        uploadedAt: '2026-10-28 12:30:00',
      };
    });
    setAdvancementProofFiles((prev) => [...prev, ...added]);
  };

  // 提取纯人名辅助函数（去除头衔、院校与括号说明）
  const formatSubmittedByPersonName = (raw: string): string => {
    if (!raw) return '—';
    const trimmed = raw.trim();
    const matchInParens = trimmed.match(/高校管理员[（(]([^）)]+)[）)]/);
    if (matchInParens && matchInParens[1]) {
      return matchInParens[1].replace(/\s*(教授|博导|副教授|老师|管理员).*$/, '').trim();
    }
    const withoutParens = trimmed.replace(/[（(][^）)]*[）)]/g, '').trim();
    const afterDash = withoutParens.includes('-')
      ? withoutParens.split('-').pop()!.trim()
      : withoutParens;
    return afterDash.replace(/\s+(教授|博导|副教授|老师|管理员).*$/, '').trim() || trimmed;
  };

  // 确认提交【高校晋级名单】至秘书处终审（第二段核心动作，不设晋级名额上限）
  const handleConfirmAdvancementSubmit = () => {
    setAdvancementError(null);

    if (advancementSelectedTeamIds.length === 0) {
      setAdvancementError('请至少从左侧待选池中选择 1 支已通过资格审核的队伍加入晋级名单！');
      return;
    }
    if (advancementProofFiles.length === 0) {
      setAdvancementError('请上传校赛成绩单或晋级证明材料（支持 PDF、Excel、盖章扫描件图片）！');
      return;
    }

    const nowStr = '2026-10-28 12:35:00';
    const univ = advancementModalUniversity;
    const submitterPersonName = formatSubmittedByPersonName(adminName);
    const rankMap = new Map<string, number>();
    advancementSelectedTeamIds.forEach((id, idx) => {
      rankMap.set(id, idx + 1);
    });

    const selectedTeamNames: string[] = [];
    const unselectedTeamNames: string[] = [];

    // 更新 captainTeams：
    // 1. 被选入晋级名单的队伍 -> advancementStatus: 'pending_secretariat', schoolRank: 1/2/3..., secretariatAuditStatus: 'pending'
    // 2. 同校同赛事下其他已通过高校资格审核但未被选入的队伍 -> advancementStatus: 'not_advanced' (未晋级/止步校赛), secretariatAuditStatus: 'none'
    const updatedTeams = captainTeams.map((team) => {
      if (team.competitionId !== activeEventIdForTeams || team.university !== univ) {
        return team;
      }
      const stages = resolveTeamAuditStages(team);
      if (stages.schoolStatus !== 'approved') {
        return team;
      }

      if (rankMap.has(team.id)) {
        const assignedRank = rankMap.get(team.id)!;
        selectedTeamNames.push(`${team.teamName}(第${assignedRank}名)`);
        return {
          ...team,
          status: 'pending_review' as const,
          schoolAuditStatus: 'approved' as const,
          advancementStatus: 'pending_secretariat' as const,
          schoolRank: assignedRank,
          advancementSubmittedAt: nowStr,
          secretariatAuditStatus: 'pending' as const,
          secretariatRejectReason: undefined,
          secretariatAuditedAt: undefined,
          updatedAt: nowStr,
        };
      } else {
        unselectedTeamNames.push(team.teamName);
        return {
          ...team,
          status: 'pending_review' as const,
          schoolAuditStatus: 'approved' as const,
          advancementStatus: 'not_advanced' as const,
          schoolRank: undefined,
          secretariatAuditStatus: 'none' as const,
          secretariatRejectReason: undefined,
          secretariatAuditedAt: undefined,
          updatedAt: nowStr,
        };
      }
    });

    onUpdateCaptainTeams(updatedTeams);

    // 更新或创建 universitySubmissions 聚合记录
    setUniversitySubmissions((prev) => {
      const exists = prev.some(
        (sub) => sub.competitionId === activeEventIdForTeams && sub.university === univ
      );
      if (exists) {
        return prev.map((sub) =>
          sub.competitionId === activeEventIdForTeams && sub.university === univ
            ? {
                ...sub,
                teamIds: [...advancementSelectedTeamIds],
                proofFiles: [...advancementProofFiles],
                status: 'pending',
                submittedAt: nowStr,
                submittedBy: submitterPersonName,
                rejectReason: undefined,
              }
            : sub
        );
      }
      const newSub: UniversityAdvancementSubmission = {
        id: `univ-sub-${Date.now()}`,
        competitionId: activeEventIdForTeams,
        competitionTitle:
          activeEventForTeams?.title ||
          '2026年“奇安信杯”全国大学生网络空间安全精英赛',
        university: univ,
        teamIds: [...advancementSelectedTeamIds],
        proofFiles: [...advancementProofFiles],
        status: 'pending',
        submittedAt: nowStr,
        submittedBy: submitterPersonName,
      };
      return [newSub, ...prev];
    });

    onSendSystemNotification(
      `【高校晋级名单已提报】${univ}（共 ${selectedTeamNames.length} 支队伍）`,
      `${univ}已完成校赛选拔并向组委会秘书处提报晋级名单：${selectedTeamNames.join('、')}。${
        unselectedTeamNames.length > 0
          ? `其余 ${unselectedTeamNames.length} 支队伍（${unselectedTeamNames.join('、')}）状态已更新为“未晋级（止步校赛）”。`
          : ''
      }`
    );

    onAddAuditLog({
      operator: adminName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: `提报高校晋级名单（${univ} · 共 ${selectedTeamNames.length} 支队伍）`,
      result: '成功',
      detail: `晋级排名：${selectedTeamNames.join('、')} | 证明材料：${advancementProofFiles
        .map((f) => f.name)
        .join('、')}`,
    });

    onToast(
      `已成功将【${univ}】的 ${selectedTeamNames.length} 支晋级队伍及校赛成绩证明提报至秘书处终审！`
    );
    setAdvancementModalOpen(false);
  };

  // 【撤回提报】（在秘书处尚未终审通过前，高校管理员可一键撤回提报调整排名或材料，再次打开弹窗时保留数据回显）
  const handleWithdrawAdvancementSubmission = (universityName?: string) => {
    const univ =
      adminRole === 'school_admin'
        ? adminInstitutionName
        : universityName || targetUniversityForAdvancement;
    const targetSub = universitySubmissions.find(
      (sub) => sub.competitionId === activeEventIdForTeams && sub.university === univ
    );
    if (!targetSub || targetSub.status === 'approved') {
      onToast('当前晋级名单已通过秘书处终审或尚未提报，无法撤回');
      return;
    }

    const nowStr = '2026-10-28 12:38:00';
    // 将该校在此赛事下已通过资格审核的队伍恢复为 wait_school_match（保留 schoolRank 供再次打开弹窗时回显）
    const updatedTeams = captainTeams.map((team) => {
      if (team.competitionId !== activeEventIdForTeams || team.university !== univ) {
        return team;
      }
      const stages = resolveTeamAuditStages(team);
      if (stages.schoolStatus !== 'approved') return team;
      return {
        ...team,
        status: 'pending_review' as const,
        advancementStatus: 'wait_school_match' as const,
        secretariatAuditStatus: 'none' as const,
        secretariatRejectReason: undefined,
        updatedAt: nowStr,
      };
    });

    onUpdateCaptainTeams(updatedTeams);
    setUniversitySubmissions((prev) =>
      prev.map((sub) =>
        sub.id === targetSub.id
          ? {
              ...sub,
              status: 'withdrawn',
            }
          : sub
      )
    );

    onAddAuditLog({
      operator: adminName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: `撤回高校晋级名单提报（${univ}）`,
      result: '成功',
      detail: `高校管理员撤回了《${activeEventForTeams.title}》的晋级名单提报，原排名与证明材料已保留供重新编辑提交`,
    });

    onToast(
      `已撤回【${univ}】的晋级名单提报！点击【申报晋级队伍】将自动回显原勾选队伍、校内排名与证明材料。`
    );
  };

  // 第三段（Tab 2 秘书处终审）：按“高校维度”审核整批晋级名单与证明材料（通过 / 驳回）
  const handleConfirmSecretariatUniversityBatchAudit = () => {
    if (!secBatchAuditModal) return;
    setSecBatchAuditError(null);

    const { submission, decision } = secBatchAuditModal;
    const isApprove = decision === 'approve';
    const trimmedReason = secBatchRejectReason.trim();

    if (!isApprove && !trimmedReason) {
      setSecBatchAuditError('强校验拦截：驳回高校晋级名单时必须填写具体驳回原因！');
      return;
    }

    const nowStr = '2026-10-28 12:45:00';
    const rankMap = new Map<string, number>();
    submission.teamIds.forEach((id, idx) => {
      rankMap.set(id, idx + 1);
    });

    const affectedTeamNames: string[] = [];
    const updatedTeams = captainTeams.map((team) => {
      if (!rankMap.has(team.id)) return team;
      const schoolRank = rankMap.get(team.id)!;
      affectedTeamNames.push(`${team.teamName}(校内第${schoolRank}名)`);

      if (isApprove) {
        const teamWithRank: CaptainTeamRecord = {
          ...team,
          schoolRank,
        };
        return {
          ...team,
          status: 'approved' as const,
          schoolAuditStatus: 'approved' as const,
          advancementStatus: 'advanced' as const,
          schoolRank,
          secretariatAuditStatus: 'approved' as const,
          secretariatRejectReason: undefined,
          secretariatAuditedAt: nowStr,
          approvedSnapshot: buildApprovedSnapshotFromCaptainTeam(teamWithRank, nowStr),
          updatedAt: nowStr,
        };
      } else {
        // 秘书处驳回高校提报的晋级名单：打回高校管理员重报（不打回给队长个人修改）
        return {
          ...team,
          status: 'pending_review' as const,
          schoolAuditStatus: 'approved' as const,
          advancementStatus: 'secretariat_rejected' as const,
          schoolRank,
          secretariatAuditStatus: 'rejected' as const,
          secretariatRejectReason: trimmedReason,
          secretariatAuditedAt: nowStr,
          updatedAt: nowStr,
        };
      }
    });

    onUpdateCaptainTeams(updatedTeams);

    const updatedSub: UniversityAdvancementSubmission = {
      ...submission,
      status: isApprove ? 'approved' : 'rejected',
      auditedAt: nowStr,
      auditedBy: `赛事秘书处（${adminName}）`,
      rejectReason: isApprove ? undefined : trimmedReason,
    };

    setUniversitySubmissions((prev) =>
      prev.map((sub) => (sub.id === submission.id ? updatedSub : sub))
    );

    if (activeUniversitySubmissionDetail?.id === submission.id) {
      setActiveUniversitySubmissionDetail(updatedSub);
    }

    if (isApprove) {
      onSendSystemNotification(
        `【🎉 秘书处终审通过 · 晋级决赛】${submission.university}（${affectedTeamNames.length}支队伍）`,
        `恭喜！${submission.university}提报的晋级队伍（${affectedTeamNames.join('、')}）已通过秘书处终审，正式进入【最终参赛队伍清单】，个人中心【我的竞赛】与【下载回执】已同步解锁！`
      );
      onToast(
        `已通过【${submission.university}】提报的 ${affectedTeamNames.length} 支晋级队伍！队伍已正式沉淀至 Tab 3【最终参赛队伍清单】！`
      );
    } else {
      onSendSystemNotification(
        `【晋级名单被秘书处驳回】${submission.university}`,
        `${submission.university}提报的晋级名单未通过秘书处终审，驳回原因：${trimmedReason}。请高校管理员在后台【高校资格审核 -> 申报晋级队伍】中调整排名或补充证明材料后重新提报。`
      );
      onToast(
        `已驳回【${submission.university}】的晋级名单（原因：${trimmedReason}），已打回该校管理员重新提报！`
      );
    }

    onAddAuditLog({
      operator: adminName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: `秘书处终审高校晋级名单（${submission.university}）：${
        isApprove ? '审核通过' : '审核驳回'
      }`,
      result: '成功',
      detail: `涉及队伍：${affectedTeamNames.join('、')}${
        !isApprove ? ` | 驳回原因：${trimmedReason}` : ''
      }`,
    });

    setSecBatchAuditModal(null);
    setSecBatchRejectReason('');
  };

  // Tab 2 过滤后的高校晋级提报列表
  const filteredUniversitySubmissions = useMemo(() => {
    return universitySubmissions.filter((sub) => {
      if (sub.competitionId !== activeEventIdForTeams) return false;
      if (sub.status === 'withdrawn') return false;
      if (adminRole === 'school_admin' && sub.university !== adminInstitutionName) {
        return false;
      }
      if (secFilterStatus !== 'all' && sub.status !== secFilterStatus) {
        return false;
      }
      if (secFilterKeyword.trim()) {
        const kw = secFilterKeyword.trim().toLowerCase();
        const matchUniv = sub.university.toLowerCase().includes(kw);
        const subTeams = captainTeams.filter((t) => sub.teamIds.includes(t.id));
        const matchTeam = subTeams.some(
          (t) =>
            t.teamName.toLowerCase().includes(kw) ||
            t.captainName.toLowerCase().includes(kw)
        );
        if (!matchUniv && !matchTeam) return false;
      }
      return true;
    });
  }, [
    universitySubmissions,
    activeEventIdForTeams,
    adminRole,
    adminInstitutionName,
    secFilterStatus,
    secFilterKeyword,
    captainTeams,
  ]);

  // Tab 3 过滤后的【最终参赛队伍清单】（只读，仅展示秘书处终审通过的最终晋级队伍）
  const filteredFinalRosterTeams = useMemo(() => {
    return captainTeams
      .filter((team) => {
        if (
          finalRosterScopeEvent === 'current' &&
          team.competitionId !== activeEventIdForTeams
        ) {
          return false;
        }
        if (adminRole === 'school_admin' && team.university !== adminInstitutionName) {
          return false;
        }
        const stages = resolveTeamAuditStages(team);
        if (stages.regStatusKey !== 'approved') {
          return false;
        }
        if (
          finalRosterTrackFilter !== 'all' &&
          team.subTrackName !== finalRosterTrackFilter
        ) {
          return false;
        }
        if (finalRosterSchoolFilter.trim()) {
          const sc = finalRosterSchoolFilter.trim().toLowerCase();
          if (!team.university.toLowerCase().includes(sc)) return false;
        }
        if (finalRosterKeyword.trim()) {
          const kw = finalRosterKeyword.trim().toLowerCase();
          const capContact = resolveTeamCaptainContact(team, platformUsers);
          const matchTeam = team.teamName.toLowerCase().includes(kw);
          const matchCap = team.captainName.toLowerCase().includes(kw);
          const matchPhone = capContact.phone.includes(kw);
          if (!matchTeam && !matchCap && !matchPhone) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.university !== b.university) {
          return a.university.localeCompare(b.university, 'zh-CN');
        }
        return (a.schoolRank || 99) - (b.schoolRank || 99);
      });
  }, [
    captainTeams,
    finalRosterScopeEvent,
    activeEventIdForTeams,
    adminRole,
    adminInstitutionName,
    finalRosterTrackFilter,
    finalRosterSchoolFilter,
    finalRosterKeyword,
    platformUsers,
  ]);

  // 导出 Excel（联动指标6：若勾选则导出选中项，未勾选则导出当前搜索条件下的所有数据；手机号与身份证号默认脱敏；包含 Sheet1 队伍汇总 & Sheet2 成员明细）
  const handleTriggerExportExcel = (
    simulateOver5000 = false,
    customTeams?: CaptainTeamRecord[],
    customFilePrefix?: string
  ) => {
    const targetTeams = customTeams
      ? customTeams
      : selectedTeamIds.length > 0
      ? filteredEventTeams.filter((t) => selectedTeamIds.includes(t.id))
      : filteredEventTeams;

    if (targetTeams.length === 0) {
      onToast('当前没有可导出的队伍数据');
      return;
    }

    if (simulateOver5000 || targetTeams.length > 5000) {
      const taskId = `task-${Date.now()}`;
      const fileName = `${activeEventForTeams.title}_报名全量导出_5280条.xls`;
      setAsyncDownloadTasks((prev) => [
        {
          id: taskId,
          fileName,
          rowCount: 5280,
          status: 'generating',
          createdAt: '2026-10-28 12:10:05',
        },
        ...prev,
      ]);
      onToast('数据量大（>5000条），正在后台生成，请稍后在【下载中心】获取！');
      setDownloadCenterOpen(true);
      setTimeout(() => {
        setAsyncDownloadTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: 'ready' } : t))
        );
      }, 2200);
      return;
    }

    // 打开预览弹窗并触发双 Sheet Excel 文件下载
    setExportPreviewModal({
      sheetTab: 'sheet1',
      teams: targetTeams,
    });
    const exportFileName = customFilePrefix
      ? `${customFilePrefix}.xls`
      : `${activeEventForTeams.title}_报名队伍与成员明细.xls`;
    downloadTwoSheetExcelFile(targetTeams, exportFileName);
    onAddAuditLog({
      operator: adminName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: `导出报名队伍Excel（共 ${targetTeams.length} 支队伍）`,
      result: '成功',
      detail: `文件：${exportFileName}，包含 Sheet1(队伍汇总·含校内排名) 与 Sheet2(成员明细)，手机号与身份证号已执行默认脱敏保护`,
    });
  };

  // 解析队员/队长/指导教师的完整导出档案信息（手机号、邮箱、身份证号、学历、队内角色、院校所在地、所属赛区）
  const resolvePersonFullExportInfo = (params: {
    name: string;
    phone?: string;
    email?: string;
    university: string;
    roleType: 'captain' | 'member' | 'advisor';
    ctfRoles?: CtfRoleType[];
  }) => {
    const matchedUser =
      platformUsers.find(
        (u) =>
          u.name === params.name ||
          (params.phone && u.phone === params.phone) ||
          (params.email && u.email.toLowerCase() === params.email.toLowerCase())
      ) ||
      PLATFORM_DIRECTORY_USERS.find(
        (u) =>
          u.name === params.name ||
          (params.phone && u.phone === params.phone)
      );

    const fullPhone = params.phone || matchedUser?.phone || '13810246921';
    const fullEmail =
      params.email || matchedUser?.email || `${params.name}@edu.cn`;
    const fullIdCard = getFullIdCard(params.name + fullPhone, params.roleType);
    const educationLevel =
      params.roleType === 'advisor'
        ? '博士及以上'
        : params.name.includes('博')
        ? '博士及以上'
        : params.name.includes('硕') || params.name === '陆景川' || params.name === '周子航'
        ? '硕士'
        : '本科';
    const inTeamRoleText =
      params.roleType === 'advisor'
        ? '指导教师（不参与CTF角色）'
        : formatCtfRolesText(params.ctfRoles, false);
    const locAndDiv = resolveUniversityLocationAndDivision(
      params.university,
      institutions,
      divisions
    );

    return {
      name: params.name,
      identityLabel:
        params.roleType === 'captain'
          ? '队长'
          : params.roleType === 'advisor'
          ? '指导教师'
          : '队员',
      inTeamRoleText,
      educationLevel,
      phone: fullPhone,
      email: fullEmail,
      idCard: fullIdCard,
      university: params.university,
      universityLocation: locAndDiv.locationText,
      province: locAndDiv.province,
      divisionName: locAndDiv.divisionName,
    };
  };

  // 生成包含 Sheet1（队伍汇总全量详情）与 Sheet2（队伍与队员全部详细信息）的标准 Excel XML 文件并触发浏览器下载
  const downloadTwoSheetExcelFile = (teams: CaptainTeamRecord[], filename: string) => {
    const sheet1Rows = teams
      .map((t) => {
        const stages = resolveTeamAuditStages(t);
        const totalMembers = 1 + t.members.length;
        const capContact = resolveTeamCaptainContact(t, platformUsers);
        const capInfo = resolvePersonFullExportInfo({
          name: t.captainName,
          phone: capContact.phone,
          email: capContact.email,
          university: t.university,
          roleType: 'captain',
          ctfRoles: t.captainCtfRoles,
        });
        const rankText = stages.schoolRank ? `校内第${stages.schoolRank}名` : '-';
        const allMemberSummary = [
          `${capInfo.name}(队长/${capInfo.educationLevel}/${capInfo.inTeamRoleText}/${capInfo.phone})`,
          ...t.members.map((m) => {
            const mi = resolvePersonFullExportInfo({
              name: m.name,
              phone: m.phone,
              email: m.email,
              university: m.university,
              roleType: 'member',
              ctfRoles: m.ctfRoles,
            });
            return `${mi.name}(队员/${mi.educationLevel}/${mi.inTeamRoleText}/${mi.phone})`;
          }),
        ].join('；');

        return `<Row>
          <Cell><Data ss:Type="String">${t.teamName}</Data></Cell>
          <Cell><Data ss:Type="String">${t.competitionTitle}</Data></Cell>
          <Cell><Data ss:Type="String">${rankText}</Data></Cell>
          <Cell><Data ss:Type="String">${t.university}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.universityLocation}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.divisionName}</Data></Cell>
          <Cell><Data ss:Type="String">${t.teamIntro || ''}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.name}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.phone}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.email}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.idCard}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.educationLevel}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.inTeamRoleText}</Data></Cell>
          <Cell><Data ss:Type="Number">${totalMembers}</Data></Cell>
          <Cell><Data ss:Type="String">${allMemberSummary}</Data></Cell>
          <Cell><Data ss:Type="String">${stages.regStatusLabel}</Data></Cell>
          <Cell><Data ss:Type="String">${t.createdAt}</Data></Cell>
        </Row>`;
      })
      .join('');

    const sheet2Rows = teams
      .flatMap((t) => {
        const stages = resolveTeamAuditStages(t);
        const rankText = stages.schoolRank ? `校内第${stages.schoolRank}名` : '-';
        const capContact = resolveTeamCaptainContact(t, platformUsers);
        const capInfo = resolvePersonFullExportInfo({
          name: t.captainName,
          phone: capContact.phone,
          email: capContact.email,
          university: t.captainUniversity || t.university,
          roleType: 'captain',
          ctfRoles: t.captainCtfRoles,
        });

        const captainRow = `<Row>
          <Cell><Data ss:Type="String">${t.teamName}</Data></Cell>
          <Cell><Data ss:Type="String">${t.competitionTitle}</Data></Cell>
          <Cell><Data ss:Type="String">${rankText}</Data></Cell>
          <Cell><Data ss:Type="String">${t.teamIntro || ''}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.university}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.universityLocation}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.divisionName}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.name}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.identityLabel}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.inTeamRoleText}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.educationLevel}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.phone}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.email}</Data></Cell>
          <Cell><Data ss:Type="String">${capInfo.idCard}</Data></Cell>
        </Row>`;

        const memRows = [...t.members, ...t.advisors].map((p) => {
          const pInfo = resolvePersonFullExportInfo({
            name: p.name,
            phone: p.phone,
            email: p.email,
            university: p.university || t.university,
            roleType: p.role === 'advisor' ? 'advisor' : 'member',
            ctfRoles: p.ctfRoles,
          });
          return `<Row>
          <Cell><Data ss:Type="String">${t.teamName}</Data></Cell>
          <Cell><Data ss:Type="String">${t.competitionTitle}</Data></Cell>
          <Cell><Data ss:Type="String">${rankText}</Data></Cell>
          <Cell><Data ss:Type="String">${t.teamIntro || ''}</Data></Cell>
          <Cell><Data ss:Type="String">${pInfo.university}</Data></Cell>
          <Cell><Data ss:Type="String">${pInfo.universityLocation}</Data></Cell>
          <Cell><Data ss:Type="String">${pInfo.divisionName}</Data></Cell>
          <Cell><Data ss:Type="String">${pInfo.name}</Data></Cell>
          <Cell><Data ss:Type="String">${pInfo.identityLabel}</Data></Cell>
          <Cell><Data ss:Type="String">${pInfo.inTeamRoleText}</Data></Cell>
          <Cell><Data ss:Type="String">${pInfo.educationLevel}</Data></Cell>
          <Cell><Data ss:Type="String">${pInfo.phone}</Data></Cell>
          <Cell><Data ss:Type="String">${pInfo.email}</Data></Cell>
          <Cell><Data ss:Type="String">${pInfo.idCard}</Data></Cell>
        </Row>`;
        });
        return [captainRow, ...memRows];
      })
      .join('');

    const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Sheet1-队伍汇总详情">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">队伍名称</Data></Cell>
    <Cell><Data ss:Type="String">参赛赛事</Data></Cell>
    <Cell><Data ss:Type="String">校内选拔排名</Data></Cell>
    <Cell><Data ss:Type="String">所属院校</Data></Cell>
    <Cell><Data ss:Type="String">院校所在地</Data></Cell>
    <Cell><Data ss:Type="String">所属赛区</Data></Cell>
    <Cell><Data ss:Type="String">队伍简介</Data></Cell>
    <Cell><Data ss:Type="String">队长姓名</Data></Cell>
    <Cell><Data ss:Type="String">队长手机号</Data></Cell>
    <Cell><Data ss:Type="String">队长邮箱</Data></Cell>
    <Cell><Data ss:Type="String">队长身份证号</Data></Cell>
    <Cell><Data ss:Type="String">队长学历</Data></Cell>
    <Cell><Data ss:Type="String">队长队内角色</Data></Cell>
    <Cell><Data ss:Type="String">队伍人数</Data></Cell>
    <Cell><Data ss:Type="String">全队成员汇总</Data></Cell>
    <Cell><Data ss:Type="String">报名与晋级状态</Data></Cell>
    <Cell><Data ss:Type="String">报名时间</Data></Cell>
   </Row>
   ${sheet1Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Sheet2-队伍及队员全部详细信息">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">所属队伍</Data></Cell>
    <Cell><Data ss:Type="String">参赛赛事</Data></Cell>
    <Cell><Data ss:Type="String">校内选拔排名</Data></Cell>
    <Cell><Data ss:Type="String">队伍简介</Data></Cell>
    <Cell><Data ss:Type="String">所属院校</Data></Cell>
    <Cell><Data ss:Type="String">院校所在地</Data></Cell>
    <Cell><Data ss:Type="String">所属赛区</Data></Cell>
    <Cell><Data ss:Type="String">姓名</Data></Cell>
    <Cell><Data ss:Type="String">队内身份</Data></Cell>
    <Cell><Data ss:Type="String">队内角色</Data></Cell>
    <Cell><Data ss:Type="String">学历</Data></Cell>
    <Cell><Data ss:Type="String">手机号</Data></Cell>
    <Cell><Data ss:Type="String">邮箱</Data></Cell>
    <Cell><Data ss:Type="String">身份证号</Data></Cell>
   </Row>
   ${sheet2Rows}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 第一段（Tab 1 高校资格审核）：执行单条或批量资格核验（通过后队伍变为“高校已通过（待校赛）”，并不直接进入秘书处！）
  const handleConfirmAuditExecution = () => {
    if (!auditModalState) return;
    setAuditError(null);

    if (auditModalState.decision === 'reject' && !rejectReasonText.trim()) {
      setAuditError('强校验拦截：审核不通过时必须填写驳回原因！');
      return;
    }

    const targetIdSet = new Set(auditModalState.teamIds);
    const isApprove = auditModalState.decision === 'approve';
    const trimmedReason = rejectReasonText.trim();

    const affectedTeamNames: string[] = [];
    const updatedTeams = captainTeams.map((team) => {
      if (!targetIdSet.has(team.id)) return team;
      affectedTeamNames.push(team.teamName);

      // 第一段（高校资格审核）：
      // - 通过：高校审核变为已通过，晋级阶段状态设为 wait_school_match（高校已通过·待校赛），不直接进入秘书处！后续由高校管理员点击顶部【申报晋级队伍】弹窗提报。
      // - 驳回：高校审核变为已驳回（记录驳回原因），队长可修改队伍信息后重新提交。
      return {
        ...team,
        status: isApprove ? ('pending_review' as const) : ('rejected' as const),
        schoolAuditStatus: isApprove ? ('approved' as const) : ('rejected' as const),
        schoolRejectReason: isApprove ? undefined : trimmedReason,
        schoolAuditedAt: '2026-10-28 12:15:00',
        advancementStatus: isApprove
          ? ('wait_school_match' as const)
          : ('none' as const),
        schoolRank: isApprove ? team.schoolRank : undefined,
        secretariatAuditStatus: 'none' as const,
        secretariatRejectReason: undefined,
        secretariatAuditedAt: undefined,
        updatedAt: '2026-10-28 12:15:00',
      };
    });

    onUpdateCaptainTeams(updatedTeams);

    if (isApprove) {
      onSendSystemNotification(
        `【高校资格审核通过 · 待校赛选拔】${affectedTeamNames.join('、')}`,
        `您所在的队伍（${affectedTeamNames.join('、')}）已通过本校资格审核，状态已更新为“高校已通过（待校赛）”。请等待高校管理员组织校赛选拔并统一提报晋级名单至大赛秘书处。`
      );
      onToast(
        `已完成高校资格审核通过（${affectedTeamNames.length} 支队伍）！队伍已进入【待校赛选拔池】，可通过顶部【申报晋级队伍】按钮勾选排名并提报秘书处！`
      );
    } else {
      onSendSystemNotification(
        `【高校资格审核驳回】${affectedTeamNames.join('、')}`,
        `您所在的队伍在「高校资格审核」阶段未通过，驳回原因：${trimmedReason}。队长可在【个人中心 - 我的报名】修改队伍信息后重新提交。`
      );
      onToast(
        `已在【高校资格审核】驳回 ${affectedTeamNames.length} 支队伍，前台将展示“已驳回”及驳回原因，队长修改后可重新提交本校审核！`
      );
    }

    onAddAuditLog({
      operator: adminName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: `${auditModalState.mode === 'batch' ? '批量' : '单条'}高校资格审核：${
        isApprove ? '已通过(进入待校赛池)' : '已驳回'
      }`,
      result: '成功',
      detail: `涉及队伍：${affectedTeamNames.join('、')}${
        !isApprove ? ` | 驳回原因：${trimmedReason}` : ''
      }`,
    });

    setAuditModalState(null);
    setSelectedTeamIds([]);
  };

  // 打开管理员后门【编辑队伍】
  const handleOpenAdminBackdoorEdit = (team: CaptainTeamRecord) => {
    const deepCopy: CaptainTeamRecord = {
      ...team,
      captainCtfRoles: team.captainCtfRoles ? [...team.captainCtfRoles] : [],
      members: team.members.map((m) => ({
        ...m,
        ctfRoles: m.ctfRoles ? [...m.ctfRoles] : [],
      })),
      advisors: team.advisors.map((a) => ({ ...a })),
    };
    setEditTeamDraft(deepCopy);
    setEditTeamOriginalSnapshot(
      JSON.stringify({
        teamName: team.teamName,
        captainName: team.captainName,
        captainRoles: formatCtfRolesText(team.captainCtfRoles, false),
        members: team.members.map(
          (m) => `${m.name}(${formatCtfRolesText(m.ctfRoles, false)})`
        ),
        advisors: team.advisors.map((a) => a.name),
        status: team.status,
      })
    );
    setBackdoorSearchQuery('');
    setBackdoorAddCtfRoles([]);
    setBackdoorRolePopoverId(null);
    setBackdoorInterceptAlert(null);
    setBackdoorForceOverrideChecked(false);
    setBackdoorFeedback(null);
    setSubView('team-edit');
  };

  // 管理员编辑队伍：上传/替换队伍 LOGO
  const handleEditTeamLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editTeamDraft) return;
    if (!file.type.startsWith('image/')) {
      setBackdoorFeedback('请上传 PNG、JPG、SVG 或 WebP 格式的队伍 LOGO 图片文件。');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setBackdoorFeedback('队伍 LOGO 图片大小不能超过 2MB。');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditTeamDraft((prev) =>
          prev ? { ...prev, teamLogo: reader.result as string } : prev
        );
        setBackdoorFeedback('已上传并更新队伍 LOGO（保存修改后正式生效）。');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 构建可供指定为新队长的候选人列表（包含本队现有队员 + 平台注册用户，支持按手机号或邮箱搜索）
  const newCaptainCandidates = useMemo(() => {
    if (!editTeamDraft) return [];
    const capContact = resolveTeamCaptainContact(editTeamDraft, platformUsers);
    const memberCandidates = editTeamDraft.members.map((m) => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      email: m.email,
      university: m.university,
      isVerified: m.isVerified,
      source: 'team_member' as const,
    }));
    const existingPhones = new Set(
      [capContact.phone, ...editTeamDraft.members.map((m) => m.phone)].filter(Boolean)
    );
    const existingEmails = new Set(
      [
        capContact.email?.toLowerCase(),
        ...editTeamDraft.members.map((m) => m.email?.toLowerCase()),
      ].filter(Boolean)
    );
    const userPool = (
      platformUsers.length > 0 ? platformUsers : PLATFORM_DIRECTORY_USERS
    ).filter((u) => !u.isDeleted);
    const directoryCandidates = userPool
      .filter(
        (u) =>
          u.name !== editTeamDraft.captainName &&
          u.realName !== editTeamDraft.captainName &&
          !existingPhones.has(u.phone) &&
          !existingEmails.has(u.email.toLowerCase())
      )
      .map((u) => ({
        id: u.id,
        name: u.realName || u.name,
        phone: u.phone,
        email: u.email,
        university: u.university,
        isVerified: u.isRealNameVerified && u.isAcademicOrTeacherVerified,
        source: 'platform_user' as const,
      }));
    return [...memberCandidates, ...directoryCandidates];
  }, [editTeamDraft, platformUsers]);

  const filteredNewCaptainCandidates = useMemo(() => {
    const q = newCaptainSearchQuery.trim().toLowerCase();
    if (!q) {
      return newCaptainCandidates;
    }
    return newCaptainCandidates.filter(
      (c) =>
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    );
  }, [newCaptainCandidates, newCaptainSearchQuery]);

  // 管理员后门：指定新队长并移除原队长（支持按手机号/邮箱搜索匹配或从候选列表中选择）
  const handleConfirmReplaceCaptain = () => {
    if (!editTeamDraft) return;
    setNewCaptainSearchError(null);

    const q = newCaptainSearchQuery.trim().toLowerCase();
    let chosenCandidate = newCaptainCandidates.find(
      (c) => c.id === selectedNewCaptainMemberId
    );

    // 若用户输入了手机号或邮箱但尚未点击列表项，优先精确/模糊匹配搜索词
    if (
      q &&
      (!chosenCandidate ||
        (!chosenCandidate.phone.toLowerCase().includes(q) &&
          !chosenCandidate.email.toLowerCase().includes(q) &&
          !chosenCandidate.name.toLowerCase().includes(q)))
    ) {
      chosenCandidate =
        newCaptainCandidates.find(
          (c) => c.phone.toLowerCase() === q || c.email.toLowerCase() === q
        ) || filteredNewCaptainCandidates[0];
    }

    if (!chosenCandidate) {
      setNewCaptainSearchError('未找到匹配的候选人，请核对输入的手机号或邮箱');
      return;
    }

    const oldCaptainName = editTeamDraft.captainName;
    const nextMembers = editTeamDraft.members.filter(
      (m) =>
        m.id !== chosenCandidate!.id &&
        m.phone !== chosenCandidate!.phone &&
        m.email.toLowerCase() !== chosenCandidate!.email.toLowerCase()
    );

    setEditTeamDraft({
      ...editTeamDraft,
      captainName: chosenCandidate.name,
      captainUniversity: chosenCandidate.university,
      captainVerified: chosenCandidate.isVerified,
      members: nextMembers,
    });
    setRemoveCaptainModalOpen(false);
    setNewCaptainSearchQuery('');
    setNewCaptainSearchError(null);
    setBackdoorFeedback(
      `已将原队长「${oldCaptainName}」移出队伍，并指定「${chosenCandidate.name}（${chosenCandidate.phone}）」为新任队长（保存后将向相关成员发送通知）。`
    );
  };

  // 管理员后门：搜索并添加成员（含未认证/跨校规则拦截 + [√] 强行特批加入后门）
  const handleBackdoorSearchAndAdd = (presetQuery?: string, forceBypass = false) => {
    if (!editTeamDraft) return;
    setBackdoorFeedback(null);
    const q = (presetQuery !== undefined ? presetQuery : backdoorSearchQuery).trim();
    if (!q) return;

    const userPool = (
      platformUsers.length > 0 ? platformUsers : PLATFORM_DIRECTORY_USERS
    ).filter((u) => !u.isDeleted);
    const found = userPool.find(
      (u) => u.phone === q || u.email.toLowerCase() === q.toLowerCase()
    );
    if (!found) {
      setBackdoorFeedback(`未找到手机号/邮箱为「${q}」的已注册用户。`);
      return;
    }

    // 检查规则违反项：1. 对方未完成实名/学籍/教师认证  2. 违反“不允许跨校”规则
    const reasons: string[] = [];
    if (!found.isRealNameVerified || !found.isAcademicOrTeacherVerified) {
      reasons.push(`用户「${found.name}」尚未完成实名或学籍/教师认证`);
    }
    const allowCross = activeConfigForTeams?.allowCrossSchool ?? false;
    if (!allowCross && found.university !== editTeamDraft.university) {
      reasons.push(
        `当前赛事配置为【不允许跨校组队】，该用户所属院校（${found.university}）与本队归属高校（${editTeamDraft.university}）不一致`
      );
    }

    if (reasons.length > 0 && !forceBypass) {
      setBackdoorInterceptAlert({
        candidate: found,
        role: backdoorAddRole,
        reasons,
      });
      setBackdoorForceOverrideChecked(false);
      return;
    }

    // 执行拉入（普通拉入 或 勾选【强行特批加入】跳过规则校验）
    const newPerson: InvitedTeamPerson = {
      id: `bd-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: found.name,
      phone: found.phone,
      email: found.email,
      university: found.university,
      role: backdoorAddRole,
      ctfRoles: backdoorAddRole === 'member' ? [...backdoorAddCtfRoles] : undefined,
      isVerified: found.isRealNameVerified && found.isAcademicOrTeacherVerified,
      confirmStatus: 'accepted', // 管理员后门直接拉入设为已确认
    };

    setEditTeamDraft({
      ...editTeamDraft,
      members:
        backdoorAddRole === 'member'
          ? [...editTeamDraft.members, newPerson]
          : editTeamDraft.members,
      advisors:
        backdoorAddRole === 'advisor'
          ? [...editTeamDraft.advisors, newPerson]
          : editTeamDraft.advisors,
    });
    setBackdoorInterceptAlert(null);
    setBackdoorSearchQuery('');
    if (backdoorAddRole === 'member' && backdoorAddCtfRoles.length === 0) {
      // 如果添加队员时还未勾选初始角色，自动弹出该新队员的【编辑】角色下拉框方便直接分配
      setBackdoorRolePopoverId(newPerson.id);
    }
    setBackdoorAddCtfRoles([]);
    setBackdoorFeedback(
      forceBypass
        ? `【特权后门生效】已跳过规则校验，强行特批「${found.name}（${found.university}）」加入队伍！您可随时点击该成员右侧【编辑】调整其队内角色标签。`
        : `已将「${found.name}」加入队伍名单！您可点击该成员右侧【编辑】分配或修改队内角色标签。`
    );
  };

  // 保存管理员后门对队伍的修改（保持原审核状态不变，写修改前后快照日志，发站内信）
  const handleSaveAdminBackdoorEdit = () => {
    if (!editTeamDraft) return;
    const afterSnapshot = JSON.stringify({
      teamName: editTeamDraft.teamName,
      captainName: editTeamDraft.captainName,
      captainRoles: formatCtfRolesText(editTeamDraft.captainCtfRoles, false),
      members: editTeamDraft.members.map(
        (m) => `${m.name}(${formatCtfRolesText(m.ctfRoles, false)})`
      ),
      advisors: editTeamDraft.advisors.map((a) => a.name),
      status: editTeamDraft.status,
    });

    // 状态保持：编辑保存后，队伍状态不变（若已报名成功则同步更新快照）
    const updated = captainTeams.map((t) =>
      t.id === editTeamDraft.id
        ? {
            ...editTeamDraft,
            approvedSnapshot:
              editTeamDraft.status === 'approved'
                ? buildApprovedSnapshotFromCaptainTeam(editTeamDraft, '2026-10-28 12:20')
                : editTeamDraft.approvedSnapshot,
            updatedAt: '2026-10-28 12:20',
          }
        : t
    );
    onUpdateCaptainTeams(updated);

    onAddAuditLog({
      operator: adminName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console (特权后门)',
      action: `管理员特权编辑队伍（${editTeamDraft.teamName}）`,
      result: '成功',
      detail: `修改前快照：${editTeamOriginalSnapshot} -> 修改后快照：${afterSnapshot}（状态保持不变）`,
    });

    onSendSystemNotification(
      `【组委会后台队伍调整通知】${editTeamDraft.teamName}`,
      `管理员 ${adminName} 已对战队「${editTeamDraft.teamName}」执行后台名单/信息维护，队伍当前审核状态保持不变。`
    );

    onToast(`已保存对「${editTeamDraft.teamName}」的特权修改，队伍原状态保持不变，操作前后快照已写入审计日志！`);
    setSubView('team-list');
  };

  const activeTeamDetailRecord =
    captainTeams.find((t) => t.id === activeTeamId) || null;

  // ==========================================================================
  // 渲染子视图 2：新增 / 编辑报名配置页（规则级设计）
  // ==========================================================================
  if (subView === 'reg-form') {
    const editingComp = getCompById(cfgEventId);
    return (
      <div className="max-w-6xl 2xl:max-w-[1360px] mx-auto space-y-6 pb-12">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 xl:p-10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingConfigId ? '编辑报名配置（规则级设计）' : '新增报名配置（规则级设计）'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                此处配置的报名起止时间、提前关闭开关、跨校组队、指导教师及队伍人数限制将直接驱动前台赛事详情页与报名表单
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSubView('reg-list')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              返回报名列表
            </button>
          </div>

          {cfgFormError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{cfgFormError}</span>
            </div>
          )}

          <form onSubmit={handleSaveConfigForm} className="space-y-6">
            {/* 1. 关联赛事（下拉选择） */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                关联赛事 <span className="text-red-500">*</span>
                <span className="ml-2 font-normal text-slate-400">
                  （选择尚未配置报名的赛事进行关联；关联后前台对应赛事将显示报名入口）
                </span>
              </label>
              {editingConfigId ? (
                <input
                  type="text"
                  readOnly
                  value={editingComp ? editingComp.title : '未知关联赛事'}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-not-allowed"
                />
              ) : (
                <select
                  value={cfgEventId}
                  onChange={(e) => setCfgEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none cursor-pointer"
                >
                  {availableEventsForNewConfig.length === 0 ? (
                    <option value="">
                      暂无可关联赛事（所有赛事均已生成报名配置）
                    </option>
                  ) : (
                    availableEventsForNewConfig.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {/* 2. 报名开始/截止时间（精确到时分秒） */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  报名开始时间（精确到时分秒） <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  step="1"
                  required
                  value={cfgStartTime}
                  onChange={(e) => setCfgStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono-num bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  报名截止时间（精确到时分秒） <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  step="1"
                  required
                  value={cfgEndTime}
                  onChange={(e) => setCfgEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono-num bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2 text-[11px] text-slate-500">
                联动说明：若赛事有关联报名配置，前台赛事详情页将展示【立即报名】按钮；若当前不在报名开放时段内（未开始/已截止/提前关闭），点击【立即报名】将提示“报名未开启”。
              </div>
            </div>

            {/* 3. 报名的提前关闭开关（开关按钮样式） */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    提前关闭报名开关
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                      cfgEarlyClosed
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {cfgEarlyClosed ? '已开启（立即停止报名）' : '未开启（按起止时间判断）'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  开启后立即停止报名，直接覆盖截止时间的判断，前端点击立即报名将提示“报名未开启”。
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={cfgEarlyClosed}
                onClick={() => setCfgEarlyClosed((prev) => !prev)}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  cfgEarlyClosed ? 'bg-red-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    cfgEarlyClosed ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 4. 人数设置：先设置队伍人数，再设置教师人数 */}
            <div className="p-5 rounded-xl bg-sky-50/40 border border-sky-200/80 space-y-5">
              <div className="flex items-center justify-between border-b border-sky-200/60 pb-2.5">
                <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                  人数设置（先设置队伍人数，再设置指导教师人数）
                </div>
                <span className="text-[11px] text-slate-500">
                  实时约束前台报名表单的队员邀请与指导教师模块
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 第一项：队伍人数设置（最少人数 ~ 最多人数） */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 flex flex-col justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      1. 队伍人数限制（最少含队长 1-5 人，最多 1-20 人）{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1">
                        <div className="text-[11px] text-slate-500 mb-1">最少人数（含队长）</div>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          required
                          value={cfgMinTeamSize}
                          onChange={(e) => setCfgMinTeamSize(Number(e.target.value))}
                          className="w-full px-3.5 py-2 text-sm font-mono-num bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                        />
                      </div>
                      <span className="text-slate-400 font-bold pt-5">~</span>
                      <div className="flex-1">
                        <div className="text-[11px] text-slate-500 mb-1">最多人数（含队长）</div>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          required
                          value={cfgMaxTeamSize}
                          onChange={(e) => setCfgMaxTeamSize(Number(e.target.value))}
                          className="w-full px-3.5 py-2 text-sm font-mono-num bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#0369A1] font-medium">
                    {cfgMaxTeamSize === 1
                      ? '当前最多人数限制为 1 人（单人赛），前台报名表单将自动隐藏“邀请队员”模块'
                      : `每支战队须由 ${cfgMinTeamSize} 至 ${cfgMaxTeamSize} 名参赛学生组成（含队长本人）`}
                  </p>
                </div>

                {/* 第二项：教师人数设置（包含指导教师开关 + 教师人数上限） */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 flex flex-col justify-between gap-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          2. 指导教师人数设置 <span className="text-red-500">*</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {cfgIncludeAdvisor ? '已开启指导教师模块' : '已关闭（前台隐藏指导教师模块）'}
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={cfgIncludeAdvisor}
                        onClick={() => setCfgIncludeAdvisor((prev) => !prev)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          cfgIncludeAdvisor ? 'bg-[#0284C7]' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            cfgIncludeAdvisor ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">
                          最少人数（可设为 0-5 人）{' '}
                          {cfgIncludeAdvisor && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          disabled={!cfgIncludeAdvisor}
                          required={cfgIncludeAdvisor}
                          value={cfgIncludeAdvisor ? cfgMinAdvisors : 0}
                          onChange={(e) => setCfgMinAdvisors(Number(e.target.value))}
                          className="w-full px-3.5 py-2 text-sm font-mono-num bg-white disabled:bg-slate-100 border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">
                          最多人数 / 上限（可设为 0-5 人）{' '}
                          {cfgIncludeAdvisor && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          disabled={!cfgIncludeAdvisor}
                          required={cfgIncludeAdvisor}
                          value={cfgIncludeAdvisor ? cfgMaxAdvisors : 0}
                          onChange={(e) => setCfgMaxAdvisors(Number(e.target.value))}
                          className="w-full px-3.5 py-2 text-sm font-mono-num bg-white disabled:bg-slate-100 border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {cfgIncludeAdvisor
                      ? cfgMinAdvisors === 0
                        ? `最少人数为 0 人，最多 ${cfgMaxAdvisors} 人（即每个队伍可以邀请指导老师，也可以不邀请）`
                        : `每支战队须邀请 ${cfgMinAdvisors} 至 ${cfgMaxAdvisors} 名已认证指导教师`
                      : '已关闭“包含指导教师”开关，前台报名表单不再展示指导教师邀请项'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSubView('reg-list')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                保存报名配置
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 渲染子视图 3A：队伍数据管理 —— 【查看详情（只读页面）】
  // ==========================================================================
  if (subView === 'team-detail' && activeTeamDetailRecord) {
    const team = activeTeamDetailRecord;
    const stages = resolveTeamAuditStages(team);
    const confirmProgress = computeTeamConfirmProgress(team);

    const capContact = resolveTeamCaptainContact(team, platformUsers);
    const allPersonRows = [
      {
        id: 'cap-row',
        name: team.captainName,
        gender: getPersonGender(team.captainName),
        roleLabel: '队长',
        roleKey: 'captain' as const,
        ctfRoles: team.captainCtfRoles,
        university: team.captainUniversity,
        phone: maskPhone(capContact.phone),
        email: maskEmail(capContact.email),
        idCard: getMaskedIdCard(team.captainName),
        isVerified: team.captainVerified,
      },
      ...team.members.map((m) => ({
        id: m.id,
        name: m.name,
        gender: getPersonGender(m.name),
        roleLabel: '队员',
        roleKey: 'member' as const,
        ctfRoles: m.ctfRoles,
        university: m.university,
        phone: maskPhone(m.phone),
        email: maskEmail(m.email),
        idCard: getMaskedIdCard(m.name + m.phone),
        isVerified: m.isVerified,
      })),
      ...team.advisors.map((a) => ({
        id: a.id,
        name: a.name,
        gender: getPersonGender(a.name),
        roleLabel: '指导教师',
        roleKey: 'advisor' as const,
        ctfRoles: undefined,
        university: a.university,
        phone: maskPhone(a.phone),
        email: maskEmail(a.email),
        idCard: getMaskedIdCard(a.name + a.phone),
        isVerified: a.isVerified,
      })),
    ];

    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSubView('team-list')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0284C7] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回查看报名列表</span>
          </button>
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <span>查看队伍详情</span>
          </span>
        </div>

        {/* 1. 基础信息：队伍名、LOGO大图、简介、所属院校、报名状态、高校审核、秘书处审核 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-5">
              <TeamLogoAvatar logo={team.teamLogo} teamName={team.teamName} size="lg" />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <h2 className="text-xl font-extrabold text-slate-900 mr-1">{team.teamName}</h2>
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${stages.regDotClass}`} />
                    <span className={stages.regColorClass}>
                      报名状态：{stages.regStatusLabel}
                    </span>
                  </span>
                  {stages.schoolRank && (
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold inline-flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      <span>校内排名：第 {stages.schoolRank} 名</span>
                    </span>
                  )}
                  <div className="inline-flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 font-semibold">高校审核：</span>
                    <AuditStageBadgeWithTooltip
                      status={stages.schoolStatus}
                      rejectReason={stages.schoolReason}
                      stage="school"
                      stageLabel="高校审核"
                      customLabel={stages.schoolBadgeLabel}
                    />
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 font-semibold">秘书处审核：</span>
                    <AuditStageBadgeWithTooltip
                      status={stages.secretariatStatus}
                      rejectReason={stages.secretariatReason}
                      stage="secretariat"
                      stageLabel="秘书处审核"
                      customLabel={stages.secretariatBadgeLabel}
                    />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  <strong>队伍简介：</strong>
                  {team.teamIntro || '专注网络与数据安全攻防技术研究。'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>
                    所属院校：<strong className="text-[#0369A1]">{team.university}</strong>
                  </span>
                  <span className="font-mono-num">报名时间：{team.createdAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 成员列表表格（手机号/邮箱/身份证号均脱敏） */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                队伍成员与指导教师明细（共 {allPersonRows.length} 人）
              </h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                    <th className="py-3 px-4">姓名</th>
                    <th className="py-3 px-4">性别</th>
                    <th className="py-3 px-4">角色</th>
                    <th className="py-3 px-4">队内角色</th>
                    <th className="py-3 px-4">所属院校</th>
                    <th className="py-3 px-4">手机号(脱敏)</th>
                    <th className="py-3 px-4">邮箱(脱敏)</th>
                    <th className="py-3 px-4">身份证号(脱敏)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs bg-white">
                  {allPersonRows.map((row) => (
                    <tr key={row.id} className="hover:bg-sky-50/30">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{row.gender}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            row.roleKey === 'captain'
                              ? 'bg-[#0284C7] text-white'
                              : row.roleKey === 'advisor'
                              ? 'bg-sky-100 text-[#0369A1]'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {row.roleLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <CtfRoleBadges
                          roles={row.ctfRoles}
                          isAdvisor={row.roleKey === 'advisor'}
                          emptyText="-"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {row.university}
                      </td>
                      <td className="py-3.5 px-4 font-mono-num text-slate-600">{row.phone}</td>
                      <td className="py-3.5 px-4 font-mono-num text-slate-600">{row.email}</td>
                      <td className="py-3.5 px-4 font-mono-num text-slate-600">{row.idCard}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. 详情页底部三段式审核与晋级说明 */}
          <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500 leading-relaxed">
              三段式审核规则：①【高校审核】核验信息真实性 &rarr; ②【申报晋级队伍】勾选已通过校内赛的队伍、排序排名并上传校赛证明 &rarr; ③【秘书处审核】按高校维度终审通过后沉淀至【最终参赛队伍清单】。
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 渲染子视图 3B：队伍数据管理 —— 【编辑队伍（管理员后门逻辑）】
  // ==========================================================================
  if (subView === 'team-edit' && editTeamDraft) {
    return (
      <div className="space-y-6 pb-12 max-w-6xl 2xl:max-w-[1400px] mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSubView('team-list')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0284C7] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回查看报名列表</span>
          </button>
        </div>

        {backdoorFeedback && (
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-900 flex items-center justify-between">
            <span>{backdoorFeedback}</span>
            <button
              type="button"
              onClick={() => setBackdoorFeedback(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-8">
          {/* 1. 基础修改：队伍名称、队伍LOGO、队伍简介 */}
          <section className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              一、基础信息修改（队伍名称、队伍LOGO、队伍简介）
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              <div className="sm:col-span-5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    队伍名称
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={editTeamDraft.teamName}
                    onChange={(e) =>
                      setEditTeamDraft({ ...editTeamDraft, teamName: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    队伍 LOGO
                  </label>
                  <div className="flex items-center gap-3.5">
                    <TeamLogoAvatar
                      logo={editTeamDraft.teamLogo}
                      teamName={editTeamDraft.teamName}
                      size="md"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>上传修改LOGO</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={handleEditTeamLogoUpload}
                            className="hidden"
                          />
                        </label>
                        {editTeamDraft.teamLogo &&
                          editTeamDraft.teamLogo !== 'default-logo' && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditTeamDraft({
                                  ...editTeamDraft,
                                  teamLogo: 'default-logo',
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                            >
                              恢复默认LOGO
                            </button>
                          )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        支持 PNG / JPG / WebP / SVG 格式，文件大小 ≤ 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-7">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  队伍简介
                </label>
                <textarea
                  rows={4}
                  maxLength={100}
                  value={editTeamDraft.teamIntro || ''}
                  onChange={(e) =>
                    setEditTeamDraft({ ...editTeamDraft, teamIntro: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* 2. 成员修改（含移除队长强制指定新队长、点击【编辑】增删角色标签、添加成员直接分配角色与 [√] 强行特批加入后门） */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                二、成员与队内角色修改（支持点击【编辑】增删角色标签 · 特权添加或替换队员时可直接分配角色）
              </h3>
              <span className="text-xs text-slate-500">
                管理员可在此直接调整已锁定队伍的成员名单及队内 CTF 角色
              </span>
            </div>

            {/* 队长行（支持点击【编辑】修改队长角色标签） */}
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5">
                <div className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#0284C7] text-white text-xs">
                    当前队长
                  </span>
                  <span>{editTeamDraft.captainName}</span>
                  <span className="text-xs text-slate-500">
                    （{editTeamDraft.captainUniversity}）
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-semibold">队内角色：</span>
                  <CtfRoleBadges roles={editTeamDraft.captainCtfRoles} emptyText="待分配" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center shrink-0">
                <CtfRoleSelectorDropdown
                  selectedRoles={editTeamDraft.captainCtfRoles || []}
                  onChange={(nextRoles) =>
                    setEditTeamDraft({
                      ...editTeamDraft,
                      captainCtfRoles: nextRoles,
                    })
                  }
                  isOpen={backdoorRolePopoverId === 'captain'}
                  onToggleOpen={() =>
                    setBackdoorRolePopoverId((prev) =>
                      prev === 'captain' ? null : 'captain'
                    )
                  }
                  onClose={() => setBackdoorRolePopoverId(null)}
                  triggerLabel="编辑"
                  compactTrigger
                />
                <button
                  type="button"
                  onClick={() => {
                    setNewCaptainSearchQuery('');
                    setNewCaptainSearchError(null);
                    setSelectedNewCaptainMemberId(
                      editTeamDraft.members[0]?.id || newCaptainCandidates[0]?.id || ''
                    );
                    setRemoveCaptainModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>移除队长（需指定新队长）</span>
                </button>
              </div>
            </div>

            {/* 队员与指导教师列表（支持点击某队员旁的【编辑】为其增删角色标签） */}
            <div className="space-y-2.5">
              {[...editTeamDraft.members, ...editTeamDraft.advisors].map((person) => (
                <div
                  key={person.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          person.role === 'advisor'
                            ? 'bg-sky-100 text-[#0369A1]'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {person.role === 'advisor' ? '指导教师' : '队员'}
                      </span>
                      <span>{person.name}</span>
                      <span className="text-xs text-slate-500">（{person.university}）</span>
                      {!person.isVerified && (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          特批免认证加入
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-semibold">
                        队内角色：
                      </span>
                      <CtfRoleBadges
                        roles={person.ctfRoles}
                        isAdvisor={person.role === 'advisor'}
                        emptyText="待分配"
                      />
                    </div>
                    <div className="text-xs text-slate-500 font-mono-num">
                      手机：{maskPhone(person.phone)} | 邮箱：{maskEmail(person.email)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                    {person.role === 'member' && (
                      <CtfRoleSelectorDropdown
                        selectedRoles={person.ctfRoles || []}
                        onChange={(nextRoles) =>
                          setEditTeamDraft({
                            ...editTeamDraft,
                            members: editTeamDraft.members.map((m) =>
                              m.id === person.id ? { ...m, ctfRoles: nextRoles } : m
                            ),
                          })
                        }
                        isOpen={backdoorRolePopoverId === person.id}
                        onToggleOpen={() =>
                          setBackdoorRolePopoverId((prev) =>
                            prev === person.id ? null : person.id
                          )
                        }
                        onClose={() => setBackdoorRolePopoverId(null)}
                        triggerLabel="编辑"
                        compactTrigger
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (backdoorRolePopoverId === person.id) {
                          setBackdoorRolePopoverId(null);
                        }
                        const nextMembers = editTeamDraft.members.filter(
                          (m) => m.id !== person.id
                        );
                        const nextAdvisors = editTeamDraft.advisors.filter(
                          (a) => a.id !== person.id
                        );
                        setEditTeamDraft({
                          ...editTeamDraft,
                          members: nextMembers,
                          advisors: nextAdvisors,
                        });
                        setBackdoorFeedback(
                          `已将「${person.name}」移出队伍（保存后系统将自动向其发送站内信通知）。`
                        );
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>移除</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 管理员后门添加成员搜索框（添加队员时可直接分配角色） */}
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800">
                  添加/替换成员（支持检测未认证 / 跨校规则拦截，提供【强行特批加入】后门特权，并可直接分配角色）
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setBackdoorAddRole('member')}
                    className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                      backdoorAddRole === 'member'
                        ? 'bg-[#0284C7] text-white'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    添加为队员
                  </button>
                  <button
                    type="button"
                    onClick={() => setBackdoorAddRole('advisor')}
                    className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                      backdoorAddRole === 'advisor'
                        ? 'bg-[#0284C7] text-white'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    添加为指导教师
                  </button>
                </div>
              </div>

              {/* 添加为队员时，支持直接勾选分配 CTF 角色 */}
              {backdoorAddRole === 'member' && (
                <div className="p-3 rounded-lg bg-white border border-slate-200 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">
                    直接分配队内角色（可多选）：
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {CTF_ROLE_OPTIONS.map((role) => {
                      const checked = backdoorAddCtfRoles.includes(role);
                      return (
                        <label
                          key={role}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                            checked
                              ? 'bg-sky-50 border-[#0284C7] text-[#0369A1]'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setBackdoorAddCtfRoles((prev) =>
                                prev.includes(role)
                                  ? prev.filter((r) => r !== role)
                                  : CTF_ROLE_OPTIONS.filter(
                                      (r) => r === role || prev.includes(r)
                                    )
                              );
                            }}
                            className="w-3.5 h-3.5 rounded text-[#0284C7] cursor-pointer"
                          />
                          <span>{role}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={backdoorSearchQuery}
                  onChange={(e) => setBackdoorSearchQuery(e.target.value)}
                  placeholder="输入手机号或邮箱搜索用户..."
                  className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleBackdoorSearchAndAdd()}
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
                >
                  搜索并添加
                </button>
              </div>

              {/* 快捷测试触发器（演示拦截与后门特批） */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span>快捷测试后门拦截：</span>
                <button
                  type="button"
                  onClick={() => {
                    setBackdoorAddRole('advisor');
                    handleBackdoorSearchAndAdd('13800138003');
                  }}
                  className="px-2.5 py-1 rounded bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 font-mono-num cursor-pointer"
                >
                  + 测未认证用户: 周明 (13800138003)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBackdoorAddRole('advisor');
                    handleBackdoorSearchAndAdd('13800138002');
                  }}
                  className="px-2.5 py-1 rounded bg-white border border-red-200 text-red-700 hover:bg-red-50 font-mono-num cursor-pointer"
                >
                  + 测跨校用户: 孙立群/清华大学 (13800138002)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBackdoorAddRole('member');
                    handleBackdoorSearchAndAdd('13910010002');
                  }}
                  className="px-2.5 py-1 rounded bg-white border border-sky-200 text-[#0369A1] hover:bg-sky-50 font-mono-num cursor-pointer"
                >
                  + 测合规用户: 陈思远 (13910010002)
                </button>
              </div>

              {/* 规则拦截提示框 + [√] 强行特批加入 (跳过规则校验) */}
              {backdoorInterceptAlert && (
                <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 space-y-3">
                  <div className="text-xs font-extrabold text-red-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>系统规则校验拦截（无法按常规方式拉入）：</span>
                  </div>
                  <ul className="list-disc pl-5 text-xs text-red-700 space-y-1">
                    {backdoorInterceptAlert.reasons.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>

                  {/* 后门特权勾选区 */}
                  <div className="pt-2.5 border-t border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-900 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={backdoorForceOverrideChecked}
                        onChange={(e) => setBackdoorForceOverrideChecked(e.target.checked)}
                        className="w-4 h-4 accent-red-600 cursor-pointer"
                      />
                      <span>[√] 强行特批加入 (跳过规则校验)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBackdoorInterceptAlert(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-white rounded-lg cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        disabled={!backdoorForceOverrideChecked}
                        onClick={() =>
                          handleBackdoorSearchAndAdd(
                            backdoorInterceptAlert.candidate.phone,
                            true
                          )
                        }
                        className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer"
                      >
                        确认特批强行拉入
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setSubView('team-list')}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveAdminBackdoorEdit}
              className="px-6 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              保存修改（保持原审核状态并记入审计日志）
            </button>
          </div>
        </div>

        {/* 移除队长时强制弹出“请指定新队长”弹窗（带搜索输入框，支持按手机号或邮箱搜索） */}
        {removeCaptainModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 text-amber-900 font-extrabold text-sm flex items-center justify-between">
                <span>请指定新队长</span>
                <button
                  type="button"
                  onClick={() => setRemoveCaptainModalOpen(false)}
                  className="text-amber-700/70 hover:text-amber-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  您正在移除当前队长 <strong>{editTeamDraft.captainName}</strong>。队伍不可无队长，请输入手机号或邮箱搜索并指定一名新队长：
                </p>

                {/* 带搜索的输入框（支持按手机号或邮箱搜索） */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={newCaptainSearchQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewCaptainSearchQuery(val);
                          setNewCaptainSearchError(null);
                          const q = val.trim().toLowerCase();
                          if (q) {
                            const matched = newCaptainCandidates.find(
                              (c) =>
                                c.phone.toLowerCase().includes(q) ||
                                c.email.toLowerCase().includes(q) ||
                                c.name.toLowerCase().includes(q)
                            );
                            if (matched) {
                              setSelectedNewCaptainMemberId(matched.id);
                            }
                          }
                        }}
                        placeholder="输入手机号或邮箱搜索新队长..."
                        className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-[#0284C7] focus:outline-none"
                      />
                    </div>
                    {newCaptainSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewCaptainSearchQuery('');
                          setNewCaptainSearchError(null);
                        }}
                        className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer shrink-0"
                      >
                        清空
                      </button>
                    )}
                  </div>

                  {newCaptainSearchError && (
                    <div className="text-xs font-semibold text-red-600">
                      {newCaptainSearchError}
                    </div>
                  )}
                </div>

                {/* 搜索结果 / 候选人选择列表 */}
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/50">
                  {filteredNewCaptainCandidates.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      未找到匹配该手机号或邮箱的用户
                    </div>
                  ) : (
                    filteredNewCaptainCandidates.map((cand) => {
                      const isSelected = selectedNewCaptainMemberId === cand.id;
                      return (
                        <button
                          key={cand.id}
                          type="button"
                          onClick={() => {
                            setSelectedNewCaptainMemberId(cand.id);
                            setNewCaptainSearchError(null);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50/90 text-slate-900'
                              : 'bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold flex items-center gap-2 flex-wrap">
                              <span>{cand.name}</span>
                              <span className="text-xs font-normal text-slate-500">
                                （{cand.university}）
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  cand.source === 'team_member'
                                    ? 'bg-sky-100 text-[#0369A1]'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {cand.source === 'team_member' ? '本队现有队员' : '平台用户'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono-num mt-0.5 truncate">
                              手机：{cand.phone} · 邮箱：{cand.email}
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-[#0284C7] bg-[#0284C7] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRemoveCaptainModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReplaceCaptain}
                    className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    确认移交队长并移除原队长
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
  // 渲染子视图 3：查看报名列表页（重构为“三段式”三大纯净 TAB）
  //   Tab 1：【高校资格审核】（信息真实性核验 + 【申报晋级队伍】弹窗提报 + 【撤回提报】）
  //   Tab 2：【晋级名单审核】（秘书处终审：按“高校维度”聚合审核晋级名单与校赛成绩证明材料）
  //   Tab 3：【最终参赛队伍清单】（只读：沉淀所有秘书处终审通过的最终参赛队伍，支持多维筛选与导出）
  // ==========================================================================
  if (subView === 'team-list') {
    const effectiveAuditTab: 'school' | 'secretariat' | 'final_roster' =
      adminRole === 'school_admin' && activeAuditTab === 'secretariat'
        ? 'school'
        : activeAuditTab;
    const isCurrentStageSwitchEnabled =
      effectiveAuditTab === 'school' ? isSchoolStageOpen : isSecretariatStageOpen;

    // 若用户在查看报名列表页期间切换了角色，且对应审核开关未开启，展示未开启拦截页
    if (adminRole === 'school_admin' && !isSchoolStageOpen) {
      return (
        <div className="space-y-5 pb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSubView('reg-list')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0284C7] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回报名管理列表</span>
            </button>
            <span className="text-xs text-slate-500">
              当前赛事：{activeEventForTeams.title}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200 p-12 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              当前赛事高校审核暂未开启，请等待组委会通知
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              组委会超级管理员尚未开启《{activeEventForTeams.title}》的【高校审核阶段】开关。开关开启前，前台队长提交报名后显示【已提交】，高校管理员暂无法进入队伍列表审核。
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSubView('reg-list')}
                className="px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
              >
                返回报名管理列表
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (
      adminRole === 'secretariat_admin' &&
      (!isSchoolStageOpen || !isSecretariatStageOpen)
    ) {
      return (
        <div className="space-y-5 pb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSubView('reg-list')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0284C7] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回报名管理列表</span>
            </button>
            <span className="text-xs text-slate-500">
              当前赛事：{activeEventForTeams.title}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200 p-12 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              当前赛事秘书处审核暂未开启，请等待组委会通知
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              组委会超级管理员尚未开启《{activeEventForTeams.title}》的【秘书处审核阶段】开关，秘书处管理员暂无法进入队伍列表执行终审。
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSubView('reg-list')}
                className="px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
              >
                返回报名管理列表
              </button>
            </div>
          </div>
        </div>
      );
    }

    const isAllSelected =
      filteredEventTeams.length > 0 &&
      filteredEventTeams.every((t) => selectedTeamIds.includes(t.id));

    // 【晋级名单提报弹窗】左侧待选池与右侧已选/排序池数据计算
    const modalApprovedTeams = captainTeams.filter(
      (t) =>
        t.competitionId === activeEventIdForTeams &&
        t.university === advancementModalUniversity &&
        t.status !== 'draft' &&
        t.status !== 'inviting' &&
        resolveTeamAuditStages(t).schoolStatus === 'approved'
    );
    const modalLeftPoolTeams = modalApprovedTeams.filter(
      (t) =>
        !advancementSelectedTeamIds.includes(t.id) &&
        (advancementPoolTrackFilter === 'all' ||
          t.subTrackName === advancementPoolTrackFilter)
    );
    const modalRightSelectedTeams = advancementSelectedTeamIds
      .map((id) => modalApprovedTeams.find((t) => t.id === id))
      .filter((t): t is CaptainTeamRecord => Boolean(t));

    return (
      <div className="space-y-5 pb-12">
        {/* 顶部面包屑 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setSubView('reg-list')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0284C7] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回报名管理列表</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1">
              当前赛事：{activeEventForTeams.title}
            </span>
            {adminRole === 'school_admin' && (
              <span className="px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-[11px] font-bold text-[#0284C7]">
                数据权限隔离：WHERE 院校ID = {adminInstitutionId}（仅显示【{adminInstitutionName}】本校队伍）
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500" />
        </div>

        {/* ===================================================================
            全局审核开关控制栏（UI位置：查看报名队伍列表页 -> 列表顶部 / 筛选区上方）
            权限限制：仅组委会超级管理员 (super_admin) 能看到并操作这两个开关
           =================================================================== */}
        {adminRole === 'super_admin' && (
          <div className="bg-gradient-to-r from-sky-50/90 via-white to-indigo-50/50 rounded-2xl border border-sky-200/90 p-4 sm:p-5 text-slate-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* 开关1：高校审核阶段 [未开启 / 已开启] */}
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                <span className="text-xs font-bold text-slate-700">
                  开关1：高校审核阶段
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleAuditStageSwitch('school')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold inline-flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isSchoolStageOpen
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                >
                  {isSchoolStageOpen ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>已开启</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>未开启</span>
                    </>
                  )}
                </button>
              </div>

              {/* 开关2：秘书处审核阶段 [未开启 / 已开启] */}
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                <span className="text-xs font-bold text-slate-700">
                  开关2：秘书处审核阶段
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleAuditStageSwitch('secretariat')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold inline-flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isSecretariatStageOpen
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                >
                  {isSecretariatStageOpen ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>已开启</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>未开启</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            三大 TAB 导航栏：
            1. 高校资格审核
            2. 晋级名单审核
            3. 最终参赛队伍清单
           =================================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* 高校审核 */}
            <button
              type="button"
              onClick={() => {
                setActiveAuditTab('school');
                setSelectedTeamIds([]);
                setFilterAuditStatusInput('all');
                setAppliedTeamFilters((prev) => ({ ...prev, auditStatus: 'all' }));
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer ${
                effectiveAuditTab === 'school'
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>高校审核</span>
            </button>

            {/* 晋级名单审核 */}
            {adminRole !== 'school_admin' && (
              <button
                type="button"
                onClick={() => {
                  setActiveAuditTab('secretariat');
                  setSelectedTeamIds([]);
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer ${
                  effectiveAuditTab === 'secretariat'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>晋级队伍审核</span>
              </button>
            )}

            {/* 最终参赛队伍清单 */}
            <button
              type="button"
              onClick={() => {
                setActiveAuditTab('final_roster');
                setSelectedTeamIds([]);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer ${
                effectiveAuditTab === 'final_roster'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>最终参赛队伍清单</span>
            </button>
          </div>

          {/* 当处于【高校资格审核】Tab 时，右侧展示当前提报院校与【申报晋级队伍】/【撤回提报】操作 */}
          {effectiveAuditTab === 'school' && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {adminRole !== 'school_admin' ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-slate-600">当前提报院校：</span>
                  <select
                    value={activeSchoolContextInTab1}
                    onChange={(e) => setActiveSchoolContextInTab1(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none cursor-pointer"
                  >
                    {availableSchoolsInCurrentEvent.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-600">
                  当前提报院校：【{targetUniversityForAdvancement}】
                </span>
              )}

              {currentSchoolSubmission && currentSchoolSubmission.status === 'pending' && (
                <button
                  type="button"
                  onClick={() =>
                    handleWithdrawAdvancementSubmission(targetUniversityForAdvancement)
                  }
                  className="px-3.5 py-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>撤回提报</span>
                </button>
              )}

              <button
                type="button"
                disabled={currentSchoolSubmission?.status === 'approved'}
                onClick={() => handleOpenAdvancementModal(targetUniversityForAdvancement)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {currentSchoolSubmission?.status === 'rejected'
                    ? '重新申报晋级队伍'
                    : currentSchoolSubmission?.status === 'withdrawn'
                    ? '申报晋级队伍'
                    : currentSchoolSubmission?.status === 'pending'
                    ? '修改已提报晋级名单'
                    : '申报晋级队伍'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ===================================================================
            TAB 1 视图：【高校资格审核】
           =================================================================== */}
        {effectiveAuditTab === 'school' && (
          <div className="space-y-4">
            {/* 1. 搜索筛选与批量操作区 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 关键字：队伍名称 / 队长姓名 / 队长手机号 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    关键字（队伍名/队长姓名/手机号）
                  </label>
                  <input
                    type="text"
                    value={filterKeywordInput}
                    onChange={(e) => setFilterKeywordInput(e.target.value)}
                    placeholder="单框多匹配检索..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                {/* 所属院校 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    所属院校{adminRole === 'school_admin' ? '（已绑定本校）' : '（模糊匹配）'}
                  </label>
                  <input
                    type="text"
                    value={
                      adminRole === 'school_admin'
                        ? adminInstitutionName
                        : filterSchoolInput
                    }
                    disabled={adminRole === 'school_admin'}
                    onChange={(e) => setFilterSchoolInput(e.target.value)}
                    placeholder="如：北京航空航天大学"
                    className={`w-full px-3 py-2 text-xs border rounded-lg ${
                      adminRole === 'school_admin'
                        ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed font-bold'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#0284C7] focus:outline-none'
                    }`}
                  />
                </div>

                {/* 高校审核状态 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    高校审核状态
                  </label>
                  <select
                    value={filterAuditStatusInput}
                    onChange={(e) =>
                      setFilterAuditStatusInput(e.target.value as 'all' | TwoStageAuditStatus)
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0284C7] focus:outline-none cursor-pointer"
                  >
                    <option value="all">全部状态</option>
                    <option value="pending">待审核</option>
                    <option value="approved">已通过</option>
                    <option value="rejected">已驳回</option>
                  </select>
                </div>

                {/* 报名时间范围 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    报名时间范围
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={filterDateStartInput}
                      onChange={(e) => setFilterDateStartInput(e.target.value)}
                      className="w-full px-2 py-2 text-[11px] font-mono-num bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="date"
                      value={filterDateEndInput}
                      onChange={(e) => setFilterDateEndInput(e.target.value)}
                      className="w-full px-2 py-2 text-[11px] font-mono-num bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 查询与重置按钮 + 顶部全局操作栏 */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleTriggerExportExcel(false)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>
                      导出Excel ({selectedTeamIds.length > 0 ? `已选${selectedTeamIds.length}项` : '当前筛选全部'})
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedTeamIds.length === 0 || !isCurrentStageSwitchEnabled}
                    onClick={() => {
                      setRejectReasonText('');
                      setAuditError(null);
                      setAuditModalState({
                        mode: 'batch',
                        stage: 'school',
                        teamIds: selectedTeamIds,
                        decision: 'approve',
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      批量高校审核 ({selectedTeamIds.length})
                      {!isCurrentStageSwitchEnabled ? ' [阶段已关闭]' : ''}
                    </span>
                  </button>

                  {adminRole === 'super_admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setImportErrorReport(null);
                        setImportSuccessMsg(null);
                        setImportModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>导入线下数据</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAppliedTeamFilters({
                        keyword: filterKeywordInput,
                        school:
                          adminRole === 'school_admin'
                            ? adminInstitutionName
                            : filterSchoolInput,
                        track: filterTrackInput,
                        auditStatus: filterAuditStatusInput,
                        dateStart: filterDateStartInput,
                        dateEnd: filterDateEndInput,
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>查询</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterKeywordInput('');
                      setFilterSchoolInput(
                        adminRole === 'school_admin' ? adminInstitutionName : ''
                      );
                      setFilterTrackInput('all');
                      setFilterAuditStatusInput('all');
                      setFilterDateStartInput('');
                      setFilterDateEndInput('');
                      setAppliedTeamFilters({
                        keyword: '',
                        school:
                          adminRole === 'school_admin' ? adminInstitutionName : '',
                        track: 'all',
                        auditStatus: 'all',
                        dateStart: '',
                        dateEnd: '',
                      });
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>重置</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Tab 1 列表数据区 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                      <th className="py-3.5 pl-5 pr-2 w-10">
                        <button
                          type="button"
                          onClick={() => {
                            if (isAllSelected) {
                              setSelectedTeamIds([]);
                            } else {
                              setSelectedTeamIds(filteredEventTeams.map((t) => t.id));
                            }
                          }}
                          className="text-slate-500 hover:text-[#0284C7] cursor-pointer flex items-center"
                        >
                          {isAllSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#0284C7]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-3.5 px-4 whitespace-nowrap">队伍LOGO / 队伍名称</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">所属院校</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">队伍人数</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">队长姓名 / 手机号</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">报名状态</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">高校审核</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">秘书处审核</th>
                      <th className="py-3.5 pr-5 pl-4 text-right whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs bg-white">
                    {filteredEventTeams.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          当前筛选条件下暂无报名队伍数据
                        </td>
                      </tr>
                    ) : (
                      filteredEventTeams.map((team) => {
                        const isChecked = selectedTeamIds.includes(team.id);
                        const stages = resolveTeamAuditStages(team);
                        const canAuditInSchoolTab =
                          isSchoolStageOpen && stages.schoolStatus !== 'none';

                        return (
                          <tr
                            key={team.id}
                            className={`hover:bg-sky-50/40 transition-colors ${
                              isChecked ? 'bg-sky-50/60' : ''
                            }`}
                          >
                            <td className="py-4 pl-5 pr-2 align-middle">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedTeamIds((prev) =>
                                    prev.includes(team.id)
                                      ? prev.filter((id) => id !== team.id)
                                      : [...prev, team.id]
                                  )
                                }
                                className="text-slate-400 hover:text-[#0284C7] cursor-pointer flex items-center"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-[#0284C7]" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>

                            {/* 队伍LOGO + 队伍名称 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <TeamLogoAvatar
                                  logo={team.teamLogo}
                                  teamName={team.teamName}
                                  size="sm"
                                />
                                <div>
                                  <div className="font-extrabold text-slate-900">
                                    {team.teamName}
                                  </div>
                                  {team.teamIntro && (
                                    <div className="text-[11px] text-slate-400 max-w-[180px] xl:max-w-[220px] truncate">
                                      {team.teamIntro}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* 所属院校 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap font-semibold text-slate-700">
                              {team.university}
                            </td>

                            {/* 队伍人数 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <div className="font-bold text-slate-900 font-mono-num">
                                {1 + team.members.length} 人
                              </div>
                              {team.advisors.length > 0 && (
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  指导教师 {team.advisors.length} 人
                                </div>
                              )}
                            </td>

                            {/* 队长姓名 / 手机号 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <div className="font-bold text-slate-900">{team.captainName}</div>
                              <div className="text-[11px] font-mono-num text-slate-500">
                                {maskPhone(resolveTeamCaptainContact(team, platformUsers).phone)}
                              </div>
                            </td>

                            {/* 报名状态（与前台个人中心【我的报名】保持一致，移至高校审核列前） */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5 text-xs">
                                <span className={`w-2 h-2 rounded-full ${stages.regDotClass}`} />
                                <span className={stages.regColorClass}>
                                  {stages.regStatusLabel}
                                </span>
                              </div>
                            </td>

                            {/* 高校审核（与前台个人中心【我的报名】保持一致） */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <AuditStageBadgeWithTooltip
                                status={stages.schoolStatus}
                                customLabel={stages.schoolBadgeLabel}
                                rejectReason={stages.schoolReason}
                                stage="school"
                                stageLabel="高校审核"
                              />
                            </td>

                            {/* 秘书处审核（与前台个人中心【我的报名】保持一致） */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <AuditStageBadgeWithTooltip
                                status={stages.secretariatStatus}
                                customLabel={stages.secretariatBadgeLabel}
                                rejectReason={stages.secretariatReason}
                                stage="secretariat"
                                stageLabel="秘书处审核"
                              />
                            </td>

                            {/* 单行操作栏 */}
                            <td className="py-4 pr-5 pl-4 align-middle text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTeamId(team.id);
                                    setSubView('team-detail');
                                  }}
                                  className="text-slate-700 hover:text-[#0284C7] font-bold cursor-pointer"
                                >
                                  查看
                                </button>
                                {adminRole === 'super_admin' && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAdminBackdoorEdit(team)}
                                    className="text-[#0284C7] hover:text-[#0369A1] font-bold cursor-pointer"
                                  >
                                    编辑
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={!canAuditInSchoolTab}
                                  onClick={() => {
                                    setRejectReasonText('');
                                    setAuditError(null);
                                    setAuditModalState({
                                      mode: 'single',
                                      stage: 'school',
                                      teamIds: [team.id],
                                      decision: 'approve',
                                    });
                                  }}
                                  className={`px-2.5 py-1 rounded border font-bold ${
                                    canAuditInSchoolTab
                                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer'
                                      : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                                  }`}
                                >
                                  通过
                                </button>
                                <button
                                  type="button"
                                  disabled={!canAuditInSchoolTab}
                                  onClick={() => {
                                    setRejectReasonText(stages.schoolReason || '');
                                    setAuditError(null);
                                    setAuditModalState({
                                      mode: 'single',
                                      stage: 'school',
                                      teamIds: [team.id],
                                      decision: 'reject',
                                    });
                                  }}
                                  className={`px-2.5 py-1 rounded border font-bold ${
                                    canAuditInSchoolTab
                                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 cursor-pointer'
                                      : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                                  }`}
                                >
                                  驳回
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2 视图：【晋级名单审核】
           =================================================================== */}
        {effectiveAuditTab === 'secretariat' && (
          <div className="space-y-4">
            {/* 筛选栏 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      秘书处审核状态
                    </label>
                    <select
                      value={secFilterStatus}
                      onChange={(e) =>
                        setSecFilterStatus(
                          e.target.value as 'all' | 'pending' | 'approved' | 'rejected'
                        )
                      }
                      className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:border-[#0284C7] focus:outline-none cursor-pointer"
                    >
                      <option value="all">全部状态</option>
                      <option value="pending">待审核</option>
                      <option value="approved">已通过</option>
                      <option value="rejected">已驳回</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      关键字（提报高校 / 晋级队伍名）
                    </label>
                    <div className="relative w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={secFilterKeyword}
                        onChange={(e) => setSecFilterKeyword(e.target.value)}
                        placeholder="搜索高校名称或队伍名..."
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0284C7] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSecFilterStatus('all');
                      setSecFilterKeyword('');
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>重置</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 晋级名单审核列表 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                      <th className="py-3.5 px-5 whitespace-nowrap">提报高校</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">提报队伍数量</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">提报时间</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">提报人</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">秘书处审核</th>
                      <th className="py-3.5 px-5 text-right whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs bg-white">
                    {filteredUniversitySubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          当前暂无高校提报的晋级名单数据
                        </td>
                      </tr>
                    ) : (
                      filteredUniversitySubmissions.map((sub) => {
                        const subTeams = sub.teamIds
                          .map((id) => captainTeams.find((t) => t.id === id))
                          .filter((t): t is CaptainTeamRecord => Boolean(t));

                        return (
                          <tr key={sub.id} className="hover:bg-sky-50/40 transition-colors">
                            {/* 提报高校（仅展示学校名称） */}
                            <td className="py-4 px-5 align-middle whitespace-nowrap font-extrabold text-slate-900">
                              {sub.university}
                            </td>

                            {/* 提报队伍数量（仅展示数量） */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap font-bold text-slate-900 font-mono-num">
                              {subTeams.length}
                            </td>

                            {/* 提报时间 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap font-mono-num text-slate-700">
                              {sub.submittedAt}
                            </td>

                            {/* 提报人（仅展示人名） */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap font-semibold text-slate-800">
                              {formatSubmittedByPersonName(sub.submittedBy)}
                            </td>

                            {/* 秘书处审核 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <AuditStageBadgeWithTooltip
                                status={
                                  sub.status === 'pending'
                                    ? 'pending'
                                    : sub.status === 'approved'
                                    ? 'approved'
                                    : 'rejected'
                                }
                                rejectReason={sub.rejectReason}
                                stage="secretariat"
                                stageLabel="秘书处审核"
                              />
                            </td>

                            {/* 操作：【查看详情】、【审核通过】、【驳回】 */}
                            <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveUniversitySubmissionDetail(sub)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
                                >
                                  查看详情
                                </button>
                                <button
                                  type="button"
                                  disabled={!isSecretariatStageOpen}
                                  onClick={() => {
                                    setSecBatchRejectReason('');
                                    setSecBatchAuditError(null);
                                    setSecBatchAuditModal({
                                      submission: sub,
                                      decision: 'approve',
                                    });
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold cursor-pointer"
                                >
                                  审核通过
                                </button>
                                <button
                                  type="button"
                                  disabled={!isSecretariatStageOpen}
                                  onClick={() => {
                                    setSecBatchRejectReason(sub.rejectReason || '');
                                    setSecBatchAuditError(null);
                                    setSecBatchAuditModal({
                                      submission: sub,
                                      decision: 'reject',
                                    });
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-40 text-red-700 font-bold cursor-pointer"
                                >
                                  驳回
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3 视图：【最终参赛队伍清单】
           =================================================================== */}
        {effectiveAuditTab === 'final_roster' && (
          <div className="space-y-4">
            {/* 筛选与导出栏 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    赛事范围
                  </label>
                  <select
                    value={finalRosterScopeEvent}
                    onChange={(e) =>
                      setFinalRosterScopeEvent(e.target.value as 'current' | 'all')
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0284C7] focus:outline-none cursor-pointer font-semibold"
                  >
                    <option value="current">
                      当前赛事（{activeEventForTeams.title} · {eventAuditTabCounts.finalRosterCurrentEventCount}支）
                    </option>
                    <option value="all">
                      全部赛事汇总（共 {eventAuditTabCounts.finalRosterAllEventsCount} 支）
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    所属高校
                  </label>
                  <input
                    type="text"
                    value={
                      adminRole === 'school_admin'
                        ? adminInstitutionName
                        : finalRosterSchoolFilter
                    }
                    disabled={adminRole === 'school_admin'}
                    onChange={(e) => setFinalRosterSchoolFilter(e.target.value)}
                    placeholder="输入高校名称筛选，如：上海交通大学"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    关键字（队伍名 / 队长 / 手机号）
                  </label>
                  <input
                    type="text"
                    value={finalRosterKeyword}
                    onChange={(e) => setFinalRosterKeyword(e.target.value)}
                    placeholder="输入队伍名称或队长姓名..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleTriggerExportExcel(
                      false,
                      filteredFinalRosterTeams,
                      `${activeEventForTeams.title}_最终参赛队伍清单_含校内排名`
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>导出最终参赛队伍清单 (Excel)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFinalRosterScopeEvent('current');
                    if (adminRole !== 'school_admin') {
                      setFinalRosterSchoolFilter('');
                    }
                    setFinalRosterKeyword('');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>重置</span>
                </button>
              </div>
            </div>

            {/* 最终参赛队伍清单表格 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                      <th className="py-3.5 px-4 whitespace-nowrap">校内排名</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">队伍LOGO / 队伍名称</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">所属高校 / 所在地 / 赛区</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">队长 / 手机号</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">队伍人数</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">指导教师</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">终审通过时间</th>
                      <th className="py-3.5 px-5 text-right whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs bg-white">
                    {filteredFinalRosterTeams.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          当前筛选条件下暂无已通过秘书处终审的最终参赛队伍
                        </td>
                      </tr>
                    ) : (
                      filteredFinalRosterTeams.map((team) => {
                        const stages = resolveTeamAuditStages(team);
                        const capContact = resolveTeamCaptainContact(team, platformUsers);
                        const rankNum = stages.schoolRank || team.schoolRank || 1;
                        const locAndDiv = resolveUniversityLocationAndDivision(
                          team.university,
                          institutions,
                          divisions
                        );

                        return (
                          <tr key={team.id} className="hover:bg-emerald-50/30 transition-colors">
                            {/* 校内排名 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-extrabold font-mono-num">
                                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                                <span>第 {rankNum} 名</span>
                              </span>
                            </td>

                            {/* 队伍名称 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <TeamLogoAvatar
                                  logo={team.teamLogo}
                                  teamName={team.teamName}
                                  size="sm"
                                />
                                <div>
                                  <div className="font-extrabold text-slate-900">
                                    {team.teamName}
                                  </div>
                                  {finalRosterScopeEvent === 'all' && (
                                    <div className="text-[11px] text-slate-400 line-clamp-1">
                                      {team.competitionTitle}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* 所属高校 / 所在地 / 赛区 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <div className="font-bold text-[#0369A1]">{team.university}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {locAndDiv.locationText} ·{' '}
                                <span className="font-bold text-slate-700">
                                  {locAndDiv.divisionName}
                                </span>
                              </div>
                            </td>

                            {/* 队长 / 手机号 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <div className="font-bold text-slate-900">{team.captainName}</div>
                              <div className="text-[11px] font-mono-num text-slate-500">
                                {maskPhone(capContact.phone)}
                              </div>
                            </td>

                            {/* 队伍人数 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                              <div className="font-bold text-slate-900 font-mono-num">
                                {1 + team.members.length} 人
                              </div>
                              {team.advisors.length > 0 && (
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  指导教师 {team.advisors.length} 人
                                </div>
                              )}
                            </td>

                            {/* 指导教师 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap text-slate-700">
                              {team.advisors.length > 0
                                ? team.advisors.map((a) => a.name).join('、')
                                : '—'}
                            </td>

                            {/* 终审通过时间 */}
                            <td className="py-4 px-4 align-middle whitespace-nowrap font-mono-num text-slate-600">
                              {team.secretariatAuditedAt ||
                                team.approvedSnapshot?.approvedAt ||
                                team.updatedAt}
                            </td>

                            {/* 操作：【查看详情】 + 超级管理员/秘书处管理员【编辑】 */}
                            <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTeamId(team.id);
                                    setSubView('team-detail');
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 text-slate-700 hover:text-[#0284C7] font-bold cursor-pointer"
                                >
                                  查看详情
                                </button>
                                {(adminRole === 'super_admin' ||
                                  adminRole === 'secretariat_admin') && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAdminBackdoorEdit(team)}
                                    className="px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-[#0284C7] text-[#0284C7] hover:text-white font-bold cursor-pointer transition-colors"
                                  >
                                    编辑
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            核心弹窗 E：【晋级名单提报弹窗 (AdvancementSubmissionModal)】（不设晋级名额上限）
           =================================================================== */}
        {advancementModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-5xl w-full overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
              {/* 弹窗头部 */}
              <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-sky-600 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[11px] font-extrabold">
                    高校晋级提报
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold">
                    【{advancementModalUniversity}】申报晋级队伍与校内选拔排名
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAdvancementModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 弹窗主体区 */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* 驳回/撤回回显提示条 */}
                {currentSchoolSubmission &&
                  currentSchoolSubmission.university === advancementModalUniversity &&
                  (currentSchoolSubmission.status === 'rejected' ||
                    currentSchoolSubmission.status === 'withdrawn') && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                        currentSchoolSubmission.status === 'rejected'
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-extrabold">
                          {currentSchoolSubmission.status === 'rejected'
                            ? `秘书处终审驳回重报（已为您完整回显上次勾选的队伍、排名及证明材料）：`
                            : `撤回后重报（已为您完整回显原勾选队伍、校内排名及已上传证明附件）：`}
                        </div>
                        {currentSchoolSubmission.rejectReason && (
                          <div>驳回原因：{currentSchoolSubmission.rejectReason}</div>
                        )}
                      </div>
                    </div>
                  )}

                {advancementError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{advancementError}</span>
                  </div>
                )}

                {/* 左右双栏穿梭与排序区 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* 左侧（待选池）：展示所有已通过资格审核但尚未被选入右侧的队伍 */}
                  <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col h-[360px]">
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                          左侧：待选池（高校审核已通过）
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          待选 {modalLeftPoolTeams.length} 支 · 未被选入右侧的队伍将标记为“未晋级”
                        </div>
                      </div>
                    </div>

                    {/* 左侧快捷批量操作 */}
                    <div className="py-2.5 flex items-center justify-between gap-2 border-b border-slate-200/70 text-xs">
                      <button
                        type="button"
                        disabled={advancementPoolCheckedIds.length === 0}
                        onClick={() => {
                          setAdvancementError(null);
                          setAdvancementSelectedTeamIds((prev) => [
                            ...prev,
                            ...advancementPoolCheckedIds.filter((id) => !prev.includes(id)),
                          ]);
                          setAdvancementPoolCheckedIds([]);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer"
                      >
                        加入右侧晋级名单 ({advancementPoolCheckedIds.length}) &rarr;
                      </button>
                    </div>

                    {/* 左侧队伍列表 */}
                    <div className="flex-1 overflow-y-auto space-y-2 pt-2.5 pr-1">
                      {modalLeftPoolTeams.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center text-xs text-slate-400 px-4">
                          当前待选池暂无更多“已通过高校审核”的队伍
                        </div>
                      ) : (
                        modalLeftPoolTeams.map((team) => {
                          const checked = advancementPoolCheckedIds.includes(team.id);
                          return (
                            <div
                              key={team.id}
                              className={`p-3 rounded-xl border bg-white flex items-center justify-between gap-2.5 transition-colors ${
                                checked
                                  ? 'border-[#0284C7] bg-sky-50/40'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAdvancementPoolCheckedIds((prev) =>
                                      prev.includes(team.id)
                                        ? prev.filter((id) => id !== team.id)
                                        : [...prev, team.id]
                                    )
                                  }
                                  className="text-slate-400 hover:text-[#0284C7] cursor-pointer"
                                >
                                  {checked ? (
                                    <CheckSquare className="w-4 h-4 text-[#0284C7]" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                                <div className="min-w-0">
                                  <div className="text-xs font-extrabold text-slate-900 truncate">
                                    {team.teamName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate">
                                    队长：{team.captainName}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setAdvancementError(null);
                                  setAdvancementSelectedTeamIds((prev) =>
                                    prev.includes(team.id) ? prev : [...prev, team.id]
                                  );
                                  setAdvancementPoolCheckedIds((prev) =>
                                    prev.filter((id) => id !== team.id)
                                  );
                                }}
                                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-[#0284C7] text-[#0284C7] hover:text-white border border-sky-200 text-xs font-bold shrink-0 cursor-pointer transition-colors"
                              >
                                选入晋级 &rarr;
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* 右侧（已选/排序区）：支持上下拖拽排序、上下箭头、直接手动输入排名数字（赋予排名序号 1, 2, 3...） */}
                  <div className="lg:col-span-7 rounded-2xl border border-sky-200 bg-sky-50/30 p-4 flex flex-col h-[360px] transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <span>右侧：已选晋级名单与校内排名排序区</span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono-num font-extrabold bg-[#0284C7] text-white">
                            已选 {advancementSelectedTeamIds.length} 支
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          支持<strong>鼠标上下拖拽行</strong>、点击<strong>上下箭头</strong>或直接<strong>输入排名数字 (1, 2, 3...)</strong>调整校赛晋级名次
                        </div>
                      </div>

                      {advancementSelectedTeamIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setAdvancementSelectedTeamIds([])}
                          className="text-xs font-bold text-slate-500 hover:text-red-600 cursor-pointer"
                        >
                          清空已选
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1">
                      {modalRightSelectedTeams.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400 px-4 space-y-1">
                          <Trophy className="w-7 h-7 text-slate-300 stroke-[1.5]" />
                          <div>请从左侧【待选池】勾选或点击“选入晋级”添加本校晋级队伍</div>
                        </div>
                      ) : (
                        modalRightSelectedTeams.map((team, idx) => {
                          const rankNum = idx + 1;

                          return (
                            <div
                              key={team.id}
                              draggable
                              onDragStart={() => setAdvancementDragIndex(idx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => {
                                if (
                                  advancementDragIndex === null ||
                                  advancementDragIndex === idx
                                ) {
                                  return;
                                }
                                setAdvancementSelectedTeamIds((prev) => {
                                  const next = [...prev];
                                  const [moved] = next.splice(advancementDragIndex, 1);
                                  next.splice(idx, 0, moved);
                                  return next;
                                });
                                setAdvancementDragIndex(null);
                              }}
                              className="p-3 rounded-xl border border-slate-200 hover:border-[#0284C7] bg-white flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shadow-2xs cursor-move transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold font-mono-num shrink-0 ${
                                    rankNum === 1
                                      ? 'bg-amber-500 text-white'
                                      : rankNum === 2
                                      ? 'bg-sky-600 text-white'
                                      : 'bg-emerald-600 text-white'
                                  }`}
                                >
                                  校内第 {rankNum} 名
                                </span>
                                <div className="min-w-0">
                                  <div className="text-xs font-extrabold text-slate-900 truncate">
                                    {team.teamName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate">
                                    队长：{team.captainName}
                                  </div>
                                </div>
                              </div>

                              {/* 手动输入排名序号 + 上移/下移 + 移除 */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 mr-1">
                                  <span>设排名:</span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={modalRightSelectedTeams.length}
                                    value={rankNum}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10);
                                      if (!Number.isNaN(val)) {
                                        handleManualRankInputChange(team.id, val);
                                      }
                                    }}
                                    className="w-12 px-1.5 py-1 text-center font-mono-num font-bold text-xs border border-slate-300 rounded-md bg-slate-50 focus:bg-white focus:border-[#0284C7] focus:outline-none"
                                  />
                                </div>

                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveSelectedTeamRank(idx, 'up')}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                  title="名次上移"
                                >
                                  <ArrowUp className="w-3.5 h-3.5 text-slate-700" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === modalRightSelectedTeams.length - 1}
                                  onClick={() => handleMoveSelectedTeamRank(idx, 'down')}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                  title="名次下移"
                                >
                                  <ArrowDown className="w-3.5 h-3.5 text-slate-700" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAdvancementSelectedTeamIds((prev) =>
                                      prev.filter((id) => id !== team.id)
                                    )
                                  }
                                  className="px-2 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold cursor-pointer"
                                >
                                  移除
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* 底部（材料上传区）：【上传校赛成绩单/证明材料】（必填，支持 PDF/Excel/图片） */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                        底部材料上传区：上传校赛成绩单 / 晋级证明材料{' '}
                        <span className="text-red-500">*（必填）</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        支持上传 PDF、Excel（.xls/.xlsx）、盖章图片（.jpg/.png），作为秘书处终审核验各校晋级名次真实性的官方依据
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <label className="px-3.5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>上传校赛成绩单/证明材料</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            handleUploadAdvancementProofFiles(e.target.files);
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setAdvancementError(null);
                          setAdvancementProofFiles((prev) => [
                            ...prev,
                            {
                              id: `proof-demo-pdf-${Date.now()}`,
                              name: `${advancementModalUniversity}_2026校内选拔赛总成绩单(教务处盖章).pdf`,
                              size: '2.42 MB',
                              type: 'pdf',
                              uploadedAt: '2026-10-28 12:32:00',
                            },
                            {
                              id: `proof-demo-xls-${Date.now() + 1}`,
                              name: `${advancementModalUniversity}_校赛靶场原始积分明细表.xlsx`,
                              size: '0.68 MB',
                              type: 'excel',
                              uploadedAt: '2026-10-28 12:32:05',
                            },
                          ]);
                        }}
                        className="px-3 py-2 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-[#0284C7] text-xs font-bold cursor-pointer"
                      >
                        + 一键添加示例成绩单与盖章件
                      </button>
                    </div>
                  </div>

                  {advancementProofFiles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {advancementProofFiles.map((pf) => (
                        <div
                          key={pf.id}
                          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-[#0284C7] shrink-0" />
                            <span className="font-bold text-slate-800 truncate">{pf.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono-num shrink-0">
                              ({pf.size})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setAdvancementProofFiles((prev) =>
                                prev.filter((item) => item.id !== pf.id)
                              )
                            }
                            className="text-slate-400 hover:text-red-600 cursor-pointer p-1"
                            title="移除附件"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 弹窗底部操作栏 */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="text-xs text-slate-500">
                  提交后：已选中的 <strong>{advancementSelectedTeamIds.length}</strong> 支队伍状态变为【待秘书处终审】，本校其余未选中已通过队伍状态变为【未晋级（止步校赛）】。
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAdvancementModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    disabled={advancementSelectedTeamIds.length === 0}
                    onClick={handleConfirmAdvancementSubmit}
                    className="px-6 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold shadow-xs cursor-pointer"
                  >
                    确认提交秘书处
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            弹窗 F：Tab 2【查看高校晋级提报详情】弹窗（查看该校排名后的队伍列表 + 预览/下载证明附件）
           =================================================================== */}
        {activeUniversitySubmissionDetail && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold">
                    {activeUniversitySubmissionDetail.university} — 已提报{' '}
                    {activeUniversitySubmissionDetail.teamIds.length} 支晋级队伍
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveUniversitySubmissionDetail(null)}
                  className="text-white/80 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* 1. 提报概览 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div>
                      <span className="text-slate-500">提报高校：</span>
                      <strong className="text-slate-900">
                        {activeUniversitySubmissionDetail.university}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">提报人 / 提报时间：</span>
                      <span className="font-mono-num text-slate-700">
                        {formatSubmittedByPersonName(activeUniversitySubmissionDetail.submittedBy)} ·{' '}
                        {activeUniversitySubmissionDetail.submittedAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-semibold">秘书处审核：</span>
                    <AuditStageBadgeWithTooltip
                      status={
                        activeUniversitySubmissionDetail.status === 'pending'
                          ? 'pending'
                          : activeUniversitySubmissionDetail.status === 'approved'
                          ? 'approved'
                          : 'rejected'
                      }
                      rejectReason={activeUniversitySubmissionDetail.rejectReason}
                      stage="secretariat"
                      stageLabel="秘书处审核"
                    />
                  </div>
                </div>

                {/* 2. 该校排名后的晋级队伍清单 */}
                <div className="space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    一、高校校赛选拔排名与晋级队伍明细（共{' '}
                    {activeUniversitySubmissionDetail.teamIds.length} 支）
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                          <th className="py-3 px-4 whitespace-nowrap">校内选拔排名</th>
                          <th className="py-3 px-4 whitespace-nowrap">队伍名称</th>
                          <th className="py-3 px-4 whitespace-nowrap">队长 / 手机号</th>
                          <th className="py-3 px-4 whitespace-nowrap">队伍人数</th>
                          <th className="py-3 px-4 text-right whitespace-nowrap">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {activeUniversitySubmissionDetail.teamIds.map((tid, idx) => {
                          const team = captainTeams.find((t) => t.id === tid);
                          if (!team) return null;
                          const capContact = resolveTeamCaptainContact(team, platformUsers);
                          return (
                            <tr key={tid} className="hover:bg-sky-50/30">
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-extrabold font-mono-num">
                                  第 {idx + 1} 名
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                                {team.teamName}
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="font-bold text-slate-900">{team.captainName}</div>
                                <div className="text-[11px] font-mono-num text-slate-500">
                                  {maskPhone(capContact.phone)}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="font-bold text-slate-900 font-mono-num">
                                  {1 + team.members.length} 人
                                </div>
                                {team.advisors.length > 0 && (
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    指导教师 {team.advisors.length} 人
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => setModalTeamDetailId(team.id)}
                                  className="text-[#0284C7] hover:underline font-bold cursor-pointer"
                                >
                                  查看队伍详情
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. 校赛成绩证明附件列表 */}
                <div className="space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    二、高校上传的校赛成绩单与证明材料（共{' '}
                    {activeUniversitySubmissionDetail.proofFiles.length} 份）
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeUniversitySubmissionDetail.proofFiles.map((pf) => (
                      <div
                        key={pf.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-5 h-5 text-[#0284C7] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-slate-900 truncate">
                              {pf.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono-num">
                              大小：{pf.size} · 上传于 {pf.uploadedAt}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewProofFileModal(pf)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#0284C7] text-[#0284C7] text-xs font-bold shrink-0 cursor-pointer"
                        >
                          预览/下载
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 底部直接终审操作栏 */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveUniversitySubmissionDetail(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold cursor-pointer"
                >
                  关闭窗口
                </button>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSecBatchRejectReason(
                        activeUniversitySubmissionDetail.rejectReason || ''
                      );
                      setSecBatchAuditError(null);
                      setSecBatchAuditModal({
                        submission: activeUniversitySubmissionDetail,
                        decision: 'reject',
                      });
                    }}
                    className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold cursor-pointer"
                  >
                    驳回该校晋级名单
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSecBatchRejectReason('');
                      setSecBatchAuditError(null);
                      setSecBatchAuditModal({
                        submission: activeUniversitySubmissionDetail,
                        decision: 'approve',
                      });
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer shadow-xs"
                  >
                    审核通过
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            弹窗 F-2：点击【查看队伍详情】弹出的队伍详情弹窗（字段与另外两个Tab页队伍详情一致）
           =================================================================== */}
        {modalTeamDetailId &&
          (() => {
            const modalTeam = captainTeams.find((t) => t.id === modalTeamDetailId);
            if (!modalTeam) return null;
            const mStages = resolveTeamAuditStages(modalTeam);
            const mConfirmProgress = computeTeamConfirmProgress(modalTeam);
            const mCapContact = resolveTeamCaptainContact(modalTeam, platformUsers);
            const mPersonRows = [
              {
                id: 'cap-row',
                name: modalTeam.captainName,
                gender: getPersonGender(modalTeam.captainName),
                roleLabel: '队长',
                roleKey: 'captain' as const,
                ctfRoles: modalTeam.captainCtfRoles,
                university: modalTeam.captainUniversity,
                phone: maskPhone(mCapContact.phone),
                email: maskEmail(mCapContact.email),
                idCard: getMaskedIdCard(modalTeam.captainName),
              },
              ...modalTeam.members.map((m) => ({
                id: m.id,
                name: m.name,
                gender: getPersonGender(m.name),
                roleLabel: '队员',
                roleKey: 'member' as const,
                ctfRoles: m.ctfRoles,
                university: m.university,
                phone: maskPhone(m.phone),
                email: maskEmail(m.email),
                idCard: getMaskedIdCard(m.name + m.phone),
              })),
              ...modalTeam.advisors.map((a) => ({
                id: a.id,
                name: a.name,
                gender: getPersonGender(a.name),
                roleLabel: '指导教师',
                roleKey: 'advisor' as const,
                ctfRoles: undefined,
                university: a.university,
                phone: maskPhone(a.phone),
                email: maskEmail(a.email),
                idCard: getMaskedIdCard(a.name + a.phone),
              })),
            ];

            return (
              <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl border border-slate-200 max-w-5xl w-full overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white flex items-center justify-between shrink-0">
                    <h3 className="text-base sm:text-lg font-extrabold">
                      查看队伍详情 — {modalTeam.teamName}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setModalTeamDetailId(null)}
                      className="text-white/80 hover:text-white p-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* 1. 基础信息 */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                      <div className="flex items-start gap-5">
                        <TeamLogoAvatar
                          logo={modalTeam.teamLogo}
                          teamName={modalTeam.teamName}
                          size="lg"
                        />
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mr-1">
                              {modalTeam.teamName}
                            </h2>
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${mStages.regDotClass}`}
                              />
                              <span className={mStages.regColorClass}>
                                报名状态：{mStages.regStatusLabel}
                              </span>
                            </span>
                            {mStages.schoolRank && (
                              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold inline-flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                                <span>校内排名：第 {mStages.schoolRank} 名</span>
                              </span>
                            )}
                            <div className="inline-flex items-center gap-1.5 text-xs">
                              <span className="text-slate-500 font-semibold">高校审核：</span>
                              <AuditStageBadgeWithTooltip
                                status={mStages.schoolStatus}
                                rejectReason={mStages.schoolReason}
                                stage="school"
                                stageLabel="高校审核"
                                customLabel={mStages.schoolBadgeLabel}
                              />
                            </div>
                            <div className="inline-flex items-center gap-1.5 text-xs">
                              <span className="text-slate-500 font-semibold">秘书处审核：</span>
                              <AuditStageBadgeWithTooltip
                                status={mStages.secretariatStatus}
                                rejectReason={mStages.secretariatReason}
                                stage="secretariat"
                                stageLabel="秘书处审核"
                                customLabel={mStages.secretariatBadgeLabel}
                              />
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                            <strong>队伍简介：</strong>
                            {modalTeam.teamIntro || '专注网络与数据安全攻防技术研究。'}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                            <span>
                              所属院校：
                              <strong className="text-[#0369A1]">{modalTeam.university}</strong>
                            </span>
                            <span className="font-mono-num">报名时间：{modalTeam.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. 成员列表表格 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900">
                        队伍成员与指导教师明细（共 {mPersonRows.length} 人）
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                              <th className="py-3 px-4">姓名</th>
                              <th className="py-3 px-4">性别</th>
                              <th className="py-3 px-4">角色</th>
                              <th className="py-3 px-4">队内角色</th>
                              <th className="py-3 px-4">所属院校</th>
                              <th className="py-3 px-4">手机号(脱敏)</th>
                              <th className="py-3 px-4">邮箱(脱敏)</th>
                              <th className="py-3 px-4">身份证号(脱敏)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-xs bg-white">
                            {mPersonRows.map((row) => (
                              <tr key={row.id} className="hover:bg-sky-50/30">
                                <td className="py-3.5 px-4 font-bold text-slate-900">
                                  {row.name}
                                </td>
                                <td className="py-3.5 px-4 text-slate-600">{row.gender}</td>
                                <td className="py-3.5 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded font-bold ${
                                      row.roleKey === 'captain'
                                        ? 'bg-[#0284C7] text-white'
                                        : row.roleKey === 'advisor'
                                        ? 'bg-sky-100 text-[#0369A1]'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {row.roleLabel}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <CtfRoleBadges
                                    roles={row.ctfRoles}
                                    isAdvisor={row.roleKey === 'advisor'}
                                    emptyText="-"
                                  />
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-slate-700">
                                  {row.university}
                                </td>
                                <td className="py-3.5 px-4 font-mono-num text-slate-600">
                                  {row.phone}
                                </td>
                                <td className="py-3.5 px-4 font-mono-num text-slate-600">
                                  {row.email}
                                </td>
                                <td className="py-3.5 px-4 font-mono-num text-slate-600">
                                  {row.idCard}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* 底部三段式审核规则说明与关闭按钮 */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div className="text-xs text-slate-500 leading-relaxed">
                      三段式审核规则：①【高校审核】核验信息真实性 &rarr; ②【申报晋级队伍】勾选已通过校内赛的队伍、排序排名并上传校赛证明 &rarr; ③【秘书处审核】按高校维度终审通过后沉淀至【最终参赛队伍清单】。
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalTeamDetailId(null)}
                      className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* ===================================================================
            弹窗 G：秘书处按“高校维度”审核通过 / 驳回确认弹窗
           =================================================================== */}
        {secBatchAuditModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 font-extrabold text-sm flex items-center justify-between">
                <span>
                  秘书处审核 —— 【{secBatchAuditModal.submission.university}】晋级名单（共{' '}
                  {secBatchAuditModal.submission.teamIds.length} 支队伍）
                </span>
                <button
                  type="button"
                  onClick={() => setSecBatchAuditModal(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {secBatchAuditError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                    {secBatchAuditError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSecBatchAuditModal({ ...secBatchAuditModal, decision: 'approve' })
                    }
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      secBatchAuditModal.decision === 'approve'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>审核通过整批名单</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSecBatchAuditModal({ ...secBatchAuditModal, decision: 'reject' })
                    }
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      secBatchAuditModal.decision === 'reject'
                        ? 'bg-red-50 border-red-500 text-red-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>驳回高校重报</span>
                  </button>
                </div>

                {secBatchAuditModal.decision === 'approve' ? (
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                    <strong>秘书处审核通过后：</strong>【
                    {secBatchAuditModal.submission.university}】提报的{' '}
                    {secBatchAuditModal.submission.teamIds.length} 支队伍将正式变为
                    <strong>“报名成功（已晋级）”</strong>，自动进入{' '}
                    <strong>【最终参赛队伍清单】</strong>，同时前台个人中心【我的竞赛】同步展示！
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      <strong>打回高校管理员重报机制：</strong>驳回后将直接退回给【
                      {secBatchAuditModal.submission.university}
                      】高校管理员重新调整排名或补充校赛证明材料（前台队长无需也不可自行修改队伍信息）。
                    </div>
                    <label className="block text-xs font-bold text-slate-700">
                      填写驳回原因 <span className="text-red-500">*（必填）</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400">快捷原因：</span>
                      {[
                        '校赛成绩单缺少教务处或学院公章，请补充盖章扫描件后重新提报',
                        '上传的证明材料模糊，无法核对第1名与第2名积分明细',
                        '晋级推荐名单与成绩单排名顺序不一致，请核对后重新提报',
                      ].map((phrase) => (
                        <button
                          key={phrase}
                          type="button"
                          onClick={() => setSecBatchRejectReason(phrase)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 cursor-pointer"
                        >
                          {phrase.slice(0, 14)}...
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={3}
                      value={secBatchRejectReason}
                      onChange={(e) => setSecBatchRejectReason(e.target.value)}
                      placeholder="请输入具体驳回原因（如：材料模糊、缺少公章等）..."
                      className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSecBatchAuditModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSecretariatUniversityBatchAudit}
                    className={`px-6 py-2 rounded-lg text-white text-xs font-bold cursor-pointer ${
                      secBatchAuditModal.decision === 'approve'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    确认提交秘书处终审结论
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            弹窗 H：校赛成绩单/证明材料在线预览与下载弹窗
           =================================================================== */}
        {previewProofFileModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-slate-900 text-white text-sm font-extrabold flex items-center justify-between">
                <span>校赛成绩证明材料预览</span>
                <button
                  type="button"
                  onClick={() => setPreviewProofFileModal(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0284C7]" />
                    <span>{previewProofFileModal.name}</span>
                  </div>
                  <div className="text-slate-500 font-mono-num">
                    文件大小：{previewProofFileModal.size} · 类型：
                    {previewProofFileModal.type.toUpperCase()} · 上传时间：
                    {previewProofFileModal.uploadedAt}
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-slate-700 leading-relaxed">
                    【官方电子归档核验摘要】该附件已通过平台哈希完整性校验（SHA-256），包含校内选拔赛靶场解题积分榜、各参赛队排名序号及高校教务/竞赛管理部门审核签章信息。
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewProofFileModal(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    关闭
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const content = `文件名：${previewProofFileModal.name}\n文件大小：${previewProofFileModal.size}\n上传时间：${previewProofFileModal.uploadedAt}\n核验状态：校内选拔赛官方成绩证明附件\n`;
                      const blob = new Blob([content], {
                        type: 'text/plain;charset=utf-8;',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${previewProofFileModal.name}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      onToast(`已下载证明附件：${previewProofFileModal.name}`);
                    }}
                    className="px-5 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载证明附件</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 弹窗 A：Tab 1 单条 / 批量【高校资格审核】弹窗 */}
        {auditModalState && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 font-extrabold text-sm flex items-center justify-between">
                <span>
                  {auditModalState.mode === 'batch'
                    ? `批量高校审核（已选 ${auditModalState.teamIds.length} 支队伍）`
                    : '高校审核（核验队伍真实性与合规性）'}
                </span>
                <button
                  type="button"
                  onClick={() => setAuditModalState(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {auditError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                    {auditError}
                  </div>
                )}

                {/* 选择审核结论 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    选择高校审核结论：
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setAuditModalState({ ...auditModalState, decision: 'approve' })
                      }
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                        auditModalState.decision === 'approve'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{auditModalState.mode === 'batch' ? '批量通过' : '高校审核通过'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAuditModalState({ ...auditModalState, decision: 'reject' })
                      }
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                        auditModalState.decision === 'reject'
                          ? 'bg-red-50 border-red-500 text-red-800'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>{auditModalState.mode === 'batch' ? '批量驳回' : '高校审核驳回'}</span>
                    </button>
                  </div>
                </div>

                {auditModalState.decision === 'approve' ? (
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 leading-relaxed">
                    <strong>高校审核通过后：</strong>队伍状态将更新为
                    <strong>“高校已通过（待校赛）”</strong>，并进入本校<strong>【申报晋级队伍】</strong>待选池（不会直接流转至秘书处）。待校赛选拔结束后，请点击列表顶部<strong>【申报晋级队伍】</strong>统一排序并上传成绩单提交秘书处终审。
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                      <strong>高校审核驳回规则：</strong>驳回原因将同步展示在前台队长【我的报名】页面，队长可根据驳回原因修改队伍信息或调整队内角色后重新提交本校审核。
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        填写高校审核驳回原因{' '}
                        <span className="text-red-500">*（必填，前台悬浮小图标将显示此原因）</span>
                      </label>
                    </div>
                    {/* 快捷驳回语 */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400">快捷语：</span>
                      {[
                        '队伍成员学籍认证信息存疑，请重新核对后提交',
                        '队内角色分配不合理或与参赛作品方向不符，请核实调整后重提',
                        '指导教师研究方向或院系信息填写不完整，请补充后重提',
                        '队伍名称或简介不符合大赛规范，请修改后重提',
                      ].map((phrase) => (
                        <button
                          key={phrase}
                          type="button"
                          onClick={() => setRejectReasonText(phrase)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 cursor-pointer"
                        >
                          {phrase.slice(0, 12)}...
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={3}
                      value={rejectReasonText}
                      onChange={(e) => setRejectReasonText(e.target.value)}
                      placeholder="请输入具体驳回原因，前台【我的报名】将展示“已驳回”及悬浮原因气泡，队长修改后可重新提交本校审核..."
                      className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuditModalState(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAuditExecution}
                    className={`px-6 py-2 rounded-lg text-white text-xs font-bold cursor-pointer ${
                      auditModalState.decision === 'approve'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    确认提交高校审核结果
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 弹窗 B：导出 Excel 双 Sheet 预览弹窗 */}
        {exportPreviewModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-6xl w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200 text-emerald-900 font-extrabold text-sm flex items-center justify-between">
                <span>
                  Excel 导出文件已生成并下载（包含队伍和队员的所有详细信息：手机号、邮箱、身份证号、学历、队内角色、院校所在地、所属赛区）
                </span>
                <button
                  type="button"
                  onClick={() => setExportPreviewModal(null)}
                  className="text-emerald-700/70 hover:text-emerald-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExportPreviewModal({ ...exportPreviewModal, sheetTab: 'sheet1' })
                      }
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        exportPreviewModal.sheetTab === 'sheet1'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Sheet1（队伍汇总详情 · 含所在地/赛区/队长全量信息）
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExportPreviewModal({ ...exportPreviewModal, sheetTab: 'sheet2' })
                      }
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        exportPreviewModal.sheetTab === 'sheet2'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Sheet2（队伍及队员全部详细信息 · 手机/邮箱/身份证/学历/角色/所在地/赛区）
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    共导出 {exportPreviewModal.teams.length} 支队伍
                  </span>
                </div>

                <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-xl">
                  {exportPreviewModal.sheetTab === 'sheet1' ? (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 whitespace-nowrap">
                          <th className="py-2.5 px-3">队伍名</th>
                          <th className="py-2.5 px-3">校内排名</th>
                          <th className="py-2.5 px-3">所属院校</th>
                          <th className="py-2.5 px-3">院校所在地</th>
                          <th className="py-2.5 px-3">所属赛区</th>
                          <th className="py-2.5 px-3">队长</th>
                          <th className="py-2.5 px-3">队长学历</th>
                          <th className="py-2.5 px-3">队长角色</th>
                          <th className="py-2.5 px-3">队长手机号</th>
                          <th className="py-2.5 px-3">队长邮箱</th>
                          <th className="py-2.5 px-3">队长身份证号</th>
                          <th className="py-2.5 px-3">人数</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                        {exportPreviewModal.teams.map((t) => {
                          const st = resolveTeamAuditStages(t);
                          const capContact = resolveTeamCaptainContact(t, platformUsers);
                          const capInfo = resolvePersonFullExportInfo({
                            name: t.captainName,
                            phone: capContact.phone,
                            email: capContact.email,
                            university: t.university,
                            roleType: 'captain',
                            ctfRoles: t.captainCtfRoles,
                          });
                          return (
                            <tr key={t.id}>
                              <td className="py-2 px-3 font-bold">{t.teamName}</td>
                              <td className="py-2 px-3 font-mono-num font-bold text-amber-700">
                                {st.schoolRank ? `校内第${st.schoolRank}名` : '-'}
                              </td>
                              <td className="py-2 px-3">{t.university}</td>
                              <td className="py-2 px-3">{capInfo.universityLocation}</td>
                              <td className="py-2 px-3 font-semibold text-[#0284C7]">
                                {capInfo.divisionName}
                              </td>
                              <td className="py-2 px-3 font-semibold">{capInfo.name}</td>
                              <td className="py-2 px-3">{capInfo.educationLevel}</td>
                              <td className="py-2 px-3">{capInfo.inTeamRoleText}</td>
                              <td className="py-2 px-3 font-mono-num">{capInfo.phone}</td>
                              <td className="py-2 px-3 font-mono-num">{capInfo.email}</td>
                              <td className="py-2 px-3 font-mono-num">{capInfo.idCard}</td>
                              <td className="py-2 px-3 font-mono-num">{1 + t.members.length}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 whitespace-nowrap">
                          <th className="py-2.5 px-3">所属队伍</th>
                          <th className="py-2.5 px-3">校内排名</th>
                          <th className="py-2.5 px-3">姓名</th>
                          <th className="py-2.5 px-3">队内身份</th>
                          <th className="py-2.5 px-3">队内角色</th>
                          <th className="py-2.5 px-3">学历</th>
                          <th className="py-2.5 px-3">手机号</th>
                          <th className="py-2.5 px-3">邮箱</th>
                          <th className="py-2.5 px-3">身份证号</th>
                          <th className="py-2.5 px-3">所属院校</th>
                          <th className="py-2.5 px-3">院校所在地</th>
                          <th className="py-2.5 px-3">所属赛区</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                        {exportPreviewModal.teams.flatMap((t) => {
                          const st = resolveTeamAuditStages(t);
                          const rankText = st.schoolRank ? `校内第${st.schoolRank}名` : '-';
                          const capContact = resolveTeamCaptainContact(t, platformUsers);
                          const capInfo = resolvePersonFullExportInfo({
                            name: t.captainName,
                            phone: capContact.phone,
                            email: capContact.email,
                            university: t.captainUniversity || t.university,
                            roleType: 'captain',
                            ctfRoles: t.captainCtfRoles,
                          });
                          return [
                            <tr key={`${t.id}-cap`}>
                              <td className="py-2 px-3 font-bold">{t.teamName}</td>
                              <td className="py-2 px-3 font-mono-num font-bold text-amber-700">
                                {rankText}
                              </td>
                              <td className="py-2 px-3 font-bold">{capInfo.name}</td>
                              <td className="py-2 px-3">队长</td>
                              <td className="py-2 px-3 font-semibold text-[#0284C7]">
                                {capInfo.inTeamRoleText}
                              </td>
                              <td className="py-2 px-3">{capInfo.educationLevel}</td>
                              <td className="py-2 px-3 font-mono-num">{capInfo.phone}</td>
                              <td className="py-2 px-3 font-mono-num">{capInfo.email}</td>
                              <td className="py-2 px-3 font-mono-num">{capInfo.idCard}</td>
                              <td className="py-2 px-3">{capInfo.university}</td>
                              <td className="py-2 px-3">{capInfo.universityLocation}</td>
                              <td className="py-2 px-3 font-semibold text-emerald-700">
                                {capInfo.divisionName}
                              </td>
                            </tr>,
                            ...[...t.members, ...t.advisors].map((p) => {
                              const pInfo = resolvePersonFullExportInfo({
                                name: p.name,
                                phone: p.phone,
                                email: p.email,
                                university: p.university || t.university,
                                roleType: p.role === 'advisor' ? 'advisor' : 'member',
                                ctfRoles: p.ctfRoles,
                              });
                              return (
                                <tr key={`${t.id}-${p.id}`}>
                                  <td className="py-2 px-3 font-bold">{t.teamName}</td>
                                  <td className="py-2 px-3 font-mono-num font-bold text-amber-700">
                                    {rankText}
                                  </td>
                                  <td className="py-2 px-3 font-semibold">{pInfo.name}</td>
                                  <td className="py-2 px-3">{pInfo.identityLabel}</td>
                                  <td className="py-2 px-3 font-semibold text-[#0284C7]">
                                    {pInfo.inTeamRoleText}
                                  </td>
                                  <td className="py-2 px-3">{pInfo.educationLevel}</td>
                                  <td className="py-2 px-3 font-mono-num">{pInfo.phone}</td>
                                  <td className="py-2 px-3 font-mono-num">{pInfo.email}</td>
                                  <td className="py-2 px-3 font-mono-num">{pInfo.idCard}</td>
                                  <td className="py-2 px-3">{pInfo.university}</td>
                                  <td className="py-2 px-3">{pInfo.universityLocation}</td>
                                  <td className="py-2 px-3 font-semibold text-emerald-700">
                                    {pInfo.divisionName}
                                  </td>
                                </tr>
                              );
                            }),
                          ];
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setExportPreviewModal(null)}
                    className="px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer"
                  >
                    关闭预览
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 弹窗 C：异步下载中心弹窗（>5000条后台生成机制） */}
        {downloadCenterOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 font-extrabold text-sm flex items-center justify-between">
                <span>后台异步下载中心（超5000条防卡死队列）</span>
                <button
                  type="button"
                  onClick={() => setDownloadCenterOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {asyncDownloadTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    暂无后台异步导出任务
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {asyncDownloadTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{task.fileName}</div>
                          <div className="text-[11px] text-slate-500 font-mono-num mt-0.5">
                            记录数：{task.rowCount} 条 · 创建于 {task.createdAt}
                          </div>
                        </div>
                        {task.status === 'generating' ? (
                          <span className="text-xs font-bold text-amber-600 animate-pulse">
                            正在后台生成...
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              downloadTwoSheetExcelFile(filteredEventTeams, task.fileName)
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
                          >
                            立即下载
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 弹窗 D：【导入线下数据】（指标6：下载标准模板 + 校验队伍名称重复、赛事ID匹配、赛道合法性 + 错误行报告） */}
        {importModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 font-extrabold text-sm flex items-center justify-between">
                <span>导入线下报名数据（三重校验与错误行报告）</span>
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <div className="font-bold text-slate-900 mb-0.5">第一步：下载标准Excel导入模板</div>
                    <div>系统将在上传时严格校验：<strong>1.队伍名称重复</strong>、<strong>2.赛事ID匹配({activeEventForTeams.id})</strong>、<strong>3.赛道合法性</strong>。</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      downloadTwoSheetExcelFile([], `线下报名导入标准模板_${activeEventForTeams.id}.xls`);
                      onToast('已下载标准Excel导入模板！');
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    下载标准模板
                  </button>
                </div>

                {/* 上传或一键模拟测试数据包 */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800">
                    第二步：上传 Excel 文件或使用测试数据包验证校验逻辑
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setImportSuccessMsg(null);
                        setImportErrorReport([
                          {
                            row: 3,
                            teamName: filteredEventTeams[0]?.teamName || '北航天枢攻防战队',
                            field: '队伍名称重复',
                            reason: `队伍名称「${filteredEventTeams[0]?.teamName || '北航天枢攻防战队'}」在当前赛事下已存在，禁止重复导入`,
                          },
                          {
                            row: 5,
                            teamName: '西电猎鹰战队',
                            field: '赛事ID不匹配',
                            reason: `填报的 Event_ID (comp-2025-old) 与当前赛事 (${activeEventForTeams.id}) 不匹配`,
                          },
                          {
                            row: 8,
                            teamName: '交大矩阵战队',
                            field: '赛道合法性校验失败',
                            reason: `所填赛道「量子硬件拆解赛道」不属于本赛事已配置的合法赛道`,
                          },
                        ]);
                      }}
                      className="p-3.5 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-50 text-left cursor-pointer"
                    >
                      <div className="text-xs font-bold text-red-700">
                        测试上传【含异常行的数据包】
                      </div>
                      <div className="text-[11px] text-red-600/80 mt-0.5">
                        触发队名重复、赛事ID不符、赛道非法拦截报告
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setImportErrorReport(null);
                        const validTrack =
                          activeEventForTeams.tracks[0]?.name || '综合主赛道';
                        const importedTeam: CaptainTeamRecord = {
                          id: `cap-team-imp-${Date.now()}`,
                          competitionId: activeEventForTeams.id,
                          competitionTitle: activeEventForTeams.title,
                          subTrackName: validTrack,
                          teamName: `哈工大紫丁香战队_${Math.floor(Math.random() * 90 + 10)}`,
                          teamLogo: 'default-logo',
                          teamIntro: '线下批量导入高校种子战队，专注二进制逆向与工控协议安全。',
                          university: '哈尔滨工业大学',
                          captainName: '赵天宇',
                          captainUniversity: '哈尔滨工业大学',
                          captainVerified: true,
                          status: 'pending_review',
                          schoolAuditStatus: 'pending',
                          advancementStatus: 'none',
                          secretariatAuditStatus: 'none',
                          members: [
                            {
                              id: `m-imp-${Date.now()}`,
                              name: '林思源',
                              phone: '13945018821',
                              email: 'linsiyuan@hit.edu.cn',
                              university: '哈尔滨工业大学',
                              role: 'member',
                              isVerified: true,
                              confirmStatus: 'accepted',
                            },
                          ],
                          advisors: [],
                          createdAt: '2026-10-28 12:18',
                          updatedAt: '2026-10-28 12:18',
                        };
                        onUpdateCaptainTeams([importedTeam, ...captainTeams]);
                        setImportSuccessMsg(
                          `校验全部通过！已成功导入线下队伍「${importedTeam.teamName}（哈尔滨工业大学）」！`
                        );
                        onAddAuditLog({
                          operator: adminName,
                          ip: '202.112.128.45',
                          location: '北京市海淀区',
                          device: 'Admin Console',
                          action: `导入线下报名数据（${importedTeam.teamName}）`,
                          result: '成功',
                          detail: `通过队伍名称、赛事ID(${activeEventForTeams.id})、赛道合法性校验`,
                        });
                      }}
                      className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-left cursor-pointer"
                    >
                      <div className="text-xs font-bold text-emerald-800">
                        测试上传【合规线下数据包】
                      </div>
                      <div className="text-[11px] text-emerald-700/80 mt-0.5">
                        通过全部三项校验并立即合入当前队伍列表
                      </div>
                    </button>
                  </div>
                </div>

                {/* 错误行报告展示 */}
                {importErrorReport && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2.5">
                    <div className="text-xs font-extrabold text-red-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>导入校验未通过 · 错误行报告（共发现 {importErrorReport.length} 处错误，已中止导入）：</span>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-red-200 bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-red-50/80 border-b border-red-200 font-bold text-red-900">
                            <th className="py-2 px-3">Excel行号</th>
                            <th className="py-2 px-3">队伍名称</th>
                            <th className="py-2 px-3">拦截校验项</th>
                            <th className="py-2 px-3">错误原因说明</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-100">
                          {importErrorReport.map((err, i) => (
                            <tr key={i}>
                              <td className="py-2 px-3 font-mono-num font-bold text-red-700">
                                第 {err.row} 行
                              </td>
                              <td className="py-2 px-3 font-semibold">{err.teamName}</td>
                              <td className="py-2 px-3 text-red-600 font-bold">{err.field}</td>
                              <td className="py-2 px-3 text-slate-700">{err.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {importSuccessMsg && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{importSuccessMsg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // 默认渲染子视图 1：【报名列表页】（顶部搜索区 + 数据列表 + 操作：查看报名 / 编辑 / 删除）
  // ==========================================================================
  return (
    <div className="space-y-5 pb-12">
      {/* 顶部搜索区：赛事名称（模糊搜索） + 报名状态（未开始/开启中/已截止/已停用） + 新增按钮 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              报名状态：
            </span>
            <select
              value={listStatusFilter}
              onChange={(e) =>
                setListStatusFilter(
                  e.target.value as 'all' | RegistrationConfigCalculatedStatus
                )
              }
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:border-[#0284C7] focus:outline-none cursor-pointer"
            >
              <option value="all">全部报名状态 ({registrationConfigs.length})</option>
              <option value="not_started">未开始</option>
              <option value="open">开启中</option>
              <option value="ended">已截止</option>
              <option value="disabled">已停用</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={listSearchEventName}
              onChange={(e) => setListSearchEventName(e.target.value)}
              placeholder="输入关联赛事名称模糊搜索..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0284C7] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {adminRole === 'super_admin' && (
            <button
              type="button"
              onClick={handleOpenNewConfigForm}
              className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>新增报名配置</span>
            </button>
          )}
        </div>
      </div>

      {/* 报名列表表格 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="py-3.5 px-4 min-w-[240px]">关联赛事名称</th>
                <th className="py-3.5 px-4 whitespace-nowrap">报名起止时间（精确到时分秒）</th>
                <th className="py-3.5 px-4 whitespace-nowrap">
                  {adminRole === 'school_admin' ? '本校已报队伍数' : '已报名队伍数'}
                </th>
                <th className="py-3.5 px-4 whitespace-nowrap">
                  {adminRole === 'school_admin' ? '本校已报人数' : '已报名人数'}
                </th>
                <th className="py-3.5 px-4 whitespace-nowrap">审核阶段开关状态</th>
                <th className="py-3.5 px-4 whitespace-nowrap">报名状态</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {filteredRegConfigs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    未找到匹配的报名管理记录
                  </td>
                </tr>
              ) : (
                filteredRegConfigs.map((cfg) => {
                  const comp = getCompById(cfg.eventId);
                  const calcStatus = computeRegistrationConfigStatus(cfg);
                  const statusMeta = getRegistrationStatusMeta(calcStatus, cfg.earlyClosed);
                  const stats = getEventTeamStats(cfg.eventId);
                  const canDelete = calcStatus === 'disabled';
                  const schoolSwitchOn = cfg.schoolAuditEnabled !== false;
                  const secSwitchOn = cfg.secretariatAuditEnabled !== false;

                  return (
                    <tr key={cfg.id} className="hover:bg-sky-50/40 transition-colors">
                      {/* 关联赛事名称（已删除 eventId） */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {comp?.title || '未知关联赛事'}
                        </div>
                      </td>

                      {/* 报名起止时间 */}
                      <td className="py-4 px-4 align-middle font-mono-num text-slate-700 whitespace-nowrap">
                        <div>起：{cfg.regStartTime}</div>
                        <div className="text-slate-500">止：{cfg.regEndTime}</div>
                      </td>

                      {/* 已报名队伍数（实时Count） */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        <span className="font-mono-num text-sm font-extrabold text-[#0284C7]">
                          {stats.teamCount}
                        </span>
                        <span className="text-slate-500 ml-1">支队伍</span>
                      </td>

                      {/* 已报名人数（实时Count） */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        <span className="font-mono-num text-sm font-extrabold text-slate-900">
                          {stats.personCount}
                        </span>
                        <span className="text-slate-500 ml-1">人</span>
                      </td>

                      {/* 审核阶段开关状态 */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">高校审核：</span>
                          <span
                            className={`font-bold ${
                              schoolSwitchOn ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {schoolSwitchOn ? '已开启' : '未开启'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-slate-500">秘书处审核：</span>
                          <span
                            className={`font-bold ${
                              secSwitchOn ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {secSwitchOn ? '已开启' : '未开启'}
                          </span>
                        </div>
                      </td>

                      {/* 状态 */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-bold ${statusMeta.badgeClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusMeta.dotClass}`} />
                          <span>{statusMeta.label}</span>
                        </span>
                      </td>

                      {/* 操作：【查看报名】、【编辑】、【删除（仅“已停用”状态可点）】 */}
                      <td className="py-4 px-4 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEnterTeamDataManagement(cfg.eventId)}
                            className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold cursor-pointer"
                          >
                            查看报名
                          </button>
                          {adminRole === 'super_admin' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditConfigForm(cfg)}
                                className="text-[#0284C7] hover:text-[#0369A1] font-bold cursor-pointer"
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                disabled={!canDelete}
                                onClick={() => setDeleteConfigConfirmTarget(cfg)}
                                title={
                                  canDelete
                                    ? '点击删除该已停用的报名配置'
                                    : '仅“已停用”状态的报名数据可删除'
                                }
                                className={`font-bold ${
                                  canDelete
                                    ? 'text-red-600 hover:text-red-700 cursor-pointer'
                                    : 'text-slate-300 cursor-not-allowed'
                                }`}
                              >
                                删除
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 审核开关未开启拦截提示弹窗（高校管理员 / 秘书处管理员点击【查看报名】时触发） */}
      {auditNotOpenBlockPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-amber-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 text-amber-900 font-extrabold text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>审核阶段暂未开启提醒</span>
              </span>
              <button
                type="button"
                onClick={() => setAuditNotOpenBlockPrompt(null)}
                className="text-amber-700/70 hover:text-amber-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-500">
                关联赛事：<strong>{auditNotOpenBlockPrompt.eventTitle}</strong>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm font-extrabold text-amber-900 leading-relaxed">
                {auditNotOpenBlockPrompt.message}
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setAuditNotOpenBlockPrompt(null)}
                  className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 【删除】二次强确认弹窗：“彻底删除后数据不可恢复！确认删除？” */}
      {deleteConfigConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-red-50 border-b border-red-200 text-red-900 font-extrabold text-sm flex items-center justify-between">
              <span>彻底删除报名数据强确认</span>
              <button
                type="button"
                onClick={() => setDeleteConfigConfirmTarget(null)}
                className="text-red-700/70 hover:text-red-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-extrabold text-slate-900 leading-relaxed">
                彻底删除后数据不可恢复！确认删除？
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                即将删除赛事《{getCompById(deleteConfigConfirmTarget.eventId)?.title}》的报名配置记录，删除操作将实时写入后台安全操作审计日志。
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfigConfirmTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteDisabledConfig}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  确认彻底删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
