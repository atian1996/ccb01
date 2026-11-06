export interface BannerSlide {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  ctaText: string;
  secondaryCtaText?: string;
  targetType: 'track' | 'notice' | 'verify';
  targetId: string;
  visualTheme: 'summit' | 'countdown' | 'ai_track' | 'finals';
  displayPeriod: string;
  imageUrl: string;
}

export interface CompetitionTrack {
  id: string;
  catalogId: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  organizer: string;
  coOrganizer: string;
  status: 'registering' | 'upcoming' | 'ended';
  statusLabel: '未开始' | '进行中' | '已结束';
  visualType: 'network' | 'data' | 'ai';
  prizePool: string;
  teamSize: string;
  targetGroup: string;
  summary: string;
  schedule: { stage: string; date: string; detail: string }[];
  requirements: string[];
  registeredTeamsCount: number;
}

export type NoticeCategoryType = '通知' | '创新赛通知' | '作品赛通知';

export interface NoticeItem {
  id: string;
  title: string;
  date: string; // MM-DD
  fullDate: string; // YYYY-MM-DD
  isPinned: boolean;
  category?: NoticeCategoryType | string;
  summary?: string;
  viewsCount?: number;
  department: string;
  docNumber: string;
  content: string[];
  attachments?: { name: string; size: string }[];
}

export const DEFAULT_NEWS_COVER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="none">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="800" y2="450" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#072A47"/>
        <stop offset="55%" stop-color="#0C4A6E"/>
        <stop offset="100%" stop-color="#0284C7"/>
      </linearGradient>
      <linearGradient id="glow" x1="160" y1="60" x2="640" y2="390" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="#0284C7" stop-opacity="0.05"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bg)"/>
    <circle cx="680" cy="90" r="180" fill="url(#glow)"/>
    <circle cx="130" cy="370" r="210" fill="url(#glow)"/>
    <g stroke="#38BDF8" stroke-opacity="0.16" stroke-width="1">
      <line x1="0" y1="90" x2="800" y2="90"/>
      <line x1="0" y1="180" x2="800" y2="180"/>
      <line x1="0" y1="270" x2="800" y2="270"/>
      <line x1="0" y1="360" x2="800" y2="360"/>
      <line x1="160" y1="0" x2="160" y2="450"/>
      <line x1="320" y1="0" x2="320" y2="450"/>
      <line x1="480" y1="0" x2="480" y2="450"/>
      <line x1="640" y1="0" x2="640" y2="450"/>
    </g>
    <rect x="210" y="135" width="380" height="180" rx="20" fill="#0B3B60" fill-opacity="0.72" stroke="#38BDF8" stroke-opacity="0.45" stroke-width="2"/>
    <text x="400" y="242" text-anchor="middle" fill="#FFFFFF" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="60" font-weight="800" letter-spacing="10">赛事新闻</text>
  </svg>`
)}`;

export const HELP_CENTER_MARKDOWN_DOC = `# 2026“XX杯”全国网数智安全大赛 · 平台使用指南与常见问题（FAQ）

> 欢迎访问“XX杯”全国网数智安全大赛官方竞赛平台帮助中心。本文档全面梳理了**账号与多维身份认证、队长建队与成员排序、三段式报名审核与校赛晋级、线上靶场接入与反作弊规范、电子获奖证书防伪核验**等全流程操作指引。

## 一、账号体系、实名核验与高校身份认证

### 1. 哪些人员可以报名参加 2026“XX杯”全国网数智安全大赛？
凡具有教育部正式学籍的全国普通高等学校、成人高等学校及港澳台高校在读**专科生、本科生、硕士研究生及博士研究生**均可报名参赛。
- **参赛学生（队长及队员）**：须在报名前登录【个人中心 - 用户认证】完成**个人实名认证**与**学生学籍认证**。
- **指导教师**：须在受邀指导前登录【个人中心 - 用户认证】完成**个人实名认证**与**教师资格认证**。
- **身份体系说明**：平台采用**“基础身份（普通用户 / 学生 / 教师，三选一互斥）+ 扩展身份（高校管理员 / 专家 / 秘书处，可叠加授权）”**的权限架构，其中学生认证与教师认证互斥，不可同时持有。

### 2. 学生学籍认证、指导教师认证及高校管理员申请分别需要哪些材料？
- **个人实名认证**：支持填写**二代居民身份证**或**护照**信息并上传证件正反面高清扫描件/照片，核验通过后全平台自动绑定真实姓名。
- **学生学籍认证**：需选择所属院校（支持检索全国高校名单）、学历层次（**专科 / 本科 / 硕士 / 博士及以上**）、就读专业、学号、入学时间与预计毕业时间，并上传清晰的**学生证内页照片**或**学信网《教育部学籍在线验证报告》截图**。
- **指导教师认证**：需选择所属院校、职称（教授/副教授/讲师等）、所在院系/部门、教工号，并上传**教师工作证、校园一卡通或院系盖章在职证明**照片。
- **高校管理员权限申请**：已完成**教师认证**的高校教师，可在【个人中心 - 用户认证】页面下方点击【申请成为高校管理员】，填写所在部门/职务、办公电话、申请备注并上传加盖学院或教务公章的**《高校管理员授权公函》**；亦可由组委会在后台【院校管理】模块直接为院校指定管理员。

### 3. 账号登录、密码安全策略与找回密码有什么规定？
- **多方式登录**：支持使用**用户名 / 绑定手机号 / 绑定邮箱 + 密码**登录，或使用**手机短信验证码**免密快捷登录。
- **高强度密码策略**：账号密码长度须为 **8~20 位**，且必须同时包含**大写字母、小写字母、数字和特殊符号**；修改或重置密码时，新密码不可与最近 **5 次**历史密码重复。
- **防爆破锁定与密码找回**：同一账号连续 **5 次**输入错误密码将自动触发 **15 分钟**安全锁定。如忘记密码，可在登录弹窗点击【忘记密码】，通过绑定手机号短信验证码在线重置；若账号已超过有效期或被停用，请联系本校高校管理员或组委会秘书处处理。

---

## 二、组队规则、成员排序与入队邀请确认

### 4. 每支参赛战队的人数限制是多少？是否允许跨校组队？
- **队伍人数配置**：各赛项的队伍人数上下限由后台赛事报名配置动态控制。常规团队赛一般由 **2 至 4 名**学生组成（含队长 1 名），每队可邀请 **0 至 2 名**指导教师；单兵个人赛仅限 **1 人（队长本人）**独立参赛，报名页面将自动隐藏“邀请队员”模块。
- **严格同校原则**：平台严格执行**同校组队与同校指导**强校验（鼓励同校内跨学院、跨专业联合组队）。队长仅可查询并邀请与本人认证**所属院校完全一致**且账号状态正常的学生作为队员、同校已认证教师作为指导教师，系统将自动拦截任何跨校邀请。
- **同赛事唯一性**：同一名参赛学生在同一个赛事中仅可作为队长发起或作为队员加入 **1 支**有效参赛队伍，不可兼报同赛事的多支战队；指导教师在同一赛事中可指导本校多支战队。

### 5. 为什么组队时要调整包含队长在内的参赛队员排序？（重要）
> **获奖证书打印顺序提醒**：在【赛事报名表填写】及未锁定的【队伍详情/管理页】中，队长可通过队员卡片右侧的 **【上移】/【下移】** 按钮，自由调整**包括队长本人在内的所有参赛队员**的先后顺位（**第 1 顺位、第 2 顺位……**）。**当前的报名人员顺序即为最终获奖证书上的姓名打印顺序**，请在正式提交高校审核前务必与全队成员确认顺位！

### 6. 队内 CTF 角色标签（Web手/Pwn手等）如何分配？
- **角色标签范围**：队长可为自己及每位团队成员勾选 **0~6 个** CTF 队内角色标签（**Web手、逆向手、Pwn手、密码学手、杂项手、取证手**），属于选填项；指导教师不参与 CTF 角色分配（固定显示为“-”）。
- **单一角色防呆弱提示**：若全队所有成员仅覆盖了某 1 个相同的角色方向（例如全队均为**Web手**），点击提交时系统将弹出黄色策略防呆提醒；确认符合战队策略后点击【确认提交】即可直接放行，不做强制拦截。

### 7. 队长发出邀请后，队员与指导教师如何确认？有人拒绝或未响应怎么办？
- **【暂存】与【保存并发出邀请】的区别**：
  - 点击 **【暂存】**：队伍保存为「**组建中**」草稿态，不会向名单内的队员或老师发送任何通知，队长可随时在【个人中心 - 我的报名 - 我发起的】中点击【继续编辑】。
  - 点击 **【保存并发出邀请】**：队伍进入「**邀请中**」状态，系统立即向所有拟邀请队员及指导教师发送站内信与短信通知。
- **受邀人处理流程**：受邀队员与指导教师可点击页面顶部铃铛图标（我的消息）或进入【个人中心 - 我的报名 - 我参与的】，查看队伍详情与队长分配的角色标签，点击 **【同意加入】** 或 **【拒绝】**（点击同意时系统将自动核验本人实名认证、学籍/教师认证及同校一致性）。
- **队长催办与换人机制**：在队伍处于「组建中」、「邀请中」或「高校审核已驳回」状态下，队长可在【队伍详情/管理页】对「**待确认**」成员点击 **【催办】** 发送提醒；对「**已拒绝**」或超时未确认的成员点击 **【移除】**（若移除「**已同意**」成员需经过二次确认），并随时输入新成员手机号/邮箱补充邀请。

---

## 三、三段式报名审核与校赛晋级全流程

### 8. 战队从组建到最终晋级全国总决赛，需要经过哪三个审核阶段？
本平台实行严密的**“队长正式提交 -> 第一段：高校资格审核 -> 第二段：高校晋级提报 -> 第三段：大赛秘书处终审”**三段式闭环机制：
1. **队长点击【正式提交高校审核】**：
   - **前置校验**：系统将严格校验**队员总人数（含队长）**与**指导教师人数**是否符合该赛事报名要求，且**所有已邀请的队员和指导教师必须全部为「已同意」状态**，否则无法提交。
   - 提交成功后，报名状态变更为 **「已提交」**，高校审核列显示 **「待审核」**，此时队伍信息与成员顺位进入锁定保护状态。
2. **第一段：高校资格审核（本校管理员初审）**：
   - 本校高校管理员对战队名称、成员学籍真实性及指导教师资格进行初审。
   - **初审通过**：前台报名状态变更为 **「高校已通过」**（处于等待校内选拔赛阶段），队伍信息保持只读锁定。
   - **初审驳回**：前台报名状态变更为 **「已驳回」**，鼠标悬浮于红色警告图标或进入详情页即可查看高校管理员填写的具体驳回原因；同时**系统自动解锁队伍编辑权限**，队长修改队伍信息、更换成员或调整顺位后，可再次点击【正式提交高校审核】。
3. **第二段：高校晋级提报（校内选拔赛排名与成绩单上传）**：
   - 校内选拔赛结束后，由本校高校管理员在后台【报名管理 - 高校晋级提报】模块中，从本校「高校已通过」的战队中勾选晋级队伍（严格受单校每赛项最大晋级队伍数限制，如最多 3 支/校）、排定**校内排名（第 1 名、第 2 名……）**，并上传加盖公章的**校赛成绩单/证明材料（PDF/图片）**统一提报至大赛秘书处。
   - **入围本校提报名单的战队**：报名状态自动更新为 **「待秘书处终审」**，并同步展示本校校内排名。
   - **未入围本校提报名单的战队**：报名状态自动更新为 **「未晋级」**（止步校赛），本次参赛流程正式结束。
4. **第三段：大赛组委会秘书处终审**：
   - 大赛秘书处对各高校提报的晋级队伍名单及校赛成绩证明材料进行合规终审。
   - **终审通过**：战队状态正式变更为 **「🎉 报名成功」**（已晋级决赛）！系统自动定格生成不可篡改的**报名成功只读快照**，同步归档至全体成员的【个人中心 - 我的竞赛】及后台【最终参赛队伍清单】，队长可在线下载带编号的**《晋级决赛报名成功确认回执单》**。
   - **终审驳回晋级名单**：若因高校上传的校赛成绩单公章模糊等原因被秘书处打回，状态显示为 **「待秘书处终审（名单被驳回）」**，此时由本校高校管理员重新上传合格证明材料并再次提报，**队长无需也不可修改队伍信息**。

---

## 四、我的竞赛、线上靶场接入与反作弊纪律

### 9. 【个人中心 - 我的报名】与【我的竞赛】有什么区别？
- **【我的报名】**：用于管理所有处于组建、受邀、审核流转周期中的队伍。分为**“我发起的（队长视角）”**与**“我参与的（队员/指导教师视角）”**两个标签页，实时跟踪入队确认进度与三段式审核状态。
- **【我的竞赛】**：仅归档展示**已通过高校与秘书处双级审核、正式获得总决赛参赛资格（即状态为「报名成功」）**的赛事记录。支持按参赛角色（全部 / 我是队长 / 我是队员 / 我是指导教师）及赛事状态筛选，点击 **【查看报名详情】** 可随时调阅定格快照中的参赛队员顺位、角色分工与联系方式。

### 10. 线上选拔赛与总决赛对靶场环境、作品提交及反作弊有哪些要求？
- **实战攻防靶场接入（CTF / AWD）**：参赛选手需使用支持 WireGuard / OpenVPN 协议的客户端接入专用竞赛内网，推荐使用 Chrome 115+、Edge 或 Firefox 现代浏览器，并在赛前完成靶机连通性与重放环境测试。
- **创新作品与方案赛提交**：须在规定窗口期内提交项目技术架构白皮书（PDF）、核心原型系统源码包及 5 分钟以内的功能演示视频，由评审专家组进行双盲评审。
- **零容忍反作弊红线**：平台全程开启流量指纹审计与动态 Flag 水印追踪。严禁不同战队之间共享、买卖 Flag 或解题脚本；严禁对平台基础设施、判题服务器或其他参赛队伍靶机发起拒绝服务（DoS/DDoS）攻击。一经查实违规，立即取消涉事战队全部成绩并向所在高校通报。

---

## 五、奖项评定与电子证书防伪查询验证

### 11. 获奖电子证书上的姓名顺序如何确定？如何在线查询与核验真伪？
- **证书姓名打印顺序**：官方签发的获奖证书严格按照队长在组队报名时排定的**参赛队员顺位（含队长本人）**依次打印姓名。
- **在线防伪核验与下载**：总决赛成绩公示期满无异议后，组委会将签发带 SHA-256 数字防伪签章的电子获奖证书。参赛师生及高校教务部门可在平台首页下方 **【电子证书查询与验证】** 模块，输入**获奖者姓名/身份证号**与**证书编号（如 XXCUP-2026-08921）**，即可在线核验防伪哈希值、预览证书原件并用于高校学分认定、保研综测及评奖评优备案。`;

export const HELP_CENTER_HOME_EXCERPT_MARKDOWN = `## 一、账号体系、实名核验与高校身份认证

### 1. 哪些人员可以报名参加 2026“XX杯”全国网数智安全大赛？
凡具有教育部正式学籍的全国普通高等学校、成人高等学校及港澳台高校在读**专科生、本科生、硕士研究生及博士研究生**均可报名参赛。参赛学生须在【个人中心 - 用户认证】完成**个人实名认证**与**学生学籍认证**，指导教师须完成**教师资格认证**。

### 2. 组队规则、同校要求与获奖证书姓名打印顺位说明
- **同校组队与指导**：团队赛一般由 **2~4 名**同校学生组成（含队长 1 名），可邀请 **0~2 名**同校已认证指导教师；单人赛制仅限 **1 人**参赛。
- **证书打印顺序提醒**：队长在组队时可通过【上移 / 下移】自由调整**包括队长本人在内的所有参赛队员**的排序，**当前的报名人员顺序即为最终获奖证书上的姓名打印顺序**。

### 3. 三段式报名审核与校赛晋级流程
遵循**“队长正式提交高校审核 -> 第一段：高校资格初审 -> 第二段：高校校赛晋级提报（含校内排名与成绩单） -> 第三段：大赛秘书处终审”**标准闭环，终审通过后即正式晋级决赛并生成报名成功快照与电子参赛回执单。`;

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string; // YYYY-MM-DD
  isFeaturedCover: boolean;
  visualType?: 'ceremony' | 'lab' | 'forum';
  content: string[];
}

export type MomentCategory = '进展报道' | '专家观点' | '团队风采' | '赛事花絮';

