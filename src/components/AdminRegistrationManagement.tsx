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
import type { CompetitionCatalogItem } from '../data/competitionData';
import {
  type CaptainTeamRecord,
  type InvitedTeamPerson,
  type TwoStageAuditStatus,
  type PlatformDirectoryUser,
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
  maxAdvisors: number; // 教师人数上限（1-5人）
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
  const [cfgMaxAdvisors, setCfgMaxAdvisors] = useState(2);
  const [cfgMinTeamSize, setCfgMinTeamSize] = useState(1);
  const [cfgMaxTeamSize, setCfgMaxTeamSize] = useState(4);
  const [cfgFormError, setCfgFormError] = useState<string | null>(null);

  // --- 3. 队伍数据管理（业务层）状态：分为【高校审核】与【秘书处审核】两个TAB ---
  const [activeEventIdForTeams, setActiveEventIdForTeams] = useState<string>(
    INITIAL_REGISTRATION_CONFIGS[0].eventId
  );
  const [activeAuditTab, setActiveAuditTab] = useState<'school' | 'secretariat'>('school');

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

  // 单条/批量审核弹窗状态（区分高校审核与秘书处审核）
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
  const [backdoorSearchQuery, setBackdoorSearchQuery] = useState('');
  const [backdoorAddRole, setBackdoorAddRole] = useState<'member' | 'advisor'>('member');
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
    if (cfgIncludeAdvisor && (cfgMaxAdvisors < 1 || cfgMaxAdvisors > 5)) {
      setCfgFormError('指导教师人数上限须限制在 1 - 5 人之间');
      return;
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
        detail: `起止：${formattedStart} ~ ${formattedEnd}，提前关闭：${cfgEarlyClosed ? '开启' : '关闭'}，人数：${cfgMinTeamSize}-${cfgMaxTeamSize}人`,
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

  // 统计当前赛事在【高校审核】与【秘书处审核】两个TAB下的队伍数量（组建中和邀请中的队伍未提交审核，不进入高校审核流程；高校管理员强制 WHERE 院校ID = 当前登录用户的院校ID）
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
    // 只有高校审核通过后，才会进入秘书处审核阶段
    const secretariatEligibleTeams = eventTeams.filter(
      (t) => resolveTeamAuditStages(t).schoolStatus === 'approved'
    );
    const secretariatTabTotal = secretariatEligibleTeams.length;
    const secretariatPendingCount = secretariatEligibleTeams.filter(
      (t) => resolveTeamAuditStages(t).secretariatStatus === 'pending'
    ).length;
    return {
      schoolTabTotal,
      schoolPendingCount,
      secretariatTabTotal,
      secretariatPendingCount,
    };
  }, [captainTeams, activeEventIdForTeams, adminRole, adminInstitutionName]);

  // 根据当前选中的TAB（高校审核 / 秘书处审核）及筛选条件过滤出的队伍列表
  const filteredEventTeams = useMemo(() => {
    const effectiveTab = adminRole === 'school_admin' ? 'school' : activeAuditTab;
    return captainTeams.filter((team) => {
      if (team.competitionId !== activeEventIdForTeams) return false;

      // 高校管理员数据权限隔离：强制 WHERE 院校ID = 当前登录用户的院校ID，只能看到本校队伍
      if (adminRole === 'school_admin' && team.university !== adminInstitutionName) {
        return false;
      }

      const stages = resolveTeamAuditStages(team);

      // 只有提交之后的报名信息才会进入高校审核流程，排除组建中和邀请中的队伍
      if (
        team.status === 'draft' ||
        team.status === 'inviting' ||
        stages.schoolStatus === 'none'
      ) {
        return false;
      }

      // TAB 级过滤：秘书处审核 TAB 仅展示高校审核已通过的队伍
      if (effectiveTab === 'secretariat' && stages.schoolStatus !== 'approved') {
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

      // 4. 当前TAB对应的审核状态（全部 / 待审核 / 已通过 / 已驳回 / 未提交）
      if (appliedTeamFilters.auditStatus !== 'all') {
        const currentStageStatus =
          effectiveTab === 'school' ? stages.schoolStatus : stages.secretariatStatus;
        if (currentStageStatus !== appliedTeamFilters.auditStatus) return false;
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
    activeAuditTab,
    appliedTeamFilters,
    adminRole,
    adminInstitutionName,
  ]);

  // 导出 Excel（联动指标6：若勾选则导出选中项，未勾选则导出当前搜索条件下的所有数据；手机号与身份证号默认脱敏；包含 Sheet1 队伍汇总 & Sheet2 成员明细）
  const handleTriggerExportExcel = (simulateOver5000 = false) => {
    const targetTeams =
      selectedTeamIds.length > 0
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

    // 打開预览弹窗并触发双 Sheet Excel 文件下载
    setExportPreviewModal({
      sheetTab: 'sheet1',
      teams: targetTeams,
    });
    downloadTwoSheetExcelFile(targetTeams, `${activeEventForTeams.title}_报名队伍与成员明细.xls`);
    onAddAuditLog({
      operator: adminName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: `导出报名队伍Excel（共 ${targetTeams.length} 支队伍）`,
      result: '成功',
      detail: `包含 Sheet1(队伍汇总) 与 Sheet2(成员明细)，手机号与身份证号已执行默认脱敏保护`,
    });
  };

  // 生成包含 Sheet1（队伍汇总）与 Sheet2（成员明细）的标准 Excel XML 文件并触发浏览器下载
  const downloadTwoSheetExcelFile = (teams: CaptainTeamRecord[], filename: string) => {
    const sheet1Rows = teams
      .map((t) => {
        const auditMeta = mapTeamStatusToAdminAudit(t.status);
        const totalMembers = 1 + t.members.length;
        const capContact = resolveTeamCaptainContact(t, platformUsers);
        return `<Row>
          <Cell><Data ss:Type="String">${t.teamName}</Data></Cell>
          <Cell><Data ss:Type="String">${t.university}</Data></Cell>
          <Cell><Data ss:Type="String">${t.subTrackName}</Data></Cell>
          <Cell><Data ss:Type="String">${t.captainName}</Data></Cell>
          <Cell><Data ss:Type="String">${maskPhone(capContact.phone)}</Data></Cell>
          <Cell><Data ss:Type="String">${auditMeta.label}</Data></Cell>
          <Cell><Data ss:Type="Number">${totalMembers}</Data></Cell>
          <Cell><Data ss:Type="String">${t.createdAt}</Data></Cell>
        </Row>`;
      })
      .join('');

    const sheet2Rows = teams
      .flatMap((t) => {
        const capContact = resolveTeamCaptainContact(t, platformUsers);
        const captainRow = `<Row>
          <Cell><Data ss:Type="String">${t.teamName}</Data></Cell>
          <Cell><Data ss:Type="String">${t.captainName}</Data></Cell>
          <Cell><Data ss:Type="String">队长</Data></Cell>
          <Cell><Data ss:Type="String">${t.captainUniversity}</Data></Cell>
          <Cell><Data ss:Type="String">${getMaskedIdCard(t.captainName)}</Data></Cell>
          <Cell><Data ss:Type="String">${maskPhone(capContact.phone)}</Data></Cell>
          <Cell><Data ss:Type="String">${maskEmail(capContact.email)}</Data></Cell>
        </Row>`;
        const memRows = [...t.members, ...t.advisors].map(
          (p) => `<Row>
          <Cell><Data ss:Type="String">${t.teamName}</Data></Cell>
          <Cell><Data ss:Type="String">${p.name}</Data></Cell>
          <Cell><Data ss:Type="String">${p.role === 'advisor' ? '指导教师' : '队员'}</Data></Cell>
          <Cell><Data ss:Type="String">${p.university}</Data></Cell>
          <Cell><Data ss:Type="String">${getMaskedIdCard(p.name + p.phone)}</Data></Cell>
          <Cell><Data ss:Type="String">${maskPhone(p.phone)}</Data></Cell>
          <Cell><Data ss:Type="String">${maskEmail(p.email)}</Data></Cell>
        </Row>`
        );
        return [captainRow, ...memRows];
      })
      .join('');

    const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Sheet1-队伍汇总">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">队伍名称</Data></Cell>
    <Cell><Data ss:Type="String">所属学校</Data></Cell>
    <Cell><Data ss:Type="String">所选赛道</Data></Cell>
    <Cell><Data ss:Type="String">队长姓名</Data></Cell>
    <Cell><Data ss:Type="String">队长手机号(脱敏)</Data></Cell>
    <Cell><Data ss:Type="String">审核状态</Data></Cell>
    <Cell><Data ss:Type="String">队伍人数</Data></Cell>
    <Cell><Data ss:Type="String">报名时间</Data></Cell>
   </Row>
   ${sheet1Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Sheet2-成员明细">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">所属队伍</Data></Cell>
    <Cell><Data ss:Type="String">姓名</Data></Cell>
    <Cell><Data ss:Type="String">角色</Data></Cell>
    <Cell><Data ss:Type="String">所属学校</Data></Cell>
    <Cell><Data ss:Type="String">身份证号(脱敏)</Data></Cell>
    <Cell><Data ss:Type="String">手机号(脱敏)</Data></Cell>
    <Cell><Data ss:Type="String">邮箱(脱敏)</Data></Cell>
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

  // 执行单条或批量审核（区分【高校审核】与【秘书处审核】两阶段）
  const handleConfirmAuditExecution = () => {
    if (!auditModalState) return;
    setAuditError(null);

    if (auditModalState.decision === 'reject' && !rejectReasonText.trim()) {
      setAuditError('强校验拦截：审核不通过时必须填写驳回原因！');
      return;
    }

    const targetIdSet = new Set(auditModalState.teamIds);
    const isSchoolStage = auditModalState.stage === 'school';
    const isApprove = auditModalState.decision === 'approve';
    const trimmedReason = rejectReasonText.trim();

    const affectedTeamNames: string[] = [];
    const updatedTeams = captainTeams.map((team) => {
      if (!targetIdSet.has(team.id)) return team;
      affectedTeamNames.push(team.teamName);

      if (isSchoolStage) {
        // 高校审核阶段：
        // - 通过：高校审核变为已通过，自动进入秘书处审核（待审核），报名状态保持“已提交”
        // - 驳回：高校审核变为已驳回（记录驳回原因），秘书处审核重置为未开启，队长需重新修改提交后再依次进入高校审核、秘书处审核
        return {
          ...team,
          status: isApprove ? ('pending_review' as const) : ('rejected' as const),
          schoolAuditStatus: isApprove ? ('approved' as const) : ('rejected' as const),
          schoolRejectReason: isApprove ? undefined : trimmedReason,
          secretariatAuditStatus: isApprove ? ('pending' as const) : ('none' as const),
          secretariatRejectReason: undefined,
          updatedAt: '2026-10-28 12:15',
        };
      } else {
        // 秘书处审核阶段（前提：高校审核已通过）：
        // - 通过：秘书处审核变为已通过，报名状态正式变为“报名成功 (approved)”，并固化生成报名成功时的只读快照 approvedSnapshot
        // - 驳回：秘书处审核变为已驳回（记录驳回原因），队长需重新修改提交，重新进入【高校审核 -> 秘书处审核】两个流程
        return {
          ...team,
          status: isApprove ? ('approved' as const) : ('rejected' as const),
          schoolAuditStatus: 'approved' as const,
          secretariatAuditStatus: isApprove ? ('approved' as const) : ('rejected' as const),
          secretariatRejectReason: isApprove ? undefined : trimmedReason,
          approvedSnapshot: isApprove
            ? team.approvedSnapshot ||
              buildApprovedSnapshotFromCaptainTeam(team, '2026-10-28 12:15')
            : team.approvedSnapshot,
          updatedAt: '2026-10-28 12:15',
        };
      }
    });

    onUpdateCaptainTeams(updatedTeams);

    const stageLabel = isSchoolStage ? '高校审核' : '秘书处审核';
    if (isApprove) {
      if (isSchoolStage) {
        onSendSystemNotification(
          `【高校审核通过】${affectedTeamNames.join('、')}`,
          `您所在的队伍（${affectedTeamNames.join('、')}）已通过高校审核，现已自动流转进入“秘书处审核”阶段！`
        );
        onToast(
          `已完成高校审核通过（${affectedTeamNames.length} 支队伍），队伍已自动流转进入【秘书处审核】阶段！`
        );
      } else {
        onSendSystemNotification(
          `【秘书处终审通过 · 报名成功】${affectedTeamNames.join('、')}`,
          `恭喜！您所在的队伍（${affectedTeamNames.join('、')}）已通过秘书处审核，报名状态已更新为“报名成功”！`
        );
        onToast(
          `已完成秘书处审核通过（${affectedTeamNames.length} 支队伍），前台报名状态已同步更新为【报名成功】！`
        );
      }
    } else {
      onSendSystemNotification(
        `【${stageLabel}驳回】${affectedTeamNames.join('、')}`,
        `您所在的队伍在「${stageLabel}」阶段未通过，驳回原因：${trimmedReason}。队长可在【个人中心 - 我的报名】修改队伍信息后重新提交，重新进入【高校审核 -> 秘书处审核】流程。`
      );
      onToast(
        `已在【${stageLabel}】驳回 ${affectedTeamNames.length} 支队伍，前台将展示“已驳回”及悬浮原因气泡，队长修改重提后将重新进入高校审核与秘书处审核流程！`
      );
    }

    onAddAuditLog({
      operator: adminName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: `${auditModalState.mode === 'batch' ? '批量' : '单条'}${stageLabel}：${
        isApprove ? '已通过' : '已驳回'
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
      members: team.members.map((m) => ({ ...m })),
      advisors: team.advisors.map((a) => ({ ...a })),
    };
    setEditTeamDraft(deepCopy);
    setEditTeamOriginalSnapshot(
      JSON.stringify({
        teamName: team.teamName,
        captainName: team.captainName,
        members: team.members.map((m) => m.name),
        advisors: team.advisors.map((a) => a.name),
        status: team.status,
      })
    );
    setBackdoorSearchQuery('');
    setBackdoorInterceptAlert(null);
    setBackdoorForceOverrideChecked(false);
    setBackdoorFeedback(null);
    setSubView('team-edit');
  };

  // 管理员后门：指定新队长并移除原队长
  const handleConfirmReplaceCaptain = () => {
    if (!editTeamDraft) return;
    const chosenMember = editTeamDraft.members.find(
      (m) => m.id === selectedNewCaptainMemberId
    );
    if (!chosenMember) return;

    const oldCaptainName = editTeamDraft.captainName;
    const nextMembers = editTeamDraft.members.filter((m) => m.id !== chosenMember.id);

    setEditTeamDraft({
      ...editTeamDraft,
      captainName: chosenMember.name,
      captainUniversity: chosenMember.university,
      members: nextMembers,
    });
    setRemoveCaptainModalOpen(false);
    setBackdoorFeedback(
      `已将原队长「${oldCaptainName}」移出队伍，并指定「${chosenMember.name}」为新任队长（保存后将向相关成员发送通知）。`
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
    setBackdoorFeedback(
      forceBypass
        ? `【特权后门生效】已跳过规则校验，强行特批「${found.name}（${found.university}）」加入队伍！`
        : `已将「${found.name}」加入队伍名单。`
    );
  };

  // 保存管理员后门对队伍的修改（保持原审核状态不变，写修改前后快照日志，发站内信）
  const handleSaveAdminBackdoorEdit = () => {
    if (!editTeamDraft) return;
    const afterSnapshot = JSON.stringify({
      teamName: editTeamDraft.teamName,
      captainName: editTeamDraft.captainName,
      members: editTeamDraft.members.map((m) => m.name),
      advisors: editTeamDraft.advisors.map((a) => a.name),
      status: editTeamDraft.status,
    });

    // 状态保持：编辑保存后，队伍状态不变
    const updated = captainTeams.map((t) =>
      t.id === editTeamDraft.id ? { ...editTeamDraft, updatedAt: '2026-10-28 12:20' } : t
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
                  value={editingComp ? `${editingComp.title} (Event_ID: ${editingComp.id})` : cfgEventId}
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
                        {c.title} (Event_ID: {c.id})
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

            {/* 3. 提前关闭开关 & 包含指导教师开关（已移除跨校组队配置，默认统一不允许跨校组队） */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 提前关闭开关 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">提前关闭开关</span>
                    <input
                      type="checkbox"
                      checked={cfgEarlyClosed}
                      onChange={(e) => setCfgEarlyClosed(e.target.checked)}
                      className="w-4 h-4 accent-[#0284C7] cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    开启后立即停止报名，直接覆盖截止时间的判断，前端点击立即报名将提示“报名未开启”。
                  </p>
                </div>
                <div className="text-[11px] font-bold">
                  当前状态：
                  <span className={cfgEarlyClosed ? 'text-red-600' : 'text-slate-500'}>
                    {cfgEarlyClosed ? '已开启（立即停止报名）' : '未开启（按起止时间判断）'}
                  </span>
                </div>
              </div>

              {/* 包含指导教师 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      包含指导教师 <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={cfgIncludeAdvisor}
                      onChange={(e) => setCfgIncludeAdvisor(e.target.checked)}
                      className="w-4 h-4 accent-[#0284C7] cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    默认开启。若关闭，前台报名表单将自动隐藏“邀请指导教师”模块。
                  </p>
                </div>
                <div className="text-[11px] font-bold">
                  当前状态：
                  <span className={cfgIncludeAdvisor ? 'text-emerald-700' : 'text-slate-500'}>
                    {cfgIncludeAdvisor ? '开启指导教师模块' : '隐藏指导教师模块'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. 教师人数上限 & 队伍人数限制 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xl bg-sky-50/40 border border-sky-200/80">
              {/* 教师人数上限（当“包含指导教师”开启时必填） */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  教师人数上限（限制 1-5 人）{' '}
                  {cfgIncludeAdvisor && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  disabled={!cfgIncludeAdvisor}
                  required={cfgIncludeAdvisor}
                  value={cfgIncludeAdvisor ? cfgMaxAdvisors : 0}
                  onChange={(e) => setCfgMaxAdvisors(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm font-mono-num bg-white disabled:bg-slate-100 border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {cfgIncludeAdvisor
                    ? `每支战队最多可邀请 ${cfgMaxAdvisors} 名已认证指导教师`
                    : '已关闭“包含指导教师”开关，前台不再展示指导教师模块'}
                </p>
              </div>

              {/* 队伍人数限制（数字区间） */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  队伍人数限制（最少含队长 1-5 人，最多 1-20 人）{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-400 mb-0.5">最少人数(含队长)</div>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      required
                      value={cfgMinTeamSize}
                      onChange={(e) => setCfgMinTeamSize(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono-num bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                  <span className="text-slate-400 font-bold pt-4">~</span>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-400 mb-0.5">最多人数(含队长)</div>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      required
                      value={cfgMaxTeamSize}
                      onChange={(e) => setCfgMaxTeamSize(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono-num bg-white border border-slate-300 rounded-lg focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#0369A1] font-medium mt-1">
                  {cfgMaxTeamSize === 1
                    ? '当前最多人数限制为 1 人（单人赛），前台报名表单将自动隐藏“邀请队员”模块'
                    : `每支战队须由 ${cfgMinTeamSize} 至 ${cfgMaxTeamSize} 名参赛学生组成（含队长本人）`}
                </p>
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
            <Lock className="w-3.5 h-3.5" />
            <span>查看队伍详情（只读页面）</span>
          </span>
        </div>

        {/* 1. 基础信息：队伍名、LOGO大图、简介、所属院校、赛道、两级审核状态 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-5">
              <TeamLogoAvatar logo={team.teamLogo} teamName={team.teamName} size="lg" />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-extrabold text-slate-900">{team.teamName}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded border text-xs font-bold ${stages.regStatusClass}`}
                  >
                    报名状态：{stages.regStatusLabel}
                  </span>
                  <div className="inline-flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 font-semibold">高校审核：</span>
                    <AuditStageBadgeWithTooltip
                      status={stages.schoolStatus}
                      rejectReason={stages.schoolReason}
                      stage="school"
                    />
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 font-semibold">秘书处审核：</span>
                    <AuditStageBadgeWithTooltip
                      status={stages.secretariatStatus}
                      rejectReason={stages.secretariatReason}
                      stage="secretariat"
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
                  <span>
                    所选赛道：<strong className="text-slate-800">{team.subTrackName}</strong>
                  </span>
                  <span>
                    成员确认进度：<strong className="text-slate-800">{confirmProgress.label}</strong>
                  </span>
                  <span className="font-mono-num">报名时间：{team.createdAt}</span>
                </div>
              </div>
            </div>

            {adminRole === 'super_admin' && (
              <button
                type="button"
                onClick={() => handleOpenAdminBackdoorEdit(team)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer self-start"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>进入特权编辑</span>
              </button>
            )}
          </div>

          {/* 2. 成员列表表格（含认证状态快照，手机号/邮箱/身份证号均脱敏） */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              队伍成员与指导教师明细（共 {allPersonRows.length} 人 · 隐私字段已脱敏）
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                    <th className="py-3 px-4">姓名</th>
                    <th className="py-3 px-4">性别</th>
                    <th className="py-3 px-4">角色</th>
                    <th className="py-3 px-4">所属院校</th>
                    <th className="py-3 px-4">手机号(脱敏)</th>
                    <th className="py-3 px-4">邮箱(脱敏)</th>
                    <th className="py-3 px-4">身份证号(脱敏)</th>
                    <th className="py-3 px-4">认证状态快照（第三方返回状态）</th>
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
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {row.university}
                      </td>
                      <td className="py-3.5 px-4 font-mono-num text-slate-600">{row.phone}</td>
                      <td className="py-3.5 px-4 font-mono-num text-slate-600">{row.email}</td>
                      <td className="py-3.5 px-4 font-mono-num text-slate-600">{row.idCard}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            row.isVerified ? 'text-emerald-700' : 'text-amber-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{getCertSnapshotLabel(row.roleKey, row.isVerified)}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. 详情页底部两级快捷审核操作栏 */}
          <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              审核规则：先由【高校审核】通过后流转至【秘书处审核】，秘书处审核通过后队伍报名状态正式变为“报名成功”；无论被高校审核驳回还是被秘书处审核驳回，队长修改重新提交后均重新进入【高校审核 &rarr; 秘书处审核】流程。
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {stages.schoolStatus !== 'none' &&
                adminRole !== 'secretariat_admin' && (
                  <button
                    type="button"
                    disabled={!isSchoolStageOpen}
                    onClick={() => {
                      setRejectReasonText(stages.schoolReason || '');
                      setAuditError(null);
                      setAuditModalState({
                        mode: 'single',
                        stage: 'school',
                        teamIds: [team.id],
                        decision: 'approve',
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed text-[#0284C7] text-xs font-bold cursor-pointer"
                  >
                    {isSchoolStageOpen ? '执行高校审核' : '高校审核未开启'}
                  </button>
                )}
              {stages.schoolStatus === 'approved' &&
                adminRole !== 'school_admin' && (
                  <button
                    type="button"
                    disabled={!isSecretariatStageOpen}
                    onClick={() => {
                      setRejectReasonText(stages.secretariatReason || '');
                      setAuditError(null);
                      setAuditModalState({
                        mode: 'single',
                        stage: 'secretariat',
                        teamIds: [team.id],
                        decision: 'approve',
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {isSecretariatStageOpen ? '执行秘书处审核' : '秘书处审核未开启'}
                  </button>
                )}
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
    const editStages = resolveTeamAuditStages(editTeamDraft);

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
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold">
              管理员特权后门编辑模式
            </span>
            <span className={`px-2.5 py-1 rounded border font-bold ${editStages.regStatusClass}`}>
              原报名状态保持：{editStages.regStatusLabel}（保存后不重走审核流程）
            </span>
          </div>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    队伍 LOGO（默认 LOGO）
                  </label>
                  <div className="flex items-center gap-3">
                    <TeamLogoAvatar
                      logo={editTeamDraft.teamLogo}
                      teamName={editTeamDraft.teamName}
                      size="md"
                    />
                    <span className="text-xs text-slate-500">使用平台统一默认战队徽标</span>
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

          {/* 2. 成员修改（含移除队长强制指定新队长、添加成员与 [√] 强行特批加入后门） */}
          <section className="space-y-5">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              二、成员修改（移除队长需指定新队长 · 支持特权跳过校验拉人）
            </h3>

            {/* 队长行 */}
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#0284C7] text-white text-xs">
                    当前队长
                  </span>
                  <span>{editTeamDraft.captainName}</span>
                  <span className="text-xs text-slate-500">
                    （{editTeamDraft.captainUniversity}）
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (editTeamDraft.members.length === 0) {
                    setBackdoorFeedback(
                      '当前队伍无其他剩余队员可供接任队长，请先添加至少 1 名队员后再移除原队长。'
                    );
                    return;
                  }
                  setSelectedNewCaptainMemberId(editTeamDraft.members[0].id);
                  setRemoveCaptainModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>移除队长（需指定新队长）</span>
              </button>
            </div>

            {/* 队员与指导教师列表 */}
            <div className="space-y-2.5">
              {[...editTeamDraft.members, ...editTeamDraft.advisors].map((person) => (
                <div
                  key={person.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
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
                    <div className="text-xs text-slate-500 font-mono-num mt-0.5">
                      手机：{maskPhone(person.phone)} | 邮箱：{maskEmail(person.email)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
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
              ))}
            </div>

            {/* 管理员后门添加成员搜索框 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800">
                  添加成员（支持检测未认证 / 跨校规则拦截，并提供【强行特批加入】后门特权）
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

        {/* 移除队长时强制弹出“请指定新队长”弹窗 */}
        {removeCaptainModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
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
                  您正在移除当前队长 <strong>{editTeamDraft.captainName}</strong>。队伍不可无队长，请从本队剩余成员中指定一名新队长：
                </p>
                <select
                  value={selectedNewCaptainMemberId}
                  onChange={(e) => setSelectedNewCaptainMemberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:border-[#0284C7] focus:outline-none cursor-pointer"
                >
                  {editTeamDraft.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}（{m.university}）
                    </option>
                  ))}
                </select>
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
  // 渲染子视图 3：查看报名列表页（分为【高校审核】与【秘书处审核】两个TAB）
  // ==========================================================================
  if (subView === 'team-list') {
    const effectiveAuditTab = adminRole === 'school_admin' ? 'school' : activeAuditTab;
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

    return (
      <div className="space-y-5 pb-12">
        {/* 顶部面包屑与下载中心入口 */}
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

          <button
            type="button"
            onClick={() => setDownloadCenterOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>异步下载中心 ({asyncDownloadTasks.length})</span>
          </button>
        </div>

        {/* ===================================================================
            全局审核开关控制栏（UI位置：查看报名队伍列表页 -> 列表顶部 / 筛选区上方）
            权限限制：仅组委会超级管理员 (super_admin) 能看到并操作这两个开关
           =================================================================== */}
        {adminRole === 'super_admin' && (
          <div className="bg-gradient-to-r from-sky-50/90 via-white to-indigo-50/50 rounded-2xl border border-sky-200/90 p-4 sm:p-5 text-slate-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0284C7]" />
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                  全局审核阶段开关控制（仅组委会超级管理员可见可操作）
                </span>
              </div>
              <p className="text-xs text-slate-500">
                控制高校管理员与秘书处管理员是否可进入对应审核阶段；当开关关闭时，前台已有状态不倒退，但后台无法进行新的审核操作。
              </p>
            </div>

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

        {/* 两个审核阶段 TAB 切换：高校审核 / 秘书处审核（高校管理员仅能看到“高校审核”Tab） */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveAuditTab('school');
                setSelectedTeamIds([]);
                setFilterAuditStatusInput('all');
                setAppliedTeamFilters((prev) => ({ ...prev, auditStatus: 'all' }));
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer ${
                effectiveAuditTab === 'school'
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>高校审核</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono-num ${
                  effectiveAuditTab === 'school'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                共 {eventAuditTabCounts.schoolTabTotal} 支 · 待审 {eventAuditTabCounts.schoolPendingCount}
              </span>
            </button>

            {adminRole !== 'school_admin' && (
              <button
                type="button"
                onClick={() => {
                  setActiveAuditTab('secretariat');
                  setSelectedTeamIds([]);
                  setFilterAuditStatusInput('all');
                  setAppliedTeamFilters((prev) => ({ ...prev, auditStatus: 'all' }));
                }}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer ${
                  effectiveAuditTab === 'secretariat'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>秘书处审核</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono-num ${
                    effectiveAuditTab === 'secretariat'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  共 {eventAuditTabCounts.secretariatTabTotal} 支 · 待审 {eventAuditTabCounts.secretariatPendingCount}
                </span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500">
            {adminRole === 'school_admin'
              ? `当前为【${adminInstitutionName}】高校管理员视角：仅展示本校已提交的报名队伍，且仅开放【高校审核（通过/驳回）】操作权限。`
              : effectiveAuditTab === 'school'
              ? '阶段一【高校审核】：审核队长已提交的报名队伍；高校审核通过后自动进入【秘书处审核】。无论被高校还是秘书处驳回，队长修改重提后均重新进入【高校审核】与【秘书处审核】流程。'
              : '阶段二【秘书处审核】：仅展示高校审核已通过的队伍；秘书处审核通过后报名状态变为【报名成功】。若秘书处审核驳回，队长修改重提后将重新从【高校审核】开始流转。'}
          </div>
        </div>

        {/* 1. 搜索筛选区（关键字单框多匹配、所属院校、所选赛道、当前阶段审核状态、报名时间范围、【查询】、【重置】） */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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

            {/* 所选赛道（根据该赛事配置的赛道拉取） */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                所选赛道
              </label>
              <select
                value={filterTrackInput}
                onChange={(e) => setFilterTrackInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0284C7] focus:outline-none cursor-pointer"
              >
                <option value="all">全部赛道</option>
                {activeEventForTeams.tracks.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 审核状态（待审核/已通过/已驳回） */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {effectiveAuditTab === 'school' ? '高校审核状态' : '秘书处审核状态'}
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

          {/* 查询与重置按钮 + 顶部全局操作栏（导出Excel、批量审核、导入线下数据） */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* 【导出Excel】（联动指标6） */}
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

              {adminRole === 'super_admin' && (
                <button
                  type="button"
                  onClick={() => handleTriggerExportExcel(true)}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold cursor-pointer"
                  title="演示导出数据量 > 5000 条时的后台异步生成机制"
                >
                  模拟&gt;5000条异步导出
                </button>
              )}

              {/* 【批量审核】 */}
              <button
                type="button"
                disabled={selectedTeamIds.length === 0 || !isCurrentStageSwitchEnabled}
                onClick={() => {
                  setRejectReasonText('');
                  setAuditError(null);
                  setAuditModalState({
                    mode: 'batch',
                    stage: effectiveAuditTab,
                    teamIds: selectedTeamIds,
                    decision: 'approve',
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  批量{effectiveAuditTab === 'school' ? '高校审核' : '秘书处审核'} ({selectedTeamIds.length})
                  {!isCurrentStageSwitchEnabled ? ' [阶段已关闭]' : ''}
                </span>
              </button>

              {/* 【导入线下数据】（仅组委会超级管理员可见） */}
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

        {/* 2. 列表数据区（带复选框，同步展示报名状态、高校审核、秘书处审核及驳回原因气泡） */}
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
                  <th className="py-3.5 px-4">所选赛道</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">成员确认进度</th>
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
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      {effectiveAuditTab === 'secretariat'
                        ? '当前暂无已通过高校审核并进入【秘书处审核】阶段的队伍'
                        : '当前筛选条件下暂无报名队伍数据'}
                    </td>
                  </tr>
                ) : (
                  filteredEventTeams.map((team) => {
                    const isChecked = selectedTeamIds.includes(team.id);
                    const stages = resolveTeamAuditStages(team);
                    const confirmProgress = computeTeamConfirmProgress(team);
                    const canAuditInCurrentTab =
                      isCurrentStageSwitchEnabled &&
                      (effectiveAuditTab === 'school'
                        ? stages.schoolStatus !== 'none'
                        : stages.schoolStatus === 'approved');

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

                        {/* 队伍LOGO（缩略图）+ 队伍名称 */}
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
                                <div className="text-[11px] text-slate-400 max-w-[180px] xl:max-w-[240px] truncate">
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

                        {/* 所选赛道 */}
                        <td className="py-4 px-4 align-middle text-slate-700 max-w-[180px] xl:max-w-[240px]">
                          <div className="line-clamp-1">{team.subTrackName}</div>
                        </td>

                        {/* 成员确认进度：邀请X人，X人已同意，X人已拒绝 */}
                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                          <div className="font-semibold text-slate-700">
                            {confirmProgress.label}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            共 {1 + team.members.length} 名学生
                            {team.advisors.length > 0 ? ` · ${team.advisors.length} 名老师` : ''}
                          </div>
                        </td>

                        {/* 队长姓名 / 队长手机号 */}
                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                          <div className="font-bold text-slate-900">{team.captainName}</div>
                          <div className="text-[11px] font-mono-num text-slate-500">
                            {maskPhone(resolveTeamCaptainContact(team, platformUsers).phone)}
                          </div>
                        </td>

                        {/* 报名状态：组建中 / 邀请中 / 已提交 / 报名成功 */}
                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-bold ${stages.regStatusClass}`}
                          >
                            {stages.regStatusLabel}
                          </span>
                        </td>

                        {/* 高校审核 */}
                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                          <AuditStageBadgeWithTooltip
                            status={stages.schoolStatus}
                            rejectReason={stages.schoolReason}
                            stage="school"
                          />
                        </td>

                        {/* 秘书处审核 */}
                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                          <AuditStageBadgeWithTooltip
                            status={stages.secretariatStatus}
                            rejectReason={stages.secretariatReason}
                            stage="secretariat"
                          />
                        </td>

                        {/* 单行操作栏：高校管理员只能看到“高校审核”Tab且只能操作“通过/驳回”（与只读查看）；组委会超级管理员可见【编辑】 */}
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
                              disabled={!canAuditInCurrentTab}
                              onClick={() => {
                                setRejectReasonText('');
                                setAuditError(null);
                                setAuditModalState({
                                  mode: 'single',
                                  stage: effectiveAuditTab,
                                  teamIds: [team.id],
                                  decision: 'approve',
                                });
                              }}
                              title={
                                !isCurrentStageSwitchEnabled
                                  ? '当前阶段审核开关已关闭，无法进行新的审核操作'
                                  : '点击执行审核通过'
                              }
                              className={`px-2.5 py-1 rounded border font-bold ${
                                canAuditInCurrentTab
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer'
                                  : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                              }`}
                            >
                              通过
                            </button>
                            <button
                              type="button"
                              disabled={!canAuditInCurrentTab}
                              onClick={() => {
                                setRejectReasonText(
                                  effectiveAuditTab === 'school'
                                    ? stages.schoolReason || ''
                                    : stages.secretariatReason || ''
                                );
                                setAuditError(null);
                                setAuditModalState({
                                  mode: 'single',
                                  stage: effectiveAuditTab,
                                  teamIds: [team.id],
                                  decision: 'reject',
                                });
                              }}
                              title={
                                !isCurrentStageSwitchEnabled
                                  ? '当前阶段审核开关已关闭，无法进行新的审核操作'
                                  : '点击执行审核驳回'
                              }
                              className={`px-2.5 py-1 rounded border font-bold ${
                                canAuditInCurrentTab
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

        {/* 弹窗 A：单条 / 批量审核弹窗（区分【高校审核】与【秘书处审核】） */}
        {auditModalState && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 font-extrabold text-sm flex items-center justify-between">
                <span>
                  {auditModalState.mode === 'batch'
                    ? `批量${auditModalState.stage === 'school' ? '高校审核' : '秘书处审核'}（已选 ${auditModalState.teamIds.length} 支队伍）`
                    : `${auditModalState.stage === 'school' ? '高校审核' : '秘书处审核'}报名队伍`}
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
                    选择{auditModalState.stage === 'school' ? '高校审核' : '秘书处审核'}结论：
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
                      <span>{auditModalState.mode === 'batch' ? '批量通过' : '审核通过'}</span>
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
                      <span>{auditModalState.mode === 'batch' ? '批量驳回' : '审核驳回'}</span>
                    </button>
                  </div>
                </div>

                {auditModalState.decision === 'approve' ? (
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 leading-relaxed">
                    {auditModalState.stage === 'school' ? (
                      <>
                        <strong>高校审核通过后：</strong>该队伍的【高校审核】状态将更新为“已通过”，并自动进入<strong>【秘书处审核（待审核）】</strong>阶段，待秘书处终审通过后报名状态变为“报名成功”。
                      </>
                    ) : (
                      <>
                        <strong>秘书处审核通过后：</strong>该队伍的【秘书处审核】状态将更新为“已通过”，前台队长侧【报名状态】将正式变为<strong>“报名成功”</strong>！
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                      <strong>驳回重提规则：</strong>无论是【高校审核】驳回还是【秘书处审核】驳回，队长修改报名信息并重新提交后，均需重新进入<strong>【高校审核（待审核）】&rarr;【秘书处审核】</strong>两个完整流程。
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        填写{auditModalState.stage === 'school' ? '高校审核' : '秘书处审核'}驳回原因{' '}
                        <span className="text-red-500">*（必填，前台悬浮小图标将显示此原因）</span>
                      </label>
                    </div>
                    {/* 快捷驳回语 */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400">快捷语：</span>
                      {[
                        '队伍成员学籍认证信息存疑，请重新核对后提交',
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
                      placeholder="请输入具体驳回原因，前台【我的报名】对应审核列将展示“已驳回”及悬浮原因图标，队长修改重新提交后将重新进入高校审核与秘书处审核流程..."
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
                    确认提交{auditModalState.stage === 'school' ? '高校审核' : '秘书处审核'}结果
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 弹窗 B：导出 Excel 双 Sheet 预览弹窗 */}
        {exportPreviewModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full overflow-hidden shadow-2xl">
              <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200 text-emerald-900 font-extrabold text-sm flex items-center justify-between">
                <span>
                  Excel 导出文件已生成并下载（含双工作表 Sheet1 & Sheet2 · 隐私字段默认脱敏）
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
                <div className="flex items-center justify-between">
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
                      Sheet1（队伍汇总）
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
                      Sheet2（成员明细 · 身份证/手机脱敏）
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    共导出 {exportPreviewModal.teams.length} 支队伍
                  </span>
                </div>

                <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-xl">
                  {exportPreviewModal.sheetTab === 'sheet1' ? (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                          <th className="py-2.5 px-3">队伍名</th>
                          <th className="py-2.5 px-3">学校</th>
                          <th className="py-2.5 px-3">赛道</th>
                          <th className="py-2.5 px-3">队长</th>
                          <th className="py-2.5 px-3">状态</th>
                          <th className="py-2.5 px-3">人数</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {exportPreviewModal.teams.map((t) => (
                          <tr key={t.id}>
                            <td className="py-2 px-3 font-bold">{t.teamName}</td>
                            <td className="py-2 px-3">{t.university}</td>
                            <td className="py-2 px-3">{t.subTrackName}</td>
                            <td className="py-2 px-3">{t.captainName}</td>
                            <td className="py-2 px-3">{mapTeamStatusToAdminAudit(t.status).label}</td>
                            <td className="py-2 px-3 font-mono-num">{1 + t.members.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                          <th className="py-2.5 px-3">所属队伍</th>
                          <th className="py-2.5 px-3">姓名</th>
                          <th className="py-2.5 px-3">角色</th>
                          <th className="py-2.5 px-3">学校</th>
                          <th className="py-2.5 px-3">身份证号(脱敏)</th>
                          <th className="py-2.5 px-3">手机号(脱敏)</th>
                          <th className="py-2.5 px-3">邮箱(脱敏)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {exportPreviewModal.teams.flatMap((t) => {
                          const capContact = resolveTeamCaptainContact(t, platformUsers);
                          return [
                            <tr key={`${t.id}-cap`}>
                              <td className="py-2 px-3 font-bold">{t.teamName}</td>
                              <td className="py-2 px-3">{t.captainName}</td>
                              <td className="py-2 px-3">队长</td>
                              <td className="py-2 px-3">{t.captainUniversity}</td>
                              <td className="py-2 px-3 font-mono-num">{getMaskedIdCard(t.captainName)}</td>
                              <td className="py-2 px-3 font-mono-num">{maskPhone(capContact.phone)}</td>
                              <td className="py-2 px-3 font-mono-num">{maskEmail(capContact.email)}</td>
                            </tr>,
                            ...[...t.members, ...t.advisors].map((p) => (
                              <tr key={`${t.id}-${p.id}`}>
                                <td className="py-2 px-3 font-bold">{t.teamName}</td>
                                <td className="py-2 px-3">{p.name}</td>
                                <td className="py-2 px-3">{p.role === 'advisor' ? '指导教师' : '队员'}</td>
                                <td className="py-2 px-3">{p.university}</td>
                                <td className="py-2 px-3 font-mono-num">{getMaskedIdCard(p.name + p.phone)}</td>
                                <td className="py-2 px-3 font-mono-num">{maskPhone(p.phone)}</td>
                                <td className="py-2 px-3 font-mono-num">{maskEmail(p.email)}</td>
                              </tr>
                            )),
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
                <span>导入线下报名数据（指标6：三重校验与错误行报告）</span>
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
      {/* 顶部搜索区：赛事名称（模糊搜索） + 状态（未开始/开启中/已截止/已停用） + 新增按钮 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              状态筛选：
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
              <option value="all">全部状态 ({registrationConfigs.length})</option>
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
                <th className="py-3.5 px-4 whitespace-nowrap">状态</th>
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
                      {/* 关联赛事名称 */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {comp?.title || `未知赛事 (${cfg.eventId})`}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono-num mt-0.5">
                          Event_ID: {cfg.eventId}
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
                即将删除赛事《{getCompById(deleteConfigConfirmTarget.eventId)?.title}》的报名配置记录（Event_ID: {deleteConfigConfirmTarget.eventId}），删除操作将实时写入后台安全操作审计日志。
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
