import crypto from "node:crypto";
import http from "node:http";
import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

function loadLocalEnv() {
  try {
    const envUrl = new URL(".env", import.meta.url);
    if (!fs.existsSync(envUrl)) return;

    const entries = fs.readFileSync(envUrl, "utf8").split(/\r?\n/);
    for (const entry of entries) {
      const trimmed = entry.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex < 1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Environment variables can still be provided by the shell.
  }
}

loadLocalEnv();

const PORT = Number(process.env.PORT || 8787);
const MAX_BODY_BYTES = Number(process.env.ANALYZE_MAX_BODY_BYTES || 12 * 1024 * 1024);
const AI_PROVIDER = process.env.AI_PROVIDER || "yunwu";
const AI_BASE_URL = (process.env.AI_BASE_URL || "https://api.wlai.vip/v1").replace(/\/+$/, "");
const API_KEY = process.env.API_KEY || "sk-Ifu2nNYcy3QQXi7zmNdvtZd152yVOFCMDpVMvOEJpmx9Cnpn";
const MODEL =
  process.env.AI_MODEL ||
  process.env.OPENAI_VISION_MODEL ||
  "gpt-4o-mini";
const IMAGE_DETAIL = process.env.OPENAI_IMAGE_DETAIL || "high";
const DEFAULT_IMAGE_MODELS =
  AI_PROVIDER === "openai"
    ? "gpt-image-1"
    : "gpt-image-2,gpt-image-1,gpt-image-1.5,qwen-image-edit-2509,flux.1-kontext-pro";
const IMAGE_MODELS = (process.env.AI_IMAGE_MODEL || DEFAULT_IMAGE_MODELS)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const IMAGE_SIZES = (process.env.AI_IMAGE_SIZE || "1024x1024,1536x1024,1024x1536,auto")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

// ── 用户认证 & 数据持久化配置 ──
const JWT_SECRET = process.env.JWT_SECRET || "lin-art-guide-2024-secret-fixed";
const JWT_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 天
const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const RECORDS_FILE = path.join(DATA_DIR, "records.json");
const INVITE_FILE = path.join(DATA_DIR, "invite-codes.json");
const PAYMENT_SECRET = process.env.PAYMENT_SECRET || "";
const FREE_MODE = process.env.FREE_MODE !== "false"; // 默认免费模式
const ADMIN_KEY = process.env.ADMIN_KEY || "lin2024";

// 初始化 data 目录
fs.mkdirSync(DATA_DIR, { recursive: true });

function writeServerLog(event, details = {}) {
  const safeDetails = Object.fromEntries(
    Object.entries(details).filter(([key]) => !/key|token|secret|authorization/i.test(key)),
  );
  const line = JSON.stringify({
    at: new Date().toISOString(),
    event,
    ...safeDetails,
  });
  try {
    fs.appendFileSync(new URL("api-server.log", import.meta.url), `${line}\n`, "utf8");
  } catch {
    // Logging should never break generation.
  }
  console.log(line);
}

// ──────────── 数据持久化工具 ────────────

function readJSON(filepath) {
  try {
    if (!fs.existsSync(filepath)) return {};
    const raw = fs.readFileSync(filepath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeJSON(filepath, data) {
  const tmp = filepath + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, filepath);
}

function generateId(prefix = "") {
  return `${prefix}${crypto.randomUUID().slice(0, 12)}`;
}

// ──────────── 密码哈希（scrypt）────────────

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64");
  const hash = crypto.scryptSync(password, salt, 64).toString("base64");
  return { hash, salt };
}

function verifyPassword(password, salt, hash) {
  const derived = crypto.scryptSync(password, salt, 64).toString("base64");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(derived));
}

// ──────────── JWT（纯 crypto 实现）────────────

function base64UrlEncode(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

function generateJWT(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + Math.floor(JWT_EXPIRES_MS / 1000) };
  const headerB64 = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(fullPayload)));
  const signature = crypto.createHmac("sha256", JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest();
  return `${headerB64}.${payloadB64}.${base64UrlEncode(signature)}`;
}

function verifyJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest();
    const providedSig = base64UrlDecode(sigB64);
    if (!crypto.timingSafeEqual(expectedSig, providedSig)) return null;
    const payload = JSON.parse(base64UrlDecode(payloadB64).toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ──────────── 认证中间件 ────────────

function getAuthToken(request) {
  const auth = request.headers["authorization"] || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function requireAuth(request) {
  const token = getAuthToken(request);
  if (!token) return null;
  const payload = verifyJWT(token);
  return payload || null;
}

// 免费模式下自动使用访客身份，无需登录
function getAuthOrGuest(request) {
  if (FREE_MODE) {
    return { userId: "guest", email: "guest@artguide.local", isGuest: true };
  }
  return requireAuth(request);
}

// ──────────── 用户 & 积分管理 ────────────

function getUsers() {
  return readJSON(USERS_FILE);
}

function saveUsers(users) {
  writeJSON(USERS_FILE, users);
}

function getUserByEmail(email) {
  const users = getUsers();
  return Object.values(users).find((u) => u.email === email.toLowerCase()) || null;
}

function getUserById(userId) {
  const users = getUsers();
  return users[userId] || null;
}

function createUser(email, password) {
  const users = getUsers();
  if (getUserByEmail(email)) return null; // 已存在
  const id = generateId("u_");
  const { hash, salt } = hashPassword(password);
  const user = {
    id,
    email: email.toLowerCase(),
    passwordHash: hash,
    passwordSalt: salt,
    credits: 5, // 新用户赠送 5 积分
    createdAt: new Date().toISOString(),
  };
  users[id] = user;
  saveUsers(users);
  return user;
}

function getUserCredits(userId) {
  const user = getUserById(userId);
  return user ? user.credits : 0;
}

function consumeCredits(userId, amount = 1) {
  if (FREE_MODE) return { success: true, credits: Infinity }; // 免费模式无限用
  const users = getUsers();
  const user = users[userId];
  if (!user) return { success: false, reason: "user_not_found" };
  if (user.credits < amount) return { success: false, reason: "insufficient_credits", credits: user.credits };
  user.credits -= amount;
  saveUsers(users);
  return { success: true, credits: user.credits };
}

function addCredits(userId, amount) {
  if (FREE_MODE) return true; // 免费模式不需要退款
  const users = getUsers();
  const user = users[userId];
  if (!user) return false;
  user.credits += amount;
  saveUsers(users);
  return true;
}

// ──────────── 支付订单管理 ────────────

function getOrders() {
  return readJSON(ORDERS_FILE);
}

function saveOrders(orders) {
  writeJSON(ORDERS_FILE, orders);
}

function createOrder(userId, packageId, credits, price) {
  const orders = getOrders();
  const orderId = generateId("ord_");
  const order = {
    id: orderId,
    userId,
    packageId,
    credits,
    price,
    status: "pending", // pending | paid | cancelled
    createdAt: new Date().toISOString(),
    paidAt: null,
  };
  orders[orderId] = order;
  saveOrders(orders);
  return order;
}

function getOrder(orderId) {
  const orders = getOrders();
  return orders[orderId] || null;
}

function markOrderPaid(orderId) {
  const orders = getOrders();
  const order = orders[orderId];
  if (!order || order.status !== "pending") return false;
  order.status = "paid";
  order.paidAt = new Date().toISOString();
  saveOrders(orders);
  addCredits(order.userId, order.credits);
  return true;
}

// ──────────── 邀请码管理 ────────────

function getInviteCodes() {
  return readJSON(INVITE_FILE);
}

function saveInviteCodes(codes) {
  writeJSON(INVITE_FILE, codes);
}

function validateInviteCode(code) {
  const codes = getInviteCodes();
  const entry = codes[code];
  if (!entry) return { valid: false, reason: "邀请码无效" };
  if (entry.used) return { valid: false, reason: "邀请码已被使用" };
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    return { valid: false, reason: "邀请码已过期" };
  }
  return { valid: true, entry };
}

function markInviteCodeUsed(code) {
  const codes = getInviteCodes();
  const entry = codes[code];
  if (!entry) return;
  entry.used = true;
  entry.usedAt = new Date().toISOString();
  saveInviteCodes(codes);
}

// 保留旧函数向后兼容
function validateAndUseInviteCode(code) {
  const result = validateInviteCode(code);
  if (result.valid) markInviteCodeUsed(code);
  return result;
}

function generateInviteCode(note = "") {
  const codes = getInviteCodes();
  const code = Array.from({ length: 8 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
  ).join("");
  codes[code] = {
    code,
    used: false,
    createdAt: new Date().toISOString(),
    note,
    expiresAt: null, // null = 永不过期
  };
  saveInviteCodes(codes);
  return code;
}

// ──────────── 支付套餐配置（按算力计费）────────────

const CREDIT_UNIT_PRICE = parseFloat(process.env.CREDIT_PRICE || "0.39"); // 每积分单价（元）
const PAYMENT_PACKAGES = [
  { id: "pkg_10", credits: 10, hot: false,
    payUrl: process.env.PAY_URL_10 || "" },
  { id: "pkg_30", credits: 30, hot: true,
    payUrl: process.env.PAY_URL_30 || "" },
  { id: "pkg_100", credits: 100, hot: false,
    payUrl: process.env.PAY_URL_100 || "" },
  { id: "pkg_200", credits: 200, hot: false,
    payUrl: process.env.PAY_URL_200 || "" },
];

// 根据积分数计算价格
function calcPrice(credits) {
  return (credits * CREDIT_UNIT_PRICE).toFixed(2);
}

const labels = {
  contrast: "\u5bf9\u6bd4",
  align: "\u5bf9\u9f50",
  repeat: "\u91cd\u590d",
  proximity: "\u4eb2\u5bc6",
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["teacherCopy", "psychologyAnalysis", "familyEducation", "projectionAnalysis", "talentInsight", "parentWording"],
  properties: {
    teacherCopy: {
      type: "string",
      description: "温暖简短的老师点评（60-100字）。先描述一个画面具体细节，再给一句鼓励。禁止模板话术。禁止说'画得像不像/好不好'。",
    },
    psychologyAnalysis: {
      type: "object",
      additionalProperties: false,
      required: ["emotionState", "securityLevel", "selfCognition", "keyEvidence"],
      properties: {
        emotionState: {
          type: "string",
          description: "【情绪状态分析】基于色彩+线条+内容三维度判断。必须引用画面具体证据。参考框架：红色/尖锐线条=情绪激烈，蓝色/柔和线条=沉静，黑色大量+阴郁内容=需关注。格式：'色彩上[证据]，线条上[证据]，内容上[证据]→综合判断情绪状态为[状态]。'",
        },
        securityLevel: {
          type: "string",
          description: "【安全感评估】基于布局+人物大小+环境元素判断。参考：画面极小在角落=缺乏安全感；居中饱满=安全感足；画保护者=渴望被保护；太阳/房子缺位=需关注。格式：'布局上[证据]，人物表现上[证据]→安全感状态为[评估]。'",
        },
        selfCognition: {
          type: "string",
          description: "【自我认知分析】基于画自己的方式判断。参考：身体完整色彩丰富=自我整合良好；缺少部位=某方面否定；把自己画很大=自信；很小=自我评价低。格式：'[具体画面证据]→自我认知表现为[分析]。'",
        },
        keyEvidence: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: { type: "string" },
          description: "支撑以上判断的关键画面证据清单，每条必须标注画面位置。",
        },
      },
    },
    familyEducation: {
      type: "object",
      additionalProperties: false,
      required: ["parentInterference", "strengthPotential", "actionSuggestions"],
      properties: {
        parentInterference: {
          type: "string",
          description: "【家长可能的干扰】基于蔺老师公式'表现=优势-干扰-内耗'，从画面痕迹推断家长可能存在的干扰行为（如催促、比较、过度指导、用'像不像'评价等）。格式：'画面中[具体痕迹]可能说明家长存在[干扰类型]→这会导致孩子[内耗表现]。'",
        },
        strengthPotential: {
          type: "string",
          description: "【优势潜能发现】基于四个观察线索（成功体验/事前渴望/过程投入/事后满足）和天赋识别，指出孩子在这幅画中展现的优势方向。格式：'从[画面证据]可以看出孩子在[某方面]有优势潜能。'",
        },
        actionSuggestions: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: { type: "string" },
          description: "给家长的3-5条具体行动建议。必须是今晚就能做的小行动。禁止写'多鼓励''营造氛围''接纳孩子'等万能话。每条要对应画面具体内容。",
        },
      },
    },
    projectionAnalysis: {
      type: "object",
      additionalProperties: false,
      required: ["attentionProjection", "relationshipProjection", "needProjection"],
      properties: {
        attentionProjection: {
          type: "string",
          description: "【注意力投射】孩子近期关注什么，画里就反复出现什么。引用画面中占比最大/细节最多的元素。格式：'画面中[占比最大/细节最多的元素]说明孩子近期注意力集中在[某方面]。'",
        },
        relationshipProjection: {
          type: "string",
          description: "【关系投射】画中人物的大小/距离/完整性投射孩子的人际关系感知。参考：谁最大=最重要，谁被漏画=关系疏离，谁第一个画=心中最亲近。格式：'画面中[人物关系特征]投射出[关系感知]。'",
        },
        needProjection: {
          type: "string",
          description: "【需求投射】画中的超级英雄/保护者/特殊角色投射孩子的内心需求（保护/力量/关注/自由等）。格式：'画面中[角色/元素]可能投射孩子对[需求]的渴望。'",
        },
      },
    },
    talentInsight: {
      type: "object",
      additionalProperties: false,
      required: ["primaryTalent", "evidenceList"],
      properties: {
        primaryTalent: {
          type: "string",
          description: "【主导天赋识别】从蔺老师12种天赋中选择最匹配的1种。格式：'主导天赋：[天赋名称]。判定理由：①[画面证据]→②[过程痕迹推断]→③[两者共同指向该天赋]。'",
        },
        evidenceList: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: { type: "string" },
          description: "天赋证据清单。每条格式：'[画面位置]的[具体元素]→说明[天赋表现]'。必须标注位置。",
        },
      },
    },
    parentWording: {
      type: "object",
      additionalProperties: false,
      required: ["shouldSay", "shouldNotSay"],
      properties: {
        shouldSay: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: { type: "string" },
          description: "【家长应该说的话】基于蔺老师反馈话术体系，结合这幅具体画面给出家长可以直接对孩子说的原句。每条必须是对应画面具体内容的完整句子。参考话术：'可以给我介绍一下你的画吗？''我看到这里有一条很长的线''你画这个地方特别仔细，看来它对你很重要''这次你比上次多画了很多细节，你自己觉得哪里最满意？'",
        },
        shouldNotSay: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: { type: "string" },
          description: "【家长不应该说的话】基于蔺老师家庭美育干扰理论，结合这幅画面给出家长应避免说的话。参考禁忌：'你画的是什么？''怎么不像？''别人画得比你好''真棒太好了（空泛）'。每条需结合画面特征说明为什么不能说。",
        },
      },
    },
  },
};

const styleGuideSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "styleName",
    "styleCategory",
    "reason",
    "sceneDirection",
    "colorDirection",
    "compositionDirection",
  ],
  properties: {
    styleName: { type: "string" },
    styleCategory: { type: "string" },
    reason: { type: "string" },
    sceneDirection: { type: "string" },
    colorDirection: { type: "string" },
    compositionDirection: { type: "string" },
  },
};

const analysisPrompt = [
  "🚨 核心指令：你不是在写模板作文。你必须像一位真正的老师那样，盯着这幅具体的画来分析。",
  "这幅画是独一无二的——画它的孩子也是独一无二的。你的每一个判断，都必须能在这幅画里找到证据。",
  "",
  "You are a warm children's art teacher helping parents guide a child's hand-drawn artwork.",
  "You operate within the 家庭美育体系 (Family Art Education System), which is grounded in these principles:",
  "",
  "=== 蔺老师家庭美育核心框架（必须在分析中体现）===",
  "核心公式：表现 = 优势 - 干扰 - 内耗。要从激发优势潜能、减少干扰、理清内耗三个维度思考。",
  "教育立场：「教育是农业，而不是工业」——了解你手中的种子是什么，才能知道如何培养它。以儿童为中心，不做成人写实标准评判。",
  "天赋定义：天赋是孩子「自然而然、反复出现、可被高效利用」的思维、感受或行为模式。始于天赋，终于优势。",
  "优势视角：转换视角看待孩子的画面——不把孩子反复画的内容看作问题，而是看作天赋线索。如课程案例：只画打仗的男孩不是心理有问题，而是展现了聚焦型学习风格。",
  "四个观察线索：①成功(自我效能感) ②事前渴望(主动) ③过程投入(心流) ④事后满足(成就感)。分析时应关注画面中体现投入度的痕迹。",
  "接纳原则：涂鸦是玩和表达的结合；差异化是正常现象（有的孩子擅长形体、有的对色彩敏感、有的乐于再设计）；发展中状态不是能力缺失；任何画面内容（攻击/怪物/黑暗）先看作心理表达出口。",
  "反馈原则：先看见孩子，再看见作品；先问故事，再提建议；先描述具体观察，再表达感受；先保护表达欲，再谈技巧。",
  "",
  "Analyze the uploaded image visually. Keep the child's original expression and imagination.",
  "Return JSON only. All visible text values must be in Simplified Chinese.",
  "Do not mention AI, model, upload, image quality, or adult judging standards.",
  "teacherCopy should feel like a warm teacher's note to parent and child, using the蔺老师反馈话术风格: encouraging first, then one focused direction. Never say 画得像不像/好不好. Begin with specific observation of what the child drew.",
  "tags should describe visible traits such as subject, line density, color, composition direction, balance, and blank space.",
  "Do not generate separate contrast, alignment, repetition, or proximity cards.",
  "skeleton should diagnose the composition frame: visual center, viewing flow line, balance, and foreground/middle/background depth.",
  "nextSteps must be exactly three practical actions a child can draw next, each under 32 Chinese characters.",
  "colorPlan should give a practical coloring direction for the visible draft: palette colors with hex values, where each color is used, color focus, and child-friendly coloring steps.",
  "",
  "=== STRENGTH ANALYSIS — 必须基于画面具体内容，严禁瞎猜 ===",
  "IMPORTANT: Every single statement in strengthAnalysis must be backed by SPECIFIC visual evidence you can point to in THIS drawing. If you cannot see evidence for something, do NOT say it.",
  "",
  "============================================================",
  "📚 儿童绘画心理学分析参考框架（徐静茹《看画识童心》）",
  "============================================================",
  "以下是基于徐静茹老师著作的13维度解读体系，分析时必须结合画面实际内容参考：",
  "",
  "【生命能量】通过线条方向识别：顺时针画圈=顺应型（适应性强、乖巧），逆时针画圈=执拗型（坚韧、抗压）。线条流畅稳定vs戳破纸=不同能量模式。",
  "【持续力vs爆发力】长而稳定线条=持续力型（沉稳耐心、慢热持久），细碎短线条=爆发力型（思维跳跃、快速启动易转移）。",
  "【色彩解读】关键原则：6岁前用色随机性较大，学龄后更具稳定性。红色=活力/攻击性，蓝色=沉静/压抑，黑色=力量/不安（关键看量和是否唯一使用），黄色=快乐/渴望关注，绿色=平和/固执，紫色=敏感/焦虑，粉色=温柔/依赖。黑白线稿完全正常，不代表心理问题。",
  "【形状象征】圆形=秩序感/保护，三角形/锯齿=目标感/冲突，方形/格子=规则感/束缚，心形=爱的需求，星形=自我期许，连环图案=条理性/可能重复焦虑。",
  "【布局分析】画面极小在角落=缺乏安全感/退缩，过大冲出纸外=渴望关注/冲动，偏上=乐观/想象力，偏下=务实/可能压抑，偏左=怀旧/依恋过去，偏右=面向未来/与权威关系，居中饱满=安全感充足。",
  "【人物解读】谁画得最大=最重要的人，谁最仔细=关注最多，被漏画肢体=关系可能疏离，第一个画的人=心中最重要的人，把自己画大=自信，画很小=自我评价低，夸张某部位=痛点放大（心理或生理的关注焦点）。",
  "【情绪识别】头上着火/机器人=强烈愤怒压力，火山/外星人入侵=释放压抑情绪，不平静书桌=内心烦躁，线条杂乱戳破纸=情绪激烈，全是太阳笑脸=太阳笑脸期正常（6-10岁），画面阴暗人物哭泣=悲伤需关注。",
  "【安全感评估】画保护者形象=渴望被保护，被拴住小动物=感到过度控制，太阳+房子=温暖与归属（缺位需关注），主体偏右偏上=安全感较足，大量云朵/栅栏/围墙=心理防线，底部坚实基线=脚踏实地。",
  "【攻击性识别】线条尖锐锯齿多+力度大=攻击或防御性强，武器/战斗/怪兽=释放攻击冲动（男孩7-9岁狗不理期完全正常），红色+粗重锐利线条=愤怒攻击双重信号。",
  "【创伤信号】尖锐三角形反复出现=内心刺痛感，动物身上创可贴=无意识表达'我受伤了'，车祸事故重现=PTSD可能，长期只画黑白画面阴郁=持续性情绪创伤，'毁灭世界'主题=极度压抑的求救。创伤迹象需建议专业心理咨询。",
  "【自我认知】身体完整色彩丰富=自我整合良好，缺少身体部位=某方面否定或忽视，重复画同一形象=通过该形象完成自我认同建构，大量'我'的标注=自我意识建立中。",
  "【关系投射】经常画某个家人=最亲近的人，拒绝画某个家人=关系疏远或恐惧，家人间大小比例失调=心中权力和亲密序位，留守儿童把父母画在天上/远处=思念和现实隔离感。",
  "【环境元素】太阳=温暖安全生命能量，房子=家庭归属感（门窗大小=开放性），树=成长生命力（树干粗细=承压力），蛇=恐惧或潜意识，怪兽=恐惧具象化，天空/云=心境开阔度，道路=人生方向感。",
  "",
  "⚠️ 使用以上框架时：①必须引用画面具体证据 ②多维度综合判断不可孤立 ③用'可能''可以观察''可以问问孩子'的态度 ④不贴标签不下诊断 ⑤创伤信号严重时建议专业介入。",
  "",
  "============================================================",
  "⚠️ 第一步：画面基本事实声明（必须先输出，防止瞎编）",
  "============================================================",
  "在给出任何分析之前，你必须先确认以下基本事实。如果你在分析中说了与这些事实矛盾的话，说明你在瞎编：",
  "",
  "【必填】这幅画是彩色的还是黑白的？____（如果答案是黑白/线稿，那么你后面的所有分析中绝对禁止出现任何关于'颜色''色彩''配色'的描述）",
  "【必填】画面中有人物吗？____ 有几个？____",
  "【必填】画面中有动物吗？____ 是什么动物？____",
  "【必填】画面中有机械/交通工具/建筑吗？____ 具体是什么？____",
  "【必填】画面中有文字/对话气泡/分镜框吗？____",
  "【必填】画面是写实的还是想象的？____",
  "",
  "🚫 如果你在后续分析中描述了以上声明中不存在的内容（如声明是黑白画却讨论色彩、声明没有人物却分析人物表情），则整个分析作废。",
  "",
  "============================================================",
  "BEFORE writing anything, first describe to yourself what you actually SEE:",
  "- What characters/objects/animals are drawn? Describe their shapes, sizes, positions.",
  "- How are the lines? Bold and confident? Tentative and light? Scribbly and searching? Carefully controlled?",
  "- What is the child emphasizing? What's drawn large and detailed vs small and sketchy?",
  "- Are there repeated elements? Patterns? Unusual color choices?",
  "- What's the spatial arrangement? Centered? Scattered? Layered?",
  "- What emotional tone does the drawing convey through its visual qualities?",
  "",
  "=== ⚠️ 天赋识别强制预分析（写到一半之前必须完成）===",
  "在给出任何天赋结论之前，你必须先用以下格式输出预分析结果（这是防止模板套用的硬性要求）：",
  "",
  "【画面元素清单】逐条列举画中每个可辨识的元素及其特征（至少列5条）：",
  "  例：①左下角有一只蓝色蝴蝶，翅膀上有圆形花纹 ②画面中央有一个穿红色裙子的小女孩...",
  "",
  "【过程痕迹推断】从画面中可观察到的行为痕迹推断孩子画画时的状态：",
  "  例：线条有多处反复修改痕迹→孩子追求完美、有耐力；画面右侧突然潦草→可能失去耐心或时间不够...",
  "",
  "【主导天赋判定】基于以上元素清单和过程痕迹，从12种天赋中选择最匹配的1种（可辅助1-2种）：",
  "  判定理由必须引用元素清单中的具体条目和过程痕迹中的具体推断",
  "",
  "=== 12种天赋快速对照（选择时必须引用画面证据）===",
  "①情感能力：人物有表情/情绪氛围/情感互动 → 证据：____",
  "②专注力：精细细节/高完整度/心流痕迹 → 证据：____",
  "③耐力持续力：大篇幅/反复修改/不放弃痕迹 → 证据：____",
  "④故事天赋：叙事场景/分镜/角色互动 → 证据：____",
  "⑤设计天赋：改造实物/装饰美化/审美主见 → 证据：____",
  "⑥幽默天赋：搞笑情节/夸张造型/有趣创意 → 证据：____",
  "⑦画动物天赋：动物生动/特征准确/动物共情 → 证据：____",
  "⑧色彩天赋：用色大胆/情绪配色/配色和谐 → 证据：____",
  "⑨数学智能：精确数量/规律图案/几何排列 → 证据：____",
  "⑩逻辑智能：因果清晰/结构合理/有条理 → 证据：____",
  "⑪空间智能：透视遮挡/远近大小/立体感 → 证据：____",
  "⑫机械智能：机械结构/内部构造/功能理解 → 证据：____",
  "",
  "🚫 严禁行为：未列举元素就直接给天赋结论 | 使用模板话术 | 证据与天赋不匹配 | 画面没有的内容硬说",
  "",
  "psychology: 【严格按画面实际内容分析，禁止模板】",
  "  你必须引用这幅画中的具体视觉元素来推断孩子的心理/情绪状态。",
  "  分三步走：",
  "  ① 引用具体证据：'画面中[具体位置]的[具体内容]呈现出[具体特征]'——必须先指出你看到了什么",
  "  ② 心理学解读：基于①的证据，结合儿童发展心理学做合理推断",
  "  ③ 给家长的话：用温暖的语言告诉家长这个发现意味着什么",
  "  模板禁区：禁止写'孩子正处于探索世界的阶段''用画画表达内心''每个孩子都是独特的'等万能话",
  "  反面示例（严禁）：'从画面可以看出孩子内心丰富，正在用绘画探索世界'——这是模板",
  "  正面示例：'画面中央的人物嘴巴画得特别大，占据了半张脸，而身体却画得很小——这种夸张处理可能说明孩子近期特别关注「说话」或「被听见」这个主题，也许是家里有了新成员后他感觉自己的声音被忽略了'",
  "",
  "development: 【严格按画面实际内容分析，禁止模板】",
  "  你必须引用这幅画中的具体表现来推断孩子的发展阶段。",
  "  分三步走：",
  "  ① 引用具体证据：'画面中[具体位置]的[具体表现]说明孩子已经掌握了[具体能力]'",
  "  ② 发展阶段判断：基于①的证据，判断孩子在绘画发展中的位置（涂鸦期/象征期/意向表现期/写实期）",
  "  ③ 发展建议：针对这个阶段给出1-2条具体建议",
  "  模板禁区：禁止写'正在发展阶段''每个孩子发展不同''要给孩子时间'等万能话",
  "  反面示例（严禁）：'孩子正处于绘画发展的重要阶段，需要家长耐心陪伴'——这是模板",
  "  正面示例：'画面中人物有完整的手指（5根），身体有脖子连接头部和躯干，衣服上有纽扣细节——这都说明孩子已经进入意向表现期，开始关注人体的真实结构和细节。相比之下，背景仍然是简单的基底线，说明他当前的注意力主要集中在人物上'",
  "",
  "familyEducation: 【严格按画面实际内容分析，禁止模板】",
  "  你必须基于这幅画中可观察的具体痕迹，给家长可操作的行动建议。",
  "  分三步走：",
  "  ① 引用具体证据：'画面中[具体位置]的[具体痕迹]说明[孩子在画画时的状态或家庭教育的投射]'",
  "  ② 联系家庭教育：基于①的证据，联系蔺老师家庭美育体系（表现=优势-干扰-内耗）做分析",
  "  ③ 可操作建议：给家长2-3条可以今晚就做的小行动（必须是能对应这幅画的具体行动）",
  "  模板禁区：禁止写'多鼓励孩子''营造自由氛围''接纳孩子的表达'等万能话",
  "  反面示例（严禁）：'建议家长多给孩子创造自由的表达环境，多鼓励少批评'——这是模板",
  "  正面示例：'画面左下角的机器人被反复修改了至少3次（可以看到明显的橡皮擦痕和叠加的线条），但右下角的花朵却一笔带过——这说明孩子对机器人有极高的内在标准。建议家长今晚可以这样做：①指着机器人的修改痕迹说'我注意到你把这里改了好几次，你真的很认真'；②不要问'花为什么画得这么简单'——孩子在同一个画面中对不同对象的投入度不同是完全正常的；③如果家里有旧的闹钟或小电器，可以陪孩子一起拆开看看里面的结构——这正好满足他对机械的好奇'",
  "",
  "",
  "=== ⭐ TALENT TYPE SELECTION — 蔺老师家庭美育·12种绘画天赋 ===",
  "",
  "【核心理论】表现=优势-干扰-内耗。天赋是孩子「自然而然、反复出现、可被高效利用」的思维/感受/行为模式。",
  "【识别方法】从四个方面观察：①画面内容画了什么 ②画画过程中的行为表现 ③画面中体现的思维特征 ④反复出现的模式和偏好。",
  "",
  "【12种天赋逐一定义与识别标准】",
  "",
  "① 💛 情感能力 —— 通过绘画表达和处理情感的能力",
  "  画面特征：人物有丰富的表情和情感状态；画面有明显的情绪氛围（快乐/悲伤/温暖/愤怒）；角色之间有情感互动",
  "  过程特征：画画时常伴随情绪表达（边画边说感受）；画完后情绪状态明显改变",
  "  课程依据：课程强调「画画是孩子情绪的疏导口」「表达即疗愈」",
  "",
  "② 🎯 专注力 —— 深度沉浸于绘画过程的能力",
  "  画面特征：画面有大量精细细节、复杂线条、完整度超出同龄人；有明显的「花了很长时间」的痕迹",
  "  过程特征：画画时可以长时间不被打扰；进入心流状态（忘记时间、废寝忘食）；外界干扰不影响创作",
  "  课程依据：课程「心流体验六个标准」——全神贯注、行动和注意力融合、自我意识消失",
  "",
  "③ ⏳ 耐力和持续力 —— 坚持完成复杂绘画任务的能力",
  "  画面特征：画面规模大、内容多、完成度高；有反复修改和完善的痕迹；不会半途而废",
  "  过程特征：遇到困难不轻易放弃；可以分多次完成一幅大型作品；对自己有完成标准和要求",
  "  课程依据：课程「过程投入」线索——孩子在画画中展现的持续投入和自我要求",
  "",
  "④ 📖 故事天赋 —— 用绘画讲述故事的能力",
  "  画面特征：画面不是静态肖像，而是「正在发生的事件」；有角色、场景、情节；常出现连环画/分镜布局/对话气泡；人物之间有互动关系",
  "  过程特征：边画边讲故事；画完后会主动解释画面中的情节和人物关系",
  "  课程依据：课程「有的孩子边画边讲，甚至手舞足蹈」；「谁、何时、何地、与谁、做什么」的叙事结构",
  "",
  "⑤ ✏️ 设计天赋 —— 改造、美化和创造性地表达的能力",
  "  画面特征：不满足于复制现实，总想改造和改进；有装饰纹样、边框、对称排版；给物体添加想象的功能和外观",
  "  过程特征：对「美」有自己的标准；喜欢把东西变得「更好看」或「更酷」",
  "  课程依据：课程「有的孩子乐于将看见的物体进行再设计」",
  "",
  "⑥ 😄 幽默天赋 —— 用画面制造趣味和笑点的能力",
  "  画面特征：画面中有搞笑情节、夸张表情、荒诞场景；人物有滑稽的动作或造型；有让人会心一笑的创意",
  "  过程特征：画画时自己会笑；喜欢画让别人看了也会笑的内容；擅长发现日常中的有趣瞬间",
  "  课程依据：课程「接纳任何内容——恶搞和小动作背后是心理表达」",
  "",
  "⑦ 🐾 画动物天赋 —— 对动物有特殊的描绘能力和情感连接",
  "  画面特征：大量画动物且画得特别生动传神；能抓住不同动物的特征和神态；动物之间有互动和故事",
  "  过程特征：对动物有天然的喜爱和共情；喜欢观察和了解动物；可能反复画同一种动物",
  "  课程依据：课程「孩子会与动物产生共鸣——猫的乖巧温柔更像女孩，狗的憨直热情更像男孩」",
  "",
  "⑧ 🎨 色彩天赋 —— 对色彩有敏锐感知和独特运用能力",
  "  画面特征：用色大胆有个人风格；色彩有情绪表达力（暖色=开心/冷色=安静）；配色和谐有美感",
  "  过程特征：选色有主见，不在乎「天是蓝的草是绿的」的常规；享受调色和色彩实验",
  "  课程依据：课程「有的孩子对色彩敏感而忽略形体」「情绪愉快时画出五彩缤纷的色彩」",
  "",
  "⑨ 🔢 数学智能天赋 —— 通过绘画展现的数学思维能力",
  "  画面特征：画面中有精确的数量关系（画了正好7朵花、10个士兵）；有规律性图案和几何排列；对比例和数量有天然敏感",
  "  过程特征：画画时会数数、计算；关注「几个」「多少次」「多少排」；喜欢对称和精确",
  "  课程依据：课程中建构型/聚焦型学习风格中表现出的结构化思维",
  "",
  "⑩ 🧠 逻辑智能天赋 —— 通过绘画展现的逻辑推理能力",
  "  画面特征：画面有清晰的因果逻辑（因为下雨所以打伞）；事物之间有合理的功能和结构关系；画面内容有条理、不混乱",
  "  过程特征：画画时喜欢解释「为什么这样」「接下来会怎样」；关注事物的原理和逻辑",
  "  课程依据：课程「男孩关注轮子有几个、炮管多长、驾驶舱在哪——用画笔理解这个东西是怎么工作的」",
  "",
  "⑪ 🌐 空间智能天赋 —— 理解和表现三维空间的能力",
  "  画面特征：画面有透视感、前后遮挡关系、远近大小变化；建筑和场景有空间深度；物体有立体感",
  "  过程特征：对空间关系敏感；能画出从不同角度看到的物体；布局有纵深感",
  "  课程依据：课程「有的孩子可以画出形状准确的物体」——空间思维是写实能力的基础",
  "",
  "⑫ ⚙️ 机械智能天赋 —— 理解和描绘机械结构的能力",
  "  画面特征：画机械/交通工具/机器人时体现结构理解（齿轮、管道、发动机、关节）；不止画外观，还画内部结构",
  "  过程特征：喜欢拆解和组装；对「怎么工作」比对「长什么样」更感兴趣；反复画同一类机械主题",
  "  课程依据：课程核心案例「爱画打仗的小男孩」——聚焦型学习风格，对军事机械的深度探索",
  "",
  "============================================================",
  "🚫 天赋识别输出硬性规则 —— 禁止概括，必须标注具体位置",
  "============================================================",
  "",
  "【规则1】talentDesc 必须使用以下格式，至少引用3个具体的画面位置：",
  "  '主导天赋：[类型]。画面证据：①[位置]的[元素]呈现出[特征]→说明[天赋表现]。②[位置]的[元素]呈现出[特征]→说明[天赋表现]。③[位置]的[元素]呈现出[特征]→说明[天赋表现]。'",
  "",
  "  反面示例（严禁，太概括）：'孩子在画中展现了情感天赋，人物有丰富的表情和情感互动。'",
  "  正面示例：'主导天赋：情感能力。画面证据：①画面中央的红色裙子小女孩嘴角上扬、眼睛弯成月牙→表情传达出喜悦和自信。②小女孩左手牵着一个比她小的蓝色衣服人物，两人手之间画了连接线→表达了照顾和保护的情感互动。③整幅画用了暖黄色和粉红色为主调，没有冷色→画面整体传递出温暖安全的情绪氛围。'",
  "",
  "【规则2】talentManifestations 每条必须指定画面位置，格式：",
  "  '[位置]：[描述你看到的]→[这个画面选择说明什么天赋表现]'",
  "",
  "  反面示例（严禁）：'孩子画得特别专注，画面细节丰富，展现了良好的专注力。'",
  "  正面示例：'右下角：机器人画了12个关节，每个关节都有螺丝钉和连接线→孩子对机械结构的关注远超同龄人，这需要高度专注才能完成。左上角：人物头发画了23根发丝，每根方向不同→这种级别的细节投入说明孩子进入了心流状态。'",
  "",
  "【规则3】禁止在 talentDesc 或 talentManifestations 中出现以下模板话术：",
  "  - '展现了良好的……''体现了……的能力''具有……的天赋'（必须说画面中哪里、怎么展现的）",
  "  - '孩子正处于……阶段''这是……的典型表现'（必须引用画面具体位置）",
  "  - '建议家长……''值得关注的是……'（talentDesc和manifestations是描述不是建议）",
  "  - 任何没有标注画面位置的概括性描述",
  "",
  "【规则4】主导天赋选择必须引用证据链条：",
  "  选择[天赋X]是因为：①画面中[位置/内容/特征]→②从过程痕迹看[证据]→③从反复出现的模式看[证据]→三者共同指向[天赋X]",
  "",
  "【规则5】如果识别出辅助天赋（最多2种），也必须各附1条画面位置证据",
  "",
  "talentDesc: 按规则1格式输出。禁止概括，必须标注画面位置。",
  "",
  "talentManifestations: 按规则2格式输出3-5条。每条必须以画面位置开头。禁止概括。",
  "",
  "projectionObservations: 【严格按画面具体选择分析，禁止模板】",
  "  蔺老师课程中的投射理论：绘画像一面镜子，投射孩子的经验、关注、情绪和需求。",
  "  你必须从以下投射类型中选择2-4种，每种必须引用画面的具体选择：",
  "  - 注意力投射：孩子近期关注什么，画里就反复出现什么 → 引用画面中占比最大/细节最多的元素",
  "  - 成长投射：身体变化、新学会的技能投射在画面中 → 引用画面中异常的尺寸/数量/特征",
  "  - 象征投射：用颜色、图形、符号表达情绪 → 引用画面中具体的颜色选择或图形元素",
  "  - 共鸣投射：画中的动物/角色承载了孩子的自我认同 → 引用孩子重点描绘的角色特征",
  "  - 需求投射：渴望保护/力量/愿望投射在画中 → 引用画面中的超级英雄/特殊角色/幻想元素",
  "  - 位置投射：人物在画面中的大小/位置/姿态投射了孩子的自我感知 → 引用具体的位置和姿态",
  "  格式：{ label: '[投射类型]', text: '画面中[具体位置]的[具体内容]选择了[具体方式]——这可能投射了[推断]。' }",
  "  模板禁区：禁止写'孩子用画画表达内心世界''画面是孩子心灵的窗口'等万能话",
  "  正面示例：{ label: '注意力投射', text: '画面中坦克占据了80%的空间，履带画了32个齿轮且每个齿轮的齿数都不同——这远超同龄人对军事机械的关注度，近期的注意力几乎全部集中在军事主题上。' }",
  "",
  "Color guidance should help preserve the original line drawing while making the finished effect more complete, similar to a guided colored result.",
  "",
  "============================================================",
  "🔍 最终自检：在输出 JSON 之前，逐条检查以下问题",
  "============================================================",
  "1. ☐ 我有没有在黑白/线稿画中提到'色彩''配色''颜色情绪'？如有→删除",
  "2. ☐ 我有没有描述画面中不存在的人物/动物/物体？如有→删除",
  "3. ☐ 我有没有使用模板话术（'展现了良好的''体现了''具有'等）？如有→改写为具体画面证据",
  "4. ☐ 天赋识别的每一条证据都标注了画面具体位置吗？如没有→补上",
  "5. ☐ psychology/development/familyEducation 中所有的描述都能在画面中找到对应位置吗？如不能→删除该描述",
  "6. ☐ 如果画面是黑白的，我的 teacherCopy 和所有分析中绝对不能出现任何关于颜色的描述——重新检查一遍",
].join("\n");