export interface MomentItem {
  id: string;
  title: string;
  category: MomentCategory;
  mediaType: 'article' | 'video';
  duration?: string;
  date: string;
  authorOrTeam: string;
  visualVariant: 'arena' | 'expert' | 'team' | 'behind' | 'defense' | 'award' | 'interview' | 'hackathon';
  summary: string;
  content: string[];
  videoHighlights?: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface CertificateRecord {
  certId: string;
  holderName: string;
  idCard: string;
  university: string;
  teamName: string;
  trackTitle: string;
  awardLevel: string;
  issueDate: string;
  advisor: string;
  verifyHash: string;
}

export interface UniversityPartner {
  id: string;
  name: string;
  shortName: string;
  enName: string;
  founded: string;
  primaryColor: string;
  secondaryColor: string;
  emblemType: 'shield' | 'circle' | 'hex' | 'arch';
  teamsCount: number;
  region: string;
}

export interface LeadershipOrg {
  id: string;
  name: string;
  role: '指导单位' | '主办单位' | '承办与技术支撑';
  url: string;
  description: string;
}

export interface RegistrationSubmission {
  id: string;
  trackId: string;
  trackTitle: string;
  teamName: string;
  university: string;
  captainName: string;
  studentId: string;
  phone: string;
  email: string;
  memberCount: number;
  advisorName: string;
  submittedAt: string;
  status: '已通过初审' | '资格审核中';
}

const createStaticBannerDataUri = (svgContent: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;

export const BANNER_POSTER_1 = createStaticBannerDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 460" width="1920" height="460" fill="none">
  <defs>
    <linearGradient id="bg1" x1="0" y1="0" x2="1920" y2="460" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#EBF3FF" />
      <stop offset="50%" stop-color="#D7E8FF" />
      <stop offset="100%" stop-color="#C2DCFF" />
    </linearGradient>
    <linearGradient id="titleGrad1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#093687" />
      <stop offset="55%" stop-color="#1664FF" />
      <stop offset="100%" stop-color="#2B7BFF" />
    </linearGradient>
    <linearGradient id="shieldOuter1" x1="1180" y1="60" x2="1520" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#B8D8FF" />
      <stop offset="100%" stop-color="#5B9EFF" />
    </linearGradient>
    <linearGradient id="shieldCore1" x1="1220" y1="95" x2="1480" y2="345" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2B7BFF" />
      <stop offset="55%" stop-color="#0E4FD6" />
      <stop offset="100%" stop-color="#082E85" />
    </linearGradient>
    <radialGradient id="glow1" cx="72%" cy="52%" r="40%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.92" />
      <stop offset="50%" stop-color="#85B8FF" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#DCEBFF" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1920" height="460" fill="url(#bg1)" />
  <ellipse cx="1380" cy="240" rx="560" ry="250" fill="url(#glow1)" />
  <g stroke="#3B82F6" stroke-opacity="0.16" stroke-width="1.5">
    <line x1="0" y1="360" x2="1920" y2="360" />
    <line x1="0" y1="405" x2="1920" y2="405" />
    <line x1="0" y1="445" x2="1920" y2="445" />
    <line x1="960" y1="310" x2="680" y2="460" />
    <line x1="1120" y1="310" x2="980" y2="460" />
    <line x1="1280" y1="310" x2="1280" y2="460" />
    <line x1="1440" y1="310" x2="1580" y2="460" />
    <line x1="1600" y1="310" x2="1880" y2="460" />
  </g>
  <g transform="translate(960, 20)">
    <g opacity="0.88">
      <polygon points="80,220 125,195 170,220 125,245" fill="#F0F7FF" stroke="#85B8FF" stroke-width="1.5" />
      <polygon points="80,220 125,245 125,310 80,285" fill="#CFE4FF" />
      <polygon points="170,220 125,245 125,310 170,285" fill="#9EC5FF" />
    </g>
    <g opacity="0.92">
      <polygon points="620,160 675,130 730,160 675,190" fill="#F5FAFF" stroke="#85B8FF" stroke-width="1.5" />
      <polygon points="620,160 675,190 675,295 620,265" fill="#D4E7FF" />
      <polygon points="730,160 675,190 675,295 730,265" fill="#9EC5FF" />
    </g>
    <ellipse cx="390" cy="365" rx="250" ry="52" fill="#9EC5FF" fill-opacity="0.45" stroke="#FFFFFF" stroke-width="2" />
    <ellipse cx="390" cy="350" rx="205" ry="40" fill="#D6E8FF" stroke="#FFFFFF" stroke-width="2.5" />
    <ellipse cx="390" cy="336" rx="155" ry="28" fill="#69A7FF" fill-opacity="0.35" stroke="#3B82F6" stroke-width="1.5" />
    <path d="M390 42 L525 92 V202 C525 292 465 348 390 382 C315 348 255 292 255 202 V92 Z" fill="url(#shieldOuter1)" stroke="#FFFFFF" stroke-width="4" />
    <path d="M390 64 L503 106 V200 C503 274 452 322 390 352 C328 322 277 274 277 200 V106 Z" fill="url(#shieldCore1)" stroke="#7CC0FF" stroke-width="2" />
    <rect x="358" y="182" width="64" height="52" rx="10" fill="#E8F3FF" stroke="#FFFFFF" stroke-width="2" />
    <path d="M372 182 V162 C372 150 380 142 390 142 C400 142 408 150 408 162 V182" stroke="#E8F3FF" stroke-width="8" stroke-linecap="round" fill="none" />
    <circle cx="390" cy="203" r="6" fill="#0E4FD6" />
    <path d="M390 209 V221" stroke="#0E4FD6" stroke-width="4" stroke-linecap="round" />
  </g>
  <g transform="translate(240, 82)">
    <rect x="0" y="0" width="44" height="6" rx="3" fill="#1664FF" />
    <text x="56" y="8" fill="#1664FF" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="15" font-weight="700" letter-spacing="1.5">2026年度国家级高水平数字安全赛事 · 全面启动</text>
    <path d="M0 24 H340 V34" stroke="#4B94FF" stroke-opacity="0.65" stroke-width="2" fill="none" />
    <text x="0" y="106" fill="url(#titleGrad1)" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="64" font-weight="900" letter-spacing="4">“XX杯”</text>
    <text x="0" y="182" fill="url(#titleGrad1)" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="60" font-weight="900" letter-spacing="3">网数智安全大赛</text>
    <text x="2" y="222" fill="#1D4ED8" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="14" font-weight="800" letter-spacing="5">GREAT WALL CUP CYBER SECURITY COMPETITION</text>
    <text x="2" y="272" fill="#15459E" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="22" font-weight="800" letter-spacing="3">&lt;&lt;  守护网络安全 · 筑牢安全防线  &gt;&gt;</text>
  </g>
</svg>`);

export const BANNER_POSTER_2 = createStaticBannerDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 460" width="1920" height="460" fill="none">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1920" y2="460" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E4F0FF" />
      <stop offset="50%" stop-color="#CCE2FF" />
      <stop offset="100%" stop-color="#B3D4FF" />
    </linearGradient>
    <linearGradient id="titleGrad2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#082F78" />
      <stop offset="55%" stop-color="#1358E8" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <linearGradient id="arenaCore2" x1="1200" y1="80" x2="1520" y2="360" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1D4ED8" />
      <stop offset="100%" stop-color="#092768" />
    </linearGradient>
  </defs>
  <rect width="1920" height="460" fill="url(#bg2)" />
  <g stroke="#2563EB" stroke-opacity="0.14" stroke-width="1.5">
    <line x1="0" y1="115" x2="1920" y2="115" />
    <line x1="0" y1="230" x2="1920" y2="230" />
    <line x1="0" y1="345" x2="1920" y2="345" />
    <line x1="480" y1="0" x2="480" y2="460" />
    <line x1="960" y1="0" x2="960" y2="460" />
    <line x1="1440" y1="0" x2="1440" y2="460" />
  </g>
  <g transform="translate(1020, 35)">
    <circle cx="340" cy="195" r="175" fill="#FFFFFF" fill-opacity="0.55" stroke="#60A5FA" stroke-width="2" stroke-dasharray="10 6" />
    <circle cx="340" cy="195" r="135" fill="url(#arenaCore2)" stroke="#93C5FD" stroke-width="3" />
    <polygon points="340,92 430,144 430,246 340,298 250,246 250,144" fill="#1E40AF" stroke="#60A5FA" stroke-width="2.5" />
    <text x="340" y="188" text-anchor="middle" fill="#FFFFFF" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="34" font-weight="900" letter-spacing="3">CTF + AWD</text>
    <text x="340" y="224" text-anchor="middle" fill="#93C5FD" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="16" font-weight="700" letter-spacing="2">实网攻防对抗靶场</text>
    <rect x="80" y="70" width="145" height="64" rx="12" fill="#FFFFFF" fill-opacity="0.88" stroke="#60A5FA" stroke-width="2" />
    <text x="152" y="98" text-anchor="middle" fill="#0F3C96" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="15" font-weight="800">夺旗挑战赛</text>
    <text x="152" y="120" text-anchor="middle" fill="#2563EB" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="12" font-weight="700">48小时线上选拔</text>
    <rect x="460" y="255" width="160" height="64" rx="12" fill="#FFFFFF" fill-opacity="0.88" stroke="#60A5FA" stroke-width="2" />
    <text x="540" y="283" text-anchor="middle" fill="#0F3C96" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="15" font-weight="800">AWD Plus 决赛</text>
    <text x="540" y="305" text-anchor="middle" fill="#2563EB" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="12" font-weight="700">漏洞挖掘与加固防御</text>
  </g>
  <g transform="translate(240, 82)">
    <rect x="0" y="0" width="44" height="6" rx="3" fill="#1664FF" />
    <text x="56" y="8" fill="#1664FF" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="15" font-weight="700" letter-spacing="1.5">网络安全攻防实战赛 · 核心主赛道火热报名中</text>
    <path d="M0 24 H340 V34" stroke="#4B94FF" stroke-opacity="0.65" stroke-width="2" fill="none" />
    <text x="0" y="106" fill="url(#titleGrad2)" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="58" font-weight="900" letter-spacing="3">网络安全攻防实战赛</text>
    <text x="0" y="178" fill="url(#titleGrad2)" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="46" font-weight="900" letter-spacing="2">CTF夺旗挑战 + AWD Plus对抗</text>
    <text x="2" y="222" fill="#1D4ED8" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="14" font-weight="800" letter-spacing="4">NATIONAL COLLEGE CYBER DEFENSE ARENA 2026</text>
    <text x="2" y="272" fill="#15459E" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="22" font-weight="800" letter-spacing="3">&lt;&lt;  以赛促学 · 锤炼实战化网安精英战队  &gt;&gt;</text>
  </g>
</svg>`);

export const BANNER_POSTER_3 = createStaticBannerDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 460" width="1920" height="460" fill="none">
  <defs>
    <linearGradient id="bg3" x1="0" y1="0" x2="1920" y2="460" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E6F4FF" />
      <stop offset="50%" stop-color="#CDE8FF" />
      <stop offset="100%" stop-color="#B6DCFF" />
    </linearGradient>
    <linearGradient id="titleGrad3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#073980" />
      <stop offset="55%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#1664FF" />
    </linearGradient>
    <linearGradient id="cubeTop3" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#BAE6FD" />
    </linearGradient>
    <linearGradient id="cubeLeft3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0C4A6E" />
    </linearGradient>
    <linearGradient id="cubeRight3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>
  </defs>
  <rect width="1920" height="460" fill="url(#bg3)" />
  <g transform="translate(1030, 35)">
    <ellipse cx="330" cy="345" rx="230" ry="44" fill="#7DD3FC" fill-opacity="0.4" stroke="#FFFFFF" stroke-width="2" />
    <polygon points="330,65 460,135 330,205 200,135" fill="url(#cubeTop3)" stroke="#FFFFFF" stroke-width="3" />
    <polygon points="200,135 330,205 330,340 200,270" fill="url(#cubeLeft3)" stroke="#7DD3FC" stroke-width="2" />
    <polygon points="460,135 330,205 330,340 460,270" fill="url(#cubeRight3)" stroke="#7DD3FC" stroke-width="2" />
    <circle cx="330" cy="135" r="24" fill="#0284C7" stroke="#FFFFFF" stroke-width="3" />
    <text x="330" y="142" text-anchor="middle" fill="#FFFFFF" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="16" font-weight="900">AI</text>
    <rect x="75" y="105" width="135" height="54" rx="10" fill="#FFFFFF" fill-opacity="0.9" stroke="#38BDF8" stroke-width="2" />
    <text x="142" y="138" text-anchor="middle" fill="#0369A1" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="15" font-weight="800">联邦学习 · 隐私计算</text>
    <rect x="455" y="115" width="145" height="54" rx="10" fill="#FFFFFF" fill-opacity="0.9" stroke="#38BDF8" stroke-width="2" />
    <text x="527" y="148" text-anchor="middle" fill="#0369A1" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="15" font-weight="800">同态加密 · 数据脱敏</text>
  </g>
  <g transform="translate(240, 82)">
    <rect x="0" y="0" width="44" height="6" rx="3" fill="#0284C7" />
    <text x="56" y="8" fill="#0369A1" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="15" font-weight="700" letter-spacing="1.5">重要赛事公告 · 2026赛制全新升级</text>
    <path d="M0 24 H340 V34" stroke="#38BDF8" stroke-opacity="0.75" stroke-width="2" fill="none" />
    <text x="0" y="106" fill="url(#titleGrad3)" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="56" font-weight="900" letter-spacing="3">数据安全与隐私计算</text>
    <text x="0" y="178" fill="url(#titleGrad3)" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="48" font-weight="900" letter-spacing="2">专项挑战赛独立赛道正式开启</text>
    <text x="2" y="222" fill="#0369A1" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="14" font-weight="800" letter-spacing="4">DATA SECURITY &amp; PRIVACY COMPUTING CHALLENGE</text>
    <text x="2" y="272" fill="#0C4A6E" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="22" font-weight="800" letter-spacing="3">&lt;&lt;  护航数据要素流通 · 探索大模型内生安全  &gt;&gt;</text>
  </g>
</svg>`);

export const BANNER_POSTER_4 = createStaticBannerDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 460" width="1920" height="460" fill="none">
  <defs>
    <linearGradient id="bg4" x1="0" y1="0" x2="1920" y2="460" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#EBF3FF" />
      <stop offset="55%" stop-color="#D4E6FF" />
      <stop offset="100%" stop-color="#BDD7FF" />
    </linearGradient>
    <linearGradient id="titleGrad4" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#093687" />
      <stop offset="55%" stop-color="#1664FF" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <linearGradient id="certCard4" x1="1120" y1="75" x2="1560" y2="355" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#EFF6FF" />
    </linearGradient>
  </defs>
  <rect width="1920" height="460" fill="url(#bg4)" />
  <g transform="translate(1020, 45)">
    <rect x="110" y="35" width="440" height="290" rx="20" fill="url(#certCard4)" stroke="#60A5FA" stroke-width="3" />
    <rect x="132" y="57" width="396" height="246" rx="12" fill="none" stroke="#BFDBFE" stroke-width="2" stroke-dasharray="6 4" />
    <circle cx="465" cy="115" r="36" fill="#DBEAFE" stroke="#2563EB" stroke-width="2.5" />
    <text x="465" y="112" text-anchor="middle" fill="#1D4ED8" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="13" font-weight="900">国密签章</text>
    <text x="465" y="130" text-anchor="middle" fill="#2563EB" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="11" font-weight="700">权威核验</text>
    <text x="165" y="110" fill="#0F3C96" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="24" font-weight="900">荣誉获奖电子证书</text>
    <rect x="165" y="135" width="220" height="10" rx="5" fill="#93C5FD" />
    <rect x="165" y="160" width="180" height="10" rx="5" fill="#BFDBFE" />
    <rect x="165" y="185" width="250" height="10" rx="5" fill="#BFDBFE" />
    <rect x="165" y="228" width="330" height="42" rx="8" fill="#EFF6FF" stroke="#93C5FD" stroke-width="1.5" />
    <text x="330" y="254" text-anchor="middle" fill="#1D4ED8" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="14" font-weight="800" letter-spacing="1">防伪哈希校验 · 支持在线一键核验</text>
  </g>
  <g transform="translate(240, 82)">
    <rect x="0" y="0" width="44" height="6" rx="3" fill="#1664FF" />
    <text x="56" y="8" fill="#1664FF" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="15" font-weight="700" letter-spacing="1.5">权威认证 · 官方电子证书公开核验通道</text>
    <path d="M0 24 H340 V34" stroke="#4B94FF" stroke-opacity="0.65" stroke-width="2" fill="none" />
    <text x="0" y="106" fill="url(#titleGrad4)" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="56" font-weight="900" letter-spacing="3">获奖电子证书防伪查询</text>
    <text x="0" y="178" fill="url(#titleGrad4)" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="48" font-weight="900" letter-spacing="2">国密数字签名与在线核验服务</text>
    <text x="2" y="222" fill="#1D4ED8" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="14" font-weight="800" letter-spacing="4">OFFICIAL DIGITAL CERTIFICATE VERIFICATION</text>
    <text x="2" y="272" fill="#15459E" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="22" font-weight="800" letter-spacing="3">&lt;&lt;  一证一码防伪溯源 · 常年开放权威核验  &gt;&gt;</text>
  </g>
</svg>`);

export const BANNER_POSTER_5 = createStaticBannerDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 460" width="1920" height="460" fill="none">
  <defs>
    <linearGradient id="bg5" x1="0" y1="0" x2="1920" y2="460" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#EEF2FF" />
      <stop offset="50%" stop-color="#E0E7FF" />
      <stop offset="100%" stop-color="#C7D2FE" />
    </linearGradient>
    <linearGradient id="titleGrad5" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="55%" stop-color="#3730A3" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>
    <linearGradient id="aiOrb5" x1="1180" y1="70" x2="1520" y2="360" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#1E1B4B" />
    </linearGradient>
  </defs>
  <rect width="1920" height="460" fill="url(#bg5)" />
  <g stroke="#4F46E5" stroke-opacity="0.12" stroke-width="1.5">
    <line x1="0" y1="130" x2="1920" y2="130" />
    <line x1="0" y1="260" x2="1920" y2="260" />
    <line x1="0" y1="390" x2="1920" y2="390" />
  </g>
  <g transform="translate(1030, 35)">
    <circle cx="330" cy="195" r="170" fill="#FFFFFF" fill-opacity="0.6" stroke="#818CF8" stroke-width="2" stroke-dasharray="8 6" />
    <circle cx="330" cy="195" r="130" fill="url(#aiOrb5)" stroke="#A5B4FC" stroke-width="3" />
    <text x="330" y="188" text-anchor="middle" fill="#FFFFFF" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="34" font-weight="900" letter-spacing="2">AI SECURITY</text>
    <text x="330" y="224" text-anchor="middle" fill="#C7D2FE" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="16" font-weight="700" letter-spacing="2">大模型越狱防御与深度鉴伪</text>
    <rect x="65" y="85" width="150" height="58" rx="12" fill="#FFFFFF" fill-opacity="0.92" stroke="#818CF8" stroke-width="2" />
    <text x="140" y="120" text-anchor="middle" fill="#3730A3" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="15" font-weight="800">提示词注入检测</text>
    <rect x="455" y="245" width="155" height="58" rx="12" fill="#FFFFFF" fill-opacity="0.92" stroke="#818CF8" stroke-width="2" />
    <text x="532" y="280" text-anchor="middle" fill="#3730A3" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="15" font-weight="800">AIGC 溯源与鲁棒防御</text>
  </g>
  <g transform="translate(240, 82)">
    <rect x="0" y="0" width="44" height="6" rx="3" fill="#4F46E5" />
    <text x="56" y="8" fill="#4338CA" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="15" font-weight="700" letter-spacing="1.5">前沿技术先导赛 · 国家级智算云靶场集群支持</text>
    <path d="M0 24 H340 V34" stroke="#818CF8" stroke-opacity="0.75" stroke-width="2" fill="none" />
    <text x="0" y="106" fill="url(#titleGrad5)" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="56" font-weight="900" letter-spacing="3">大模型与人工智能安全</text>
    <text x="0" y="178" fill="url(#titleGrad5)" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="48" font-weight="900" letter-spacing="2">先导挑战赛 · 智算攻防演练</text>
    <text x="2" y="222" fill="#4338CA" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="14" font-weight="800" letter-spacing="4">LARGE MODEL &amp; AI ENDOGENOUS SECURITY</text>
    <text x="2" y="272" fill="#312E81" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="22" font-weight="800" letter-spacing="3">&lt;&lt;  筑牢大模型内生安全 · 赋能可信人工智能  &gt;&gt;</text>
  </g>
