import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  Download,
  Building2,
  FileText,
  Video,
  Image as ImageIcon,
  Calendar,
  Clock,
  Pin,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Play,
  Volume2,
  VolumeX,
  RefreshCw,
  ShieldCheck,
  Users,
  Award,
  ExternalLink,
  Check,
  X,
  Sparkles,
  BookOpen,
  Filter,
  History,
  ChevronDown,
  HelpCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import {
  NOTICE_ITEMS,
  DEFAULT_NEWS_COVER_SVG,
  HELP_CENTER_MARKDOWN_DOC,
  ALL_CHINA_PROVINCES,
  BANNER_POSTER_1,
  BANNER_POSTER_2,
  BANNER_POSTER_3,
  BANNER_POSTER_4,
  BANNER_POSTER_5,
  type NoticeItem,
  type NoticeCategoryType,
  type FaqItem,
  type HomeBannerConfig,
  type DivisionRecord,
} from '../data/competitionData';
import {
  getEffectiveUserStatus,
  resolveTeamAuditStages,
  type CaptainTeamRecord,
  type PlatformDirectoryUser,
} from './TeamRegistrationSystem';

// ============================================================================
// 一、后台院校管理（对应前台学籍/教师认证）数据类型与丰富示例数据
// ============================================================================

export interface InstitutionAuditLog {
  id: string;
  time: string;
  operator: string;
  action:
    | '启用院校'
    | '停用院校'
    | '批量导入更新'
    | '教育部标准更名同步'
    | '修改核验配置'
    | '分配高校管理员'
    | '移除高校管理员';
  detail: string;
}

export interface InstitutionEventStat {
  eventId: string;
  eventName: string;
  verifiedStudentParticipants: number;
  verifiedTeacherAdvisors: number;
  registeredTeamsCount: number;
  approvedTeamsCount: number;
}

export interface InstitutionRecord {
  id: string;
  code: string; // 10位教育部全国唯一识别码
  name: string; // 官方全称
  department: string; // 主管部门
  location: string; // 所在地（省份+城市）
  level: '本科' | '专科'; // 办学层次
  type: '普通本科' | '职业本科' | '高职专科' | '成人高校' | ''; // 办学类型（扩展）
  remark: string; // 备注（如“民办”“中外合作办学”等）
  platformStatus: 'enabled' | 'disabled'; // 平台状态：启用 / 停用
  supportAutoVerify: boolean; // 是否支持学籍自动核验
  verifiedStudentsCount: number; // 平台已验证学生数（统计字段）
  verifiedTeachersCount: number; // 平台已验证教师数（统计字段）
  associatedTeamsCount: number; // 关联报名队伍数（统计字段）
  passRate: number; // 认证通过率 (%)
  eventBreakdown: InstitutionEventStat[];
  auditLogs: InstitutionAuditLog[];
}

export const INITIAL_INSTITUTIONS: InstitutionRecord[] = [
  {
    id: 'inst-1',
    code: '4111010001',
    name: '北京大学',
    department: '教育部',
    location: '北京市',
    level: '本科',
    type: '普通本科',
    remark: '双一流 / 985 / 211',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 342,
    verifiedTeachersCount: 28,
    associatedTeamsCount: 86,
    passRate: 98.5,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 185, verifiedTeacherAdvisors: 16, registeredTeamsCount: 46, approvedTeamsCount: 44 },
      { eventId: 'comp-2', eventName: '2026“XX杯”AI大模型内生安全与对抗专项赛', verifiedStudentParticipants: 112, verifiedTeacherAdvisors: 8, registeredTeamsCount: 28, approvedTeamsCount: 27 },
      { eventId: 'comp-3', eventName: '2026国家关键信息基础设施云原生防御挑战赛', verifiedStudentParticipants: 45, verifiedTeacherAdvisors: 4, registeredTeamsCount: 12, approvedTeamsCount: 12 }
    ],
    auditLogs: [
      { id: 'log-101', time: '2026-04-01 09:00:12', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部2026年全国普通高等学校名单基准库同步，核验标识码 4111010001' },
      { id: 'log-102', time: '2026-04-05 14:22:08', operator: '平台运营专员 (ops_wang)', action: '修改核验配置', detail: '开启学信网+教育网CARSI联邦自动学籍核验通道' }
    ]
  },
  {
    id: 'inst-2',
    code: '4111010003',
    name: '清华大学',
    department: '教育部',
    location: '北京市',
    level: '本科',
    type: '普通本科',
    remark: '双一流 / 985 / 211',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 418,
    verifiedTeachersCount: 35,
    associatedTeamsCount: 104,
    passRate: 99.1,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 230, verifiedTeacherAdvisors: 20, registeredTeamsCount: 58, approvedTeamsCount: 57 },
      { eventId: 'comp-2', eventName: '2026“XX杯”AI大模型内生安全与对抗专项赛', verifiedStudentParticipants: 138, verifiedTeacherAdvisors: 11, registeredTeamsCount: 34, approvedTeamsCount: 33 },
      { eventId: 'comp-4', eventName: '2026全国高校密码数学与零知识证明创新应用赛', verifiedStudentParticipants: 50, verifiedTeacherAdvisors: 4, registeredTeamsCount: 12, approvedTeamsCount: 12 }
    ],
    auditLogs: [
      { id: 'log-201', time: '2026-04-01 09:00:12', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部2026年全国普通高等学校名单基准库同步，核验标识码 4111010003' }
    ]
  },
  {
    id: 'inst-3',
    code: '4111010006',
    name: '北京航空航天大学',
    department: '工业和信息化部',
    location: '北京市',
    level: '本科',
    type: '普通本科',
    remark: '工信部直属 / 一流网安学院示范高校',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 296,
    verifiedTeachersCount: 22,
    associatedTeamsCount: 74,
    passRate: 97.4,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 180, verifiedTeacherAdvisors: 14, registeredTeamsCount: 45, approvedTeamsCount: 43 },
      { eventId: 'comp-3', eventName: '2026国家关键信息基础设施云原生防御挑战赛', verifiedStudentParticipants: 116, verifiedTeacherAdvisors: 8, registeredTeamsCount: 29, approvedTeamsCount: 28 }
    ],
    auditLogs: [
      { id: 'log-301', time: '2026-04-01 09:00:15', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '同步工信部直属高校名录' }
    ]
  },
  {
    id: 'inst-4',
    code: '4111010013',
    name: '北京邮电大学',
    department: '教育部',
    location: '北京市',
    level: '本科',
    type: '普通本科',
    remark: '一流网络安全学院建设示范项目高校',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 512,
    verifiedTeachersCount: 41,
    associatedTeamsCount: 128,
    passRate: 98.2,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 312, verifiedTeacherAdvisors: 25, registeredTeamsCount: 78, approvedTeamsCount: 76 },
      { eventId: 'comp-2', eventName: '2026“XX杯”AI大模型内生安全与对抗专项赛', verifiedStudentParticipants: 200, verifiedTeacherAdvisors: 16, registeredTeamsCount: 50, approvedTeamsCount: 49 }
    ],
    auditLogs: [
      { id: 'log-401', time: '2026-04-01 09:00:15', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' }
    ]
  },
  {
    id: 'inst-5',
    code: '4133010335',
    name: '浙江大学',
    department: '教育部',
    location: '浙江省杭州市',
    level: '本科',
    type: '普通本科',
    remark: '双一流 / 一流网安学院示范高校',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 388,
    verifiedTeachersCount: 31,
    associatedTeamsCount: 95,
    passRate: 98.8,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 240, verifiedTeacherAdvisors: 19, registeredTeamsCount: 60, approvedTeamsCount: 59 },
      { eventId: 'comp-2', eventName: '2026“XX杯”AI大模型内生安全与对抗专项赛', verifiedStudentParticipants: 148, verifiedTeacherAdvisors: 12, registeredTeamsCount: 35, approvedTeamsCount: 35 }
    ],
    auditLogs: [
      { id: 'log-501', time: '2026-04-01 09:00:18', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' }
    ]
  },
  {
    id: 'inst-6',
    code: '4131010248',
    name: '上海交通大学',
    department: '教育部',
    location: '上海市',
    level: '本科',
    type: '普通本科',
    remark: '双一流 / 985 / 211',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 356,
    verifiedTeachersCount: 29,
    associatedTeamsCount: 89,
    passRate: 97.9,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 220, verifiedTeacherAdvisors: 18, registeredTeamsCount: 55, approvedTeamsCount: 54 },
      { eventId: 'comp-3', eventName: '2026国家关键信息基础设施云原生防御挑战赛', verifiedStudentParticipants: 136, verifiedTeacherAdvisors: 11, registeredTeamsCount: 34, approvedTeamsCount: 33 }
    ],
    auditLogs: [
      { id: 'log-601', time: '2026-04-01 09:00:20', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' }
    ]
  },
  {
    id: 'inst-7',
    code: '4131010246',
    name: '复旦大学',
    department: '教育部',
    location: '上海市',
    level: '本科',
    type: '普通本科',
    remark: '双一流 / 985 / 211',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 264,
    verifiedTeachersCount: 21,
    associatedTeamsCount: 66,
    passRate: 97.2,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 184, verifiedTeacherAdvisors: 15, registeredTeamsCount: 46, approvedTeamsCount: 45 },
      { eventId: 'comp-2', eventName: '2026“XX杯”AI大模型内生安全与对抗专项赛', verifiedStudentParticipants: 80, verifiedTeacherAdvisors: 6, registeredTeamsCount: 20, approvedTeamsCount: 19 }
    ],
    auditLogs: [
      { id: 'log-701', time: '2026-04-01 09:00:22', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' }
    ]
  },
  {
    id: 'inst-8',
    code: '4142010487',
    name: '华中科技大学',
    department: '教育部',
    location: '湖北省武汉市',
    level: '本科',
    type: '普通本科',
    remark: '一流网络安全学院建设示范项目高校',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 328,
    verifiedTeachersCount: 26,
    associatedTeamsCount: 82,
    passRate: 96.8,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 228, verifiedTeacherAdvisors: 18, registeredTeamsCount: 57, approvedTeamsCount: 55 },
      { eventId: 'comp-3', eventName: '2026国家关键信息基础设施云原生防御挑战赛', verifiedStudentParticipants: 100, verifiedTeacherAdvisors: 8, registeredTeamsCount: 25, approvedTeamsCount: 24 }
    ],
    auditLogs: [
      { id: 'log-801', time: '2026-04-01 09:00:25', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' }
    ]
  },
  {
    id: 'inst-9',
    code: '4142010486',
    name: '武汉大学',
    department: '教育部',
    location: '湖北省武汉市',
    level: '本科',
    type: '普通本科',
    remark: '国家网络安全人才与创新基地核心高校',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 310,
    verifiedTeachersCount: 25,
    associatedTeamsCount: 77,
    passRate: 97.5,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 210, verifiedTeacherAdvisors: 17, registeredTeamsCount: 52, approvedTeamsCount: 51 },
      { eventId: 'comp-5', eventName: '2026政务数据要素安全流通与隐私计算治理挑战赛', verifiedStudentParticipants: 100, verifiedTeacherAdvisors: 8, registeredTeamsCount: 25, approvedTeamsCount: 24 }
    ],
    auditLogs: [
      { id: 'log-901', time: '2026-04-01 09:00:26', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' }
    ]
  },
  {
    id: 'inst-10',
    code: '4161010701',
    name: '西安电子科技大学',
    department: '教育部',
    location: '陕西省西安市',
    level: '本科',
    type: '普通本科',
    remark: '一流网络安全学院建设示范项目高校',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 445,
    verifiedTeachersCount: 36,
    associatedTeamsCount: 111,
    passRate: 98.0,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 295, verifiedTeacherAdvisors: 24, registeredTeamsCount: 74, approvedTeamsCount: 72 },
      { eventId: 'comp-4', eventName: '2026全国高校密码数学与零知识证明创新应用赛', verifiedStudentParticipants: 150, verifiedTeacherAdvisors: 12, registeredTeamsCount: 37, approvedTeamsCount: 36 }
    ],
    auditLogs: [
      { id: 'log-1001', time: '2026-04-01 09:00:28', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' }
    ]
  },
  {
    id: 'inst-11',
    code: '4151010614',
    name: '电子科技大学',
    department: '教育部',
    location: '四川省成都市',
    level: '本科',
    type: '普通本科',
    remark: '双一流 / 985 / 211',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 284,
    verifiedTeachersCount: 22,
    associatedTeamsCount: 71,
    passRate: 96.9,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 204, verifiedTeacherAdvisors: 16, registeredTeamsCount: 51, approvedTeamsCount: 50 },
      { eventId: 'comp-2', eventName: '2026“XX杯”AI大模型内生安全与对抗专项赛', verifiedStudentParticipants: 80, verifiedTeacherAdvisors: 6, registeredTeamsCount: 20, approvedTeamsCount: 19 }
    ],
    auditLogs: [
      { id: 'log-1101', time: '2026-04-01 09:00:30', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' }
    ]
  },
  {
    id: 'inst-12',
    code: '4123010213',
    name: '哈尔滨工业大学',
    department: '工业和信息化部',
    location: '黑龙江省哈尔滨市',
    level: '本科',
    type: '普通本科',
    remark: '工信部直属 / C9联盟',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 276,
    verifiedTeachersCount: 21,
    associatedTeamsCount: 69,
    passRate: 97.6,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 196, verifiedTeacherAdvisors: 15, registeredTeamsCount: 49, approvedTeamsCount: 48 },
      { eventId: 'comp-6', eventName: '2026智能网联汽车车路云一体化安全攻防挑战赛', verifiedStudentParticipants: 80, verifiedTeacherAdvisors: 6, registeredTeamsCount: 20, approvedTeamsCount: 19 }
    ],
    auditLogs: [
      { id: 'log-1201', time: '2026-04-01 09:00:32', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' }
    ]
  },
  {
    id: 'inst-13',
    code: '4134010358',
    name: '中国科学技术大学',
    department: '中国科学院',
    location: '安徽省合肥市',
    level: '本科',
    type: '普通本科',
    remark: '中科院直属 / 一流网安学院示范高校',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 232,
    verifiedTeachersCount: 19,
    associatedTeamsCount: 58,
    passRate: 99.0,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 152, verifiedTeacherAdvisors: 13, registeredTeamsCount: 38, approvedTeamsCount: 38 },
      { eventId: 'comp-4', eventName: '2026全国高校密码数学与零知识证明创新应用赛', verifiedStudentParticipants: 80, verifiedTeacherAdvisors: 6, registeredTeamsCount: 20, approvedTeamsCount: 20 }
    ],
    auditLogs: [
      { id: 'log-1301', time: '2026-04-01 09:00:35', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' }
    ]
  },
  {
    id: 'inst-14',
    code: '4144012957',
    name: '深圳职业技术大学',
    department: '广东省',
    location: '广东省深圳市',
    level: '本科',
    type: '职业本科',
    remark: '由深圳职业技术学院升格更名',
    platformStatus: 'enabled',
    supportAutoVerify: true,
    verifiedStudentsCount: 148,
    verifiedTeachersCount: 14,
    associatedTeamsCount: 37,
    passRate: 94.5,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 108, verifiedTeacherAdvisors: 10, registeredTeamsCount: 27, approvedTeamsCount: 25 },
      { eventId: 'comp-3', eventName: '2026国家关键信息基础设施云原生防御挑战赛', verifiedStudentParticipants: 40, verifiedTeacherAdvisors: 4, registeredTeamsCount: 10, approvedTeamsCount: 9 }
    ],
    auditLogs: [
      { id: 'log-1401', time: '2026-04-01 09:00:38', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' },
      { id: 'log-1402', time: '2026-04-03 16:10:00', operator: '系统管理员 (admin)', action: '教育部标准更名同步', detail: '依据教育部最新高校名录（标识码 4144012957），学校名称由“深圳职业技术学院”同步更新为“深圳职业技术大学”，办学层次更新为“本科（职业本科）”' }
    ]
  },
  {
    id: 'inst-15',
    code: '4111010858',
    name: '北京电子科技职业学院',
    department: '北京市',
    location: '北京市',
    level: '专科',
    type: '高职专科',
    remark: '中国特色高水平高职学校',
    platformStatus: 'enabled',
    supportAutoVerify: false,
    verifiedStudentsCount: 92,
    verifiedTeachersCount: 9,
    associatedTeamsCount: 23,
    passRate: 91.2,
    eventBreakdown: [
      { eventId: 'comp-1', eventName: '第七届“XX杯”全国网数智安全大赛（总决赛暨主赛道）', verifiedStudentParticipants: 92, verifiedTeacherAdvisors: 9, registeredTeamsCount: 23, approvedTeamsCount: 21 }
    ],
    auditLogs: [
      { id: 'log-1501', time: '2026-04-01 09:00:40', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' }
    ]
  },
  {
    id: 'inst-16',
    code: '4132016404',
    name: '西交利物浦大学',
    department: '江苏省教育厅',
    location: '江苏省苏州市',
    level: '本科',
    type: '普通本科',
    remark: '中外合作办学',
    platformStatus: 'enabled',
    supportAutoVerify: false,
    verifiedStudentsCount: 64,
    verifiedTeachersCount: 6,
    associatedTeamsCount: 16,
    passRate: 93.8,
    eventBreakdown: [
      { eventId: 'comp-2', eventName: '2026“XX杯”AI大模型内生安全与对抗专项赛', verifiedStudentParticipants: 64, verifiedTeacherAdvisors: 6, registeredTeamsCount: 16, approvedTeamsCount: 15 }
    ],
    auditLogs: [
      { id: 'log-1601', time: '2026-04-01 09:00:42', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部中外合作办学高校名录导入' }
    ]
  },
  {
    id: 'inst-17',
    code: '4142012310',
    name: '武昌首义学院',
    department: '湖北省教育厅',
    location: '湖北省武汉市',
    level: '本科',
    type: '普通本科',
    remark: '民办',
    platformStatus: 'disabled',
    supportAutoVerify: false,
    verifiedStudentsCount: 28,
    verifiedTeachersCount: 3,
    associatedTeamsCount: 7,
    passRate: 88.5,
    eventBreakdown: [
      { eventId: 'comp-7', eventName: '第六届“XX杯”全国网数智安全大赛（2025年度归档赛事）', verifiedStudentParticipants: 28, verifiedTeacherAdvisors: 3, registeredTeamsCount: 7, approvedTeamsCount: 7 }
    ],
    auditLogs: [
      { id: 'log-1701', time: '2026-04-01 09:00:45', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' },
      { id: 'log-1702', time: '2026-04-09 11:30:22', operator: '平台运营专员 (ops_wang)', action: '停用院校', detail: '因本赛年专项赛区调整暂时停用，前台认证下拉框隐藏，保留历史28名学生与3名教师认证记录' }
    ]
  },
  {
    id: 'inst-18',
    code: '4133013022',
    name: '杭州职业技术学院',
    department: '浙江省',
    location: '浙江省杭州市',
    level: '专科',
    type: '高职专科',
    remark: '国家骨干高职院校',
    platformStatus: 'disabled',
    supportAutoVerify: false,
    verifiedStudentsCount: 16,
    verifiedTeachersCount: 2,
    associatedTeamsCount: 4,
    passRate: 90.0,
    eventBreakdown: [
      { eventId: 'comp-7', eventName: '第六届“XX杯”全国网数智安全大赛（2025年度归档赛事）', verifiedStudentParticipants: 16, verifiedTeacherAdvisors: 2, registeredTeamsCount: 4, approvedTeamsCount: 4 }
    ],
    auditLogs: [
      { id: 'log-1801', time: '2026-04-01 09:00:48', operator: '系统管理员 (admin)', action: '批量导入更新', detail: '教育部标准名录导入' },
      { id: 'log-1802', time: '2026-04-10 17:05:19', operator: '系统管理员 (admin)', action: '停用院校', detail: '院校接口维护期停用，历史认证数据完整保留' }
    ]
  }
];

// ============================================================================
// 二、赛事新闻（后台【内容管理 -> 赛事新闻】与前台【赛事新闻】共用数据）
// ============================================================================

export type ContentPublishStatus = 'published' | 'unpublished';

export interface ManagedNewsItem {
  id: string;
  title: string; // 必填，限64字以内
  tags: string[]; // 分类/标签（支持多选：赛事新闻、通知公告、赛制解读、权威报道等）
  coverImage?: string; // 封面图（非必填，16:9，支持无图纯文字排版）
  summary: string; // 简介/摘要
  source: string; // 来源（如：大赛组委会、新华网等）
  content: string; // 正文（富文本/HTML或分段结构，支持嵌入多张图片与视频）
  embeddedImages?: { url: string; caption: string }[];
  embeddedVideo?: { url: string; poster: string; title: string; duration: string };
  publishStatus: ContentPublishStatus; // 已发布 / 未发布
  publishTime: string; // YYYY-MM-DD HH:mm 或 YYYY-MM-DD
  isPinned: boolean; // 是否置顶
  pinExpireTime?: string; // 置顶有效期（选填）
  viewsCount: number;
}

export const INITIAL_MANAGED_NEWS: ManagedNewsItem[] = [
  {
    id: 'mnews-1',
    title: '第七届“XX杯”全国网数智安全大赛正式启动，全国八大赛区同步开启报名通道',
    tags: ['赛事新闻', '通知公告'],
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=960&q=80',
    summary: '本届大赛聚焦人工智能内生安全、云原生防御、数据要素隐私计算与智能网联汽车安全四大前沿方向，总奖金池突破300万元，面向全国普通高校全日制本专科及研究生全面开放。',
    source: '大赛组委会秘书处',
    publishStatus: 'published',
    publishTime: '2026-04-14 09:00',
    isPinned: true,
    pinExpireTime: '2026-06-30 23:59',
    viewsCount: 18420,
    embeddedImages: [
      {
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
        caption: '图1：第七届“XX杯”全国网数智安全大赛启动仪式暨专家委员会全体会议现场'
      },
      {
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        caption: '图2：国家级数字靶场实时攻防态势感知演练大屏'
      }
    ],
    embeddedVideo: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      poster: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      title: '第七届“XX杯”网数智安全大赛官方宣传片与赛制全解',
      duration: '03:45'
    },
    content: `2026年4月14日上午，第七届“XX杯”全国网数智安全大赛启动仪式在北京国家会议中心隆重举行。来自教育部、工业和信息化部相关司局领导，两院院士及全国40余所一流网络安全学院建设示范项目高校代表共同出席启动仪式。

### 一、赛事定位与年度核心升级
本届大赛以“筑牢数字底座，护航智能未来”为主题，在延续传统CTF夺旗赛与AWD攻防兼备赛的基础上，全面引入**大模型内生安全对抗**、**国家关键信息基础设施云原生防御**、**政务数据要素安全流通与隐私计算**等真实产业场景靶场。

### 二、参赛对象与报名方式
1. **参赛对象**：全国普通高等学校（含本科、职业本科、高职专科）全日制在校生，均可通过平台完成实名认证与学籍认证后组队报名。
2. **组队规则**：每支参赛队由 1 名队长、1-3 名队员及 1-2 名本校认证指导教师组成。系统支持队长在线发起组队邀请、队员站内一键确认。
3. **赛程安排**：4月至5月为全国线上报名与资格初赛阶段，6月举行八大分赛区晋级赛，7月中旬在北京举行全国总决赛暨颁奖盛典。`
  },
  {
    id: 'mnews-2',
    title: '关于发布《2026年度全国高校参赛选手实名认证与教育部院校标准库核验规范》的通知',
    tags: ['赛事新闻'],
    coverImage: DEFAULT_NEWS_COVER_SVG,
    summary: '为确保国家级赛事公平公正，平台已全面对接教育部全国普通高等学校10位唯一标识码标准名录，所有参赛队员及指导教师须在报名截止前完成实名与学籍/教工认证。',
    source: '大赛资格审查委员会',
    publishStatus: 'published',
    publishTime: '2026-04-13 15:30',
    isPinned: true,
    pinExpireTime: '2026-05-31 23:59',
    viewsCount: 12650,
    content: `各参赛高校领队、指导教师及参赛同学：

为切实保障第七届“XX杯”全国网数智安全大赛的权威性与严谨性，防范跨校违规代打与虚假身份报名，大赛平台本年度对选手认证体系进行了全面升级：

### 1. 教育部10位学校标识码标准库绑定
平台后台【院校管理】模块已严格按照教育部发布的全国普通高等学校名单建立唯一索引（如北京大学 4111010001、清华大学 4111010003）。选手在【个人中心 -> 用户认证】选择就读院校时，系统将自动校验院校启用状态及学籍核验通道。

### 2. 先实名、后学籍/教师认证的双重校验机制
- **第一步（实名认证）**：需验证绑定手机号短信验证码，并通过公安人口库核验真实姓名与身份证号。
- **第二步（学籍/教师认证）**：实名通过后解锁，支持学信网在线验证码核验或上传学生证/在读证明/工作证由平台专员审核。

请各参赛队伍务必预留充足的认证审核时间，避免因压线提交导致错过赛事报名截止窗口。`
  },
  {
    id: 'mnews-3',
    title: '聚焦AI大模型红蓝对抗：2026“XX杯”大模型安全专项赛技术白皮书与样题解析正式公开',
    tags: ['赛事新闻'],
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=960&q=80',
    summary: '专项赛涵盖提示词注入越狱防御、RAG检索增强知识库投毒检测、多模态对抗样本鲁棒性加固及Agent工具调用权限逃逸四大核心赛题模块。',
    source: '大赛技术命题组',
    publishStatus: 'published',
    publishTime: '2026-04-12 11:20',
    isPinned: false,
    viewsCount: 9830,
    embeddedImages: [
      {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        caption: '图1：大模型安全专项赛红蓝双盲对抗评测沙箱架构图'
      }
    ],
    content: `随着生成式人工智能与行业大模型的广泛落地，针对大模型的提示词越狱、训练数据投毒、模型权重窃取与智能体（Agent）越权调用已成为网数智安全领域的焦点挑战。

今日，大赛技术命题组正式公开《2026“XX杯”AI大模型内生安全与对抗专项赛技术白皮书》，并同步在训练靶场上线 5 道标准样题供全国参赛战队开展赛前热身测验。`
  },
  {
    id: 'mnews-4',
    title: '新华网专访大赛评委会主席：以实战化数字靶场锤炼国家急需紧缺网安实战人才',
    tags: ['赛事新闻'],
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=960&q=80',
    summary: '评委会主席在采访中指出，“XX杯”已连续举办七届，累计吸引全国超1200所本专科院校、近18万人次学子同台竞技，成为连接高校科研与产业一线安全防御的桥梁。',
    source: '新华网科技频道',
    publishStatus: 'published',
    publishTime: '2026-04-10 16:45',
    isPinned: false,
    viewsCount: 8410,
    content: `在接受新华网记者专访时，大赛评委会主席表示，网络安全本质上是人与人的对抗，检验人才培养质量最有效的试金石就是高仿真的实战演练。

本届大赛首次将政企单位在真实生产环境中脱敏后的云原生集群配置缺陷、供应链依赖投毒链路搬上赛场，要求参赛团队不仅能发现漏洞（Break），更能迅速编写热补丁完成自动化加固（Fix）。`
  },
  {
    id: 'mnews-5',
    title: '关于公布第七届“XX杯”大赛首批合作支撑单位与国家级数字靶场算力节点的公告',
    tags: ['赛事新闻'],
    coverImage: DEFAULT_NEWS_COVER_SVG,
    summary: '为支撑全国上万支参赛战队并发在线实操，大赛组委会联合国家超算中心及头部云安全厂商，已完成北京、上海、杭州、武汉、西安五大分布式靶场节点部署。',
    source: '大赛组委会基础设施组',
    publishStatus: 'published',
    publishTime: '2026-04-09 10:15',
    isPinned: false,
    viewsCount: 6230,
    content: `经大赛组委会严格评审与压力测试，第七届“XX杯”全国网数智安全大赛五大分布式云靶场节点已完成联调，具备同时承载 5,000 个独立容器集群沙箱与 200 路 GPU 推理对抗实例的高可用支撑能力。`
  },
  {
    id: 'mnews-6',
    title: '2026国家关键信息基础设施云原生防御挑战赛参赛指南与K8s集群沙箱接入说明',
    tags: ['赛事新闻'],
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=960&q=80',
    summary: '详细介绍云原生防御挑战赛中的VPN安全接入凭证获取方式、eBPF可观测性探针部署规范以及AWD Plus自动化补丁校验评分机制。',
    source: '云原生赛道命题委员会',
    publishStatus: 'published',
    publishTime: '2026-04-08 14:00',
    isPinned: false,
    viewsCount: 7190,
    content: `参加“2026国家关键信息基础设施云原生防御挑战赛”的各支队伍，在报名审核通过后将获得专属 WireGuard 接入配置文件，可直接连接至本队专属的 Kubernetes 多租户演练靶场。`
  },
  {
    id: 'mnews-7',
    title: '全国高校密码数学与零知识证明（ZKP）创新应用赛专家评审细则发布',
    tags: ['赛事新闻'],
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=960&q=80',
    summary: '明确后量子密码算法工程实现、zk-SNARKs电路优化效率、形式化安全证明完备性及国产密码硬件适配度四大评分维度权重。',
    source: '密码专项赛专家组',
    publishStatus: 'published',
    publishTime: '2026-04-06 09:30',
    isPinned: false,
    viewsCount: 5480,
    content: `密码专项赛采取“线上算法开源评测 + 线下专家答辩质询”双轨评分制，重点考察参赛团队在格密码（Lattice-based Cryptography）与高效零知识证明协议上的底层代码实现能力。`
  },
  {
    id: 'mnews-8',
    title: '政务数据要素安全流通与隐私计算治理挑战赛开放测试数据集下载的通知',
    tags: ['赛事新闻'],
    coverImage: DEFAULT_NEWS_COVER_SVG,
    summary: '即日起，已进入“组建中”或“报名成功”状态的参赛队伍队长可登录大赛数据沙箱下载百万级脱敏政务与金融联合建模基准测试集。',
    source: '数据安全赛道工作组',
    publishStatus: 'published',
    publishTime: '2026-04-05 17:10',
    isPinned: false,
    viewsCount: 4920,
    content: `测试数据集包含联邦学习纵向特征对齐样本、多方安全计算（MPC）密态求交基准数据及差分隐私预算评估脚本，严禁将测试集用于赛事以外的任何商业用途。`
  },
  {
    id: 'mnews-9',
    title: '智能网联汽车车路云一体化安全攻防赛线下实车破解阶段安全操作守则',
    tags: ['赛事新闻'],
    coverImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=960&q=80',
    summary: '针对CAN-FD车载总线注入、V2X路侧单元通信伪造及智能座舱OTA固件逆向三大实车赛项，明确物理台架操作安全边界与违规熔断机制。',
    source: '车联网安全实验室',
    publishStatus: 'published',
    publishTime: '2026-04-03 11:00',
    isPinned: false,
    viewsCount: 5310,
    content: `所有晋级车联网赛道线下决赛的战队，在接入实车台架前须签署《智能网联汽车硬件台架安全测试承诺书》，严禁向非授权控制域发送高危底盘制动指令。`
  },
  {
    id: 'mnews-10',
    title: '关于增设职业本科与高职专科院校网安技能专项激励奖学金的决定',
    tags: ['赛事新闻'],
    coverImage: DEFAULT_NEWS_COVER_SVG,
    summary: '为鼓励应用型本科与高职院校学子投身网络安全运维与应急响应一线，本届大赛特设“卓越工匠网安专项奖”，覆盖20支优秀职业院校战队。',
    source: '大赛组委会秘书处',
    publishStatus: 'published',
    publishTime: '2026-04-01 10:00',
    isPinned: false,
    viewsCount: 6840,
    content: `依据教育部全国普通高等学校名单中“职业本科”与“高职专科”办学类型认证数据，系统将自动识别符合条件的职业院校参赛队伍并纳入专项奖评选池。`
  },
  {
    id: 'mnews-11',
    title: '往届回顾：第六届“XX杯”全国总决赛冠军战队“天枢星辰”赛后技术复盘与成长之路',
    tags: ['赛事新闻'],
    coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=960&q=80',
    summary: '深度访谈上届总冠军团队四位主力队员，揭秘他们在48小时极限AWD攻防拉锯战中如何实现零失分漏洞修补与自动化流量重放反制。',
    source: '中国信息安全杂志社',
    publishStatus: 'published',
    publishTime: '2026-03-28 15:20',
    isPinned: false,
    viewsCount: 11200,
    content: `在去年的巅峰对决中，“天枢星辰”战队凭借自主研发的轻量化WAF流量清洗脚本与二进制热补丁分发框架，在最后两小时逆转夺冠。`
  },
  {
    id: 'mnews-12',
    title: '第七届“XX杯”全国初赛线上监考客户端（v2.4.0）公测与反作弊说明',
    tags: ['赛事新闻'],
    coverImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=960&q=80',
    summary: '初赛期间所有参赛队员须开启双机位视频监控与主机进程完整性校验客户端，定时于4月20日上午9点正式发布下载链接。',
    source: '大赛纪检监察组',
    publishStatus: 'unpublished',
    publishTime: '2026-04-20 09:00',
    isPinned: false,
    viewsCount: 0,
    content: `本公告目前已配置定时发布策略，将于 2026-04-20 09:00 自动上线前台赛事新闻频道。`
  },
  {
    id: 'mnews-13',
    title: '华东分赛区线下晋级赛场馆搭建与网络专线拓扑保障方案（待审稿）',
    tags: ['赛事新闻'],
    coverImage: DEFAULT_NEWS_COVER_SVG,
    summary: '杭州国际博览中心主赛场万兆双冗余光纤接入方案及现场裁判仲裁席位布置初稿，待组委会终审后发布。',
    source: '华东赛区执委会',
    publishStatus: 'unpublished',
    publishTime: '2026-04-14 18:00',
    isPinned: false,
    viewsCount: 0,
    content: `华东分赛区拟定于杭州国际博览中心3B展厅举行，现场设置80个标准战队对战席位。`
  },
  {
    id: 'mnews-14',
    title: '关于2026年3月平台春季硬件防火墙割接升级暂停访问的临时通知',
    tags: ['赛事新闻'],
    coverImage: DEFAULT_NEWS_COVER_SVG,
    summary: '3月25日凌晨平台网络割接已顺利完成，本条临时维护通知已做下线归档处理。',
    source: '平台运维中心',
    publishStatus: 'unpublished',
    publishTime: '2026-03-24 20:00',
    isPinned: false,
    viewsCount: 3120,
    content: `平台春季网络割接已按计划完成，该临时通知已在后台下线，前台不再展示。`
  }
];

// ============================================================================
// 三、赛事动态（后台【内容管理 -> 赛事动态】与前台【赛事动态】共用数据）
// ============================================================================

export type MomentCategory = '进展报道' | '专家观点' | '团队风采' | '赛事花絮';
export type MomentMediaType = 'article' | 'video';

export interface ManagedMomentItem {
  id: string;
  title: string; // 标题/名称（必填）
  category: MomentCategory; // 分类（单选：进展报道 / 专家观点 / 团队风采 / 赛事花絮）
  mediaType: MomentMediaType; // 媒体类型（单选：图文 / 视频）
  coverImage: string; // 封面图（视频必填封面，图文选填但推荐）
  summary: string; // 简介说明
  source: string; // 来源
  content: string; // 图文详情正文 或 视频详情说明
  images?: string[]; // 多图展示
  videoUrl?: string; // 视频文件地址或外链地址
  videoDuration?: string; // 视频时长（如 04:28）
  videoHighlights?: string[]; // 视频看点时间轴
  publishStatus: ContentPublishStatus;
  publishTime: string;
  isPinned: boolean;
  pinExpireTime?: string;
  viewsCount: number;
}

export const INITIAL_MANAGED_MOMENTS: ManagedMomentItem[] = [
  {
    id: 'mmom-1',
    title: '【进展报道】全国八大赛区报名战队突破1200支，京津冀与长三角赛区热度领跑',
    category: '进展报道',
    mediaType: 'article',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    summary: '截至4月14日12时，平台累计完成实名与学籍双认证高校学子超8500人，AI大模型安全与云原生防御赛道报名尤为火爆。',
    source: '大赛数据运营中心',
    publishStatus: 'published',
    publishTime: '2026-04-14 14:30',
    isPinned: true,
    pinExpireTime: '2026-05-30 23:59',
    viewsCount: 9420,
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
    ],
    content: `自第七届“XX杯”全国网数智安全大赛报名通道开启以来，全国各大高校学子参赛热情高涨。据大赛数据运营中心实时统计，目前已有来自160余所高校的1200余支战队在平台开启组队流程。

其中，北京邮电大学、清华大学、西安电子科技大学、浙江大学、哈尔滨工业大学等高校已审核通过队伍数量位居前列，展现出深厚的网安人才培养底蕴。`
  },
  {
    id: 'mmom-2',
    title: '【专家访谈视频】中国工程院院士解读：生成式AI时代的“以模治模”主动免疫新范式',
    category: '专家观点',
    mediaType: 'video',
    coverImage: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoDuration: '06:18',
    summary: '院士在专访视频中深入剖析了大模型内生安全缺陷机理，并寄语青年学子在本次专项赛中大胆探索自动化红队探针与形式化护栏技术。',
    source: '大赛专家委员会',
    publishStatus: 'published',
    publishTime: '2026-04-13 18:00',
    isPinned: true,
    pinExpireTime: '2026-06-15 23:59',
    viewsCount: 15300,
    content: `在本期【专家观点】独家视频访谈中，大赛专家委员会主任委员系统阐述了人工智能大模型从“外挂式防火墙”向“内生主动免疫架构”演进的技术路线，并对本届大赛大模型安全赛道的命题设计给予高度评价。`
  },
  {
    id: 'mmom-3',
    title: '【团队风采】北邮“天枢星辰”战队：从实验室深夜推演到全国总冠军的传承之路',
    category: '团队风采',
    mediaType: 'article',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    summary: '走进北京邮电大学网络安全创新实验室，看这支平均年龄仅20岁的金牌战队如何开展新老队员传帮带与每日高强度靶场对抗训练。',
    source: '大赛校园记者团',
    publishStatus: 'published',
    publishTime: '2026-04-12 16:10',
    isPinned: false,
    viewsCount: 7850,
    images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80'
    ],
    content: `在北邮科研楼五层的网安创新实验室里，白板上写满了复杂的二进制ROP链构造草图与K8s容器逃逸攻击路径。“天枢星辰”战队队长张伟表示，今年团队全员回归，将向第七届大赛总冠军发起卫冕冲击。`
  },
  {
    id: 'mmom-4',
    title: '【花絮视频】48小时不眠之夜！沉浸式回顾上届“XX杯”线下AWD总决赛巅峰时刻',
    category: '赛事花絮',
    mediaType: 'video',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    videoDuration: '04:52',
    summary: '炫酷的实时3D态势感知激光大屏、争分夺秒敲击键盘的选手特写、首血（First Blood）诞生时的全场欢呼，带您重返热血赛场。',
    source: '大赛视觉制作中心',
    publishStatus: 'published',
    publishTime: '2026-04-11 20:00',
    isPinned: false,
    viewsCount: 12490,
    content: `本支花絮短片浓缩了总决赛现场48小时的高燃瞬间，记录了全国顶尖高校网安战队在极限压力下的默契配合与永不言弃的极客精神。`
  },
  {
    id: 'mmom-5',
    title: '【进展报道】国家级云原生靶场完成首轮万人级并发压力测试，容器秒级调度成功率99.98%',
    category: '进展报道',
    mediaType: 'article',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    summary: '技术保障团队连续奋战72小时，完成五大区域算力节点的故障自动漂移演练与DDoS仿真流量清洗压力测试。',
    source: '大赛靶场技术保障组',
    publishStatus: 'published',
    publishTime: '2026-04-10 11:40',
    isPinned: false,
    viewsCount: 5620,
    content: `为确保初赛期间全国上万名选手同时在线流畅夺旗，靶场技术保障组采用基于 Cilium eBPF 的高性能网络隔离架构，实现了单战队独立靶机环境 1.8 秒极速重置。`
  },
  {
    id: 'mmom-6',
    title: '【专家观点】清华大学网研院教授：为什么云原生供应链安全与eBPF是今年夺分关键？',
    category: '专家观点',
    mediaType: 'article',
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    summary: '深入解析云原生环境下内核态无侵入监控、容器镜像签名验证以及微服务东西向零信任微隔离的实战得分要点。',
    source: '清华大学网络科学与网络空间研究院',
    publishStatus: 'published',
    publishTime: '2026-04-09 15:00',
    isPinned: false,
    viewsCount: 8340,
    content: `在传统边界防御逐渐失效的云原生时代，谁能熟练运用 eBPF 在内核层捕获异常系统调用并实时阻断容器逃逸，谁就能在今年的云原生防御挑战赛中占得先机。`
  },
  {
    id: 'mmom-7',
    title: '【团队风采视频】巾帼不让须眉！看西电“木兰星盾”全女子网安战队如何玩转逆向工程',
    category: '团队风采',
    mediaType: 'video',
    coverImage: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoDuration: '03:36',
    summary: '来自西安电子科技大学的四位女生组成的“木兰星盾”战队，在固件逆向与密码学分析赛道屡获佳绩，展现网安赛场上的女性科技力量。',
    source: '大赛校园记者团',
    publishStatus: 'published',
    publishTime: '2026-04-08 17:20',
    isPinned: false,
    viewsCount: 9120,
    content: `从晦涩难懂的ARM汇编指令集到复杂的白盒AES密钥还原，“木兰星盾”战队的姑娘们用细腻的逻辑思维与坚韧的毅力攻克了一个又一个逆向难关。`
  },
  {
    id: 'mmom-8',
    title: '【赛事花絮】全国高校巡回宣讲会走进浙江大学与上海交通大学，现场互动座无虚席',
    category: '赛事花絮',
    mediaType: 'article',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    summary: '命题组专家面对面为华东学子答疑解惑，现场更有极客快闪解谜挑战与定制赛事周边派送，点燃高校网安备赛热潮。',
    source: '大赛宣讲工作组',
    publishStatus: 'published',
    publishTime: '2026-04-07 19:15',
    isPinned: false,
    viewsCount: 6450,
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80'
    ],
    content: `4月6日至7日，第七届“XX杯”高校巡回技术宣讲会先后在浙江大学紫金港校区与上海交通大学闵行校区举办，累计吸引超900名本硕博同学到场参与。`
  },
  {
    id: 'mmom-9',
    title: '【进展报道】智能网联汽车安全赛道完成实车OBD与毫米波雷达仿真试验台架联调',
    category: '进展报道',
    mediaType: 'video',
    coverImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    videoDuration: '02:58',
    summary: '直击车联网安全实验室联调现场，实拍智能座舱IVI系统渗透测试与自动驾驶感知欺骗防御验证全过程。',
    source: '车联网安全实验室',
    publishStatus: 'published',
    publishTime: '2026-04-06 14:10',
    isPinned: false,
    viewsCount: 7320,
    content: `本届车联网安全赛道全面升级了实车仿真试验台架，支持选手通过远程硬件在环（HIL）接口对车载网关进行真实报文测试。`
  },
  {
    id: 'mmom-10',
    title: '【专家观点】隐私计算与联邦学习如何在不暴露原始政务数据的前提下抵御模型反演攻击？',
    category: '专家观点',
    mediaType: 'article',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    summary: '数据要素赛道命题组长详解梯度泄露攻击（Gradient Leakage）与同态加密（HE）加速算子在政务数据流通场景中的平衡之道。',
    source: '数据安全赛道专家组',
    publishStatus: 'published',
    publishTime: '2026-04-05 10:30',
    isPinned: false,
    viewsCount: 5190,
    content: `随着《数据安全法》与公共数据授权运营机制的深入实施，隐私计算不再仅仅追求理论安全性，更需要在百万级样本规模下兼顾通信开销与抗梯度反演能力。`
  },
  {
    id: 'mmom-11',
    title: '【团队风采】深圳职业技术大学“深蓝利剑”战队：职业本科院校在国家级攻防赛场的突围',
    category: '团队风采',
    mediaType: 'article',
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    summary: '凭借扎实的企业级网络架构排错功底与高频应急响应实战训练，“深蓝利剑”战队在去年的云安全运维赛项中斩获全国一等奖。',
    source: '大赛校园记者团',
    publishStatus: 'published',
    publishTime: '2026-04-04 16:00',
    isPinned: false,
    viewsCount: 4870,
    content: `作为全国首批职业本科大学代表，深圳职业技术大学“深蓝利剑”战队将产教融合实训室搬进备赛日常，展现了高水平技能型人才的强悍实战力。`
  },
  {
    id: 'mmom-12',
    title: '【赛事花絮视频】零距离探秘“XX杯”命题组封闭式出题营：一道高水准赛题是如何诞生的？',
    category: '赛事花絮',
    mediaType: 'video',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4',
    videoDuration: '05:14',
    summary: '揭秘30余位顶尖白帽黑客与高校学者在封闭式出题营中历经三轮交叉盲测、防止非预期解（Unintended Solution）的严苛打磨过程。',
    source: '大赛技术命题组',
    publishStatus: 'published',
    publishTime: '2026-04-02 21:00',
    isPinned: false,
    viewsCount: 10860,
    content: `每一道正式登上“XX杯”赛场的题目，都必须经过命题人自测、交叉盲测红队突破、靶场高并发稳定性验证三道铁闸。`
  },
  {
    id: 'mmom-13',
    title: '西南赛区（成都站）高校领队技术交流沙龙活动纪要与现场图集',
    category: '赛事花絮',
    mediaType: 'article',
    coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
    summary: '电子科技大学与四川大学等20所西南高校网安领队齐聚成都，共议赛教融合新路径（待补充高清合照后发布）。',
    source: '西南赛区执委会',
    publishStatus: 'unpublished',
    publishTime: '2026-04-14 19:00',
    isPinned: false,
    viewsCount: 0,
    content: `西南赛区高校领队沙龙活动纪要，待上传高清现场图片后正式发布。`
  },
  {
    id: 'mmom-14',
    title: '专家圆桌直播预告：后量子密码迁移路线图与零知识证明工程实战',
    category: '专家观点',
    mediaType: 'video',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    videoDuration: '08:10',
    summary: '定于4月18日晚19:30自动上线，四位密码学博导同台论道后量子密码标准演进。',
    source: '密码专项赛专家组',
    publishStatus: 'unpublished',
    publishTime: '2026-04-18 19:30',
    isPinned: false,
    viewsCount: 0,
    content: `本视频动态将于 2026-04-18 19:30 准时向全网公开。`
  }
];