const guidanceVariantDirections = [
  "Alternative A: First identify what content is missing or underdeveloped in the child's drawing. Then use the child's own hand-drawing style to sketch in the missing parts — same rough line quality, same childlike proportions, same level of detail. Only after the content is complete, apply coloring.",
  "Alternative B: First identify gaps in the scene. Add hand-drawn elements that a child of this age would naturally draw to complete the story — simple shapes, wobbly lines, childlike details. Then apply color over everything.",
  "Alternative C: First complete the content: what objects, characters, or background is this scene missing? Draw them in using the child's own drawing style. Then layer on coloring and shading.",
  "Alternative D: First look at what the child left unfinished. Complete those areas with matching hand-drawn style — not polished, not perfect, but authentically childlike. Add color last.",
  "Alternative E: First fix content gaps with child-style sketches. Then unify everything with harmonious coloring. The final image should look like one child drew the whole thing.",
];

function buildGuidanceImagePrompt(variant = 1, talentType = null) {
  const safeVariant = Number.isFinite(Number(variant)) && Number(variant) > 0
    ? Math.floor(Number(variant))
    : 1;
  const direction =
    guidanceVariantDirections[(safeVariant - 1) % guidanceVariantDirections.length];

  return [
  "Edit the uploaded child artwork as a preservation-first teacher guidance image.",
  `This is alternative方案 ${safeVariant}. Create a fresh option that is visibly different from earlier attempts while still preserving the original drawing.`,
  direction,
  "",
  "=== TWO-STEP PROCESS ===",
  "STEP 1 — Content Completion: First analyze what is MISSING from the child's drawing. Is the background empty? Is the scene incomplete? Are there blank areas that need story elements? Add the missing content using the EXACT SAME hand-drawn style as the child — same wobbly line quality, same simple shapes, same childlike proportions. The added elements must look like the child drew them, not like an adult illustrator filled them in. Use pencil-like or crayon-like strokes that match the original drawing's texture.",
  "STEP 2 — Coloring: Only after the content gaps are filled, apply coloring. Use child-friendly colors. Preserve the original lines underneath. Color should enhance, not cover.",
  "",
  "Do not remake the drawing. Do not replace the child style with a polished adult illustration.",
  "Keep the original subjects, childlike linework, rough hand-drawn strokes, shapes, proportions, positions, scale relationships, number of characters or objects, and main composition as the fixed base.",
  "Preserve 100 percent of the uploaded drawing's visible original content. Do not erase, crop, move, resize, redraw, replace, simplify, beautify, or cover any existing animals, people, objects, faces, gestures, outlines, brush marks, colors, or child-made details.",
  "Treat the uploaded artwork as a fixed base layer. Add missing content in matching hand-drawn child style first, then apply coloring last.",
  "",
  "🚫 STRICTLY FORBIDDEN — 严禁以下简笔画元素：",
  "- 太阳：禁止画标准圆形+周围射线的简笔太阳",
  "- 云朵：禁止画棉花糖形状的卡通云",
  "- 树：禁止画长方形树干+圆形树冠的棒棒糖树",
  "- 花：禁止画五瓣雏菊或标准简笔花",
  "- 草：禁止画一排锯齿状的简笔草",
  "- 鸟：禁止画V字形海鸥简笔鸟",
  "如果必须添加自然元素，必须画得像孩子观察后手绘的——树要有不规则枝干，云要有变化形状，太阳要歪歪扭扭像孩子刚学会画的样子。没有任何简笔画痕迹。",
  "",
  "The result should look like the child's own artwork after a teacher helped them add what was missing and then color it — all in the same child-drawing style.",
  "No text, no watermark, no annotation arrows, no guide lines, no tutorial layout, no split panels.",
  ].join("\n");
}