</svg>`);

export const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'banner-1',
    kicker: '2026年度国家级高水平数字安全赛事 · 全面启动',
    title: '第五届“XX杯”网数智安全大赛正式开启报名',
    subtitle: '聚焦网络空间防御、数据要素流通安全与大模型内生安全三大前沿方向，全国高校战队同台竞技，角逐百万赛事奖金与国家级荣誉证书。',
    ctaText: '立即报名参赛',
    secondaryCtaText: '查阅参赛指南',
    targetType: 'track',
    targetId: 'track-net-2026',
    visualTheme: 'summit',
    displayPeriod: '2026.10.01 - 2026.12.20',
    imageUrl: BANNER_POSTER_1,
  },
  {
    id: 'banner-2',
    kicker: '网络安全攻防实战赛 · 核心主赛道火热报名中',
    title: '网络安全攻防实战赛：CTF夺旗挑战 + AWD Plus攻防对抗',
    subtitle: '采用“CTF夺旗挑战 + 真实业务场景AWD Plus攻防对抗”双轨赛制，请各参赛高校队长尽快完成学籍认证与指导教师绑定。',
    ctaText: '直达攻防赛道报名',
    secondaryCtaText: '查看赛程通知',
    targetType: 'track',
    targetId: 'track-net-2026',
    visualTheme: 'countdown',
    displayPeriod: '2026.10.15 - 2026.11.15',
    imageUrl: BANNER_POSTER_2,
  },
  {
    id: 'banner-3',
    kicker: '重要赛事公告 · 赛制升级说明',
    title: '新增“数据安全与隐私计算挑战赛”独立赛道公告',
    subtitle: '面向联邦学习、同态加密、数据脱敏水印与跨境数据合规审计场景，开放真实脱敏政务与金融数据集供参赛战队验证算法。',
    ctaText: '阅读官方通知全文',
    secondaryCtaText: '预约赛道提醒',
    targetType: 'notice',
    targetId: 'notice-1',
    visualTheme: 'ai_track',
    displayPeriod: '2026.10.20 - 2026.12.31',
    imageUrl: BANNER_POSTER_3,
  },
  {
    id: 'banner-4',
    kicker: '权威认证 · 电子证书公开核验通道已上线',
    title: '历届“XX杯”获奖电子证书防伪查询与验证服务',
    subtitle: '支持按证书编号或获奖选手姓名实时检索，采用国密数字签名与哈希校验技术，为高校保研加分、评奖评优与名企招聘提供权威核验依据。',
    ctaText: '前往证书核验专区',
    targetType: 'verify',
    targetId: 'cert-section',
    visualTheme: 'finals',
    displayPeriod: '常年开放服务',
    imageUrl: BANNER_POSTER_4,
  },
];

export const COMPETITION_TRACKS: CompetitionTrack[] = [
  {
    id: 'track-net-2026',
    catalogId: 'comp-2026-main',
    title: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    category: '核心主赛道 · 攻防对抗',
    startDate: '2026-10-15',
    endDate: '2026-12-20',
    organizer: '“XX杯”全国网数智安全大赛组委会、国家信息安全工程技术研究中心',
    coOrganizer: '中国网络空间安全协会竞评演练工作委员会',
    status: 'registering',
    statusLabel: '进行中',
    visualType: 'network',
    prizePool: '¥ 500,000',
    teamSize: '1 - 4 人/队（须同校组队）',
    targetGroup: '全国高等院校全日制在读本、硕、博学生',
    summary: '围绕关键信息基础设施防护、云原生架构漏洞挖掘、工业互联网协议安全与实战化蓝军防御展开，分设线上夺旗选拔赛（CTF）与线下总决赛（AWD Plus靶场对抗）。',
    schedule: [
      { stage: '大赛报名与学籍核验', date: '2026年10月15日 - 11月15日', detail: '在线提交战队成员名单、上传学生证或学信网在线验证码。' },
      { stage: '线上赛前热身练习赛', date: '2026年11月18日 09:00 - 21:00', detail: '开放靶场网络连通性测试与样题演练。' },
      { stage: '全国线上初赛（CTF模式）', date: '2026年11月22日 - 11月23日', detail: '48小时不间断线上解题，前60支高校战队晋级总决赛。' },
      { stage: '全国总决赛暨颁奖典礼', date: '2026年12月19日 - 12月20日', detail: '线下实网靶场综合渗透与加固对抗，现场决出特等奖及一二三等奖。' },
    ],
    requirements: [
      '参赛选手须为全国普通高等院校全日制在校生，每支队伍最多4名队员及1名本校指导教师。',
      '严禁跨校组队（联合培养生须以学籍注册高校为准），每人同一赛道仅限加入一支战队。',
      '比赛期间严禁对赛事平台实施DDoS攻击或与其他战队违规交换Flag，违者取消整队成绩并通报所在院校。',
    ],
    registeredTeamsCount: 1428,
  },
  {
    id: 'track-data-2026',
    catalogId: 'comp-2026-data',
    title: '2026“XX杯”全国网数智安全大赛 · 数据安全与隐私计算专项挑战赛',
    category: '专项赛道 · 数据要素',
    startDate: '2026-11-10',
    endDate: '2026-12-28',
    organizer: '国家数据安全重点实验室、“XX杯”全国网数智安全大赛组委会',
    coOrganizer: '新一代人工智能与数据治理研究院',
    status: 'upcoming',
    statusLabel: '未开始',
    visualType: 'data',
    prizePool: '¥ 350,000',
    teamSize: '2 - 4 人/队（允许跨院系）',
    targetGroup: '全国高校计算机、网安、数学、统计及相关专业学生',
    summary: '针对公共数据授权运营、金融多方安全计算（MPC）、联邦学习隐私泄露防御及大规模敏感数据智能分类分级设置算法与工程赛题，检验数据“可用不可见”实战能力。',
    schedule: [
      { stage: '报名通道正式开启', date: '2026年11月10日 10:00', detail: '开放赛道报名、发布初赛脱敏训练数据集与基线模型代码。' },
      { stage: '算法评测A榜阶段', date: '2026年11月15日 - 12月05日', detail: '每日开放3次容器镜像提交评测，实时更新全国排行榜。' },
      { stage: '算法评测B榜锁定', date: '2026年12月06日 - 12月10日', detail: '切换高强度对抗测试集，检验隐私保护算法鲁棒性与吞吐性能。' },
      { stage: '线下决赛答辩与路演', date: '2026年12月27日 - 12月28日', detail: '入围前30强战队进行现场代码复现核验与专家评审委员会问询答辩。' },
    ],
    requirements: [
      '参赛算法须基于组委会指定开源框架构建，提交完整可复现Docker镜像与技术报告。',
      '严禁使用外部未公开商业API或人工标注测试集数据。',
    ],
    registeredTeamsCount: 386,
  },
  {
    id: 'track-ai-2026',
    catalogId: 'comp-2026-ai-pilot',
    title: '2026“XX杯”全国网数智安全大赛 · 大模型与人工智能安全先导赛',
    category: '先导赛道 · 智算安全',
    startDate: '2026-06-01',
    endDate: '2026-09-25',
    organizer: '“XX杯”全国网数智安全大赛组委会、新一代人工智能安全与评测创新中心',
    coOrganizer: '国家智能网联与数字安全创新中心',
    status: 'ended',
    statusLabel: '已结束',
    visualType: 'ai',
    prizePool: '¥ 300,000',
    teamSize: '1 - 3 人/队',
    targetGroup: '全国高校及科研院所在读青年学者与学生团队',
    summary: '围绕大语言模型越狱攻击与防御围栏、AIGC深度伪造多模态溯源鉴伪、智能体（Agent）提示词注入免疫等核心课题，已完成全部赛程并公示获奖名单。',
    schedule: [
      { stage: '战队报名与赛题发布', date: '2026年06月01日 - 07月10日', detail: '吸引全国218所高校共960余支队伍参赛。' },
      { stage: '红蓝对抗双向评测', date: '2026年07月15日 - 08月25日', detail: '攻击方构造对抗样本与防御方安全护栏同场博弈。' },
      { stage: '总决赛暨成果发布', date: '2026年09月20日 - 09月25日', detail: '圆满落幕，36支战队斩获全国等级奖，电子证书已开放核验。' },
    ],
    requirements: [
      '本赛道2026年度赛程已圆满结束，获奖队伍可前往首页下方“电子证书查询与验证”专区核验及下载证书。',
    ],
    registeredTeamsCount: 964,
  },
];

export const NOTICE_ITEMS: NoticeItem[] = [
  {
    id: 'notice-1',
    title: '关于发布《第五届“XX杯”网数智安全大赛参赛指南与赛制章程（2026修订版）》的通知',
    date: '10-26',
    fullDate: '2026-10-26',
    isPinned: true,
    category: '通知',
    summary: '全面规定第五届“XX杯”全国网数智安全大赛三大主力赛道赛制规则、高校学籍核验标准、评分权重及官方附件模板下载。',
    viewsCount: 24680,
    department: '“XX杯”全国网数智安全大赛组委会秘书处',
    docNumber: '',
    content: [
      '各有关高等院校、参赛指导教师及参赛团队：',
      '为深入贯彻落实国家关于加强网络安全、数据安全与人工智能安全人才培养的战略部署，全面提升高校学生在复杂数字环境下的实战攻防与安全治理能力，第五届“XX杯”全国网数智安全大赛定于2026年10月至12月举行。',
      '本届大赛在保留传统“网络安全攻防实战赛”优势基础上，全面升级“数据安全与隐私计算挑战赛”与“大模型与人工智能安全先导赛”，形成网、数、智三位一体的综合性国家级竞技平台。',
      '请各参赛高校组织本院系学生按时通过官网“赛事目录”或“赛事通道”完成在线组队与学籍认证。详细评分细则、靶场环境技术规范及违规处罚条例请下载本通知下方附件查阅。',
    ],
    attachments: [
      { name: '附件1：第五届“XX杯”网数智安全大赛章程与赛制总则.pdf', size: '2.4 MB' },
      { name: '附件2：高校参赛队学籍认证与指导教师承诺书模板.docx', size: '480 KB' },
    ],
  },
  {
    id: 'notice-2',
    title: '关于开展2026“XX杯”网络安全攻防实战赛线上靶场连通性测试与赛前培训的通知',
    date: '10-24',
    fullDate: '2026-10-24',
    isPinned: true,
    category: '创新赛通知',
    summary: '定于2026年11月18日09:00至21:00开放全真模拟热身靶场，提供Web、Reverse、Pwn、Crypto、Misc共5道样题及VPN接入自检。',
    viewsCount: 19340,
    department: '大赛技术保障组 & 裁判委员会',
    docNumber: '',
    content: [
      '各已报名参赛战队：',
      '为确保全国线上初赛期间各战队客户端VPN接入、容器靶机下发与Flag提交系统稳定运行，技术保障组将于2026年11月18日09:00至21:00开放全真模拟热身靶场。',
      '本次测试将提供Web安全、逆向工程（Reverse）、二进制漏洞利用（Pwn）、密码学（Crypto）及杂项（Misc）共5道样题。测试成绩不计入正式初赛总分，但强烈建议所有战队至少安排1名队员登录完成连通性校验。',
    ],
    attachments: [
      { name: '“XX杯”云端实网靶场客户端接入配置手册_v3.2.pdf', size: '3.1 MB' },
    ],
  },
  {
    id: 'notice-6',
    title: '关于2026“XX杯”物联网固件逆向与智能终端安全挑战赛名额满员暨提前关闭报名通道的公告',
    date: '10-27',
    fullDate: '2026-10-27',
    isPinned: false,
    category: '创新赛通知',
    summary: '鉴于远程硬件在环（HIL）仿真台架并发配额已达上限，经组委会研究决定提前关闭该赛项在线报名通道，已提交战队正常进入资格审核。',
    viewsCount: 11250,
    department: '“XX杯”大赛技术保障组',
    docNumber: '',
    content: [
      '各参赛高校及战队：',
      '鉴于“物联网固件逆向与智能终端安全挑战赛”硬件在环（HIL）仿真台架并发配额已达上限，经组委会研究决定，提前关闭该赛项在线报名通道。已完成报名提交的战队正常进入资格审核阶段。',
    ],
  },
  {
    id: 'notice-7',
    title: '关于公示首批通过高校学籍与指导教师资格联审的参赛战队名单（第一批 620 支）的通告',
    date: '10-25',
    fullDate: '2026-10-25',
    isPinned: false,
    category: '通知',
    summary: '首批620支高校参赛战队已完成教育部学信网在线验证码核验与指导教师资格复核，现予正式公示，被驳回队伍请及时修改重交。',
    viewsCount: 15820,
    department: '“XX杯”大赛资格审查委员会',
    docNumber: '',
    content: [
      '截至2026年10月25日12:00，大赛资格审查委员会已完成首批620支高校参赛战队的教育部学信网在线验证码核验与指导教师资格复核。',
      '请被标记为“已驳回”的战队队长尽快登录【个人中心 -> 我的报名】查看具体驳回原因（如跨校指导教师不合规、证件照片模糊等），并在报名截止前完成人员更换与重新提交。',
    ],
    attachments: [
      { name: '附件：第五届“XX杯”首批通过资格审核高校战队公示名册（第一批）.pdf', size: '4.2 MB' },
    ],
  },
  {
    id: 'notice-3',
    title: '关于“大模型与人工智能安全先导赛”全国总决赛获奖名单公示及电子证书发放的公告',
    date: '10-18',
    fullDate: '2026-10-18',
    isPinned: false,
    category: '创新赛通知',
    summary: '公布2026“XX杯”大模型与人工智能安全先导赛全国特等奖及一二三等奖最终名单，国密SM3防伪电子证书现已开放公开查询。',
    viewsCount: 22190,
    department: '“XX杯”大赛评审委员会',
    docNumber: '',
    content: [
      '经过初赛算法评测、复赛红蓝双向对抗及线下专家评审答辩，2026“XX杯”大模型与人工智能安全先导赛已圆满完成全部赛程，共评出全国特等奖2项、一等奖8项、二等奖16项、三等奖30项及优秀指导教师奖10名。',
      '现将最终获奖名单予以正式公布。即日起，获奖选手与指导教师可通过本官网首页“获奖查询”模块，输入身份信息（姓名或身份证号）与证书编号（如：XXCUP-2026-08921）进行公开核验。',
    ],
  },
  {
    id: 'notice-4',
    title: '关于征集第五届“XX杯”网数智安全大赛高校校园大使及协办社团的报名通知',
    date: '10-12',
    fullDate: '2026-10-12',
    isPinned: false,
    category: '通知',
    summary: '面向全国普通高等院校公开招募校园推广大使及官方合作CTF安全技术社团，提供官方聘书、技术沙龙支持及总决赛观摩名额。',
    viewsCount: 8940,
    department: '大赛高校联络工作组',
    docNumber: '',
    content: [
      '为进一步推动网络安全与数据安全知识在高校校园的普及，促进校际CTF战队与安全技术社团的交流合作，组委会现面向全国高校公开招募“校园推广大使”及“官方合作安全社团”。',
      '入选校园大使将获得组委会颁发的官方聘书、赛事专属周边礼包及总决赛现场观摩名额；优秀组织社团所在高校将优先获评大赛“优秀组织单位奖”。',
    ],
  },
  {
    id: 'notice-5',
    title: '关于严禁比赛期间跨队协同作弊、利用自动化扫描器恶意攻击比赛平台基础设施的纪律重申',
    date: '10-08',
    fullDate: '2026-10-08',
    isPinned: false,
    category: '通知',
    summary: '比赛期间全流量态势感知与反作弊审计系统将实时监测解题Writeup雷同度、异常Flag提交时间序列及非授权IP共享行为。',
    viewsCount: 13400,
    department: '大赛仲裁与纪律监督委员会',
    docNumber: '',
    content: [
      '“XX杯”网数智安全大赛始终秉持“公平、公正、严谨、实战”的办赛原则。比赛期间，平台全流量态势感知与反作弊审计系统将实时监测解题Writeup雷同度、异常Flag提交时间序列及非授权IP共享行为。',
      '一经查实存在跨队买卖或共享Flag、故意破坏靶场公共组件等违纪行为，仲裁委员会将立即取消相关队伍参赛资格，并向参赛选手所在高校教务处或研究生院发送正式违纪通报函。',
    ],
  },
  {
    id: 'notice-8',
    title: '关于发布《2026“XX杯”作品赛原型系统技术白皮书与演示视频提交规范》的通知',
    date: '10-05',
    fullDate: '2026-10-05',
    isPinned: false,
    category: '作品赛通知',
    summary: '明确作品赛阶段原型系统源码包、技术架构白皮书与5分钟功能演示视频的提交时限与评分细则，附标准模板下载。',
    viewsCount: 10560,
    department: '大赛裁判委员会',
    docNumber: '',
    content: [
      '为确保作品赛评审客观公正，所有参赛队伍须在规定窗口期内按标准模板提交含完整部署说明、架构设计与核心代码仓库的作品材料包。未按时提交或核心功能无法复现的作品将不予进入终审答辩。',
    ],
    attachments: [
      { name: '附件：“XX杯”全国网数智安全大赛作品赛技术白皮书标准模板（LaTeX & Word版）.zip', size: '1.6 MB' },
    ],
  },
  {
    id: 'notice-9',
    title: '关于配发2026“XX杯”数据安全与隐私计算创新赛云端NVIDIA A800算力代金券的通知',
    date: '10-03',
    fullDate: '2026-10-03',
    isPinned: false,
    category: '创新赛通知',
    summary: '为降低高校战队大模型微调与隐私计算联邦学习实验门槛，组委会为每支通过学籍审核的参赛队伍免费配发100机时云端GPU算力配额。',
    viewsCount: 9280,
    department: '国家数据安全重点实验室 & 大赛算力调度组',
    docNumber: '',
    content: [
      '各参加“数据安全与隐私计算挑战赛”的高校战队：',
      '为保障所有参赛队伍在统一、公平的硬件基准下开展联邦学习隐私保护与密态计算评测，组委会联合国家超算中心为每支通过资格审核的队伍免费开通云端容器算力沙箱。',
      '队长可凭战队唯一识别码在靶场控制台领取算力配额，严禁将赛事算力用于非比赛相关的算力挖矿或商业模型训练。',
    ],
  },
  {
    id: 'notice-10',
    title: '关于对接教育部全国普通高等学校10位标识码标准库开展参赛院校资格核验的公告',
    date: '09-29',
    fullDate: '2026-09-29',
    isPinned: false,
    category: '通知',
    summary: '本平台院校库严格依据教育部全国普通高等学校名单（含普通本科、职业本科、高职专科）构建，支持CARSI联邦与学信网双通道核验。',
    viewsCount: 11730,
    department: '“XX杯”大赛资格审查委员会',
    docNumber: '',
    content: [
      '各参赛院校领队及参赛师生：',
      '为规范高校集体奖项统计与参赛学籍核验，大赛平台已全面启用教育部10位学校标识码标准库（如北京大学 4111010001、清华大学 4111010003）。',
      '如遇院校更名或新设职业本科院校未在下拉列表中显示，请由本校领队教师联系组委会秘书处提交教育部批文进行标准库同步更新。',
    ],
  },
  {
    id: 'notice-11',
    title: '关于组建第五届“XX杯”全国网数智安全大赛命题专家委员会与仲裁委员会的通告',
    date: '09-22',
    fullDate: '2026-09-22',
    isPinned: false,
    category: '通知',
    summary: '聘任来自两院院士、国家级科研院所及一流网络安全学院示范高校的48位专家学者组成第五届大赛命题与技术仲裁委员会。',
    viewsCount: 8410,
    department: '“XX杯”全国网数智安全大赛组委会',
    docNumber: '',
    content: [
      '经指导单位批准，第五届“XX杯”全国网数智安全大赛正式成立命题专家委员会与独立纪律仲裁委员会，全面负责赛题盲测、评分核准与争议申诉裁决。',
    ],
  },
  {
    id: 'notice-12',
    title: '关于发布《“XX杯”网数智安全大赛作品赛开源代码合规与知识产权保护守则》的通知',
    date: '09-18',
    fullDate: '2026-09-18',
    isPinned: false,
    category: '作品赛通知',
    summary: '规范作品赛期间提交的原创安全防御作品开源协议引用、第三方组件声明及原创漏洞披露合规要求。',
    viewsCount: 7920,
    department: '大赛仲裁与纪律监督委员会',
    docNumber: '',
    content: [
      '参赛战队在作品赛研发过程中须严格遵守开源软件许可证规范，并在技术白皮书中明确标注原创模块与第三方开源组件边界。',
    ],
  },
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'news-featured-1',
    title: '第五届“XX杯”网数智安全大赛在京正式启动，构建“网·数·智”三位一体实战型人才培养新范式',
    summary: '来自主管机构、两院院士及全国百余所高校网络空间安全学院的专家学者齐聚一堂，共同启动2026年度三大核心赛道，参赛高校规模与赛题实战化深度再创历史新高。',
    source: '大赛官方新闻中心',
    date: '2026-10-25',
    isFeaturedCover: true,
    visualType: 'ceremony',
    content: [
      '2026年10月25日上午，第五届“XX杯”全国网数智安全大赛启动仪式暨数字安全实战人才培养高峰论坛在北京国家会议中心隆重举行。来自指导单位、主办单位领导，以及清华大学、北京大学、浙江大学、上海交通大学、北京航空航天大学等百余所高校网络空间安全学院负责人与师生代表共同出席了启动仪式。',
      '随着人工智能大模型技术的爆发式演进与数据要素市场化配置的深入推进，传统单一维度的网络安全竞赛已难以全面覆盖数字中国建设面临的新型安全挑战。为此，第五届“XX杯”在赛制设计上实现了里程碑式跨越——首次将“网络安全攻防实战”、“数据安全与隐私计算”、“大模型与人工智能安全”整合为相互贯通的三大主力赛道。',
      '大赛技术委员会主任在主题报告中指出：“本届大赛超过85%的赛题直接提炼自政务云平台、电力能源工控系统、跨境数据流通节点及千亿参数大模型的真实安全防御场景。我们不仅考察选手发现漏洞的敏锐度，更重点检验选手在极端受限条件下快速构建自动化安全补丁与内生免疫机制的工程能力。”',
      '据悉，截至目前已有来自全国31个省、自治区、直辖市的260余所高等院校、超过1800支学生战队完成预报名。全国线上选拔赛将于11月中旬全面打响，年终总决赛将于12月下旬举行。',
    ],
  },
  {
    id: 'news-list-1',
    title: '专家解读：从第五届“XX杯”赛题风向看新一代AI内生安全与隐私计算核心技术演进',
    summary: '大赛命题专家组深度剖析提示词注入防御、联邦学习梯度反演抗性及云原生零信任架构三大高频考点。',
    source: '中国网络安全学术网',
    date: '2026-10-22',
    isFeaturedCover: false,
    content: [
      '在近日举办的“XX杯”赛前技术研讨会上，来自国家信息安全工程技术研究中心与多家头部安全实验室的联合命题专家组，对今年各赛道的命题思路进行了公开解读。',
      '专家指出，在网络安全赛道中，容器逃逸与供应链污染溯源的比重显著上升；而在数据安全赛道中，参赛队伍需要在严格限制差分隐私预算（Epsilon）的前提下保持模型高准确率，这对算法设计与工程优化提出了双重挑战。',
    ],
  },
  {
    id: 'news-list-2',
    title: '百校联动共筑数字防线：“XX杯”全国高校巡回技术沙龙走进华东与华南八所重点高校',
    summary: '往届特等奖战队队长现场分享AWD Plus靶场应急响应战术与多模态鉴伪算法调优实战经验。',
    source: '大赛组委会宣传组',
    date: '2026-10-19',
    isFeaturedCover: false,
    content: [
      '10月中旬，“XX杯”网数智安全大赛全国高校巡回技术沙龙先后在浙江大学、上海交通大学、中国科学技术大学、中山大学等八所高校成功举办，累计吸引超过3000名网安学子现场参与。',
      '活动现场不仅设置了微型夺旗体验赛，还邀请了第四届“XX杯”总冠军战队核心成员进行现场复盘，详细拆解了如何在高强度AWD对抗前30分钟内完成资产梳理、批量WAF部署与自动化流量重放监控。',
    ],
  },
  {
    id: 'news-list-3',
    title: '产学研深度融合：本届大赛优秀获奖团队将获国家级重点实验室科研实习与人才绿通资格',
    summary: '十余家国家级科研院所与数字安全领军企业联合签署“XX杯”拔尖创新人才联合培养备忘录。',
    source: '数字安全产业日报',
    date: '2026-10-15',
    isFeaturedCover: false,
    content: [
      '为打通“以赛促学、以赛促研、以赛促用”的最后一公里，第五届“XX杯”组委会正式宣布启动“网数智拔尖人才星火计划”。',
      '获得全国总决赛一等奖及以上的参赛选手，除获得丰厚赛事奖金与权威电子证书外，还将直接获得国家信息安全工程技术研究中心及合作重点实验室的科研实习直通卡，部分优秀开源防御方案将直接纳入国家级安全工具库。',
    ],
  },
  {
    id: 'news-list-4',
    title: '百万级高仿真靶场就绪：“XX杯”云端数字孪生演练平台完成全链路压力测试',
    summary: '支持千支战队并发接入与毫秒级攻防判定，真实还原城市级智慧政务与车联网数字底座。',
    source: '大赛技术保障中心',
    date: '2026-10-10',
    isFeaturedCover: false,
    content: [
      '历经三个月的架构升级与高并发压测，“XX杯”新一代云端数字孪生靶场平台于10月10日正式交付就绪。平台具备单场支持2000支战队、超过8000个独立轻量级虚拟化靶机实例秒级克隆与故障自愈能力。',
      '裁判系统采用全自动流量特征回放与AI辅助反作弊引擎，确保每一分攻防得分均可追溯、可复盘、零延迟呈现。',
    ],
  },
  {
    id: 'news-list-5',
    title: '后量子密码与车路云协同安全成新焦点：第五届“XX杯”专项邀请赛赛题前瞻',
    summary: '首次引入真实智能网联实车CAN总线硬件在环台架与抗量子格密码高速算子评测环境。',
    source: '信息安全研究月刊',
    date: '2026-10-07',
    isFeaturedCover: false,
    content: [
      '针对新兴智能网联汽车与抗量子密码迁移需求，本届大赛特别增设专项挑战赛，吸引全国数十所密码学与车联网强校战队同台竞技。',
    ],
  },
  {
    id: 'news-list-6',
    title: '全国高校网络安全教学研讨会在京召开，“XX杯”实战化赛题案例正式纳入示范实训教材',
    summary: '推动高水平竞赛成果向高校日常实验课程转化，助力网络空间安全一流本科专业建设。',
    source: '高等教育数字时报',
    date: '2026-10-02',
    isFeaturedCover: false,
    content: [
      '会上正式发布了基于历届“XX杯”脱敏真题编写的《网数智融合安全综合实训教程》，面向全国合作高校免费开放配套容器镜像。',
    ],
  },
];

export const MOMENT_CATEGORIES: MomentCategory[] = ['进展报道', '专家观点', '团队风采', '赛事花絮'];

export const MOMENT_ITEMS: MomentItem[] = [
  // 进展报道 (4 items)
  {
    id: 'moment-prog-1',
    title: '【视频直击】第五届“XX杯”网数智安全大赛启动仪式暨云端靶场点亮全程回顾',
    category: '进展报道',
    mediaType: 'video',
    duration: '04:28',
    date: '2026-10-25',
    authorOrTeam: '大赛官方视频组',
    visualVariant: 'arena',
    summary: '直击北京国家会议中心启动仪式现场，全景展现三大赛道点亮瞬间与新一代数字孪生攻防靶场实时态势大屏。',
    content: [
      '本视频完整记录了第五届“XX杯”全国网数智安全大赛启动仪式核心环节，包括指导单位致辞、裁判长宣誓、参赛高校战队代表授旗及云端靶场首轮攻防演练演示。',
    ],
    videoHighlights: [
      '00:00 - 01:15 开幕式主视觉与领导嘉宾共同启动“网数智”数字安全底座',
      '01:16 - 02:50 裁判委员会演示AWD Plus实时态势感知大屏与自动化判定流',
      '02:51 - 04:28 全国八大赛区高校代表战队远程连线宣誓出征',
    ],
  },
  {
    id: 'moment-prog-2',
    title: '全国预报名突破1800支战队，覆盖31个省市自治区268所高等院校',
    category: '进展报道',
    mediaType: 'article',
    date: '2026-10-26',
    authorOrTeam: '大赛秘书处数据中心',
    visualVariant: 'defense',
    summary: '截至10月26日18时，网络安全攻防实战赛与数据安全赛道报名人数较去年同期增长42%，跨学科组队比例显著提升。',
    content: [
      '据大赛报名系统实时统计，自10月15日报名通道开启以来，全国各大高校师生参赛热情高涨。目前已有来自268所高校的1814支战队完成建队申请。',
      '值得关注的是，今年有超过35%的战队采用了“网络安全+人工智能/数学统计”跨专业混编模式，充分体现了“网数智融合”的办赛导向。',
    ],
  },
  {
    id: 'moment-prog-3',
    title: '【视频播报】数据安全与隐私计算赛道开源基线代码包与容器评测环境实操演示',
    category: '进展报道',
    mediaType: 'video',
    duration: '06:15',
    date: '2026-10-23',
    authorOrTeam: '技术命题组 · 数据安全分委会',
    visualVariant: 'hackathon',
    summary: '手把手演示如何拉取官方Docker基线镜像、在本地调试联邦学习差分隐私算子并提交至云端A榜评测系统。',
    content: [
      '为帮助首次参加数据安全赛道的同学快速熟悉容器化评测流程，命题组录制了6分钟全流程实操演示视频。',
    ],
    videoHighlights: [
      '00:00 - 02:10 官方基线仓库目录结构与脱敏数据集字段说明',
      '02:11 - 04:30 本地GPU环境构建Docker镜像与隐私预算校验脚本运行',
      '04:31 - 06:15 提交镜像仓库地址与查看云端实时评测日志排错技巧',
    ],
  },
  {
    id: 'moment-prog-4',
    title: '先导赛总决赛圆满收官：36支青年战队斩获大模型安全攻防年度大奖',
    category: '进展报道',
    mediaType: 'article',
    date: '2026-09-26',
    authorOrTeam: '大赛新闻中心',
    visualVariant: 'award',
    summary: '历经12小时高强度红蓝对抗与算法鲁棒性极限施压，来自清华、浙大、北航等高校的战队脱颖而出。',
    content: [
      '在率先完赛的“大模型与人工智能安全先导赛”中，入围总决赛的战队围绕多模态越狱拦截、长上下文投毒检测等前沿难题展开激烈交锋，涌现出一批极具工程落地价值的防御架构。',
    ],
  },

  // 专家观点 (4 items)
  {
    id: 'moment-exp-1',
    title: '【院士访谈视频】筑牢人工智能时代的数据要素与算力安全底座',
    category: '专家观点',
    mediaType: 'video',
    duration: '08:42',
    date: '2026-10-25',
    authorOrTeam: '特邀顾问 · 网络空间安全专家委员会',
    visualVariant: 'expert',
    summary: '深度剖析“网、数、智”三大安全域的内在耦合规律，寄语青年学子在真实对抗环境中锤炼系统性安全思维。',
    content: [
      '在大赛启动仪式专访间，大赛顾问委员会主任委员发表视频讲话，勉励全国高校学子不做“只会跑脚本的工具人”，而要成为理解底层密码学、系统架构与AI对齐机理的复合型领军人才。',
    ],
    videoHighlights: [
      '00:00 - 03:00 为什么传统边界防御在AI Agent时代面临范式重构？',
      '03:01 - 06:15 隐私计算如何平衡“高强度安全保证”与“毫秒级业务损耗”？',
      '06:16 - 08:42 对第五届“XX杯”参赛青年学子的三点科研与实战建议',
    ],
  },
  {
    id: 'moment-exp-2',
    title: '裁判长专栏：AWD Plus攻防赛制下，自动化防御补丁（Auto-Patch）的评分权重解析',
    category: '专家观点',
    mediaType: 'article',
    date: '2026-10-21',
    authorOrTeam: '陈建国 教授 · 大赛总裁判长',
    visualVariant: 'defense',
    summary: '详解本届攻防实战赛全新引入的“服务可用性SLA惩罚系数”与“通用防御规则加分机制”。',
    content: [
      '往届AWD比赛中，部分战队采取“一刀切”删减业务功能的方式规避漏洞失分。今年我们的Check脚本将模拟真实高并发用户行为流，任何破坏正常业务逻辑的粗暴修改都将触发高额SLA扣分。',
    ],
  },
  {
    id: 'moment-exp-3',
    title: '【专家微课视频】大模型提示词注入（Prompt Injection）与思维链劫持防御前沿',
    category: '专家观点',
    mediaType: 'video',
    duration: '11:20',
    date: '2026-10-16',
    authorOrTeam: '林沐阳 研究员 · AI安全实验室主任',
    visualVariant: 'interview',
    summary: '结合“XX杯”先导赛经典满分防御方案，复盘双层语义状态机与注意力权重异常检测算法。',
    content: [
      '本期专家微课精选自“XX杯”赛前公开课，深入浅出地展示了如何通过轻量级探针模型实时拦截多轮诱导式越狱攻击。',
    ],
    videoHighlights: [
      '00:00 - 04:00 多模态视觉提示词隐写注入的真实攻击案例演示',
      '04:01 - 08:30 基于激活值探针（Activation Probing）的毫秒级护栏架构',
      '08:31 - 11:20 开源防御组件在低算力边缘端部署的量化蒸馏方案',
    ],
  },
  {
    id: 'moment-exp-4',
    title: '数据要素流通安全视角：如何设计经得起B榜极限重放攻击的数字水印算法？',
    category: '专家观点',
    mediaType: 'article',
    date: '2026-10-14',
    authorOrTeam: '周敏 博士 · 国家数据安全重点实验室',
    visualVariant: 'arena',
    summary: '针对表格数据、图结构数据与生成式文本的三类高鲁棒无损水印嵌入策略探讨。',
    content: [
      '在数据安全赛道中，水印不仅要抵抗常见的行列抽样、高斯噪声添加，还要能够抵御基于同义改写与重排序的对抗清洗。本文为参赛选手梳理了近三年顶会的核心突破路径。',
    ],
  },

  // 团队风采 (4 items)
  {
    id: 'moment-team-1',
    title: '【战队纪录片】“天枢星盾”战队：从校园实验室到“XX杯”全国特等奖的300个日夜',
    category: '团队风采',
    mediaType: 'video',
    duration: '05:40',
    date: '2026-10-20',
    authorOrTeam: '清华大学 · 天枢星盾战队',
    visualVariant: 'team',
    summary: '记录四位来自不同院系的本科生如何分工协作，在先导赛最后两小时完成绝地反超的幕后故事。',
    content: [
      '一支优秀的网数智安全战队是如何炼成的？镜头走进“天枢星盾”战队的日常训练室，看二进制手、密码学手与算法工程师如何实现无缝配合。',
    ],
    videoHighlights: [
      '00:00 - 01:50 战队四大核心角色的分工协作与日常训练看板',
      '01:51 - 04:00 决赛第10小时遭遇未知0day攻击时的15分钟紧急止血复盘',
      '04:01 - 05:40 夺冠时刻与新赛季备战宣言',
    ],
  },
  {
    id: 'moment-team-2',
    title: '巾帼不让须眉：“木兰Sec”全女子网安战队连续三年晋级“XX杯”全国总决赛',
    category: '团队风采',
    mediaType: 'article',
    date: '2026-10-17',
    authorOrTeam: '浙江大学 · 木兰Sec战队',
    visualVariant: 'award',
    summary: '专攻密码学分析与隐私计算协议漏洞审计，在强手如林的攻防赛场展现细腻严密的工程美学。',
    content: [
      '由四名网安与数学系女生组成的“木兰Sec”战队，凭借在同态加密实现漏洞挖掘与零知识证明电路审计上的深厚功底，成为赛场上一道亮丽的风景线。',
    ],
  },
  {
    id: 'moment-team-3',
    title: '跨校学术交流标杆：西部高校网安联盟12支战队开展“XX杯”赛前联合攻防拉练',
    category: '团队风采',
    mediaType: 'article',
    date: '2026-10-13',
    authorOrTeam: '西安电子科技大学 & 电子科技大学联合报道',
    visualVariant: 'defense',
    summary: '通过周末48小时全真对抗演练，以赛代练提升西部高校新生代战队的实战协同与应急响应效率。',
    content: [
      '为备战即将到来的全国线上选拔赛，西部地区十余所高校自发组织了赛前联合拉练，老队员倾囊相授逆向分析与流量审计脚本库。',
    ],
  },
  {
    id: 'moment-team-4',
    title: '【队长专访视频】如何从零组建一支兼具CTF解题与AI安全算法能力的复合型校队？',
    category: '团队风采',
    mediaType: 'video',
    duration: '07:05',
    date: '2026-10-09',
    authorOrTeam: '上海交通大学 · 0ops-Next青年队',
    visualVariant: 'interview',
    summary: '分享校内纳新选拔题库建设、每周文献Reading Group与实战复盘文档沉淀经验。',
    content: [
      '面对“网数智”多赛道融合趋势，传统CTF战队如何吸纳AI与数据科学背景的新队员？听听金牌队长的实战带队心得。',
    ],
    videoHighlights: [
      '00:00 - 02:30 传统安全手与AI算法手的思维差异与磨合之道',
      '02:31 - 05:10 战队内部自动化工具链（武器库）的模块化维护规范',
      '05:11 - 07:05 给大一、大二初次参赛同学的入门路线图',
    ],
  },

  // 赛事花絮 (4 items)
  {
    id: 'moment-fun-1',
    title: '【延时摄影花絮】48小时极限烧脑！沉浸式感受“XX杯”线下总决赛巅峰对决不眠夜',
    category: '赛事花絮',
    mediaType: 'video',
    duration: '03:18',
    date: '2026-09-28',
    authorOrTeam: '大赛视觉摄制组',
    visualVariant: 'behind',
    summary: '浓缩48小时赛场光影变化、键盘敲击声与首血（First Blood）诞生时的全场欢呼瞬间。',
    content: [
      '用超高清延时摄影记录下总决赛竞技大厅从晨曦微露到深夜灯火通明的每一个燃情瞬间。',
    ],
    videoHighlights: [
      '00:00 - 01:05 赛场搭建与千兆光纤独立竞赛席位检录现场',
      '01:06 - 02:20 全场首血（First Blood）激光视效亮起与战队击掌欢呼',
      '02:21 - 03:18 凌晨三点的能量补给站与裁判组后台巡检剪影',
    ],
  },
  {
    id: 'moment-fun-2',
    title: '探秘大赛技术保障大脑：守护千支战队同场竞技的裁判与运维团队幕后纪实',
    category: '赛事花絮',
    mediaType: 'article',
    date: '2026-10-11',
    authorOrTeam: '大赛技术保障中心',
    visualVariant: 'arena',
    summary: '揭秘比赛期间每秒处理十万级流量包的态势感知中心与7×24小时待命的应急响应工程师。',
    content: [
      '当台前的选手们专注于攻克一道道高难度赛题时，幕后的技术保障团队正在实时监控着数千个容器节点的CPU水位与虚拟交换机吞吐量。',
    ],
  },
  {
    id: 'moment-fun-3',
    title: '高校极客文创大赏：第五届“XX杯”参赛纪念徽章、定制机械键盘键帽与战袍正式亮相',
    category: '赛事花絮',
    mediaType: 'article',
    date: '2026-10-06',
    authorOrTeam: '大赛视觉设计组',
    visualVariant: 'hackathon',
    summary: '以海蓝色数字护盾与十六进制莫尔斯电码为设计灵感，晋级总决赛选手均可获赠限量版极客礼盒。',
    content: [
      '今年大赛周边礼盒巧妙融入了“0x2026”、“Flag{Keep_Building}”等网络安全极客元素，深受广大参赛学子喜爱。',
    ],
  },
  {
    id: 'moment-fun-4',
    title: '【花絮短片】校园沙龙快问快答：网安专业同学眼中最难啃的硬骨头是什么？',
    category: '赛事花絮',
    mediaType: 'video',
    duration: '03:52',
    date: '2026-10-02',
    authorOrTeam: '大赛高校融媒体工作站',
    visualVariant: 'team',
    summary: '是内核态堆利用、格密码规约，还是大模型对抗样本迁移？来看看各校参赛同学的幽默回答。',
    content: [
      '在高校巡回沙龙现场，我们随机采访了30位准备报名第五届“XX杯”的同学，听听他们备赛过程中的趣事与目标。',
    ],
    videoHighlights: [
      '00:00 - 01:30 快问快答：二进制手与Web手互相吐槽日常',
      '01:31 - 02:45 指导老师寄语：比赛名次之外更重要的是什么？',
      '02:46 - 03:52 全国各高校战队隔空喊话“决赛北京见！”',
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: '01. 如何组队参赛？允许跨校或跨年级、跨专业组队吗？',
    answer: '参赛选手注册并登录官网后，在“赛事目录”或首页“赛事通道”进入对应赛事详情页点击“立即报名”，即可填写战队信息并邀请队友。本届大赛鼓励本校内跨院系、跨专业、跨年级（本硕博混编）联合组队，以发挥网安、AI、数学等多学科交叉优势；是否允许跨校组队由各赛事独立配置（如“网络安全攻防实战赛”仅限同校组队，“云原生与零信任架构安全攻防挑战赛”开放跨校组队）。',
    category: '报名与组队',
  },
  {
    id: 'faq-2',
    question: '02. 报名时怎么完成高校学籍认证？需要准备哪些审核材料？',
    answer: '为确保参赛选手的全日制在校生身份真实有效，报名系统实行“先实名认证、后学籍/教师认证”机制：① 推荐方式：在【个人中心 -> 用户认证】填入《教育部学籍在线验证报告》的16位在线验证码，系统将在10秒内完成自动核验；② 人工审核方式：上传本人有效期内的学生证注册页扫描件及校园一卡通正面照片（JPG/PNG格式，单张不超过5MB），组委会将在24小时内完成人工复核。',
    category: '资格审核',
  },
  {
    id: 'faq-3',
    question: '03. 同一名选手或同一支战队可以同时报名多个赛项吗？',
    answer: '可以！不同赛项（如“网络安全攻防实战赛”、“数据安全与隐私计算挑战赛”与“云原生安全挑战赛”）的比赛排期互不冲突，选手可根据自身技术特长同时报名多个赛事。但请注意：在同一赛事下，每名选手只能归属唯一一支参赛战队，严禁使用多个账号重复报名同一赛事。',
    category: '赛制规则',
  },
  {
    id: 'faq-4',
    question: '04. 指导教师如何绑定？更换队员或修改战队名称的截止时间是什么时候？',
    answer: '每支参赛队可根据赛事配置邀请1至2名认证高校教师作为指导教师（决赛评定“优秀指导教师奖”须以初赛截止前备案名单为准）。在各赛事报名截止前，若队伍处于“组建中”、“邀请中”或“已驳回”状态，队长可随时在【个人中心 -> 我的报名】中调整队员名单或补充指导教师信息；一旦提交审核通过或报名通道关闭，参赛名单将正式锁定。',
    category: '报名与组队',
  },
  {
    id: 'faq-5',
    question: '05. 获奖电子证书何时发放？如何验证真伪及用于保研加分核验？',
    answer: '各赛道全国总决赛获奖名单公示期（5个工作日）满且无异议后，组委会将在3个工作日内统一签发带国家授时中心时间戳与国密SM3防伪哈希签名的官方电子证书。选手、高校教务部门及用人单位可随时通过本官网首页“获奖查询”专栏，输入身份信息（姓名或身份证号）与证书编号进行实时公开核验。',
    category: '证书与奖励',
  },
  {
    id: 'faq-6',
    question: '06. 队长发出组队邀请后，如果有队员拒绝或迟迟未确认怎么办？',
    answer: '在“邀请中”状态下，队长可随时进入【个人中心 -> 我的报名 -> 修改队伍与成员】：对于“待确认”的成员可点击【催办】发送提醒，对于“已拒绝”或迟迟未响应的成员可直接点击【移除】并补充邀请新成员；待队员与指导教师人数符合赛事报名要求且已邀请人员全部为“已同意”状态后，点击【正式提交高校审核】即可提交本校审核。',
    category: '报名与组队',
  },
  {
    id: 'faq-7',
    question: '07. 报名申请被高校管理员“驳回”后，还可以修改成员重新提交吗？',
    answer: '可以！当队伍状态变为“已驳回”时，系统会自动为您解锁队伍编辑权限，并在【我的报名】页面顶部醒目展示高校管理员填写的驳回原因（例如：指导教师跨校不合规）。队长只需移除不合规成员、补充邀请合规人员并待其确认后，点击【重新提交审核】即可。',
    category: '资格审核',
  },
  {
    id: 'faq-8',
    question: '08. 线上选拔赛期间对客户端网络环境与解题报告（Writeup）有何要求？',
    answer: '线上赛采用专用OpenVPN/WireGuard加密隧道接入云端靶场，请提前参加赛前靶场连通性测试。所有得分题目均须在赛后2小时内上传完整Writeup（含利用脚本与核心思路截图），经反作弊系统比对确认无抄袭后成绩方才有效。',
    category: '赛制规则',
  },
  {
    id: 'faq-9',
    question: '09. 为什么在学籍认证下拉框中找不到我所在的学校？',
    answer: '平台院校库严格对接教育部全国普通高等学校10位唯一标识码标准名单。若下拉框未显示贵校，可能原因包括：① 您输入了学校简称而非教育部登记的官方全称；② 贵校近期完成了升格更名（如学院升格为职业技术大学）；③ 该院校当前在平台处于暂停核验状态。请联系本校领队教师或致电组委会秘书处（010-6899-2026）同步教育部标准名录。',
    category: '资格审核',
  },
  {
    id: 'faq-10',
    question: '10. 单人可以报名参赛吗？如果某个赛事限制“1人/队”该如何报名？',
    answer: '取决于具体赛事的队伍人数限制。例如“零日漏洞挖掘与二进制极客个人挑战赛”明确设置为单兵赛制（最少1人、最多1人），队长进入报名表单填写页时系统会自动隐藏“邀请队员”模块，填写队名后即可直接提交审核；而对于常规团队赛，只要满足该赛事配置的“最少报名人数”下限即可提交审核。',
    category: '报名与组队',
  },
  {
    id: 'faq-11',
    question: '11. 赛事奖金如何发放？个人所得税由哪一方代扣代缴？',
    answer: '全国总决赛获奖名单公示无异议后，组委会秘书处将向获奖战队队长收集银行卡信息及队员奖金分配确认书。赛事奖金将由主办单位在30个工作日内统一发放至队员个人银行账户，并依法由主办单位代扣代缴偶然所得个人所得税。',
    category: '证书与奖励',
  },
  {
    id: 'faq-12',
    question: '12. 数据安全与大模型安全赛道的Docker容器镜像提交有什么硬件环境规范？',
    answer: '云端评测沙箱统一提供 Ubuntu 22.04 LTS + CUDA 12.2 + NVIDIA A800 (80GB显存) 运行环境，评测期间容器处于完全断网隔离状态（防止数据外传）。请选手务必将模型权重文件与Python依赖包完整打包进Docker镜像内，单次推理耗时与显存占用不得超出赛题白皮书规定阈值。',
    category: '赛制规则',
  },
];

export const CERTIFICATE_RECORDS: CertificateRecord[] = [
  {
    certId: 'XXCUP-2026-08921',
    holderName: '张明远',
    idCard: '110108200305124819',
    university: '清华大学',
    teamName: '天枢星盾战队',
    trackTitle: '2026“XX杯”大模型与人工智能安全先导赛',
    awardLevel: '全国特等奖（第1名）',
    issueDate: '2026年10月18日',
    advisor: '林海峰 教授',
    verifyHash: 'SM3: 9F8A-4C2E-71B0-D3E9-8812-A4F7',
  },
  {
    certId: 'XXCUP-2026-09104',
    holderName: '苏婉清',
    idCard: '330106200402193326',
    university: '浙江大学',
    teamName: '木兰Sec战队',
    trackTitle: '2026“XX杯”大模型与人工智能安全先导赛',
    awardLevel: '全国一等奖',
    issueDate: '2026年10月18日',
    advisor: '周建勋 博导',
    verifyHash: 'SM3: 3D7E-19A5-C84B-20F1-6650-E2C9',
  },
  {
    certId: 'XXCUP-2026-09218',
    holderName: '林远航',
    idCard: '110108200211086912',
    university: '北京航空航天大学',
    teamName: '北航智盾先锋队',
    trackTitle: '2026“XX杯”大模型与人工智能安全先导赛',
    awardLevel: '全国一等奖',
    issueDate: '2026年10月18日',
    advisor: '赵振宇 教授',
    verifyHash: 'SM3: 6E4F-92B1-8C03-44A8-5190-F3D2',
  },
  {
    certId: 'XXCUP-2026-09355',
    holderName: '陆景琛',
    idCard: '610113200308245137',
    university: '西安电子科技大学',
    teamName: '西电秦岭玄甲战队',
    trackTitle: '2026“XX杯”大模型与人工智能安全先导赛',
    awardLevel: '全国二等奖',
    issueDate: '2026年10月18日',
    advisor: '郭建华 教授',
    verifyHash: 'SM3: 4A1D-77E0-3B92-19C4-8023-B6E1',
  },
  {
    certId: 'XXCUP-2026-09480',
    holderName: '许知夏',
    idCard: '110108200407152048',
    university: '北京邮电大学',
    teamName: '北邮鸿雁密算战队',
    trackTitle: '2026“XX杯”大模型与人工智能安全先导赛',
    awardLevel: '全国三等奖',
    issueDate: '2026年10月18日',
    advisor: '唐卫东 副教授',
    verifyHash: 'SM3: 2C8B-54F9-90A1-6E7D-3341-D9A0',
  },
  {
    certId: 'XXCUP-2025-03412',
    holderName: '陈哲瀚',
    idCard: '310104200209168215',
    university: '上海交通大学',
    teamName: '0ops-Next战队',
    trackTitle: '第四届“XX杯”网络安全攻防实战赛',
    awardLevel: '全国一等奖',
    issueDate: '2025年12月22日',
    advisor: '王志远 副教授',
    verifyHash: 'SM3: 7B1C-80E4-55A2-9F3D-1208-C7B3',
  },
  {
    certId: 'XXCUP-2025-03589',
    holderName: '顾言蹊',
    idCard: '34010420030321452X',
    university: '中国科学技术大学',
    teamName: '瀚海星云CTF战队',
    trackTitle: '第四届“XX杯”数据安全与隐私计算挑战赛',
    awardLevel: '全国特等奖（第1名）',
    issueDate: '2025年12月22日',
    advisor: '沈怀瑾 教授',
    verifyHash: 'SM3: 8D2A-61C7-49F0-B2E5-7741-A8C6',
  },
  {
    certId: 'XXCUP-2025-03801',
    holderName: '赵振宇',
    idCard: '110108198104123610',
    university: '北京航空航天大学',
    teamName: '北航天枢攻防战队',
    trackTitle: '第四届“XX杯”网络安全攻防实战赛',
    awardLevel: '全国优秀指导教师奖',
    issueDate: '2025年12月22日',
    advisor: '赵振宇 教授（获奖本人）',
    verifyHash: 'SM3: 5F9E-32D8-10B4-C7A9-6632-E1F8',
  },
];

export const UNIVERSITY_PARTNERS: UniversityPartner[] = [
  {
    id: 'uni-1',
    name: '清华大学',
    shortName: '清华',
    enName: 'TSINGHUA UNIVERSITY',
    founded: '1911',
    primaryColor: '#660874',
    secondaryColor: '#9333EA',
    emblemType: 'circle',
    teamsCount: 48,
    region: '北京',
  },
  {
    id: 'uni-2',
    name: '北京大学',
    shortName: '北大',
    enName: 'PEKING UNIVERSITY',
    founded: '1898',
    primaryColor: '#8B0012',
    secondaryColor: '#DC2626',
    emblemType: 'circle',
    teamsCount: 42,
    region: '北京',
  },
  {
    id: 'uni-3',
    name: '浙江大学',
    shortName: '浙大',
    enName: 'ZHEJIANG UNIVERSITY',
    founded: '1897',
    primaryColor: '#003F88',
    secondaryColor: '#0284C7',
    emblemType: 'shield',
    teamsCount: 56,
    region: '浙江',
  },
  {
    id: 'uni-4',
    name: '上海交通大学',
    shortName: '上交',
    enName: 'SHANGHAI JIAO TONG UNIV.',
    founded: '1896',
    primaryColor: '#9E1B32',
    secondaryColor: '#E11D48',
    emblemType: 'hex',
    teamsCount: 51,
    region: '上海',
  },
  {
    id: 'uni-5',
    name: '北京航空航天大学',
    shortName: '北航',
    enName: 'BEIHANG UNIVERSITY',
    founded: '1952',
    primaryColor: '#004098',
    secondaryColor: '#0EA5E9',
    emblemType: 'shield',
    teamsCount: 46,
    region: '北京',
  },
  {
    id: 'uni-6',
    name: '中国科学技术大学',
    shortName: '中科大',
    enName: 'USTC',
    founded: '1958',
    primaryColor: '#004B87',
    secondaryColor: '#2563EB',
    emblemType: 'arch',
    teamsCount: 39,
    region: '安徽',
  },
  {
    id: 'uni-7',
    name: '西安电子科技大学',
    shortName: '西电',
    enName: 'XIDIAN UNIVERSITY',
    founded: '1931',
    primaryColor: '#003366',
    secondaryColor: '#0284C7',
    emblemType: 'shield',
    teamsCount: 64,
    region: '陕西',
  },
  {
    id: 'uni-8',
    name: '北京邮电大学',
    shortName: '北邮',
    enName: 'BUPT',
    founded: '1955',
    primaryColor: '#003A70',
    secondaryColor: '#0369A1',
    emblemType: 'circle',
    teamsCount: 68,
    region: '北京',
  },
  {
    id: 'uni-9',
    name: '华中科技大学',
    shortName: '华科',
    enName: 'HUST',
    founded: '1952',
    primaryColor: '#005BAC',
    secondaryColor: '#0284C7',
    emblemType: 'hex',
    teamsCount: 45,
    region: '湖北',
  },
  {
    id: 'uni-10',
    name: '哈尔滨工业大学',
    shortName: '哈工大',
    enName: 'HARBIN INST. OF TECH.',
    founded: '1920',
    primaryColor: '#003865',
    secondaryColor: '#1D4ED8',
    emblemType: 'shield',
    teamsCount: 44,
    region: '黑龙江',
  },
  {
    id: 'uni-11',
    name: '电子科技大学',
    shortName: '成电',
    enName: 'UESTC',
    founded: '1956',
    primaryColor: '#004098',
    secondaryColor: '#0284C7',
    emblemType: 'circle',
    teamsCount: 53,
    region: '四川',
  },
  {
    id: 'uni-12',
    name: '武汉大学',
    shortName: '武大',
    enName: 'WUHAN UNIVERSITY',
    founded: '1893',
    primaryColor: '#115740',
    secondaryColor: '#0D9488',
    emblemType: 'arch',
    teamsCount: 49,
    region: '湖北',
  },
  {
    id: 'uni-13',
    name: '复旦大学',
    shortName: '复旦',
    enName: 'FUDAN UNIVERSITY',
    founded: '1905',
    primaryColor: '#0E4194',
    secondaryColor: '#2563EB',
    emblemType: 'circle',
    teamsCount: 43,
    region: '上海',
  },
  {
    id: 'uni-14',
    name: '南京大学',
    shortName: '南大',
    enName: 'NANJING UNIVERSITY',
    founded: '1902',
    primaryColor: '#5B0E6D',
    secondaryColor: '#7C3AED',
    emblemType: 'shield',
    teamsCount: 41,
    region: '江苏',
  },
  {
    id: 'uni-15',
    name: '东南大学',
    shortName: '东大',
    enName: 'SOUTHEAST UNIVERSITY',
    founded: '1902',
    primaryColor: '#1E5631',
    secondaryColor: '#16A34A',
    emblemType: 'hex',
    teamsCount: 47,
    region: '江苏',
  },
  {
    id: 'uni-16',
    name: '国防科技大学',
    shortName: '国防科大',
    enName: 'NUDT',
    founded: '1953',
    primaryColor: '#002E5D',
    secondaryColor: '#0284C7',
    emblemType: 'shield',
    teamsCount: 52,
    region: '湖南',
  },
];

export const LEADERSHIP_ORGS: LeadershipOrg[] = [
  {
    id: 'org-1',
    name: '中共中央网络安全和信息化委员会办公室',
    role: '指导单位',
    url: 'https://www.cac.gov.cn',
    description: '统筹协调网络安全和信息化重大问题，指导国家级网络安全赛事体系与高层次实战人才培养工作。',
  },
  {
    id: 'org-2',
    name: '中华人民共和国教育部高等教育司',
    role: '指导单位',
    url: 'https://www.moe.gov.cn',
    description: '指导全国高等院校网络空间安全一流学科建设、大学生创新实践竞赛与产学合作协同育人项目。',
  },
  {
    id: 'org-3',
    name: '中华人民共和国工业和信息化部网络安全管理局',
    role: '指导单位',
    url: 'https://www.miit.gov.cn',
    description: '指导电信网、互联网及工业互联网安全保障体系建设，推动数据安全与车联网安全实战技术演练。',
  },
  {
    id: 'org-4',
    name: '国家信息安全工程技术研究中心',
    role: '主办单位',
    url: 'https://www.niserc.cn',
    description: '大赛核心发起与主办机构，负责“XX杯”网数智安全大赛整体赛制设计、权威命题评审与国家级靶场资源统筹。',
  },
  {
    id: 'org-5',
    name: '国家计算机网络应急技术处理协调中心（CNCERT/CC）',
    role: '主办单位',
    url: 'https://www.cert.org.cn',
    description: '提供真实互联网安全威胁态势支持、漏洞响应标准制定与大赛攻防实战赛道技术仲裁支撑。',
  },
  {
    id: 'org-6',
    name: '中国网络空间安全协会',
    role: '主办单位',
    url: 'https://www.cybersac.cn',
    description: '组织全国高校网络空间安全学院专家委员会、竞评演练工作委员会共同参与大赛评审与人才举荐。',
  },
  {
    id: 'org-7',
    name: '国家数据安全重点实验室',
    role: '承办与技术支撑',
    url: 'https://www.nds-lab.org.cn',
    description: '承办“数据安全与隐私计算挑战赛”专项赛道，提供脱敏政务与金融训练数据集及容器化算力评测集群。',
  },
  {
    id: 'org-8',
    name: '中国信息安全测评中心',
    role: '承办与技术支撑',
    url: 'https://www.itsec.gov.cn',
    description: '提供漏洞库标准对接、参赛人员技能等级对标评估及大赛总决赛线下实网靶场测评环境保障。',
  },
  {
    id: 'org-9',
    name: '新一代人工智能安全与评测创新中心',
    role: '承办与技术支撑',
    url: 'https://www.aisafety-center.cn',
    description: '负责“大模型与人工智能安全先导赛”红蓝对抗平台研发、多模态越狱攻击基准库构建与模型安全评测。',
  },
];

export type CompetitionCalculatedStatus = 'upcoming' | 'ongoing' | 'ended';

export interface CompetitionSubTrack {
  id: string;
  name: string;
  description?: string;
}

export interface CompetitionScheduleStage {
  id: string;
  stage: string;
  dateRange: string;
  description: string;
}

export type CompetitionRegistrationMode = 'none' | 'platform' | 'third_party';

export interface CompetitionAttachment {
  id: string;
  name: string;
  size: string;
  url?: string;
  uploadedAt?: string;
}

export interface CompetitionCatalogItem {
  id: string;
  title: string;
  summary: string;
  startDate: string; // YYYY-MM-DD HH:mm:ss
  endDate: string; // YYYY-MM-DD HH:mm:ss
  coverTheme: 'network' | 'data' | 'ai';
  customCoverUrl?: string;
  customTags: string[];
  tracks: CompetitionSubTrack[];
  schedule: CompetitionScheduleStage[];
  markdownContent: string;
  attachments?: CompetitionAttachment[];
  isPublic: boolean;
  createdAt: string;
  organizer: string;
  registrationMode: CompetitionRegistrationMode; // A: 'none' 不开启报名 | B: 'platform' 开启平台在线报名 | C: 'third_party' 开启第三方报名
  thirdPartyUrl?: string; // 当 registrationMode === 'third_party' 时的跳转链接
}

/**
 * 根据赛事起止时间（精确到时分秒）动态判断状态：
 * 当前基准时间为 2026-10-28 12:00:00
 * - 当前时间 < startDate => 'upcoming' (未开始)
 * - 当前时间 > endDate   => 'ended' (已结束)
 * - 其余                 => 'ongoing' (进行中)
 */
export function computeCompetitionStatus(
  startDate: string,
  endDate: string,
  referenceDate = '2026-10-28 12:00:00'
): CompetitionCalculatedStatus {
  const normalizeDateTime = (raw: string, fallbackTime: string) => {
    const cleaned = raw
      .trim()
      .replace('T', ' ')
      .replace(/[年月]/g, '-')
      .replace(/日/g, '');
    if (!cleaned) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      return `${cleaned} ${fallbackTime}`;
    }
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(cleaned)) {
      return `${cleaned}:00`;
    }
    return cleaned;
  };

  const normStart = normalizeDateTime(startDate, '00:00:00');
  const normEnd = normalizeDateTime(endDate, '23:59:59');
  const normRef = normalizeDateTime(referenceDate, '12:00:00');
  if (!normStart || !normEnd) return 'ongoing';
  if (normRef < normStart) return 'upcoming';
  if (normRef > normEnd) return 'ended';
  return 'ongoing';
}

export function getCompetitionStatusLabel(status: CompetitionCalculatedStatus): '未开始' | '进行中' | '已结束' {
  if (status === 'upcoming') return '未开始';
  if (status === 'ended') return '已结束';
  return '进行中';
}

/**
 * 前后台赛事目录列表统一排序规则：
 * 1. 先按状态排序：进行中 (ongoing) -> 未开始 (upcoming) -> 已结束 (ended)
 * 2. 再按赛事开始时间倒序（由新到旧）
 * 3. 若状态与开始时间完全一致，最后按创建时间 (createdAt) 倒序兜底排序
 */
export function sortCompetitionCatalogItems(
  items: CompetitionCatalogItem[]
): CompetitionCatalogItem[] {
  const statusOrder: Record<CompetitionCalculatedStatus, number> = {
    ongoing: 1,
    upcoming: 2,
    ended: 3,
  };

  const normalizeTime = (raw?: string) => {
    if (!raw) return '';
    const cleaned = raw
      .trim()
      .replace('T', ' ')
      .replace(/[年月]/g, '-')
      .replace(/日/g, '');
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      return `${cleaned} 00:00:00`;
    }
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/.test(cleaned)) {
      return `${cleaned}:00`;
    }
    return cleaned;
  };

  return [...items].sort((a, b) => {
    const statusA = computeCompetitionStatus(a.startDate, a.endDate);
    const statusB = computeCompetitionStatus(b.startDate, b.endDate);
    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }

    const startA = normalizeTime(a.startDate);
    const startB = normalizeTime(b.startDate);
    if (startA !== startB) {
      return startB.localeCompare(startA);
    }

    const createdA = normalizeTime(a.createdAt);
    const createdB = normalizeTime(b.createdAt);
    return createdB.localeCompare(createdA);
  });
}

export const INITIAL_COMPETITION_CATALOG: CompetitionCatalogItem[] = [
  {
    id: 'comp-2026-main',
    title: '2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛',
    summary:
      '围绕关键信息基础设施安全防护、云原生容器逃逸漏洞挖掘、工业互联网协议逆向与实战化蓝军应急加固展开，采用线上CTF夺旗选拔与线下AWD Plus靶场攻防双轨赛制。',
    startDate: '2026-10-15 09:00:00',
    endDate: '2026-12-20 18:00:00',
    coverTheme: 'network',
    customTags: ['国家级核心赛事', 'CTF+AWD双轨制', '百万奖金池', '高校保研加分'],
    tracks: [
      { id: 't-1', name: 'Web应用与云原生攻防赛道', description: '聚焦微服务架构、K8s集群逃逸与供应链安全' },
      { id: 't-2', name: '二进制漏洞挖掘与Pwn赛道', description: '考察内核态漏洞利用、堆风水与固件逆向分析' },
      { id: 't-3', name: '密码学与区块链协议安全赛道', description: '聚焦商密算法实现缺陷、零知识证明与智能合约审计' },
    ],
    schedule: [
      {
        id: 'st-1',
        stage: '大赛报名与高校学籍核验',
        dateRange: '2026-10-15 09:00 ~ 2026-11-15 18:00',
        description: '',
      },
      {
        id: 'st-2',
        stage: '线上靶场连通性测试赛',
        dateRange: '2026-11-18 09:00 ~ 2026-11-18 21:00',
        description: '',
      },
      {
        id: 'st-3',
        stage: '全国线上初赛（CTF夺旗模式）',
        dateRange: '2026-11-22 09:00 ~ 2026-11-23 21:00',
        description: '',
      },
      {
        id: 'st-4',
        stage: '全国线下总决赛暨颁奖典礼',
        dateRange: '2026-12-19 09:00 ~ 2026-12-20 17:30',
        description: '',
      },
    ],
    markdownContent: `# 大赛背景与宗旨