// ============================================================================
// 四、后台【院校管理】组件（列表页 + 查看详情页 + 编辑/更名同步弹窗 + 批量导入弹窗）
// ============================================================================

interface AdminInstitutionManagementProps {
  institutions: InstitutionRecord[];
  onChangeInstitutions: React.Dispatch<React.SetStateAction<InstitutionRecord[]>>;
  platformUsers?: PlatformDirectoryUser[];
  onUpdatePlatformUsers?: React.Dispatch<React.SetStateAction<PlatformDirectoryUser[]>>;
  captainTeams?: CaptainTeamRecord[];
  onUpdateCaptainTeams?: (next: CaptainTeamRecord[]) => void;
}

export const AdminInstitutionManagement: React.FC<AdminInstitutionManagementProps> = ({
  institutions,
  onChangeInstitutions,
  platformUsers = [],
  onUpdatePlatformUsers,
  captainTeams = [],
  onUpdateCaptainTeams,
}) => {
  // 筛选条件
  const [searchName, setSearchName] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [filterLevel, setFilterLevel] = useState<'ALL' | '本科' | '专科'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'enabled' | 'disabled'>('ALL');

  // 多选与分页
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 页面模式：列表 or 详情页（查看模式）
  const [viewingInstitutionId, setViewingInstitutionId] = useState<string | null>(null);

  // 分配高校管理员弹窗状态
  const [assignAdminInstId, setAssignAdminInstId] = useState<string | null>(null);
  const [adminUserSearchKeyword, setAdminUserSearchKeyword] = useState('');
  const [selectedCandidateUserId, setSelectedCandidateUserId] = useState<string | null>(null);

  // 编辑弹窗 & 教育部标准更名同步状态
  const [editingInstitution, setEditingInstitution] = useState<InstitutionRecord | null>(null);
  const [isSyncRenameMode, setIsSyncRenameMode] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    department: string;
    location: string;
    level: '本科' | '专科';
    type: InstitutionRecord['type'];
    remark: string;
    platformStatus: 'enabled' | 'disabled';
    supportAutoVerify: boolean;
  } | null>(null);

  // 批量导入/更新弹窗状态
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'report'>('upload');
  const [importFileName, setImportFileName] = useState('教育部2026全国普通高等学校标准名单(最新修订版).xlsx');
  const [importReport, setImportReport] = useState<{
    addedCount: number;
    updatedCount: number;
    failedCount: number;
    details: { code: string; name: string; status: 'added' | 'updated' | 'failed'; message: string }[];
  } | null>(null);

  // 提示消息
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 提取所有所在地选项
  const locationOptions = useMemo(() => {
    const locs = Array.from(new Set(institutions.map((i) => i.location)));
    return locs;
  }, [institutions]);

  // 过滤列表
  const filteredInstitutions = useMemo(() => {
    return institutions.filter((item) => {
      if (searchName.trim() && !item.name.toLowerCase().includes(searchName.trim().toLowerCase())) {
        return false;
      }
      if (searchCode.trim() && item.code !== searchCode.trim() && !item.code.includes(searchCode.trim())) {
        return false;
      }
      if (filterLocation !== 'ALL' && !item.location.includes(filterLocation)) {
        return false;
      }
      if (filterLevel !== 'ALL' && item.level !== filterLevel) {
        return false;
      }
      if (filterStatus !== 'ALL' && item.platformStatus !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [institutions, searchName, searchCode, filterLocation, filterLevel, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredInstitutions.length / pageSize));
  const paginatedInstitutions = filteredInstitutions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const viewingInstitution = useMemo(
    () => institutions.find((i) => i.id === viewingInstitutionId) || null,
    [institutions, viewingInstitutionId]
  );

  // 单行启用/停用切换
  const handleToggleSingleStatus = (inst: InstitutionRecord) => {
    const nextStatus: 'enabled' | 'disabled' = inst.platformStatus === 'enabled' ? 'disabled' : 'enabled';
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    onChangeInstitutions((prev) =>
      prev.map((item) =>
        item.id === inst.id
          ? {
              ...item,
              platformStatus: nextStatus,
              auditLogs: [
                {
                  id: `log-${Date.now()}`,
                  time: nowStr,
                  operator: '系统管理员 (admin)',
                  action: nextStatus === 'enabled' ? '启用院校' : '停用院校',
                  detail:
                    nextStatus === 'enabled'
                      ? `恢复启用【${inst.name}】，前台学籍/教师认证学校下拉框即时开放选择`
                      : `停用【${inst.name}】，前台认证下拉框不再显示该校，保留历史 ${inst.verifiedStudentsCount} 名学生及 ${inst.verifiedTeachersCount} 名教师认证数据`
                },
                ...item.auditLogs
              ]
            }
          : item
      )
    );
    triggerToast(
      nextStatus === 'enabled'
        ? `已启用「${inst.name}」，前台学籍/教师认证下拉框已同步开放该院校`
        : `已停用「${inst.name}」，前台认证下拉框已隐藏该校（历史已认证数据保留不受影响）`
    );
  };

  // 批量停用/启用
  const handleBatchStatus = (targetStatus: 'enabled' | 'disabled') => {
    if (selectedIds.length === 0) return;
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    onChangeInstitutions((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id)
          ? {
              ...item,
              platformStatus: targetStatus,
              auditLogs: [
                {
                  id: `log-${Date.now()}-${item.id}`,
                  time: nowStr,
                  operator: '系统管理员 (admin)',
                  action: targetStatus === 'enabled' ? '启用院校' : '停用院校',
                  detail: `通过批量操作将平台状态置为【${targetStatus === 'enabled' ? '启用' : '停用'}】`
                },
                ...item.auditLogs
              ]
            }
          : item
      )
    );
    triggerToast(
      `已批量${targetStatus === 'enabled' ? '启用' : '停用'} ${selectedIds.length} 所高校，前台学籍认证列表已实时同步`
    );
    setSelectedIds([]);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (inst: InstitutionRecord) => {
    setEditingInstitution(inst);
    setIsSyncRenameMode(false);
    setEditForm({
      name: inst.name,
      department: inst.department,
      location: inst.location,
      level: inst.level,
      type: inst.type,
      remark: inst.remark,
      platformStatus: inst.platformStatus,
      supportAutoVerify: inst.supportAutoVerify
    });
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingInstitution || !editForm) return;
    if (!editForm.name.trim()) {
      triggerToast('学校官方全称不能为空');
      return;
    }
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const oldName = editingInstitution.name;
    const newName = editForm.name.trim();
    const renamed = newName !== oldName;

    onChangeInstitutions((prev) =>
      prev.map((item) => {
        if (item.id !== editingInstitution.id) return item;
        const newLogs: InstitutionAuditLog[] = [...item.auditLogs];
        if (renamed) {
          newLogs.unshift({
            id: `log-rename-${Date.now()}`,
            time: nowStr,
            operator: '系统管理员 (admin)',
            action: '教育部标准更名同步',
            detail: `依据学校标识码 ${item.code} 执行官方更名同步：原校名“${item.name}”更新为“${newName}”，并级联更新平台关联用户及报名战队校名`,
          });
        } else {
          newLogs.unshift({
            id: `log-edit-${Date.now()}`,
            time: nowStr,
            operator: '系统管理员 (admin)',
            action: '修改核验配置',
            detail: `更新平台状态为【${editForm.platformStatus === 'enabled' ? '启用' : '停用'}】，自动学籍核验：【${editForm.supportAutoVerify ? '是' : '否'}】，办学类型：【${editForm.type || '未设置'}】`,
          });
        }
        return {
          ...item,
          name: newName,
          department: editForm.department.trim(),
          location: editForm.location.trim(),
          level: editForm.level,
          type: editForm.type,
          remark: editForm.remark.trim(),
          platformStatus: editForm.platformStatus,
          supportAutoVerify: editForm.supportAutoVerify,
          auditLogs: newLogs,
        };
      })
    );

    // 若发生教育部更名，自动级联同步全平台用户库与报名队伍中的所属院校名称
    if (renamed) {
      if (onUpdatePlatformUsers) {
        onUpdatePlatformUsers((prev) =>
          prev.map((u) =>
            u.managedInstitutionId === editingInstitution.id || u.university === oldName
              ? { ...u, university: newName }
              : u
          )
        );
      }
      if (onUpdateCaptainTeams && captainTeams.length > 0) {
        onUpdateCaptainTeams(
          captainTeams.map((t) => ({
            ...t,
            university: t.university === oldName ? newName : t.university,
            captainUniversity:
              t.captainUniversity === oldName ? newName : t.captainUniversity,
            members: t.members.map((m) =>
              m.university === oldName ? { ...m, university: newName } : m
            ),
            advisors: t.advisors.map((a) =>
              a.university === oldName ? { ...a, university: newName } : a
            ),
          }))
        );
      }
    }

    triggerToast(
      renamed
        ? `已完成教育部更名同步：「${oldName}」→「${newName}」，关联用户与报名队伍校名已同步更新`
        : `已保存「${newName}」（标识码：${editingInstitution.code}）的院校配置`
    );
    setEditingInstitution(null);
    setEditForm(null);
  };

  // 执行模拟教育部标准名单批量导入/更新（按10位学校标识码匹配）
  const handleExecuteImport = () => {
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const incomingBatch = [
      {
        code: '4132010284',
        name: '南京大学',
        department: '教育部',
        location: '江苏省南京市',
        level: '本科' as const,
        type: '普通本科' as const,
        remark: '双一流 / 985 / 211 / 新增导入'
      },
      {
        code: '4144010558',
        name: '中山大学',
        department: '教育部',
        location: '广东省广州市',
        level: '本科' as const,
        type: '普通本科' as const,
        remark: '双一流 / 985 / 211 / 新增导入'
      },
      {
        code: '4111010006',
        name: '北京航空航天大学',
        department: '工业和信息化部',
        location: '北京市',
        level: '本科' as const,
        type: '普通本科' as const,
        remark: '工信部直属 / 双一流 / 2026教育部名录核验更新'
      },
      {
        code: '4144012957',
        name: '深圳职业技术大学',
        department: '广东省',
        location: '广东省深圳市',
        level: '本科' as const,
        type: '职业本科' as const,
        remark: '教育部标准名录同步确认（职业本科）'
      },
      {
        code: '41110999', // 故意8位错误编码，验证10位唯一码拦截
        name: '测试异常编码学院',
        department: '某省教育厅',
        location: '某省某市',
        level: '专科' as const,
        type: '高职专科' as const,
        remark: '标识码非10位标准编码'
      }
    ];

    let addedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const reportDetails: { code: string; name: string; status: 'added' | 'updated' | 'failed'; message: string }[] = [];

    const nextList = [...institutions];

    incomingBatch.forEach((row) => {
      if (!/^\d{10}$/.test(row.code)) {
        failedCount += 1;
        reportDetails.push({
          code: row.code,
          name: row.name,
          status: 'failed',
          message: '校验失败：学校标识码必须为10位教育部标准数字编码'
        });
        return;
      }

      const existingIdx = nextList.findIndex((item) => item.code === row.code);
      if (existingIdx >= 0) {
        updatedCount += 1;
        const oldItem = nextList[existingIdx];
        nextList[existingIdx] = {
          ...oldItem,
          name: row.name,
          department: row.department,
          location: row.location,
          level: row.level,
          type: row.type,
          remark: row.remark,
          auditLogs: [
            {
              id: `log-imp-${Date.now()}-${row.code}`,
              time: nowStr,
              operator: '系统管理员 (admin)',
              action: '批量导入更新',
              detail: `通过《${importFileName}》按标识码 ${row.code} 匹配更新字段`
            },
            ...oldItem.auditLogs
          ]
        };
        reportDetails.push({
          code: row.code,
          name: row.name,
          status: 'updated',
          message: `按10位标识码匹配成功，已同步更新主管部门、办学类型及备注`
        });
      } else {
        addedCount += 1;
        nextList.unshift({
          id: `inst-${Date.now()}-${row.code}`,
          code: row.code,
          name: row.name,
          department: row.department,
          location: row.location,
          level: row.level,
          type: row.type,
          remark: row.remark,
          platformStatus: 'enabled',
          supportAutoVerify: true,
          verifiedStudentsCount: 0,
          verifiedTeachersCount: 0,
          associatedTeamsCount: 0,
          passRate: 100,
          eventBreakdown: [],
          auditLogs: [
            {
              id: `log-new-${Date.now()}-${row.code}`,
              time: nowStr,
              operator: '系统管理员 (admin)',
              action: '批量导入更新',
              detail: `通过教育部标准名单批量导入新增院校（标识码：${row.code}）`
            }
          ]
        });
        reportDetails.push({
          code: row.code,
          name: row.name,
          status: 'added',
          message: '教育部10位唯一标识码校验通过，已作为新院校入库并默认启用'
        });
      }
    });

    onChangeInstitutions(nextList);
    setImportReport({
      addedCount,
      updatedCount,
      failedCount,
      details: reportDetails
    });
    setImportStep('report');
  };

  // ============================================================================
  // 若当前处于【院校详情页（查看模式）】
  // ============================================================================
  if (viewingInstitution) {
    return (
      <div className="space-y-6">
        {/* 顶部返回与标题栏 */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewingInstitutionId(null)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              返回院校列表
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900">{viewingInstitution.name}</h2>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-sky-50 text-[#0284C7] border border-sky-200 font-bold">
                  标识码：{viewingInstitution.code}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                    viewingInstitution.platformStatus === 'enabled'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}
                >
                  {viewingInstitution.platformStatus === 'enabled' ? '平台状态：启用中' : '平台状态：已停用'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                院校详情只读视图 · 展示教育部标准基础信息、认证统计、赛事报名关联及合规操作审计日志
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenEdit(viewingInstitution)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Edit3 className="w-4 h-4" />
              编辑配置 / 同步更名
            </button>
          </div>
        </div>

        {/* 1. 基础信息区（教育部标准字段 + 平台自定义字段，只读展示） */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0284C7]" />
              <h3 className="text-base font-bold text-slate-900">一、院校基础信息区（教育部标准名录字段）</h3>
            </div>
            <span className="text-xs text-slate-400">数据来源：教育部全国普通高等学校名单标准库</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 mb-1">学校标识码（10位唯一识别码）</div>
              <div className="text-sm font-mono font-bold text-slate-900 tabular-nums">{viewingInstitution.code}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 mb-1">学校官方全称</div>
              <div className="text-sm font-bold text-slate-900">{viewingInstitution.name}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 mb-1">主管部门</div>
              <div className="text-sm font-semibold text-slate-800">{viewingInstitution.department}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 mb-1">所在地（省份＋城市）</div>
              <div className="text-sm font-semibold text-slate-800">{viewingInstitution.location}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 mb-1">办学层次（教育部标准）</div>
              <div className="text-sm font-semibold text-slate-800">{viewingInstitution.level}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 mb-1">办学类型（扩展分类）</div>
              <div className="text-sm font-bold text-[#0284C7]">{viewingInstitution.type || '普通高校'}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 mb-1">是否支持学籍自动核验</div>
              <div className="text-sm font-semibold">
                {viewingInstitution.supportAutoVerify ? (
                  <span className="text-emerald-700 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 是（支持自动核验通道）
                  </span>
                ) : (
                  <span className="text-amber-700 inline-flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> 否（走人工凭证核验）
                  </span>
                )}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="text-xs text-slate-500 mb-1">备注说明</div>
              <div className="text-sm font-medium text-slate-700">{viewingInstitution.remark || '—'}</div>
            </div>
          </div>
        </div>

        {/* 2. 认证统计区 & 3. 报名关联区 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：核心统计指标卡 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">二、认证统计概览</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <div className="text-xs text-slate-500">平台已验证学生数</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                    {viewingInstitution.verifiedStudentsCount} <span className="text-xs font-normal text-slate-500">人</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <div className="text-xs text-slate-500">平台已验证教师数</div>
                  <div className="text-2xl font-extrabold text-[#0284C7] mt-1 tabular-nums">
                    {viewingInstitution.verifiedTeachersCount} <span className="text-xs font-normal text-slate-500">人</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <div className="text-xs text-slate-500">学籍/教师认证通过率</div>
                  <div className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">
                    {viewingInstitution.passRate}%
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <div className="text-xs text-slate-500">关联报名队伍总数</div>
                  <div className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">
                    {viewingInstitution.associatedTeamsCount} <span className="text-xs font-normal text-slate-500">支</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
              说明：以上统计数据由系统根据前台【用户认证】及【赛事报名】实时汇总，不可手工篡改。若停用该校，已认证的学生和老师数据保持不变。
            </div>
          </div>

          {/* 右侧：按赛事维度的认证与报名关联明细表 */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">三、各赛事认证参与人数与报名队伍关联区</h3>
              </div>
              <span className="text-xs text-slate-400">按关联赛事实时聚合</span>
            </div>

            {viewingInstitution.eventBreakdown.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">该院校暂无关联的赛事报名数据</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
                      <th className="py-3 px-3">关联赛事名称</th>
                      <th className="py-3 px-3 text-right">参赛认证学生</th>
                      <th className="py-3 px-3 text-right">指导认证教师</th>
                      <th className="py-3 px-3 text-right">已报名队伍数</th>
                      <th className="py-3 px-3 text-right">审核通过队伍数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {viewingInstitution.eventBreakdown.map((ev) => (
                      <tr key={ev.eventId} className="hover:bg-sky-50/40">
                        <td className="py-3 px-3 font-bold text-slate-800">{ev.eventName}</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700 tabular-nums">
                          {ev.verifiedStudentParticipants} 人
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#0284C7] tabular-nums">
                          {ev.verifiedTeacherAdvisors} 人
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-amber-600 tabular-nums">
                          {ev.registeredTeamsCount} 支
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-600 tabular-nums">
                          {ev.approvedTeamsCount} 支
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 4. 操作日志区（指标20合规审计支撑） */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#0284C7]" />
              <h3 className="text-base font-bold text-slate-900">四、院校信息变更与状态操作审计日志</h3>
            </div>
            <span className="text-xs text-slate-400">操作审计日志与可追溯性记录</span>
          </div>

          <div className="space-y-3">
            {viewingInstitution.auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-md font-bold bg-sky-100 text-[#0369A1] border border-sky-200 shrink-0">
                    {log.action}
                  </span>
                  <span className="text-slate-700 font-medium">{log.detail}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 shrink-0 font-mono">
                  <span>操作人：{log.operator}</span>
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 院校管理【列表页视图】—— 统一浅色工作台风格
  // ============================================================================
  return (
    <div className="space-y-5">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-bold border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 筛选与操作栏 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">学校名称（模糊搜索）</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="如：北京大学 / 职业技术"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">学校标识码（10位精确/前缀）</label>
            <input
              type="text"
              value={searchCode}
              onChange={(e) => {
                setSearchCode(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="如：4111010001"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">所在地（省市筛选）</label>
            <select
              value={filterLocation}
              onChange={(e) => {
                setFilterLocation(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-[#0284C7] cursor-pointer"
            >
              <option value="ALL">全部省市所在地</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">办学层次</label>
            <select
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value as 'ALL' | '本科' | '专科');
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-[#0284C7] cursor-pointer"
            >
              <option value="ALL">全部层次（本科 / 专科）</option>
              <option value="本科">本科（含普通本科/职业本科）</option>
              <option value="专科">专科（高职专科）</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">平台状态</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as 'ALL' | 'enabled' | 'disabled');
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-[#0284C7] cursor-pointer"
            >
              <option value="ALL">全部状态</option>
              <option value="enabled">启用（前台认证可选）</option>
              <option value="disabled">停用（前台认证隐藏）</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              disabled={selectedIds.length === 0}
              onClick={() => handleBatchStatus('enabled')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              批量启用 ({selectedIds.length})
            </button>
            <button
              disabled={selectedIds.length === 0}
              onClick={() => handleBatchStatus('disabled')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-600 border border-red-200 text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              批量停用 ({selectedIds.length})
            </button>
          </div>

          <button
            onClick={() => {
              setImportStep('upload');
              setImportReport(null);
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4" />
            批量导入 / 更新教育部名单
          </button>
        </div>
      </div>

      {/* 列表表格 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedInstitutions.length > 0 &&
                      paginatedInstitutions.every((item) => selectedIds.includes(item.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const pageIds = paginatedInstitutions.map((i) => i.id);
                        setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
                      } else {
                        const pageIds = new Set(paginatedInstitutions.map((i) => i.id));
                        setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
                      }
                    }}
                    className="rounded border-slate-300 text-[#0284C7] accent-[#0284C7] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">学校标识码</th>
                <th className="py-3.5 px-3">学校名称</th>
                <th className="py-3.5 px-3 whitespace-nowrap">主管部门</th>
                <th className="py-3.5 px-3 whitespace-nowrap">所在地</th>
                <th className="py-3.5 px-3 whitespace-nowrap">办学层次 / 类型</th>
                <th className="py-3.5 px-3 text-right whitespace-nowrap">已验证学生数</th>
                <th className="py-3.5 px-3 text-right whitespace-nowrap">已验证教师数</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">高校管理员</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">平台状态</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedInstitutions.map((inst) => {
                const assignedAdminsCount = platformUsers.filter(
                  (u) =>
                    !u.isDeleted &&
                    (u.tags?.includes('高校管理员') || u.extendedRoles?.includes('高校管理员')) &&
                    u.managedInstitutionId === inst.id
                ).length;

                return (
                  <tr key={inst.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inst.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, inst.id]);
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== inst.id));
                          }
                        }}
                        className="rounded border-slate-300 text-[#0284C7] accent-[#0284C7] cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#0284C7] tabular-nums">{inst.code}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{inst.name}</div>
                      {inst.remark && <div className="text-[11px] text-slate-400 mt-0.5">{inst.remark}</div>}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">{inst.department}</td>
                    <td className="py-3.5 px-3 text-slate-700">{inst.location}</td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {inst.level}
                      </span>
                      {inst.type && <span className="ml-1.5 text-xs text-slate-500">{inst.type}</span>}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                      {inst.verifiedStudentsCount}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#0284C7] tabular-nums">
                      {inst.verifiedTeachersCount}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setAssignAdminInstId(inst.id);
                          setAdminUserSearchKeyword('');
                          setSelectedCandidateUserId(null);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border cursor-pointer transition-colors ${
                          assignedAdminsCount > 0
                            ? 'bg-sky-50 text-[#0284C7] border-sky-200 hover:bg-sky-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <Users className="w-3 h-3" />
                        <span>{assignedAdminsCount} 人</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          inst.platformStatus === 'enabled'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            inst.platformStatus === 'enabled' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        {inst.platformStatus === 'enabled' ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setAssignAdminInstId(inst.id);
                            setAdminUserSearchKeyword('');
                            setSelectedCandidateUserId(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284C7] text-xs font-bold transition-colors cursor-pointer"
                        >
                          分配管理员
                        </button>
                        <button
                          onClick={() => setViewingInstitutionId(inst.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          查看
                        </button>
                        <button
                          onClick={() => handleOpenEdit(inst)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0284C7] text-xs font-bold transition-colors cursor-pointer"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleToggleSingleStatus(inst)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            inst.platformStatus === 'enabled'
                              ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {inst.platformStatus === 'enabled' ? '停用' : '启用'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 分页栏 */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            共检索到 <span className="text-slate-900 font-bold tabular-nums">{filteredInstitutions.length}</span> 所高校 ·
            当前启用{' '}
            <span className="text-emerald-600 font-bold tabular-nums">
              {institutions.filter((i) => i.platformStatus === 'enabled').length}
            </span>{' '}
            所，停用{' '}
            <span className="text-red-600 font-bold tabular-nums">
              {institutions.filter((i) => i.platformStatus === 'disabled').length}
            </span>{' '}
            所
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-semibold cursor-pointer disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="text-slate-700 font-mono font-bold">
              第 {currentPage} / {totalPages} 页
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-semibold cursor-pointer disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* 编辑院校弹窗（学校标识码只读，学校名称默认只读，支持“同步更新”官方更名） */}
      {editingInstitution && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">编辑院校信息与平台配置</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  教育部标准字段（学校标识码、学校名称）默认受保护不可随意修改；如遇官方更名可开启【同步更新】
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingInstitution(null);
                  setEditForm(null);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">学校标识码（10位教育部唯一编码 · 只读）</label>
                  <input
                    type="text"
                    value={editingInstitution.code}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-600">学校官方全称</label>
                    <button
                      type="button"
                      onClick={() => setIsSyncRenameMode((v) => !v)}
                      className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {isSyncRenameMode ? '锁定名称' : '教育部更名同步更新'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editForm.name}
                    disabled={!isSyncRenameMode}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold ${
                      isSyncRenameMode
                        ? 'bg-white border-2 border-[#0284C7] text-slate-900'
                        : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">主管部门</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">所在地（省份＋城市）</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">办学层次（教育部标准）</label>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value as '本科' | '专科' })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none cursor-pointer"
                  >
                    <option value="本科">本科</option>
                    <option value="专科">专科</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">办学类型（扩展分类）</label>
                  <select
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm({ ...editForm, type: e.target.value as InstitutionRecord['type'] })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none cursor-pointer"
                  >
                    <option value="普通本科">普通本科</option>
                    <option value="职业本科">职业本科</option>
                    <option value="高职专科">高职专科</option>
                    <option value="成人高校">成人高校</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">备注（如“民办”“中外合作办学”等标记）</label>
                <input
                  type="text"
                  value={editForm.remark}
                  onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })}
                  placeholder="选填，如：民办 / 中外合作办学 / 双一流"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    平台状态（控制前台学籍认证下拉框可见性）
                  </label>
                  <select
                    value={editForm.platformStatus}
                    onChange={(e) =>
                      setEditForm({ ...editForm, platformStatus: e.target.value as 'enabled' | 'disabled' })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none cursor-pointer"
                  >
                    <option value="enabled">启用（前台学籍认证可选）</option>
                    <option value="disabled">停用（前台隐藏，保留历史认证数据）</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">是否支持学籍自动核验</label>
                  <select
                    value={editForm.supportAutoVerify ? 'yes' : 'no'}
                    onChange={(e) => setEditForm({ ...editForm, supportAutoVerify: e.target.value === 'yes' })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none cursor-pointer"
                  >
                    <option value="yes">是（支持自动核验通道）</option>
                    <option value="no">否（仅支持人工审核证件）</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setEditingInstitution(null);
                  setEditForm(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                保存院校配置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量导入/更新教育部名单弹窗 */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">批量导入 / 更新教育部全国普通高等学校名单</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  系统以10位【学校标识码】作为唯一主键进行比对：已存在则更新属性，不存在则新增入库，非10位编码自动拦截报错
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importStep === 'upload' ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-sky-300 bg-sky-50/40 rounded-xl p-6 text-center space-y-3">
                  <Upload className="w-10 h-10 text-[#0284C7] mx-auto" />
                  <div className="text-sm font-bold text-slate-900">
                    已就绪文件：<span className="text-[#0284C7] font-mono">{importFileName}</span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    支持教育部官方发布的标准 Excel (.xlsx) / CSV 格式，包含列：学校标识码(10位)、学校名称、主管部门、所在地、办学层次、办学类型、备注
                  </p>
                  <div className="pt-2">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
                      <span>更换本地 Excel 文件</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setImportFileName(file.name);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
                  <div className="font-bold text-slate-900">本次导入数据包预检（共 5 条示例记录）：</div>
                  <div>• 新增院校：南京大学 (4132010284)、中山大学 (4144010558)</div>
                  <div>• 匹配更新：北京航空航天大学 (4111010006)、深圳职业技术大学 (4144012957)</div>
                  <div>• 异常拦截测试：测试异常编码学院 (41110999，非10位唯一标识码)</div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleExecuteImport}
                    className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    开始校验并执行导入
                  </button>
                </div>
              </div>
            ) : (
              importReport && (
                <div className="space-y-4">
                  {/* 导入结果统计横幅 */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center">
                      <div className="text-xs font-bold text-emerald-700">新增院校</div>
                      <div className="text-2xl font-extrabold text-emerald-600 mt-0.5 tabular-nums">
                        {importReport.addedCount} 所
                      </div>
                    </div>
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-center">
                      <div className="text-xs font-bold text-[#0369A1]">同步更新院校</div>
                      <div className="text-2xl font-extrabold text-[#0284C7] mt-0.5 tabular-nums">
                        {importReport.updatedCount} 所
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-center">
                      <div className="text-xs font-bold text-red-700">校验失败拦截</div>
                      <div className="text-2xl font-extrabold text-red-600 mt-0.5 tabular-nums">
                        {importReport.failedCount} 所
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-60 overflow-y-auto divide-y divide-slate-200/80 text-xs">
                    {importReport.details.map((d, idx) => (
                      <div key={idx} className="py-2.5 px-2 flex items-start justify-between gap-3">
                        <div>
                          <span className="font-mono font-bold text-[#0284C7] mr-2">[{d.code}]</span>
                          <span className="font-bold text-slate-900 mr-2">{d.name}</span>
                          <span className="text-slate-600">{d.message}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded font-bold shrink-0 ${
                            d.status === 'added'
                              ? 'bg-emerald-100 text-emerald-700'
                              : d.status === 'updated'
                              ? 'bg-sky-100 text-[#0369A1]'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {d.status === 'added' ? '新增成功' : d.status === 'updated' ? '已更新' : '导入失败'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      onClick={() => setShowImportModal(false)}
                      className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
                    >
                      完成并关闭报告
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 【分配高校管理员】弹窗：输入手机号/邮箱搜索全平台用户，添加或移除该院校管理员 */}
      {assignAdminInstId &&
        (() => {
          const targetInst = institutions.find((i) => i.id === assignAdminInstId);
          if (!targetInst) return null;

          const assignedAdmins = platformUsers.filter(
            (u) =>
              !u.isDeleted &&
              (u.tags?.includes('高校管理员') || u.extendedRoles?.includes('高校管理员')) &&
              u.managedInstitutionId === targetInst.id
          );

          const kw = adminUserSearchKeyword.trim().toLowerCase();
          const matchedCandidates = platformUsers.filter((u) => {
            if (u.isDeleted || getEffectiveUserStatus(u) === '停用') return false;
            if (!kw) return true;
            return (
              u.phone.toLowerCase().includes(kw) ||
              u.email.toLowerCase().includes(kw) ||
              u.name.toLowerCase().includes(kw) ||
              (u.username || '').toLowerCase().includes(kw) ||
              (u.realName || '').toLowerCase().includes(kw)
            );
          });

          const selectedCandidate = platformUsers.find(
            (u) =>
              !u.isDeleted &&
              getEffectiveUserStatus(u) === '正常' &&
              u.id === selectedCandidateUserId
          );

          const handleAssignUserAsCollegeAdmin = () => {
            if (!selectedCandidate || !onUpdatePlatformUsers) return;
            const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
            onUpdatePlatformUsers((prev) =>
              prev.map((u) => {
                if (u.id !== selectedCandidate.id) return u;
                const nextTags = Array.from(new Set([...(u.tags || []), '高校管理员']));
                const nextExtRoles = Array.from(
                  new Set([...(u.extendedRoles || []), '高校管理员' as const])
                );
                return {
                  ...u,
                  tags: nextTags,
                  extendedRoles: nextExtRoles,
                  assignedViaInstitutionModule: true,
                  managedInstitutionId: targetInst.id,
                  university: targetInst.name,
                };
              })
            );
            onChangeInstitutions((prev) =>
              prev.map((item) =>
                item.id === targetInst.id
                  ? {
                      ...item,
                      auditLogs: [
                        {
                          id: `log-assign-${Date.now()}`,
                          time: nowStr,
                          operator: '组委会超级管理员',
                          action: '分配高校管理员',
                          detail: `为用户「${selectedCandidate.name} (${selectedCandidate.phone})」增加“高校管理员”标签并绑定院校ID: ${targetInst.id}（${targetInst.name}）`,
                        },
                        ...item.auditLogs,
                      ],
                    }
                  : item
              )
            );
            triggerToast(
              `已将「${selectedCandidate.name}」添加为【${targetInst.name}】高校管理员，系统已自动增加“高校管理员”标签并绑定院校ID（${targetInst.id}）`
            );
            setSelectedCandidateUserId(null);
          };

          const handleRemoveCollegeAdmin = (userToRemove: PlatformDirectoryUser) => {
            if (!onUpdatePlatformUsers) return;
            // 若该管理员是该校唯一管理员，检查是否有待高校审核的队伍
            if (assignedAdmins.length <= 1) {
              const pendingSchoolTeamsCount = captainTeams.filter(
                (t) =>
                  t.university === targetInst.name &&
                  resolveTeamAuditStages(t).schoolStatus === 'pending'
              ).length;
              if (pendingSchoolTeamsCount > 0) {
                triggerToast(
                  `拦截提示：【${targetInst.name}】当前尚有 ${pendingSchoolTeamsCount} 支待高校审核的报名队伍，请先分配新管理员或完成审核后再移除最后一名管理员！`
                );
                return;
              }
            }

            const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
            onUpdatePlatformUsers((prev) =>
              prev.map((u) => {
                if (u.id !== userToRemove.id) return u;
                const nextTags = (u.tags || []).filter((t) => t !== '高校管理员');
                const nextExtRoles = (u.extendedRoles || []).filter((r) => r !== '高校管理员');
                return {
                  ...u,
                  tags: nextTags,
                  extendedRoles: nextExtRoles,
                  assignedViaInstitutionModule: false,
                  managedInstitutionId: undefined,
                };
              })
            );
            onChangeInstitutions((prev) =>
              prev.map((item) =>
                item.id === targetInst.id
                  ? {
                      ...item,
                      auditLogs: [
                        {
                          id: `log-unassign-${Date.now()}`,
                          time: nowStr,
                          operator: '组委会超级管理员',
                          action: '移除高校管理员',
                          detail: `移除用户「${userToRemove.name} (${userToRemove.phone})」的“高校管理员”标签并解绑院校ID: ${targetInst.id}`,
                        },
                        ...item.auditLogs,
                      ],
                    }
                  : item
              )
            );
            triggerToast(`已移除「${userToRemove.name}」的【${targetInst.name}】高校管理员权限`);
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="text-xs text-[#0284C7] font-mono font-bold">
                      院校ID: {targetInst.id} · 教育部标识码: {targetInst.code}
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                      分配高校管理员 — {targetInst.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssignAdminInstId(null)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 1. 已分配的高校管理员列表（支持移除） */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>已分配的该院校管理员（{assignedAdmins.length} 人）</span>
                    </h4>
                  </div>

                  {assignedAdmins.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                      当前院校暂未分配高校管理员，请在下方输入手机号/邮箱搜索全平台用户并添加。
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50 divide-y divide-slate-200">
                      {assignedAdmins.map((adm) => (
                        <div
                          key={adm.id}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">
                                {adm.name.replace(/（.*?）/g, '')}
                              </span>
                              {(adm.tags || []).map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded bg-sky-100 text-[#0369A1] border border-sky-200 text-[11px] font-bold"
                                >
                                  {t}
                                </span>
                              ))}
                              <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono text-[11px]">
                                绑定院校ID: {adm.managedInstitutionId}
                              </span>
                            </div>
                            <div className="text-slate-500 font-mono">
                              手机：{adm.phone} ｜ 邮箱：{adm.email}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCollegeAdmin(adm)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold shrink-0 cursor-pointer self-start sm:self-auto"
                          >
                            移除管理员
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. 搜索全平台用户并添加为该院校管理员 */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800">
                    搜索全平台正常状态用户（输入姓名、手机号或邮箱检索）：
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={adminUserSearchKeyword}
                      onChange={(e) => setAdminUserSearchKeyword(e.target.value)}
                      placeholder="输入手机号（如 13910010002）或邮箱（如 chensiyuan@buaa.edu.cn）搜索全平台用户..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {matchedCandidates.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        未找到匹配的正常状态平台用户，请核对手机号或邮箱
                      </div>
                    ) : (
                      matchedCandidates.map((u) => {
                        const isAlreadyAssignedHere =
                          (u.tags?.includes('高校管理员') ||
                            u.extendedRoles?.includes('高校管理员')) &&
                          u.managedInstitutionId === targetInst.id;
                        const isSelected = selectedCandidateUserId === u.id;

                        return (
                          <div
                            key={u.id}
                            onClick={() => {
                              if (!isAlreadyAssignedHere) {
                                setSelectedCandidateUserId(u.id);
                              }
                            }}
                            className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                              isAlreadyAssignedHere
                                ? 'opacity-50 cursor-not-allowed bg-slate-50'
                                : isSelected
                                ? 'bg-sky-50 border-l-4 border-l-[#0284C7] cursor-pointer'
                                : 'hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900">
                                  {u.name.replace(/（.*?）/g, '')}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  （原属：{u.university || '未认证院校'}）
                                </span>
                                {(u.tags || []).map((t) => (
                                  <span
                                    key={t}
                                    className="px-1.5 py-0.5 rounded bg-sky-100 text-[#0369A1] text-[10px] font-bold"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                              <div className="text-slate-500 font-mono text-[11px]">
                                手机号：{u.phone || '未绑定'} ｜ 邮箱：{u.email || '未绑定'}
                              </div>
                            </div>

                            <div className="shrink-0">
                              {isAlreadyAssignedHere ? (
                                <span className="text-emerald-600 font-bold">
                                  已是本校管理员
                                </span>
                              ) : isSelected ? (
                                <span className="px-2.5 py-1 rounded bg-[#0284C7] text-white font-bold">
                                  已选中
                                </span>
                              ) : (
                                <span className="text-slate-400 hover:text-[#0284C7] font-semibold">点击选择</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      {selectedCandidate ? (
                        <span>
                          已选中用户：
                          <strong className="text-[#0284C7] ml-1">
                            {selectedCandidate.name.replace(/（.*?）/g, '')}（{selectedCandidate.phone}）
                          </strong>
                        </span>
                      ) : (
                        <span>请先从上方列表中点击选中一名平台用户</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setAssignAdminInstId(null)}
                        className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        关闭
                      </button>
                      <button
                        type="button"
                        disabled={!selectedCandidate}
                        onClick={handleAssignUserAsCollegeAdmin}
                        className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        添加为该院校管理员
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

// ============================================================================
// 五、后台【内容管理 -> 赛事新闻】组件
// ============================================================================

interface AdminNewsManagementProps {
  newsList: ManagedNewsItem[];
  onChangeNewsList: React.Dispatch<React.SetStateAction<ManagedNewsItem[]>>;
}

export const AdminNewsManagement: React.FC<AdminNewsManagementProps> = ({
  newsList,
  onChangeNewsList
}) => {
  // 筛选状态：标题（模糊）、发布状态、发布时间范围（赛事新闻分类已移除）
  const [searchTitle, setSearchTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | ContentPublishStatus>('ALL');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // 新增 / 编辑表单状态
  const [editingItem, setEditingItem] = useState<ManagedNewsItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 删除确认弹窗与定时发布确认弹窗
  const [deletingItem, setDeletingItem] = useState<ManagedNewsItem | null>(null);
  const [publishingItem, setPublishingItem] = useState<ManagedNewsItem | null>(null);

  // 表单字段
  const [formTitle, setFormTitle] = useState('');
  const [formCover, setFormCover] = useState(DEFAULT_NEWS_COVER_SVG);
  const [formSummary, setFormSummary] = useState('');
  const [formSource, setFormSource] = useState('大赛组委会');
  const [formContent, setFormContent] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVideoTitle, setFormVideoTitle] = useState('');
  const [formPublishMode, setFormPublishMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [formScheduleTime, setFormScheduleTime] = useState('2026-04-25T09:00');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formPinExpire, setFormPinExpire] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      if (searchTitle.trim() && !item.title.toLowerCase().includes(searchTitle.trim().toLowerCase())) {
        return false;
      }
      if (filterStatus !== 'ALL' && item.publishStatus !== filterStatus) {
        return false;
      }
      const itemDate = item.publishTime.slice(0, 10);
      if (dateStart && itemDate < dateStart) return false;
      if (dateEnd && itemDate > dateEnd) return false;
      return true;
    });
  }, [newsList, searchTitle, filterStatus, dateStart, dateEnd]);

  const openCreateForm = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCover(DEFAULT_NEWS_COVER_SVG);
    setFormSummary('');
    setFormSource('大赛组委会秘书处');
    setFormContent('');
    setFormVideoUrl('');
    setFormVideoTitle('');
    setFormPublishMode('immediate');
    setFormScheduleTime('2026-04-25T09:00');
    setFormIsPinned(false);
    setFormPinExpire('');
    setIsFormOpen(true);
  };

  const openEditForm = (item: ManagedNewsItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCover(item.coverImage || DEFAULT_NEWS_COVER_SVG);
    setFormSummary(item.summary || '');
    setFormSource(item.source || '大赛组委会');
    setFormContent(item.content || '');
    setFormVideoUrl(item.embeddedVideo?.url || '');
    setFormVideoTitle(item.embeddedVideo?.title || '');
    setFormPublishMode(item.publishStatus === 'unpublished' ? 'scheduled' : 'immediate');
    setFormScheduleTime(item.publishTime.replace(' ', 'T').slice(0, 16));
    setFormIsPinned(item.isPinned);
    setFormPinExpire(item.pinExpireTime ? item.pinExpireTime.replace(' ', 'T').slice(0, 16) : '');
    setIsFormOpen(true);
  };

  const handleSaveNews = (saveAsUnpublished: boolean) => {
    if (!formTitle.trim()) {
      triggerToast('请填写赛事新闻标题（限64字以内）');
      return;
    }
    if (formTitle.trim().length > 64) {
      triggerToast('新闻标题不能超过64个字符');
      return;
    }
    if (!formContent.trim()) {
      triggerToast('请填写新闻正文内容');
      return;
    }

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const finalStatus: ContentPublishStatus =
      saveAsUnpublished || formPublishMode === 'scheduled' ? 'unpublished' : 'published';
    const finalPublishTime =
      formPublishMode === 'scheduled' ? formScheduleTime.replace('T', ' ') : editingItem?.publishTime || nowStr;

    const newRecord: ManagedNewsItem = {
      id: editingItem ? editingItem.id : `mnews-${Date.now()}`,
      title: formTitle.trim(),
      tags: ['赛事新闻'],
      coverImage: formCover.trim() || DEFAULT_NEWS_COVER_SVG,
      summary: formSummary.trim() || formContent.trim().slice(0, 80) + '...',
      source: formSource.trim() || '大赛组委会',
      content: formContent,
      embeddedImages: editingItem?.embeddedImages,
      embeddedVideo: formVideoUrl.trim()
        ? {
            url: formVideoUrl.trim(),
            poster:
              formCover.trim() ||
              'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=960&q=80',
            title: formVideoTitle.trim() || formTitle.trim(),
            duration: '03:30'
          }
        : undefined,
      publishStatus: finalStatus,
      publishTime: finalPublishTime,
      isPinned: formIsPinned,
      pinExpireTime: formIsPinned && formPinExpire ? formPinExpire.replace('T', ' ') : undefined,
      viewsCount: editingItem ? editingItem.viewsCount : 1
    };

    if (editingItem) {
      onChangeNewsList((prev) => prev.map((n) => (n.id === editingItem.id ? newRecord : n)));
      triggerToast(`已更新赛事新闻《${newRecord.title}》`);
    } else {
      onChangeNewsList((prev) => [newRecord, ...prev]);
      triggerToast(finalStatus === 'unpublished' ? `已保存为未发布《${newRecord.title}》` : `已发布赛事新闻《${newRecord.title}》`);
    }
    setIsFormOpen(false);
  };

  const handleTogglePin = (item: ManagedNewsItem) => {
    onChangeNewsList((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isPinned: !n.isPinned } : n))
    );
    triggerToast(item.isPinned ? `已取消置顶《${item.title}》` : `已置顶《${item.title}》，前台列表将优先展示`);
  };

  const handleTogglePublishOffline = (item: ManagedNewsItem) => {
    if (item.publishStatus === 'unpublished') {
      setPublishingItem(item);
      return;
    }
    const nextStatus: ContentPublishStatus = 'unpublished';
    onChangeNewsList((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, publishStatus: nextStatus } : n))
    );
    triggerToast(`已设为未发布《${item.title}》，前台赛事新闻页不再展示`);
  };

  const confirmPublish = () => {
    if (!publishingItem) return;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    onChangeNewsList((prev) =>
      prev.map((n) => (n.id === publishingItem.id ? { ...n, publishStatus: 'published', publishTime: nowStr } : n))
    );
    triggerToast(`已发布《${publishingItem.title}》`);
    setPublishingItem(null);
  };

  if (isFormOpen) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFormOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              返回新闻列表
            </button>
            <h2 className="text-lg font-extrabold text-slate-900">
              {editingItem ? '编辑赛事新闻' : '新增赛事新闻'}
            </h2>
          </div>
          <span className="text-xs text-slate-500">支持图文混排、本地视频上传、定时发布与置顶有效期</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-700 font-bold">
                  新闻标题 <span className="text-red-500">*</span>（限64字以内）
                </label>
                <span className="text-xs font-mono text-slate-400">{formTitle.length} / 64</span>
              </div>
              <input
                type="text"
                maxLength={64}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="请输入赛事新闻标题..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-700 font-bold mb-1">来源（如：大赛组委会、新华网）</label>
              <input
                type="text"
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-700 font-bold mb-1">
                简介 / 摘要（选填，用于前台列表页标题下方展示）
              </label>
              <textarea
                rows={2}
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                placeholder="请输入1-2句核心摘要，留空将自动截取正文前80字..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            {/* 富文本编辑器（支持插入高清图片） */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="text-xs text-slate-700 font-bold">
                  正文内容（富文本编辑器 · 支持插入高清图片） <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormContent(
                        (prev) =>
                          prev +
                          '\n\n![赛事现场配图](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80)\n*图注：大赛现场高清实况图片*'
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-bold text-[#0284C7] cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    插入高清图片
                  </button>
                </div>
              </div>
              <textarea
                rows={10}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="支持段落、小标题（### 标题）、多图混排及视频嵌入..."
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 font-mono leading-relaxed focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />

              {/* 本地视频上传（仅上传本地视频文件，无需URL和标题） */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-[#0284C7]" />
                    <span>正文视频上传（选填，支持上传本地视频文件）</span>
                  </span>
                  {formVideoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormVideoUrl('');
                        triggerToast('已移除视频文件');
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                    >
                      删除视频
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>点击上传视频</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const videoBlobUrl = URL.createObjectURL(file);
                        setFormVideoUrl(videoBlobUrl);
                        triggerToast(`已成功上传本地视频：${file.name}`);
                      }}
                    />
                  </label>
                  {formVideoUrl ? (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      ✓ 已上传本地视频
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">尚未上传本地视频</span>
                  )}
                </div>
                {formVideoUrl && (
                  <div className="mt-2 aspect-video max-w-sm rounded-lg overflow-hidden bg-black border border-slate-200">
                    <video src={formVideoUrl} controls className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            </div>

          {/* 右侧：封面图上传 & 发布设置 */}
          <div className="space-y-4">
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
              <label className="block text-xs text-slate-700 font-bold">
                新闻封面图（建议16:9，未上传自定义封面时默认使用“赛事新闻”官方封面）
              </label>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={formCover.trim() || DEFAULT_NEWS_COVER_SVG}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
                {formCover && formCover !== DEFAULT_NEWS_COVER_SVG && (
                  <button
                    type="button"
                    onClick={() => setFormCover(DEFAULT_NEWS_COVER_SVG)}
                    className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-900/80 text-xs text-white hover:bg-[#0284C7] transition-colors cursor-pointer"
                  >
                    恢复默认“赛事新闻”封面
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formCover === DEFAULT_NEWS_COVER_SVG ? '' : formCover}
                onChange={(e) => setFormCover(e.target.value || DEFAULT_NEWS_COVER_SVG)}
                placeholder="输入自定义封面图URL，留空自动使用“赛事新闻”默认封面..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284C7]"
              />
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setFormCover(DEFAULT_NEWS_COVER_SVG)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 text-[#0284C7] font-bold cursor-pointer"
                >
                  默认“赛事新闻”封面
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormCover(
                      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=960&q=80'
                    )
                  }
                  className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                >
                  使用赛场封面
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormCover(
                      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=960&q=80'
                    )
                  }
                  className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                >
                  使用靶场封面
                </button>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">发布与置顶设置</h4>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">发布方式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormPublishMode('immediate')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                      formPublishMode === 'immediate'
                        ? 'bg-sky-50 border-[#0284C7] text-[#0284C7]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    立即发布
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPublishMode('scheduled')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                      formPublishMode === 'scheduled'
                        ? 'bg-amber-50 border-amber-400 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    定时发布
                  </button>
                </div>
              </div>

              {formPublishMode === 'scheduled' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">预设发布时间</label>
                  <input
                    type="datetime-local"
                    value={formScheduleTime}
                    onChange={(e) => setFormScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-700 font-bold">是否置顶该条新闻</span>
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                  />
                </label>
              </div>

              {formIsPinned && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">置顶有效期（选填，到期自动取消置顶）</label>
                  <input
                    type="datetime-local"
                    value={formPinExpire}
                    onChange={(e) => setFormPinExpire(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleSaveNews(false)}
                className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                {formPublishMode === 'scheduled' ? '确认定时发布' : '立即发布上线'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveNews(true)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                保存为未发布
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 搜索筛选与操作栏 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">标题（模糊搜索）</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="搜索新闻标题..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">发布状态</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'ALL' | ContentPublishStatus)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">全部状态</option>
              <option value="published">已发布</option>
              <option value="unpublished">未发布</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">发布开始日期</label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">发布结束日期</label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            />
          </div>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          新增赛事新闻
        </button>
      </div>

      {/* 列表表格 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">标题</th>
                <th className="py-3.5 px-3">封面（缩略图）</th>
                <th className="py-3.5 px-3">来源</th>
                <th className="py-3.5 px-3 text-center">发布状态</th>
                <th className="py-3.5 px-3 text-center">是否置顶</th>
                <th className="py-3.5 px-3">发布时间</th>
                <th className="py-3.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {filteredNews.map((item) => (
                <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.summary}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <img
                      src={item.coverImage || DEFAULT_NEWS_COVER_SVG}
                      alt={item.title}
                      className="w-20 h-11 object-cover rounded border border-slate-200"
                    />
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 text-xs">{item.source}</td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        item.publishStatus === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.publishStatus === 'published' ? '已发布' : '未发布'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {item.isPinned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Pin className="w-3 h-3" /> 置顶中
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">否</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-xs text-slate-500 tabular-nums">{item.publishTime}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openEditForm(item)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleTogglePin(item)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {item.isPinned ? '取消置顶' : '置顶'}
                      </button>
                      <button
                        onClick={() => handleTogglePublishOffline(item)}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200/80 text-[#0284C7] text-xs font-bold transition-colors cursor-pointer"
                      >
                        {item.publishStatus === 'published' ? '下线' : '发布'}
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 删除二次确认弹窗 */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">确认删除赛事新闻？</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              即将永久删除《<span className="text-slate-900 font-bold">{deletingItem.title}</span>》，删除后不可恢复。
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onChangeNewsList((prev) => prev.filter((n) => n.id !== deletingItem.id));
                  triggerToast(`已删除新闻《${deletingItem.title}》`);
                  setDeletingItem(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {publishingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">确认立即发布？</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              该内容原定于 <span className="font-mono font-bold text-slate-800">{publishingItem.publishTime || '2024-11-05 10:00'}</span> 发布，确认要立即发布吗？
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPublishingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmPublish}
                className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-xs font-bold text-white cursor-pointer shadow-xs"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 六、后台【内容管理 -> 赛事动态】组件
// ============================================================================

interface AdminMomentsManagementProps {
  momentsList: ManagedMomentItem[];
  onChangeMomentsList: React.Dispatch<React.SetStateAction<ManagedMomentItem[]>>;
}

const MOMENT_CATEGORIES: MomentCategory[] = ['进展报道', '专家观点', '团队风采', '赛事花絮'];

export const AdminMomentsManagement: React.FC<AdminMomentsManagementProps> = ({
  momentsList,
  onChangeMomentsList
}) => {
  // 筛选条件：标题/名称、分类、媒体类型（图文/视频）、发布状态、发布时间范围
  const [searchTitle, setSearchTitle] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | MomentCategory>('ALL');
  const [filterMediaType, setFilterMediaType] = useState<'ALL' | MomentMediaType>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | ContentPublishStatus>('ALL');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // 新增 / 编辑表单
  const [editingItem, setEditingItem] = useState<ManagedMomentItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ManagedMomentItem | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<MomentCategory>('进展报道');
  const [formMediaType, setFormMediaType] = useState<MomentMediaType>('article');
  const [formCover, setFormCover] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formSource, setFormSource] = useState('大赛宣传组');
  const [formContent, setFormContent] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVideoDuration, setFormVideoDuration] = useState('04:30');
  const [formPublishMode, setFormPublishMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [formScheduleTime, setFormScheduleTime] = useState('2026-04-22T10:00');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formPinExpire, setFormPinExpire] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const filteredMoments = useMemo(() => {
    return momentsList.filter((item) => {
      if (searchTitle.trim() && !item.title.toLowerCase().includes(searchTitle.trim().toLowerCase())) {
        return false;
      }
      if (filterCategory !== 'ALL' && item.category !== filterCategory) {
        return false;
      }
      if (filterMediaType !== 'ALL' && item.mediaType !== filterMediaType) {
        return false;
      }
      if (filterStatus !== 'ALL' && item.publishStatus !== filterStatus) {
        return false;
      }
      const itemDate = item.publishTime.slice(0, 10);
      if (dateStart && itemDate < dateStart) return false;
      if (dateEnd && itemDate > dateEnd) return false;
      return true;
    });
  }, [momentsList, searchTitle, filterCategory, filterMediaType, filterStatus, dateStart, dateEnd]);

  const openCreateForm = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('进展报道');
    setFormMediaType('article');
    setFormCover('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80');
    setFormSummary('');
    setFormSource('大赛宣传组');
    setFormContent('');
    setFormVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    setFormVideoDuration('04:15');
    setFormPublishMode('immediate');
    setFormScheduleTime('2026-04-22T10:00');
    setFormIsPinned(false);
    setFormPinExpire('');
    setIsFormOpen(true);
  };

  const openEditForm = (item: ManagedMomentItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormMediaType(item.mediaType);
    setFormCover(item.coverImage);
    setFormSummary(item.summary);
    setFormSource(item.source);
    setFormContent(item.content);
    setFormVideoUrl(item.videoUrl || '');
    setFormVideoDuration(item.videoDuration || '04:00');
    setFormPublishMode(item.publishStatus === 'unpublished' ? 'scheduled' : 'immediate');
    setFormScheduleTime(item.publishTime.replace(' ', 'T').slice(0, 16));
    setFormIsPinned(item.isPinned);
    setFormPinExpire(item.pinExpireTime ? item.pinExpireTime.replace(' ', 'T').slice(0, 16) : '');
    setIsFormOpen(true);
  };

  const handleSaveMoment = (saveAsUnpublished: boolean) => {
    if (!formTitle.trim()) {
      triggerToast('请填写赛事动态标题');
      return;
    }
    if (formMediaType === 'video' && !formCover.trim()) {
      triggerToast('视频类动态必须设置视频封面图（或自动截取首帧）');
      return;
    }
    if (formMediaType === 'video' && !formVideoUrl.trim()) {
      triggerToast('请上传视频文件或填写外部视频地址');
      return;
    }

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const finalStatus: ContentPublishStatus =
      saveAsUnpublished || formPublishMode === 'scheduled' ? 'unpublished' : 'published';
    const finalPublishTime =
      formPublishMode === 'scheduled' ? formScheduleTime.replace('T', ' ') : editingItem?.publishTime || nowStr;

    const newRecord: ManagedMomentItem = {
      id: editingItem ? editingItem.id : `mmom-${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory,
      mediaType: formMediaType,
      coverImage:
        formCover.trim() ||
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      summary: formSummary.trim() || formContent.trim().slice(0, 70),
      source: formSource.trim() || '大赛组委会',
      content: formContent.trim() || formSummary.trim(),
      images: editingItem?.images,
      videoUrl: formMediaType === 'video' ? formVideoUrl.trim() : undefined,
      videoDuration: formMediaType === 'video' ? formVideoDuration.trim() || '03:45' : undefined,
      publishStatus: finalStatus,
      publishTime: finalPublishTime,
      isPinned: formIsPinned,
      pinExpireTime: formIsPinned && formPinExpire ? formPinExpire.replace('T', ' ') : undefined,
      viewsCount: editingItem ? editingItem.viewsCount : 1
    };

    if (editingItem) {
      onChangeMomentsList((prev) => prev.map((m) => (m.id === editingItem.id ? newRecord : m)));
      triggerToast(`已更新赛事动态《${newRecord.title}》`);
    } else {
      onChangeMomentsList((prev) => [newRecord, ...prev]);
      triggerToast(finalStatus === 'unpublished' ? `已保存为未发布《${newRecord.title}》` : `已发布赛事动态《${newRecord.title}》`);
    }
    setIsFormOpen(false);
  };

  if (isFormOpen) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFormOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              返回动态列表
            </button>
            <h2 className="text-lg font-extrabold text-slate-900">
              {editingItem ? '编辑赛事动态' : '新增赛事动态（图文 / 视频）'}
            </h2>
          </div>
          <span className="text-xs text-slate-500">支持进展报道、专家观点、团队风采、赛事花絮四大栏目</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-xs text-slate-700 font-bold mb-1">
                动态标题 / 名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="请输入赛事动态标题..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-700 font-bold mb-1">
                  所属分类（单选） <span className="text-red-500">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MomentCategory)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
                >
                  {MOMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-bold mb-1">
                  媒体类型（单选） <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormMediaType('article')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      formMediaType === 'article'
                        ? 'bg-sky-50 border-[#0284C7] text-[#0284C7]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> 图文动态
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMediaType('video')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      formMediaType === 'video'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" /> 视频动态
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-bold mb-1">来源</label>
                <input
                  type="text"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            {formMediaType === 'video' && (
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-3">
                <div className="text-xs font-extrabold text-indigo-800 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-indigo-600" />
                  视频媒体配置（支持上传视频文件或填写外部视频地址）
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">视频文件地址 / 外链 URL *</label>
                    <input
                      type="text"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      placeholder="https://.../video.mp4"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">视频时长（选填，如 04:52）</label>
                    <input
                      type="text"
                      value={formVideoDuration}
                      onChange={(e) => setFormVideoDuration(e.target.value)}
                      placeholder="04:52"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-700 font-bold mb-1">简介摘要</label>
              <textarea
                rows={2}
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                placeholder="简要描述本条赛事动态亮点..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-700 font-bold mb-1">
                {formMediaType === 'article' ? '图文正文（富文本编辑器 · 支持插入多张高清图片）' : '视频详细说明与看点介绍'}
              </label>
              <textarea
                rows={8}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
              <label className="block text-xs text-slate-700 font-bold">
                {formMediaType === 'video' ? '视频封面图（必填，支持自动截取首帧） *' : '图文卡片封面图（推荐 16:9）'}
              </label>
              {formCover && (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                  <img src={formCover} alt="cover" className="w-full h-full object-cover" />
                  {formMediaType === 'video' && (
                    <div className="absolute inset-0 bg-slate-900/35 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-md">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <input
                type="text"
                value={formCover}
                onChange={(e) => setFormCover(e.target.value)}
                placeholder="输入封面图 URL..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284C7]"
              />
              {formMediaType === 'video' && (
                <button
                  type="button"
                  onClick={() =>
                    setFormCover(
                      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'
                    )
                  }
                  className="w-full py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  自动截取视频高清首帧作为封面
                </button>
              )}
            </div>

            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">发布与置顶设置</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormPublishMode('immediate')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                    formPublishMode === 'immediate'
                      ? 'bg-sky-50 border-[#0284C7] text-[#0284C7]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  立即发布
                </button>
                <button
                  type="button"
                  onClick={() => setFormPublishMode('scheduled')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                    formPublishMode === 'scheduled'
                      ? 'bg-amber-50 border-amber-400 text-amber-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  定时发布
                </button>
              </div>

              {formPublishMode === 'scheduled' && (
                <input
                  type="datetime-local"
                  value={formScheduleTime}
                  onChange={(e) => setFormScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0284C7]"
                />
              )}

              <label className="flex items-center justify-between pt-2 border-t border-slate-200 cursor-pointer">
                <span className="text-xs text-slate-700 font-bold">置顶该条赛事动态</span>
                <input
                  type="checkbox"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                />
              </label>

              {formIsPinned && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">置顶有效期（选填）</label>
                  <input
                    type="datetime-local"
                    value={formPinExpire}
                    onChange={(e) => setFormPinExpire(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => handleSaveMoment(false)}
                className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                发布赛事动态
              </button>
              <button
                type="button"
                onClick={() => handleSaveMoment(true)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                保存为未发布
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 筛选与操作栏 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">标题/名称（模糊搜索）</label>
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="搜索动态标题..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">分类</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'ALL' | MomentCategory)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">全部栏目分类</option>
              {MOMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">媒体类型</label>
            <select
              value={filterMediaType}
              onChange={(e) => setFilterMediaType(e.target.value as 'ALL' | MomentMediaType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">全部（图文 + 视频）</option>
              <option value="article">图文</option>
              <option value="video">视频</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">发布状态</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'ALL' | ContentPublishStatus)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">全部状态</option>
              <option value="published">已发布</option>
              <option value="unpublished">未发布</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">开始日期</label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">结束日期</label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            />
          </div>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          新增赛事动态
        </button>
      </div>

      {/* 列表表格 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">标题</th>
                <th className="py-3.5 px-3">封面（视频带播放角标）</th>
                <th className="py-3.5 px-3">分类</th>
                <th className="py-3.5 px-3">媒体类型</th>
                <th className="py-3.5 px-3">来源</th>
                <th className="py-3.5 px-3 text-center">发布状态</th>
                <th className="py-3.5 px-3 text-center">是否置顶</th>
                <th className="py-3.5 px-3">发布时间</th>
                <th className="py-3.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {filteredMoments.map((item) => (
                <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.summary}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="relative w-24 h-13 rounded overflow-hidden border border-slate-200">
                      <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                      {item.mediaType === 'video' && (
                        <div className="absolute inset-0 bg-slate-900/35 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-xs">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-[#0284C7] border border-sky-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    {item.mediaType === 'video' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Video className="w-3 h-3" /> 视频 ({item.videoDuration || '04:00'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <ImageIcon className="w-3 h-3" /> 图文
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-xs text-slate-600">{item.source}</td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        item.publishStatus === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.publishStatus === 'published' ? '已发布' : '未发布'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {item.isPinned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Pin className="w-3 h-3" /> 置顶
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">否</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-xs text-slate-500 tabular-nums">{item.publishTime}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openEditForm(item)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() =>
                          onChangeMomentsList((prev) =>
                            prev.map((m) => (m.id === item.id ? { ...m, isPinned: !m.isPinned } : m))
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {item.isPinned ? '取消置顶' : '置顶'}
                      </button>
                      <button
                        onClick={() =>
                          onChangeMomentsList((prev) =>
                            prev.map((m) =>
                              m.id === item.id
                                ? { ...m, publishStatus: m.publishStatus === 'published' ? 'unpublished' : 'published' }
                                : m
                            )
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200/80 text-[#0284C7] text-xs font-bold transition-colors cursor-pointer"
                      >
                        {item.publishStatus === 'published' ? '下线' : '发布'}
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">确认删除该条赛事动态？</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              即将删除《<span className="text-slate-900 font-bold">{deletingItem.title}</span>》，此操作不可撤销。
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onChangeMomentsList((prev) => prev.filter((m) => m.id !== deletingItem.id));
                  triggerToast(`已删除动态《${deletingItem.title}》`);
                  setDeletingItem(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 六（补充 A）、后台【内容管理 -> 通知公告】组件（与赛事新闻、赛事动态风格排版完全一致）
// ============================================================================

export type { NoticeCategoryType };

export interface ManagedNoticeItem extends NoticeItem {
  publishStatus: ContentPublishStatus;
  publishTime: string;
  pinExpireTime?: string;
}

export const INITIAL_MANAGED_NOTICES: ManagedNoticeItem[] = [
  ...NOTICE_ITEMS.map((n, index) => ({
    ...n,
    category: (n.category || '通知') as NoticeCategoryType,
    docNumber: '',
    publishStatus: 'published' as ContentPublishStatus,
    publishTime: `${n.fullDate} ${index % 2 === 0 ? '09:30' : '15:00'}`,
    pinExpireTime: n.isPinned ? '2026-12-31 23:59' : undefined,
    viewsCount: n.viewsCount || 12800 - index * 650,
  })),
  {
    id: 'notice-scheduled-1',
    title: '关于公布第五届“XX杯”全国网数智安全大赛总决赛线下场地与差旅报到须知的通知',
    date: '11-05',
    fullDate: '2026-11-05',
    isPinned: false,
    category: '通知',
    summary: '明确全国总决赛北京国家会议中心报到流程、参赛证件核验通道及线下实网靶场物理隔离要求。',
    viewsCount: 0,
    department: '“XX杯”全国网数智安全大赛组委会会务组',
    docNumber: '',
    content: [
      '各晋级全国总决赛高校战队领队、指导教师及参赛队员：',
      '第五届“XX杯”全国网数智安全大赛全国总决赛暨颁奖盛典定于2026年12月19日至20日在北京国家会议中心举行。请各入围战队于12月18日14:00-20:00凭身份证与学生证原件完成现场签到与抽签。',
    ],
    attachments: [
      { name: '附件：总决赛参赛队报到回执与安全保密承诺书.docx', size: '520 KB' },
    ],
    publishStatus: 'unpublished',
    publishTime: '2026-11-05 09:00',
  },
  {
    id: 'notice-draft-1',
    title: '关于增补第五届“XX杯”专项赛区高校联络员与技术观察员的通知（待审签）',
    date: '10-29',
    fullDate: '2026-10-29',
    isPinned: false,
    category: '创新赛通知',
    summary: '拟面向全国八大分赛区增补30名高校赛事联络员，负责分赛区学籍核验协查与赛事组织联动。',
    viewsCount: 0,
    department: '大赛高校联络工作组',
    docNumber: '',
    content: [
      '各有关高校网络空间安全学院：',
      '为进一步提升分赛区资格审查效率，组委会拟增补高校联络员及技术观察员，具体推荐表待秘书长审签后正式下发。',
    ],
    publishStatus: 'unpublished',
    publishTime: '2026-10-29 16:00',
  },
];

const MANAGED_NOTICE_CATEGORIES: NoticeCategoryType[] = [
  '通知',
  '创新赛通知',
  '作品赛通知',
];

interface AdminNoticesManagementProps {
  noticesList: ManagedNoticeItem[];
  onChangeNoticesList: React.Dispatch<React.SetStateAction<ManagedNoticeItem[]>>;
}

export const AdminNoticesManagement: React.FC<AdminNoticesManagementProps> = ({
  noticesList,
  onChangeNoticesList,
}) => {
  // 筛选条件：标题、公告分类、发布状态、发布时间范围
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | NoticeCategoryType>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | ContentPublishStatus>('ALL');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // 新增 / 编辑表单状态
  const [editingItem, setEditingItem] = useState<ManagedNoticeItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ManagedNoticeItem | null>(null);
  const [publishingItem, setPublishingItem] = useState<ManagedNoticeItem | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<NoticeCategoryType>('通知');
  const [formDepartment, setFormDepartment] = useState('“XX杯”全国网数智安全大赛组委会秘书处');
  const [formSummary, setFormSummary] = useState('');
  const [formContentText, setFormContentText] = useState('');
  const [formAttachments, setFormAttachments] = useState<{ name: string; size: string }[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentSize, setNewAttachmentSize] = useState('1.2 MB');
  const [formPublishMode, setFormPublishMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [formScheduleTime, setFormScheduleTime] = useState('2026-11-01T09:00');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formPinExpire, setFormPinExpire] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const filteredNotices = useMemo(() => {
    return noticesList.filter((item) => {
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(kw);
        const matchDept = item.department.toLowerCase().includes(kw);
        if (!matchTitle && !matchDept) return false;
      }
      if (filterCategory !== 'ALL' && (item.category || '通知') !== filterCategory) {
        return false;
      }
      if (filterStatus !== 'ALL' && item.publishStatus !== filterStatus) {
        return false;
      }
      const itemDate = (item.publishTime || item.fullDate).slice(0, 10);
      if (dateStart && itemDate < dateStart) return false;
      if (dateEnd && itemDate > dateEnd) return false;
      return true;
    });
  }, [noticesList, searchKeyword, filterCategory, filterStatus, dateStart, dateEnd]);

  const openCreateForm = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('通知');
    setFormDepartment('“XX杯”全国网数智安全大赛组委会秘书处');
    setFormSummary('');
    setFormContentText(
      '各有关高等院校、参赛指导教师及参赛战队：\n\n请在此输入官方通知公告正文内容。'
    );
    setFormAttachments([]);
    setNewAttachmentName('');
    setNewAttachmentSize('1.5 MB');
    setFormPublishMode('immediate');
    setFormScheduleTime('2026-11-01T09:00');
    setFormIsPinned(false);
    setFormPinExpire('');
    setIsFormOpen(true);
  };

  const openEditForm = (item: ManagedNoticeItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory((item.category as NoticeCategoryType) || '通知');
    setFormDepartment(item.department || '“XX杯”全国网数智安全大赛组委会秘书处');
    setFormSummary(item.summary || '');
    setFormContentText((item.content || []).join('\n\n'));
    setFormAttachments(item.attachments ? [...item.attachments] : []);
    setNewAttachmentName('');
    setNewAttachmentSize('1.5 MB');
    setFormPublishMode(item.publishStatus === 'unpublished' ? 'scheduled' : 'immediate');
    setFormScheduleTime(
      (item.publishTime || `${item.fullDate} 09:00`).replace(' ', 'T').slice(0, 16)
    );
    setFormIsPinned(item.isPinned);
    setFormPinExpire(item.pinExpireTime ? item.pinExpireTime.replace(' ', 'T').slice(0, 16) : '');
    setIsFormOpen(true);
  };

  const handleSaveNotice = (saveAsUnpublished: boolean) => {
    if (!formTitle.trim()) {
      triggerToast('请填写通知公告标题');
      return;
    }
    if (!formContentText.trim()) {
      triggerToast('请填写通知公告正文内容');
      return;
    }

    const nowStr = '2026-10-28 14:30';
    const finalStatus: ContentPublishStatus =
      saveAsUnpublished || formPublishMode === 'scheduled' ? 'unpublished' : 'published';
    const finalPublishTime =
      formPublishMode === 'scheduled'
        ? formScheduleTime.replace('T', ' ')
        : editingItem?.publishTime || nowStr;
    const fullDateStr = finalPublishTime.slice(0, 10);
    const shortDateStr = fullDateStr.slice(5, 10);
    const paragraphs = formContentText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const newRecord: ManagedNoticeItem = {
      id: editingItem ? editingItem.id : `notice-${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory,
      docNumber: '',
      department: formDepartment.trim() || '“XX杯”全国网数智安全大赛组委会秘书处',
      date: shortDateStr,
      fullDate: fullDateStr,
      summary: formSummary.trim() || paragraphs[1] || paragraphs[0] || '',
      content: paragraphs,
      attachments: formAttachments.length > 0 ? formAttachments : undefined,
      isPinned: formIsPinned,
      pinExpireTime: formIsPinned && formPinExpire ? formPinExpire.replace('T', ' ') : undefined,
      publishStatus: finalStatus,
      publishTime: finalPublishTime,
      viewsCount: editingItem ? editingItem.viewsCount || 1200 : 1,
    };

    if (editingItem) {
      onChangeNoticesList((prev) => prev.map((n) => (n.id === editingItem.id ? newRecord : n)));
      triggerToast(`已更新通知公告《${newRecord.title}》，前台已实时同步`);
    } else {
      onChangeNoticesList((prev) => [newRecord, ...prev]);
      triggerToast(
        finalStatus === 'unpublished'
          ? `已保存为未发布《${newRecord.title}》`
          : `已发布通知公告《${newRecord.title}》，前台【通知公告】与首页已同步上线`
      );
    }
    setIsFormOpen(false);
  };

  const handleTogglePin = (item: ManagedNoticeItem) => {
    onChangeNoticesList((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isPinned: !n.isPinned } : n))
    );
    triggerToast(
      item.isPinned
        ? `已取消置顶《${item.title}》`
        : `已设为置顶《${item.title}》，前台将优先展示`
    );
  };

  const handleTogglePublishOffline = (item: ManagedNoticeItem) => {
    if (item.publishStatus === 'unpublished') {
      setPublishingItem(item);
      return;
    }
    const nextStatus: ContentPublishStatus = 'unpublished';
    onChangeNoticesList((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, publishStatus: nextStatus } : n))
    );
    triggerToast(`已设为未发布《${item.title}》，前台【通知公告】不再展示`);
  };

  const confirmPublish = () => {
    if (!publishingItem) return;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 10);
    onChangeNoticesList((prev) =>
      prev.map((n) => (n.id === publishingItem.id ? { ...n, publishStatus: 'published', fullDate: nowStr } : n))
    );
    triggerToast(`已发布上线《${publishingItem.title}》，前台立即可见`);
    setPublishingItem(null);
  };

  if (isFormOpen) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              返回通知公告列表
            </button>
            <h2 className="text-lg font-extrabold text-slate-900">
              {editingItem ? '编辑官方通知公告' : '新增官方通知公告'}
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            支持通知分类、随文附件配置、定时发布与置顶控制
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-700 font-bold">
                  通知公告标题 <span className="text-red-500">*</span>
                </label>
                <span className="text-xs font-mono text-slate-400">{formTitle.length} / 80</span>
              </div>
              <input
                type="text"
                maxLength={80}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="例如：关于发布《第五届“XX杯”网数智安全大赛参赛指南》的通知"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-700 font-bold mb-1">公告分类</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as NoticeCategoryType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
                >
                  {MANAGED_NOTICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-bold mb-1">发文机构/部门</label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  placeholder="如：“XX杯”全国网数智安全大赛组委会秘书处"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-700 font-bold mb-1">
                公文提要 / 摘要（选填，用于前台通知公告列表摘要展示）
              </label>
              <textarea
                rows={2}
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                placeholder="请输入1-2句通知核心提要，留空将自动提取正文首段..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="text-xs text-slate-700 font-bold">
                  通知正文内容（每段之间请换行，首段以冒号结尾将自动识别为公文抬头）{' '}
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormContentText(
                      (prev) =>
                        prev +
                        '\n\n特此通知。请各参赛高校领队及指导教师督促本院系参赛战队按时完成相关工作。'
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-bold text-[#0284C7] cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  插入标准公文结语
                </button>
              </div>
              <textarea
                rows={10}
                value={formContentText}
                onChange={(e) => setFormContentText(e.target.value)}
                placeholder="请输入公文正文内容..."
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 leading-relaxed focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>

          {/* 右侧：随文附件管理 + 发布与置顶设置 */}
          <div className="space-y-4">
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
              <label className="block text-xs text-slate-700 font-bold">
                随文附件管理（前台通知详情页提供下载）
              </label>
              {formAttachments.length === 0 ? (
                <div className="p-3 rounded-lg border border-dashed border-slate-300 bg-white text-xs text-slate-400 text-center">
                  当前未添加随文附件
                </div>
              ) : (
                <div className="space-y-2">
                  {formAttachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-slate-800 font-bold truncate">{att.name}</div>
                        <div className="text-slate-400 font-mono">{att.size}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormAttachments((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-red-600 hover:text-red-500 font-bold px-2 py-1 cursor-pointer shrink-0"
                      >
                        移除
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <input
                  type="text"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  placeholder="附件名称（如：附件1：参赛指南.pdf）"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284C7]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAttachmentSize}
                    onChange={(e) => setNewAttachmentSize(e.target.value)}
                    placeholder="大小（如 2.4 MB）"
                    className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-[#0284C7]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const name =
                        newAttachmentName.trim() ||
                        `附件${formAttachments.length + 1}：大赛官方规范文件.pdf`;
                      setFormAttachments((prev) => [
                        ...prev,
                        { name, size: newAttachmentSize.trim() || '1.5 MB' },
                      ]);
                      setNewAttachmentName('');
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs text-[#0284C7] font-bold transition-colors cursor-pointer"
                  >
                    + 添加随文附件
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                发布与置顶设置
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">发布方式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormPublishMode('immediate')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                      formPublishMode === 'immediate'
                        ? 'bg-sky-50 border-[#0284C7] text-[#0284C7]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    立即发布
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPublishMode('scheduled')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                      formPublishMode === 'scheduled'
                        ? 'bg-amber-50 border-amber-400 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    定时发布
                  </button>
                </div>
              </div>

              {formPublishMode === 'scheduled' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">预设发布时间</label>
                  <input
                    type="datetime-local"
                    value={formScheduleTime}
                    onChange={(e) => setFormScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-700 font-bold">是否置顶该条通知公文</span>
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                  />
                </label>
              </div>

              {formIsPinned && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    置顶有效期（选填，到期自动取消置顶）
                  </label>
                  <input
                    type="datetime-local"
                    value={formPinExpire}
                    onChange={(e) => setFormPinExpire(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleSaveNotice(false)}
                className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                {formPublishMode === 'scheduled' ? '确认定时发布' : '立即发布上线'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveNotice(true)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                保存为未发布
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 搜索筛选与操作栏 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">标题（模糊搜索）</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索通知标题"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">公告分类</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'ALL' | NoticeCategoryType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">全部公告分类</option>
              {MANAGED_NOTICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">发布状态</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'ALL' | ContentPublishStatus)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            >
              <option value="ALL">全部状态</option>
              <option value="published">已发布</option>
              <option value="unpublished">未发布</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">发布开始日期</label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">发布结束日期</label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          新增通知公告
        </button>
      </div>

      {/* 列表表格 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">通知标题 / 提要</th>
                <th className="py-3.5 px-3">公告分类</th>
                <th className="py-3.5 px-3">发文机构</th>
                <th className="py-3.5 px-3 text-center">随文附件</th>
                <th className="py-3.5 px-3 text-center">发布状态</th>
                <th className="py-3.5 px-3 text-center">是否置顶</th>
                <th className="py-3.5 px-3">发布时间</th>
                <th className="py-3.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {filteredNotices.map((item) => (
                <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.summary || item.content[0]}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-[#0284C7] border border-sky-200">
                      {item.category || '通知'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 text-xs max-w-[180px] truncate">
                    {item.department}
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {item.attachments && item.attachments.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Download className="w-3 h-3" /> {item.attachments.length} 份
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">无</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        item.publishStatus === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.publishStatus === 'published' ? '已发布' : '未发布'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {item.isPinned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Pin className="w-3 h-3" /> 置顶中
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">否</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                    {item.publishTime || item.fullDate}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditForm(item)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePin(item)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {item.isPinned ? '取消置顶' : '置顶'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublishOffline(item)}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200/80 text-[#0284C7] text-xs font-bold transition-colors cursor-pointer"
                      >
                        {item.publishStatus === 'published' ? '下线' : '发布'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItem(item)}
                        className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 删除二次确认弹窗 */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">确认删除该份通知公告？</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              即将永久删除《<span className="text-slate-900 font-bold">{deletingItem.title}</span>
              》，删除后前台不再展示且不可恢复。
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeNoticesList((prev) => prev.filter((n) => n.id !== deletingItem.id));
                  triggerToast(`已删除通知公告《${deletingItem.title}》`);
                  setDeletingItem(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {publishingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">确认立即发布？</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              该内容原定于 <span className="font-mono font-bold text-slate-800">{publishingItem.publishTime || '2024-11-05 10:00'}</span> 发布，确认要立即发布吗？
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPublishingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmPublish}
                className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-xs font-bold text-white cursor-pointer shadow-xs"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 六（补充 B）、后台【认证管理 -> 学生认证 / 教师认证】人工审核模块（与内容管理风格排版一致）
// ============================================================================

export type VerificationReviewStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationAttachmentItem {
  id: string;
  name: string;
  size: string;
  url: string;
  fileType?: string;
}

export interface VerificationApplicationRecord {
  id: string;
  applicantType: 'student' | 'teacher' | 'univ_admin';
  username: string;
  realName: string;
  idCard: string;
  phone: string;
  email: string;
  university: string;
  institutionCode: string;
  majorOrDept: string; // 学生为专业，教师为所属院系/部门
  teacherMajor?: string; // 教师所属专业
  educationLevel?: string; // 学历层次（专科/本科/硕士/博士及以上）
  studentOrStaffId: string; // 学生为学号/学信网验证码，教师为教工号
  levelOrTitle: string; // 学生为学历层次（专科/本科/硕士/博士及以上），教师为职称（教授/副教授/讲师）
  enrollmentDate?: string; // 学生入学时间 YYYY-MM
  graduationDate?: string; // 学生预计毕业时间 YYYY-MM
  submitChannel: string; // 如：高校管理员在线信息比对 / 指导教师资格与工牌人工审核
  materialFileName?: string;
  materialPreviewUrl?: string;
  attachments?: VerificationAttachmentItem[];
  applicantNote: string;
  submittedAt: string;
  reviewStatus: VerificationReviewStatus;
  reviewedAt?: string;
  reviewer?: string;
  reviewComment?: string;
}

export const INITIAL_VERIFICATION_RECORDS: VerificationApplicationRecord[] = [
  // ================= 学生认证申请记录 =================
  {
    id: 'v-stu-1',
    applicantType: 'student',
    username: 'chen_yuxuan',
    realName: '陈宇轩',
    idCard: '110108200408153912',
    phone: '13910682341',
    email: 'chenyuxuan@buaa.edu.cn',
    university: '北京航空航天大学',
    institutionCode: '4111010006',
    majorOrDept: '信息安全',
    educationLevel: '本科',
    studentOrStaffId: '24061298',
    levelOrTitle: '本科',
    enrollmentDate: '2024-09',
    graduationDate: '2028-06',
    submitChannel: '学生身份认证 · 高校管理员审核',
    materialFileName: '北航学生证内页扫描件_陈宇轩.jpg',
    materialPreviewUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80',
    attachments: [
      {
        id: 'att-stu-1-1',
        name: '北航学生证内页扫描件_陈宇轩.jpg',
        size: '860 KB',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80',
        fileType: 'jpg',
      },
    ],
    applicantNote: '已填写北航信息安全专业学籍信息并附学生证内页（选填）。',
    submittedAt: '2026-10-28 09:45:12',
    reviewStatus: 'pending',
  },
  {
    id: 'v-stu-2',
    applicantType: 'student',
    username: 'su_mingzhe',
    realName: '苏明哲',
    idCard: '310115200211046238',
    phone: '13764298105',
    email: 'sumingzhe@pku.edu.cn',
    university: '北京大学',
    institutionCode: '4111010001',
    majorOrDept: '计算机科学与技术（网络安全方向）',
    educationLevel: '硕士',
    studentOrStaffId: '2501210846',
    levelOrTitle: '硕士',
    enrollmentDate: '2025-09',
    graduationDate: '2028-06',
    submitChannel: '学生身份认证 · 高校管理员审核',
    attachments: [],
    applicantNote: '直博/硕士研究生学籍信息比对。',
    submittedAt: '2026-10-28 08:20:05',
    reviewStatus: 'pending',
  },
  {
    id: 'v-stu-3',
    applicantType: 'student',
    username: 'luo_jiaqi',
    realName: '罗嘉琪',
    idCard: '33010620050321184X',
    phone: '15858129043',
    email: 'luojiaqi@zju.edu.cn',
    university: '浙江大学',
    institutionCode: '4133010335',
    majorOrDept: '信息安全',
    educationLevel: '本科',
    studentOrStaffId: '3230104592',
    levelOrTitle: '本科',
    enrollmentDate: '2023-09',
    graduationDate: '2027-06',
    submitChannel: '学生身份认证 · 高校管理员审核',
    materialFileName: '浙江大学学生证内页_罗嘉琪.png',
    materialPreviewUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80',
    attachments: [
      {
        id: 'att-stu-3-1',
        name: '浙江大学学生证内页_罗嘉琪.png',
        size: '1.36 MB',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80',
        fileType: 'png',
      },
    ],
    applicantNote: '已提交本校专业及入学毕业年月信息。',
    submittedAt: '2026-10-27 19:15:40',
    reviewStatus: 'pending',
  },
  {
    id: 'v-stu-4',
    applicantType: 'student',
    username: 'linyuanhang',
    realName: '林远航',
    idCard: '110108200305162819',
    phone: '13810246921',
    email: 'linyuanhang@buaa.edu.cn',
    university: '北京航空航天大学',
    institutionCode: '4111010006',
    majorOrDept: '网络空间安全',
    educationLevel: '本科',
    studentOrStaffId: 'BY2406118',
    levelOrTitle: '本科',
    enrollmentDate: '2024-09',
    graduationDate: '2028-06',
    submitChannel: '学生身份认证 · 高校管理员审核',
    attachments: [],
    applicantNote: '北航天枢攻防战队队长学生身份认证。',
    submittedAt: '2026-10-15 09:10:00',
    reviewStatus: 'approved',
    reviewedAt: '2026-10-15 10:00:00',
    reviewer: '高校管理员 (buaa_admin)',
    reviewComment: '本校网络空间安全专业在籍学生信息比对一致，予以通过。',
  },
  {
    id: 'v-stu-5',
    applicantType: 'student',
    username: 'han_haoran',
    realName: '韩浩然',
    idCard: '610113200409184417',
    phone: '18629047128',
    email: 'hanhaoran@xidian.edu.cn',
    university: '西安电子科技大学',
    institutionCode: '4161010701',
    majorOrDept: '密码科学与技术（实验班）',
    educationLevel: '本科',
    studentOrStaffId: '22009200418',
    levelOrTitle: '本科',
    enrollmentDate: '2022-09',
    graduationDate: '2025-06',
    submitChannel: '学生身份认证 · 高校管理员审核',
    attachments: [],
    applicantNote: '申请密码赛道参赛学生认证。',
    submittedAt: '2026-10-26 16:40:22',
    reviewStatus: 'rejected',
    reviewedAt: '2026-10-26 17:30:10',
    reviewer: '高校管理员 (xidian_admin)',
    reviewComment: '预计毕业时间有误（四年制本科2022年9月入学预计毕业时间应为2026-06），请修改后重新提交。',
  },

  // ================= 教师认证申请记录 =================
  {
    id: 'v-tea-1',
    applicantType: 'teacher',
    username: 'prof_shen_pku',
    realName: '沈怀瑾',
    idCard: '110108198204193316',
    phone: '13810369284',
    email: 'shenhuaijin@pku.edu.cn',
    university: '北京大学',
    institutionCode: '4111010001',
    majorOrDept: '计算机科学与技术学院',
    teacherMajor: '网络空间安全',
    educationLevel: '博士及以上',
    studentOrStaffId: 'PKU-T2016048',
    levelOrTitle: '博士及以上',
    submitChannel: '指导教师资格人工审核（工作证 + 教师资格证）',
    materialFileName: '北京大学教职工工作证与高校教师资格证_沈怀瑾.jpg',
    materialPreviewUrl:
      'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=900&q=80',
    attachments: [
      {
        id: 'att-tea-1-1',
        name: '北京大学教职工工作证_沈怀瑾.jpg',
        size: '1.05 MB',
        url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=900&q=80',
        fileType: 'jpg',
      },
      {
        id: 'att-tea-1-2',
        name: '高等学校教师资格证书_沈怀瑾.pdf',
        size: '1.62 MB',
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
        fileType: 'pdf',
      },
      {
        id: 'att-tea-1-3',
        name: '院系带队指导教师推荐函盖章件.docx',
        size: '480 KB',
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
        fileType: 'docx',
      },
    ],
    applicantNote: '拟担任北京大学“未名湖畔攻防战队”指导教师，已上传人事部签发教工卡扫描件。',
    submittedAt: '2026-10-28 10:12:30',
    reviewStatus: 'pending',
  },
  {
    id: 'v-tea-2',
    applicantType: 'teacher',
    username: 'teacher_gu_zju',
    realName: '顾清源',
    idCard: '330106198611251934',
    phone: '13958046219',
    email: 'guqingyuan@zju.edu.cn',
    university: '浙江大学',
    institutionCode: '4133010335',
    majorOrDept: '网络空间安全学院',
    teacherMajor: '信息安全',
    educationLevel: '博士及以上',
    studentOrStaffId: 'ZJU-0019482',
    levelOrTitle: '博士及以上',
    submitChannel: '指导教师资格人工审核（校园一卡通教工卡）',
    materialFileName: '浙江大学教工卡正反面及院系聘任证明_顾清源.pdf',
    materialPreviewUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    attachments: [
      {
        id: 'att-tea-2-1',
        name: '浙江大学教工卡正反面及院系聘任证明_顾清源.pdf',
        size: '1.84 MB',
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
        fileType: 'pdf',
      },
      {
        id: 'att-tea-2-2',
        name: '浙大网安学院专任教师在职证明_顾清源.png',
        size: '920 KB',
        url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=900&q=80',
        fileType: 'png',
      },
    ],
    applicantNote: '负责浙大网安战队AI大模型内生安全专项赛赛前技术指导。',
    submittedAt: '2026-10-27 21:05:18',
    reviewStatus: 'pending',
  },
  {
    id: 'v-tea-3',
    applicantType: 'teacher',
    username: 'teacher_zhao_buaa',
    realName: '赵振宇',
    idCard: '110108197908124015',
    phone: '13810557890',
    email: 'zhaozhenyu@buaa.edu.cn',
    university: '北京航空航天大学',
    institutionCode: '4111010006',
    majorOrDept: '网络空间安全学院',
    teacherMajor: '网络空间安全',
    educationLevel: '博士及以上',
    studentOrStaffId: 'BUAA-T2012089',
    levelOrTitle: '博士及以上',
    submitChannel: '指导教师资格人工审核（工作证 + 教师资格证）',
    materialFileName: '北京航空航天大学工作证_赵振宇教授.jpg',
    materialPreviewUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
    attachments: [
      {
        id: 'att-tea-3-1',
        name: '北京航空航天大学工作证_赵振宇教授.jpg',
        size: '1.12 MB',
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
        fileType: 'jpg',
      },
      {
        id: 'att-tea-3-2',
        name: '高校教师资格证及聘书扫描包_赵振宇.zip',
        size: '3.45 MB',
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
        fileType: 'zip',
      },
    ],
    applicantNote: '北航天枢攻防战队、北航智盾先锋队指导教师。',
    submittedAt: '2026-10-14 14:20:00',
    reviewStatus: 'approved',
    reviewedAt: '2026-10-14 16:05:00',
    reviewer: '高校管理员 (buaa_admin)',
    reviewComment: '北航人事处教工号核验属实，教师资格证齐全，审核通过。',
  },
  {
    id: 'v-tea-4',
    applicantType: 'teacher',
    username: 'teacher_xu_bupt',
    realName: '许建峰',
    idCard: '11010819880309215X',
    phone: '13611094582',
    email: 'xujianfeng@bupt.edu.cn',
    university: '北京邮电大学',
    institutionCode: '4111010013',
    majorOrDept: '网络空间安全学院',
    teacherMajor: '密码科学与技术',
    educationLevel: '博士及以上',
    studentOrStaffId: 'BUPT-2017112',
    levelOrTitle: '博士及以上',
    submitChannel: '指导教师资格人工审核（工作证照片）',
    materialFileName: '北邮工作证翻拍照片_许建峰.jpg',
    materialPreviewUrl:
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80',
    attachments: [
      {
        id: 'att-tea-4-1',
        name: '北邮工作证翻拍照片_许建峰.jpg',
        size: '780 KB',
        url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80',
        fileType: 'jpg',
      },
    ],
    applicantNote: '申请指导教师资格认证。',
    submittedAt: '2026-10-25 11:30:00',
    reviewStatus: 'rejected',
    reviewedAt: '2026-10-25 15:12:40',
    reviewer: '大赛资格审查专员 (admin)',
    reviewComment: '工作证照片反光严重，教工号与发证公章模糊不清，请重新拍摄清晰无反光原件上传。',
  },

  // ================= 高校管理员认证申请记录 =================
  {
    id: 'v-admin-1',
    applicantType: 'univ_admin',
    username: 'zhangwei_thu',
    realName: '张伟',
    idCard: '110108198203154817',
    phone: '13910886622',
    email: 'zhangwei@tsinghua.edu.cn',
    university: '清华大学',
    institutionCode: '4111010003',
    majorOrDept: '网络空间安全学院',
    teacherMajor: '网络空间安全',
    educationLevel: '博士及以上',
    studentOrStaffId: 'THU-TEA-0821',
    levelOrTitle: '博士及以上',
    submitChannel: '高校管理员人工审核 · 组委会核验',
    materialFileName: '清华大学教师在职证明与管理员授权书.pdf',
    materialPreviewUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80',
    attachments: [
      {
        id: 'att-admin-1-1',
        name: '清华大学教师在职证明与管理员授权委托书.pdf',
        size: '1.45 MB',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80',
        fileType: 'pdf',
      },
    ],
    applicantNote: '系清华大学网络空间安全学院教研室主任，申请本校网数智安全大赛高校管理员工作台权限，负责本校学生及队伍审核。',
    submittedAt: '2026-10-28 10:15:30',
    reviewStatus: 'pending',
  },
  {
    id: 'v-admin-2',
    applicantType: 'univ_admin',
    username: 'li_haitao',
    realName: '李海涛',
    idCard: '110108197906203512',
    phone: '13810246921',
    email: 'lihaitao@buaa.edu.cn',
    university: '北京航空航天大学',
    institutionCode: '4111010006',
    majorOrDept: '计算机学院',
    teacherMajor: '计算机科学与技术',
    educationLevel: '博士及以上',
    studentOrStaffId: 'BUAA-T-2016',
    levelOrTitle: '博士及以上',
    submitChannel: '高校管理员人工审核 · 组委会核验',
    materialFileName: '北航网络安全实验室负责人资质与委托书.pdf',
    materialPreviewUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80',
    attachments: [
      {
        id: 'att-admin-2-1',
        name: '北航网络安全实验室负责人资质与委托书.pdf',
        size: '2.10 MB',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80',
        fileType: 'pdf',
      },
    ],
    applicantNote: '北航网安竞赛联络负责人，申请高校管理员工作台权限。',
    submittedAt: '2026-10-27 14:20:00',
    reviewStatus: 'approved',
    reviewedAt: '2026-10-27 16:30:00',
    reviewer: '组委会超级管理员',
  },
  {
    id: 'v-admin-3',
    applicantType: 'univ_admin',
    username: 'zhou_jianguo',
    realName: '周建国',
    idCard: '310104198011022134',
    phone: '13601928374',
    email: 'zhoujg@sjtu.edu.cn',
    university: '上海交通大学',
    institutionCode: '4131010248',
    majorOrDept: '电子信息与电气工程学院',
    teacherMajor: '信息工程',
    educationLevel: '硕士',
    studentOrStaffId: 'SJTU-00921',
    levelOrTitle: '硕士',
    submitChannel: '高校管理员人工审核 · 组委会核验',
    materialFileName: '上海交通大学校内选拔赛协调人委托公函.pdf',
    materialPreviewUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80',
    attachments: [
      {
        id: 'att-admin-3-1',
        name: '上海交通大学校内选拔赛协调人委托公函.pdf',
        size: '1.80 MB',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=80',
        fileType: 'pdf',
      },
    ],
    applicantNote: '申请上海交通大学校赛管理员。',
    submittedAt: '2026-10-26 11:00:00',
    reviewStatus: 'rejected',
    reviewedAt: '2026-10-26 15:10:00',
    reviewer: '秘书处管理员',
    reviewComment: '未上传加盖高校教务处或学院公章的赛事管理授权委托书，请重新提交材料。',
  },
];

interface AdminVerificationManagementProps {
  applicantType: 'student' | 'teacher' | 'univ_admin';
  records: VerificationApplicationRecord[];
  onChangeRecords: React.Dispatch<React.SetStateAction<VerificationApplicationRecord[]>>;
  institutions: InstitutionRecord[];
  reviewerName: string;
  lockedUniversity?: string;
  onApproveSyncUser?: (record: VerificationApplicationRecord) => void;
  onRejectSyncUser?: (record: VerificationApplicationRecord, reason: string) => void;
}

export const AdminVerificationManagement: React.FC<AdminVerificationManagementProps> = ({
  applicantType,
  records,
  onChangeRecords,
  institutions,
  reviewerName,
  lockedUniversity,
  onApproveSyncUser,
  onRejectSyncUser,
}) => {
  const isStudentMode = applicantType === 'student';
  const isUnivAdminMode = applicantType === 'univ_admin';

  // 筛选条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('');
  const [univDropdownOpen, setUnivDropdownOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | VerificationReviewStatus>('ALL');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // 查看材料与审核详情弹窗
  const [inspectingRecord, setInspectingRecord] = useState<VerificationApplicationRecord | null>(
    null
  );
  const [activeAttachmentIdx, setActiveAttachmentIdx] = useState(0);

  // 驳回原因填写弹窗
  const [rejectingRecord, setRejectingRecord] = useState<VerificationApplicationRecord | null>(
    null
  );
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 当前子菜单（学生或教师）下的全部记录（高校管理员视角下仅展示本校记录）
  const scopedRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          r.applicantType === applicantType &&
          (!lockedUniversity || r.university === lockedUniversity)
      ),
    [records, applicantType, lockedUniversity]
  );

  const stats = useMemo(() => {
    const pending = scopedRecords.filter((r) => r.reviewStatus === 'pending').length;
    const approved = scopedRecords.filter((r) => r.reviewStatus === 'approved').length;
    const rejected = scopedRecords.filter((r) => r.reviewStatus === 'rejected').length;
    return { total: scopedRecords.length, pending, approved, rejected };
  }, [scopedRecords]);

  const universityOptions = useMemo(() => {
    if (lockedUniversity) return [lockedUniversity];
    const set = new Set<string>(scopedRecords.map((r) => r.university));
    institutions.slice(0, 15).forEach((inst) => set.add(inst.name));
    return Array.from(set);
  }, [scopedRecords, institutions, lockedUniversity]);

  const matchedUniversityOptions = useMemo(() => {
    const kw = filterUniversity.trim().toLowerCase();
    if (!kw) return universityOptions;
    return universityOptions.filter((u) => u.toLowerCase().includes(kw));
  }, [universityOptions, filterUniversity]);

  // 解析学历：学生认证显示学生填报的学历（专科/本科/硕士/博士及以上），教师认证显示申报学历
  const resolveRecordTrainingLevel = (item: VerificationApplicationRecord): string => {
    const matchedInst = institutions.find(
      (inst) => inst.name === item.university || inst.code === item.institutionCode
    );
    if (isStudentMode) {
      if (['专科', '本科', '硕士', '博士及以上'].includes(item.levelOrTitle)) {
        return item.levelOrTitle;
      }
      if (item.levelOrTitle?.includes('博')) return '博士及以上';
      if (item.levelOrTitle?.includes('硕')) return '硕士';
      if (item.levelOrTitle?.includes('专')) return '专科';
      return item.levelOrTitle || item.educationLevel || matchedInst?.level || '本科';
    }
    return item.educationLevel || matchedInst?.level || '本科';
  };

  const filteredRecords = useMemo(() => {
    return scopedRecords.filter((item) => {
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        const matchName = item.realName.toLowerCase().includes(kw);
        const matchUser = item.username.toLowerCase().includes(kw);
        const matchPhone = item.phone.includes(kw);
        if (!matchName && !matchUser && !matchPhone) {
          return false;
        }
      }
      if (!lockedUniversity && filterUniversity.trim()) {
        const univKw = filterUniversity.trim().toLowerCase();
        if (!item.university.toLowerCase().includes(univKw)) {
          return false;
        }
      }
      if (filterStatus !== 'ALL' && item.reviewStatus !== filterStatus) {
        return false;
      }
      const submitDate = item.submittedAt.slice(0, 10);
      if (dateStart && submitDate < dateStart) return false;
      if (dateEnd && submitDate > dateEnd) return false;
      return true;
    });
  }, [
    scopedRecords,
    searchKeyword,
    filterUniversity,
    lockedUniversity,
    filterStatus,
    dateStart,
    dateEnd,
  ]);

  const handleOpenInspectModal = (rec: VerificationApplicationRecord) => {
    setInspectingRecord(rec);
    setActiveAttachmentIdx(0);
  };

  const handleDownloadAttachment = (att: VerificationAttachmentItem) => {
    const link = document.createElement('a');
    link.href = att.url;
    link.download = att.name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`已开始下载附件：${att.name}`);
  };

  const handleApproveRecord = (rec: VerificationApplicationRecord) => {
    const nowTime = '2026-10-28 15:20:00';

    const updatedRec: VerificationApplicationRecord = {
      ...rec,
      reviewStatus: 'approved',
      reviewedAt: nowTime,
      reviewer: reviewerName,
      reviewComment: undefined,
    };

    onChangeRecords((prev) => prev.map((item) => (item.id === rec.id ? updatedRec : item)));
    if (inspectingRecord?.id === rec.id) {
      setInspectingRecord(updatedRec);
    }
    if (onApproveSyncUser) {
      onApproveSyncUser(updatedRec);
    }
    triggerToast(
      `已审核通过【${rec.realName}（${rec.university}）】的${
        isStudentMode ? '学生认证' : isUnivAdminMode ? '高校管理员认证' : '指导教师资格认证'
      }，前台个人中心与管理权限已实时同步！`
    );
  };

  const handleOpenRejectModal = (rec: VerificationApplicationRecord) => {
    setRejectingRecord(rec);
    setRejectReasonInput(
      isStudentMode
        ? ''
        : isUnivAdminMode
        ? '未提供加盖高校官方教务处或院系公章的管理授权委托证明，请重新上传加盖公章文件。'
        : '上传的教师工作证/资格证照片模糊或缺少学校人事部门公章，请重新上传清晰原件照片。'
    );
    setRejectError(null);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRecord) return;
    if (!rejectReasonInput.trim()) {
      setRejectError(
        isStudentMode
          ? '必须填写驳回原因（如：“专业名称与本校不符”、“预计毕业时间有误”），该原因将展示在前台用户的“用户认证”页面'
          : isUnivAdminMode
          ? '请填写具体的驳回原因，该原因将实时展示在前台老师的“高校管理员认证”栏目中'
          : '请填写具体的驳回原因，以便前台申请人对照修改并重新提交材料'
      );
      return;
    }

    const nowTime = '2026-10-28 15:25:00';
    const reason = rejectReasonInput.trim();
    const updatedRec: VerificationApplicationRecord = {
      ...rejectingRecord,
      reviewStatus: 'rejected',
      reviewedAt: nowTime,
      reviewer: reviewerName,
      reviewComment: reason,
    };

    onChangeRecords((prev) =>
      prev.map((item) => (item.id === rejectingRecord.id ? updatedRec : item))
    );
    if (inspectingRecord?.id === rejectingRecord.id) {
      setInspectingRecord(updatedRec);
    }
    if (onRejectSyncUser) {
      onRejectSyncUser(updatedRec, reason);
    }
    triggerToast(
      `已驳回【${rejectingRecord.realName}】的${
        isStudentMode ? '学生认证' : isUnivAdminMode ? '高校管理员认证' : '教师认证'
      }申请，驳回原因已同步推送至申请人个人中心！`
    );
    setRejectingRecord(null);
  };

  const inspectingAttachments: VerificationAttachmentItem[] = useMemo(() => {
    if (!inspectingRecord) return [];
    if (inspectingRecord.attachments && inspectingRecord.attachments.length > 0) {
      return inspectingRecord.attachments;
    }
    if (inspectingRecord.materialPreviewUrl) {
      return [
        {
          id: 'att-fallback-1',
          name: inspectingRecord.materialFileName || '认证证明材料_1.pdf',
          size: '1.20 MB',
          url: inspectingRecord.materialPreviewUrl,
        },
      ];
    }
    return [];
  }, [inspectingRecord]);

  const activeAttachment =
    inspectingAttachments[activeAttachmentIdx] || inspectingAttachments[0] || null;

  return (
    <div className="space-y-5">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 搜索筛选栏（5 列网格） */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            申请人检索（姓名/用户名/手机号）
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索姓名、用户名、手机号..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-slate-600 mb-1">
            所属院校{lockedUniversity ? '（本校锁定）' : '（输入查询）'}
          </label>
          {lockedUniversity ? (
            <div className="w-full px-3 py-2 bg-sky-50/70 border border-sky-200 rounded-lg text-xs font-bold text-[#0284C7] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{lockedUniversity}</span>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={filterUniversity}
                  onFocus={() => setUnivDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setUnivDropdownOpen(false), 180)}
                  onChange={(e) => {
                    setFilterUniversity(e.target.value);
                    setUnivDropdownOpen(true);
                  }}
                  placeholder="输入院校名称查询..."
                  className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0284C7]"
                />
                {filterUniversity && (
                  <button
                    type="button"
                    onClick={() => setFilterUniversity('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="清空院校筛选"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {univDropdownOpen && matchedUniversityOptions.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg py-1 text-xs">
                  <button
                    type="button"
                    onMouseDown={() => {
                      setFilterUniversity('');
                      setUnivDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-sky-50 text-slate-500 font-semibold cursor-pointer"
                  >
                    全部申报高校
                  </button>
                  {matchedUniversityOptions.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onMouseDown={() => {
                        setFilterUniversity(u);
                        setUnivDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-sky-50 cursor-pointer ${
                        filterUniversity === u
                          ? 'bg-sky-50 text-[#0284C7] font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">审核状态</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'ALL' | VerificationReviewStatus)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
          >
            <option value="ALL">全部审核状态 ({stats.total})</option>
            <option value="pending">待审核 ({stats.pending})</option>
            <option value="approved">已通过 ({stats.approved})</option>
            <option value="rejected">已驳回 ({stats.rejected})</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">提交开始日期</label>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">提交结束日期</label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0284C7]"
          />
        </div>
      </div>

      {/* 数据列表表格 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          {isStudentMode ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">姓名</th>
                  <th className="py-3.5 px-3">手机号</th>
                  <th className="py-3.5 px-3">所属院校</th>
                  <th className="py-3.5 px-3">学历 / 专业</th>
                  <th className="py-3.5 px-3">入学时间 - 毕业时间</th>
                  <th className="py-3.5 px-3 text-center">审核状态</th>
                  <th className="py-3.5 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      当前筛选条件下暂无学生认证申请记录
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => {
                    const trainingLevel = resolveRecordTrainingLevel(item);
                    const enrollRange = `${item.enrollmentDate || '2024-09'} - ${
                      item.graduationDate || '2028-06'
                    }`;

                    return (
                      <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                        {/* 1. 姓名 */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {item.realName}
                        </td>

                        {/* 2. 手机号 */}
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-700 font-bold whitespace-nowrap">
                          {item.phone}
                        </td>

                        {/* 3. 所属院校 */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                            <span>{item.university}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            院校代码：{item.institutionCode}
                          </div>
                        </td>

                        {/* 4. 学历、专业 */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-[#0284C7] border border-sky-200 shrink-0">
                              {trainingLevel}
                            </span>
                            <span className="font-bold text-slate-800">{item.majorOrDept}</span>
                          </div>
                        </td>

                        {/* 5. 入学时间 - 毕业时间 */}
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-700 font-bold whitespace-nowrap">
                          {enrollRange}
                        </td>

                        {/* 6. 审核状态（不展示审核意见/驳回原因） */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              item.reviewStatus === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : item.reviewStatus === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}
                          >
                            {item.reviewStatus === 'approved'
                              ? '已通过'
                              : item.reviewStatus === 'pending'
                              ? '审核中'
                              : '已驳回'}
                          </span>
                        </td>

                        {/* 7. 操作：【通过】/【驳回】 + 查看详情 */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {item.reviewStatus !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApproveRecord(item)}
                                className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
                              >
                                通过
                              </button>
                            )}
                            {item.reviewStatus !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(item)}
                                className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                              >
                                驳回
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenInspectModal(item)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              查看详情
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : isUnivAdminMode ? (
            /* 高校管理员认证专属表格：学校、姓名、手机号、学历、申请时间、审核状态、审核人、审核时间、操作 */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">申请高校</th>
                  <th className="py-3.5 px-3">姓名</th>
                  <th className="py-3.5 px-3">手机号</th>
                  <th className="py-3.5 px-3">学历</th>
                  <th className="py-3.5 px-3">申请时间</th>
                  <th className="py-3.5 px-3 text-center">审核状态</th>
                  <th className="py-3.5 px-3">审核人</th>
                  <th className="py-3.5 px-3">审核时间</th>
                  <th className="py-3.5 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                      当前筛选条件下暂无高校管理员认证申请记录
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => {
                    const trainingLevel =
                      item.educationLevel || resolveRecordTrainingLevel(item);
                    return (
                      <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                        {/* 1. 申请高校 */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                            <span>{item.university}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            代码：{item.institutionCode} · {item.majorOrDept}
                          </div>
                        </td>

                        {/* 2. 姓名 */}
                        <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {item.realName}
                        </td>

                        {/* 3. 手机号 */}
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-700 font-bold whitespace-nowrap">
                          {item.phone}
                        </td>

                        {/* 4. 学历 */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-[#0284C7] border border-sky-200">
                            {trainingLevel}
                          </span>
                        </td>

                        {/* 5. 申请时间 */}
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                          {item.submittedAt}
                        </td>

                        {/* 6. 审核状态（不展示审核意见/驳回原因） */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              item.reviewStatus === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : item.reviewStatus === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}
                          >
                            {item.reviewStatus === 'approved'
                              ? '已通过'
                              : item.reviewStatus === 'pending'
                              ? '待审核'
                              : '已驳回'}
                          </span>
                        </td>

                        {/* 7. 审核人 */}
                        <td className="py-3.5 px-3 text-xs text-slate-700 whitespace-nowrap">
                          {item.reviewer || '—'}
                        </td>

                        {/* 8. 审核时间 */}
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                          {item.reviewedAt || '—'}
                        </td>

                        {/* 9. 操作栏：查看详情、通过、驳回 */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenInspectModal(item)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              查看详情
                            </button>
                            {item.reviewStatus !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApproveRecord(item)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
                              >
                                通过
                              </button>
                            )}
                            {item.reviewStatus !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(item)}
                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                              >
                                驳回
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
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">姓名</th>
                  <th className="py-3.5 px-3">手机号</th>
                  <th className="py-3.5 px-3">申报院校 / 院系部门 / 专业</th>
                  <th className="py-3.5 px-3">学历</th>
                  <th className="py-3.5 px-3 text-center">审核状态</th>
                  <th className="py-3.5 px-3">提交时间</th>
                  <th className="py-3.5 px-3">审核时间</th>
                  <th className="py-3.5 px-3">审核人</th>
                  <th className="py-3.5 px-4 text-right">人工审核操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                      当前筛选条件下暂无指导教师人工认证申请记录
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => {
                    const trainingLevel =
                      item.educationLevel || resolveRecordTrainingLevel(item);
                    return (
                      <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                        {/* 1. 姓名 */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {item.realName}
                        </td>

                        {/* 2. 手机号 */}
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-700 font-bold whitespace-nowrap">
                          {item.phone}
                        </td>

                        {/* 3. 申报院校 / 院系部门 / 专业 */}
                        <td className="py-3.5 px-3 max-w-xs">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                            <span className="truncate">{item.university}</span>
                          </div>
                          <div className="text-[11px] text-slate-700 font-semibold mt-0.5 truncate">
                            院系：{item.majorOrDept}
                          </div>
                          <div className="text-[11px] text-[#0369A1] font-semibold mt-0.5 truncate">
                            专业：{item.teacherMajor || '网络空间安全'}
                          </div>
                        </td>

                        {/* 4. 学历 */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-[#0284C7] border border-sky-200">
                            {trainingLevel}
                          </span>
                        </td>

                        {/* 5. 审核状态（不展示审核意见/驳回原因） */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              item.reviewStatus === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : item.reviewStatus === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}
                          >
                            {item.reviewStatus === 'approved'
                              ? '已通过'
                              : item.reviewStatus === 'pending'
                              ? '待审核'
                              : '已驳回'}
                          </span>
                        </td>

                        {/* 6. 提交时间 */}
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                          {item.submittedAt}
                        </td>

                        {/* 7. 审核时间 */}
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                          {item.reviewedAt || '—'}
                        </td>

                        {/* 8. 审核人 */}
                        <td className="py-3.5 px-3 text-xs text-slate-700 whitespace-nowrap">
                          {item.reviewer || '—'}
                        </td>

                        {/* 9. 人工审核操作 */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenInspectModal(item)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              查看详情
                            </button>
                            {item.reviewStatus !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApproveRecord(item)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
                              >
                                通过
                              </button>
                            )}
                            {item.reviewStatus !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(item)}
                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                              >
                                驳回
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
          )}
        </div>
      </div>

      {/* 弹窗 1：查看认证申请详情弹窗 */}
      {inspectingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs text-[#0284C7] font-bold">
                  {inspectingRecord.applicantType === 'student'
                    ? '学生认证核验详情单（高校管理员端）'
                    : inspectingRecord.applicantType === 'univ_admin'
                    ? '高校管理员资质认证核验单（组委会/秘书处端）'
                    : '高校指导教师资格人工认证核验单'}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  申请人：{inspectingRecord.realName}（{inspectingRecord.university} · {
                    inspectingRecord.applicantType === 'univ_admin'
                      ? '高校管理员认证'
                      : inspectingRecord.applicantType === 'student'
                      ? '学生认证'
                      : '教师认证'
                  }）
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* 左侧：申报核心字段明细（含手机号、邮箱、身份证号等全部完整信息） */}
              <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="text-slate-800 font-extrabold pb-2 border-b border-slate-200">
                  一、{inspectingRecord.applicantType === 'student' ? '学生认证完整信息' : inspectingRecord.applicantType === 'univ_admin' ? '高校管理员申请完整信息' : '实名与院校申报完整信息'}
                </div>
                {inspectingRecord.applicantType === 'student' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block">真实姓名</span>
                      <span className="text-emerald-600 font-bold">
                        {inspectingRecord.realName} ✓
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">居民身份证号</span>
                      <span className="text-slate-800 font-mono font-bold">
                        {inspectingRecord.idCard}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">绑定手机号</span>
                      <span className="text-slate-800 font-mono font-bold">
                        {inspectingRecord.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">电子邮箱</span>
                      <span className="text-slate-800 font-mono font-bold truncate block">
                        {inspectingRecord.email}
                      </span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block">所属院校</span>
                      <span className="text-slate-900 font-extrabold text-sm">
                        {inspectingRecord.university}（院校代码：{inspectingRecord.institutionCode}）
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">学历</span>
                      <span className="text-[#0284C7] font-bold">
                        {resolveRecordTrainingLevel(inspectingRecord)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">专业</span>
                      <span className="text-slate-800 font-bold">
                        {inspectingRecord.majorOrDept}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">学号</span>
                      <span className="text-slate-800 font-mono font-bold">
                        {inspectingRecord.studentOrStaffId}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">申请人账号</span>
                      <span className="text-slate-800 font-mono font-bold">
                        {inspectingRecord.username}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">入学时间 - 毕业时间（预计）</span>
                      <span className="text-slate-900 font-mono font-bold">
                        {inspectingRecord.enrollmentDate || '2024-09'} -{' '}
                        {inspectingRecord.graduationDate || '2028-06'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block">真实姓名</span>
                      <span className="text-emerald-600 font-bold">
                        {inspectingRecord.realName} ✓
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">居民身份证号</span>
                      <span className="text-slate-800 font-mono font-bold">{inspectingRecord.idCard}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">绑定手机号</span>
                      <span className="text-slate-800 font-mono font-bold">{inspectingRecord.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">电子邮箱</span>
                      <span className="text-slate-800 font-mono font-bold truncate block">
                        {inspectingRecord.email}
                      </span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block">申报高等院校（含教育部10位标识码）</span>
                      <span className="text-slate-900 font-extrabold text-sm">
                        {inspectingRecord.university}（{inspectingRecord.institutionCode}）
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">所属院系/部门</span>
                      <span className="text-slate-800 font-bold">
                        {inspectingRecord.majorOrDept}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">专业</span>
                      <span className="text-slate-800 font-bold">
                        {inspectingRecord.teacherMajor || '网络空间安全'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">学历</span>
                      <span className="text-[#0284C7] font-bold">
                        {inspectingRecord.educationLevel ||
                          resolveRecordTrainingLevel(inspectingRecord)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">教师教工号</span>
                      <span className="text-[#0284C7] font-mono font-bold">
                        {inspectingRecord.studentOrStaffId}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">申请人账号</span>
                      <span className="text-slate-900 font-mono font-bold">
                        {inspectingRecord.username}
                      </span>
                    </div>
                    {inspectingRecord.applicantType === 'univ_admin' &&
                      inspectingRecord.applicantNote && (
                        <div className="col-span-2">
                          <span className="text-slate-400 block">申请备注</span>
                          <span className="text-slate-700">
                            {inspectingRecord.applicantNote}
                          </span>
                        </div>
                      )}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">当前审核状态：</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        inspectingRecord.reviewStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : inspectingRecord.reviewStatus === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      {inspectingRecord.reviewStatus === 'approved'
                        ? '已通过'
                        : inspectingRecord.reviewStatus === 'pending'
                        ? '审核中'
                        : '已驳回'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    提交时间：{inspectingRecord.submittedAt}
                  </div>
                  {inspectingRecord.reviewedAt && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      审核时间：{inspectingRecord.reviewedAt}（审核人：{inspectingRecord.reviewer || '—'}）
                    </div>
                  )}
                  {inspectingRecord.reviewStatus === 'rejected' && inspectingRecord.reviewComment && (
                    <div className="text-slate-700 pt-1.5 border-t border-slate-100">
                      <span className="text-red-500 font-bold">驳回原因：</span>
                      {inspectingRecord.reviewComment}
                    </div>
                  )}
                </div>
              </div>

              {/* 右侧：身份辅助证明（选填）或教师认证材料 */}
              <div className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 text-xs">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <span className="text-slate-800 font-extrabold">
                      二、
                      {inspectingRecord.applicantType === 'student'
                        ? `身份辅助证明（选填，共 ${inspectingAttachments.length} 份）`
                        : `提交的认证证明材料（共 ${inspectingAttachments.length} 份附件）`}
                    </span>
                    <span className="text-[#0284C7] font-mono font-bold">
                      {inspectingRecord.submitChannel}
                    </span>
                  </div>

                  {inspectingAttachments.length === 0 ? (
                    <div className="h-64 rounded-xl border border-dashed border-slate-200 bg-white flex flex-col items-center justify-center p-6 text-center space-y-2">
                      <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                      <div className="text-sm font-bold text-slate-800">
                        申请人未上传选填身份辅助证明
                      </div>
                      <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                        学生认证默认免除必传附件，高校管理员直接根据左侧【姓名、身份证号、所属院校、学历、专业、入学时间-毕业时间】完成比对审核即可。
                      </p>
                    </div>
                  ) : (
                    <>
                      {activeAttachment && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                          {/\.(jpg|jpeg|png|webp|gif)$/i.test(activeAttachment.name) ||
                          activeAttachment.url.startsWith('data:image/') ||
                          activeAttachment.url.includes('images.unsplash.com') ? (
                            <img
                              src={activeAttachment.url}
                              alt={activeAttachment.name}
                              className="w-full h-56 object-cover bg-slate-100"
                            />
                          ) : (
                            <div className="h-56 flex flex-col items-center justify-center bg-slate-100/80 p-6 text-center space-y-2">
                              <FileText className="w-10 h-10 text-[#0284C7]" />
                              <div className="text-sm font-bold text-slate-800">
                                {activeAttachment.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                文件大小：{activeAttachment.size} · 支持点击下方【下载】按钮保存原件核验
                              </div>
                            </div>
                          )}
                          <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="text-slate-800 font-bold truncate block">
                                当前预览：{activeAttachment.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                大小：{activeAttachment.size}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadAttachment(activeAttachment)}
                              className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>下载当前材料</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>附件材料列表（点击可切换预览或直接下载）：</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {inspectingAttachments.map((att, idx) => {
                            const isSelected = idx === activeAttachmentIdx;
                            return (
                              <div
                                key={att.id || idx}
                                onClick={() => setActiveAttachmentIdx(idx)}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-sky-50/90 border-[#0284C7] shadow-2xs'
                                    : 'bg-white hover:bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <span className="w-5 h-5 rounded-md bg-sky-100 text-[#0284C7] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <FileText className="w-4 h-4 text-[#0284C7] shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-slate-800 truncate">
                                      {att.name}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono">
                                      {att.size || '1.0 MB'}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveAttachmentIdx(idx);
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#0284C7] text-white'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>{isSelected ? '预览中' : '预览'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadAttachment(att);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-[#0284C7] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>下载</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                提示：点击【通过】或【驳回】后，结果将立即同步至前台【个人中心 - 用户认证】。
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setInspectingRecord(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  关闭窗口
                </button>
                {inspectingRecord.reviewStatus !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleOpenRejectModal(inspectingRecord)}
                    className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold cursor-pointer"
                  >
                    驳回
                  </button>
                )}
                {inspectingRecord.reviewStatus !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleApproveRecord(inspectingRecord)}
                    className="px-5 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    通过
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 2：驳回原因填写弹窗（必填驳回原因） */}
      {rejectingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleConfirmReject}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                驳回{isStudentMode ? '学生认证' : isUnivAdminMode ? '高校管理员认证' : '指导教师认证'}申请
              </h3>
              <button
                type="button"
                onClick={() => setRejectingRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              正在驳回申请人 <span className="text-slate-900 font-bold">{rejectingRecord.realName}</span>（
              {rejectingRecord.university}）的认证申请。管理员点击【驳回】必须填写驳回原因，该原因会展示在前台用户的“用户认证”页面，用户可根据原因修改后重新提交。
            </p>

            {isStudentMode && (
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-slate-500">
                  常用驳回原因快捷填入：
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '专业名称与本校不符',
                    '预计毕业时间有误',
                    '学历层次与本校学籍记录不符',
                    '入学时间填写有误',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setRejectReasonInput(preset);
                        setRejectError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rejectError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-bold">
                {rejectError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                驳回原因说明 <span className="text-red-500">*</span>（必填，展示在前台“用户认证”页）
              </label>
              <textarea
                rows={3}
                value={rejectReasonInput}
                onChange={(e) => {
                  setRejectReasonInput(e.target.value);
                  if (e.target.value.trim()) setRejectError(null);
                }}
                placeholder={
                  isStudentMode
                    ? '例如：专业名称与本校不符 / 预计毕业时间有误...'
                    : '请输入具体的材料问题或驳回原因...'
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRecord(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                确认驳回并通知用户
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 七、前台【赛事新闻】列表页 + 【赛事新闻详情】独立二级页面（与首页、赛事目录一致的浅色风格）
// ============================================================================

interface FrontendNewsPageProps {
  newsList: ManagedNewsItem[];
  onSelectNews: (newsId: string) => void;
}

export const FrontendNewsPage: React.FC<FrontendNewsPageProps> = ({
  newsList,
  onSelectNews
}) => {
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // 每页10-15条

  // 只展示已发布的新闻，置顶排在最前，其余按发布时间倒序
  const publishedSortedNews = useMemo(() => {
    const published = newsList.filter((n) => n.publishStatus === 'published');
    return [...published].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.publishTime.localeCompare(a.publishTime);
    });
  }, [newsList]);

  const filteredNews = useMemo(() => {
    return publishedSortedNews.filter((item) => {
      if (
        keyword.trim() &&
        !item.title.toLowerCase().includes(keyword.trim().toLowerCase()) &&
        !item.summary.toLowerCase().includes(keyword.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [publishedSortedNews, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / pageSize));
  const paginatedNews = filteredNews.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-12 flex-1 w-full">
      {/* 页面头部与检索栏（精简后仅保留标题与右侧搜索框） */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              赛事新闻
            </h1>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜索新闻标题或摘要内容"
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:border-[#0284C7] focus:outline-none text-slate-900 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 图文列表：每条新闻均有封面（默认显示“赛事新闻”封面）、标题、摘要、来源、发布时间 */}
      {paginatedNews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="text-base font-bold text-slate-800">未检索到匹配的赛事新闻</div>
          <p className="text-xs text-slate-500">
            请尝试更换搜索关键词。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedNews.map((item) => (
            <article
              key={item.id}
              onClick={() => {
                onSelectNews(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#0284C7] shadow-2xs hover:shadow-lg transition-all duration-200 overflow-hidden p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer"
            >
              {/* 16:9 封面缩略图（始终显示封面，未设置时使用“赛事新闻”默认封面） */}
              <div className="w-full sm:w-64 lg:w-72 aspect-video rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shrink-0 relative">
                <img
                  src={item.coverImage || DEFAULT_NEWS_COVER_SVG}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.embeddedVideo && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-white text-[11px] flex items-center gap-1">
                    <Video className="w-3 h-3 text-sky-400" /> 含视频
                  </div>
                )}
              </div>

              {/* 右侧文字区 */}
              <div className="flex-1 min-w-0 space-y-2.5 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Pin className="w-3 h-3" /> 置顶
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono-num">
                    浏览 {item.viewsCount} 次
                  </span>
                </div>

                {/* 新闻标题（较醒目字号，最多两行，超出省略） */}
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h2>

                {/* 摘要/简介（标题下方灰色小字，超出省略） */}
                {item.summary && (
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                )}

                {/* 底部元信息：来源 + 发布时间 YYYY-MM-DD + 查看详情引导 */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-4">
                    <span>来源：{item.source}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="font-mono-num">
                      发布日期：{item.publishTime.slice(0, 10)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#0284C7] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    <span>进入新闻详情</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 底部分页组件（每页10-15条） */}
      <div className="mt-8 bg-white border border-slate-200/90 rounded-xl px-6 py-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-600">
        <div>
          共 <span className="text-slate-900 font-bold font-mono-num">{filteredNews.length}</span> 条新闻资讯 · 每页展示{' '}
          <span className="text-slate-900 font-mono-num font-semibold">{pageSize}</span> 条
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-[#0284C7] hover:border-sky-200 disabled:opacity-40 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="px-3 font-mono-num text-slate-700 font-semibold">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-[#0284C7] hover:border-sky-200 disabled:opacity-40 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </main>
  );
};

// ============================================================================
// 七（续）、前台【赛事新闻详情】独立二级页面（非弹窗，浅色风格）
// ============================================================================

interface FrontendNewsDetailPageProps {
  newsList: ManagedNewsItem[];
  selectedNewsId: string;
  onSelectNews: (newsId: string) => void;
  onBackToList: () => void;
  onBackHome?: () => void;
}

export const FrontendNewsDetailPage: React.FC<FrontendNewsDetailPageProps> = ({
  newsList,
  selectedNewsId,
  onSelectNews,
  onBackToList,
  onBackHome
}) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const publishedSortedNews = useMemo(() => {
    const published = newsList.filter((n) => n.publishStatus === 'published');
    return [...published].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.publishTime.localeCompare(a.publishTime);
    });
  }, [newsList]);

  const currentDetailIndex = useMemo(
    () => publishedSortedNews.findIndex((n) => n.id === selectedNewsId),
    [publishedSortedNews, selectedNewsId]
  );

  const currentDetailItem =
    currentDetailIndex >= 0
      ? publishedSortedNews[currentDetailIndex]
      : newsList.find((n) => n.id === selectedNewsId) || publishedSortedNews[0] || null;

  const prevNewsItem = currentDetailIndex > 0 ? publishedSortedNews[currentDetailIndex - 1] : null;
  const nextNewsItem =
    currentDetailIndex >= 0 && currentDetailIndex < publishedSortedNews.length - 1
      ? publishedSortedNews[currentDetailIndex + 1]
      : null;

  const recommendedNews = useMemo(() => {
    if (!currentDetailItem) return [];
    return publishedSortedNews.filter((n) => n.id !== currentDetailItem.id).slice(0, 5);
  }, [publishedSortedNews, currentDetailItem]);

  if (!currentDetailItem) {
    return (
      <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 flex-1 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="text-base font-bold text-slate-800">未找到该篇赛事新闻</div>
          <button
            type="button"
            onClick={onBackToList}
            className="px-5 py-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
          >
            返回赛事新闻列表
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 flex-1 w-full space-y-8">
      {/* 顶部返回与面包屑导航栏（与赛事详情二级页面保持一致） */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToList}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0284C7] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回赛事新闻列表</span>
        </button>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
          {onBackHome && (
            <>
              <button
                type="button"
                onClick={onBackHome}
                className="hover:text-[#0284C7] transition-colors cursor-pointer"
              >
                首页
              </button>
              <span>&rsaquo;</span>
            </>
          )}
          <button
            type="button"
            onClick={onBackToList}
            className="hover:text-[#0284C7] transition-colors cursor-pointer"
          >
            赛事新闻
          </button>
          <span>&rsaquo;</span>
          <span className="text-slate-700 font-medium truncate max-w-xs sm:max-w-md">
            {currentDetailItem.title}
          </span>
        </div>
      </div>

      {/* 主体两栏布局：左栏新闻正文详情（占8列），右栏最新/置顶资讯推荐（占4列） */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
        {/* 左栏：新闻详情主体 */}
        <article className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 xl:p-10">
          {/* 顶部信息：大字号加粗标题、来源、发布时间、字号切换 */}
          <header className="pb-6 mb-8 border-b border-slate-200">
            {currentDetailItem.isPinned && (
              <div className="flex flex-wrap items-center gap-2 mb-3.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Pin className="w-3 h-3" /> 置顶
                </span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
              {currentDetailItem.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span>来源：<strong className="text-slate-700 font-semibold">{currentDetailItem.source}</strong></span>
                <span className="font-mono-num">
                  发布时间：{currentDetailItem.publishTime.slice(0, 10)}
                </span>
                <span className="font-mono-num">浏览量：{currentDetailItem.viewsCount} 次</span>
              </div>

              {/* 正文字号调节器 */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <span className="text-slate-400 px-1.5">字号：</span>
                {(
                  [
                    { key: 'sm', label: '小' },
                    { key: 'base', label: '标准' },
                    { key: 'lg', label: '大' }
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFontSize(opt.key)}
                    className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                      fontSize === opt.key
                        ? 'bg-[#0284C7] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* 摘要导读框 */}
          {currentDetailItem.summary && (
            <div className="mb-8 p-4 sm:p-5 rounded-xl bg-sky-50/70 border-l-4 border-[#0284C7] text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-[#0369A1] mr-2">【核心导读】</span>
              {currentDetailItem.summary}
            </div>
          )}

          {/* 内嵌视频（满足指标3视频展示要求） */}
          {currentDetailItem.embeddedVideo && (
            <div className="mb-8 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xs">
              <video
                controls
                poster={currentDetailItem.embeddedVideo.poster}
                className="w-full max-h-[500px] bg-black"
              >
                <source src={currentDetailItem.embeddedVideo.url} type="video/mp4" />
                您的浏览器不支持 HTML5 视频播放。
              </video>
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <span className="font-semibold flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#0284C7]" />
                  {currentDetailItem.embeddedVideo.title}
                </span>
                <span className="font-mono-num text-slate-500">
                  时长：{currentDetailItem.embeddedVideo.duration}
                </span>
              </div>
            </div>
          )}

          {/* 富文本正文渲染区 */}
          <div
            className={`space-y-4 text-slate-700 leading-relaxed ${
              fontSize === 'sm'
                ? 'text-xs sm:text-sm'
                : fontSize === 'lg'
                ? 'text-base sm:text-lg'
                : 'text-sm sm:text-base'
            }`}
          >
            {currentDetailItem.content.split('\n\n').map((para, idx) => {
              const trimmed = para.trim();
              if (trimmed.startsWith('### ')) {
                return (
                  <h3
                    key={idx}
                    className="text-lg font-bold text-slate-900 pt-4 pb-1 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-4 rounded-full bg-[#0284C7] shrink-0" />
                    <span>{trimmed.replace('### ', '')}</span>
                  </h3>
                );
              }
              return (
                <p key={idx} className="text-slate-700 leading-8 whitespace-pre-line">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* 正文内嵌多张图片展示（指标3图文混排） */}
          {currentDetailItem.embeddedImages && currentDetailItem.embeddedImages.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentDetailItem.embeddedImages.map((img, i) => (
                <figure
                  key={i}
                  className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
                >
                  <img src={img.url} alt={img.caption} className="w-full h-60 object-cover" />
                  <figcaption className="px-4 py-2.5 text-xs text-slate-500 text-center border-t border-slate-200/80">
                    {img.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          {/* 底部导航：上一篇 / 下一篇切换 + 返回列表按钮 */}
          <footer className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {prevNewsItem ? (
                <button
                  type="button"
                  onClick={() => {
                    onSelectNews(prevNewsItem.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer group"
                >
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <ChevronLeft className="w-3.5 h-3.5 text-[#0284C7]" /> 上一篇
                  </div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-[#0284C7] line-clamp-1 mt-1">
                    {prevNewsItem.title}
                  </div>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 text-xs text-slate-400">
                  上一篇：已是第一篇
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onBackToList}
              className="px-5 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-bold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              返回新闻列表
            </button>

            <div className="flex-1 min-w-0">
              {nextNewsItem ? (
                <button
                  type="button"
                  onClick={() => {
                    onSelectNews(nextNewsItem.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-right p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer group"
                >
                  <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                    下一篇 <ChevronRight className="w-3.5 h-3.5 text-[#0284C7]" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-[#0284C7] line-clamp-1 mt-1">
                    {nextNewsItem.title}
                  </div>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 text-xs text-slate-400 text-right">
                  下一篇：已是最后一篇
                </div>
              )}
            </div>
          </footer>
        </article>

        {/* 右栏：热点与相关新闻推荐（占 4 列） */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">最新资讯与公告推荐</h2>
              </div>
              <button
                type="button"
                onClick={onBackToList}
                className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
              >
                全部 &rsaquo;
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recommendedNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectNews(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="py-3.5 first:pt-0 last:pb-0 group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {item.isPinned && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        置顶
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono-num ml-auto">
                      {item.publishTime.slice(0, 10)}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#0284C7] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

// ============================================================================
// 八、前台【赛事动态】列表页 + 【赛事动态详情】独立二级页面（与首页、赛事目录一致的浅色风格）
// ============================================================================

interface FrontendMomentsPageProps {
  momentsList: ManagedMomentItem[];
  onSelectMoment: (momentId: string) => void;
}

export const FrontendMomentsPage: React.FC<FrontendMomentsPageProps> = ({
  momentsList,
  onSelectMoment
}) => {
  const [keyword, setKeyword] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  const publishedMoments = useMemo(() => {
    const pub = momentsList.filter((m) => m.publishStatus === 'published');
    return [...pub].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.publishTime.localeCompare(a.publishTime);
    });
  }, [momentsList]);

  const filteredMoments = useMemo(() => {
    return publishedMoments.filter((item) => {
      if (
        keyword.trim() &&
        !item.title.toLowerCase().includes(keyword.trim().toLowerCase()) &&
        !item.summary.toLowerCase().includes(keyword.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [publishedMoments, keyword]);

  const displayedMoments = filteredMoments.slice(0, visibleCount);

  return (
    <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-12 flex-1 w-full">
      {/* 页面头部（仅保留标题与搜索框，删除类型筛选） */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              赛事动态
            </h1>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索动态标题或摘要内容..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:border-[#0284C7] focus:outline-none text-slate-900 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 卡片网格：图文卡片 + 视频卡片混排（浅色风格） */}
      {displayedMoments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="text-base font-bold text-slate-800">暂无符合筛选条件的赛事动态</div>
          <p className="text-xs text-slate-500">
            请尝试切换栏目分类或清空搜索关键词。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedMoments.map((item) => (
            <article
              key={item.id}
              onClick={() => {
                onSelectMoment(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#0284C7] shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* 上方封面图区域 */}
                <div className="relative aspect-video overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {item.isPinned && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-amber-500 text-white text-xs font-bold shadow-xs">
                      置顶
                    </span>
                  )}

                  {/* 视频卡片：居中叠加播放按钮图标，右下角标注视频时长 */}
                  {item.mediaType === 'video' && (
                    <>
                      <div className="absolute inset-0 bg-slate-950/25 group-hover:bg-slate-950/15 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/95 group-hover:bg-[#0284C7] text-[#0284C7] group-hover:text-white shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-950/80 text-white font-mono-num text-[11px]">
                        {item.videoDuration || '04:15'}
                      </span>
                    </>
                  )}
                </div>

                {/* 下方标题与简介（最多两行） */}
                <div className="p-5">
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 leading-snug mb-2">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>

              {/* 底部：分类标签 + 媒体类型 + 发布时间 */}
              <div className="px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-[#0284C7]">
                  {item.category} · {item.mediaType === 'video' ? '视频播报' : '图文报道'}
                </span>
                <span className="font-mono-num text-slate-400">{item.publishTime.slice(0, 10)}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 底部“加载更多”与分页统计 */}
      <div className="mt-10 text-center space-y-3">
        {visibleCount < filteredMoments.length ? (
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + 4)}
            className="px-8 py-3 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0284C7] shadow-2xs transition-colors cursor-pointer"
          >
            加载更多动态（剩余 {filteredMoments.length - visibleCount} 条）
          </button>
        ) : (
          <div className="text-xs text-slate-400">
            已展示全部 {filteredMoments.length} 条赛事动态
          </div>
        )}
      </div>
    </main>
  );
};

// ============================================================================
// 八（续）、前台【赛事动态详情】独立二级页面（非弹窗，浅色风格）
// ============================================================================

interface FrontendMomentDetailPageProps {
  momentsList: ManagedMomentItem[];
  selectedMomentId: string;
  onSelectMoment: (momentId: string) => void;
  onBackToList: () => void;
  onBackHome?: () => void;
}

export const FrontendMomentDetailPage: React.FC<FrontendMomentDetailPageProps> = ({
  momentsList,
  selectedMomentId,
  onSelectMoment,
  onBackToList,
  onBackHome
}) => {
  const [autoPlayMuted, setAutoPlayMuted] = useState(true);

  const publishedMoments = useMemo(() => {
    const pub = momentsList.filter((m) => m.publishStatus === 'published');
    return [...pub].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.publishTime.localeCompare(a.publishTime);
    });
  }, [momentsList]);

  const currentIndex = useMemo(
    () => publishedMoments.findIndex((m) => m.id === selectedMomentId),
    [publishedMoments, selectedMomentId]
  );

  const currentMoment =
    currentIndex >= 0
      ? publishedMoments[currentIndex]
      : momentsList.find((m) => m.id === selectedMomentId) || publishedMoments[0] || null;

  const prevMoment = currentIndex > 0 ? publishedMoments[currentIndex - 1] : null;
  const nextMoment =
    currentIndex >= 0 && currentIndex < publishedMoments.length - 1
      ? publishedMoments[currentIndex + 1]
      : null;

  // 相关推荐（同分类的其他动态，若不足则补充其他已发布动态）
  const relatedMoments = useMemo(() => {
    if (!currentMoment) return [];
    const sameCat = publishedMoments.filter(
      (m) => m.id !== currentMoment.id && m.category === currentMoment.category
    );
    if (sameCat.length >= 3) return sameCat.slice(0, 4);
    const others = publishedMoments.filter(
      (m) => m.id !== currentMoment.id && m.category !== currentMoment.category
    );
    return [...sameCat, ...others].slice(0, 4);
  }, [publishedMoments, currentMoment]);

  if (!currentMoment) {
    return (
      <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 flex-1 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="text-base font-bold text-slate-800">未找到该条赛事动态</div>
          <button
            type="button"
            onClick={onBackToList}
            className="px-5 py-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
          >
            返回赛事动态列表
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 flex-1 w-full space-y-8">
      {/* 顶部返回与面包屑导航栏（与赛事详情页一致的浅色二级页面导航） */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToList}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0284C7] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回赛事动态列表</span>
        </button>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
          {onBackHome && (
            <>
              <button
                type="button"
                onClick={onBackHome}
                className="hover:text-[#0284C7] transition-colors cursor-pointer"
              >
                首页
              </button>
              <span>&rsaquo;</span>
            </>
          )}
          <button
            type="button"
            onClick={onBackToList}
            className="hover:text-[#0284C7] transition-colors cursor-pointer"
          >
            赛事动态
          </button>
          <span>&rsaquo;</span>
          <span className="text-[#0284C7] font-semibold">{currentMoment.category}</span>
          <span>&rsaquo;</span>
          <span className="text-slate-700 font-medium truncate max-w-xs sm:max-w-md">
            {currentMoment.title}
          </span>
        </div>
      </div>

      {/* 主体两栏布局：左栏动态详情（占 8 列），右栏同分类相关动态推荐（占 4 列） */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
        {/* 左栏：图文或视频动态详情 */}
        <article className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 xl:p-10 space-y-8">
          {/* 顶部标题与元信息区 */}
          <header className="pb-6 border-b border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
              <div className="flex flex-wrap items-center gap-2">
                {currentMoment.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Pin className="w-3 h-3" /> 置顶动态
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-50 text-[#0369A1] border border-sky-200/80">
                  {currentMoment.category}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                  {currentMoment.mediaType === 'video' ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>视频播报 · {currentMoment.videoDuration || '04:15'}</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>图文报道</span>
                    </>
                  )}
                </span>
              </div>

              {currentMoment.mediaType === 'video' && (
                <button
                  type="button"
                  onClick={() => setAutoPlayMuted((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 border border-slate-200 text-xs font-medium text-slate-700 hover:text-[#0284C7] transition-colors cursor-pointer"
                >
                  {autoPlayMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{autoPlayMuted ? '播放策略：静音自动播放' : '播放策略：有声播放'}</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
              {currentMoment.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
              <span>
                发布来源：<strong className="text-slate-700 font-semibold">{currentMoment.source}</strong>
              </span>
              <span className="font-mono-num">
                发布时间：{currentMoment.publishTime.slice(0, 10)}
              </span>
              <span className="font-mono-num">
                {currentMoment.mediaType === 'video' ? '播放热度' : '浏览热度'}：{currentMoment.viewsCount} 次
              </span>
            </div>
          </header>

          {currentMoment.mediaType === 'video' ? (
            /* 视频类动态详情内容 */
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-sm">
                <video
                  key={`${currentMoment.id}-${autoPlayMuted}`}
                  controls
                  autoPlay={autoPlayMuted}
                  muted={autoPlayMuted}
                  poster={currentMoment.coverImage}
                  className="w-full max-h-[540px] object-contain bg-black"
                >
                  <source
                    src={
                      currentMoment.videoUrl ||
                      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                    }
                    type="video/mp4"
                  />
                  您的浏览器不支持 HTML5 视频播放。
                </video>
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-[#0284C7] fill-current" />
                    正在播放：{currentMoment.title}
                  </span>
                  <span className="font-mono-num text-slate-500">
                    片长：{currentMoment.videoDuration || '04:15'}
                  </span>
                </div>
              </div>

              {/* 视频看点时间轴（若有） */}
              {currentMoment.videoHighlights && currentMoment.videoHighlights.length > 0 && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3">
                  <div className="text-xs font-bold text-[#0369A1] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0284C7]" />
                    <span>视频核心章节与精彩看点导览</span>
                  </div>
                  <div className="space-y-2">
                    {currentMoment.videoHighlights.map((hl, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 bg-white px-3.5 py-2.5 rounded-lg border border-slate-200/70"
                      >
                        <span className="w-5 h-5 rounded-full bg-sky-100 text-[#0284C7] font-mono-num text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 视频简介与详细说明 */}
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-xl bg-sky-50/70 border-l-4 border-[#0284C7] text-sm text-slate-700 leading-relaxed">
                  <span className="font-bold text-[#0369A1] mr-2">【视频导读】</span>
                  {currentMoment.summary}
                </div>

                {currentMoment.content && currentMoment.content !== currentMoment.summary && (
                  <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-8 whitespace-pre-line">
                    {currentMoment.content}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 图文类动态详情内容 */
            <div className="space-y-6">
              {currentMoment.summary && (
                <div className="p-4 sm:p-5 rounded-xl bg-sky-50/70 border-l-4 border-[#0284C7] text-sm text-slate-700 leading-relaxed">
                  <span className="font-bold text-[#0369A1] mr-2">【动态导读】</span>
                  {currentMoment.summary}
                </div>
              )}

              <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-8">
                {currentMoment.content.split('\n\n').map((para, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {para.trim()}
                  </p>
                ))}
              </div>

              {/* 现场高清图集 */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#0284C7]" />
                  <span>现场纪实图集</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(currentMoment.images && currentMoment.images.length > 0
                    ? currentMoment.images
                    : [currentMoment.coverImage]
                  ).map((imgUrl, idx) => (
                    <figure
                      key={idx}
                      className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs"
                    >
                      <img
                        src={imgUrl}
                        alt={`${currentMoment.title}-${idx + 1}`}
                        className="w-full h-64 sm:h-72 object-cover"
                      />
                      <figcaption className="px-4 py-2 text-xs text-slate-500 text-center border-t border-slate-200/80">
                        {currentMoment.title} · 纪实配图 {idx + 1}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 底部上一条 / 下一条切换 + 返回动态列表 */}
          <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {prevMoment ? (
                <button
                  type="button"
                  onClick={() => {
                    onSelectMoment(prevMoment.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer group"
                >
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <ChevronLeft className="w-3.5 h-3.5 text-[#0284C7]" /> 上一条动态
                  </div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-[#0284C7] line-clamp-1 mt-1">
                    {prevMoment.title}
                  </div>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 text-xs text-slate-400">
                  上一条：已是第一条
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onBackToList}
              className="px-5 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-bold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              返回动态列表
            </button>

            <div className="flex-1 min-w-0">
              {nextMoment ? (
                <button
                  type="button"
                  onClick={() => {
                    onSelectMoment(nextMoment.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-right p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer group"
                >
                  <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                    下一条动态 <ChevronRight className="w-3.5 h-3.5 text-[#0284C7]" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-[#0284C7] line-clamp-1 mt-1">
                    {nextMoment.title}
                  </div>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 text-xs text-slate-400 text-right">
                  下一条：已是最后一条
                </div>
              )}
            </div>
          </footer>
        </article>

        {/* 右栏：同分类相关推荐（占 4 列） */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  相关推荐 · {currentMoment.category}
                </h2>
              </div>
              <button
                type="button"
                onClick={onBackToList}
                className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
              >
                更多 &rsaquo;
              </button>
            </div>

            <div className="space-y-4">
              {relatedMoments.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onSelectMoment(rel.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group bg-slate-50/80 hover:bg-sky-50/50 border border-slate-200/80 hover:border-[#0284C7] rounded-xl overflow-hidden cursor-pointer transition-all"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {rel.mediaType === 'video' && (
                      <>
                        <div className="absolute inset-0 bg-slate-950/25 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-white/95 text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white flex items-center justify-center shadow-sm transition-colors">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-white font-mono-num text-[11px]">
                          {rel.videoDuration || '04:00'}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="p-3.5">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0284C7] line-clamp-2 leading-snug transition-colors">
                      {rel.title}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-[#0284C7]">{rel.category}</span>
                      <span className="font-mono-num text-slate-400">
                        {rel.publishTime.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

// ============================================================================
// 九、前台【通知公告】列表页 + 【通知公告详情】独立二级页面（格式类似赛事新闻，浅色风格，不使用弹窗）
// ============================================================================

const NOTICE_CATEGORY_OPTIONS = ['通知', '创新赛通知', '作品赛通知'] as const;

interface FrontendNoticesPageProps {
  noticesList: NoticeItem[];
  onSelectNotice: (noticeId: string) => void;
}

export const FrontendNoticesPage: React.FC<FrontendNoticesPageProps> = ({
  noticesList,
  onSelectNotice,
}) => {
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 置顶排在最前，其余按发布日期倒序
  const sortedNotices = useMemo(() => {
    return [...noticesList].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.fullDate.localeCompare(a.fullDate);
    });
  }, [noticesList]);

  const filteredNotices = useMemo(() => {
    return sortedNotices.filter((item) => {
      if (activeCategory !== 'ALL' && (item.category || '通知') !== activeCategory) {
        return false;
      }
      if (keyword.trim()) {
        const q = keyword.trim().toLowerCase();
        return item.title.toLowerCase().includes(q);
      }
      return true;
    });
  }, [sortedNotices, activeCategory, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / pageSize));
  const paginatedNotices = filteredNotices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-12 flex-1 w-full">
      {/* 页面头部与筛选检索栏（仅保留标题） */}
      <div className="mb-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              通知公告
            </h1>
          </div>
        </div>

        {/* 分类标签筛选与关键词搜索 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start">
            {(['ALL', ...NOTICE_CATEGORY_OPTIONS] as const).map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#0284C7] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'ALL' ? '全部通知' : cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜索通知标题"
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0284C7] focus:outline-none text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 通知公告列表 */}
      {paginatedNotices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="text-base font-bold text-slate-800">未检索到匹配的通知公告</div>
          <p className="text-xs text-slate-500">
            请尝试更换搜索关键词或切换上方的通知分类标签。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedNotices.map((item) => {
            const summaryText = item.summary || item.content[1] || item.content[0] || '';
            return (
              <article
                key={item.id}
                onClick={() => {
                  onSelectNotice(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#0284C7] shadow-2xs hover:shadow-lg transition-all duration-200 overflow-hidden p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer"
              >
                {/* 左侧日期牌 */}
                <div className="hidden sm:flex w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-50 to-slate-50 border border-sky-200/80 group-hover:border-[#0284C7] group-hover:from-[#0284C7] group-hover:to-[#0369A1] flex-col items-center justify-center shrink-0 transition-all duration-200">
                  <span className="text-2xl font-extrabold font-mono-num text-[#0284C7] group-hover:text-white leading-none">
                    {item.date}
                  </span>
                  <span className="text-xs font-mono-num text-slate-400 group-hover:text-sky-100 mt-1.5">
                    {item.fullDate.slice(0, 4)}
                  </span>
                </div>

                {/* 右侧正文内容（已移除发文字号展示） */}
                <div className="flex-1 min-w-0 space-y-2.5 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                          <Pin className="w-3 h-3" /> 置顶
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-50 text-[#0369A1] border border-sky-200/80">
                        {item.category || '通知'}
                      </span>
                      {item.attachments && item.attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Download className="w-3 h-3" /> 含 {item.attachments.length} 份附件
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 font-mono-num">
                      查阅 {item.viewsCount || 8560} 次
                    </span>
                  </div>

                  {/* 标题（两行截断） */}
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h2>

                  {/* 简介/摘要 */}
                  {summaryText && (
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {summaryText}
                    </p>
                  )}

                  {/* 底部元信息：发文部门 + 发布日期 + 进入详情 */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex flex-wrap items-center gap-4">
                      <span>发文机构：{item.department}</span>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <span className="font-mono-num">发布日期：{item.fullDate}</span>
                    </div>
                    <span className="text-xs font-bold text-[#0284C7] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                      <span>进入通知详情</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 底部分页器 */}
      <div className="mt-8 bg-white border border-slate-200/90 rounded-xl px-6 py-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-600">
        <div>
          共 <span className="text-slate-900 font-bold font-mono-num">{filteredNotices.length}</span> 份通知公告 · 每页展示{' '}
          <span className="text-slate-900 font-mono-num font-semibold">{pageSize}</span> 份
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-[#0284C7] hover:border-sky-200 disabled:opacity-40 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="px-3 font-mono-num text-slate-700 font-semibold">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-[#0284C7] hover:border-sky-200 disabled:opacity-40 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </main>
  );
};

// ============================================================================
// 九（续）、前台【通知公告详情】独立二级页面（非弹窗，浅色风格）
// ============================================================================

interface FrontendNoticeDetailPageProps {
  noticesList: NoticeItem[];
  selectedNoticeId: string;
  onSelectNotice: (noticeId: string) => void;
  onBackToList: () => void;
  onBackHome?: () => void;
}

export const FrontendNoticeDetailPage: React.FC<FrontendNoticeDetailPageProps> = ({
  noticesList,
  selectedNoticeId,
  onSelectNotice,
  onBackToList,
  onBackHome,
}) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const sortedNotices = useMemo(() => {
    return [...noticesList].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.fullDate.localeCompare(a.fullDate);
    });
  }, [noticesList]);

  const currentIndex = useMemo(
    () => sortedNotices.findIndex((n) => n.id === selectedNoticeId),
    [sortedNotices, selectedNoticeId]
  );

  const currentNotice =
    currentIndex >= 0
      ? sortedNotices[currentIndex]
      : noticesList.find((n) => n.id === selectedNoticeId) || sortedNotices[0] || null;

  const prevNotice = currentIndex > 0 ? sortedNotices[currentIndex - 1] : null;
  const nextNotice =
    currentIndex >= 0 && currentIndex < sortedNotices.length - 1
      ? sortedNotices[currentIndex + 1]
      : null;

  const recommendedNotices = useMemo(() => {
    if (!currentNotice) return [];
    return sortedNotices.filter((n) => n.id !== currentNotice.id).slice(0, 6);
  }, [sortedNotices, currentNotice]);

  if (!currentNotice) {
    return (
      <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 flex-1 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="text-base font-bold text-slate-800">未找到该份通知公告</div>
          <button
            type="button"
            onClick={onBackToList}
            className="px-5 py-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
          >
            返回通知公告列表
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 flex-1 w-full space-y-8">
      {/* 顶部返回与面包屑导航栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToList}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0284C7] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回通知公告列表</span>
        </button>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
          {onBackHome && (
            <>
              <button
                type="button"
                onClick={onBackHome}
                className="hover:text-[#0284C7] transition-colors cursor-pointer"
              >
                首页
              </button>
              <span>&rsaquo;</span>
            </>
          )}
          <button
            type="button"
            onClick={onBackToList}
            className="hover:text-[#0284C7] transition-colors cursor-pointer"
          >
            通知公告
          </button>
          <span>&rsaquo;</span>
          <span className="text-slate-700 font-medium truncate max-w-xs sm:max-w-md">
            {currentNotice.title}
          </span>
        </div>
      </div>

      {/* 主体两栏布局：左栏通知正文（占8列），右栏最新通知推荐（占4列） */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
        <article className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 xl:p-10">
          {/* 顶部标题与元信息区（已删除红头抬头、发文字号、置顶标签与分类标签） */}
          <header className="pb-6 mb-8 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight text-center">
              {currentNotice.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span>
                  发文机构：<strong className="text-slate-700 font-semibold">{currentNotice.department}</strong>
                </span>
                <span className="font-mono-num">发布日期：{currentNotice.fullDate}</span>
                <span className="font-mono-num">查阅量：{currentNotice.viewsCount || 8560} 次</span>
              </div>

              {/* 正文字号调节器 */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <span className="text-slate-400 px-1.5">字号：</span>
                {(
                  [
                    { key: 'sm', label: '小' },
                    { key: 'base', label: '标准' },
                    { key: 'lg', label: '大' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFontSize(opt.key)}
                    className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                      fontSize === opt.key
                        ? 'bg-[#0284C7] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* 摘要导读框 */}
          {currentNotice.summary && (
            <div className="mb-8 p-4 sm:p-5 rounded-xl bg-sky-50/70 border-l-4 border-[#0284C7] text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-[#0369A1] mr-2">【通知提要】</span>
              {currentNotice.summary}
            </div>
          )}

          {/* 通知正文内容 */}
          <div
            className={`space-y-4 text-slate-700 leading-relaxed ${
              fontSize === 'sm'
                ? 'text-xs sm:text-sm'
                : fontSize === 'lg'
                ? 'text-base sm:text-lg'
                : 'text-sm sm:text-base'
            }`}
          >
            {currentNotice.content.map((para, idx) => (
              <p
                key={idx}
                className={`leading-8 ${
                  idx === 0 && (para.endsWith('：') || para.endsWith(':'))
                    ? 'font-bold text-slate-900'
                    : 'indent-8 text-slate-700'
                }`}
              >
                {para}
              </p>
            ))}
          </div>

          {/* 落款署名区 */}
          <div className="mt-10 pt-4 text-right space-y-1 text-sm text-slate-800">
            <div className="font-bold">{currentNotice.department}</div>
            <div className="font-mono-num text-xs text-slate-500">{currentNotice.fullDate}</div>
          </div>

          {/* 官方附件下载区 */}
          {currentNotice.attachments && currentNotice.attachments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-[#0284C7]" />
                <span>随文附件下载（共 {currentNotice.attachments.length} 份）</span>
              </div>
              <div className="space-y-2.5">
                {currentNotice.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-sky-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                      <FileText className="w-4 h-4 text-[#0284C7] shrink-0" />
                      <span>{att.name}</span>
                      <span className="text-xs text-slate-400 font-mono-num">({att.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDownloadToast(
                          `已开始下载《${att.name}》，文件已通过官方 SHA-256 数字签名完整性校验。`
                        );
                      }}
                      className="px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>立即下载</span>
                    </button>
                  </div>
                ))}
              </div>
              {downloadToast && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {downloadToast}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDownloadToast(null)}
                    className="text-emerald-700 hover:underline cursor-pointer shrink-0"
                  >
                    关闭
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 底部导航：上一篇 / 返回列表 / 下一篇 */}
          <footer className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {prevNotice ? (
                <button
                  type="button"
                  onClick={() => {
                    setDownloadToast(null);
                    onSelectNotice(prevNotice.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer group"
                >
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <ChevronLeft className="w-3.5 h-3.5 text-[#0284C7]" /> 上一份通知
                  </div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-[#0284C7] line-clamp-1 mt-1">
                    {prevNotice.title}
                  </div>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 text-xs text-slate-400">
                  上一份：已是第一份通知
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onBackToList}
              className="px-5 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-bold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              返回通知列表
            </button>

            <div className="flex-1 min-w-0">
              {nextNotice ? (
                <button
                  type="button"
                  onClick={() => {
                    setDownloadToast(null);
                    onSelectNotice(nextNotice.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-right p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer group"
                >
                  <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                    下一份通知 <ChevronRight className="w-3.5 h-3.5 text-[#0284C7]" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-[#0284C7] line-clamp-1 mt-1">
                    {nextNotice.title}
                  </div>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/70 text-xs text-slate-400 text-right">
                  下一份：已是最后一份通知
                </div>
              )}
            </div>
          </footer>
        </article>

        {/* 右栏：其他重点通知推荐（占 4 列） */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">近期重要通知公告</h2>
              </div>
              <button
                type="button"
                onClick={onBackToList}
                className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
              >
                全部 &rsaquo;
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recommendedNotices.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setDownloadToast(null);
                    onSelectNotice(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="py-3.5 first:pt-0 last:pb-0 group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {item.isPinned && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                        置顶
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-[#0284C7]">
                      [{item.category || '通知'}]
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono-num ml-auto">
                      {item.fullDate}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#0284C7] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

// ============================================================================
// 十、前台【帮助中心】独立页面（单篇 Markdown 文档汇总展示所有问题，删除右侧组委会联系方式栏）
// ============================================================================

interface FrontendHelpCenterPageProps {
  faqList?: FaqItem[];
  markdownContent?: string;
  onBackHome?: () => void;
}

const renderHelpMarkdownInline = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-sky-50 text-[#0284C7] font-mono text-xs border border-sky-200/80"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

export const HelpMarkdownDocumentView: React.FC<{ content: string; compact?: boolean }> = ({
  content,
  compact = false,
}) => {
  const lines = content.split('\n');
  return (
    <div className={compact ? 'space-y-2.5 text-slate-700 leading-relaxed' : 'space-y-3.5 text-slate-700 leading-relaxed'}>
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-1" />;
        }
        if (line === '---') {
          return <hr key={idx} className="my-5 border-slate-200" />;
        }
        if (line.startsWith('# ')) {
          return (
            <h2
              key={idx}
              className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight pb-3 mb-2 border-b border-slate-200"
            >
              {renderHelpMarkdownInline(line.slice(2))}
            </h2>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3
              key={idx}
              className={`${
                compact ? 'text-sm sm:text-base pt-2' : 'text-base sm:text-lg pt-4 pb-1'
              } font-extrabold text-[#0284C7] flex items-center gap-2`}
            >
              <span className="w-1.5 h-4 rounded-full bg-[#0284C7] shrink-0" />
              <span>{renderHelpMarkdownInline(line.slice(3))}</span>
            </h3>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className={`${
                compact ? 'text-xs sm:text-sm pt-1' : 'text-sm sm:text-base pt-2'
              } font-bold text-slate-900`}
            >
              {renderHelpMarkdownInline(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className={`${
                compact ? 'p-3 text-xs' : 'p-4 text-xs sm:text-sm'
              } rounded-xl bg-sky-50/70 border-l-4 border-[#0284C7] text-slate-700 leading-relaxed`}
            >
              {renderHelpMarkdownInline(line.slice(2))}
            </blockquote>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 text-xs sm:text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] mt-2 shrink-0" />
              <div className="flex-1">{renderHelpMarkdownInline(line.slice(2))}</div>
            </div>
          );
        }
        const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (orderedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 text-xs sm:text-sm">
              <span className="font-mono font-bold text-[#0284C7] shrink-0">
                {orderedMatch[1]}.
              </span>
              <div className="flex-1">{renderHelpMarkdownInline(orderedMatch[2])}</div>
            </div>
          );
        }
        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {renderHelpMarkdownInline(line)}
          </p>
        );
      })}
    </div>
  );
};

export const FrontendHelpCenterPage: React.FC<FrontendHelpCenterPageProps> = ({
  markdownContent,
}) => {
  return (
    <main className="max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-12 flex-1 w-full space-y-6">
      {/* 页面头部（仅保留“帮助中心”标题） */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          帮助中心
        </h1>
      </div>

      {/* 单篇 Markdown 文档汇总展示所有常见问题与解答 */}
      <article className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-10">
        <HelpMarkdownDocumentView content={markdownContent ?? HELP_CENTER_MARKDOWN_DOC} />
      </article>
    </main>
  );
};

// ============================================================================
// 十一、站内全局全文检索弹窗（浅色风格，覆盖赛事新闻、通知公告、赛事动态）
// ============================================================================

interface GlobalSiteSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsList: ManagedNewsItem[];
  noticesList?: NoticeItem[];
  momentsList: ManagedMomentItem[];
  onNavigateToNews: (newsId: string) => void;
  onNavigateToNotice?: (noticeId: string) => void;
  onNavigateToMoment: (momentId: string) => void;
}

export const GlobalSiteSearchModal: React.FC<GlobalSiteSearchModalProps> = ({
  isOpen,
  onClose,
  newsList,
  noticesList = [],
  momentsList,
  onNavigateToNews,
  onNavigateToNotice,
  onNavigateToMoment
}) => {
  const [query, setQuery] = useState('');

  const matchedNotices = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return noticesList
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.docNumber.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.content.join(' ').toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [noticesList, query]);

  const matchedNews = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return newsList
      .filter(
        (n) =>
          n.publishStatus === 'published' &&
          (n.title.toLowerCase().includes(q) ||
            n.summary.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [newsList, query]);

  const matchedMoments = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return momentsList
      .filter(
        (m) =>
          m.publishStatus === 'published' &&
          (m.title.toLowerCase().includes(q) ||
            m.summary.toLowerCase().includes(q) ||
            m.content.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [momentsList, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 backdrop-blur-xs pt-20 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-gradient-to-r from-[#072A47] to-[#0284C7] text-white flex items-center justify-between">
          <div className="text-sm font-bold flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-200" />
            全站内容检索（覆盖通知公告 / 赛事新闻 / 赛事动态）
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入关键词全文检索通知公告、赛事新闻、专家观点、战队风采..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0284C7] rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {!query.trim() ? (
            <div className="text-xs text-slate-500 space-y-2.5">
              <div className="font-semibold text-slate-700">热门检索词：</div>
              <div className="flex flex-wrap gap-2">
                {['参赛指南', '靶场', '大模型', '云原生', '实名认证', '天枢星辰'].map((hot) => (
                  <button
                    key={hot}
                    type="button"
                    onClick={() => setQuery(hot)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#0284C7] border border-slate-200/80 font-medium transition-colors cursor-pointer"
                  >
                    {hot}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-5 pr-1">
              {onNavigateToNotice && (
                <div>
                  <div className="text-xs font-bold text-[#0284C7] mb-2">
                    通知公告 ({matchedNotices.length})
                  </div>
                  {matchedNotices.length === 0 ? (
                    <div className="text-xs text-slate-400 py-1">无匹配通知公告</div>
                  ) : (
                    <div className="space-y-2">
                      {matchedNotices.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            onNavigateToNotice(item.id);
                            onClose();
                          }}
                          className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 cursor-pointer transition-colors"
                        >
                          <div className="text-sm font-bold text-slate-900">{item.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {item.department} · {item.docNumber}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="text-xs font-bold text-[#0284C7] mb-2">
                  赛事新闻 ({matchedNews.length})
                </div>
                {matchedNews.length === 0 ? (
                  <div className="text-xs text-slate-400 py-1">无匹配赛事新闻</div>
                ) : (
                  <div className="space-y-2">
                    {matchedNews.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onNavigateToNews(n.id);
                          onClose();
                        }}
                        className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 cursor-pointer transition-colors"
                      >
                        <div className="text-sm font-bold text-slate-900">{n.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{n.summary}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-[#0369A1] mb-2">
                  赛事动态 ({matchedMoments.length})
                </div>
                {matchedMoments.length === 0 ? (
                  <div className="text-xs text-slate-400 py-1">无匹配赛事动态</div>
                ) : (
                  <div className="space-y-2">
                    {matchedMoments.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onNavigateToMoment(m.id);
                          onClose();
                        }}
                        className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">{m.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{m.summary}</div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-50 text-[#0284C7] border border-sky-200 shrink-0">
                          {m.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 十、后台【内容管理 -> 首页配置】（配置首页 Banner 图片上传与跳转链接 + 首页推荐的 3 个赛事）
// ============================================================================
export interface AdminHomeConfigManagementProps {
  homeBanners: HomeBannerConfig[];
  onChangeHomeBanners: React.Dispatch<React.SetStateAction<HomeBannerConfig[]>>;
  recommendedCompIds: string[];
  onChangeRecommendedCompIds: React.Dispatch<React.SetStateAction<string[]>>;
  competitions: Array<{
    id: string;
    title: string;
    summary: string;
    startDate: string;
    endDate: string;
    isPublic: boolean;
    organizer: string;
  }>;
  onAddAuditLog?: (log: {
    operator: string;
    ip: string;
    location: string;
    device: string;
    action: string;
    result: '成功' | '失败';
    detail: string;
  }) => void;
  operatorName?: string;
}

export const AdminHomeConfigManagement: React.FC<AdminHomeConfigManagementProps> = ({
  homeBanners,
  onChangeHomeBanners,
  recommendedCompIds,
  onChangeRecommendedCompIds,
  competitions,
  onAddAuditLog,
  operatorName = '系统管理员',
}) => {
  const [editingBanner, setEditingBanner] = useState<HomeBannerConfig | null>(null);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLinkType, setFormLinkType] = useState<'competition' | 'view' | 'url'>('url');
  const [formTargetValue, setFormTargetValue] = useState('https://xxcup.edu.cn/competitions/comp-2026-main');
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const publicCompetitions = useMemo(
    () => competitions.filter((c) => c.isPublic),
    [competitions]
  );

  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setFormImageUrl(BANNER_POSTER_1);
    setFormLinkType('url');
    setFormTargetValue('https://');
    setFormSortOrder(homeBanners.length + 1);
    setIsAddingBanner(true);
  };

  const handleOpenEditBanner = (banner: HomeBannerConfig) => {
    setEditingBanner(banner);
    setFormImageUrl(banner.imageUrl);
    setFormLinkType('url');
    setFormTargetValue(banner.targetValue);
    setFormSortOrder(banner.sortOrder);
    setIsAddingBanner(true);
  };

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('请上传 JPG、PNG、WebP 或 SVG 格式的 Banner 图片！');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImageUrl(reader.result);
        showToast(`已成功上传 Banner 图片：${file.name}`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImageUrl.trim()) {
      showToast('请上传或填写 Banner 图片地址！');
      return;
    }
    if (!formTargetValue.trim()) {
      showToast('请配置对应跳转链接目标！');
      return;
    }

    const nowStr = '2026-10-28 14:20';
    const orderNum = Number(formSortOrder) || 1;
    if (editingBanner) {
      const updated = homeBanners
        .map((b) =>
          b.id === editingBanner.id
            ? {
                ...b,
                imageUrl: formImageUrl.trim(),
                linkType: 'url' as const,
                targetValue: formTargetValue.trim(),
                sortOrder: orderNum,
                updatedAt: nowStr,
              }
            : b
        )
        .sort((a, b) => a.sortOrder - b.sortOrder);
      onChangeHomeBanners(updated);
      onAddAuditLog?.({
        operator: operatorName,
        ip: '202.112.128.45',
        location: '北京市海淀区',
        device: 'Admin Console',
        action: `编辑首页Banner（序号 #${orderNum}）`,
        result: '成功',
        detail: `跳转类型：url -> ${formTargetValue.trim()}`,
      });
      showToast('已保存首页 Banner 修改，前台首页轮播已实时同步！');
    } else {
      const newBanner: HomeBannerConfig = {
        id: `hb-${Date.now()}`,
        title: `首页 Banner #${orderNum}`,
        subtitle: '',
        imageUrl: formImageUrl.trim(),
        linkType: 'url',
        targetValue: formTargetValue.trim(),
        linkLabel: '查看详情',
        sortOrder: orderNum,
        isEnabled: true,
        updatedAt: nowStr,
      };
      onChangeHomeBanners(
        [...homeBanners, newBanner].sort((a, b) => a.sortOrder - b.sortOrder)
      );
      onAddAuditLog?.({
        operator: operatorName,
        ip: '202.112.128.45',
        location: '北京市海淀区',
        device: 'Admin Console',
        action: `新增首页Banner（序号 #${orderNum}）`,
        result: '成功',
        detail: `跳转类型：url -> ${formTargetValue.trim()}`,
      });
      showToast('已新增首页 Banner，前台首页轮播已实时生效！');
    }
    setIsAddingBanner(false);
    setEditingBanner(null);
  };

  const handleDeleteBanner = (banner: HomeBannerConfig) => {
    if (homeBanners.length <= 1) {
      showToast('至少需要保留 1 张首页 Banner 图！');
      return;
    }
    onChangeHomeBanners(homeBanners.filter((b) => b.id !== banner.id));
    showToast(`已删除首页 Banner（序号 #${banner.sortOrder}）`);
  };

  const handleSlotCompChange = (slotIndex: number, compId: string) => {
    const next = [...recommendedCompIds];
    while (next.length < 3) {
      const fallback =
        publicCompetitions.find((c) => !next.includes(c.id))?.id ||
        publicCompetitions[0]?.id ||
        '';
      next.push(fallback);
    }
    next[slotIndex] = compId;
    onChangeRecommendedCompIds(next.slice(0, 3));
    const compTitle = competitions.find((c) => c.id === compId)?.title || compId;
    onAddAuditLog?.({
      operator: operatorName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: `配置首页推荐赛事（推荐位 ${slotIndex + 1}）`,
      result: '成功',
      detail: `将首页推荐位 #${slotIndex + 1} 设置为《${compTitle}》`,
    });
    showToast(`已将首页推荐位 #${slotIndex + 1} 更新为《${compTitle}》，前台首页已实时同步！`);
  };

  const resolveLinkTargetSummary = (banner: HomeBannerConfig) => {
    return banner.targetValue || '-';
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 模块一：首页 Banner 图片上传与跳转链接配置 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              一、首页轮播 Banner 配置（图片上传与跳转链接）
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              配置前台首页顶部轮播 Banner 图片、点击后的跳转目标及轮播排序号
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddBanner}
            className="px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>新增首页 Banner</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="py-3.5 px-4 whitespace-nowrap">轮播排序号</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Banner 图片</th>
                <th className="py-3.5 px-4">对应跳转链接</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {homeBanners.map((banner) => (
                <tr key={banner.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-700">
                    #{banner.sortOrder}
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-40 h-18 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <img
                        src={banner.imageUrl}
                        alt={`Banner #${banner.sortOrder}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4 max-w-md">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-semibold">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>{resolveLinkTargetSummary(banner)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBanner(banner)}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284C7] font-bold cursor-pointer"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(banner)}
                        className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模块二：配置首页推荐的 3 个赛事 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900">
            二、首页推荐赛事配置（固定推荐 3 个核心赛事）
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            配置前台首页「赛事通道」模块重点展示的 3 个推荐赛事，修改后前台首页立即同步更新
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map((slotIdx) => {
            const currentId =
              recommendedCompIds[slotIdx] || publicCompetitions[slotIdx]?.id || '';
            const selectedComp = competitions.find((c) => c.id === currentId);

            return (
              <div
                key={slotIdx}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-[#0284C7] text-white text-xs font-extrabold">
                      首页推荐赛事位 #{slotIdx + 1}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      SLOT-0{slotIdx + 1}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      选择展示赛事 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentId}
                      onChange={(e) => handleSlotCompChange(slotIdx, e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none cursor-pointer"
                    >
                      {publicCompetitions.map((comp) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedComp && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-1.5">
                      <div className="text-xs font-extrabold text-slate-900 line-clamp-1">
                        {selectedComp.title}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {selectedComp.summary}
                      </p>
                      <div className="pt-1 text-[11px] text-slate-400 font-mono">
                        赛程：{selectedComp.startDate.slice(0, 10)} ~{' '}
                        {selectedComp.endDate.slice(0, 10)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 新增 / 编辑 Banner 弹窗 */}
      {isAddingBanner && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-slate-900 text-white font-bold text-sm flex items-center justify-between">
              <span>{editingBanner ? '编辑首页 Banner' : '新增首页 Banner'}</span>
              <button
                type="button"
                onClick={() => {
                  setIsAddingBanner(false);
                  setEditingBanner(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 space-y-4 text-xs">
              {/* 字段 1：Banner 图片上传 */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Banner 图片上传 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>上传本地图片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="或输入图片 URL 地址..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none font-mono"
                  />
                </div>

                {formImageUrl && (
                  <div className="mt-2 h-36 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={formImageUrl}
                      alt="Banner预览"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* 字段 2：跳转链接配置 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">
                  跳转链接配置 <span className="text-red-500">*</span>
                </div>
                <div>
                  <input
                    type="text"
                    value={formTargetValue}
                    onChange={(e) => setFormTargetValue(e.target.value)}
                    placeholder="https://example.com 或 /competitions"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              {/* 字段 3：轮播排序号 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  轮播排序号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  placeholder="如：1"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none font-mono font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  数值越小在前台首页轮播中越靠前展示
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingBanner(false);
                    setEditingBanner(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold cursor-pointer"
                >
                  保存配置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 十一、后台【系统管理 -> 赛区管理】（配置中国 34 个省级行政区与赛区的对应关系，完整包含港澳台）
// ============================================================================
export interface AdminDivisionManagementProps {
  divisions: DivisionRecord[];
  onChangeDivisions: React.Dispatch<React.SetStateAction<DivisionRecord[]>>;
  onAddAuditLog?: (log: {
    operator: string;
    ip: string;
    location: string;
    device: string;
    action: string;
    result: '成功' | '失败';
    detail: string;
  }) => void;
  operatorName?: string;
}

export const AdminDivisionManagement: React.FC<AdminDivisionManagementProps> = ({
  divisions,
  onChangeDivisions,
  onAddAuditLog,
  operatorName = '系统管理员',
}) => {
  const [editingDivision, setEditingDivision] = useState<DivisionRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProvinces, setFormProvinces] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // 计算每个省份当前归属的赛区
  const provinceToDivisionMap = useMemo(() => {
    const map = new Map<string, DivisionRecord>();
    divisions.forEach((div) => {
      div.provinces.forEach((p) => {
        map.set(p, div);
      });
    });
    return map;
  }, [divisions]);

  const unassignedProvinces = useMemo(
    () => ALL_CHINA_PROVINCES.filter((p) => !provinceToDivisionMap.has(p)),
    [provinceToDivisionMap]
  );

  const filteredDivisions = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return divisions;
    return divisions.filter(
      (d) =>
        d.name.toLowerCase().includes(kw) ||
        d.code.toLowerCase().includes(kw) ||
        d.provinces.some((p) => p.toLowerCase().includes(kw))
    );
  }, [divisions, searchKeyword]);

  const handleOpenCreate = () => {
    setEditingDivision(null);
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setFormProvinces([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (div: DivisionRecord) => {
    setEditingDivision(div);
    setFormName(div.name);
    setFormCode(div.code);
    setFormDesc(div.description);
    setFormProvinces([...div.provinces]);
    setModalOpen(true);
  };

  const handleToggleProvinceInModal = (prov: string) => {
    setFormProvinces((prev) =>
      prev.includes(prov)
        ? prev.filter((p) => p !== prov)
        : ALL_CHINA_PROVINCES.filter((p) => p === prov || prev.includes(p))
    );
  };

  const handleSaveDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      showToast('请填写赛区名称与赛区编码！');
      return;
    }
    const nowStr = '2026-10-28 14:30';
    const targetId = editingDivision ? editingDivision.id : `div-${Date.now()}`;

    // 若勾选了原本属于其他赛区的省份，自动从其他赛区移出，保证一省一赛区映射唯一
    const cleanedOtherDivisions = divisions
      .filter((d) => d.id !== targetId)
      .map((d) => ({
        ...d,
        provinces: d.provinces.filter((p) => !formProvinces.includes(p)),
      }));

    const savedDivision: DivisionRecord = {
      id: targetId,
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      description: formDesc.trim() || `覆盖 ${formProvinces.join('、')} 高校选拔`,
      provinces: formProvinces,
      updatedAt: nowStr,
    };

    const nextDivisions = editingDivision
      ? divisions.map((d) =>
          d.id === targetId
            ? savedDivision
            : {
                ...d,
                provinces: d.provinces.filter((p) => !formProvinces.includes(p)),
              }
        )
      : [...cleanedOtherDivisions, savedDivision];

    onChangeDivisions(nextDivisions);
    onAddAuditLog?.({
      operator: operatorName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: `${editingDivision ? '编辑' : '新增'}赛区配置（${savedDivision.name}）`,
      result: '成功',
      detail: `管辖省份(${savedDivision.provinces.length}个)：${savedDivision.provinces.join('、')}`,
    });
    showToast(`已保存【${savedDivision.name}】及省份对应关系！`);
    setModalOpen(false);
    setEditingDivision(null);
  };


  const handleDeleteDivision = (div: DivisionRecord) => {
    if (divisions.length <= 1) {
      showToast('至少需要保留 1 个赛区！');
      return;
    }
    onChangeDivisions(divisions.filter((d) => d.id !== div.id));
    showToast(`已删除赛区【${div.name}】`);
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 顶部概览与检索栏 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-[#0284C7]">
            全国省级行政区覆盖：{ALL_CHINA_PROVINCES.length - unassignedProvinces.length} /{' '}
            {ALL_CHINA_PROVINCES.length}（含香港特别行政区、澳门特别行政区、台湾省）
          </div>
          {unassignedProvinces.length > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
              待分配省份：{unassignedProvinces.join('、')}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索赛区名称或省份（如：香港/台湾/华北）..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0284C7] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>新增赛区</span>
          </button>
        </div>
      </div>

      {/* 赛区列表表格 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="py-3.5 px-4 whitespace-nowrap">赛区名称 / 编码</th>
                <th className="py-3.5 px-4">对应省份及特别行政区（含港澳台）</th>
                <th className="py-3.5 px-4 whitespace-nowrap">管辖省份数</th>
                <th className="py-3.5 px-4">赛区说明</th>
                <th className="py-3.5 px-4 whitespace-nowrap">更新时间</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {filteredDivisions.map((div) => (
                <tr key={div.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-extrabold text-slate-900 text-sm">{div.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      CODE: {div.code}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {div.provinces.length === 0 ? (
                        <span className="text-slate-400">暂未分配省份</span>
                      ) : (
                        div.provinces.map((prov) => {
                          const isHMT =
                            prov.includes('香港') ||
                            prov.includes('澳门') ||
                            prov.includes('台湾');
                          return (
                            <span
                              key={prov}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                isHMT
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-sky-50 text-[#0369A1] border-sky-200'
                              }`}
                            >
                              {prov}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-slate-800">
                    {div.provinces.length} 个省级行政区
                  </td>
                  <td className="py-4 px-4 text-slate-600 max-w-xs">
                    <div className="line-clamp-2">{div.description}</div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-500">
                    {div.updatedAt}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(div)}
                        className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284C7] font-bold cursor-pointer"
                      >
                        配置省份
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDivision(div)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* 新增 / 编辑赛区及勾选省份弹窗 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-slate-900 text-white font-bold text-sm flex items-center justify-between">
              <span>
                {editingDivision ? `编辑赛区与省份映射 — ${editingDivision.name}` : '新增赛区'}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDivision} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    赛区名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="如：华北赛区 / 港澳台赛区"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    赛区编码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="如：NORTH / HMT"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  赛区描述（选填）
                </label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="简要说明该赛区覆盖范围与选拔职能..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700">
                    勾选本赛区管辖的省份/自治区/直辖市/特别行政区（已选 {formProvinces.length} 个）
                  </label>
                  <span className="text-[11px] text-slate-400">
                    若勾选其他赛区已有省份，保存后将自动划转至本赛区
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {ALL_CHINA_PROVINCES.map((prov) => {
                    const checked = formProvinces.includes(prov);
                    const currentOwner = provinceToDivisionMap.get(prov);
                    return (
                      <label
                        key={prov}
                        className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                          checked
                            ? 'bg-sky-50 border-[#0284C7] text-[#0369A1] font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleProvinceInModal(prov)}
                          className="w-3.5 h-3.5 rounded text-[#0284C7]"
                        />
                        <div className="min-w-0">
                          <div className="truncate">{prov}</div>
                          {currentOwner && currentOwner.id !== editingDivision?.id && (
                            <div className="text-[10px] text-slate-400 truncate">
                              原属：{currentOwner.name}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold cursor-pointer"
                >
                  保存赛区配置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 十二、后台【内容管理 -> 帮助中心】（左侧 Markdown 编辑区域 + 右侧实时预览 + 编辑/确定保存/取消）
// ============================================================================
export interface AdminHelpCenterManagementProps {
  helpCenterContent: string;
  onChangeHelpCenterContent: React.Dispatch<React.SetStateAction<string>>;
  onAddAuditLog?: (log: {
    operator: string;
    ip: string;
    location: string;
    device: string;
    action: string;
    result: '成功' | '失败';
    detail: string;
  }) => void;
  operatorName?: string;
}

export const AdminHelpCenterManagement: React.FC<AdminHelpCenterManagementProps> = ({
  helpCenterContent,
  onChangeHelpCenterContent,
  onAddAuditLog,
  operatorName = '系统管理员',
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftContent, setDraftContent] = useState<string>(helpCenterContent);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleStartEdit = () => {
    setDraftContent(helpCenterContent);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftContent(helpCenterContent);
    setIsEditing(false);
    showToast('已取消编辑，帮助中心内容已恢复为修改前版本');
  };

  const handleSaveEdit = () => {
    if (!draftContent.trim()) {
      showToast('帮助中心 Markdown 内容不能为空！');
      return;
    }
    onChangeHelpCenterContent(draftContent);
    setIsEditing(false);
    onAddAuditLog?.({
      operator: operatorName,
      ip: '202.112.128.45',
      location: '北京市海淀区',
      device: 'Admin Console',
      action: '更新帮助中心 Markdown 文档',
      result: '成功',
      detail: `已保存帮助中心内容（共 ${draftContent.length} 字符），实时同步至前台帮助中心与首页`,
    });
    showToast('帮助中心内容已保存，前台「帮助中心」与首页节选已实时同步更新！');
  };

  const handleInsertSnippet = (snippet: string) => {
    if (!isEditing) return;
    setDraftContent((prev) => `${prev}${prev.endsWith('\n') || !prev ? '' : '\n\n'}${snippet}`);
  };

  const displayContent = isEditing ? draftContent : helpCenterContent;
  const lineCount = displayContent.split('\n').length;

  return (
    <div className="space-y-5 pb-10">
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 顶部操作栏：状态提示 + 右侧【编辑】 / 【确定保存】【取消】按钮 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/80 text-[#0284C7] flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-extrabold text-slate-900">
                前台帮助中心 Markdown 内容配置
              </span>
              {isEditing ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                  编辑模式 · 右侧实时预览
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
                  只读模式 · 点击右侧「编辑」修改内容
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono-num">
              当前文档：{lineCount} 行 · {displayContent.length} 字符（保存后实时同步前台「帮助中心」与首页节选）
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>编辑</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>取消</span>
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>确定保存</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 主体：左侧 Markdown 编辑区域 + 右侧实时预览区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* 左侧：Markdown 编辑区域 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0284C7]" />
              <span className="text-xs font-extrabold text-slate-800">
                左侧：Markdown 编辑区域
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {isEditing ? '可直接输入或使用下方快捷语法按钮插入' : '当前为只读状态，请先点击右上角「编辑」'}
            </span>
          </div>

          {/* 快捷 Markdown 语法栏 */}
          <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-200 flex flex-wrap items-center gap-1.5">
            {[
              { label: 'H1 标题', snippet: '# 一级大标题' },
              { label: 'H2 章节', snippet: '## 二、章节分类标题' },
              { label: 'H3 问题', snippet: '### 1. 常见问题标题？' },
              { label: '加粗', snippet: '**重点加粗内容**' },
              { label: '无序列表', snippet: '- 列表项说明一\n- 列表项说明二' },
              { label: '有序列表', snippet: '1. 第一步操作说明\n2. 第二步操作说明' },
              { label: '引用提示', snippet: '> 温馨提示：请参赛选手在截止时间前完成操作。' },
              { label: '分割线', snippet: '---' },
              { label: '行内代码', snippet: '`XXCUP-2026`' },
            ].map((tool) => (
              <button
                key={tool.label}
                type="button"
                disabled={!isEditing}
                onClick={() => handleInsertSnippet(tool.snippet)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                  isEditing
                    ? 'bg-white hover:bg-sky-50 text-slate-700 hover:text-[#0284C7] border-slate-200 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border-slate-200/70 cursor-not-allowed'
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>

          {/* 文本域编辑框 */}
          <div className="p-4 flex-1 flex flex-col">
            <textarea
              value={displayContent}
              readOnly={!isEditing}
              onChange={(e) => {
                if (isEditing) {
                  setDraftContent(e.target.value);
                }
              }}
              placeholder="请在此输入帮助中心 Markdown 内容..."
              className={`w-full h-[640px] p-4 rounded-xl border font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none transition-colors ${
                isEditing
                  ? 'bg-white border-[#0284C7] text-slate-900 shadow-2xs'
                  : 'bg-slate-50/80 border-slate-200 text-slate-600 cursor-default'
              }`}
            />
          </div>
        </div>

        {/* 右侧：实时预览区域 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#0284C7]" />
              <span className="text-xs font-extrabold text-slate-800">
                右侧：实时预览区域（前台帮助中心渲染效果）
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0284C7] border border-sky-200 text-[11px] font-bold">
              实时预览
            </span>
          </div>

          <div className="p-6 flex-1">
            <div className="h-[678px] overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-6">
              <div className="border-b border-slate-200 pb-4 mb-5">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  帮助中心
                </h2>
              </div>
              <HelpMarkdownDocumentView content={displayContent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