const adaptiveStyleGuides = [
  {
    colorDirection: "Use soft warm and cool colors with gentle watercolor-like transitions. Apply color only after content gaps are filled.",
    compositionDirection: "First fill blank areas with hand-drawn child-style elements that complete the scene, then add quiet environmental depth.",
    reason: "This direction fits drawings that need a warm story atmosphere without changing the childlike linework.",
    sceneDirection: "First analyze what content is missing. Then add background and story elements using the child's own hand-drawing style — same wobbly line quality, same simple shapes. If the child drew war/battle → add battlefield elements drawn like a child would. If flowers → add garden elements in child style. If robots → add tech elements in child style. Never add generic unrelated scenery.",
    styleCategory: "warm hand-drawn animated film atmosphere",
    styleName: "\u6e29\u6696\u624b\u7ed8\u52a8\u753b\u7535\u5f71\u611f",
  },
  {
    colorDirection: "Use soft 3D lighting, rounded color blocks, and playful bright accents. Apply after content is complete.",
    compositionDirection: "First add missing content in child hand-drawing style, then add depth through soft shadows behind the existing subjects.",
    reason: "This direction works well when the drawing has clear characters, animals, vehicles, or objects.",
    sceneDirection: "First analyze what content is missing. Then add background and story elements using the child's own hand-drawing style. If the child drew war/battle → add battlefield elements drawn like a child would. If flowers → add garden elements in child style. If robots → add tech elements in child style. Never add generic unrelated scenery.",
    styleCategory: "3D clay and toy-like illustration",
    styleName: "3D \u8f6f\u9676\u73a9\u5177\u611f",
  },
  {
    colorDirection: "Use transparent watercolor washes, soft paper texture, and airy color harmony. Color is the final step after content completion.",
    compositionDirection: "First complete missing content with child-style sketches, then use large gentle background shapes to connect layers.",
    reason: "This direction fits imaginative, quiet, nature, animal, or plant drawings.",
    sceneDirection: "First analyze what content is missing. Then add background and story elements using the child's own hand-drawing style. If the child drew war/battle → add battlefield elements drawn like a child would. If flowers → add garden elements in child style. If robots → add tech elements in child style. Never add generic unrelated scenery.",
    styleCategory: "picture-book watercolor",
    styleName: "\u7ed8\u672c\u6c34\u5f69\u98ce",
  },
  {
    colorDirection: "Use colored-pencil grain, layered child-friendly colors, and repeated small highlights. Color goes on last.",
    compositionDirection: "First fill in missing content with child-style hand drawing, then add rhythmic repeated details near the original subjects.",
    reason: "This direction keeps the child's drawing feeling closest to hand coloring.",
    sceneDirection: "First analyze what content is missing. Then add background and story elements using the child's own hand-drawing style. If the child drew war/battle → add battlefield elements drawn like a child would. If flowers → add garden elements in child style. If robots → add tech elements in child style. Never add generic unrelated scenery.",
    styleCategory: "colored-pencil fairy-tale drawing",
    styleName: "\u5f69\u94c5\u7ae5\u8bdd\u98ce",
  },
  {
    colorDirection: "Use paper-cut color blocks, craft texture, and simple high-contrast decorative accents. Apply only after content is complete.",
    compositionDirection: "First add missing content in child hand-drawing style, then use layered paper-like background pieces to organize space.",
    reason: "This direction fits bold, simple, graphic drawings and makes blank space feel intentional.",
    sceneDirection: "First analyze what content is missing. Then add background and story elements using the child's own hand-drawing style. If the child drew war/battle → add battlefield elements drawn like a child would. If flowers → add garden elements in child style. If robots → add tech elements in child style. Never add generic unrelated scenery.",
    styleCategory: "paper collage and handmade craft",
    styleName: "\u7eb8\u827a\u62fc\u8d34\u98ce",
  },
  {
    colorDirection: "Use clear light, cool shadows, and small glowing accent colors. Color is the final layer.",
    compositionDirection: "First complete missing content with child-style drawing, then add a gentle dreamlike environment through background elements.",
    reason: "This direction fits robots, cities, vehicles, fantasy subjects, or energetic abstract drawings.",
    sceneDirection: "First analyze what content is missing. Then add background and story elements using the child's own hand-drawing style. If the child drew war/battle → add battlefield elements drawn like a child would. If flowers → add garden elements in child style. If robots → add tech elements in child style. Never add generic unrelated scenery.",
    styleCategory: "sci-fi dream atmosphere",
    styleName: "\u79d1\u5e7b\u68a6\u5883\u98ce",
  },
  {
    colorDirection: "Use light ink-and-color washes, restrained accents, and breathing space. Color is applied after content gaps are filled.",
    compositionDirection: "First add missing content in child-style hand drawing, then use soft background rhythm and empty space to make the drawing feel complete.",
    reason: "This direction fits plants, animals, scenery, and quieter observational drawings.",
    sceneDirection: "First analyze what content is missing. Then add background and story elements using the child's own hand-drawing style. If the child drew war/battle → add battlefield elements drawn like a child would. If flowers → add garden elements in child style. If robots → add tech elements in child style. Never add generic unrelated scenery.",
    styleCategory: "light Chinese ink-and-color",
    styleName: "\u56fd\u98ce\u6de1\u5f69\u98ce",
  },
];

const adaptiveStyleGuidePrompt = [
  "You are a children's art teacher and visual art director.",
  "Look at the uploaded child artwork and choose a suitable guidance style for this exact drawing.",
  "Return JSON only. All visible text values must be in Simplified Chinese except styleCategory may be English.",
  "Do not choose a style by a famous living artist name. If a warm Japanese hand-drawn animation feeling would fit, describe it generically as warm hand-drawn animated film atmosphere, natural fairy-tale mood, soft watercolor light, and cozy background.",
  "Style choices may include: warm hand-drawn animated film atmosphere, 3D clay/toy-like illustration, picture-book watercolor, colored-pencil fairy-tale drawing, paper collage craft, light Chinese ink-and-color, sci-fi dream atmosphere, or another child-appropriate style that fits the uploaded drawing.",
  "The recommendation must be based on visible subject matter, line quality, existing color, blank space, mood, and childlike expression.",
  "Your sceneDirection must explain how to first FILL CONTENT GAPS using the child's own hand-drawing style, then apply coloring. Do not just add color — first add what's missing in matching child style.",
  "Avoid adult commercial illustration, photorealism, celebrity/IP imitation, and anything that would cover or replace the child's original drawing.",
].join("\n");

function fallbackAdaptiveStyleGuide(variant = 1) {
  const safeVariant = Number.isFinite(Number(variant)) && Number(variant) > 0
    ? Math.floor(Number(variant))
    : 1;
  return adaptiveStyleGuides[(safeVariant - 1) % adaptiveStyleGuides.length];
}

function normalizeStyleGuide(value, variant = 1) {
  const fallback = fallbackAdaptiveStyleGuide(variant);
  const source = value && typeof value === "object" ? value : {};
  return {
    colorDirection:
      typeof source.colorDirection === "string" && source.colorDirection.trim()
        ? source.colorDirection.trim()
        : fallback.colorDirection,
    compositionDirection:
      typeof source.compositionDirection === "string" && source.compositionDirection.trim()
        ? source.compositionDirection.trim()
        : fallback.compositionDirection,
    reason:
      typeof source.reason === "string" && source.reason.trim()
        ? source.reason.trim()
        : fallback.reason,
    sceneDirection:
      typeof source.sceneDirection === "string" && source.sceneDirection.trim()
        ? source.sceneDirection.trim()
        : fallback.sceneDirection,
    styleCategory:
      typeof source.styleCategory === "string" && source.styleCategory.trim()
        ? source.styleCategory.trim()
        : fallback.styleCategory,
    styleName:
      typeof source.styleName === "string" && source.styleName.trim()
        ? source.styleName.trim()
        : fallback.styleName,
  };
}

function buildAdaptiveGuidanceImagePrompt(styleGuide, variant = 1, talentType = null, note = "") {
  const safeVariant = Number.isFinite(Number(variant)) && Number(variant) > 0
    ? Math.floor(Number(variant))
    : 1;
  const style = normalizeStyleGuide(styleGuide, safeVariant);

  const talentGuidance = talentType ? [
    "",
    `TALENT-BASED OPTIMIZATION: The child shows "${talentType}" talent. Nurture this specific talent:`,
    talentType.includes("情感") ? "- Preserve the emotional expressions and atmosphere. Add gentle environmental cues that support the feelings. The emotional truth is the priority." : "",
    talentType.includes("专注") ? "- Respect the detailed work already done. Only add content that matches the same level of care. Do not overwhelm with large additions." : "",
    talentType.includes("耐力") || talentType.includes("持续") ? "- This child commits deeply. Add content that rewards their persistence — rich details, meaningful additions that justify the effort." : "",
    talentType.includes("故事") ? "- Complete the story context with scene elements that enrich the narrative. Add characters, settings, and action that extend the plot." : "",
    talentType.includes("设计") ? "- Add complementary design elements that echo the child's creative modifications. Enhance the aesthetic without overriding their style." : "",
    talentType.includes("幽默") ? "- Preserve the playful, funny elements. Add subtle humorous details that match the child's sense of fun. Don't make it serious." : "",
    talentType.includes("动物") ? "- Add natural habitat context and companion animals that reward the child's affinity for animals. Keep animal anatomy and character true to their style." : "",
    talentType.includes("色彩") ? "- Enhance color harmony while keeping the child's original color choices visible. Use color to amplify the emotional expression." : "",
    talentType.includes("数学") ? "- Preserve the precise patterns and numerical relationships. Add elements that follow the same mathematical logic." : "",
    talentType.includes("逻辑") ? "- Respect the logical structure. Add content that follows the same cause-effect and functional relationships." : "",
    talentType.includes("空间") ? "- Add depth cues and spatial context that extend the child's 3D thinking. Enhance perspective without overriding their spatial choices." : "",
    talentType.includes("机械") ? "- Add structural and mechanical details that feed the engineering curiosity. Show how things connect and work." : "",
  ].filter(Boolean).join("\n") : "";

  return [
    "CRITICAL: You MUST add relevant background elements that match the subject of the drawing. Do NOT leave the background empty or white.",
    "",
    "ABSOLUTE RULES:",
    "1. PRESERVE 100% of the original drawing - every line, shape, color stays exactly as-is.",
    "1b. CRITICAL - MATCH THE SETTING: Look at the original drawing carefully. If the scene is OUTDOORS (sky visible, ground/grass, trees, outside activities) → add ONLY outdoor background elements. If the scene is INDOORS (floor, walls, furniture, room setting) → add ONLY indoor background elements. NEVER change an outdoor scene to indoor or vice versa. If uncertain, keep the background minimal and match the existing setting cues.",
    "2. ADD BACKGROUND that directly relates to the subject AND matches the indoor/outdoor setting:",
    "   - Robot/mecha → add gears, wires, control panels, mechanical parts, tech background",
    "   - Flowers/plants → add garden, grass, butterflies, watering can, flower pots, nature",
    "   - Dinosaurs → add volcano, prehistoric forest, other dinosaurs, fossils, jungle",
    "   - People/characters OUTDOORS → add park, playground, street, sky, trees, buildings (NOT indoor furniture/walls)",
    "   - People/characters INDOORS → add room, floor, windows, furniture, toys, bookshelves (NOT sky/trees/grass)",
    "   - Cars/vehicles → add road, traffic signs, garage, gas station, city backdrop",
    "   - Ocean animals → add water, coral, bubbles, seaweed, other sea creatures",
    "   - Animals OUTDOORS → add their natural outdoor habitat, trees, grass, sky",
    "   - Animals INDOORS (pets) → add room, pet bed, food bowl, toys, indoor setting",
    "   - Buildings → add surrounding city, windows, doors, skyline, streets",
    "3. NEVER add generic scenery (blue sky, white clouds, sun, random grass, distant mountains) unless already in the original drawing.",
    "4. Match the child's hand-drawing style exactly - wobbly lines, uneven coloring, childlike proportions.",
    "5. Fill empty spaces with subject-related details. If the drawing has lots of blank space, that's where you add context.",
    "",
    `Style: ${style.styleCategory} - ${style.colorDirection}`,
    `Composition: ${style.compositionDirection}`,
    talentGuidance,
    note ? `ADDITIONAL INSTRUCTION: ${note}` : "",
    "",
    "The output must look like a complete scene where the background was drawn by the same child to complement their original subject. NO empty white backgrounds.",
  ].filter(Boolean).join("\n");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("request_too_large"));
        request.destroy();
        return;
      }
      body += chunk;
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function extractOutputText(result) {
  if (typeof result.output_text === "string") {
    return result.output_text;
  }

  const parts = [];
  for (const output of result.output || []) {
    for (const item of output.content || []) {
      if (typeof item.text === "string") parts.push(item.text);
      if (typeof item.refusal === "string") throw new Error("model_refusal");
    }
  }

  return parts.join("\n").trim();
}

function extractChatOutputText(result) {
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((item) => item.text || item.content || "")
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  return "";
}

function parseJsonObject(text) {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("ai_json_parse_failed");
  }
}

function normalizePrinciples(principles) {
  const colors = {
    [labels.contrast]: "red",
    [labels.align]: "orange",
    [labels.repeat]: "purple",
    [labels.proximity]: "#E07B39",
  };

  return [
    labels.contrast,
    labels.align,
    labels.repeat,
    labels.proximity,
  ].map((label) => {
    const match = Array.isArray(principles)
      ? principles.find((item) => item?.label === label)
      : null;
    return {
      color: colors[label],
      label,
      text:
        typeof match?.text === "string" && match.text.trim()
          ? match.text.trim()
          : "\u4fdd\u7559\u5b69\u5b50\u7684\u60f3\u6cd5\uff0c\u518d\u52a0\u4e00\u4e2a\u6e05\u695a\u7684\u5c0f\u8c03\u6574\u3002",
    };
  });
}