**2026第五届“XX杯”全国网数智安全大赛 · 网络安全攻防实战赛** 是面向全国普通高等院校全日制在校生的国家级高水平实战安全竞赛。大赛旨在通过高仿真数字孪生靶场环境，全面检验高校学子在复杂网络空间环境下的漏洞挖掘、渗透利用、异常流量监测与自动化防御补丁（Auto-Patch）构建能力。

---

## 核心赛制亮点

1. **真实业务靶场还原**：超过 85% 的赛题直接提炼自政务云底座、智慧电力工控网及金融核心交易网关的真实安全场景。
2. **双阶段复合考核**：
   - **第一阶段（线上初赛）**：采用国际标准 Jeopardy CTF 夺旗模式，涵盖 \`Web\`、\`Pwn\`、\`Reverse\`、\`Crypto\`、\`Misc\` 五大方向，实行动态积分衰减机制。
   - **第二阶段（全国总决赛）**：采用 **AWD Plus（攻防兼备增强版）** 模式，考核选手在批量挖掘多节点 0day/Nday 漏洞的同时，编写低损耗防御规则（WAF/RASP）以保障服务 SLA 可用性。

---

## 参赛对象与组队规则

- **参赛对象**：全国高等院校全日制在读专科、本科、硕士及博士研究生。
- **组队要求**：每支参赛战队由 **1 至 4 名** 同一高校在读学生组成，设队长 1 名，可配本校指导教师 1-2 名。
- **资格审查**：所有参赛队员须在报名前通过个人中心完成【实名认证】与【学籍认证】，严禁跨校组队（联合培养学生以学籍所在高校为准）。

> **重要纪律提示**：比赛期间严禁不同战队之间共享或买卖 Flag、严禁对赛事平台基础设施发起拒绝服务（DDoS）攻击。平台态势感知引擎将全程自动审计解题流量与 Writeup 相似度。

---

## 奖项设置与人才权益

- **全国特等奖（1支）**：奖金 **¥ 150,000** + 国家级权威防伪电子证书 + 冠军流动奖杯
- **全国一等奖（5支）**：奖金 **¥ 40,000 / 队** + 国家级重点实验室科研实习绿通卡
- **全国二等奖（15支）**：奖金 **¥ 10,000 / 队** + 荣誉证书
- **全国三等奖（39支）**：荣誉证书及赛事专属极客纪念徽章`,
    attachments: [
      {
        id: 'att-main-1',
        name: '2026第五届“XX杯”网络安全攻防实战赛参赛指南与章程.pdf',
        size: '2.4 MB',
        uploadedAt: '2026-09-28 09:30:00',
      },
      {
        id: 'att-main-2',
        name: '线上靶场VPN客户端连接配置手册与Writeup模板.docx',
        size: '860 KB',
        uploadedAt: '2026-10-15 10:00:00',
      },
    ],
    isPublic: true,
    createdAt: '2026-09-28 09:30:00',
    organizer: '“XX杯”全国网数智安全大赛组委会、国家信息安全工程技术研究中心',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-data',
    title: '2026“XX杯”全国网数智安全大赛 · 数据安全与隐私计算专项挑战赛',
    summary:
      '聚焦公共数据授权运营、金融多方安全计算（MPC）、联邦学习梯度反演防御及PB级敏感数据智能分类分级，开放真实脱敏政务与医疗数据集供参赛团队进行容器化评测。',
    startDate: '2026-11-10 09:00:00',
    endDate: '2026-12-28 18:00:00',
    coverTheme: 'data',
    customTags: ['数据要素流通', '隐私计算MPC', '联邦学习防御', 'Docker容器评测'],
    tracks: [
      { id: 't-d1', name: '联邦学习隐私保护与投毒防御赛道', description: '差分隐私预算受限下的模型鲁棒性对抗' },
      { id: 't-d2', name: '金融跨境数据合规与智能脱敏水印赛道', description: '高吞吐量敏感实体识别与抗擦除数据库暗水印' },
    ],
    schedule: [
      {
        id: 'st-d1',
        stage: '报名开启与基线代码发布',
        dateRange: '2026-11-10 10:00 ~ 2026-11-25 18:00',
        description: '',
      },
      {
        id: 'st-d2',
        stage: '初赛算法评测 A 榜阶段',
        dateRange: '2026-11-15 09:00 ~ 2026-12-05 18:00',
        description: '',
      },
      {
        id: 'st-d3',
        stage: '复赛极限对抗 B 榜锁定',
        dateRange: '2026-12-06 09:00 ~ 2026-12-12 18:00',
        description: '',
      },
      {
        id: 'st-d4',
        stage: '全国总决赛现场复现与路演答辩',
        dateRange: '2026-12-27 09:00 ~ 2026-12-28 17:30',
        description: '',
      },
    ],
    markdownContent: `# 赛事简介

随着国家数据要素市场化配置改革的深入推进，“数据可用不可见、数据可控可计量”已成为数字经济高质量发展的核心安全基石。**数据安全与隐私计算专项挑战赛**由国家数据安全重点实验室联合承办，面向全国高校计算机、网络空间安全、数学统计及人工智能相关专业学子开放。

---

## 赛题方向与评测标准

### 1. 联邦学习隐私泄露防御与差分隐私优化
参赛团队需在给定严格差分隐私预算（\`ε ≤ 1.5\`）的前提下，针对成员推理攻击（Membership Inference）与梯度反演攻击构建内生防御算子，确保跨机构联合建模精度下降不超过 \`2%\`。

### 2. 多源异构敏感数据分类分级与溯源水印
针对含 5,000 万条记录的仿真政务与医疗流转日志，设计轻量化识别与抗截屏/抗重采样数字水印方案。

---

## 容器化提交流程说明

\`\`\`bash
# 1. 拉取大赛官方评测评测基线镜像
docker pull registry.xxcup-sec.org.cn/data-track/baseline:2026-v1

# 2. 本地执行隐私预算与吞吐率自检脚本
python3 evaluate_local.py --dataset ./sample_data --epsilon 1.2

# 3. 推送参赛战队算法镜像至云端评测中心
docker push registry.xxcup-sec.org.cn/teams/your_team_id:submission_v1
\`\`\`

> **评测资源说明**：大赛云端评测中心为每支通过学籍认证的参赛队伍免费配发 **NVIDIA A800 算力评测配额**，无需自备昂贵硬件即可完成全流程训练与推理验证。`,
    attachments: [
      {
        id: 'att-data-1',
        name: '数据安全与隐私计算赛道Docker评测环境说明白皮书.pdf',
        size: '3.1 MB',
        uploadedAt: '2026-10-08 14:15:00',
      },
    ],
    isPublic: true,
    createdAt: '2026-10-08 14:15:00',
    organizer: '国家数据安全重点实验室、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-ai-pilot',
    title: '2026“XX杯”全国网数智安全大赛 · 大模型与人工智能安全先导赛',
    summary:
      '围绕大语言模型（LLM）越狱攻击与安全护栏构建、AIGC深度伪造多模态溯源鉴伪、智能体（Agent）提示词注入免疫等核心课题开展红蓝双向对抗评测。',
    startDate: '2026-06-01 09:00:00',
    endDate: '2026-09-25 18:00:00',
    coverTheme: 'ai',
    customTags: ['大模型越狱攻防', 'AIGC深伪鉴伪', 'Agent安全护栏', '已公示获奖名单'],
    tracks: [
      { id: 't-a1', name: 'LLM红蓝越狱对抗与安全对齐赛道', description: '攻击方构造对抗Prompt与防御方实时拦截护栏同场博弈' },
      { id: 't-a2', name: 'AIGC音视频深度伪造（Deepfake）鉴伪溯源赛道', description: '针对扩散模型生成图像与克隆语音的毫秒级真伪鉴别' },
      { id: 't-a3', name: '智能体（AI Agent）间接提示词注入防御赛道', description: '防范工具调用劫持与跨上下文权限越界' },
    ],
    schedule: [
      {
        id: 'st-a1',
        stage: '先导赛战队集结与报名',
        dateRange: '2026-06-01 09:00 ~ 2026-07-10 18:00',
        description: '',
      },
      {
        id: 'st-a2',
        stage: '线上算法基准测试与红蓝博弈',
        dateRange: '2026-07-15 09:00 ~ 2026-08-25 18:00',
        description: '',
      },
      {
        id: 'st-a3',
        stage: '全国总决赛暨获奖证书签发',
        dateRange: '2026-09-20 09:00 ~ 2026-09-25 17:30',
        description: '',
      },
    ],
    markdownContent: `# 先导赛回顾与成果公示

**2026“XX杯”大模型与人工智能安全先导赛**已于 2026 年 9 月 25 日圆满完成全部赛程。本项赛事作为第五届“XX杯”网数智安全大赛的揭幕先导赛事，开创了国内高校在大模型内生安全与多模态鉴伪领域的实战竞技先河。

---

## 核心技术成果

- **红蓝对抗高频样本库沉淀**：比赛期间累计产生超过 **42 万条** 高质量多语言越狱对抗 Prompt 与防御规则，经脱敏整理后已向全国合作高校网络空间安全学院开放共享。
- **超低延迟安全围栏（Guardrails）**：冠军团队提出的轻量化语义意图过滤架构，在仅增加 \`6.8ms\` 推理延迟的情况下，成功拦截了 \`99.1%\` 的间接提示词注入攻击。

---

## 电子证书查询说明

本赛事所有获奖战队选手及优秀指导教师的电子荣誉证书均已完成国密 **SM3 数字签名入库**。您可前往官网首页底部【电子证书查询与验证】专区，输入证书编号（如 \`XXCUP-2026-08921\`）或姓名实时核验并下载高清证书。`,
    isPublic: true,
    createdAt: '2026-05-18 11:00:00',
    organizer: '“XX杯”全国网数智安全大赛组委会、新一代人工智能安全与评测创新中心',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-ics-special',
    title: '2026“XX杯”车联网与智能工业控制系统安全极客邀请赛',
    summary:
      '针对智能网联汽车车载CAN总线入侵检测、车路云一体化V2X通信伪造防御、电力SCADA工控系统固件漏洞挖掘打造的硬核实网仿真攻防赛。',
    startDate: '2026-10-20 09:00:00',
    endDate: '2026-11-30 18:00:00',
    coverTheme: 'network',
    customTags: ['智能网联汽车', '工控SCADA靶场', '硬件固件逆向', '实车仿真沙盘'],
    tracks: [
      { id: 't-i1', name: '智能网联汽车CAN/车载以太网渗透与防护赛道', description: '基于真实T-Box与数字座舱硬件在环（HIL）台架评测' },
      { id: 't-i2', name: '新型电力系统与工业PLC固件安全赛道', description: 'Modbus/S7协议深度解析与工控微隔离防御' },
    ],
    schedule: [
      {
        id: 'st-i1',
        stage: '战队报名与固件仿真包发放',
        dateRange: '2026-10-20 09:00 ~ 2026-11-08 18:00',
        description: '',
      },
      {
        id: 'st-i2',
        stage: '线上固件逆向与协议夺旗选拔',
        dateRange: '2026-11-12 09:00 ~ 2026-11-15 18:00',
        description: '',
      },
      {
        id: 'st-i3',
        stage: '实车沙盘线下极客总决赛',
        dateRange: '2026-11-28 09:00 ~ 2026-11-30 17:30',
        description: '',
      },
    ],
    markdownContent: `# 车联网与智能工控安全赛项说明

随着智能网联汽车与新型工业互联网的规模化商用，物理世界与数字空间的边界正在快速融合。本赛项依托国家级车联网安全测试基地与工业控制安全仿真靶场，将赛场直接搬上 **真实车载硬件在环（HIL）台架** 与 **工控微电网物理沙盘**。

---

## 重点考察能力

1. **车载 ECU / T-Box 固件提取与逆向分析**：识别 RTOS 实时操作系统与嵌入式 Linux 中的内存破坏漏洞与硬编码密钥。
2. **V2X 车路协同无线通信协议鉴权加固**：抵御伪基站重放攻击与虚假交通信标注入。
3. **工业 PLC 逻辑炸弹检测与无损异常阻断**：在不中断工业产线连续运行的前提下完成流量清洗。`,
    isPublic: true,
    createdAt: '2026-10-12 16:40:00',
    organizer: '工业和信息化部网络安全管理局指导、“XX杯”全国网数智安全大赛组委会主办',
    registrationMode: 'third_party',
    thirdPartyUrl: 'https://ics-geek.xxcup-sec.org.cn/external-register',
  },
  {
    id: 'comp-2027-winter-camp',
    title: '2027“XX杯”全国高校数字安全冬令营暨后量子密码创新设计赛（内部筹备版）',
    summary:
      '面向抗量子计算攻击的新一代格密码（Lattice-based Cryptography）工程实现、侧信道能量分析防御与零信任内生安全架构设计的高阶冬令营挑战赛。',
    startDate: '2026-12-15 09:00:00',
    endDate: '2027-01-25 18:00:00',
    coverTheme: 'data',
    customTags: ['后量子密码PQC', '侧信道分析防御', '冬令营直通赛'],
    tracks: [
      { id: 't-w1', name: '抗量子格密码高速硬件/软件实现赛道', description: 'NIST PQC标准算法与国密后量子候选算法优化' },
      { id: 't-w2', name: '密码芯片侧信道功耗分析与掩码防护赛道', description: '基于真实采集电磁/功耗轨迹的密钥恢复对抗' },
    ],
    schedule: [
      {
        id: 'st-w1',
        stage: '冬令营报名与课题申报',
        dateRange: '2026-12-15 09:00 ~ 2027-01-05 18:00',
        description: '',
      },
      {
        id: 'st-w2',
        stage: '封闭式极客冬令营与决赛答辩',
        dateRange: '2027-01-18 09:00 ~ 2027-01-25 17:30',
        description: '',
      },
    ],
    markdownContent: `# 赛事筹备说明

本赛事目前处于组委会专家组内部审定阶段（默认后台状态为**隐藏**，管理员可在后台【赛事管理】中将其切换为**公开**，即可立即在前台【赛事目录】中向访客展示）。

---

## 核心赛题规划

- **后量子密码（PQC）高性能算子优化**：针对 NTT（数论变换）与多项式采样模块进行 AVX-512 / ARM Neon 指令集加速。
- **侧信道攻击与防御评估**：提供 100,000 条真实智能卡芯片加密功耗曲线，考察高阶差分能量分析（HO-DPA）与随机掩码防护设计。`,
    isPublic: false,
    createdAt: '2026-10-27 18:20:00',
    organizer: '国家密码科学基金专家组、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'none',
  },
  {
    id: 'comp-2026-cloud-def',
    title: '2026“XX杯”云原生与零信任架构安全攻防挑战赛',
    summary:
      '聚焦大规模Kubernetes生产集群逃逸检测、服务网格（Service Mesh）东西向流量微隔离、eBPF内核态实时入侵阻断与零信任身份网关攻防演练，支持跨校联合组队。',
    startDate: '2026-10-18 09:00:00',
    endDate: '2026-12-10 18:00:00',
    coverTheme: 'network',
    customTags: ['云原生K8s安全', 'eBPF内核防御', '允许跨校组队', '平台在线报名中'],
    tracks: [
      { id: 't-cl1', name: '云原生容器集群渗透与逃逸防御赛道', description: 'K8s API Server加固、容器运行时漏洞利用与阻断' },
      { id: 't-cl2', name: '基于eBPF的零信任微隔离与流量审计赛道', description: '无侵入式内核态异常系统调用拦截与云工作负载保护' },
      { id: 't-cl3', name: 'Serverless与微服务API网关供应链安全赛道', description: '多租户隔离验证、JWT鉴权绕过修复与镜像签名审计' },
    ],
    schedule: [
      {
        id: 'st-cl1',
        stage: '战队在线报名与跨校组队确认',
        dateRange: '2026-10-18 09:00 ~ 2026-11-20 18:00',
        description: '',
      },
      {
        id: 'st-cl2',
        stage: '线上云原生靶场集群夺旗选拔',
        dateRange: '2026-11-25 09:00 ~ 2026-11-26 21:00',
        description: '',
      },
      {
        id: 'st-cl3',
        stage: '全国总决赛（红蓝双向对抗）',
        dateRange: '2026-12-09 09:00 ~ 2026-12-10 18:00',
        description: '',
      },
    ],
    markdownContent: `# 赛事背景与亮点

**2026“XX杯”云原生与零信任架构安全攻防挑战赛**面向云原生基础设施与现代零信任安全架构，重点考察参赛战队在容器虚拟化、服务网格与内核态可观测性防御上的实战功底。

---

## 赛制特色

1. **开放跨校联合组队**：本赛项在后台【报名管理】中已开启 **允许跨校组队**，来自不同高校的认证学生可自由联合建队。
2. **eBPF 内核级防御实测**：提供真实 Linux 6.x 内核云主机环境，鼓励使用 \`eBPF / XDP\` 编写超低损耗安全探针。`,
    isPublic: true,
    createdAt: '2026-10-16 10:20:00',
    organizer: '中国网络空间安全协会云安全专委会、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'platform',
  },
  // === 新增未报名、进行中、平台开放报名的赛事示例（方便直接测试报名与分页） ===
  {
    id: 'comp-2026-llm-redteam',
    title: '2026“XX杯”生成式大模型红蓝对抗与内生安全创新赛',
    summary:
      '面向全国高校开放报名的AI安全实战创新赛，围绕大语言模型越狱防御、RAG知识库投毒检测、多模态对抗样本免疫及Agent工具调用鉴权展开高强度攻防对抗（进行中·尚未报名示例）。',
    startDate: '2026-10-20 09:00:00',
    endDate: '2026-12-10 18:00:00',
    coverTheme: 'ai',
    customTags: ['生成式AI安全', '大模型红蓝对抗', '开放报名中', '进行中'],
    tracks: [
      { id: 't-llm1', name: '大模型越狱攻击与围栏加固赛道', description: '针对千亿参数底座模型的自动化红队Prompt注入与蓝队语义防火墙构建' },
      { id: 't-llm2', name: '多智能体（Multi-Agent）内生安全赛道', description: '防范间接提示词注入、工具调用劫持与跨上下文越权' },
      { id: 't-llm3', name: 'AIGC深度伪造溯源与数字水印赛道', description: '高精度合成音视频伪造鉴别与鲁棒性隐式水印提取' },
    ],
    schedule: [
      {
        id: 'st-llm1',
        stage: '创新赛在线报名与团队组建',
        dateRange: '2026-10-20 09:00 ~ 2026-11-28 18:00',
        description: '',
      },
      {
        id: 'st-llm2',
        stage: '线上模型评测与对抗初赛',
        dateRange: '2026-12-01 09:00 ~ 2026-12-03 18:00',
        description: '',
      },
      {
        id: 'st-llm3',
        stage: '全国总决赛路演与实时攻防',
        dateRange: '2026-12-09 09:00 ~ 2026-12-10 17:30',
        description: '',
      },
    ],
    markdownContent: `# 生成式大模型红蓝对抗与内生安全创新赛

随着生成式人工智能在政务、金融、医疗等关键领域的规模化落地，大模型内生安全与供应链防护成为数字安全最前沿阵地。**2026“XX杯”生成式大模型红蓝对抗与内生安全创新赛** 现已正式开启报名，当前登录账号尚未报名本赛事，可直接点击右上角【立即报名】创建战队参赛。

---

## 核心赛题方向

1. **大模型越狱攻击与围栏加固**：基于真实开源基座模型开展红蓝实时博弈。
2. **多智能体（Multi-Agent）内生安全**：防范间接提示词注入与外部 API 越权调用。
3. **AIGC 深度伪造溯源与数字水印**：实现高精度合成音视频伪造鉴别与鲁棒性隐式水印提取。`,
    isPublic: true,
    createdAt: '2026-10-19 10:00:00',
    organizer: '“XX杯”全国网数智安全大赛组委会、人工智能安全国家重点实验室',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-telecom-antifraud',
    title: '2026“XX杯”电信网络诈骗黑产溯源与威胁情报分析大赛',
    summary:
      '聚焦涉诈域名快闪集群识别、跨境资金链路图谱追踪、恶意APK木马自动化沙箱逆向与多源威胁情报关联建模，当前正处于火热报名开放期（进行中·尚未报名示例）。',
    startDate: '2026-10-24 09:00:00',
    endDate: '2026-12-05 18:00:00',
    coverTheme: 'data',
    customTags: ['反诈黑产溯源', '威胁情报图谱', '恶意样本逆向', '开放报名中'],
    tracks: [
      { id: 't-tele1', name: '海量异构图谱涉诈团伙挖掘赛道', description: '基于脱敏真实黑产通信与资金流转图谱识别隐蔽犯罪团伙' },
      { id: 't-tele2', name: '移动端涉诈木马逆向与C2溯源赛道', description: '针对加固混淆涉诈APP进行自动化脱壳与C2通信协议还原' },
    ],
    schedule: [
      {
        id: 'st-tele1',
        stage: '战队报名与资格审核',
        dateRange: '2026-10-24 09:00 ~ 2026-11-26 18:00',
        description: '',
      },
      {
        id: 'st-tele2',
        stage: '线上大数据溯源算法排位赛',
        dateRange: '2026-11-28 09:00 ~ 2026-11-30 20:00',
        description: '',
      },
      {
        id: 'st-tele3',
        stage: '全国总决赛现场案件复盘答辩',
        dateRange: '2026-12-04 09:00 ~ 2026-12-05 18:00',
        description: '',
      },
    ],
    markdownContent: `# 电信网络诈骗黑产溯源与威胁情报分析大赛

依托全脱敏真实黑产对抗数据集，重点考察参赛战队在复杂加密通信分析、图神经网络异常团伙挖掘及恶意样本沙箱取证领域的综合实战能力。当前赛事处于火热报名期，欢迎直接点击【立即报名】组建战队。`,
    isPublic: true,
    createdAt: '2026-10-21 14:30:00',
    organizer: '国家反诈大数据协同创新中心、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-smartgrid-def',
    title: '2026“XX杯”新型电力系统与能源工业互联网安全防护赛',
    summary:
      '依托1:1电力调度自动化数字孪生靶场，考察智能变电站IEC-61850协议深度监测、新能源场站边缘网关加固及电网控制指令防篡改能力（进行中·尚未报名示例）。',
    startDate: '2026-10-25 09:00:00',
    endDate: '2026-12-12 18:00:00',
    coverTheme: 'network',
    customTags: ['电力工控安全', '数字孪生靶场', '开放报名中', '进行中'],
    tracks: [
      { id: 't-grid1', name: '智能变电站工控协议防护赛道', description: '识别针对IEC-104/MMS协议的畸形报文注入与重放攻击' },
      { id: 't-grid2', name: '新能源微电网云边协同应急赛道', description: '保障仿真电网频率稳定前提下的上位机与PLC控制逻辑加固' },
    ],
    schedule: [
      {
        id: 'st-grid1',
        stage: '参赛战队报名与实名核验',
        dateRange: '2026-10-25 09:00 ~ 2026-11-29 18:00',
        description: '',
      },
      {
        id: 'st-grid2',
        stage: '线上电力工控仿真初赛',
        dateRange: '2026-12-03 09:00 ~ 2026-12-04 18:00',
        description: '',
      },
      {
        id: 'st-grid3',
        stage: '电力数字孪生沙盘总决赛',
        dateRange: '2026-12-11 09:00 ~ 2026-12-12 17:00',
        description: '',
      },
    ],
    markdownContent: `# 新型电力系统与能源工业互联网安全防护赛

新型电力系统高度依赖数字化通信与智能终端感知，其网络空间安全直接关系国家能源命脉。本赛事面向全国高校电气工程、自动化及网络空间安全专业学生开放组队报名。`,
    isPublic: true,
    createdAt: '2026-10-22 11:15:00',
    organizer: '国家能源互联网安全联合实验室、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-openharmony-sec',
    title: '2026“XX杯”开源操作系统内核与机密计算作品赛',
    summary:
      '围绕万物智联操作系统微内核形式化验证、TEE可信执行环境应用开发、Rust内存安全组件重构等方向征集原创安全技术作品（进行中·尚未报名示例）。',
    startDate: '2026-10-26 09:00:00',
    endDate: '2026-12-18 18:00:00',
    coverTheme: 'ai',
    customTags: ['原创安全作品赛', '机密计算TEE', '内核安全', '开放报名中'],
    tracks: [
      { id: 't-oh1', name: '操作系统内核安全增强作品赛道', description: '微内核权限校验、Rust安全驱动重构与系统调用审计' },
      { id: 't-oh2', name: 'TEE可信执行环境创新应用赛道', description: '基于机密计算底座构建隐私保护型安全应用原型' },
    ],
    schedule: [
      {
        id: 'st-oh1',
        stage: '作品赛报名与选题申报',
        dateRange: '2026-10-26 09:00 ~ 2026-11-30 23:59',
        description: '',
      },
      {
        id: 'st-oh2',
        stage: '作品源码与技术白皮书提交',
        dateRange: '2026-12-01 00:00 ~ 2026-12-10 23:59',
        description: '',
      },
      {
        id: 'st-oh3',
        stage: '全国作品赛终审答辩与展演',
        dateRange: '2026-12-17 09:00 ~ 2026-12-18 17:00',
        description: '',
      },
    ],
    markdownContent: `# 开源操作系统内核与机密计算作品赛

鼓励参赛学生结合国产开源操作系统与硬件可信执行环境（TEE），设计并实现具有实际工程落地价值的内核级安全防御组件或机密计算工具。支持 1—4 人组队参赛，当前处于作品报名开放阶段。`,
    isPublic: true,
    createdAt: '2026-10-23 16:40:00',
    organizer: '开源系统安全技术委员会、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-satellite-sec',
    title: '2026“XX杯”空天地一体化卫星互联网安全攻防挑战赛',
    summary:
      '面向低轨卫星通信链路加密协议分析、星载软件无线电（SDR）信号抗干扰及地面站指控系统渗透防护的前沿专项赛（进行中·尚未报名示例）。',
    startDate: '2026-10-22 09:00:00',
    endDate: '2026-12-08 18:00:00',
    coverTheme: 'network',
    customTags: ['卫星互联网安全', '空天地一体化', 'SDR信号分析', '开放报名中'],
    tracks: [
      { id: 't-sat1', name: '卫星通信协议分析与抗干扰赛道', description: '星地链路协议逆向、伪基站信标识别与抗欺骗加固' },
      { id: 't-sat2', name: '地面站指控网络渗透防护赛道', description: '卫星测控网边界防护与星载固件安全审计' },
    ],
    schedule: [
      {
        id: 'st-sat1',
        stage: '在线组队报名与资格审查',
        dateRange: '2026-10-22 09:00 ~ 2026-11-27 18:00',
        description: '',
      },
      {
        id: 'st-sat2',
        stage: '星地链路仿真线上选拔赛',
        dateRange: '2026-11-30 09:00 ~ 2026-12-01 18:00',
        description: '',
      },
      {
        id: 'st-sat3',
        stage: '全国总决赛卫星硬件在环对抗',
        dateRange: '2026-12-07 09:00 ~ 2026-12-08 17:00',
        description: '',
      },
    ],
    markdownContent: `# 空天地一体化卫星互联网安全攻防挑战赛

随着低轨卫星互联网组网建设加速，空天地一体化信息安全成为国家战略安全新兴疆域。本赛事现面向全国高校航空航天、通信工程及网络安全相关专业学生开放组队报名。`,
    isPublic: true,
    createdAt: '2026-10-20 09:20:00',
    organizer: '空天信息安全国家重点实验室、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-quantum-crypto',
    title: '2026“XX杯”量子通信协议安全与抗量子密码工程挑战赛',
    summary:
      '聚焦量子密钥分发（QKD）网络节点鉴权、后量子格密码算法硬件加速实现与混合密钥交换协议安全性形式化验证（进行中·尚未报名示例）。',
    startDate: '2026-10-23 09:00:00',
    endDate: '2026-12-15 18:00:00',
    coverTheme: 'data',
    customTags: ['抗量子密码PQC', '量子通信安全', '开放报名中', '进行中'],
    tracks: [
      { id: 't-q1', name: '抗量子密码算法高性能工程优化赛道', description: '针对ML-KEM/ML-DSA及国密后量子算法的AVX2/FPGA加速' },
      { id: 't-q2', name: 'TLS 1.3后量子混合密钥交换协议审计赛道', description: '协议降级攻击检测与形式化安全证明' },
    ],
    schedule: [
      {
        id: 'st-q1',
        stage: '参赛战队报名与环境准备',
        dateRange: '2026-10-23 09:00 ~ 2026-11-28 18:00',
        description: '',
      },
      {
        id: 'st-q2',
        stage: '线上抗量子密码工程基准评测',
        dateRange: '2026-12-02 09:00 ~ 2026-12-05 18:00',
        description: '',
      },
      {
        id: 'st-q3',
        stage: '全国总决赛现场答辩',
        dateRange: '2026-12-14 09:00 ~ 2026-12-15 17:00',
        description: '',
      },
    ],
    markdownContent: `# 量子通信协议安全与抗量子密码工程挑战赛

面向后量子密码迁移工程实践，考察参赛团队在新型公钥密码算法实现效率与侧信道防护方面的综合能力。当前正处于开放报名期。`,
    isPublic: true,
    createdAt: '2026-10-22 15:10:00',
    organizer: '国家量子信息安全协同创新中心、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-iot-earlyclose',
    title: '2026“XX杯”物联网固件逆向与智能终端安全挑战赛',
    summary:
      '针对智能家居网关、工业边缘路由器、无人机飞控系统及穿戴式智能终端开展固件提取、RTOS内存漏洞挖掘与无线射频协议重放对抗（因硬件台架名额满员，已提前关闭报名）。',
    startDate: '2026-10-10 09:00:00',
    endDate: '2026-11-28 18:00:00',
    coverTheme: 'ai',
    customTags: ['IoT固件逆向', '硬件在环台架', '名额满员提前关闭', '进行中'],
    tracks: [
      { id: 't-iot1', name: '智能网关与路由器固件漏洞挖掘赛道', description: 'MIPS/ARM架构固件解包、NVRAM配置注入与命令执行挖掘' },
      { id: 't-iot2', name: '智能终端TEE可信执行环境与侧信道安全赛道', description: 'TrustZone安全世界TA漏洞分析与蓝牙/ZigBee协议审计' },
    ],
    schedule: [
      {
        id: 'st-iot1',
        stage: '大赛报名（名额满员已提前关闭）',
        dateRange: '2026-10-10 09:00 ~ 2026-10-27 18:00',
        description: '',
      },
      {
        id: 'st-iot2',
        stage: '线上固件逆向与仿真评测赛',
        dateRange: '2026-11-05 09:00 ~ 2026-11-08 18:00',
        description: '',
      },
      {
        id: 'st-iot3',
        stage: '线下实体设备破解总决赛',
        dateRange: '2026-11-27 09:00 ~ 2026-11-28 17:30',
        description: '',
      },
    ],
    markdownContent: `# 物联网固件逆向与智能终端安全挑战赛说明

本赛事聚焦万物互联时代的终端底座安全。由于远程硬件在环（HIL）测试台架并发席位达到上限，组委会已在后台【报名管理】中开启 **提前关闭** 开关，前台实时联动呈现“报名已关闭”置灰状态。`,
    isPublic: true,
    createdAt: '2026-10-05 09:00:00',
    organizer: '国家智能终端安全测评中心、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-crypto-deadline',
    title: '2026“XX杯”商用密码应用与后量子密码算法挑战赛',
    summary:
      '围绕国密SM2/SM3/SM4/SM9算法高并发工程实现、商用密码应用安全性评估（密评）实战改造、白盒密码抗密钥提取及零知识证明电路优化展开（报名已截止，正处于赛程进行中）。',
    startDate: '2026-09-10 09:00:00',
    endDate: '2026-11-20 18:00:00',
    coverTheme: 'data',
    customTags: ['国密SM系列算法', '商用密码密评', '白盒密码对抗', '报名已截止'],
    tracks: [
      { id: 't-cr1', name: '国密算法协议分析与白盒密码逆向赛道', description: '考察DFA故障注入攻击、查找表混淆还原与密钥恢复' },
      { id: 't-cr2', name: '政务信息系统商用密码密评改造方案赛道', description: '针对真实系统架构设计合规密码应用技术方案与密钥管理体系' },
    ],
    schedule: [
      {
        id: 'st-cr1',
        stage: '大赛报名与资格复核',
        dateRange: '2026-09-10 09:00 ~ 2026-10-20 23:59',
        description: '',
      },
      {
        id: 'st-cr2',
        stage: '全国线上密码分析与算法夺旗赛',
        dateRange: '2026-10-25 09:00 ~ 2026-10-30 18:00',
        description: '',
      },
      {
        id: 'st-cr3',
        stage: '全国总决赛暨密评实战路演',
        dateRange: '2026-11-18 09:00 ~ 2026-11-20 17:30',
        description: '',
      },
    ],
    markdownContent: `# 商用密码应用与后量子密码算法挑战赛

本赛事当前处于 **进行中** 状态，但报名截止时间（2026-10-20）已过，因此前台报名按钮自动联动显示为 **报名已截止**。`,
    isPublic: true,
    createdAt: '2026-09-01 11:30:00',
    organizer: '密码科技国家工程研究中心、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-solo-vuln',
    title: '2026“XX杯”零日漏洞挖掘与二进制极客个人挑战赛（单兵赛制）',
    summary:
      '专为高校顶尖二进制安全极客打造的个人单兵极限挑战赛（每队严格限制1人），聚焦浏览器V8引擎利用、Linux内核提权、虚拟化逃逸与自动化Fuzzing漏洞挖掘。',
    startDate: '2026-10-22 09:00:00',
    endDate: '2026-12-05 18:00:00',
    coverTheme: 'network',
    customTags: ['单兵个人赛(1人/队)', '浏览器与内核Pwn', '自动化Fuzzing', '高额漏洞奖金'],
    tracks: [
      { id: 't-sv1', name: '操作系统内核与虚拟化逃逸个人赛道', description: 'Linux Kernel / QEMU-KVM 高阶漏洞利用' },
      { id: 't-sv2', name: '浏览器引擎与编译器漏洞挖掘个人赛道', description: 'V8 / JavaScriptCore JIT编译优化漏洞挖掘' },
    ],
    schedule: [
      {
        id: 'st-sv1',
        stage: '个人极客报名与实名核验',
        dateRange: '2026-10-22 09:00 ~ 2026-11-18 18:00',
        description: '',
      },
      {
        id: 'st-sv2',
        stage: '线上72小时极限Pwn夺旗赛',
        dateRange: '2026-11-21 09:00 ~ 2026-11-24 09:00',
        description: '',
      },
      {
        id: 'st-sv3',
        stage: '线下现场0day演示与颁奖',
        dateRange: '2026-12-05 09:00 ~ 2026-12-05 18:00',
        description: '',
      },
    ],
    markdownContent: `# 零日漏洞挖掘与二进制极客个人挑战赛

本赛事采用 **1人单兵赛制**（后台【报名管理】配置 \`最少人数 = 1\`、\`最多人数 = 1\`）。当选手进入报名表填写页时，系统会根据配置自动隐藏“团队成员邀请”模块，仅需队长本人参赛（可绑指导教师）。`,
    isPublic: true,
    createdAt: '2026-10-18 15:00:00',
    organizer: '国家信息安全漏洞共享平台（CNVD）联合实验室、“XX杯”组委会',
    registrationMode: 'platform',
  },
  {
    id: 'comp-2026-finsec-open',
    title: '2026“XX杯”金融科技与跨境数据合规安全外部联合赛',
    summary:
      '联合金融机构共同举办的金融反欺诈图神经网络防御、量子金融安全通信与跨境支付隐私合规审计大赛，采用外部合作平台统一通道报名。',
    startDate: '2026-11-18 09:00:00',
    endDate: '2026-12-30 18:00:00',
    coverTheme: 'data',
    customTags: ['金融科技安全', '反欺诈图计算', '第三方平台报名', '未开始'],
    tracks: [
      { id: 't-fn1', name: '金融交易反欺诈模型对抗与鲁棒性赛道', description: '针对黑产团伙图结构伪装的实时识别算法' },
      { id: 't-fn2', name: '跨境金融数据流转合规审计与脱敏赛道', description: '自动化识别跨境报文中的敏感PII字段' },
    ],
    schedule: [
      {
        id: 'st-fn1',
        stage: '外部联合平台报名启动',
        dateRange: '2026-11-18 09:00 ~ 2026-12-02 18:00',
        description: '',
      },
      {
        id: 'st-fn2',
        stage: '金融沙箱模型评测与决赛路演',
        dateRange: '2026-12-08 09:00 ~ 2026-12-30 17:30',
        description: '',
      },
    ],
    markdownContent: `# 金融科技与跨境数据合规安全外部联合赛

本赛事采用 **选项C：开启第三方报名** 模式，点击详情页【立即报名】将新开标签页跳转至金融科技联合实验室外部报名系统。`,
    isPublic: true,
    createdAt: '2026-10-20 13:10:00',
    organizer: '金融科技安全国家级联合创新中心、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'third_party',
    thirdPartyUrl: 'https://finsec-arena.xxcup-sec.org.cn/register',
  },
  {
    id: 'comp-2026-supplychain',
    title: '2026“XX杯”开源软件供应链安全与SBOM治理定向特邀赛',
    summary:
      '针对开源组件投毒检测、软件物料清单（SBOM）全生命周期溯源、CI/CD构建流水线篡改防护开展的定向高校特邀演练赛（定向邀请制，不开启公开报名）。',
    startDate: '2026-10-12 09:00:00',
    endDate: '2026-11-25 18:00:00',
    coverTheme: 'network',
    customTags: ['开源供应链安全', 'SBOM溯源治理', '定向特邀赛', '不开启公开报名'],
    tracks: [
      { id: 't-sc1', name: '开源生态恶意包投毒自动化狩猎赛道', description: 'PyPI / npm / Maven 混淆恶意代码静态与动态沙箱识别' },
      { id: 't-sc2', name: '软件物料清单（SBOM）漏洞影响面分析赛道', description: '深层传递依赖漏洞可达性分析与补丁兼容性验证' },
    ],
    schedule: [
      {
        id: 'st-sc1',
        stage: '特邀高校战队名单确认',
        dateRange: '2026-10-12 09:00 ~ 2026-10-18 18:00',
        description: '',
      },
      {
        id: 'st-sc2',
        stage: '供应链投毒样本实时狩猎对抗',
        dateRange: '2026-10-22 09:00 ~ 2026-11-25 18:00',
        description: '',
      },
    ],
    markdownContent: `# 开源软件供应链安全与SBOM治理定向特邀赛

本赛事为国家一流网络安全学院示范高校定向特邀赛，报名模式配置为 **选项A：不开启报名**。前台赛事详情页无报名按钮，由于当前处于赛程期间，自动展示 **赛事进行中** 状态标识。`,
    isPublic: true,
    createdAt: '2026-10-01 10:00:00',
    organizer: '国家软件供应链安全检测中心、“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'none',
  },
  {
    id: 'comp-2025-archive-ctf',
    title: '2025第四届“XX杯”全国网数智安全大赛 · 年度总决赛历史归档',
    summary:
      '第四届“XX杯”全国网数智安全大赛完整赛题库、优秀战队解题报告（Writeup）汇编及获奖名册历史归档专区，供全国高校师生复盘学习。',
    startDate: '2025-10-01 09:00:00',
    endDate: '2025-12-22 18:00:00',
    coverTheme: 'ai',
    customTags: ['往届经典归档', '官方Writeup开源', '已结束赛事'],
    tracks: [
      { id: 't-ar1', name: '第四届网络安全攻防实战总决赛归档', description: '含全部18道CTF初赛题与6道AWD决赛靶机镜像说明' },
      { id: 't-ar2', name: '第四届数据安全与隐私计算挑战赛归档', description: '含冠军战队开源联邦学习防御基线方案' },
    ],
    schedule: [
      {
        id: 'st-ar1',
        stage: '全国线上初赛与复赛选拔',
        dateRange: '2025-10-01 09:00 ~ 2025-11-30 18:00',
        description: '',
      },
      {
        id: 'st-ar2',
        stage: '第四届全国总决赛暨颁奖盛典',
        dateRange: '2025-12-20 09:00 ~ 2025-12-22 17:30',
        description: '',
      },
    ],
    markdownContent: `# 2025第四届“XX杯”年度总决赛历史归档

本专区归档了 2025 年度第四届大赛的全部公开技术资料、靶机复现指南与获奖名册。赛事状态为 **已结束**，报名模式为 **选项A：不开启报名**。`,
    isPublic: true,
    createdAt: '2025-09-15 08:30:00',
    organizer: '“XX杯”全国网数智安全大赛组委会',
    registrationMode: 'none',
  },
  {
    id: 'comp-2026-redblue-internal',
    title: '2026“XX杯”高校实网蓝军应急响应与威胁狩猎特训赛（内部演练）',
    summary:
      '面向高校信息化运维团队与学生蓝军战队的高仿真APT攻击溯源、EDR终端遥测日志狩猎与勒索病毒应急恢复内部演练赛（当前后台设为隐藏，可随时公开）。',
    startDate: '2026-10-16 09:00:00',
    endDate: '2026-12-01 18:00:00',
    coverTheme: 'network',
    customTags: ['APT攻击溯源', '威胁狩猎EDR', '蓝军应急响应', '内部隐藏赛事'],
    tracks: [
      { id: 't-rb1', name: '全流量威胁狩猎与APT攻击链还原赛道', description: '基于Suricata告警、Zeek流量日志与Sysmon终端日志的攻击图谱重构' },
      { id: 't-rb2', name: '内网横向移动阻断与主机应急取证赛道', description: '内存取证（Volatility）、恶意持久化清除与域控加固' },
    ],
    schedule: [
      {
        id: 'st-rb1',
        stage: '特训战队组队与报名',
        dateRange: '2026-10-16 09:00 ~ 2026-11-18 18:00',
        description: '',
      },
      {
        id: 'st-rb2',
        stage: '云端孪生企业内网应急演练',
        dateRange: '2026-11-28 09:00 ~ 2026-12-01 18:00',
        description: '',
      },
    ],
    markdownContent: `# 高校实网蓝军应急响应与威胁狩猎特训赛

本赛事配置为 **选项B：开启平台在线报名**，默认在后台【赛事管理】中处于 **隐藏** 状态，用于演示后台按公开/隐藏状态管理及一键批量公开功能。`,
    isPublic: false,
    createdAt: '2026-10-15 17:00:00',
    organizer: '国家计算机网络应急技术处理协调中心（CNCERT/CC）、“XX杯”组委会',
    registrationMode: 'platform',
  },
];

// ============================================================================
// 首页配置（Banner 轮播图上传与跳转链接配置 + 首页推荐的 3 个赛事）
// ============================================================================
export interface HomeBannerConfig {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkType: 'competition' | 'view' | 'url';
  targetValue: string; // competitionId | viewName ('competitions' | 'notices' | 'news' | 'moments' | 'directory' | 'help') | custom URL
  linkLabel: string;
  sortOrder: number;
  isEnabled: boolean;
  updatedAt: string;
}

export const INITIAL_HOME_BANNERS: HomeBannerConfig[] = [
  {
    id: 'hb-1',
    title: '第五届“XX杯”网数智安全大赛正式开启报名',
    subtitle: '守护网络安全 · 筑牢安全防线，全国百所高校战队同台竞技',
    imageUrl: BANNER_POSTER_1,
    linkType: 'url',
    targetValue: 'https://xxcup.edu.cn/competitions/comp-2026-main',
    linkLabel: '查看赛事详情',
    sortOrder: 1,
    isEnabled: true,
    updatedAt: '2026-10-25 10:00',
  },
  {
    id: 'hb-2',
    title: '2026年“奇安信杯”全国大学生网络空间安全精英赛',
    subtitle: 'CTF夺旗挑战 + AWD Plus对抗，锤炼实战化网安精英战队',
    imageUrl: BANNER_POSTER_2,
    linkType: 'url',
    targetValue: 'https://xxcup.edu.cn/competitions/comp-2026-main',
    linkLabel: '查看赛事详情',
    sortOrder: 2,
    isEnabled: true,
    updatedAt: '2026-10-25 10:05',
  },
  {
    id: 'hb-3',
    title: '2026“XX杯”全国网数智安全大赛 · 数据安全与隐私计算专项挑战赛',
    subtitle: '联邦学习、同态加密与数据脱敏治理，打造国家级数据安全实战舞台',
    imageUrl: BANNER_POSTER_3,
    linkType: 'url',
    targetValue: 'https://xxcup.edu.cn/competitions/comp-2026-data',
    linkLabel: '查看赛事详情',
    sortOrder: 3,
    isEnabled: true,
    updatedAt: '2026-10-25 10:10',
  },
  {
    id: 'hb-4',
    title: '2026“XX杯”全国网数智安全大赛 · 大模型与人工智能安全先导赛',
    subtitle: '深入探索大模型越狱防御、提示词注入检测与多模态深度伪造鉴伪',
    imageUrl: BANNER_POSTER_5,
    linkType: 'url',
    targetValue: 'https://xxcup.edu.cn/competitions/comp-2026-ai-pilot',
    linkLabel: '查看赛事详情',
    sortOrder: 4,
    isEnabled: true,
    updatedAt: '2026-10-25 10:15',
  },
  {
    id: 'hb-5',
    title: '大赛官方获奖电子证书防伪查询与国密签章核验通道',
    subtitle: '一证一码防伪溯源，支持参赛高校与获奖战队在线一键核验',
    imageUrl: BANNER_POSTER_4,
    linkType: 'url',
    targetValue: 'https://xxcup.edu.cn/notices',
    linkLabel: '查看通知公告',
    sortOrder: 5,
    isEnabled: true,
    updatedAt: '2026-10-25 10:20',
  },
];