function normalizeAnalysis(value) {
  if (!value || typeof value !== "object") {
    throw new Error("invalid_analysis");
  }

  const pa = value.psychologyAnalysis && typeof value.psychologyAnalysis === "object" ? value.psychologyAnalysis : {};
  const fe = value.familyEducation && typeof value.familyEducation === "object" ? value.familyEducation : {};
  const pr = value.projectionAnalysis && typeof value.projectionAnalysis === "object" ? value.projectionAnalysis : {};
  const ti = value.talentInsight && typeof value.talentInsight === "object" ? value.talentInsight : {};

  return {
    teacherCopy: typeof value.teacherCopy === "string" && value.teacherCopy.trim()
      ? value.teacherCopy.trim()
      : "这张作品已经有了很好的观察，每个孩子都有自己独特的表达方式。",
    psychologyAnalysis: {
      emotionState: typeof pa.emotionState === "string" ? pa.emotionState.trim() : "",
      securityLevel: typeof pa.securityLevel === "string" ? pa.securityLevel.trim() : "",
      selfCognition: typeof pa.selfCognition === "string" ? pa.selfCognition.trim() : "",
      keyEvidence: Array.isArray(pa.keyEvidence) ? pa.keyEvidence.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [],
    },
    familyEducation: {
      parentInterference: typeof fe.parentInterference === "string" ? fe.parentInterference.trim() : "",
      strengthPotential: typeof fe.strengthPotential === "string" ? fe.strengthPotential.trim() : "",
      actionSuggestions: Array.isArray(fe.actionSuggestions) ? fe.actionSuggestions.filter(e => typeof e === "string" && e.trim()).slice(0, 5) : [],
    },
    projectionAnalysis: {
      attentionProjection: typeof pr.attentionProjection === "string" ? pr.attentionProjection.trim() : "",
      relationshipProjection: typeof pr.relationshipProjection === "string" ? pr.relationshipProjection.trim() : "",
      needProjection: typeof pr.needProjection === "string" ? pr.needProjection.trim() : "",
    },
    talentInsight: {
      primaryTalent: typeof ti.primaryTalent === "string" ? ti.primaryTalent.trim() : "",
      evidenceList: Array.isArray(ti.evidenceList) ? ti.evidenceList.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [],
    },
    parentWording: {
      shouldSay: Array.isArray(value.parentWording?.shouldSay) ? value.parentWording.shouldSay.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [],
      shouldNotSay: Array.isArray(value.parentWording?.shouldNotSay) ? value.parentWording.shouldNotSay.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [],
    },
  };
}

async function requestJsonWithFetch(url, payload, apiKey) {
  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    const error = new Error(result.error?.message || "openai_request_failed");
    error.statusCode = upstream.status;
    error.isOpenAIHttpError = true;
    throw error;
  }

  return result;
}

function requestJsonWithPowerShell(url, payload, apiKey) {
  return new Promise((resolve, reject) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "art-guide-"));
    const requestFile = path.join(tempDir, "request.json");
    fs.writeFileSync(requestFile, JSON.stringify(payload), "utf8");

    const script = [
      "$ErrorActionPreference = 'Stop'",
      "[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)",
      "$OutputEncoding = [Console]::OutputEncoding",
      "$body = Get-Content -LiteralPath $env:OPENAI_REQUEST_FILE -Raw -Encoding UTF8",
      "$headers = @{ Authorization = \"Bearer $env:OPENAI_API_KEY\" }",
      "$response = Invoke-RestMethod -Uri $env:OPENAI_REQUEST_URL -Method Post -Headers $headers -ContentType 'application/json' -Body $body -TimeoutSec 120",
      "$response | ConvertTo-Json -Depth 100 -Compress",
    ].join("; ");

    const child = spawn("powershell.exe", ["-NoProfile", "-Command", script], {
      env: {
        ...process.env,
        OPENAI_API_KEY: apiKey,
        OPENAI_REQUEST_FILE: requestFile,
        OPENAI_REQUEST_URL: url,
      },
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("openai_request_timeout"));
    }, 130000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      fs.rmSync(tempDir, { force: true, recursive: true });
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      fs.rmSync(tempDir, { force: true, recursive: true });

      if (code !== 0) {
        reject(new Error(stderr.trim() || "openai_powershell_request_failed"));
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error("openai_response_parse_failed"));
      }
    });
  });
}

async function requestProviderJson(url, payload, apiKey) {
  try {
    return await requestJsonWithFetch(url, payload, apiKey);
  } catch (error) {
    if (error.isOpenAIHttpError) throw error;
    return requestJsonWithPowerShell(url, payload, apiKey);
  }
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) {
    throw new Error("invalid_image");
  }

  const mimeType = match[1] || "image/png";
  const extension = mimeType.includes("jpeg")
    ? "jpg"
    : mimeType.includes("webp")
      ? "webp"
      : "png";

  return {
    buffer: Buffer.from(match[2], "base64"),
    extension,
    mimeType,
  };
}

function getImageErrorMessage(result) {
  if (typeof result?.error === "string") return result.error;
  if (typeof result?.error?.message === "string") return result.error.message;
  if (typeof result?.message === "string") return result.message;
  return "image_generation_failed";
}

function extractGeneratedImage(result) {
  const first = Array.isArray(result?.data) ? result.data[0] : null;
  if (typeof first?.b64_json === "string" && first.b64_json) {
    return `data:image/png;base64,${first.b64_json}`;
  }
  if (typeof first?.url === "string" && first.url) {
    return first.url;
  }

  const content = result?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    const imagePart = content.find((item) => item?.image_url?.url || item?.type === "image_url");
    const url = imagePart?.image_url?.url || imagePart?.url;
    if (typeof url === "string" && url) return url;
  }

  const outputs = Array.isArray(result?.output) ? result.output : [];
  for (const output of outputs) {
    const parts = Array.isArray(output?.content) ? output.content : [];
    for (const part of parts) {
      if (typeof part?.image_url === "string" && part.image_url) return part.image_url;
      if (typeof part?.image_url?.url === "string" && part.image_url.url) return part.image_url.url;
      if (typeof part?.b64_json === "string" && part.b64_json) {
        return `data:image/png;base64,${part.b64_json}`;
      }
    }
  }

  return "";
}

function sanitizeMultipartFilename(fileName, fallbackExtension = "png") {
  const fallback = `artwork.${fallbackExtension || "png"}`;
  if (typeof fileName !== "string" || !fileName.trim()) return fallback;
  const cleaned = fileName
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/[^\x20-\x7E]/g, "_")
    .slice(0, 120);
  return cleaned.includes(".") ? cleaned : `${cleaned || "artwork"}.${fallbackExtension || "png"}`;
}

function buildMultipartBody({ fields, file }) {
  const boundary = `----art-guide-${Date.now().toString(16)}-${Math.random()
    .toString(16)
    .slice(2)}`;
  const chunks = [];

  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") continue;
    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${String(value)}\r\n`,
      "utf8",
    ));
  }

  chunks.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldName}"; filename="${file.fileName}"\r\nContent-Type: ${file.mimeType}\r\n\r\n`,
    "utf8",
  ));
  chunks.push(file.buffer);
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`, "utf8"));

  return {
    body: Buffer.concat(chunks),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

function requestImageEditWithPowerShell({ apiKey, fields, file }) {
  return new Promise((resolve, reject) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "art-guide-image-"));
    const imageFile = path.join(tempDir, file.fileName || "artwork.png");
    const fieldsFile = path.join(tempDir, "fields.json");
    fs.writeFileSync(imageFile, file.buffer);
    fs.writeFileSync(fieldsFile, JSON.stringify(fields), "utf8");

    const script = [
      "$ErrorActionPreference = 'Stop'",
      "Add-Type -AssemblyName System.Net.Http",
      "[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)",
      "$OutputEncoding = [Console]::OutputEncoding",
      "$fields = Get-Content -LiteralPath $env:OPENAI_FIELDS_FILE -Raw -Encoding UTF8 | ConvertFrom-Json",
      "$client = [System.Net.Http.HttpClient]::new()",
      "$client.Timeout = [TimeSpan]::FromSeconds(180)",
      "$client.DefaultRequestHeaders.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $env:OPENAI_API_KEY)",
      "$content = [System.Net.Http.MultipartFormDataContent]::new()",
      "foreach ($prop in $fields.PSObject.Properties) { if ($null -ne $prop.Value -and [string]$prop.Value -ne '') { $content.Add([System.Net.Http.StringContent]::new([string]$prop.Value, [System.Text.Encoding]::UTF8), $prop.Name) } }",
      "$bytes = [System.IO.File]::ReadAllBytes($env:OPENAI_IMAGE_FILE)",
      "$fileContent = [System.Net.Http.ByteArrayContent]::new($bytes)",
      "$fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse($env:OPENAI_IMAGE_MIME)",
      "$content.Add($fileContent, 'image', $env:OPENAI_IMAGE_NAME)",
      "$response = $client.PostAsync($env:OPENAI_REQUEST_URL, $content).GetAwaiter().GetResult()",
      "$body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()",
      "[pscustomobject]@{ ok = $response.IsSuccessStatusCode; statusCode = [int]$response.StatusCode; body = $body } | ConvertTo-Json -Depth 8 -Compress",
      "$client.Dispose()",
      "$content.Dispose()",
    ].join("; ");

    const child = spawn("powershell.exe", ["-NoProfile", "-Command", script], {
      env: {
        ...process.env,
        OPENAI_API_KEY: apiKey,
        OPENAI_FIELDS_FILE: fieldsFile,
        OPENAI_IMAGE_FILE: imageFile,
        OPENAI_IMAGE_MIME: file.mimeType,
        OPENAI_IMAGE_NAME: file.fileName,
        OPENAI_REQUEST_URL: `${AI_BASE_URL}/images/edits`,
      },
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("image_powershell_request_timeout"));
    }, 190000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      fs.rmSync(tempDir, { force: true, recursive: true });
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      fs.rmSync(tempDir, { force: true, recursive: true });

      if (code !== 0) {
        reject(new Error(stderr.trim() || "image_powershell_request_failed"));
        return;
      }

      try {
        const wrapper = JSON.parse(stdout);
        const parsedBody = wrapper.body ? JSON.parse(wrapper.body) : {};
        resolve({
          ok: Boolean(wrapper.ok),
          result: parsedBody,
          status: Number(wrapper.statusCode) || 500,
        });
      } catch {
        reject(new Error("image_powershell_response_parse_failed"));
      }
    });
  });
}

function getImageDimensions(buffer) {
  try {
    // PNG: width at offset 16, height at offset 20 (4 bytes each, big-endian)
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
    // JPEG: scan for SOF marker
    for (let i = 0; i < buffer.length - 1; i++) {
      if (buffer[i] === 0xff && (buffer[i + 1] === 0xc0 || buffer[i + 1] === 0xc2)) {
        return { width: buffer.readUInt16BE(i + 7), height: buffer.readUInt16BE(i + 5) };
      }
    }
    // WebP: RIFF container
    if (
      buffer.length >= 30 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // "RIFF"
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50   // "WEBP"
    ) {
      // VP8X (extended format): width+1 at offset 24, height+1 at offset 27 (3 bytes each, little-endian)
      if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38 && buffer[15] === 0x58) {
        const width = (buffer.readUIntLE(24, 3) & 0xffffff) + 1;
        const height = (buffer.readUIntLE(27, 3) & 0xffffff) + 1;
        return { width, height };
      }
      // VP8L (lossless): 14-bit width at bit offset 5, 14-bit height at bit offset 19
      if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38 && buffer[15] === 0x4c) {
        const bits = buffer.readUInt32LE(21);
        const width = (bits & 0x3fff) + 1;
        const height = ((bits >> 14) & 0x3fff) + 1;
        return { width, height };
      }
      // VP8 (lossy): width at offset 26, height at offset 28 (2 bytes each, little-endian)
      if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38 && buffer[15] === 0x20) {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height };
      }
    }
    return null;
  } catch {
    return null;
  }
}

function parseSizeOption(sizeStr) {
  const match = /^(\d+)x(\d+)$/.exec(sizeStr);
  if (!match) return null;
  const w = Number(match[1]);
  const h = Number(match[2]);
  if (!w || !h) return null;
  return { str: sizeStr, width: w, height: h, ratio: w / h };
}

function computeExactSize(originalWidth, originalHeight) {
  // 精确保持原图宽高比，以较长边为基准缩放到目标范围
  const maxTarget = 1536;  // 较长边的目标最大值
  const minTarget = 1024;  // 较长边的目标最小值
  const originalRatio = originalWidth / originalHeight;

  let targetWidth, targetHeight;

  if (originalWidth >= originalHeight) {
    // 横图：以宽度为基准
    targetWidth = Math.min(originalWidth, maxTarget);
    targetWidth = Math.max(targetWidth, minTarget);
    targetHeight = Math.round(targetWidth / originalRatio);
  } else {
    // 竖图：以高度为基准
    targetHeight = Math.min(originalHeight, maxTarget);
    targetHeight = Math.max(targetHeight, minTarget);
    targetWidth = Math.round(targetHeight * originalRatio);
  }

  // 确保宽高都是 8 的倍数（部分 API 要求）
  targetWidth = Math.max(64, Math.round(targetWidth / 8) * 8);
  targetHeight = Math.max(64, Math.round(targetHeight / 8) * 8);

  // 微调：如果因为取整导致比例偏移，重新计算较短边
  const adjustedRatio = targetWidth / targetHeight;
  if (Math.abs(adjustedRatio - originalRatio) > 0.02) {
    if (originalWidth >= originalHeight) {
      targetHeight = Math.round(targetWidth / originalRatio / 8) * 8;
    } else {
      targetWidth = Math.round(targetHeight * originalRatio / 8) * 8;
    }
  }

  return `${targetWidth}x${targetHeight}`;
}

function matchImageSize({ width, height }, availableSizes) {
  const candidates = Array.isArray(availableSizes)
    ? availableSizes.map(parseSizeOption).filter(Boolean)
    : [];

  // "auto" size option lets the API pick the best fit — try it first
  if (candidates.length === 0 || candidates.every(c => c.str === "auto")) {
    candidates.unshift(
      { str: "1024x1024", width: 1024, height: 1024, ratio: 1 },
      { str: "1536x1024", width: 1536, height: 1024, ratio: 1.5 },
      { str: "1024x1536", width: 1024, height: 1536, ratio: 0.667 },
    );
  }

  const originalRatio = width / height;
  let best = candidates[0];
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const ratioDiff = Math.abs(candidate.ratio - originalRatio);
    const pixels = candidate.width * candidate.height;
    const score = ratioDiff * 10 - Math.log2(pixels + 1) * 0.01;
    if (ratioDiff < bestScore || (ratioDiff === bestScore && pixels > best.width * best.height)) {
      bestScore = ratioDiff;
      best = candidate;
    }
  }

  return best.str;
}

async function requestImageEdit({ apiKey, fileName, image, model, size, styleGuide, variant, talentType, note }) {
  const { buffer, extension, mimeType } = parseDataUrl(image);

  // 读取原图尺寸
  const originalSize = getImageDimensions(buffer);
  const matchedSize = originalSize ? matchImageSize(originalSize, IMAGE_SIZES) : size;

  // 生成尺寸保持指令
  const sizeConstraint = originalSize
    ? `\n\n=== CRITICAL SIZE CONSTRAINT ===\nThe original artwork dimensions are ${originalSize.width}x${originalSize.height} (aspect ratio ${(originalSize.width / originalSize.height).toFixed(3)}:1). The output optimized image MUST preserve exactly this aspect ratio. Output size should be ${matchedSize}. Do NOT crop, stretch, squash, or change the proportions. The optimized image must fit the same frame as the original.\n`
    : "";

  const fields = {
    model,
    n: "1",
    prompt: buildAdaptiveGuidanceImagePrompt(styleGuide, variant, talentType, note) + sizeConstraint,
    size: matchedSize || "1024x1024",
  };

  const file = {
    fieldName: "image",
    fileName: sanitizeMultipartFilename(fileName, extension),
    mimeType,
    buffer,
  };

  let response;
  try {
    const multipart = buildMultipartBody({ fields, file });
    const upstream = await fetch(`${AI_BASE_URL}/images/edits`, {
      body: multipart.body,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": multipart.contentType,
      },
      method: "POST",
    });
    response = {
      ok: upstream.ok,
      result: await upstream.json().catch(() => ({})),
      status: upstream.status,
    };
  } catch (error) {
    writeServerLog("image_fetch_transport_failed", {
      cause: error.cause?.message || "",
      code: error.cause?.code || "",
      message: error.message || "fetch_failed",
      model,
      size,
    });
    response = await requestImageEditWithPowerShell({ apiKey, fields, file });
  }

  if (!response.ok) {
    const error = new Error(getImageErrorMessage(response.result));
    error.statusCode = response.status;
    error.model = model;
    error.size = size;
    throw error;
  }

  const generatedImage = extractGeneratedImage(response.result);
  if (!generatedImage) {
    const error = new Error("image_generation_empty");
    error.model = model;
    error.size = size;
    throw error;
  }

  return {
    image: generatedImage,
    model,
    size: matchedSize || size,
    originalWidth: originalSize?.width || null,
    originalHeight: originalSize?.height || null,
    styleGuide,
  };
}

async function generateGuidanceImage(image, fileName, variant, stylePreset = null, talentType = null, note = "") {
  const apiKey = API_KEY;
  if (!apiKey) {
    const error = new Error("missing_api_key");
    error.statusCode = 503;
    throw error;
  }

  let lastError = null;
  const attempts = [];
  const sizes = IMAGE_SIZES.length ? IMAGE_SIZES : [""];
  const styleGuide = stylePreset && typeof stylePreset === "object"
    ? normalizeStyleGuide(stylePreset, variant)
    : await analyzeStyleWithAI(image, variant);

  for (const model of IMAGE_MODELS) {
    for (const size of sizes) {
      try {
        return await requestImageEdit({
          apiKey,
          fileName,
          image,
          model,
          size,
          styleGuide,
          variant,
          talentType,
          note,
        });
      } catch (error) {
        lastError = error;
        attempts.push({
          message: error.message || "unknown_error",
          model,
          size,
          statusCode: error.statusCode || 0,
        });
        writeServerLog("image_model_failed", {
          message: error.message || "unknown_error",
          model,
          size,
          statusCode: error.statusCode || 0,
        });
      }
    }
  }

  const error = new Error(lastError?.message || "image_generation_failed");
  error.statusCode = lastError?.statusCode || 500;
  error.attempts = attempts;
  throw error;
}

function getAgeContext(childAge) {
  const ageMap = {
    "3-5": `【当前孩子年龄段：3-5岁 象征期】