export const INITIAL_RECOMMENDED_COMP_IDS: string[] = [
  'comp-2026-main',
  'comp-2026-data',
  'comp-2026-ai-pilot',
];

// ============================================================================
// 系统管理 -> 赛区管理（中国 34 个省级行政区与赛区映射，完整包含港澳台）
// ============================================================================
export const ALL_CHINA_PROVINCES: string[] = [
  '北京市',
  '天津市',
  '河北省',
  '山西省',
  '内蒙古自治区',
  '辽宁省',
  '吉林省',
  '黑龙江省',
  '上海市',
  '江苏省',
  '浙江省',
  '安徽省',
  '福建省',
  '江西省',
  '山东省',
  '河南省',
  '湖北省',
  '湖南省',
  '广东省',
  '广西壮族自治区',
  '海南省',
  '重庆市',
  '四川省',
  '贵州省',
  '云南省',
  '西藏自治区',
  '陕西省',
  '甘肃省',
  '青海省',
  '宁夏回族自治区',
  '新疆维吾尔自治区',
  '香港特别行政区',
  '澳门特别行政区',
  '台湾省',
];

export interface DivisionRecord {
  id: string;
  name: string;
  code: string;
  provinces: string[];
  description: string;
  updatedAt: string;
}

export const INITIAL_DIVISIONS: DivisionRecord[] = [
  {
    id: 'div-north',
    name: '华北赛区',
    code: 'NORTH',
    provinces: ['北京市', '天津市', '河北省', '山西省', '内蒙古自治区'],
    description: '覆盖京津冀晋蒙五省市区高校，承担北方核心安全靶场选拔任务',
    updatedAt: '2026-10-20 09:00',
  },
  {
    id: 'div-northeast',
    name: '东北赛区',
    code: 'NORTHEAST',
    provinces: ['辽宁省', '吉林省', '黑龙江省'],
    description: '覆盖辽吉黑三省高校，重点支撑工业互联网与关键基础设施安全竞赛',
    updatedAt: '2026-10-20 09:00',
  },
  {
    id: 'div-east',
    name: '华东赛区',
    code: 'EAST',
    provinces: ['上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省'],
    description: '覆盖沪苏浙皖闽赣鲁七省市高校，聚焦云原生安全、金融科技与数据治理',
    updatedAt: '2026-10-20 09:00',
  },
  {
    id: 'div-central',
    name: '华中赛区',
    code: 'CENTRAL',
    provinces: ['河南省', '湖北省', '湖南省'],
    description: '覆盖豫鄂湘三省高校，依托国家网络安全人才与创新基地开展区域选拔',
    updatedAt: '2026-10-20 09:00',
  },
  {
    id: 'div-south',
    name: '华南赛区',
    code: 'SOUTH',
    provinces: ['广东省', '广西壮族自治区', '海南省'],
    description: '覆盖粤桂琼三省区高校，联动粤港澳大湾区与自贸港跨境数据安全生态',
    updatedAt: '2026-10-20 09:00',
  },
  {
    id: 'div-southwest',
    name: '西南赛区',
    code: 'SOUTHWEST',
    provinces: ['重庆市', '四川省', '贵州省', '云南省', '西藏自治区'],
    description: '覆盖川渝贵云藏五省市区高校，支撑成渝双城经济圈与国家大数据综合试验区',
    updatedAt: '2026-10-20 09:00',
  },
  {
    id: 'div-northwest',
    name: '西北赛区',
    code: 'NORTHWEST',
    provinces: ['陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区'],
    description: '覆盖陕甘青宁新五省区高校，聚焦密码学工程与无线通信安全攻防',
    updatedAt: '2026-10-20 09:00',
  },
  {
    id: 'div-hmt',
    name: '港澳台赛区',
    code: 'HMT',
    provinces: ['香港特别行政区', '澳门特别行政区', '台湾省'],
    description: '覆盖香港特别行政区、澳门特别行政区及台湾省高校，促进两岸四地网安青年技术交流',
    updatedAt: '2026-10-20 09:00',
  },
];

export const UNIVERSITY_FALLBACK_LOCATION_MAP: Record<string, { province: string; city: string }> = {
  清华大学: { province: '北京市', city: '北京市' },
  北京大学: { province: '北京市', city: '北京市' },
  北京航空航天大学: { province: '北京市', city: '北京市' },
  北京邮电大学: { province: '北京市', city: '北京市' },
  北京理工大学: { province: '北京市', city: '北京市' },
  中国科学院大学: { province: '北京市', city: '北京市' },
  中国人民大学: { province: '北京市', city: '北京市' },
  北京交通大学: { province: '北京市', city: '北京市' },
  天津大学: { province: '天津市', city: '天津市' },
  南开大学: { province: '天津市', city: '天津市' },
  上海交通大学: { province: '上海市', city: '上海市' },
  复旦大学: { province: '上海市', city: '上海市' },
  同济大学: { province: '上海市', city: '上海市' },
  华东师范大学: { province: '上海市', city: '上海市' },
  浙江大学: { province: '浙江省', city: '杭州市' },
  杭州电子科技大学: { province: '浙江省', city: '杭州市' },
  南京大学: { province: '江苏省', city: '南京市' },
  东南大学: { province: '江苏省', city: '南京市' },
  南京邮电大学: { province: '江苏省', city: '南京市' },
  南京航空航天大学: { province: '江苏省', city: '南京市' },
  中国科学技术大学: { province: '安徽省', city: '合肥市' },
  合肥工业大学: { province: '安徽省', city: '合肥市' },
  山东大学: { province: '山东省', city: '济南市' },
  中国海洋大学: { province: '山东省', city: '青岛市' },
  厦门大学: { province: '福建省', city: '厦门市' },
  福州大学: { province: '福建省', city: '福州市' },
  武汉大学: { province: '湖北省', city: '武汉市' },
  华中科技大学: { province: '湖北省', city: '武汉市' },
  中南大学: { province: '湖南省', city: '长沙市' },
  湖南大学: { province: '湖南省', city: '长沙市' },
  国防科技大学: { province: '湖南省', city: '长沙市' },
  郑州大学: { province: '河南省', city: '郑州市' },
  中山大学: { province: '广东省', city: '广州市' },
  华南理工大学: { province: '广东省', city: '广州市' },
  深圳大学: { province: '广东省', city: '深圳市' },
  暨南大学: { province: '广东省', city: '广州市' },
  哈尔滨工业大学: { province: '黑龙江省', city: '哈尔滨市' },
  哈尔滨工程大学: { province: '黑龙江省', city: '哈尔滨市' },
  吉林大学: { province: '吉林省', city: '长春市' },
  大连理工大学: { province: '辽宁省', city: '大连市' },
  东北大学: { province: '辽宁省', city: '沈阳市' },
  西安电子科技大学: { province: '陕西省', city: '西安市' },
  西安交通大学: { province: '陕西省', city: '西安市' },
  西北工业大学: { province: '陕西省', city: '西安市' },
  电子科技大学: { province: '四川省', city: '成都市' },
  四川大学: { province: '四川省', city: '成都市' },
  重庆大学: { province: '重庆市', city: '重庆市' },
  重庆邮电大学: { province: '重庆市', city: '重庆市' },
  香港大学: { province: '香港特别行政区', city: '香港' },
  香港中文大学: { province: '香港特别行政区', city: '香港' },
  香港科技大学: { province: '香港特别行政区', city: '香港' },
  澳门大学: { province: '澳门特别行政区', city: '澳门' },
  澳门科技大学: { province: '澳门特别行政区', city: '澳门' },
  台湾大学: { province: '台湾省', city: '台北市' },
  台湾清华大学: { province: '台湾省', city: '新竹市' },
};