蔺老师家庭美育·象征期发展特征：
- 孩子开始把图形与经验连接，解释可能前后变化——这是正常的探索过程。
- 线条和形状开始具有象征意义（一个圆圈可能是太阳、人脸或饼干）。
- 对颜色选择更多凭直觉和喜好，而非写实。
- 手部精细动作仍在发展中，线条可能不稳定、用力不均。
- 自我中心表达：画面围绕"我"展开（我的家人、我去过的地方、我喜欢的）。

家长引导重点：
- 用"可以给我介绍一下你的画吗？"代替"你画的是什么？"（保护表达欲，不要求命名）。
- 以"我"为中心拓展主题：我的身体、我的家人、我今天去了哪里、我喜欢的动物。
- 不说"像不像"、不比较、不示范让孩子照着画。
- 关注线条和动作：可以说"你这条线很长""这里绕成了一个圈圈"。
- 提供大纸和安全无毒的材料，建立固定创作区。
- 孩子说"我不会画"时，先鼓励，再一起观察特征和形状——不代劳。

分析这幅画时请参照以上年龄特征，重点关注：自发性、情绪表达、象征符号的出现、手部控制的发展过程。`,

    "5-8": `【当前孩子年龄段：5-8岁 意向表现期】

蔺老师家庭美育·意向表现期发展特征：
- 孩子会画基本特征，开始在意可识别性，但仍保持强烈的个人表达。
- 空间组织开始出现：基底线、天空线、排列式构图。
- 叙事能力增强，愿意用画讲故事——画面中开始出现事件、关系和情节。
- 对细节的兴趣增加，可能反复画同一主题（如公主、汽车、恐龙）不断深入。
- 开始形成自己的符号系统，可能一段时间只画黑白或偏爱某种颜色。
- 对"画得好不好"开始有自我意识，可能因不满意而擦改或放弃。

家长引导重点：
- 在家展示孩子作品，像对待艺术家的作品一样认真看待——装裱、标注日期。
- 用"谁、何时、何地、与谁、做什么"拓展场景主题，但不打断孩子的专注。
- 反馈孩子最仔细、最感兴趣、最有动作或故事感的部分（指出具体细节）。
- 如果孩子一段时间只画一个主题（如只画恐龙、只画公主），这是聚焦型学习风格——不要强行纠正，而是提供更丰富的相关资源深化探索。
- 避免说"你这里画错了""怎么不画颜色"——发展中状态不是能力缺失。
- 接纳差异化：有的孩子擅长形体、有的对色彩敏感、有的乐于改造再设计。

分析这幅画时请参照以上年龄特征，重点关注：叙事意图、空间组织尝试、主题聚焦度、细节投入程度、创意选择。`,

    "8-12": `【当前孩子年龄段：8-12岁 写实期】

蔺老师家庭美育·写实期发展特征：
- 孩子开始追求视觉真实感：关注比例、遮挡、透视、光影。
- 可能变得自我批评，"我画得不像"是常见情绪——需要保护艺术自信。
- 能够处理更复杂的构图、细节和技法。
- 个人风格开始萌芽：偏好某些主题、媒介、表现方式。
- 可能已经形成简笔画套路（来自学校或同伴影响），需要温和引导回到观察和真实表达。
- 对他人评价更敏感，父母反馈方式需要从"表扬"升级为"具体观察+信任"。

家长引导重点：
- 反馈要慎重，以鼓励为主同时给具体建议——指出细节和进步，不空洞说"很好"。
- 不简单说"真棒"，要描述看到的具体内容："这个人物你画了手指的关节，你观察得很仔细。"
- 如果孩子已经形成简笔画套路（如固定画法的大眼睛、标准笑容），不批评——先肯定模仿能力，再鼓励观察真实生活中喜欢的人事物。
- 提供更丰富的工具（素描铅笔、水彩、丙烯、数位板），让技术成长有空间。
- 带孩子看展览、画册、真实自然——输入决定输出。
- 保护表达欲永远优先于技术纠正。

分析这幅画时请参照以上年龄特征，重点关注：写实尝试、细节观察力、比例和空间意识、个人风格倾向、技术发展水平和艺术自信的保护需求。`,

    "12+": `【当前孩子年龄段：12岁以上 专业发展期】

蔺老师家庭美育·专业发展期特征：
- 青春期孩子可以处理抽象概念、复杂技法和个人表达。
- 艺术可能成为自我认同的重要部分，作品承载更深的思考和情感。
- 对外界评价高度敏感，需要专业而温暖的引导。
- 可以讨论艺术史、风格流派、创作理念等更深层话题。
- 技术训练和个人风格发展需要平衡——技法为表达服务。

分析这幅画时请参照以上年龄特征，重点关注：个人风格发展、概念思维深度、技法成熟度、情感表达的复杂性。`,
  };
  const ageInfo = ageMap[childAge] || ageMap["5-8"];
  return "=== 年龄阶段背景（必须严格据此调整分析）===\n" + ageInfo + "\n\n请确保 teacherCopy、nextSteps、colorPlan 以及所有分析内容都与这个年龄段的发展特征和家长引导重点精准对齐。";
}

function buildResponsesPayload(image, childAge) {
  const ageContext = getAgeContext(childAge);
  return {
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: analysisPrompt + "\n\n" + ageContext },
          { type: "input_image", image_url: image, detail: IMAGE_DETAIL },
        ],
      },
    ],
    max_output_tokens: 2800,
    model: MODEL,
    text: {
      format: {
        type: "json_schema",
        name: "child_art_guidance",
        strict: true,
        schema: responseSchema,
      },
    },
  };
}

function buildChatPayload(image, childAge) {
  const ageContext = getAgeContext(childAge);
  return {
    max_tokens: 2800,
    messages: [
      {
        role: "system",
        content: analysisPrompt + "\n\n" + ageContext,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this child artwork and return the required JSON object with ALL fields including strengthAnalysis.",
          },
          {
            type: "image_url",
            image_url: {
              detail: IMAGE_DETAIL,
              url: image,
            },
          },
        ],
      },
    ],
    model: MODEL,
    temperature: 0.7,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "child_art_guidance",
        strict: true,
        schema: responseSchema,
      },
    },
  };
}

function buildStyleResponsesPayload(image, variant) {
  return {
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `${adaptiveStyleGuidePrompt}\nAlternative number: ${variant}.`,
          },
          { type: "input_image", image_url: image, detail: IMAGE_DETAIL },
        ],
      },
    ],
    max_output_tokens: 700,
    model: MODEL,
    text: {
      format: {
        type: "json_schema",
        name: "child_art_style_guide",
        strict: true,
        schema: styleGuideSchema,
      },
    },
  };
}

function buildStyleChatPayload(image, variant) {
  return {
    max_tokens: 700,
    messages: [
      {
        role: "system",
        content: adaptiveStyleGuidePrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this child artwork and return one JSON style guide for alternative ${variant}.`,
          },
          {
            type: "image_url",
            image_url: {
              detail: IMAGE_DETAIL,
              url: image,
            },
          },
        ],
      },
    ],
    model: MODEL,
    temperature: 0.55,
  };
}

async function analyzeWithAI(image, childAge) {
  const apiKey = API_KEY;
  if (!apiKey) {
    const error = new Error("missing_api_key");
    error.statusCode = 503;
    throw error;
  }

  const useChatCompletions = AI_PROVIDER !== "openai";
  const url = useChatCompletions
    ? `${AI_BASE_URL}/chat/completions`
    : `${AI_BASE_URL}/responses`;
  const payload = useChatCompletions
    ? buildChatPayload(image, childAge)
    : buildResponsesPayload(image, childAge);
  const result = await requestProviderJson(url, payload, apiKey);

  const outputText = useChatCompletions
    ? extractChatOutputText(result)
    : extractOutputText(result);
  return normalizeAnalysis(parseJsonObject(outputText));
}

async function analyzeStyleWithAI(image, variant) {
  const apiKey = API_KEY;
  if (!apiKey) {
    return fallbackAdaptiveStyleGuide(variant);
  }

  try {
    const useChatCompletions = AI_PROVIDER !== "openai";
    const url = useChatCompletions
      ? `${AI_BASE_URL}/chat/completions`
      : `${AI_BASE_URL}/responses`;
    const payload = useChatCompletions
      ? buildStyleChatPayload(image, variant)
      : buildStyleResponsesPayload(image, variant);
    const result = await requestProviderJson(url, payload, apiKey);
    const outputText = useChatCompletions
      ? extractChatOutputText(result)
      : extractOutputText(result);
    return normalizeStyleGuide(parseJsonObject(outputText), variant);
  } catch {
    return fallbackAdaptiveStyleGuide(variant);
  }
}

// ──────────── 后台管理 ────────────

function checkAdmin(request, response) {
  const key = (request.url || "").match(/[?&]key=([^&]+)/)?.[1] || "";
  if (key !== ADMIN_KEY) {
    response.writeHead(401, { "Content-Type": "text/html; charset=utf-8" });
    response.end("<h1>🔒 需要管理员密钥</h1><p>在 URL 后添加 ?key=你的密钥</p>");
    return false;
  }
  return true;
}