export function resolveUniversityLocationAndDivision(
  universityName: string,
  institutions?: Array<{
    name: string;
    location?: string;
    province?: string;
    city?: string;
  }>,
  divisions: DivisionRecord[] = INITIAL_DIVISIONS
): {
  province: string;
  city: string;
  locationText: string;
  divisionName: string;
} {
  const cleanName = (universityName || '').trim();
  const matchedInst = institutions?.find((inst) => inst.name === cleanName);
  let province = matchedInst?.province || '';
  let city = matchedInst?.city || '';

  if (!province && matchedInst?.location) {
    const parts = matchedInst.location.split('·').map((s) => s.trim());
    province = parts[0] || '';
    city = parts[1] || parts[0] || '';
  }

  if (!province && UNIVERSITY_FALLBACK_LOCATION_MAP[cleanName]) {
    province = UNIVERSITY_FALLBACK_LOCATION_MAP[cleanName].province;
    city = UNIVERSITY_FALLBACK_LOCATION_MAP[cleanName].city;
  }

  if (!province) {
    for (const p of ALL_CHINA_PROVINCES) {
      const shortProv = p.replace(/省|市|壮族自治区|维吾尔自治区|回族自治区|特别行政区|自治区/g, '');
      if (shortProv && cleanName.includes(shortProv)) {
        province = p;
        city = p.endsWith('市') ? p : '';
        break;
      }
    }
  }

  if (!province) {
    province = '北京市';
    city = '北京市';
  }

  const matchedDivision = divisions.find((d) =>
    d.provinces.some(
      (p) =>
        p === province ||
        p.replace(/省|市|壮族自治区|维吾尔自治区|回族自治区|特别行政区|自治区/g, '') ===
          province.replace(/省|市|壮族自治区|维吾尔自治区|回族自治区|特别行政区|自治区/g, '')
    )
  );

  const locationText =
    city && city !== province ? `${province} ${city}` : province;

  return {
    province,
    city: city || province,
    locationText,
    divisionName: matchedDivision ? matchedDivision.name : '未分配赛区',
  };
}