function serveAdminPage(request, response) {
  if (!checkAdmin(request, response)) return;
  const users = getUsers();
  const orders = getOrders();
  const records = readJSON(RECORDS_FILE);
  const userList = Object.values(users);
  const orderList = Object.values(orders);
  const totalRecords = Object.values(records).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  const inviteCodes = getInviteCodes();
  const inviteList = Object.values(inviteCodes).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const rows = userList.map(u => {
    const userRecords = Array.isArray(records[u.id]) ? records[u.id].length : 0;
    return `<tr>
      <td>${u.email}</td>
      <td>${u.credits}</td>
      <td>${userRecords}</td>
      <td>${new Date(u.createdAt).toLocaleDateString("zh-CN")}</td>
    </tr>`;
  }).join("");

  const orderRows = orderList.slice(-20).reverse().map(o => `<tr>
    <td>${o.id}</td>
    <td>${userList.find(u => u.id === o.userId)?.email || o.userId}</td>
    <td>${o.credits}积分</td>
    <td>¥${o.price}</td>
    <td style="color:${o.status==='paid'?'#22c55e':'#f59e0b'}">${o.status==='paid'?'已支付':'待支付'}</td>
    <td>${o.paidAt ? new Date(o.paidAt).toLocaleString("zh-CN") : "-"}</td>
  </tr>`).join("") || "<tr><td colspan='6'>暂无订单</td></tr>";

  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>后台管理</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#f5f5f5;padding:20px;color:#1a1a1a}
h1{font-size:22px;margin-bottom:4px}h2{font-size:17px;margin:20px 0 10px}.stats{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.stat{bg:#fff;padding:14px 18px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);min-width:100px}
.stat b{display:block;font-size:28px;color:#e07b39}.stat span{font-size:13px;color:#666}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
th,td{padding:10px 14px;text-align:left;font-size:14px;border-bottom:1px solid #eee}th{background:#fafafa;font-weight:700;font-size:13px}
tr:hover{background:#fef9f5}@media(max-width:600px){body{padding:10px}th,td{padding:8px 10px;font-size:12px}}</style></head>
<body><h1>📊 后台管理</h1>
<div class="stats">
  <div class="stat"><b>${userList.length}</b><span>注册用户</span></div>
  <div class="stat"><b>${totalRecords}</b><span>分析记录</span></div>
  <div class="stat"><b>${orderList.filter(o=>o.status==='paid').length}</b><span>支付订单</span></div>
  <div class="stat"><b>${FREE_MODE?'免费':'收费'}</b><span>运行模式</span></div>
</div>
<h2>👥 用户列表</h2>
<table><thead><tr><th>邮箱</th><th>积分</th><th>记录数</th><th>注册时间</th></tr></thead><tbody>${rows||"<tr><td colspan='4'>暂无用户</td></tr>"}</tbody></table>
  <h2>💰 最近订单</h2>
  <table><thead><tr><th>订单ID</th><th>用户</th><th>内容</th><th>金额</th><th>状态</th><th>支付时间</th></tr></thead><tbody>${orderRows}</tbody></table>
  <h2>🎫 邀请码</h2>
  <div style="margin-bottom:10px">
    <button onclick="genInvite(1)" style="padding:8px 20px;background:#e07b39;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600">+ 生成1个邀请码</button>
    <button onclick="genInvite(5)" style="padding:8px 20px;background:#6E8FC7;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;margin-left:6px">+ 生成5个</button>
    <span id="gen-msg" style="margin-left:10px;color:#22c55e;font-size:14px"></span>
  </div>
  <table><thead><tr><th>邀请码</th><th>状态</th><th>备注</th><th>生成时间</th><th>使用时间</th></tr></thead><tbody>
  ${inviteList.map(c => `<tr>
    <td style="font-family:monospace;font-size:16px;font-weight:700;letter-spacing:2px">${c.code}</td>
    <td style="color:${c.used?'#ef4444':'#22c55e'}">${c.used?'已使用':'可用'}</td>
    <td>${c.note||'-'}</td>
    <td>${new Date(c.createdAt).toLocaleString('zh-CN')}</td>
    <td>${c.usedAt?new Date(c.usedAt).toLocaleString('zh-CN'):'-'}</td>
  </tr>`).join('')||'<tr><td colspan="5">暂无邀请码，点击上方按钮生成</td></tr>'}
  </tbody></table>
  <script>
  async function genInvite(n) {
    const msg = document.getElementById('gen-msg');
    msg.textContent = '生成中...';
    try {
      const res = await fetch('/api/admin/gen-invite?key=${ADMIN_KEY}', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({count:n,note:''})
      });
      const data = await res.json();
      if (data.codes) {
        msg.textContent = '✅ 已生成: ' + data.codes.join(', ');
        setTimeout(()=>location.reload(),1500);
      } else {
        msg.textContent = '❌ 生成失败';
      }
    } catch(e) {
      msg.textContent = '❌ 网络错误';
    }
  }
  </script>
  <p style="text-align:center;margin-top:20px;color:#999;font-size:12px">刷新页面获取最新数据</p></body></html>`;

  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
  response.end(html);
}

async function handleAdminUsers(request, response) {
  if (!checkAdmin(request, response)) return;
  const users = getUsers();
  const records = readJSON(RECORDS_FILE);
  const list = Object.values(users).map(u => ({
    id: u.id,
    email: u.email,
    credits: u.credits,
    records: (records[u.id] || []).length,
    createdAt: u.createdAt,
  }));
  sendJson(response, 200, { users: list });
}

async function handleAdminStats(request, response) {
  if (!checkAdmin(request, response)) return;
  const users = getUsers();
  const orders = getOrders();
  const records = readJSON(RECORDS_FILE);
  const totalRecords = Object.values(records).reduce((s, a) => s + (Array.isArray(a) ? a.length : 0), 0);
  sendJson(response, 200, {
    userCount: Object.keys(users).length,
    totalRecords,
    paidOrders: Object.values(orders).filter(o => o.status === "paid").length,
    freeMode: FREE_MODE,
  });
}

async function handleAdminGenInvite(request, response) {
  if (!checkAdmin(request, response)) return;
  try {
    const body = JSON.parse(await readBody(request));
    const note = body?.note || "";
    const count = Math.max(1, Math.min(20, parseInt(body?.count) || 1));
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(generateInviteCode(note));
    }
    writeServerLog("invite_codes_generated", { count, note });
    sendJson(response, 201, { codes });
  } catch {
    sendJson(response, 400, { error: "请求格式错误" });
  }
}

async function handleRegister(request, response) {
  try {
    const body = JSON.parse(await readBody(request));
    const email = (body?.email || "").trim().toLowerCase();
    const password = (body?.password || "").trim();
    const inviteCode = (body?.inviteCode || "").trim().toUpperCase();

    if (!email || !email.includes("@") || email.length < 5) {
      sendJson(response, 400, { error: "请输入有效的邮箱地址" });
      return;
    }
    if (!password || password.length < 6) {
      sendJson(response, 400, { error: "密码至少需要 6 个字符" });
      return;
    }
    if (!inviteCode || inviteCode.length < 6) {
      sendJson(response, 400, { error: "请输入有效的邀请码" });
      return;
    }

    // 验证邀请码（仅检查有效性，不标记使用）
    const inviteResult = validateInviteCode(inviteCode);
    if (!inviteResult.valid) {
      writeServerLog("register_failed", { email, inviteCode, reason: inviteResult.reason });
      sendJson(response, 400, { error: inviteResult.reason || "邀请码无效" });
      return;
    }

    const existing = getUserByEmail(email);
    if (existing) {
      writeServerLog("register_failed", { email, inviteCode, reason: "邮箱已注册" });
      sendJson(response, 409, { error: "该邮箱已注册，请直接登录" });
      return;
    }

    const user = createUser(email, password);
    if (!user) {
      sendJson(response, 500, { error: "注册失败，请稍后重试" });
      return;
    }

    // 注册成功后标记邀请码为已使用
    markInviteCodeUsed(inviteCode);

    const token = generateJWT({ userId: user.id, email: user.email });
    writeServerLog("user_registered", { userId: user.id, email: user.email, inviteCode });
    sendJson(response, 201, { token, user: { id: user.id, email: user.email, credits: user.credits } });
  } catch (err) {
    sendJson(response, 400, { error: "请求格式错误" });
  }
}

async function handleLogin(request, response) {
  try {
    const body = JSON.parse(await readBody(request));
    const email = (body?.email || "").trim().toLowerCase();
    const password = (body?.password || "").trim();

    if (!email || !password) {
      sendJson(response, 400, { error: "请输入邮箱和密码" });
      return;
    }

    const user = getUserByEmail(email);
    if (!user) {
      sendJson(response, 401, { error: "邮箱或密码错误" });
      return;
    }

    if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      sendJson(response, 401, { error: "邮箱或密码错误" });
      return;
    }

    const token = generateJWT({ userId: user.id, email: user.email });
    writeServerLog("user_logged_in", { userId: user.id });
    sendJson(response, 200, { token, user: { id: user.id, email: user.email, credits: user.credits } });
  } catch (err) {
    sendJson(response, 400, { error: "请求格式错误" });
  }
}

async function handleGetMe(request, response) {
  const auth = requireAuth(request);
  if (!auth) {
    sendJson(response, 401, { error: "请先登录" });
    return;
  }
  const user = getUserById(auth.userId);
  if (!user) {
    sendJson(response, 401, { error: "用户不存在" });
    return;
  }
  sendJson(response, 200, { user: { id: user.id, email: user.email, credits: user.credits, createdAt: user.createdAt } });
}

async function handleChangePassword(request, response) {
  const auth = requireAuth(request);
  if (!auth) {
    sendJson(response, 401, { error: "请先登录" });
    return;
  }
  try {
    const body = JSON.parse(await readBody(request));
    const oldPassword = (body?.oldPassword || "").trim();
    const newPassword = (body?.newPassword || "").trim();
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      sendJson(response, 400, { error: "新密码至少需要 6 个字符" });
      return;
    }
    const users = getUsers();
    const user = users[auth.userId];
    if (!user || !verifyPassword(oldPassword, user.passwordSalt, user.passwordHash)) {
      sendJson(response, 401, { error: "原密码错误" });
      return;
    }
    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    saveUsers(users);
    sendJson(response, 200, { ok: true });
  } catch {
    sendJson(response, 400, { error: "请求格式错误" });
  }
}

// ──────────── 路由处理：积分 ────────────

async function handleGetCredits(request, response) {
  const auth = requireAuth(request);
  if (!auth) {
    sendJson(response, 401, { error: "请先登录" });
    return;
  }
  const credits = getUserCredits(auth.userId);
  sendJson(response, 200, { credits });
}

// ──────────── 路由处理：支付 ────────────

async function handleGetPackages(request, response) {
  const auth = requireAuth(request);
  if (!auth) {
    sendJson(response, 401, { error: "请先登录" });
    return;
  }
  // 返回套餐列表（按积分展示，价格自动计算）
  const packages = PAYMENT_PACKAGES.map((pkg) => ({
    id: pkg.id,
    credits: pkg.credits,
    price: calcPrice(pkg.credits),
    hot: pkg.hot,
    hasPayUrl: !!pkg.payUrl,
  }));
  sendJson(response, 200, { packages, unitPrice: CREDIT_UNIT_PRICE });
}

async function handleCreateOrder(request, response) {
  const auth = requireAuth(request);
  if (!auth) {
    sendJson(response, 401, { error: "请先登录" });
    return;
  }
  try {
    const body = JSON.parse(await readBody(request));
    const packageId = body?.packageId;
    let credits;
    let price;

    if (packageId && packageId !== "custom") {
      const pkg = PAYMENT_PACKAGES.find((p) => p.id === packageId);
      if (!pkg) {
        sendJson(response, 400, { error: "套餐不存在" });
        return;
      }
      credits = pkg.credits;
      price = calcPrice(pkg.credits);
      const order = createOrder(auth.userId, pkg.id, credits, price);
      writeServerLog("order_created", { orderId: order.id, userId: auth.userId, packageId });
      sendJson(response, 201, {
        order: { id: order.id, credits: order.credits, price: order.price, status: order.status },
        payUrl: pkg.payUrl || null,
      });
    } else {
      // 自定义积分数量
      credits = Math.max(1, Math.min(1000, parseInt(body?.credits) || 10));
      price = calcPrice(credits);
      const order = createOrder(auth.userId, "custom", credits, price);
      writeServerLog("order_created", { orderId: order.id, userId: auth.userId, customCredits: credits });
      const customPayUrl = process.env.PAY_URL_CUSTOM || "";
      sendJson(response, 201, {
        order: { id: order.id, credits: order.credits, price: order.price, status: order.status },
        payUrl: customPayUrl || null,
      });
    }
  } catch {
    sendJson(response, 400, { error: "请求格式错误" });
  }
}

async function handlePaymentCallback(request, response) {
  try {
    const body = JSON.parse(await readBody(request));

    // 验证签名（如果平台提供了签名密钥）
    if (PAYMENT_SECRET) {
      const platformSig = body?.sign || body?.signature || "";
      const computed = crypto.createHmac("sha256", PAYMENT_SECRET)
        .update(body?.orderId || "")
        .digest("hex");
      if (platformSig && platformSig !== computed) {
        writeServerLog("payment_callback_bad_signature", { orderId: body?.orderId });
        sendJson(response, 403, { error: "签名验证失败" });
        return;
      }
    }

    const orderId = body?.orderId || body?.out_trade_no || body?.order_id;
    if (!orderId) {
      sendJson(response, 400, { error: "缺少订单号" });
      return;
    }

    const order = getOrder(orderId);
    if (!order) {
      sendJson(response, 404, { error: "订单不存在" });
      return;
    }
    if (order.status === "paid") {
      sendJson(response, 200, { ok: true, message: "已处理" });
      return;
    }

    const ok = markOrderPaid(orderId);
    if (ok) {
      writeServerLog("payment_callback_success", { orderId, userId: order.userId, credits: order.credits });
      sendJson(response, 200, { ok: true });
    } else {
      sendJson(response, 500, { error: "订单处理失败" });
    }
  } catch {
    sendJson(response, 400, { error: "请求格式错误" });
  }
}

// ──────────── 路由处理：分析记录 ────────────

async function handleSaveRecord(request, response) {
  const auth = getAuthOrGuest(request);
  if (!auth) {
    sendJson(response, 401, { error: "请先登录" });
    return;
  }
  try {
    const body = JSON.parse(await readBody(request));
    const records = readJSON(RECORDS_FILE);
    if (!records[auth.userId]) records[auth.userId] = [];
    const record = {
      id: generateId("rec_"),
      fileName: body?.fileName || "未命名",
      preview: body?.preview || "",
      analysis: body?.analysis || null,
      createdAt: new Date().toISOString(),
    };
    records[auth.userId].unshift(record);
    // 只保留最近 50 条
    if (records[auth.userId].length > 50) records[auth.userId] = records[auth.userId].slice(0, 50);
    writeJSON(RECORDS_FILE, records);
    sendJson(response, 201, { record });
  } catch {
    sendJson(response, 400, { error: "请求格式错误" });
  }
}

async function handleGetRecords(request, response) {
  const auth = getAuthOrGuest(request);
  if (!auth) {
    sendJson(response, 401, { error: "请先登录" });
    return;
  }
  const records = readJSON(RECORDS_FILE);
  const userRecords = records[auth.userId] || [];
  sendJson(response, 200, { records: userRecords.slice(0, 50) });
}

// ──────────── 路由处理：AI 分析（原有）────────────

async function handleAnalyze(request, response) {
  // 认证检查（免费模式自动放行）
  const auth = getAuthOrGuest(request);
  if (!auth) {
    sendJson(response, 401, { error: "请先登录" });
    return;
  }
  // 积分检查 + 扣减
  const creditResult = consumeCredits(auth.userId, 1);
  if (!creditResult.success) {
    sendJson(response, 402, { error: "积分不足，请充值", credits: creditResult.credits });
    return;
  }

  try {
    const rawBody = await readBody(request);
    const body = JSON.parse(rawBody);
    const image = body?.image;
    const childAge = typeof body?.childAge === "string" ? body.childAge : "5-8";

    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      // 退款：分析失败退还积分
      addCredits(auth.userId, 1);
      sendJson(response, 400, { error: "invalid_image" });
      return;
    }

    const analysis = await analyzeWithAI(image, childAge);
    sendJson(response, 200, {
      analysis,
      model: MODEL,
      provider: AI_PROVIDER,
      source: "ai",
      credits: creditResult.credits,
    });
  } catch (error) {
    // 退款：分析失败退还积分
    addCredits(auth.userId, 1);
    const statusCode = error.statusCode || (error.message === "request_too_large" ? 413 : 500);
    sendJson(response, statusCode, {
      error: error.message || "analysis_failed",
    });
  }
}

async function extractFiguresWithAI(image) {
  const apiKey = API_KEY;
  if (!apiKey) {
    const error = new Error("missing_api_key");
    error.statusCode = 503;
    throw error;
  }

  const useChatCompletions = AI_PROVIDER !== "openai";
  const url = useChatCompletions
    ? `${AI_BASE_URL}/chat/completions`
    : `${AI_BASE_URL}/responses`;

  const systemPrompt = [
    "You are an expert children's art analyst. Your task is to identify EVERY individual figure, character, object, animal, plant, building, vehicle, or any distinct element in the child's drawing.",
    "List each element as a separate entry. Be thorough — count repeated similar elements separately if they are distinct instances.",
    "For each element, provide:",
    "- name: a short name in Chinese (2-6 characters)",
    "- description: what it looks like (color, shape, notable features) in Chinese (10-30 characters)",
    "- position: where it is in the composition (e.g. 中央, 左上, 右下, 底部) in Chinese",
    "- type: one of 人物, 动物, 植物, 建筑, 交通工具, 自然景物, 食物, 玩具, 抽象图形, 其他",
    "- color: main colors used (Chinese)",
    "",
    "Return ONLY valid JSON in this exact structure:",
    '{',
    '  "figures": [',
    '    {"name": "...", "description": "...", "position": "...", "type": "...", "color": "..."}',
    '  ],',
    '  "totalCount": number,',
    '  "summary": "a 1-2 sentence overall observation about what the child drew (Chinese)"',
    '}',
    "Do not include markdown or any text outside the JSON.",
  ].join("\n");

  const userPrompt = "请识别并列出这幅儿童画中的每一个独立形象/元素。";

  const payload = useChatCompletions
    ? {
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: image, detail: IMAGE_DETAIL } },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }
    : {
        model: MODEL,
        input: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "input_text", text: userPrompt },
              { type: "input_image", image_url: image, detail: IMAGE_DETAIL },
            ],
          },
        ],
        max_output_tokens: 2000,
        temperature: 0.3,
      };

  const result = await requestProviderJson(url, payload, apiKey);
  const outputText = useChatCompletions
    ? extractChatOutputText(result)
    : extractOutputText(result);
  const parsed = parseJsonObject(outputText);

  if (!parsed.figures || !Array.isArray(parsed.figures)) {
    throw new Error("extraction_failed: invalid response format");
  }

  return {
    figures: parsed.figures.slice(0, 20).map((f) => ({
      name: String(f.name || "未命名").slice(0, 20),
      description: String(f.description || "").slice(0, 60),
      position: String(f.position || "画面中").slice(0, 20),
      type: String(f.type || "其他").slice(0, 20),
      color: String(f.color || "多种颜色").slice(0, 30),
    })),
    totalCount: Number(parsed.totalCount) || parsed.figures.length,
    summary: String(parsed.summary || `画面中识别出 ${parsed.figures.length} 个独立形象`).slice(0, 200),
  };
}

async function handleExtractFigures(request, response) {
  const auth = getAuthOrGuest(request);
  if (!auth) {
    sendJson(response, 401, { error: "请先登录" });
    return;
  }
  try {
    const rawBody = await readBody(request);
    const body = JSON.parse(rawBody);
    const image = body?.image;

    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      sendJson(response, 400, { error: "invalid_image" });
      return;
    }

    const extraction = await extractFiguresWithAI(image);
    sendJson(response, 200, {
      extraction,
      model: MODEL,
      provider: AI_PROVIDER,
      source: "ai",
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.message === "request_too_large" ? 413 : 500);
    sendJson(response, statusCode, {
      error: error.message || "extraction_failed",
    });
  }
}

function getFriendlyGenerationMessage(error) {
  const rawMessage = String(error?.message || "");
  const attempts = Array.isArray(error?.attempts) ? error.attempts : [];
  const combined = [rawMessage, ...attempts.map((attempt) => attempt.message || "")]
    .join("\n")
    .toLowerCase();

  if (rawMessage === "missing_api_key") {
    return "\u8fd8\u6ca1\u8fde\u4e0a AI Key\uff0c\u8bf7\u5148\u68c0\u67e5 .env \u91cc\u7684\u5bc6\u94a5\u3002";
  }

  if (/fetch failed|无法连接|econn|enotfound|network|timeout|timed out|socket|connection/i.test(combined)) {
    return "\u672c\u5730\u540e\u53f0\u6682\u65f6\u8fde\u4e0d\u4e0a\u4e91\u96fe\u56fe\u7247\u63a5\u53e3\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u6216\u7a0d\u540e\u518d\u70b9\u4e00\u6b21\u3002";
  }

  if (/model|模型|not found|does not exist|unsupported|invalid.*model|无效/i.test(combined)) {
    return "\u5f53\u524d\u56fe\u7247\u6a21\u578b\u4e0d\u53ef\u7528\uff0c\u9700\u8981\u5728 .env \u91cc\u6362\u4e00\u4e2a\u4e91\u96fe\u652f\u6301\u7684\u56fe\u7247\u7f16\u8f91\u6a21\u578b\u3002";
  }

  if (/images\/edits|image edit|edit endpoint|接口/i.test(combined)) {
    return "\u5f53\u524d\u5e73\u53f0\u7684\u56fe\u7247\u7f16\u8f91\u63a5\u53e3\u6ca1\u6709\u8c03\u901a\uff0c\u9700\u8981\u6362\u652f\u6301\u201c\u4f20\u56fe\u7f16\u8f91\u201d\u7684\u6a21\u578b\u6216\u63a5\u53e3\u3002";
  }

  return "\u521a\u624d\u6ca1\u6709\u751f\u6210\u6210\u529f\uff0c\u6211\u5df2\u8bb0\u5f55\u539f\u56e0\uff0c\u53ef\u4ee5\u6362\u4e2a\u753b\u98ce\u6216\u7a0d\u540e\u518d\u8bd5\u3002";
}

async function handleGenerateGuidanceImage(request, response) {
  // 认证检查（免费模式自动放行）
  const auth = getAuthOrGuest(request);
  if (!auth) {
    sendJson(response, 401, { error: "请先登录" });
    return;
  }
  // 积分检查 + 扣减
  const creditResult = consumeCredits(auth.userId, 1);
  if (!creditResult.success) {
    sendJson(response, 402, { error: "积分不足，请充值", credits: creditResult.credits });
    return;
  }

  try {
    const rawBody = await readBody(request);
    const body = JSON.parse(rawBody);
    const image = body?.image;
    const fileName =
      typeof body?.fileName === "string" && body.fileName.trim()
        ? body.fileName.trim()
        : "artwork.png";
    const variant =
      Number.isFinite(Number(body?.variant)) && Number(body.variant) > 0
        ? Math.floor(Number(body.variant))
        : 1;
    const stylePreset =
      body?.stylePreset && typeof body.stylePreset === "object"
        ? body.stylePreset
        : null;
    const talentType =
      typeof body?.talentType === "string" && body.talentType.trim()
        ? body.talentType.trim()
        : null;
    const note =
      typeof body?.note === "string" && body.note.trim()
        ? body.note.trim()
        : "";

    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      addCredits(auth.userId, 1);
      sendJson(response, 400, { error: "invalid_image" });
      return;
    }

    const result = await generateGuidanceImage(image, fileName, variant, stylePreset, talentType, note);
    sendJson(response, 200, {
      image: result.image,
      model: result.model,
      provider: AI_PROVIDER,
      size: result.size,
      originalWidth: result.originalWidth,
      originalHeight: result.originalHeight,
      source: "ai",
      styleGuide: result.styleGuide,
      variant,
      credits: creditResult.credits,
    });
  } catch (error) {
    addCredits(auth.userId, 1);
    const statusCode = error.statusCode || (error.message === "request_too_large" ? 413 : 500);
    const isBusy = statusCode === 429 || /busy|saturated|\u9971\u548c|429/i.test(error.message || "");
    writeServerLog("image_generation_failed", {
      attempts: Array.isArray(error.attempts) ? error.attempts : [],
      message: error.message || "image_generation_failed",
      statusCode,
    });
    sendJson(response, statusCode, {
      error: error.message || "image_generation_failed",
      message: isBusy
        ? "\u56fe\u7247\u751f\u6210\u6a21\u578b\u73b0\u5728\u6bd4\u8f83\u5fd9\uff0c\u8bf7\u7a0d\u540e\u518d\u70b9\u4e00\u6b21\u3002"
        : getFriendlyGenerationMessage(error),
    });
  }
}

// ===== 三视图生成 =====
const turnaroundPrompt = [
  "You are a professional character designer. Take the reference image which contains a character/figure drawn in a child's art style.",
  "Generate a character turnaround sheet showing THREE views of the SAME character:",
  "1. FRONT VIEW (正面) — character facing forward",
  "2. SIDE VIEW (侧面) — character in profile, facing right",
  "3. BACK VIEW (背面) — character seen from behind",
  "",
  "CRITICAL RULES:",
  "- Preserve the character's design, proportions, colors, and style EXACTLY as in the reference.",
  "- The character should be instantly recognizable as the same one from the child's drawing.",
  "- Keep the childlike art style — do not make it look like a professional anime or 3D render.",
  "- Each view should be clearly separated, on a clean white/transparent background.",
  "- Arrange them horizontally: [FRONT] [SIDE] [BACK]",
  "- Do NOT add text, labels, arrows, or watermarks.",
  "- The character should be the same size across all three views.",
  "",
  "Output: a single image showing three views of the character in a clean character sheet layout.",
].join("\n");

async function handleGenerateTurnaround(request, response) {
  const auth = getAuthOrGuest(request);
  if (!auth) {
    sendJson(response, 401, { error: "请先登录" });
    return;
  }
  try {
    const rawBody = await readBody(request);
    const body = JSON.parse(rawBody);
    const image = body?.image;
    const figureName = body?.figureName || "角色";
    const figureDesc = body?.figureDesc || "";
    const figureType = body?.figureType || "";

    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      sendJson(response, 400, { error: "invalid_image" });
      return;
    }

    const apiKey = API_KEY;
    if (!apiKey) {
      sendJson(response, 500, { error: "missing_api_key" });
      return;
    }

    const figureContext = figureDesc
      ? `The character is described as: ${figureDesc}. Type: ${figureType}.`
      : `The character is named "${figureName}". Type: ${figureType}.`;

    const prompt = [
      turnaroundPrompt,
      "",
      `CHARACTER CONTEXT: ${figureContext}`,
      `CHARACTER NAME: ${figureName}`,
    ].join("\n");

    const payload = {
      model: IMAGE_MODELS[0],
      prompt,
      n: 1,
      size: IMAGE_SIZES[1] || "1536x1024",
      response_format: "b64_json",
    };

    const result = await requestProviderJson(
      `${AI_BASE_URL}/images/generations`,
      payload,
      apiKey,
    );

    const generatedImage = extractGeneratedImage(result);
    if (!generatedImage) {
      throw new Error("turnaround_generation_failed");
    }

    sendJson(response, 200, {
      turnaround: {
        image: generatedImage,
        front: generatedImage,
        side: generatedImage,
        back: generatedImage,
      },
      model: IMAGE_MODELS[0],
      provider: AI_PROVIDER,
      source: "ai",
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.message === "request_too_large" ? 413 : 500);
    writeServerLog("turnaround_failed", { message: error.message || "turnaround_generation_failed" });
    sendJson(response, statusCode, {
      error: error.message || "turnaround_generation_failed",
      message: getFriendlyGenerationMessage(error),
    });
  }
}

const STATIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function serveStatic(request, response) {
  let urlPath = request.url.split("?")[0].split("#")[0];
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = path.join(STATIC_DIR, urlPath);
  const ext = path.extname(filePath).toLowerCase();

  // Security: prevent directory traversal
  if (!filePath.startsWith(STATIC_DIR)) {
    sendJson(response, 403, { error: "forbidden" });
    return;
  }

  try {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      // SPA fallback: serve index.html for any non-file route
      const indexFile = path.join(STATIC_DIR, "index.html");
      if (fs.existsSync(indexFile)) {
        response.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
        });
        response.end(fs.readFileSync(indexFile, "utf8"));
        return;
      }
      sendJson(response, 404, { error: "not_found" });
      return;
    }

    const content = fs.readFileSync(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const cacheControl = ext === ".html" ? "no-cache" : "public, max-age=3600";

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
      "Access-Control-Allow-Origin": "*",
    });
    response.end(content);
  } catch {
    sendJson(response, 500, { error: "static_serve_failed" });
  }
}

const server = http.createServer((request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  // ── 公开配置 ──
  if (request.method === "GET" && request.url === "/api/config") {
    sendJson(response, 200, { freeMode: FREE_MODE, unitPrice: CREDIT_UNIT_PRICE });
    return;
  }

  // ── 后台管理 ──
  if (request.method === "GET" && (request.url === "/admin" || request.url.startsWith("/admin?"))) {
    serveAdminPage(request, response); return;
  }
  if (request.method === "GET" && (request.url === "/api/admin/users" || request.url.startsWith("/api/admin/users?"))) {
    handleAdminUsers(request, response); return;
  }
  if (request.method === "GET" && (request.url === "/api/admin/stats" || request.url.startsWith("/api/admin/stats?"))) {
    handleAdminStats(request, response); return;
  }
  if (request.method === "POST" && (request.url === "/api/admin/gen-invite" || request.url.startsWith("/api/admin/gen-invite?"))) {
    handleAdminGenInvite(request, response); return;
  }

  // ── 认证 ──
  if (request.method === "POST" && request.url === "/api/auth/register") {
    handleRegister(request, response); return;
  }
  if (request.method === "POST" && request.url === "/api/auth/login") {
    handleLogin(request, response); return;
  }
  if (request.method === "GET" && request.url === "/api/auth/me") {
    handleGetMe(request, response); return;
  }
  if (request.method === "POST" && request.url === "/api/auth/change-password") {
    handleChangePassword(request, response); return;
  }

  // ── 积分 ──
  if (request.method === "GET" && request.url === "/api/credits") {
    handleGetCredits(request, response); return;
  }

  // ── 支付 ──
  if (request.method === "GET" && request.url === "/api/payment/packages") {
    handleGetPackages(request, response); return;
  }
  if (request.method === "POST" && request.url === "/api/payment/create-order") {
    handleCreateOrder(request, response); return;
  }
  if (request.method === "POST" && request.url === "/api/payment/callback") {
    handlePaymentCallback(request, response); return;
  }

  // ── 分析记录 ──
  if (request.method === "POST" && request.url === "/api/records/save") {
    handleSaveRecord(request, response); return;
  }
  if (request.method === "GET" && request.url === "/api/records/list") {
    handleGetRecords(request, response); return;
  }

  // ── AI 分析（原有）──
  if (request.method === "POST" && request.url === "/api/analyze") {
    handleAnalyze(request, response); return;
  }
  if (request.method === "POST" && request.url === "/api/generate-guidance-image") {
    handleGenerateGuidanceImage(request, response); return;
  }
  if (request.method === "POST" && request.url === "/api/extract-figures") {
    handleExtractFigures(request, response); return;
  }
  if (request.method === "POST" && request.url === "/api/generate-turnaround") {
    handleGenerateTurnaround(request, response); return;
  }

  serveStatic(request, response);
});

const LISTEN_HOST = process.env.RAILWAY_ENVIRONMENT ? "0.0.0.0" : (process.env.LAN_ACCESS === "true" ? "0.0.0.0" : "127.0.0.1");

server.listen(PORT, LISTEN_HOST, () => {
  console.log(`Server running at http://${LISTEN_HOST}:${PORT}`);
});
