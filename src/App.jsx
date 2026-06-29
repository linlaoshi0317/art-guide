import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clipboard,
  Download,
  FileImage,
  FileText,
  Heart,
  ImageDown,
  ImageUp,
  LogIn,
  LogOut,
  Maximize2,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Printer,
  RefreshCcw,
  Save,
  Scan,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import sampleCompositionGuide from "./assets/sample-composition-guide.jpg";
import sampleCompositionOriginal from "./assets/sample-composition-original.jpg";

const guidanceBatchSize = 1;

const copy = {
  sampleArtwork: "\u793a\u4f8b\u4f5c\u54c1",
  upload: "\u4e0a\u4f20",
  analyzing: "AI 老师正在观察画面，识别12种天赋倾向",
  sampleAnalyzed: "\u793a\u4f8b\u4f5c\u54c1\u5df2\u5206\u6790",
  analyzed: "AI 老师已完成天赋识别",
  regenerated: "\u5df2\u6839\u636e\u56fe\u7247\u91cd\u65b0\u751f\u6210",
  aiGenerated: "\u771f\u5b9e AI \u89c6\u89c9\u5df2\u751f\u6210",
  localGenerated: "\u672c\u5730\u5206\u6790\u5df2\u751f\u6210",
  observed: "\u89c2\u5bdf\u5230\uff1a",
  newArtwork: "\u65b0\u4f5c\u54c1",
  appLabel: "\u853a\u8001\u5e08\u513f\u7ae5\u7f8e\u80b2\u4e00\u5bf9\u4e00\u70b9\u8bc4\u6307\u5bfc\u7f51",
  profile: "\u4e2a\u4eba\u4e2d\u5fc3",
  title: "\u513f\u7ae5\u7f8e\u80b2\u4e00\u5bf9\u4e00\u70b9\u8bc4\u6307\u5bfc\u7f51",
  saved: "\u5df2\u4fdd\u5b58",
  save: "\u4fdd\u5b58\u8bb0\u5f55",
  uploadArtwork: "\u4e0a\u4f20\u4f5c\u54c1",
  oneArtwork: "1 \u5f20\u4f5c\u54c1",
  replace: "\u66f4\u6362",
  chooseArtwork: "\u9009\u62e9\u5b69\u5b50\u7684\u624b\u7ed8\u4f5c\u54c1",
  artworkAlt: "\u4e0a\u4f20\u7684\u5b69\u5b50\u624b\u7ed8\u4f5c\u54c1",
  guideAction: "\u4e00\u952e\u4f18\u5316",
  analyzeAction: "\u4e00\u952e\u5206\u6790\u753b\u9762",
  analyzeActionDesc: "\u5206\u6790\u7ebf\u6761\u3001\u8272\u5f69\u3001\u9020\u578b\u3001\u89d2\u8272\u7b49\u6240\u6709\u753b\u9762\u5185\u5bb9\uff0c\u8bc6\u522b\u5b69\u5b50\u7684\u5929\u8d4b\u7c7b\u578b\u3002",
  analyzingFull: "\u6b63\u5728\u6df1\u5ea6\u5206\u6790\u753b\u9762\u2026\u2026",
  regenerateAction: "\u91cd\u65b0\u751f\u6210\u65b0\u65b9\u6848",
  guideActionTitle: "\u57fa\u4e8e\u539f\u753b\u751f\u6210\u4e00\u5f20\u4f18\u5316\u56fe",
  guideActionIntro:
    "\u4e0d\u505a\u900f\u660e\u53e0\u52a0\u6548\u679c\uff0c\u76f4\u63a5\u5728\u539f\u4f5c\u57fa\u7840\u4e0a\u751f\u6210\u4e00\u5f20\u5b8c\u6574\u7684\u6784\u56fe\u3001\u5185\u5bb9\u548c\u8272\u5f69\u4f18\u5316\u56fe\u3002",
  guideReady: "\u7b49\u5f85\u5efa\u8bae\u6307\u5bfc",
  guideGenerating: "\u6b63\u5728\u57fa\u4e8e\u539f\u753b\u751f\u6210\u4f18\u5316\u56fe",
  guideDone: "\u5df2\u751f\u6210\u57fa\u4e8e\u539f\u753b\u7684\u4f18\u5316\u56fe",
  guideSample: "\u793a\u4f8b\u6548\u679c",
  guideFailed: "\u751f\u6210\u5931\u8d25",
  guideFailedHint:
    "\u521a\u624d\u6ca1\u751f\u6210\u6210\u529f\uff0c\u53ef\u4ee5\u7a0d\u540e\u518d\u70b9\u4e00\u6b21\u3002",
  guideEmpty:
    "\u4e0a\u4f20\u4f5c\u54c1\u540e\uff0c\u70b9\u201c\u5efa\u8bae\u6307\u5bfc\u201d\u751f\u6210\u4e00\u5f20\u57fa\u4e8e\u539f\u4f5c\u7684\u4f18\u5316\u56fe\u3002",
  guideResult: "\u57fa\u4e8e\u539f\u753b\u4f18\u5316",
  guidePlan: "\u8c03\u6574\u65b9\u6848",
  strengthAnalysis: "蔺老师分析孩子优势",
  strengthSubtitle: "从心理学·成长规律·家庭美育看见孩子",
  strengthFormulaLabel: "蔺老师家庭美育模型",
  strengthFormula: "孩子好的表现 = 潜能 - 干扰 - 内耗",
  strengthCaution:
    "这不是给孩子下结论，而是从画面中观察孩子可能正在发展的表达方式、兴趣和内驱力。",
  strengthEvidence: "可观察到",
  strengthPsychology: "🧠 心理学视角",
  strengthDevelopment: "🌱 成长规律",
  strengthFamily: "🏠 家庭美育",
  strengthTalent: "🎨 天赋类型识别",
  strengthProjection: "🔍 画面内容在说什么",
  strengthActions: "给家长的五个行动建议",
  strengthClosing: "父母好好学习，孩子天天向上 —— 先看见孩子，再看见作品。",
  compositionContentColor: "\u9009\u753b\u98ce\u00b7\u8865\u6784\u56fe\u00b7\u8865\u5185\u5bb9\u00b7\u8865\u8272\u5f69",
  webWorkspace: "\u7f51\u9875\u5de5\u4f5c\u53f0",
  enlargeView: "\u653e\u5927\u67e5\u770b",
  closePreview: "\u5173\u95ed\u9884\u89c8",
  matchedStyle: "\u672c\u6b21\u5339\u914d\u98ce\u683c",
  styleReason: "\u4e3a\u4ec0\u4e48\u9002\u5408\u8fd9\u5f20\u753b",
  styleSelectTitle: "\u753b\u98ce\u65b9\u5411",
  styleSelectHint: "\u53ef\u4ee5\u81ea\u52a8\u5339\u914d\uff0c\u4e5f\u53ef\u4ee5\u6307\u5b9a\u4e00\u4e2a\u5b8c\u6210\u98ce\u683c\u3002",
  styleSelectLabel: "\u9009\u62e9\u753b\u98ce",
  styleAuto: "\u81ea\u52a8\u6839\u636e\u4f5c\u54c1\u5339\u914d",
  teacherGuide: "\u8001\u5e08\u5f15\u5bfc",
  analyzingCopy:
    "我正在逐条辨识画中的每个元素、行为痕迹和思维特征，从12种天赋中为你找到最匹配的方向，马上给出结果。",
  teacherCopy:
    "\u753b\u5f97\u5f88\u68d2\uff01\u82b1\u6735\u7684\u7ed3\u6784\u5df2\u7ecf\u5f88\u6e05\u695a\u4e86\uff0c\u5982\u679c\u5728\u9aa8\u67b6\u7a33\u5b9a\u6027\u548c\u7ec6\u8282\u8282\u594f\u4e0a\u518d\u4f18\u5316\uff0c\u753b\u9762\u4f1a\u66f4\u751f\u52a8\u3001\u81ea\u7136\u3002",
  nextTitle: "\u4e0b\u4e00\u6b65\u600e\u4e48\u753b",
  compareLabel: "\u539f\u753b\u548c\u5f15\u5bfc\u540e",
  original: "\u539f\u753b",
  guided: "\u5f15\u5bfc\u540e",
  originalThumb: "\u539f\u753b\u7f29\u7565\u56fe",
  afterText:
    "\u5b8c\u6210\u5f15\u5bfc\u540e\u53ef\u67e5\u770b\u4f18\u5316\u6548\u679c",
  navLabel: "\u9875\u9762\u5bfc\u822a",
  advice: "\u5efa\u8bae",
  skeleton: "\u9aa8\u67b6",
  color: "\u4e0a\u8272",
  record: "\u8bb0\u5f55",
  uploadNew: "\u4e0a\u4f20\u65b0\u4f5c\u54c1",
  currentAnalysis: "\u5f53\u524d\u5206\u6790",
  noSavedRecords: "\u6682\u65e0\u4fdd\u5b58\u8bb0\u5f55",
  noSavedRecordsHint:
    "\u70b9\u53f3\u4e0a\u89d2\u201c\u4fdd\u5b58\u8bb0\u5f55\u201d\u540e\uff0c\u4f1a\u5728\u8fd9\u91cc\u7559\u4e0b\u6bcf\u6b21\u4f5c\u54c1\u7684\u5efa\u8bae\u3002",
  analysisRecord: "\u5206\u6790\u8bb0\u5f55",
  compositionSkeleton: "\u6784\u56fe\u9aa8\u67b6",
  compositionGuideImage: "\u9aa8\u67b6\u5efa\u8bae\u56fe",
  visualCenter: "\u89c6\u89c9\u4e2d\u5fc3",
  flowLine: "\u52a8\u7ebf",
  balance: "\u5e73\u8861",
  depth: "\u5c42\u6b21",
  mainPosition: "\u4e3b\u89d2\u4f4d\u7f6e",
  pictureDirection: "\u753b\u9762\u65b9\u5411",
  whitespace: "\u7559\u767d\u5173\u7cfb",
  foregroundDepth: "\u524d\u540e\u5c42\u6b21",
  generatedFromCurrent: "\u6839\u636e\u5f53\u524d\u4f5c\u54c1\u751f\u6210",
  currentArtwork: "\u5f53\u524d\u4f5c\u54c1",
  recordUnit: "\u6761\u8bb0\u5f55",
  justNow: "\u521a\u521a",
  rerun: "\u91cd\u65b0\u5206\u6790",
  viewAdvice: "\u67e5\u770b\u5efa\u8bae",
  adviceIntro: "\u8fd9\u9875\u4e13\u95e8\u770b\u8001\u5e08\u5efa\u8bae\u548c\u4e0b\u4e00\u6b65\u3002",
  skeletonIntro: "\u8fd9\u9875\u4e13\u95e8\u770b\u753b\u9762\u9aa8\u67b6\u548c\u6784\u56fe\u65b9\u5411\u3002",
  colorIntro: "\u8fd9\u9875\u4e13\u95e8\u770b\u914d\u8272\u3001\u4e0a\u8272\u987a\u5e8f\u548c\u5b8c\u6210\u6548\u679c\u3002",
  recordIntro: "\u8fd9\u9875\u4f1a\u4fdd\u5b58\u6bcf\u6b21\u4e0a\u4f20\u540e\u7684\u5206\u6790\u7ed3\u679c\u3002",
  recordDetails: "\u8bb0\u5f55\u8be6\u60c5",
  generationHistory: "\u751f\u6210\u5386\u53f2",
  generationHistoryHint: "\u6bcf\u6b21\u201c\u5efa\u8bae\u6307\u5bfc\u201d\u751f\u6210\u7684\u4f18\u5316\u56fe\u4f1a\u81ea\u52a8\u4fdd\u5b58\u5728\u8fd9\u91cc\u3002",
  noGenerationHistory: "\u6682\u65e0\u751f\u6210\u8bb0\u5f55",
  noGenerationHistoryHint: "\u4e0a\u4f20\u4f5c\u54c1\u540e\u70b9\u201c\u5efa\u8bae\u6307\u5bfc\u201d\uff0c\u751f\u6210\u7684\u4f18\u5316\u56fe\u4f1a\u81ea\u52a8\u4fdd\u5b58\u5230\u8fd9\u91cc\u3002",
  viewGenerated: "\u67e5\u770b\u751f\u6210\u56fe",
  adviceSummary: "\u5efa\u8bae\u6458\u8981",
  observedTags: "\u89c2\u5bdf\u6807\u7b7e",
  skeletonHint: "\u6784\u56fe\u63d0\u793a",
  visualCenterHint: "\u753b\u9762\u4e3b\u89d2\u7684\u91cd\u5fc3\u9700\u8981\u88ab\u770b\u89c1\u3002",
  flowLineHint: "\u7528\u4e00\u6761\u65b9\u5411\u7ebf\u628a\u89c6\u7ebf\u5e26\u56de\u4e3b\u89d2\u3002",
  balanceHint: "\u5de6\u53f3\u6216\u4e0a\u4e0b\u9700\u8981\u6709\u56de\u5e94\u5173\u7cfb\u3002",
  depthHint: "\u524d\u666f\u3001\u4e2d\u666f\u3001\u80cc\u666f\u53ef\u4ee5\u5206\u5f97\u66f4\u6e05\u695a\u3002",
  currentAdvice: "\u672c\u6b21\u5efa\u8bae",
  uploadHint: "\u4e0a\u4f20\u4e00\u5f20\u65b0\u4f5c\u54c1\u540e\uff0c\u5efa\u8bae\u4f1a\u91cd\u65b0\u751f\u6210\u3002",
  recordHint: "\u4fdd\u5b58\u540e\u53ef\u5728\u8bb0\u5f55\u9875\u56de\u770b\u3002",
  colorGuide: "\u4e0a\u8272\u6307\u5bfc",
  colorPalette: "\u8272\u677f",
  colorFocus: "\u4e0a\u8272\u91cd\u70b9",
  colorSteps: "\u4e0a\u8272\u987a\u5e8f",
  colorEffect: "\u4e0a\u8272\u6548\u679c",
  uploadColorResult: "\u4e0a\u4f20\u6548\u679c",
  uploadSkeletonGuide: "\u4e0a\u4f20\u5efa\u8bae\u56fe",
  skeletonGuideAlt: "\u4eba\u5de5\u667a\u80fd\u751f\u6210\u7684\u9aa8\u67b6\u5efa\u8bae\u56fe",
  noSkeletonGuide: "\u6709 AI \u9aa8\u67b6\u5efa\u8bae\u56fe\u65f6\u53ef\u4e0a\u4f20\u5bf9\u7167",
  colorResultAlt: "\u6307\u5bfc\u540e\u4e0a\u8272\u6548\u679c",
  noColorResult: "\u4e0a\u8272\u5b8c\u6210\u540e\u53ef\u4e0a\u4f20\u6548\u679c\u56fe\u5bf9\u7167",
};

const styleGroups = [
  {
    label: "自动",
    options: [
      {
        id: "auto",
        label: copy.styleAuto,
        summary: "AI 先看孩子画的主题、线条、留白和颜色，再自动选最合适的完成方向。",
      },
    ],
  },
  {
    label: "日系动画/插画",
    options: [
      {
        id: "jp-warm-animation",
        label: "日系温暖手绘动画",
        summary: "柔和水彩、自然背景、暖光空气感，适合田园、动物、飞行和治愈童话。",
        styleName: "日系温暖手绘动画",
        styleCategory: "warm Japanese-inspired hand-drawn animated film atmosphere",
        reason: "适合需要温暖故事感、自然背景和柔和色彩的儿童作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用柔和水彩、暖光、浅绿、浅蓝和米白色，颜色不要压住孩子原来的线条。",
        compositionDirection: "保留原主体位置，用背景层次和小道具补完整前景、中景、背景。",
      },
      {
        id: "jp-clear-light",
        label: "日系通透光影",
        summary: "高饱和天空、透明光斑、清爽城市或校园感，适合阳光、建筑、青春主题。",
        styleName: "日系通透光影",
        styleCategory: "transparent anime light and sky illustration",
        reason: "适合画面需要更亮、更通透，或者有天空、城市、校园、建筑元素的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "提高天空蓝、夕阳橙和亮部透明感，暗部保持干净，不做厚重写实。",
        compositionDirection: "用光线方向和远近景把视线带回原来的主角。",
      },
      {
        id: "jp-soft-character",
        label: "日系柔和人物插画",
        summary: "五官柔和、发丝细腻、色调干净，适合人物头像、少女感、校园感作品。",
        styleName: "日系柔和人物插画",
        styleCategory: "soft delicate anime character illustration",
        reason: "适合人物、头像、服装和表情较明显的儿童作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "肤色通透、眼睛和发色轻柔渐变，服装用低饱和辅助色统一。",
        compositionDirection: "强化脸部和上半身中心，用发丝、衣领、背景光形成稳定视线。",
      },
      {
        id: "jp-retro-cel",
        label: "90年代赛璐璐复古",
        summary: "清晰黑线、平涂色块、老动画质感，适合线稿清楚、角色明确的作品。",
        styleName: "90年代赛璐璐复古",
        styleCategory: "retro cel animation flat color",
        reason: "适合轮廓清楚、角色明确、想要更有动画感的画。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用平涂高纯色和一到两层硬边阴影，避免复杂渐变。",
        compositionDirection: "用大色块分出主角、背景和装饰区，让画面更清楚。",
      },
      {
        id: "jp-thick-paint",
        label: "日系厚涂",
        summary: "色块堆叠、体积感强、光影厚一些，适合想要更完整立绘感的作品。",
        styleName: "日系厚涂",
        styleCategory: "anime painterly illustration",
        reason: "适合角色、动物或幻想主题，需要更强体积和光影的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "用分层色块塑造体积，亮部和暗部要统一在同一个光源下。",
        compositionDirection: "让主体最大明暗对比集中在视觉中心，背景保持次要。",
      },
      {
        id: "jp-flat-anime",
        label: "平涂二次元",
        summary: "干净纯色、少量阴影、线条精致，适合短视频、头像和角色类作品。",
        styleName: "平涂二次元",
        styleCategory: "clean flat anime illustration",
        reason: "适合线稿主体清楚、希望画面更干净利落的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "用干净纯色加少量阴影，主色不超过三种，点缀色重复出现。",
        compositionDirection: "用对齐的背景形状和重复装饰让画面更有秩序。",
      },
      {
        id: "jp-ukiyoe",
        label: "浮世绘和风",
        summary: "传统版画、波浪远山、平面化线条，适合山水、动物、和服或神话元素。",
        styleName: "浮世绘和风",
        styleCategory: "ukiyo-e inspired Japanese print",
        reason: "适合有山水、动物、神话、花鸟或传统装饰感的画。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用古朴蓝、米白、朱红和墨色，颜色保持版画般清晰。",
        compositionDirection: "用平面图案和大曲线组织留白，让画面有传统节奏。",
      },
    ],
  },
  {
    label: "欧美主流",
    options: [
      {
        id: "western-2d-fairytale",
        label: "欧美童话2D手绘",
        summary: "流畅曲线、饱满色彩、童话华丽感，适合公主、动物、城堡和故事场景。",
        styleName: "欧美童话2D手绘",
        styleCategory: "western 2D fairytale hand-drawn animation",
        reason: "适合想要更华丽、更有童话舞台感的儿童作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用饱满但不刺眼的主色，亮部柔和，暗部干净。",
        compositionDirection: "用优雅曲线和大背景形状把主角包围起来。",
      },
      {
        id: "western-3d-cartoon",
        label: "3D卡通写实",
        summary: "圆润体块、柔和材质、真实光影，适合动物、玩具、车辆、人物角色。",
        styleName: "3D卡通写实",
        styleCategory: "soft 3D cartoon realism",
        reason: "适合主体明确、想要立体可爱完成效果的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用柔和材质色、环境光和清楚高光，让形体更圆润。",
        compositionDirection: "保持原来主体关系，通过景深和投影建立前后空间。",
      },
      {
        id: "american-cartoon",
        label: "美式卡通",
        summary: "极简线条、大头比例、高饱和撞色，适合搞怪、动作、表情夸张作品。",
        styleName: "美式卡通",
        styleCategory: "bold American cartoon",
        reason: "适合线条夸张、表情明显、动作感强的儿童作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用高饱和撞色，但主色要稳定，避免所有颜色都抢眼。",
        compositionDirection: "用大形状和强对比把主要角色推到画面前面。",
      },
      {
        id: "vintage-illustration",
        label: "美式复古插画",
        summary: "油画质感、暖棕复古色、人物写实大气，适合大场景和叙事作品。",
        styleName: "美式复古插画",
        styleCategory: "vintage golden-age illustration",
        reason: "适合需要氛围、故事和复古色调的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "用暖棕、奶油白、深绿和柔红形成复古统一感。",
        compositionDirection: "用大块明暗关系稳定画面，让主体和背景分层。",
      },
      {
        id: "comic-hero",
        label: "美式漫画",
        summary: "硬朗粗线、强明暗、速度线，适合英雄、怪兽、战斗、运动主题。",
        styleName: "美式漫画",
        styleCategory: "bold western comic-book illustration",
        reason: "适合动作强、角色有力量感或怪兽英雄主题的画。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用强明暗和鲜明主色，黑色只用于强调，不覆盖原细节。",
        compositionDirection: "用斜线动势和大对比增强冲击力。",
      },
    ],
  },
  {
    label: "国风画风",
    options: [
      {
        id: "cn-gongbi",
        label: "国风工笔",
        summary: "细腻线条、淡染花鸟山水、精致素雅，适合花鸟、人物、古风主题。",
        styleName: "国风工笔",
        styleCategory: "Chinese gongbi fine-line painting",
        reason: "适合细节多、线条清楚、花鸟或古风主题的儿童作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用淡染色、浅青绿、胭脂和米白，颜色轻薄透明。",
        compositionDirection: "用留白和细线组织空间，让主体更雅致。",
      },
      {
        id: "cn-ink",
        label: "水墨国风",
        summary: "水墨晕染、留白写意、黑白灰层次，适合山水、动物、植物和诗意画面。",
        styleName: "水墨国风",
        styleCategory: "Chinese ink wash painting",
        reason: "适合安静、自然、观察类或留白较多的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "以墨色和浅淡色为主，少量点色用于主角。",
        compositionDirection: "用留白和墨色浓淡分出前中后景。",
      },
      {
        id: "cn-guochao",
        label: "新国潮平涂",
        summary: "传统纹样加现代高饱和色，适合节日、神话、动物、装饰性作品。",
        styleName: "新国潮平涂",
        styleCategory: "modern Chinese guochao flat illustration",
        reason: "适合画面有装饰感、动物、神话或节日主题的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用朱红、青绿、金黄、深蓝等现代国潮色组合。",
        compositionDirection: "用对称、重复和纹样边框增强画面完整度。",
      },
      {
        id: "cn-dunhuang",
        label: "敦煌壁画风",
        summary: "矿物颜料、浓烈撞色、古典神话氛围，适合飞天、神话、舞蹈和装饰画。",
        styleName: "敦煌壁画风",
        styleCategory: "Dunhuang mural inspired mineral color",
        reason: "适合神话、人物、动物、舞蹈或装饰性强的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用矿物感青绿、赭石、金黄、朱红，颜色厚重但不覆盖原线。",
        compositionDirection: "用飘带和云纹形成视线流动，补足画面空处。",
      },
    ],
  },
  {
    label: "其他特色",
    options: [
      {
        id: "oil-texture",
        label: "油画肌理",
        summary: "画布颗粒、厚重颜料、氛围浓郁，适合风景、人物、静物和大色块作品。",
        styleName: "油画肌理",
        styleCategory: "oil painting texture",
        reason: "适合颜色面积大、需要更强氛围和材质的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用厚重色层和统一光源，主色和暗部形成稳定关系。",
        compositionDirection: "用大块明暗和背景色层整理画面重心。",
      },
      {
        id: "pixel-art",
        label: "像素画风",
        summary: "方块色块、复古游戏质感，适合怪兽、建筑、游戏、机器人和小动物。",
        styleName: "像素画风",
        styleCategory: "pixel art game illustration",
        reason: "适合形状明确、主题有游戏感或小图标感的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用有限色板和清楚色块，避免复杂渐变。",
        compositionDirection: "用网格感和重复块面组织画面。",
      },
      {
        id: "clay-stop-motion",
        label: "黏土定格",
        summary: "立体黏土、哑光材质、手作质感，适合动物、玩具、人物和童趣场景。",
        styleName: "黏土定格",
        styleCategory: "clay stop-motion handmade scene",
        reason: "适合可爱角色、动物、玩具感和童趣主题的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用哑光黏土色、柔和阴影和少量高饱和点缀。",
        compositionDirection: "用立体前后关系和软投影增强空间。",
      },
      {
        id: "minimal-flat",
        label: "极简扁平",
        summary: "简约几何、无渐变、无阴影，适合图形清楚、想要干净现代感的作品。",
        styleName: "极简扁平",
        styleCategory: "minimal flat geometric illustration",
        reason: "适合简单主体、几何形、标志感或留白多的作品。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用两到三种主色，色块清楚，不做复杂光影。",
        compositionDirection: "用对齐、重复和大留白建立现代秩序感。",
      },
      {
        id: "gothic-dark",
        label: "哥特暗黑",
        summary: "低饱和冷色、尖锐线条、压抑光影，适合城堡、怪兽、万圣节和暗色幻想。",
        styleName: "哥特暗黑",
        styleCategory: "soft gothic dark fantasy illustration",
        reason: "适合怪兽、城堡、夜晚、魔法或暗色幻想主题，但需要保持儿童友好。",
        sceneDirection: "先分析孩子画了什么主题和内容，只添加与原画内容直接相关的背景和故事元素。如果孩子画的是战争场景，就添加战场、防御工事、军事装备等战争元素。如果画的是花朵，就添加花园、草地、昆虫等自然元素。绝不添加与原画主题无关的通用背景（如无关的风景、白云、太阳、草地等）。",
        colorDirection: "使用低饱和紫、蓝灰、黑褐和小面积暖光。",
        compositionDirection: "用尖形轮廓和明暗聚焦主角，背景保持可读。",
      },
    ],
  },
];

const styleOptions = styleGroups.flatMap((group) => group.options);

function getStyleOption(styleId) {
  return styleOptions.find((option) => option.id === styleId) || styleOptions[0];
}

const tagText = {
  detailed: "\u7ebf\u6761\u7ec6\u8282\u8f83\u591a",
  simple: "\u7ebf\u6761\u8f83\u7b80\u6d01",
  colorful: "\u8272\u5f69\u8868\u8fbe\u660e\u663e",
  lineArt: "\u9ed1\u767d\u7ebf\u7a3f",
  portrait: "\u753b\u9762\u504f\u7eb5\u5411",
  landscape: "\u753b\u9762\u504f\u6a2a\u5411",
  left: "\u4e3b\u4f53\u504f\u5de6",
  right: "\u4e3b\u4f53\u504f\u53f3",
  top: "\u4e3b\u4f53\u504f\u4e0a",
  bottom: "\u4e3b\u4f53\u504f\u4e0b",
  centered: "\u4e3b\u4f53\u6bd4\u8f83\u5c45\u4e2d",
  sparse: "\u7559\u767d\u8f83\u591a",
  full: "\u753b\u9762\u8f83\u6ee1",
  strongContrast: "\u660e\u6697\u5bf9\u6bd4\u5f3a",
  softContrast: "\u660e\u6697\u6bd4\u8f83\u67d4\u548c",
};

const teacherCopies = [
  "\u8fd9\u5f20\u4f5c\u54c1\u7ebf\u6761\u89c2\u5bdf\u5f88\u8ba4\u771f\uff0c\u7ec6\u8282\u5df2\u7ecf\u5f88\u591a\u4e86\u3002\u4e0b\u4e00\u6b65\u53ef\u4ee5\u628a\u4e3b\u4f53\u518d\u7a81\u51fa\u4e00\u70b9\uff0c\u8ba9\u5b69\u5b50\u4e00\u773c\u770b\u5230\u753b\u9762\u4e3b\u89d2\u3002",
  "\u8fd9\u5f20\u4f5c\u54c1\u7684\u989c\u8272\u5f88\u6709\u60c5\u7eea\uff0c\u5b69\u5b50\u5df2\u7ecf\u5728\u7528\u8272\u5f69\u8bb2\u6545\u4e8b\u3002\u4e0b\u4e00\u6b65\u53ef\u4ee5\u6574\u7406\u51b7\u6696\u548c\u660e\u6697\uff0c\u8ba9\u753b\u9762\u66f4\u6709\u5c42\u6b21\u3002",
  "\u8fd9\u5f20\u4f5c\u54c1\u7559\u767d\u6bd4\u8f83\u591a\uff0c\u60f3\u6cd5\u8fd8\u6709\u7ee7\u7eed\u5c55\u5f00\u7684\u7a7a\u95f4\u3002\u53ef\u4ee5\u5f15\u5bfc\u5b69\u5b50\u8865\u4e00\u4e2a\u5c0f\u6545\u4e8b\u5143\u7d20\uff0c\u8ba9\u753b\u9762\u66f4\u5b8c\u6574\u3002",
  "\u8fd9\u5f20\u4f5c\u54c1\u753b\u5f97\u5f88\u6295\u5165\uff0c\u7ebf\u6761\u548c\u6697\u90e8\u6bd4\u8f83\u96c6\u4e2d\u3002\u4e0b\u4e00\u6b65\u53ef\u4ee5\u8ba9\u4e3b\u89d2\u548c\u80cc\u666f\u62c9\u5f00\u5173\u7cfb\uff0c\u753b\u9762\u4f1a\u66f4\u6e05\u723d\u3002",
  "\u8fd9\u5f20\u4f5c\u54c1\u7684\u91cd\u5fc3\u6709\u4e00\u70b9\u504f\uff0c\u53ef\u4ee5\u4fdd\u7559\u5b69\u5b50\u7684\u8868\u8fbe\uff0c\u518d\u7528\u51e0\u6761\u8f85\u52a9\u7ebf\u628a\u753b\u9762\u7a33\u5b9a\u4e0b\u6765\u3002",
  "\u8fd9\u5f20\u4f5c\u54c1\u5df2\u7ecf\u6709\u6e05\u695a\u7684\u4e3b\u89d2\u548c\u753b\u9762\u65b9\u5411\u3002\u4e0b\u4e00\u6b65\u628a\u91cd\u590d\u7684\u5f62\u72b6\u3001\u989c\u8272\u6216\u7ebf\u6761\u6574\u7406\u6210\u8282\u594f\uff0c\u4f5c\u54c1\u4f1a\u66f4\u5b8c\u6574\u3002",
];

const dynamicText = {
  contrastLow: "\u4e3b\u89d2\u548c\u80cc\u666f\u5dee\u522b\u4e0d\u591f\uff0c\u53ef\u4ee5\u8ba9\u4e3b\u89d2\u66f4\u6df1\u3002",
  contrastHigh: "\u660e\u6697\u53d8\u5316\u5df2\u7ecf\u660e\u663e\uff0c\u6ce8\u610f\u522b\u8ba9\u6697\u90e8\u62a2\u4e3b\u89d2\u3002",
  contrastColor: "\u7528\u51b7\u6696\u8272\u62c9\u5f00\u4e3b\u89d2\u548c\u80cc\u666f\u3002",
  contrastClear: "\u4e3b\u89d2\u5df2\u7ecf\u7a81\u51fa\uff0c\u53ef\u4ee5\u8ba9\u914d\u89d2\u8f7b\u4e00\u70b9\u3002",
  alignTall: "\u8ba9\u7ad6\u5411\u7ebf\u6761\u987a\u7740\u4e3b\u4f53\u65b9\u5411\u5ef6\u4f38\u3002",
  alignWide: "\u8ba9\u6a2a\u5411\u5143\u7d20\u627e\u5230\u540c\u4e00\u6761\u79e9\u5e8f\u7ebf\u3002",
  alignCenter: "\u628a\u91cd\u8981\u5143\u7d20\u5411\u89c6\u89c9\u4e2d\u5fc3\u9760\u8fd1\u4e00\u70b9\u3002",
  alignSource: "\u82b1\u854a\u3001\u9053\u8def\u6216\u4eba\u7269\u52a8\u4f5c\u90fd\u4ece\u4e3b\u89d2\u51fa\u53d1\u3002",
  repeatDense: "\u91cd\u590d\u70b9\u7ebf\u5f88\u591a\uff0c\u53ef\u4ee5\u6574\u7406\u758f\u5bc6\u8282\u594f\u3002",
  repeatSparse: "\u53ef\u4ee5\u91cd\u590d\u6dfb\u52a0\u76f8\u4f3c\u5f62\u72b6\uff0c\u8ba9\u753b\u9762\u66f4\u6709\u8282\u594f\u3002",
  repeatColor: "\u91cd\u590d\u4e00\u4e24\u79cd\u4e3b\u8272\uff0c\u753b\u9762\u4f1a\u66f4\u7edf\u4e00\u3002",
  repeatLine: "\u628a\u6700\u6709\u8da3\u7684\u7ebf\u6761\u91cd\u590d\u4e09\u6b21\uff0c\u5f62\u6210\u8282\u594f\u3002",
  closeMain: "\u76f8\u5173\u5143\u7d20\u9760\u8fd1\u4e3b\u89d2\uff0c\u5173\u7cfb\u4f1a\u66f4\u6e05\u695a\u3002",
  closeSpace: "\u5c0f\u6545\u4e8b\u5143\u7d20\u8981\u9760\u8fd1\u4e3b\u4f53\uff0c\u4e0d\u8981\u6563\u5728\u7a7a\u767d\u91cc\u3002",
  closeGroup: "\u628a\u540c\u4e00\u7c7b\u4e1c\u897f\u653e\u6210\u4e00\u7ec4\uff0c\u753b\u9762\u66f4\u597d\u8bfb\u3002",
  closePartner: "\u4e3b\u89d2\u65c1\u8fb9\u53ef\u4ee5\u8865\u4e00\u4e2a\u6709\u5173\u8054\u7684\u5c0f\u4f19\u4f34\u3002",
  stepMain: "\u5148\u5708\u51fa\u6700\u60f3\u8ba9\u522b\u4eba\u770b\u5230\u7684\u4e3b\u89d2\uff0c\u5e76\u628a\u8f6e\u5ed3\u52a0\u91cd",
  stepLeft: "\u628a\u504f\u5de6\u7684\u91cd\u70b9\u5f80\u4e2d\u95f4\u5e26\u4e00\u70b9\uff0c\u53f3\u4fa7\u8865\u4e00\u4e2a\u56de\u5e94\u5143\u7d20",
  stepRight: "\u628a\u504f\u53f3\u7684\u91cd\u70b9\u5f80\u4e2d\u95f4\u5e26\u4e00\u70b9\uff0c\u5de6\u4fa7\u8865\u4e00\u4e2a\u56de\u5e94\u5143\u7d20",
  stepVertical: "\u628a\u4e0a\u65b9\u548c\u4e0b\u65b9\u7684\u5143\u7d20\u8fde\u8d77\u6765\uff0c\u753b\u9762\u66f4\u7a33",
  stepSpace: "\u4fdd\u7559\u5927\u7559\u767d\uff0c\u5728\u4e3b\u89d2\u9644\u8fd1\u52a0\u4e00\u4e2a\u5c0f\u6545\u4e8b",
  stepReduce: "\u51cf\u5c11\u540c\u4e00\u533a\u57df\u7684\u91cd\u7ebf\uff0c\u8ba9\u4e3b\u89d2\u66f4\u6e05\u695a",
  stepColor: "\u9009 2-3 \u4e2a\u4e3b\u8272\u91cd\u590d\u4f7f\u7528\uff0c\u51b7\u6696\u66f4\u7edf\u4e00",
  stepLine: "\u6574\u7406\u7ebf\u6761\u65b9\u5411\uff0c\u8ba9\u4e3b\u8981\u7ebf\u6761\u8ddf\u7740\u4e3b\u89d2\u8d70",
  stepLayer: "\u7ed9\u80cc\u666f\u52a0\u4e00\u6d45\u4e00\u6df1\u4e24\u5c42\uff0c\u4e3b\u89d2\u4f1a\u66f4\u7a81\u51fa",
  stepProp: "\u5728\u4e3b\u89d2\u65c1\u8fb9\u52a0\u4e00\u4e2a\u6709\u5173\u8054\u7684\u5c0f\u9053\u5177\u6216\u5c0f\u89d2\u8272",
  stepRepeat: "\u628a\u76f8\u4f3c\u5f62\u72b6\u91cd\u590d\u4e09\u6b21\uff0c\u5f62\u6210\u753b\u9762\u8282\u594f",
  stepGroup: "\u68c0\u67e5\u5143\u7d20\u662f\u5426\u6210\u7ec4\uff1a\u4e3b\u89d2\u4e00\u7ec4\uff0c\u80cc\u666f\u4e00\u7ec4\uff0c\u6545\u4e8b\u4e00\u7ec4",
};

const defaultAnalysis = {
  teacherCopy: copy.teacherCopy,
  tags: [tagText.lineArt, tagText.detailed, tagText.portrait, tagText.centered],
  principles: [
    {
      label: "\u5bf9\u6bd4",
      color: "red",
      text: "\u4e3b\u82b1\u6df1\u4e00\u4e9b\uff0c\u679d\u53f6\u6d45\u4e00\u4e9b\u3002",
    },
    {
      label: "\u5bf9\u9f50",
      color: "orange",
      text: "\u82b1\u854a\u4ece\u82b1\u5fc3\u51fa\u53d1\u66f4\u7a33\u5b9a\u3002",
    },
    {
      label: "\u91cd\u590d",
      color: "purple",
      text: "\u70b9\u3001\u7ebf\u3001\u53f6\u8109\u6709\u8282\u594f\u3002",
    },
    {
      label: "\u4eb2\u5bc6",
      color: "#E07B39",
      text: "\u82b1\u3001\u53f6\u3001\u82b1\u82de\u5404\u81ea\u6210\u7ec4\u3002",
    },
  ],
  nextSteps: [
    "\u52a0\u91cd\u4e3b\u82b1\u8f6e\u5ed3\uff0c\u660e\u786e\u5927\u82b1\u7684\u89c6\u89c9\u4e2d\u5fc3",
    "\u6574\u7406\u82b1\u854a\u65b9\u5411\uff0c\u6cbf\u5782\u76f4\u91cd\u5fc3\u7ebf\u4e0b\u5ef6\u4f38",
    "\u8865\u4e00\u4e2a\u9760\u8fd1\u679d\u53f6\u7684\u5c0f\u6545\u4e8b\u5143\u7d20",
  ],
  skeleton: {
    visualCenter: copy.visualCenterHint,
    flowLine: copy.flowLineHint,
    balance: copy.balanceHint,
    depth: copy.depthHint,
  },
  colorPlan: {
    summary:
      "\u7528\u6696\u91d1\u8272\u505a\u4e3b\u89d2\u4eae\u70b9\uff0c\u6df1\u84dd\u548c\u7ea2\u8272\u62c9\u5f00\u89d2\u8272\u6027\u683c\uff0c\u8ba9\u7ebf\u7a3f\u53d8\u5f97\u66f4\u5b8c\u6574\u3002",
    palette: [
      { hex: "#F4C86A", name: "\u6696\u91d1\u8272", usage: "\u4e3b\u89d2\u5934\u53d1\u548c\u9ad8\u5149" },
      { hex: "#F7D7C4", name: "\u67d4\u80a4\u8272", usage: "\u8138\u90e8\u548c\u624b\u90e8\u5e95\u8272" },
      { hex: "#1D2B4D", name: "\u6df1\u84dd\u8272", usage: "\u670d\u88c5\u548c\u91cd\u8272\u533a" },
      { hex: "#6F92C9", name: "\u773c\u775b\u84dd", usage: "\u773c\u775b\u3001\u5b9d\u77f3\u548c\u5c0f\u88c5\u9970" },
      { hex: "#C83E45", name: "\u70b9\u7f00\u7ea2", usage: "\u914d\u89d2\u670d\u88c5\u6216\u9970\u54c1" },
    ],
    focus: [
      "\u5148\u786e\u5b9a\u4e3b\u89d2\u5934\u53d1\u548c\u773c\u775b\u7684\u8272\u5f69\u6027\u683c\u3002",
      "\u670d\u88c5\u7528\u6df1\u8272\u538b\u4f4f\u91cd\u5fc3\uff0c\u8138\u90e8\u7559\u5f97\u5e72\u51c0\u3002",
      "\u5c0f\u89d2\u8272\u7528\u4e0d\u540c\u8272\u76f8\u533a\u5206\uff0c\u4f46\u9971\u548c\u5ea6\u4e0d\u8981\u592a\u6563\u3002",
    ],
    steps: [
      "\u5148\u94fa\u5934\u53d1\u3001\u76ae\u80a4\u3001\u8863\u670d\u7684\u5927\u8272\u5757\u3002",
      "\u518d\u52a0\u5934\u53d1\u6697\u90e8\u548c\u8863\u670d\u6298\u75d5\u7684\u6df1\u8272\u3002",
      "\u6700\u540e\u70b9\u773c\u775b\u9ad8\u5149\u3001\u5b9d\u77f3\u548c\u5c0f\u914d\u4ef6\u4eae\u70b9\u3002",
    ],
  },
};

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function uniqueSteps(steps) {
  return Array.from(new Set(steps)).slice(0, 3);
}

function textNeedsFallback(value) {
  if (typeof value !== "string") return true;
  const text = value.trim();
  if (!text) return true;
  if (/[�锟]|[鑱鐢鍥鏃绔閫浣鍦涓瀛棰璧绾鏉骞]/.test(text)) return true;

  const questionMarks = (text.match(/\?/g) || []).length;
  if (questionMarks >= 3 && questionMarks / Math.max(text.length, 1) > 0.08) return true;

  const hasHan = /[\u4e00-\u9fff]/.test(text);
  const latinLetters = (text.match(/[A-Za-z]/g) || []).length;
  return !hasHan && latinLetters > 12;
}

function safeGuideText(value, fallback) {
  return textNeedsFallback(value) ? fallback : value.trim();
}

function getDisplayStyleName(styleGuide) {
  return safeGuideText(styleGuide?.styleName, "自动匹配画风");
}

function getStyleFitReason(styleGuide) {
  const styleName = getDisplayStyleName(styleGuide);
  return safeGuideText(
    styleGuide?.reason,
    `这张画已经有清楚的主体和童趣线条，适合用「${styleName}」在不改变原稿的基础上补充环境、层次和色彩。`,
  );
}

function buildFormLawText(analysis) {
  const fallbackPrinciples = new Map(
    defaultAnalysis.principles.map((item) => [item.label, item.text]),
  );
  const principleMap = new Map(
    Array.isArray(analysis?.principles)
      ? analysis.principles.map((item) => [
          item.label,
          safeGuideText(item.text, fallbackPrinciples.get(item.label) || ""),
        ])
      : [],
  );

  const contrast = principleMap.get("对比") || fallbackPrinciples.get("对比");
  const alignment = principleMap.get("对齐") || fallbackPrinciples.get("对齐");
  const repetition = principleMap.get("重复") || fallbackPrinciples.get("重复");
  const proximity = principleMap.get("亲密") || fallbackPrinciples.get("亲密");

  return `用"对比"突出主角：${contrast} 用"对齐"稳定画面：${alignment} 用"重复"形成节奏：${repetition} 用"亲密"整理关系：${proximity}`;
}

function buildProfessionalGuidePlan(analysis, styleGuide) {
  return [
    {
      label: "构图",
      title: "稳住视觉中心",
      text: safeGuideText(
        styleGuide?.compositionDirection || analysis?.skeleton?.visualCenter,
        "保留孩子已经画出的主体位置，把最大的角色或最重要的物体作为视觉中心，再用前景、中景、背景把画面连接起来。",
      ),
    },
    {
      label: "内容",
      title: "补完整故事场景",
      text: safeGuideText(
        styleGuide?.sceneDirection,
        '围绕原画里已经出现的角色、动物或物体，补充与它们直接相关的地点、天气、道具和小情节，让画面从「单个元素」变成「正在发生的故事」。不引入与原画内容无关的元素。',
      ),
    },
    {
      label: "色彩",
      title: "统一主色和亮点",
      text: safeGuideText(
        styleGuide?.colorDirection || analysis?.colorPlan?.summary,
        "先确定一组主色，再用少量高亮色做重点；暗部不要全部用黑色，可以用同色系加深，让孩子原来的线条和颜色仍然被看见。",
      ),
    },
    {
      label: "形式美",
      title: "对比、对齐、重复、亲密",
      text: buildFormLawText(analysis),
    },
  ];
}

function buildStrengthInsights(analysis) {
  const tags = Array.isArray(analysis?.tags) ? analysis.tags.join(" ") : "";
  const hasDetail = /细节|线条|反复|清楚|丰富/.test(tags);
  const isSimple = /简洁|留白|简单/.test(tags);
  const isColorful = /色彩|颜色|彩色/.test(tags);
  const isLineArt = /线稿|黑白/.test(tags);
  const isLandscape = /横向/.test(tags);
  const isPortrait = /纵向/.test(tags);
  const isCentered = /居中|中心/.test(tags);
  const isSideWeighted = /偏左|偏右|偏上|偏下/.test(tags);

  // Psychology insights
  const psychInsight = isColorful
    ? `孩子已经在用颜色表达情绪和感受。儿童天生右脑发达，图形思维和直觉能力远强于语言表达。色彩就是孩子的情绪语言——不用问他「画的是什么」，而是去感受他通过颜色传递的心情。`
    : isLineArt
      ? `孩子当前更专注于造型和结构，右脑正在用线条搭建自己的表达系统。黑白不是缺失，而是孩子在某个阶段全力以赴投入造型探索的表现。这本身就是一种深度学习状态。`
      : `孩子的画面中已经出现了自己的表达逻辑。儿童绘画不是技能训练，而是右脑通过图形、色彩、符号在诉说内心世界。每一笔都是孩子潜意识的语言投射。`;

  // Development insights
  const devInsight = isCentered
    ? `主体居中、稳定，说明孩子已经建立了一定的空间秩序感。这个阶段的孩子开始能够组织画面元素，知道自己最想让别人先看到哪里——这是构图意识的萌芽。`
    : isSideWeighted
      ? `主体有明显的位置偏好，这不是「画偏了」，而是孩子在用自己的方式安排画面。可以问问孩子为什么把它放在这里——这个「为什么」常常能带出意想不到的故事。`
      : isLandscape
        ? `横向构图适合铺开场景，说明孩子可能更愿意表达一段正在发生的事情。这个阶段的孩子开始关注事件、关系和叙事，而不只是单个物体。`
        : isPortrait
          ? `纵向构图通常意味着孩子在关注某个主体的形象和状态。这是人物意识、自我认知发展的表现，值得家长仔细观察。`
          : `画面已经有了自己的观看顺序。孩子正处于绘画发展的重要阶段，每一个看似随意的安排背后都有他的思考和选择。`;

  // Family education insights
  const familyInsight = hasDetail
    ? `作品线条观察认真、细节丰富——这在蔺老师家庭美育体系中是「过程投入」的明确信号。孩子可能在画画时进入了心流状态：全神贯注、忘记时间、自我驱动。家长要做的不是急着纠正，而是保护这份专注力，这是比「画得像」更珍贵的品质。`
    : isSimple
      ? `画面简洁不等于「画得少」。孩子能够抓住最核心的轮廓和关系，这是一种概括能力。在优势视角下，这可能是「成长型优势」——孩子有潜力，只是需要更多机会和自由空间去发展。不要急着让孩子填满画面，给孩子时间。`
      : `可以继续观察孩子在画中反复出现的主题、形状或颜色。这些「自然而然、反复出现」的绘画行为，按照蔺老师家庭美育体系，正是孩子天赋的线索。从这些线索出发，提供环境让孩子有更多机会去深化，天赋就能变成真正的优势。`;

  // Observable clues in the artwork
  const clueText = [
    isColorful ? "🎨 色彩感受力：用颜色区分角色、空间和情绪" : null,
    hasDetail ? "🔍 细节观察力：愿意反复处理线条和细节" : null,
    isCentered ? "🎯 主体意识：已经知道画面的视觉中心在哪" : null,
    isSideWeighted ? "📍 空间安排：有自己的位置偏好和叙事逻辑" : null,
    isSimple ? "✏️ 概括能力：能抓住最重要的轮廓和关系" : null,
    isLineArt ? "📐 造型专注：现阶段全力以赴投入结构探索" : null,
    isLandscape ? "📖 叙事倾向：更关注事件和关系的表达" : null,
    isPortrait ? "👤 人物关注：对主体形象和状态很在意" : null,
  ].filter(Boolean).slice(0, 4);

  return {
    psychology: psychInsight,
    development: devInsight,
    familyEducation: familyInsight,
    clues: clueText.length ? clueText : [
      "🌈 自主表达：画面里已经有孩子自己的选择和安排",
      "🖐️ 手眼协调：线条控制正在发展中",
      "💡 故事思维：画面背后有孩子想说的故事",
      "❤️ 内在驱动：画画本身就是孩子享受的事情",
    ],
  };
}

function buildStrengthActions() {
  return [
    {
      step: "先看见孩子，再看见作品",
      detail: `拿到孩子的画，第一句话不要说「画的是什么」或「真棒」。试着说：「可以给我介绍一下你的画吗？」或者「我看到这里你画得特别仔细，看来它对你很重要。」先让孩子讲画里的故事，你只是在听。`,
    },
    {
      step: "停止一种干扰",
      detail: `找一个你平时习惯但对孩子其实是干扰的行为，本周刻意停止它。比如：不说「像不像」、不拿别人家孩子比较、不催他快点画完、不在他画画时打断问东问西。不给孩子简笔画或填色书。观察孩子有什么变化。`,
    },
    {
      step: "用五种方式鼓励一次",
      detail: `①描述你看到的：「你这张画里用了三种不同的绿色」；②指出进步：「这次的人物比上次多了手指」；③问过程：「你画这个地方的时候在想什么？」；④表达感受：「看到这张画让我觉得很温暖」；⑤展示尊重：把孩子的画装裱起来，像对待艺术家的作品一样。`,
    },
    {
      step: "用优势视角观察一次",
      detail: `选一个孩子画画的时间，用四个线索悄悄观察：①他是不是主动想画（事前渴望）？②画的过程中是否专注投入（过程投入）？③画完后的表情和状态（事后满足）？④他哪里做得比上次好（成功体验）？记录下你观察到的。`,
    },
    {
      step: "建立记录思维",
      detail: `用手机拍下孩子这周的画，标注日期和一两句孩子的讲述。不要评价好坏，只做记录。关注孩子反复出现的主题、颜色、形状——这些「自然而然、反复出现」的内容正是天赋线索。几个月后回头看，你会看到孩子从一颗种子开始，向阳而生、逐光而行的轨迹。`,
    },
  ];
}

function buildTalentProfile(analysis, aiTalentName = null) {
  const tags = Array.isArray(analysis?.tags) ? analysis.tags.join(" ") : "";
  const hasDetail = /细节|线条|反复|清楚|丰富/.test(tags);
  const isColorful = /色彩|颜色|彩色/.test(tags);
  const isLandscape = /横向/.test(tags);
  const isPortrait = /纵向/.test(tags);
  const isSimple = /简洁|留白|简单/.test(tags);
  const isLineArt = /线稿|黑白/.test(tags);
  const isCentered = /居中|中心/.test(tags);
  const isSideWeighted = /偏左|偏右|偏上|偏下/.test(tags);

  // 蔺老师家庭美育·12种绘画天赋 — 官方完整版
  const talentDB = {
    emotional: {
      name: "情感能力",
      icon: "💛",
      traits: "情感表达丰富、画面有情绪氛围、角色有情感互动",
      manifestations: [
        "画面中人物有生动的表情：开心的笑容、伤心的眼泪、生气的皱眉——情绪真实可感",
        "画面有明显的情绪氛围：温暖的阳光色调、阴郁的灰暗天空——孩子在用画面「说心情」",
        "角色之间有情感互动：牵手、拥抱、一起玩耍——孩子在表达关系和连接",
        "画画时有明显的情绪投入：画开心的事会笑，画难过的事会安静下来",
        "画完后情绪状态明显改变——画画是孩子的情感出口，表达即疗愈",
      ],
      desc: "孩子通过绘画自然地表达和处理情感。在蔺老师家庭美育体系中，「表达即疗愈，共鸣即疗愈」——画画是孩子天生的情感语言。课程强调右脑是情绪脑，艺术是打开右脑的钥匙。孩子不一定能用语言说清感受，但可以在画里尽情倾诉。",
      growth: [
        "不评判画中的负面情绪——愤怒、悲伤、恐惧的画面都是健康的表达出口。课程强调「接纳任何内容」。",
        "用「可以给我介绍一下你的画吗？」代替「你画的是什么？」——打开对话而不是审问。",
        "在孩子情绪激动时，先让他画画（右脑方式），等情绪平复后再讲道理（左脑方式）。",
        "对他的情感表达给予共鸣：「我看到你画里这个人笑得很开心，他遇到了什么好事？」",
      ],
      careers: "心理咨询师、教师、社会工作者、演员、导演、护士、医生、人力资源、客户关系",
      byAge: {
        "3-5岁": "这个阶段孩子刚开始用图形表达情感。多读绘本讨论角色感受——「你觉得他为什么哭了？」让他知道画画可以表达任何心情。",
        "5-8岁": "鼓励画「情绪日记」：今天开心画一张、生气画一张。讨论画中角色的感受：「这个人在想什么？」",
        "8岁+": "可以学习用艺术表达复杂情感——不只快乐和悲伤，还有矛盾、怀念、期待。带他看表现主义绘画，感受色彩和笔触中的情绪。",
      },
    },
    focus: {
      name: "专注力",
      icon: "🎯",
      traits: "深度沉浸、心流体验、画面有大量精细细节",
      manifestations: [
        "画面有大量精细细节：人物的头发丝、衣服的褶皱、树叶的纹理——每一处都花了时间",
        "画面完整度远超同龄人：不是潦草几笔，而是认真画完了每一个部分",
        "画画时可以长时间不被打扰——喊他吃饭都听不见，完全沉浸其中",
        "有修改和完善的痕迹：擦了画、画了擦，直到自己满意为止",
        "进入心流状态：全神贯注、忘记时间、自我意识消失、有内在奖赏感",
      ],
      desc: "孩子画画时能够进入深度专注的心流状态。蔺老师课程详细描述了心流体验的六个标准：全神贯注、行动和注意力融合、自我意识消失、有自我控制感、时间过得很快、有内在奖赏感。专注力是孩子最珍贵的学习品质，比任何技巧都重要。",
      growth: [
        "保护专注时刻：孩子画画时不要打断（不递水、不问问题、不夸赞）。课程强调「过程投入」是最重要的观察线索。",
        "提供大块不被打扰的时间：周末安排1-2小时的自由创作时段，全家保持安静。",
        "观察并记录孩子的心流状态：什么主题最容易让他进入专注？什么时间？什么环境？",
        "不追求「全面发展」——孩子在某方面极度专注时，其他能力暂时放缓是正常的。课程中「10岁前只画黑白画，12岁后色彩天分也很好」的案例说明了这一点。",
      ],
      careers: "科学家、程序员、外科医生、音乐家、棋手、研究员、工匠、精密制造工程师",
      byAge: {
        "3-5岁": "只要他还在专注地画，就不要打断。哪怕画得「不好看」，专注本身比结果重要。给大纸，越小的孩子越需要大纸来沉浸。",
        "5-8岁": "开始观察他什么时候最容易进入心流——什么主题、什么工具、什么时间。记录下来，这就是他的「专注配方」。",
        "8岁+": "引入需要持续专注的复杂项目：一幅需要画好几天的作品、一个系列创作。让他体验「深度工作」的成就感。",
      },
    },
    endurance: {
      name: "耐力和持续力",
      icon: "⏳",
      traits: "坚持完成、不轻易放弃、画面规模大完成度高",
      manifestations: [
        "画面规模大、内容多、完成度高——一张纸上画了几十个人物、一整个城市、一场完整的战争",
        "有反复修改和完善的痕迹——不是画坏了就放弃，而是想办法修好或重来",
        "可以分多次完成一幅大型作品——今天画一部分，明天接着画，后天继续完善",
        "遇到困难不轻易放弃：画错了不是撕掉重来，而是想办法补救和调整",
        "对自己有完成标准和要求——不是家长说「画完了」才算完，而是自己觉得满意了才停笔",
      ],
      desc: "孩子面对绘画任务时展现出坚持到底的品质。蔺老师课程强调「过程投入」线索——孩子愿意花时间把一件事做到自己满意。耐力和持续力不是天赋中最耀眼的那一个，但它是所有天赋转化为优势的「传送带」——没有它，再好的天赋也只能停留在表面。",
      growth: [
        "肯定过程而非结果：「我看到你花了很长时间把这一块修好，你真的很坚持」——比「画得真好」更有力量。",
        "设置「大项目」：鼓励孩子画一幅需要持续一周的作品，每天画一部分，让他体验累积的成就感。",
        "当他遇到困难想放弃时，不急着帮他解决——先问「你觉得可以怎么补救？」课程强调「让孩子有自我控制感」。",
        "展示你自己的坚持故事：让孩子知道爸爸妈妈也在学习、在坚持、在不放弃。课程说「活成孩子的榜样」是最好的教育。",
      ],
      careers: "运动员、企业家、研究人员、作家、项目经理、建筑师、外科医生、极限运动者",
      byAge: {
        "3-5岁": "不催促孩子「快点画完」。他画多久都行。如果一幅画分几次完成，每次都帮他收好，下次拿出来继续。",
        "5-8岁": "引入「系列创作」概念：画一本小书、一组主题画。让他体验从开始到完成的完整过程。",
        "8岁+": "可以挑战更长期的项目：一个月完成一幅大作品。过程比结果重要——记录每一步的变化，回头看时会很震撼。",
      },
    },
    story: {
      name: "故事天赋",
      icon: "📖",
      traits: "画面有叙事性、场景有情节、角色有互动关系",
      manifestations: [
        "画面不是静态肖像，而是「正在发生的事件」——有人在做什么、发生了什么、接下来会怎样",
        "有角色、场景、情节的完整故事结构：能看到起因、经过和可能的结局",
        "常出现连环画/分镜布局/对话气泡——孩子在用画笔做「导演」",
        "人物之间有互动关系：一个人在给另一个人东西、两个人在对话、一群人在合作",
        "边画边讲故事：画一笔解释「这是谁」「他在干什么」「为什么」——画画和讲故事同步进行",
      ],
      desc: "孩子不是在画单个物体，而是在「导演」一个场景。蔺老师课程中提到「有的孩子边画边讲，甚至手舞足蹈」。课程建议用「谁、何时、何地、与谁、做什么」五个问题引导孩子把故事讲完整。故事天赋意味着孩子具有叙事思维——能看到事件之间的关联和因果。",
      growth: [
        "用「谁、何时、何地、与谁、做什么」五个问题引导他把故事讲完整——但不要在他画画时打断。课程强调「先问故事，再提建议」。",
        "鼓励「连续画面」：今天画第一幕、明天第二幕——这已经是分镜思维的雏形。",
        "把他的画装订成册，写上日期和他口述的故事——这就是孩子自己创作的「绘本」。",
        "提供大纸或卷纸，让故事有足够空间展开。越小的孩子越需要大纸——课程强调这一点。",
      ],
      careers: "作家、编剧、导演、游戏剧情设计师、记者、广告创意、漫画作者、绘本作家",
      byAge: {
        "3-5岁": "画完后用一句话帮他说出故事：「哇，这个小朋友在公园里放风筝呢！」让他知道画画和讲故事是同一件事。",
        "5-8岁": "鼓励「连环画」：今天画第一幕、明天第二幕。用五个问题引导他说出完整故事。把他的作品装订成册。",
        "8岁+": "引入分镜思维：一个故事需要几个画面？每个画面有什么变化？看优秀绘本讨论作者为什么这样安排画面。",
      },
    },
    design: {
      name: "设计天赋",
      icon: "✏️",
      traits: "改造实物、装饰美化、有独特的审美和创意设计",
      manifestations: [
        "不满足于画事物的「本来面目」——杯子的把手变成龙尾、房子的窗户是心形",
        "有装饰纹样、边框、对称排版——画面有明显的「设计感」",
        "给物体添加自己想象的功能和外观：会飞的汽车、有滑梯的房子、带翅膀的书包",
        "对「美」有自己的标准和坚持——这个颜色必须配那个颜色，这里必须加一个花纹",
        "设计不仅限于画画：做手工、搭配衣服、布置房间——孩子天生是「小设计师」",
      ],
      desc: "孩子不满足于复制现实，总想按自己的想法改造世界。蔺老师课程中描述「有的孩子乐于将看见的物体进行再设计——把蜗牛壳设计成交叉线而不是螺旋线」。这不是「画错了」，而是一种高级思维——孩子不是观察者，而是创造者。课程中的「概念蜗牛」就是设计天赋的体现。",
      growth: [
        "欣赏他的改造而不纠正：当他把鱼画在云上，先问「这条会飞的鱼有什么故事」，而不是说鱼应该在水里。",
        "给出「设计挑战」：设计一辆未来的自行车、设计一个外星人的家——让设计思维有发挥的舞台。",
        "带他看优秀设计：椅子的不同形状、手机按钮的布局——讨论「为什么这样设计」。",
        "提供可组合的材料：纸板、布片、纽扣——让设计从二维走向三维。",
      ],
      careers: "产品设计师、服装设计师、UI/UX设计师、建筑师、工业设计师、平面设计师、舞台美术师",
      byAge: {
        "3-5岁": "给他可组合的材料：纸板、布片、自然材料。鼓励改造日常物品——给杯子画花纹、给纸箱做房子。",
        "5-8岁": "出设计题目：「设计一件不怕雨的衣服」「设计一个外星人的家」。欣赏解决方案而不是评判美丑。",
        "8岁+": "引入设计思维：发现问题→想象方案→画出草图→制作原型。带他看设计博物馆或创客空间。",
      },
    },
    humor: {
      name: "幽默天赋",
      icon: "😄",
      traits: "画面有搞笑情节、夸张造型、让人会心一笑的创意",
      manifestations: [
        "画面中有搞笑情节和荒诞场景：动物穿着人类的衣服上班、香蕉在开演唱会",
        "人物有滑稽夸张的动作或表情：大眼睛瞪得溜圆、嘴巴张得比脸还大",
        "有让人会心一笑的创意：把严肃的事物画得很可爱、把日常场景画得很搞笑",
        "画画时自己会笑——创作过程本身就充满快乐",
        "喜欢画让别人看了也会笑的内容——有意识地在制造幽默效果",
      ],
      desc: "孩子用画笔制造快乐——这是一种高级的社交和情感能力。蔺老师课程强调「接纳恶搞和小动作」——这些行为的背后是心理表达，有积极的心理意义。幽默天赋的孩子通常情商高、人际关系好，他们用笑声连接自己和他人。课程中说「涂鸦就是玩和表达的结合」——幽默天赋把这种「玩」发挥到了极致。",
      growth: [
        "和他一起笑：欣赏他的幽默创意，不把搞笑当作「不正经」。课程强调「接纳任何内容」。",
        "引导他把幽默变成故事：这个搞笑的场景是怎么发生的？接下来会怎样？",
        "给他看优秀的幽默漫画和动画——让他知道「搞笑」也是一种受尊重的艺术形式。",
        "区分幽默和伤害：引导他用幽默连接他人而不是嘲笑他人。课程中的「先保护表达欲，再谈技巧」同样适用。",
      ],
      careers: "喜剧演员、漫画家、动画导演、综艺编剧、广告创意、儿童节目主持人、游戏策划",
      byAge: {
        "3-5岁": "欣赏他的搞笑创意——「这个香蕉在唱歌，太好笑了！」让他知道幽默是受欢迎的。",
        "5-8岁": "和他一起创作搞笑漫画。看优秀的幽默绘本和动画。讨论为什么好笑——培养幽默的自觉性。",
        "8岁+": "学习幽默的结构：反差、夸张、意外。可以尝试创作四格漫画。带他看脱口秀、喜剧电影，讨论幽默技巧。",
      },
    },
    animal: {
      name: "画动物天赋",
      icon: "🐾",
      traits: "对动物有特殊描绘能力和情感连接，动物画得生动传神",
      manifestations: [
        "大量画动物且画得特别生动——不是符号化的「简笔动物」，而是有个性、有神态的",
        "能抓住不同动物的特征：猫的柔软、狗的忠诚、鸟的轻盈——每种动物都各有特点",
        "动物之间有互动和故事：猫在追蝴蝶、狗在等主人、鸟儿在开会",
        "对动物有天然的喜爱和共情——会把动物当作有情感、有性格的角色来画",
        "可能反复画同一种动物，但每次都有新的细节和变化",
      ],
      desc: "孩子与动物有特殊的情感连接。蔺老师课程中提到「孩子会很自然地和一些小动物产生共鸣和共情，画出来的动物也会代表他们自己」「男孩往往喜欢狗，女孩往往喜欢猫」。画动物天赋体现了孩子的观察力、共情力和对生命的热爱。课程中的「共鸣投射」概念——孩子喜欢的动物往往承载了他的自我认同。",
      growth: [
        "带孩子去动物园、自然博物馆——真实的动物观察是最好的老师。带上速写本，当场画下看到的动物。",
        "不只画外观——引导他观察动物的行为：怎么走路、怎么吃东西、怎么互动。课程中「关注细节」的方法用在这里。",
        "如果孩子反复画某一种动物，深入了解它：看纪录片、读相关书籍——课程中的「聚焦型学习」。",
        "鼓励他把动物画成故事角色——不只是画一只猫，而是画「这只猫的一天」。",
      ],
      careers: "动物学家、兽医、野生动物摄影师、动画师（动物角色）、宠物训练师、自然插画师、环保工作者",
      byAge: {
        "3-5岁": "带他去动物园，带上小本子——不是画完整的动物，而是画「兔子的耳朵为什么这么长」。重点是建立「观察→画」的习惯。",
        "5-8岁": "开始做动物观察笔记：今天看到的鸟是什么颜色、怎么飞的。提供动物图鉴和纪录片。",
        "8岁+": "学习基础动物解剖——不是为了画得像，而是为了更好地理解动物。可以尝试画动物漫画、动物科普插图。",
      },
    },
    color: {
      name: "色彩天赋",
      icon: "🎨",
      traits: "用色大胆有个人风格、色彩有情绪表达力、配色和谐",
      manifestations: [
        "用色大胆不受常规约束：天空可以是紫色的、草地可以是橙色的——这不是乱画，是有主见的色彩选择",
        "色彩有情绪表达力：暖色表达开心和热情、冷色表达安静和思考——色彩是孩子的情绪语言",
        "配色和谐有美感：即使颜色很多，画面整体也有统一的调性——这是色彩直觉",
        "选色有主见：不在乎「天是蓝的草是绿的」的常规，坚持自己的色彩感觉",
        "享受调色和色彩实验：喜欢混色、尝试新的颜色搭配、对不同画材的色彩表现力感兴趣",
      ],
      desc: "孩子用色彩思考和表达。蔺老师课程中「有的孩子对色彩敏感而忽略形体」「情绪愉快时画出五彩缤纷的色彩」「情绪激烈时选用大红色」。课程强调色彩是孩子的右脑语言——每一种颜色的选择背后都有情绪和感受。课程中的「象征投射」概念——孩子用颜色表达内心状态。",
      growth: [
        "不规定「天是蓝的草是绿的」——问他「你画这个颜色的时候在想什么？」这比纠正颜色更重要。课程强调「不要用成人眼光判断孩子的画」。",
        "提供丰富画材：水彩的透明感、油画棒的厚重感、彩铅的细腻感——不同材料有不同的色彩表现力。",
        "带他看色彩大师的作品（马蒂斯、莫奈、梵高）——不是临摹，是感受色彩的情绪力量。",
        "在生活中玩色彩游戏：今天的天空是什么颜色？夕阳有多少种红？这片叶子的绿色和你颜料里的绿色有什么不同？",
      ],
      careers: "画家、色彩设计师、室内设计师、时尚设计师、摄影师、美妆师、视觉陈列师、插画师",
      byAge: {
        "3-5岁": "提供基础12色即可——颜色太多反而让孩子选择困难。问他「你最喜欢的颜色是哪个？为什么？」",
        "5-8岁": "提供不同材质的画材，让他感受同一种颜色在不同材料上的差异。玩色彩游戏：今天的天空是什么颜色？",
        "8岁+": "引入基础色彩理论：冷暖色、互补色——但不要变成「规则课」。带他建立「色彩日记」：记录每天看到的颜色搭配。",
      },
    },
    math: {
      name: "数学智能天赋",
      icon: "🔢",
      traits: "画面有精确数量关系、规律性图案和几何排列",
      manifestations: [
        "画面中有精确的数量关系：画了正好7朵花、10个士兵、5层楼——不是随便画，而是有意计数",
        "有规律性图案和几何排列：重复的菱形花纹、间隔相等的条纹、对称的多边形",
        "对比例和数量有天然敏感：人物的手指数量正确、建筑的楼层高度一致",
        "画画时会数数、计算：「我还要画3个窗户」「每排5个，一共4排」",
        "喜欢对称和精确——画面不是随意的，而是经过了「数学规划」",
      ],
      desc: "孩子通过绘画展现了数学思维能力。蔺老师课程虽然主要以美术为切入点，但课程中的「聚焦型学习风格」和结构化思维正是数学智能的体现。课程提到的「有的孩子可以画出形状准确的蜗牛」「关注轮子有几个」——这些都是数学思维在绘画中的自然流露。加德纳多元智能理论也把数学-逻辑智能列为独立维度。",
      growth: [
        "发现并指出他在画中的数学思维：「我注意到你画了正好7朵花，你是数过的吗？」让他意识到这是一种能力。",
        "提供方格纸、圆规、尺子——让数学思维有专业的表达工具。",
        "把数学和画画结合起来：对称画、几何图案设计、等分构图——数学和艺术本是一家。",
        "在日常生活中强化数学感：一起数楼梯、量家具、排列物品——让数学成为生活语言。",
      ],
      careers: "数学家、工程师、程序员、数据分析师、精算师、建筑师、物理学家、密码学家",
      byAge: {
        "3-5岁": "在画画时自然地引入数数：「我们来数数你画了几朵花？」不是教学，是游戏。",
        "5-8岁": "引入方格纸和几何工具。玩对称画游戏。用数学创造图案——「你能画一个6瓣的花吗？」",
        "8岁+": "学习黄金比例、斐波那契数列在艺术中的应用。看埃舍尔的画——数学和艺术的完美结合。",
      },
    },
    logic: {
      name: "逻辑智能天赋",
      icon: "🧠",
      traits: "画面有清晰因果逻辑、事物关系合理、有条理",
      manifestations: [
        "画面有清晰的因果逻辑：因为下雨所以打伞、因为饿了所以在吃东西——不是随意堆砌元素",
        "事物之间有合理的功能和结构关系：房子的门在下面、烟囱在上面、路连接到门口",
        "画面内容有条理不混乱：人物、背景、道具各在其位，不会出现「人比房子大，房子飘在空中」的混乱",
        "画画时喜欢解释「为什么这样」「接下来会怎样」——有强烈的因果思维",
        "关注事物的原理：「这个机器是怎么工作的」「为什么鸟能飞」——不只是画形，而是理解质",
      ],
      desc: "孩子通过绘画展现了逻辑推理能力。蔺老师课程中的「男孩关注轮子有几个、炮管多长、驾驶舱在哪——用画笔理解这个东西是怎么工作的」正是逻辑智能的体现。课程还提到「男孩充满创造性，女孩充满建设性」——这里的「建设性」很大程度上就是逻辑性。逻辑智能让孩子能够理解事物的运行规律，这是科学思维的基石。",
      growth: [
        "陪他讨论画中的逻辑：「为什么这个人站在这里？」「这个机器是怎么运转的？」引导他用语言表达逻辑。",
        "引入简单的因果关系游戏：多米诺骨牌、鲁布·戈德堡机械——让逻辑变得可见。",
        "在画画时引导他「先规划再画」：先用铅笔勾勒布局，再上色——培养逻辑规划习惯。",
        "提供建构类玩具：乐高、立体拼图——逻辑思维在三维空间中得到强化。",
      ],
      careers: "科学家、律师、法官、程序员、侦探、工程师、哲学教授、战略顾问",
      byAge: {
        "3-5岁": "和他讨论画中的简单逻辑：「这个小朋友为什么在撑伞？」帮助他用语言表达因果。",
        "5-8岁": "引导他画「使用说明书」式的画——不只是画一个机器，而是画它怎么操作。",
        "8岁+": "引入思维导图和流程图。学习用画画表达逻辑——「画清楚一个过程的步骤」。",
      },
    },
    spatial: {
      name: "空间智能天赋",
      icon: "🌐",
      traits: "画面有透视感、前后遮挡、远近大小、立体空间",
      manifestations: [
        "画面有透视感和空间深度：近大远小、道路消失在远处——不是平铺，是有空间",
        "有前后遮挡关系：前面的人挡住了后面的人的一部分——理解了物体之间的空间位置",
        "建筑和场景有立体感：画房子不只是一个平面矩形，而是有侧面和顶面的立体结构",
        "能把从不同角度看到的物体画出来——空间思维能力强，能「旋转」脑中的图像",
        "布局有纵深感：前景、中景、背景各有安排，不是所有东西都挤在一个平面上",
      ],
      desc: "孩子能够理解和表现三维空间。蔺老师课程中「有的孩子空间表达能力很强，物体之间的结构表现得很清晰」——这正是空间智能。课程中的「搭建类玩具让孩子空间思维能力得到锻炼，画画的时物体之间的结构都表现得很清晰」案例说明了空间智能是可培养的。在加德纳多元智能理论中，空间智能是最直接关联绘画的天赋。",
      growth: [
        "提供三维建构玩具：乐高、磁力片、立体拼图——在玩中强化空间思维。课程案例中的孩子就是通过搭建提升了空间表现力。",
        "引导他画同一物体从不同角度看到的样子——正面、侧面、俯视——锻炼空间想象力。",
        "带他观察真实的空间关系：站在窗前看近处的树和远处的山，用手比划大小差异。",
        "学习基础透视法——但不要变成「必须这样画」的规则。课程强调「先保护表达欲，再谈技巧」。",
      ],
      careers: "建筑师、飞行员、外科医生、3D建模师、雕塑家、地理学家、航海家、游戏场景设计师",
      byAge: {
        "3-5岁": "提供大块积木和立体拼图。引导他观察空间：「这个积木在前面还是后面？」",
        "5-8岁": "引导画「从窗户看出去」——把远近关系画出来。学习简单的遮挡和大小关系。",
        "8岁+": "学习基础透视：一点透视、两点透视。画建筑和城市街景。带他看建筑图纸和3D模型。",
      },
    },
    mechanical: {
      name: "机械智能天赋",
      icon: "⚙️",
      traits: "理解机械结构、画内部构造、对「怎么工作」感兴趣",
      manifestations: [
        "画机械/交通工具/机器人时体现结构理解：齿轮互相咬合、管道连接正确、关节能活动",
        "不止画外观，还画内部结构：把外壳剖开画出里面的发动机、零件、线路",
        "对「怎么工作」比对「长什么样」更感兴趣——画画是为了理解和表达机械原理",
        "反复画同一类机械主题：坦克、汽车、飞机、机器人——越画越深入，细节越来越丰富",
        "画画时会附带知识讲解：这是哪个型号、这个零件叫什么、有什么功能",
      ],
      desc: "孩子对机械结构有超出同龄人的理解力。这是蔺老师课程中最核心的案例——「爱画打仗的小男孩」就是典型的机械智能天赋。课程中的妈妈最初担心孩子只画军事内容是不是心理问题，但转换优势视角后，发现这是「聚焦型学习风格」——孩子通过反复描绘机械来构建对世界的理解。「始于天赋，终于优势」——给孩子提供环境支持，这将是巨大的优势。",
      growth: [
        "转换优势视角：不要担心孩子「只画这个」——课程案例中的妈妈从困扰转向欣赏，孩子的天赋得到了绽放。",
        "提供建构和拆解的机会：乐高科技系列、可拆装玩具、旧闹钟拆开看——理解机械原理需要动手。",
        "带孩子参观科技馆、交通工具博物馆、工程展——课程中的妈妈就带儿子去了军事博物馆。",
        "引导输出：鼓励他画「设计图」「剖面图」「使用说明」——让机械智能有更专业的表达。",
      ],
      careers: "机械工程师、汽车设计师、机器人工程师、航空工程师、工业设计师、钟表匠、特效师",
      byAge: {
        "3-5岁": "提供可拆装的大块玩具。不要求他画别的——保护他对机械的兴趣。课程强调「聚焦本身就是一种深度学习方式」。",
        "5-8岁": "提供乐高科技系列、简单机械模型。带他观察真实机械（工地起重机、汽车修理）。引导画内部结构。",
        "8岁+": "引入简单机械原理：杠杆、齿轮、滑轮。鼓励画设计图——给他尺子和方格纸，画自己设计的机器，标注尺寸和功能。",
      },
    },
  };

  // AI 识别的天赋优先，严格按画面内容匹配
  let primaryKey = null;

  if (aiTalentName) {
    if (aiTalentName.includes("情感")) primaryKey = "emotional";
    else if (aiTalentName.includes("专注")) primaryKey = "focus";
    else if (aiTalentName.includes("耐力") || aiTalentName.includes("持续")) primaryKey = "endurance";
    else if (aiTalentName.includes("故事")) primaryKey = "story";
    else if (aiTalentName.includes("设计")) primaryKey = "design";
    else if (aiTalentName.includes("幽默") || aiTalentName.includes("搞笑")) primaryKey = "humor";
    else if (aiTalentName.includes("动物")) primaryKey = "animal";
    else if (aiTalentName.includes("色彩")) primaryKey = "color";
    else if (aiTalentName.includes("数学")) primaryKey = "math";
    else if (aiTalentName.includes("逻辑")) primaryKey = "logic";
    else if (aiTalentName.includes("空间")) primaryKey = "spatial";
    else if (aiTalentName.includes("机械")) primaryKey = "mechanical";
  }

  // 本地回退：当AI不可用时，不做内容猜测，使用通用兜底
  const useGenericFallback = !primaryKey;

  // 本地无AI时不根据视觉特征猜天赋，统一用通用兜底文案
  const matched = useGenericFallback ? talentDB.story : talentDB[primaryKey];

  // 本地回退时用通用描述，不引用任何具体画面内容
  const genericManifestations = [
    "画面中有属于孩子自己的表达方式和关注点",
    "每一笔线条和每一块颜色都是孩子内心世界的映射",
    "孩子正在用画笔建立自己与世界的连接",
    "持续的绘画行为和主题偏好是天赋流露的自然信号",
    "建议继续观察孩子反复出现的主题、形状和颜色——这些才是真正的天赋线索",
  ];

  return {
    ...matched,
    manifestations: useGenericFallback ? genericManifestations : matched.manifestations,
    desc: useGenericFallback
      ? "每幅儿童画都是孩子内心世界的窗口。天赋不是一幅画能定义的，而是孩子「自然而然、反复出现、可被高效利用」的思维或行为模式。从当前作品出发，建议家长持续观察孩子绘画中反复出现的主题和表达方式，那才是天赋的真正线索。"
      : matched.desc,
    summary: useGenericFallback
      ? "按照蔺老师家庭美育体系，天赋是孩子「自然而然、反复出现」的思维或行为模式。单幅作品只能提供观察线索，真正的天赋识别需要多看几幅画的纵向对比。请继续上传更多作品来获得更准确的分析。"
      : `按照蔺老师家庭美育体系，天赋是孩子「自然而然、反复出现、可被高效利用」的思维或行为模式。从当前作品来看，孩子的画面特征（${matched.traits}）与「${matched.name}」高度吻合。这不是给孩子贴标签，而是帮助家长从优势视角理解孩子的发展方向。`,
  };
}

function buildProjectionObservations(analysis) {
  const tags = Array.isArray(analysis?.tags) ? analysis.tags.join(" ") : "";
  const isColorful = /色彩|颜色|彩色/.test(tags);
  const isLandscape = /横向/.test(tags);
  const isPortrait = /纵向/.test(tags);
  const isCentered = /居中|中心/.test(tags);
  const isSideWeighted = /偏左|偏右|偏上|偏下/.test(tags);

  const observations = [];

  // Attention projection
  if (isLandscape) {
    observations.push({
      label: "注意力投射",
      text: "画面横向展开，孩子可能在表达一段正在发生的事件或关系。近期他关注什么，画里就会出现什么——这是他当下最在意的事情。",
    });
  }

  // Symbolic projection (color emotion)
  if (isColorful) {
    observations.push({
      label: "象征投射",
      text: "色彩是孩子的情绪语言。鲜艳丰富的用色可能表达愉快、开放的情绪状态。可以观察孩子选择每种颜色时的心情，这会让你更理解他的内心世界。",
    });
  }

  // Position projection
  if (isCentered) {
    observations.push({
      label: "位置投射",
      text: "主体居中、稳定，可能说明孩子有较强的自我意识和控制感。他在画面中给自己留了一个稳定而重要的位置。",
    });
  } else if (isSideWeighted) {
    observations.push({
      label: "位置投射",
      text: "主体偏向一侧，可能反映了孩子当前的心理状态或空间偏好。可以问问孩子为什么把它放在那里，他的回答常常让你意想不到。",
    });
  }

  // Growth projection
  if (isPortrait) {
    observations.push({
      label: "成长投射",
      text: "纵向构图、关注人物主体，说明孩子可能正处于自我认知和身份感发展的阶段。画中的人物形象往往承载了他对「我是谁」的探索。",
    });
  }

  // Resonance projection (always include a general one)
  if (observations.length < 3) {
    observations.push({
      label: "共鸣投射",
      text: "孩子在画中画出的动物、角色或形象，很可能承载了他的自我认同。他喜欢画什么，往往就是他在什么上面看到了自己的影子。",
    });
  }

  return {
    observations: observations.slice(0, 4),
    disclaimer: "以上观察基于蔺老师家庭美育体系中的投射分析框架。绘画像一面镜子，可能投射孩子的经验、情绪和需求，但不能凭一张画下结论。使用「可能」「可以观察」「可以问问孩子」的态度，比急于判断更重要。",
  };
}

function safeStepList(steps) {
  const cleanSteps = Array.isArray(steps)
    ? steps.filter((step) => !textNeedsFallback(step)).slice(0, 3)
    : [];
  return cleanSteps.length ? cleanSteps : defaultAnalysis.nextSteps;
}

function readImageFeatures(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxEdge = 96;
      const ratio = Math.min(maxEdge / image.width, maxEdge / image.height, 1);
      const width = Math.max(1, Math.round(image.width * ratio));
      const height = Math.max(1, Math.round(image.height * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        reject(new Error("Canvas is unavailable"));
        return;
      }

      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      const lumas = new Float32Array(width * height);
      const totalPixels = width * height;
      let lumaTotal = 0;
      let lumaSquares = 0;
      let saturationTotal = 0;
      let markCount = 0;
      let sumX = 0;
      let sumY = 0;
      let edgeTotal = 0;

      for (let index = 0; index < totalPixels; index += 1) {
        const offset = index * 4;
        const red = pixels[offset];
        const green = pixels[offset + 1];
        const blue = pixels[offset + 2];
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const luma = 0.299 * red + 0.587 * green + 0.114 * blue;
        const x = index % width;
        const y = Math.floor(index / width);
        const marked = luma < 236 || saturation > 0.16;

        lumas[index] = luma;
        lumaTotal += luma;
        lumaSquares += luma * luma;
        saturationTotal += saturation;

        if (marked) {
          markCount += 1;
          sumX += x;
          sumY += y;
        }
      }

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const index = y * width + x;
          if (x > 0) edgeTotal += Math.abs(lumas[index] - lumas[index - 1]);
          if (y > 0) edgeTotal += Math.abs(lumas[index] - lumas[index - width]);
        }
      }

      const averageLuma = lumaTotal / totalPixels;
      const variance = lumaSquares / totalPixels - averageLuma * averageLuma;
      resolve({
        aspect: image.width / image.height,
        brightness: averageLuma,
        contrast: Math.sqrt(Math.max(variance, 0)),
        saturation: saturationTotal / totalPixels,
        coverage: markCount / totalPixels,
        centerX: markCount ? sumX / markCount / width : 0.5,
        centerY: markCount ? sumY / markCount / height : 0.5,
        edgeDensity: edgeTotal / Math.max(1, totalPixels * 2),
        height: image.height,
        width: image.width,
      });
    };
    image.onerror = () => reject(new Error("Image could not be analyzed"));
    image.src = src;
  });
}

function buildAnalysis(features, meta = {}, variant = 0) {
  if (!features) return defaultAnalysis;

  const seed = hashString(
    [
      meta.name,
      meta.size,
      meta.lastModified,
      variant,
      Math.round(features.aspect * 100),
      Math.round(features.saturation * 1000),
      Math.round(features.coverage * 1000),
      Math.round(features.edgeDensity),
      Math.round(features.centerX * 100),
      Math.round(features.centerY * 100),
    ].join("|"),
  );

  const portrait = features.aspect < 0.82;
  const landscape = features.aspect > 1.18;
  const colorful = features.saturation > 0.1;
  const dense = features.edgeDensity > 9 || features.coverage > 0.24;
  const sparse = features.coverage < 0.08 && features.edgeDensity < 8;
  const highContrast = features.contrast > 52 || features.brightness < 172;
  const lowContrast = features.contrast < 34 && !colorful;
  const left = features.centerX < 0.43;
  const right = features.centerX > 0.57;
  const top = features.centerY < 0.42;
  const bottom = features.centerY > 0.6;
  const offCenter = left || right || top || bottom;

  const tags = [
    dense ? tagText.detailed : tagText.simple,
    colorful ? tagText.colorful : tagText.lineArt,
    portrait ? tagText.portrait : landscape ? tagText.landscape : null,
    left ? tagText.left : right ? tagText.right : top ? tagText.top : bottom ? tagText.bottom : tagText.centered,
    sparse ? tagText.sparse : features.coverage > 0.28 ? tagText.full : null,
    highContrast ? tagText.strongContrast : lowContrast ? tagText.softContrast : null,
  ].filter(Boolean);

  const teacherCopy = offCenter
    ? teacherCopies[4]
    : colorful
      ? teacherCopies[1]
      : sparse
        ? teacherCopies[2]
        : dense && highContrast
          ? teacherCopies[3]
          : dense
            ? teacherCopies[0]
            : teacherCopies[5];

  const principles = [
    {
      label: "\u5bf9\u6bd4",
      color: "red",
      text: colorful
        ? dynamicText.contrastColor
        : highContrast
          ? dynamicText.contrastHigh
          : lowContrast
            ? dynamicText.contrastLow
            : dynamicText.contrastClear,
    },
    {
      label: "\u5bf9\u9f50",
      color: "orange",
      text: portrait
        ? dynamicText.alignTall
        : landscape
          ? dynamicText.alignWide
          : offCenter
            ? dynamicText.alignCenter
            : dynamicText.alignSource,
    },
    {
      label: "\u91cd\u590d",
      color: "purple",
      text: dense
        ? dynamicText.repeatDense
        : sparse
          ? dynamicText.repeatSparse
          : colorful
            ? dynamicText.repeatColor
            : dynamicText.repeatLine,
    },
    {
      label: "\u4eb2\u5bc6",
      color: "#E07B39",
      text: sparse
        ? dynamicText.closeSpace
        : offCenter
          ? dynamicText.closeMain
          : features.coverage > 0.24
            ? dynamicText.closeGroup
            : dynamicText.closePartner,
    },
  ];

  const firstStep = left
    ? dynamicText.stepLeft
    : right
      ? dynamicText.stepRight
      : top || bottom
        ? dynamicText.stepVertical
        : dynamicText.stepMain;
  const secondStep = colorful
    ? dynamicText.stepColor
    : dense
      ? dynamicText.stepReduce
      : dynamicText.stepLine;
  const thirdOptions = [
    sparse ? dynamicText.stepSpace : dynamicText.stepProp,
    highContrast ? dynamicText.stepLayer : dynamicText.stepRepeat,
    dynamicText.stepGroup,
  ];
  const thirdStep = thirdOptions[seed % thirdOptions.length];
  const skeleton = {
    visualCenter: offCenter ? firstStep : dynamicText.stepMain,
    flowLine: portrait
      ? dynamicText.alignTall
      : landscape
        ? dynamicText.alignWide
        : dynamicText.alignSource,
    balance: offCenter ? dynamicText.alignCenter : dynamicText.closeGroup,
    depth: colorful || highContrast ? dynamicText.stepLayer : copy.depthHint,
  };
  const colorPlan = colorful
    ? {
        ...defaultAnalysis.colorPlan,
        summary:
          "\u4fdd\u7559\u5df2\u6709\u7684\u8272\u5f69\u60c5\u7eea\uff0c\u518d\u7528\u4e00\u4e2a\u4e3b\u8272\u7edf\u4e00\u753b\u9762\uff0c\u4e0d\u8981\u8ba9\u5c0f\u989c\u8272\u8fc7\u591a\u5206\u6563\u3002",
        focus: [
          "\u5148\u627e\u51fa\u753b\u9762\u91cc\u5df2\u7ecf\u6700\u5438\u5f15\u4eba\u7684\u989c\u8272\u3002",
          "\u8ba9\u4e3b\u8272\u5728\u4e3b\u89d2\u548c\u4e00\u4e2a\u5c0f\u9053\u5177\u4e0a\u91cd\u590d\u51fa\u73b0\u3002",
          "\u6697\u90e8\u7528\u540c\u8272\u7cfb\u52a0\u6df1\uff0c\u4e0d\u8981\u53ea\u7528\u9ed1\u8272\u3002",
        ],
      }
    : defaultAnalysis.colorPlan;

  return {
    teacherCopy,
    tags: tags.slice(0, 4),
    principles,
    skeleton,
    colorPlan,
    nextSteps: uniqueSteps([firstStep, secondStep, thirdStep, dynamicText.stepGroup]),
  };
}

async function analyzeArtwork(src, meta, variant = 0) {
  try {
    const features = await readImageFeatures(src);
    return buildAnalysis(features, meta, variant);
  } catch {
    return defaultAnalysis;
  }
}

function normalizeRemotePrinciples(principles) {
  const fallbackByLabel = new Map(
    defaultAnalysis.principles.map((item) => [item.label, item]),
  );

  return defaultAnalysis.principles.map((fallback) => {
    const match = Array.isArray(principles)
      ? principles.find((item) => item?.label === fallback.label)
      : null;
    return {
      color: match?.color || fallback.color,
      label: fallback.label,
      text: safeGuideText(match?.text, fallbackByLabel.get(fallback.label).text),
    };
  });
}

function normalizeColorPlan(colorPlan) {
  const source = colorPlan && typeof colorPlan === "object" ? colorPlan : {};
  const palette = Array.isArray(source.palette)
    ? source.palette
        .filter((item) => item && typeof item === "object")
        .slice(0, 6)
        .map((item) => ({
          hex:
            typeof item.hex === "string" && /^#[0-9A-Fa-f]{6}$/.test(item.hex)
              ? item.hex
              : "#F4C86A",
          name:
            safeGuideText(item.name, "\u4e3b\u8272"),
          usage:
            safeGuideText(item.usage, "\u7528\u5728\u753b\u9762\u4e3b\u89d2\u4e0a\u3002"),
        }))
    : [];
  const focus = Array.isArray(source.focus)
    ? source.focus.filter((item) => typeof item === "string" && item.trim() && !textNeedsFallback(item)).slice(0, 4)
    : [];
  const steps = Array.isArray(source.steps)
    ? source.steps.filter((item) => typeof item === "string" && item.trim() && !textNeedsFallback(item)).slice(0, 4)
    : [];

  return {
    summary:
      safeGuideText(source.summary, defaultAnalysis.colorPlan.summary),
    palette: palette.length >= 4 ? palette : defaultAnalysis.colorPlan.palette,
    focus: focus.length >= 3 ? focus : defaultAnalysis.colorPlan.focus,
    steps: steps.length >= 3 ? steps : defaultAnalysis.colorPlan.steps,
  };
}

function normalizeRemoteAnalysis(payload) {
  const remote = payload?.analysis || payload;
  if (!remote || typeof remote !== "object") {
    throw new Error("Invalid AI analysis");
  }

  const tags = Array.isArray(remote.tags)
    ? remote.tags.filter((tag) => typeof tag === "string" && tag.trim() && !textNeedsFallback(tag)).slice(0, 5)
    : defaultAnalysis.tags;
  const nextSteps = Array.isArray(remote.nextSteps)
    ? remote.nextSteps.filter((step) => typeof step === "string" && step.trim() && !textNeedsFallback(step)).slice(0, 3)
    : defaultAnalysis.nextSteps;
  const skeleton =
    remote.skeleton && typeof remote.skeleton === "object" ? remote.skeleton : {};

  const remoteStrength = remote.strengthAnalysis && typeof remote.strengthAnalysis === "object"
    ? remote.strengthAnalysis
    : null;

  return {
    teacherCopy:
      safeGuideText(remote.teacherCopy, defaultAnalysis.teacherCopy),
    tags: tags.length ? tags : defaultAnalysis.tags,
    principles: normalizeRemotePrinciples(remote.principles),
    nextSteps: nextSteps.length ? nextSteps : defaultAnalysis.nextSteps,
    colorPlan: normalizeColorPlan(remote.colorPlan),
    strengthAnalysis: remoteStrength,
    skeleton: {
      visualCenter: safeGuideText(skeleton.visualCenter, defaultAnalysis.skeleton.visualCenter),
      flowLine: safeGuideText(skeleton.flowLine, defaultAnalysis.skeleton.flowLine),
      balance: safeGuideText(skeleton.balance, defaultAnalysis.skeleton.balance),
      depth: safeGuideText(skeleton.depth, defaultAnalysis.skeleton.depth),
    },
  };
}

function imageSourceToDataUrl(src) {
  if (src.startsWith("data:image/")) {
    return Promise.resolve(src);
  }

  return fetch(src)
    .then((response) => {
      if (!response.ok) throw new Error("Image source unavailable");
      return response.blob();
    })
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Image could not be read"));
          reader.readAsDataURL(blob);
        }),
    );
}

// ──────────── 模块级 API 封装（组件外函数使用）────────────

async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  try {
    const token = localStorage.getItem("art_token") || "";
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {}
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "请求失败");
  return data;
}

async function requestAiAnalysis(src, meta) {
  const image = await imageSourceToDataUrl(src);
  const payload = await apiFetch("/api/analyze", {
    body: JSON.stringify({
      fileName: meta?.name || copy.newArtwork,
      image,
      childAge,
    }),
    method: "POST",
  });
  return normalizeRemoteAnalysis(payload);
}

function correctImageAspectRatio(imageUrl, targetWidth, targetHeight) {
  if (!targetWidth || !targetHeight) return Promise.resolve(imageUrl);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const genRatio = img.width / img.height;
      const origRatio = targetWidth / targetHeight;
      // 比例差异小于 1% 则不需要校正
      if (Math.abs(genRatio - origRatio) < 0.01) {
        resolve(imageUrl);
        return;
      }
      // 使用 Canvas 居中裁剪到原图比例
      const canvas = document.createElement("canvas");
      let cropW, cropH, offsetX, offsetY;
      if (genRatio > origRatio) {
        // 生成图更宽 → 裁剪左右
        cropH = img.height;
        cropW = Math.round(img.height * origRatio);
        offsetX = Math.round((img.width - cropW) / 2);
        offsetY = 0;
      } else {
        // 生成图更高 → 裁剪上下
        cropW = img.width;
        cropH = Math.round(img.width / origRatio);
        offsetX = 0;
        offsetY = Math.round((img.height - cropH) / 2);
      }
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, offsetX, offsetY, cropW, cropH, 0, 0, cropW, cropH);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}

async function requestGuidanceImage(src, meta, variant, stylePreset, talentType, note) {
  const image = await imageSourceToDataUrl(src);
  const payload = await apiFetch("/api/generate-guidance-image", {
    body: JSON.stringify({
      fileName: meta?.name || copy.newArtwork,
      image,
      stylePreset,
      variant,
      talentType,
      note: note || "",
    }),
    method: "POST",
  });

  // 校正生成图的宽高比，确保与原图一致
  if (payload.originalWidth && payload.originalHeight) {
    payload.image = await correctImageAspectRatio(
      payload.image,
      payload.originalWidth,
      payload.originalHeight,
    );
  }

  return payload;
}

export function App() {
  const inputRef = useRef(null);
  const colorResultInputRef = useRef(null);
  const skeletonGuideInputRef = useRef(null);
  const analysisRequestRef = useRef(0);
  const guidanceRequestRef = useRef(0);
  const guidanceVariantRef = useRef(0);
  const sourceRef = useRef({
    lastModified: 0,
    name: "",
    size: 0,
    src: "",
  });
  const [preview, setPreview] = useState(null);
  const [skeletonGuidePreview, setSkeletonGuidePreview] = useState(null);
  const [colorResultPreview, setColorResultPreview] = useState(null);
  const [guidanceResults, setGuidanceResults] = useState([]);
  const [guidanceStatus, setGuidanceStatus] = useState("idle");
  const [guidanceError, setGuidanceError] = useState("");
  const [guidanceVariant, setGuidanceVariant] = useState(0);
  const [styleGuide, setStyleGuide] = useState(null);
  const [selectedStyleId, setSelectedStyleId] = useState("auto");
  const [previewImage, setPreviewImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("idle");
  const [saved, setSaved] = useState(false);
  const [analysis, setAnalysis] = useState(defaultAnalysis);
  const [analysisSource, setAnalysisSource] = useState("idle");
  const [hasUploaded, setHasUploaded] = useState(false);
  const [records, setRecords] = useState([]);
  const [guidanceHistory, setGuidanceHistory] = useState([]);
  const [expandedPanels, setExpandedPanels] = useState({ psych: true });
  const [activePerspective, setActivePerspective] = useState("psych");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [pageScrolled, setPageScrolled] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [copied, setCopied] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [authUser, setAuthUser] = useState(null); // { id, email, credits }
  const [authToken, setAuthToken] = useState(() => {
    try { return localStorage.getItem("art_token") || ""; } catch { return ""; }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [extractedFigures, setExtractedFigures] = useState(null);
  const [extractingStatus, setExtractingStatus] = useState("idle"); // idle | loading | done | error
  const [extractingError, setExtractingError] = useState("");
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [workspaceFigures, setWorkspaceFigures] = useState([]);
  const [workspaceStatus, setWorkspaceStatus] = useState("idle"); // idle | extracting | generating
  const [workspaceError, setWorkspaceError] = useState("");
  const [childAge, setChildAge] = useState("");
  const [guidanceNote, setGuidanceNote] = useState("");
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef(null);
  const [credits, setCredits] = useState(0);
  const [showRecharge, setShowRecharge] = useState(false);
  const [customCredits, setCustomCredits] = useState(50); // 自定义积分数量
  const [unitPrice, setUnitPrice] = useState(0.39); // 积分单价，从服务端获取
  const [freeMode, setFreeMode] = useState(true);   // 默认免费模式
  const [activeTab, setActiveTab] = useState("analysis"); // "analysis" | "records"
  const [navHidden, setNavHidden] = useState(false);        // 底部导航隐藏

  // 打开充值弹窗时获取最新单价
  function openRecharge() {
    setShowRecharge(true);
    if (authToken) {
      apiFetch("/api/payment/packages").then(data => {
        if (data.unitPrice) setUnitPrice(data.unitPrice);
      }).catch(() => {});
    }
  }

  useEffect(() => {
    const syncScrollState = () => {
      setPageScrolled(window.scrollY > 18);
    };

    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });

    const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
      return () => {
        window.removeEventListener("scroll", syncScrollState);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealNodes.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", syncScrollState);
    };
  }, [hasUploaded, guidanceStatus, previewImage, showReport, showWorkspace]);

  // ──────────── 认证 ────────────

  async function refreshUser() {
    if (!authToken) return;
    try {
      const data = await apiFetch("/api/auth/me");
      setAuthUser(data.user);
      setCredits(data.user.credits);
      setUserLoggedIn(true);
    } catch {
      // token 失效
      setAuthToken("");
      setAuthUser(null);
      setUserLoggedIn(false);
      localStorage.removeItem("art_token");
    }
  }

  // 页面加载时验证 token + 加载免费模式配置
  useEffect(() => {
    if (authToken) refreshUser();
    fetch("/api/config").then(r => r.json()).then(d => {
      if (d.freeMode) setFreeMode(true);
      if (d.unitPrice) setUnitPrice(d.unitPrice);
    }).catch(() => {});
    // 预加载 html2canvas 加速保存
    if (!window.html2canvas) {
      const s = document.createElement("script");
      s.src = "https://registry.npmmirror.com/html2canvas/1.4.1/files/dist/html2canvas.min.js";
      document.head.appendChild(s);
    }
  }, []);

  // 滚动隐藏/显示底部导航
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const dy = window.scrollY - lastY;
          if (dy > 30) setNavHidden(true);
          else if (dy < -10) setNavHidden(false);
          lastY = window.scrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleAuthSubmit(email, password, inviteCode = "") {
    setAuthError("");
    setAuthLoading(true);
    try {
      const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = authMode === "register"
        ? JSON.stringify({ email, password, inviteCode })
        : JSON.stringify({ email, password });
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.error || "操作失败，请重试");
        return;
      }
      // 登录/注册成功
      setAuthToken(data.token);
      setAuthUser(data.user);
      setCredits(data.user.credits);
      setUserLoggedIn(true);
      setShowAuthModal(false);
      localStorage.setItem("art_token", data.token);
    } catch (err) {
      setAuthError("网络错误，请检查连接");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    setAuthToken("");
    setAuthUser(null);
    setCredits(0);
    setUserLoggedIn(false);
    setRecords([]);
    localStorage.removeItem("art_token");
  }

  // ──────────── 积分（服务端管理）────────────

  async function refreshCredits() {
    if (!authToken) return;
    try {
      const data = await apiFetch("/api/credits");
      setCredits(data.credits);
      if (authUser) setAuthUser((prev) => ({ ...prev, credits: data.credits }));
    } catch {}
  }

  function useCredit() {
    if (!authToken) {
      setShowAuthModal(true);
      return false;
    }
    if (!freeMode && credits <= 0) {
      openRecharge();
      return false;
    }
    return true;
  }

  // ──────────── 充值 ────────────

  async function handleRecharge(packageId) {
    if (!authToken) {
      setShowAuthModal(true);
      return;
    }
    try {
      const body = packageId === "custom"
        ? JSON.stringify({ packageId: "custom", credits: customCredits })
        : JSON.stringify({ packageId });
      const data = await apiFetch("/api/payment/create-order", {
        method: "POST",
        body,
      });
      if (data.payUrl) {
        window.open(data.payUrl, "_blank");
        setShowRecharge(false);
        setTimeout(() => alert(`已创建 ${data.order.credits} 积分订单（¥${data.order.price}），支付完成后刷新页面积分自动到账`), 500);
      } else {
        alert("支付链接未配置，请联系客服充值");
      }
    } catch (err) {
      alert("创建订单失败：" + err.message);
    }
  }

  const statusText = useMemo(() => {
    if (!hasUploaded) return "";
    if (status === "analyzing") return copy.analyzing;
    if (analysisSource === "ai") return copy.aiGenerated;
    if (analysisSource === "local") return copy.localGenerated;
    return "";
  }, [analysisSource, status, hasUploaded]);

  const selectedStyleOption = useMemo(
    () => getStyleOption(selectedStyleId),
    [selectedStyleId],
  );

  const guidanceStatusText = useMemo(() => {
    if (guidanceStatus === "generating") {
      return copy.guideGenerating;
    }
    if (guidanceStatus === "done") {
      return copy.guideDone;
    }
    if (guidanceStatus === "error") return copy.guideFailed;
    if (guidanceStatus === "sample") return copy.guideSample;
    return copy.guideReady;
  }, [guidanceResults.length, guidanceStatus]);

  const reportAgeLabel = useMemo(() => {
    if (childAge === "3-5") return "3~5岁";
    if (childAge === "5-8") return "5~8岁";
    if (childAge === "8-12") return "8~12岁";
    return "12岁+";
  }, [childAge]);

  const reportTalentProfile = useMemo(
    () => buildTalentProfile(analysis, analysis.strengthAnalysis?.talentType),
    [analysis],
  );

  const reportStyleName = useMemo(() => getDisplayStyleName(styleGuide), [styleGuide]);
  const reportStrengthInsights = useMemo(() => buildStrengthInsights(analysis), [analysis]);
  const reportProjectionData = useMemo(() => buildProjectionObservations(analysis), [analysis]);
  const reportAiStrength = analysis.strengthAnalysis;
  const reportPsychology = reportAiStrength?.psychology || reportStrengthInsights.psychology;
  const reportDevelopment = reportAiStrength?.development || reportStrengthInsights.development;
  const reportFamilyEducation = reportAiStrength?.familyEducation || reportStrengthInsights.familyEducation;
  const reportProjectionObservations =
    reportAiStrength?.projectionObservations?.length
      ? reportAiStrength.projectionObservations
      : reportProjectionData.observations;

  function validateAnalysisAgainstImage(analysis, features) {
    if (!analysis || !features) return analysis;
    const text = JSON.stringify(analysis);
    const warnings = [];

    // 画面是线稿/黑白 → 不应该讨论色彩
    if (features.saturation < 0.05 && /色彩|颜色|配色|彩色|五彩|暖色|冷色|色调|鲜艳/.test(text)) {
      warnings.push("⚠️ 画面实际是黑白线稿，但分析中出现了色彩相关描述，已自动标记");
    }
    // 画面是横图 → 不应说纵向
    if (features.aspect > 1.2 && analysis.tags?.some(t => t.includes("纵向"))) {
      warnings.push("⚠️ 画面实际是横向，但标签中出现了'纵向'");
    }
    // 画面是竖图 → 不应说横向
    if (features.aspect < 0.8 && analysis.tags?.some(t => t.includes("横向"))) {
      warnings.push("⚠️ 画面实际是纵向，但标签中出现了'横向'");
    }

    if (warnings.length) {
      return { ...analysis, _validationWarnings: warnings };
    }
    return analysis;
  }

  function requestAnalysis(src, meta, variant = 0) {
    const requestId = analysisRequestRef.current + 1;
    analysisRequestRef.current = requestId;
    setSaved(false);
    setStatus("analyzing");
    setAnalysisSource("pending");

    // 先提取图像特征，用于后续校验AI输出
    const featuresPromise = readImageFeatures(src).catch(() => null);

    requestAiAnalysis(src, meta)
      .then((nextAnalysis) => {
        if (analysisRequestRef.current !== requestId) return;
        // 用图像特征校验AI分析结果
        featuresPromise.then((features) => {
          const validated = validateAnalysisAgainstImage(nextAnalysis, features);
          setAnalysis(validated);
          setAnalysisSource("ai");
        });
      })
      .catch(() => analyzeArtwork(src, meta, variant).then((nextAnalysis) => {
        if (analysisRequestRef.current !== requestId) return;
        setAnalysis(nextAnalysis);
        setAnalysisSource("local");
      }))
      .finally(() => {
      if (analysisRequestRef.current !== requestId) return;
      setStatus("done");
      });
  }

  function runAnalysis() {
    if (!useCredit()) { setShowRecharge(true); return; }
    requestAnalysis(sourceRef.current.src, sourceRef.current, Date.now());
  }

  async function runGuidance() {
    if (!useCredit()) { openRecharge(); return; }
    const requestId = guidanceRequestRef.current + 1;
    const nextVariant = guidanceVariantRef.current + 1;
    const variants = Array.from({ length: guidanceBatchSize }, (_, index) => nextVariant + index);
    guidanceRequestRef.current = requestId;
    guidanceVariantRef.current = nextVariant + guidanceBatchSize - 1;
    const source = sourceRef.current;

    setSaved(false);
    setGuidanceVariant(nextVariant);
    setGuidanceStatus("generating");
    setGuidanceError("");
    setGuidanceResults([]);
    setStyleGuide(null);
    setStatus("analyzing");
    setAnalysisSource("pending");

    try {
      // 先本地快速分析，获取天赋类型用于指导图片生成
      const quickAnalysis = await analyzeArtwork(source.src, source, nextVariant);
      const talentProfile = buildTalentProfile(quickAnalysis);
      const talentType = talentProfile.name;

    const analysisPromise = requestAiAnalysis(source.src, source)
      .then((nextAnalysis) => ({ source: "ai", value: nextAnalysis }))
      .catch(() =>
        analyzeArtwork(source.src, source, nextVariant).then((nextAnalysis) => ({
          source: "local",
          value: nextAnalysis,
        })),
      );

    const [imageResults, analysisResult] = await Promise.allSettled([
      Promise.allSettled(
        variants.map((variant) =>
          requestGuidanceImage(
            source.src,
            source,
            variant,
            selectedStyleOption.id === "auto" ? null : selectedStyleOption,
            talentType,
            guidanceNote,
          ),
        ),
      ),
      analysisPromise,
    ]);

    if (guidanceRequestRef.current !== requestId) return;

    if (analysisResult.status === "fulfilled") {
      setAnalysis(analysisResult.value.value);
      setAnalysisSource(analysisResult.value.source);
    }

    const successfulResults =
      imageResults.status === "fulfilled"
        ? imageResults.value
            .map((result, index) =>
              result.status === "fulfilled"
                ? {
                    image: result.value.image,
                    model: result.value.model,
                    size: result.value.size,
                    styleGuide: result.value.styleGuide || null,
                    variant: variants[index],
                  }
                : null,
            )
            .filter(Boolean)
        : [];
    if (successfulResults.length > 0) {
      setGuidanceResults(successfulResults);
      setStyleGuide(successfulResults[0].styleGuide || null);
      setGuidanceError("");
      setGuidanceStatus("done");

      // 自动保存生成历史
      const historyEntry = {
        id: `${Date.now()}-${guidanceVariantRef.current}`,
        createdAt: new Date().toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit", month: "numeric", day: "numeric" }),
        fileName,
        preview,
        generatedImage: successfulResults[0].image,
        styleName: getDisplayStyleName(successfulResults[0].styleGuide || null),
        talentType: talentProfile.name,
        talentIcon: talentProfile.icon,
      };
      setGuidanceHistory((prev) => [historyEntry, ...prev].slice(0, 50));
    } else {
      const firstFailure =
        imageResults.status === "fulfilled"
          ? imageResults.value.find((result) => result.status === "rejected")?.reason
          : imageResults.reason;
      setGuidanceError(firstFailure?.message || copy.guideFailedHint);
      setGuidanceStatus("error");
    }

    setStatus("done");
  } catch (err) {
    setGuidanceError(err.message || "生成失败，请重试");
    setGuidanceStatus("error");
    setStatus("done");
  }
}

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const meta = {
        lastModified: file.lastModified,
        name: file.name,
        size: file.size,
        src,
      };
      sourceRef.current = meta;
      setPreview(src);
      setSkeletonGuidePreview(null);
      setColorResultPreview(null);
      setGuidanceResults([]);
      setGuidanceError("");
      setGuidanceStatus("idle");
      setStyleGuide(null);
      guidanceVariantRef.current = 0;
      setGuidanceVariant(0);
      setFileName(file.name.replace(/\.[^.]+$/, "") || copy.newArtwork);
      setHasUploaded(true);
      setStatus("analyzing");
      setAnalysisSource("pending");

      // 实时分析
      analyzeArtwork(src, meta, Date.now()).then((localAnalysis) => {
        if (sourceRef.current.src === src) {
          setAnalysis(localAnalysis);
          setAnalysisSource("local");
          setStatus("done");
        }
      });

      requestAiAnalysis(src, meta)
        .then((aiAnalysis) => {
          if (sourceRef.current.src === src) {
            // 用图像特征校验AI输出
            readImageFeatures(src).then((features) => {
              const validated = validateAnalysisAgainstImage(aiAnalysis, features);
              setAnalysis(validated);
              setAnalysisSource("ai");
            }).catch(() => {
              setAnalysis(aiAnalysis);
              setAnalysisSource("ai");
            });
          }
        })
        .catch(() => {});
    };
    reader.readAsDataURL(file);
  }

  function handleColorResultChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setColorResultPreview(String(reader.result));
    };
    reader.readAsDataURL(file);
  }

  function handleSkeletonGuideChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSkeletonGuidePreview(String(reader.result));
    };
    reader.readAsDataURL(file);
  }

  function handleStyleChange(event) {
    setSelectedStyleId(event.target.value);
    setGuidanceResults([]);
    setGuidanceError("");
    setGuidanceStatus("idle");
    setStyleGuide(null);
    guidanceVariantRef.current = 0;
    setGuidanceVariant(0);
  }

  function handleSave() {
    const record = {
      analysis,
      fileName,
      id: `${Date.now()}-${records.length}`,
      preview,
      savedAt: new Date().toLocaleString("zh-CN"),
    };
    setRecords((prev) => [record, ...prev].slice(0, 50));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
    // 异步持久化到后端
    if (authToken) {
      apiFetch("/api/records/save", {
        method: "POST",
        body: JSON.stringify({ fileName, preview, analysis }),
      }).catch(() => {});
    }
  }

  async function loadRecords() {
    if (!authToken) return;
    try {
      const data = await apiFetch("/api/records/list");
      if (data.records?.length) {
        setRecords(data.records.map(r => ({
          id: r.id,
          fileName: r.fileName,
          preview: r.preview,
          analysis: r.analysis,
          savedAt: r.createdAt ? new Date(r.createdAt).toLocaleString("zh-CN") : "",
        })));
      }
    } catch {}
  }

  function deleteRecord(recordId) {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
  }

  function handleExport() {
    const advice = safeGuideText(analysis.teacherCopy, defaultAnalysis.teacherCopy);
    const nextSteps = safeStepList(analysis.nextSteps).join("\n");
    const talentProfile = buildTalentProfile(analysis, analysis.strengthAnalysis?.talentType);
    const colorPlan = analysis.colorPlan || defaultAnalysis.colorPlan;
    const palette = colorPlan.palette.map((c) => `  ${c.name} (${c.hex}) — ${c.usage}`).join("\n");
    const tags = analysis.tags.join(" · ");

    const report = [
      `═══════════════════════════════════════`,
      `  蔺老师儿童作品一对一点评报告`,
      `═══════════════════════════════════════`,
      ``,
      `📌 作品：${fileName}`,
      `📌 日期：${new Date().toLocaleDateString("zh-CN")}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💬 老师点评`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      advice,
      ``,
      `🏷 画面特征：${tags}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🎨 天赋识别：${talentProfile.icon} ${talentProfile.name}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      talentProfile.traits,
      ``,
      talentProfile.desc,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📋 下一步建议`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      nextSteps,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🎨 配色方案`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      palette,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📖 蔺老师家庭美育模型`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      copy.strengthFormula,
      ``,
      copy.strengthClosing,
      ``,
      `═══════════════════════════════════════`,
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `蔺老师点评_${fileName}_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  function handleCopyAdvice() {
    const advice = safeGuideText(analysis.teacherCopy, defaultAnalysis.teacherCopy);
    const nextSteps = safeStepList(analysis.nextSteps).map((s, i) => `${i + 1}. ${s}`).join("\n");
    const text = `【蔺老师点评】\n${advice}\n\n【下一步建议】\n${nextSteps}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }

  function handleToggleFavorite() {
    const isFav = favorites.some((f) => f.fileName === fileName);
    if (isFav) {
      setFavorites((prev) => prev.filter((f) => f.fileName !== fileName));
    } else {
      setFavorites((prev) => [
        { fileName, preview, savedAt: new Date().toLocaleString("zh-CN") },
        ...prev,
      ].slice(0, 50));
    }
  }

  function isFavorite() {
    return favorites.some((f) => f.fileName === fileName);
  }

  function handleShare() {
    const advice = safeGuideText(analysis.teacherCopy, defaultAnalysis.teacherCopy);
    if (navigator.share) {
      navigator.share({
        title: `蔺老师点评：${fileName}`,
        text: `【蔺老师儿童作品点评】\n作品：${fileName}\n\n${advice}`,
      }).catch(() => {});
    } else {
      // Fallback: copy share text to clipboard
      navigator.clipboard.writeText(
        `【蔺老师儿童作品点评】\n作品：${fileName}\n\n${advice}\n\n—— 来自「蔺老师儿童作品一对一点评指导网」`
      ).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    }
  }

  function openReport() {
    setShowReport(true);
  }

  function closeReport() {
    setShowReport(false);
  }

  async function handleSaveReportImage() {
    const el = reportRef.current;
    if (!el) return;

    const loadHtml2Canvas = () =>
      new Promise((resolve, reject) => {
        if (window.html2canvas) return resolve(window.html2canvas);
        const script = document.createElement("script");
        script.src = "https://registry.npmmirror.com/html2canvas/1.4.1/files/dist/html2canvas.min.js";
        script.onload = () => resolve(window.html2canvas);
        script.onerror = reject;
        document.head.appendChild(script);
      });

    try {
      // 保存原始样式
      const origWidth = el.style.width;
      const origMaxWidth = el.style.maxWidth;
      const origMaxHeight = el.style.maxHeight;
      const origOverflow = el.style.overflow;
      const origFontSize = el.style.fontSize;
      const hadCapturingClass = el.classList.contains("capturing");

      // 导出更大的版心，手机用较小尺寸
      const isMobile = window.innerWidth < 860;
      el.classList.add("capturing");
      el.style.width = isMobile ? "600px" : "1240px";
      el.style.maxWidth = isMobile ? "600px" : "1240px";
      el.style.maxHeight = "none";
      el.style.overflow = "visible";
      el.style.fontSize = "24px";

      const overlay = el.closest(".report-overlay");
      if (overlay) overlay.style.overflowY = "visible";

      const actions = el.querySelector(".report-actions");
      if (actions) actions.style.display = "none";

      // 标题单独再放大
      const h1 = el.querySelector(".report-header h1");
      const origH1Size = h1?.style.fontSize;
      if (h1) h1.style.fontSize = "56px";

      // 等图片加载完
      const images = el.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete && img.naturalWidth > 0) return resolve();
              img.onload = resolve;
              img.onerror = resolve;
              setTimeout(resolve, 5000);
            }),
        ),
      );
      await new Promise((r) => setTimeout(r, 200));

      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowHeight: el.scrollHeight,
        height: el.scrollHeight,
        imageTimeout: 0,
      });

      // 恢复
      el.style.width = origWidth;
      el.style.maxWidth = origMaxWidth;
      el.style.maxHeight = origMaxHeight;
      el.style.overflow = origOverflow;
      el.style.fontSize = origFontSize;
      if (!hadCapturingClass) el.classList.remove("capturing");
      if (h1) h1.style.fontSize = origH1Size || "";
      if (overlay) overlay.style.overflowY = "";
      if (actions) actions.style.display = "";

      // 移动端优先用 Web Share，桌面端用下载链接
      const blob = await new Promise(r => canvas.toBlob(r, "image/png", 1.0));
      const file = new File([blob], "学员测评单.png", { type: "image/png" });
      const url = URL.createObjectURL(blob);
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "学员测评单" });
      } else {
        const link = document.createElement("a");
        link.download = "学员测评单.png";
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      if (el) {
        el.classList.remove("capturing");
        el.style.width = "";
        el.style.maxWidth = "";
        el.style.maxHeight = "";
        el.style.overflow = "";
        el.style.fontSize = "";
      }
      const overlay = el?.closest(".report-overlay");
      if (overlay) overlay.style.overflowY = "";
      const actions = el?.querySelector(".report-actions");
      if (actions) actions.style.display = "";
      const h1 = el?.querySelector(".report-header h1");
      if (h1) h1.style.fontSize = "";
      window.print();
    }
  }

  // 手机端一键保存并返回主页
  async function mobileSaveAndBack() {
    if (!userLoggedIn) { setAuthMode("login"); setShowAuthModal(true); return; }
    setShowReport(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      await handleSaveReportImage();
    } catch(e) {
      // 如果保存失败，至少关闭并返回
    }
    setShowReport(false);
    setActiveTab("analysis");
  }

  async function handleExtractFigures() {
    setExtractingStatus("loading");
    setExtractingError("");
    setExtractedFigures(null);

    try {
      const image = await imageSourceToDataUrl(sourceRef.current.src);
      const payload = await apiFetch("/api/extract-figures", {
        body: JSON.stringify({
          fileName: fileName,
          image,
        }),
        method: "POST",
      });

      setExtractedFigures(payload.extraction);
      setExtractingStatus("done");
    } catch (error) {
      setExtractingError(error.message || "提取失败");
      setExtractingStatus("error");
    }
  }

  function closeExtraction() {
    setExtractedFigures(null);
    setExtractingStatus("idle");
    setExtractingError("");
  }

  function openPreview(title, src) {
    if (!src) return;
    setPreviewImage({ src, title });
  }

  function closePreview() {
    setPreviewImage(null);
  }

  // ===== 画布工作台 =====
  async function handleWorkspaceExtract() {
    const optimizedImage = guidanceResults[0]?.image;
    if (!optimizedImage) return;

    setWorkspaceStatus("extracting");
    setWorkspaceError("");
    setWorkspaceFigures([]);

    try {
      const image = await imageSourceToDataUrl(optimizedImage);
      const payload = await apiFetch("/api/extract-figures", {
        body: JSON.stringify({ fileName: fileName || "优化图", image }),
        method: "POST",
      });

      const figures = (payload.extraction?.figures || []).map((f, i) => ({
        id: `fig-${i}`,
        name: f.name,
        type: f.type,
        description: f.description,
        position: f.position,
        color: f.color,
        turns: {}, // { front, side, back }
        turnStatus: "idle",
      }));
      setWorkspaceFigures(figures);
      setWorkspaceStatus("done");
    } catch (error) {
      setWorkspaceError(error.message || "提取失败");
      setWorkspaceStatus("error");
    }
  }

  async function handleGenerateTurnaround(figureId) {
    const optimizedImage = guidanceResults[0]?.image;
    if (!optimizedImage) return;

    setWorkspaceFigures((prev) =>
      prev.map((f) => (f.id === figureId ? { ...f, turnStatus: "generating" } : f)),
    );

    try {
      const image = await imageSourceToDataUrl(optimizedImage);
      const figure = workspaceFigures.find((f) => f.id === figureId);
      const payload = await apiFetch("/api/generate-turnaround", {
        body: JSON.stringify({
          image,
          figureName: figure?.name || "角色",
          figureDesc: figure?.description || "",
          figureType: figure?.type || "",
        }),
        method: "POST",
      });

      setWorkspaceFigures((prev) =>
        prev.map((f) =>
          f.id === figureId
            ? {
                ...f,
                turns: {
                  front: payload.turnaround?.front || null,
                  side: payload.turnaround?.side || null,
                  back: payload.turnaround?.back || null,
                },
                turnStatus: "done",
              }
            : f,
        ),
      );
    } catch (error) {
      setWorkspaceFigures((prev) =>
        prev.map((f) => (f.id === figureId ? { ...f, turnStatus: "error" } : f)),
      );
    }
  }

  function closeWorkspace() {
    setShowWorkspace(false);
    setWorkspaceFigures([]);
    setWorkspaceStatus("idle");
    setWorkspaceError("");
  }

  function downloadFigureAssets(figure) {
    const turns = figure.turns;
    const images = [turns.front, turns.side, turns.back].filter(Boolean);
    images.forEach((src, i) => {
      const a = document.createElement("a");
      a.href = src;
      a.download = `${figure.name}_${["正面","侧面","背面"][i]}.png`;
      a.click();
    });
  }

  function renderWorkspaceModal() {
    if (!showWorkspace) return null;
    const optimizedImage = guidanceResults[0]?.image;
    const disabled = workspaceStatus === "extracting" || workspaceStatus === "generating";

    return (
      <div className="workspace-overlay" onClick={closeWorkspace}>
        <div className="workspace-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="workspace-header">
            <h2>🎨 画布工作台 — IP形象资产</h2>
            <button type="button" onClick={closeWorkspace}>
              <X size={22} strokeWidth={2.2} />
            </button>
          </div>

          {/* Body */}
          <div className="workspace-body">
            {/* 左侧：原优化图 */}
            <div className="workspace-source">
              <h3>优化作品</h3>
              <div className="workspace-source-img">
                {optimizedImage ? (
                  <img src={optimizedImage} alt="优化后的作品" />
                ) : (
                  <span className="workspace-empty-hint">还没有优化图，请先在主页生成</span>
                )}
              </div>
            </div>

            {/* 右侧：形象列表 */}
            <div className="workspace-figures">
              <div className="workspace-figures-header">
                <h3>提取的形象</h3>
                <button
                  className="pill-button"
                  type="button"
                  onClick={handleWorkspaceExtract}
                  disabled={disabled || !optimizedImage}
                >
                  <Scan size={15} strokeWidth={2} />
                  {workspaceStatus === "extracting" ? "提取中……" : "一键提取"}
                </button>
              </div>

              {workspaceStatus === "extracting" && (
                <div className="workspace-status">
                  <RefreshCcw size={24} strokeWidth={2} className="spinning" />
                  <span>AI 正在识别画面形象……</span>
                </div>
              )}

              {workspaceStatus === "error" && (
                <div className="workspace-status workspace-error">
                  <span>❌ {workspaceError}</span>
                  <button className="pill-button" type="button" onClick={handleWorkspaceExtract}>重试</button>
                </div>
              )}

              {workspaceFigures.length === 0 && workspaceStatus === "done" && (
                <div className="workspace-status">
                  <span>未识别到形象，请重试</span>
                </div>
              )}

              <div className="workspace-figure-list">
                {workspaceFigures.map((figure) => (
                  <div className="workspace-figure-card" key={figure.id}>
                    <div className="workspace-figure-info">
                      <span className="workspace-figure-index">
                        {workspaceFigures.indexOf(figure) + 1}
                      </span>
                      <div>
                        <strong>{figure.name}</strong>
                        <span className={`extract-type extract-type-${figure.type || "其他"}`}>
                          {figure.type}
                        </span>
                      </div>
                      <p>{figure.description}</p>
                    </div>

                    {/* 三视图区 */}
                    <div className="workspace-turnaround">
                      <div className="workspace-turnaround-header">
                        <span>三视图</span>
                        <button
                          className="pill-button"
                          type="button"
                          onClick={() => handleGenerateTurnaround(figure.id)}
                          disabled={figure.turnStatus === "generating" || disabled}
                        >
                          {figure.turnStatus === "generating" ? (
                            <><RefreshCcw size={13} strokeWidth={2} className="spinning" /> 生成中</>
                          ) : figure.turnStatus === "done" ? (
                            "重新生成"
                          ) : (
                            "生成三视图"
                          )}
                        </button>
                      </div>

                      {figure.turnStatus === "done" && figure.turns.front ? (
                        <div className="workspace-turn-grid">
                          {[
                            { key: "front", label: "正面" },
                            { key: "side", label: "侧面" },
                            { key: "back", label: "背面" },
                          ].map(({ key, label }) => (
                            <div className="workspace-turn-item" key={key}>
                              <span className="workspace-turn-label">{label}</span>
                              <div className="workspace-turn-img">
                                {figure.turns[key] ? (
                                  <img src={figure.turns[key]} alt={`${figure.name} ${label}`} />
                                ) : (
                                  <span className="workspace-turn-empty">—</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : figure.turnStatus === "generating" ? (
                        <div className="workspace-turn-loading">
                          <RefreshCcw size={18} strokeWidth={2} className="spinning" />
                          <span>生成三视图中……</span>
                        </div>
                      ) : figure.turnStatus === "error" ? (
                        <div className="workspace-turn-error">
                          <span>生成失败</span>
                          <button className="pill-button" type="button" onClick={() => handleGenerateTurnaround(figure.id)}>重试</button>
                        </div>
                      ) : (
                        <div className="workspace-turn-empty-hint">点击按钮生成正面/侧面/背面</div>
                      )}

                      {figure.turnStatus === "done" && (
                        <button
                          className="pill-button workspace-download-btn"
                          type="button"
                          onClick={() => downloadFigureAssets(figure)}
                        >
                          <Download size={14} strokeWidth={2} /> 下载素材
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderStyleSelector() {
    return (
      <div className="style-selector-card" aria-label={copy.styleSelectTitle}>
        <div className="style-selector-heading">
          <span>
            <Palette size={16} strokeWidth={2.2} />
            {copy.styleSelectTitle}
          </span>
          <p>{copy.styleSelectHint}</p>
        </div>
        <label className="style-select-control">
          <span>{copy.styleSelectLabel}</span>
          <select value={selectedStyleId} onChange={handleStyleChange}>
            {styleGroups.map((group) => (
              <optgroup label={group.label} key={group.label}>
                {group.options.map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <p className="style-selected-summary">{selectedStyleOption.summary}</p>
      </div>
    );
  }

  function renderUploadPanel() {
    return (
      <section className="upload-panel interactive-card reveal-up" data-reveal aria-label={copy.uploadArtwork}>
        <div className="section-heading">
          <div>
            <h2>{copy.uploadArtwork}</h2>
            {fileName && <span>{fileName}</span>}
          </div>
          <button
            className="pill-button"
            type="button"
            onClick={() => inputRef.current?.click()}
          >
            <Pencil size={16} strokeWidth={2.2} />
            {copy.replace}
          </button>
        </div>

        <button
          className="artwork-frame"
          type="button"
          onClick={() => preview && openPreview(copy.original, preview)}
          aria-label={preview ? copy.enlargeView : copy.uploadArtwork}
        >
          {preview ? (
            <>
              <img src={preview} alt={copy.artworkAlt} />
              <span className="zoom-control" aria-hidden="true">
                <Search size={20} strokeWidth={2.1} />
              </span>
            </>
          ) : (
            <span className="upload-placeholder">
              <Upload size={32} strokeWidth={1.5} />
              <span>上传手绘作品</span>
            </span>
          )}
        </button>

        <input
          ref={inputRef}
          className="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </section>
    );
  }

  function renderGuidanceAction() {
    const isGenerating = guidanceStatus === "generating";
    const actionText = guidanceStatus === "done" ? copy.regenerateAction : copy.guideAction;

    return (
      <section className="guidance-action-card interactive-card reveal-up" data-reveal aria-label={copy.guideAction}>
        <div className="guidance-action-copy">
          <span>{copy.compositionContentColor}</span>
          <h2>{copy.guideActionTitle}</h2>
          <p>{copy.guideActionIntro}</p>
        </div>
        {renderStyleSelector()}
        <button
          className="guide-button"
          type="button"
          onClick={runGuidance}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <RefreshCcw size={21} strokeWidth={2.2} />
          ) : (
            <Sparkles size={21} strokeWidth={2.2} />
          )}
          {actionText}
        </button>
      </section>
    );
  }

  function renderUploadFlow() {
    const isGenerating = guidanceStatus === "generating";
    const generatedImage = guidanceResults.length > 0 ? guidanceResults[0]?.image : null;
    const talentProfile = buildTalentProfile(analysis, analysis.strengthAnalysis?.talentType);
    const planItems = buildProfessionalGuidePlan(analysis, styleGuide);
    const displayStyleName = getDisplayStyleName(styleGuide);

    return (
      <div className="upload-flow">
        {/* Step 1: 上传作品 */}
        <div className="flow-step interactive-card reveal-up" data-reveal>
          <div className="flow-step-label">
            <span className="step-num">1</span> 上传作品
          </div>
          <button
            className="flow-original-img"
            type="button"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <>
                <img src={preview} alt={copy.artworkAlt} />
                <span className="compare-upload-overlay">
                  <ImageUp size={22} strokeWidth={2} />
                  <span>{copy.replace}</span>
                </span>
              </>
            ) : (
              <span className="upload-placeholder">
                <Upload size={32} strokeWidth={1.5} />
                <span>上传手绘作品</span>
              </span>
            )}
          </button>

          {/* 孩子年龄段选择 */}
          <div className="age-selector">
            <span className="age-selector-label">👶 孩子年龄段 <span style={{color:"var(--accent)"}}>*必选</span></span>
            <select
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
            >
              <option value="">— 请选择孩子年龄段 —</option>
              <option value="3-5">3 ~ 5 岁（涂鸦期 → 象征期）</option>
              <option value="5-8">5 ~ 8 岁（象征期 → 意向表现期）</option>
              <option value="8-12">8 ~ 12 岁（写实期）</option>
              <option value="12+">12 岁以上（专业发展期）</option>
            </select>
            <p className="age-selector-hint">选择年龄段后，分析将结合蔺老师家庭美育体系按年龄精准解读</p>
          </div>
        </div>

        {/* Step 2: 选择画风 + 生成 */}
        <div className="flow-step interactive-card reveal-up" data-reveal>
          <div className="flow-step-label">
            <span className="step-num">2</span> 选择画风方向并生成优化图
          </div>
          <div className="flow-generate-row">
            {renderStyleSelector()}
            {/* 补充说明 */}
            <div className="guidance-note">
              <span className="guidance-note-label">💬 补充说明（可选）</span>
              <textarea
                className="guidance-note-input"
                placeholder="例如：希望背景更丰富一些、想让画面更有故事感、颜色可以更鲜艳……"
                value={guidanceNote}
                onChange={(e) => setGuidanceNote(e.target.value)}
                rows={3}
              />
            </div>
            <button
              className="guide-button"
              type="button"
              onClick={runGuidance}
              disabled={isGenerating || !childAge}
              title={!childAge ? "请先选择孩子年龄段" : ""}
            >
              {isGenerating ? (
                <RefreshCcw size={18} strokeWidth={2.2} />
              ) : (
                <Sparkles size={18} strokeWidth={2.2} />
              )}
              {isGenerating ? copy.guideGenerating : copy.guideAction}
            </button>
          </div>
        </div>

        {/* Step 3: 原画 vs 优化后 对比 */}
        {guidanceStatus !== "idle" && (
          <div className="flow-step interactive-card reveal-up" data-reveal>
            <div className="flow-step-label">
              <span className="step-num">3</span> 对比结果
              <span className="flow-status">{guidanceStatusText}</span>
              {displayStyleName && displayStyleName !== "自动匹配画风" && (
                <span className="flow-style">· {displayStyleName}</span>
              )}
            </div>
          <div className="compare-split">
            <div className="compare-pane">
              <span className="compare-label">{copy.original}</span>
              <button
                className="compare-image"
                type="button"
                onClick={() => openPreview(copy.original, preview)}
              >
                <img src={preview} alt={copy.artworkAlt} />
              </button>
            </div>
            <div className="compare-divider"><span>→</span></div>
            <div className="compare-pane">
              <span className="compare-label">{copy.guideResult}</span>
              {generatedImage ? (
                <button
                  className="compare-image"
                  type="button"
                  onClick={() => openPreview(copy.guideResult, generatedImage)}
                >
                  <img src={generatedImage} alt={copy.guideResult} />
                </button>
              ) : isGenerating ? (
                <div className="compare-skeleton">
                  <div className="skeleton-shimmer" />
                  <span>{copy.guideGenerating}</span>
                </div>
              ) : (
                <div className="compare-empty">
                  <ImageUp size={28} strokeWidth={1.8} />
                  <span>{copy.guideEmpty}</span>
                </div>
              )}
            </div>
          </div>

          {guidanceStatus === "error" && (
            <div className="guidance-error-block">
              <p className="guidance-error">{guidanceError || copy.guideFailedHint}</p>
              <button className="pill-button retry-button" type="button" onClick={runGuidance}>
                <RefreshCcw size={15} strokeWidth={2.1} /> 重新生成
              </button>
            </div>
          )}

          {guidanceStatus === "done" && planItems.length > 0 && (
            <div className="guide-plan-compact">
              {styleGuide ? (
                <div className="style-guide-note">
                  <span>{copy.matchedStyle}：{displayStyleName}</span>
                </div>
              ) : null}
              <div className="guide-plan-grid">
                {planItems.map((item) => (
                  <article className="guide-plan-item" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
        )}

        <input
          ref={inputRef}
          className="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  function togglePanel(key) {
    setExpandedPanels((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function renderStrengthCard() {
    if (!hasUploaded) return null;  // 未上传作品时不显示分析
    const strengthData = buildStrengthInsights(analysis);
    const strengthActions = buildStrengthActions();
    const projectionData = buildProjectionObservations(analysis);

    // 优先使用 AI 生成的 strength analysis，没有则回退到本地模板
    const aiStrength = analysis.strengthAnalysis;
    const talentProfile = buildTalentProfile(analysis, aiStrength?.talentType);
    const psychText = aiStrength?.psychology || strengthData.psychology;
    const devText = aiStrength?.development || strengthData.development;
    const familyText = aiStrength?.familyEducation || strengthData.familyEducation;

    // 天赋：AI 识别的名字 + 本地数据库补充详情
    const aiTalentName = aiStrength?.talentType;
    const aiTalentDesc = aiStrength?.talentDesc;
    const aiManifestations = aiStrength?.talentManifestations;
    const displayManifestations = (aiManifestations && aiManifestations.length >= 3)
      ? aiManifestations
      : talentProfile.manifestations;
    const talentContent = `${talentProfile.name}\n\n🔎 在画面中的表现：\n${displayManifestations.map((m, i) => `${i + 1}. ${m}`).join("\n\n")}\n\n📖 深度解读：\n${aiTalentDesc || talentProfile.desc}\n\n📌 成长建议：\n${talentProfile.growth.map((g, i) => `${i + 1}. ${g}`).join("\n\n")}\n\n👶 各年龄段培养重点：\n${Object.entries(talentProfile.byAge).map(([age, tip]) => `【${age}】${tip}`).join("\n\n")}\n\n💼 未来可发展方向：\n${talentProfile.careers}\n\n${talentProfile.summary}`;

    // 投射观察：AI 生成优先
    const projObs = aiStrength?.projectionObservations?.length
      ? aiStrength.projectionObservations
      : projectionData.observations;
    const projContent = projObs.map((o) => `【${o.label}】${o.text}`).join("\n")
      + `\n\n${projectionData.disclaimer}`;

    const perspectiveTabs = [
      { key: "talent", icon: talentProfile.icon || "🎨", label: "天赋识别", content: talentContent },
      { key: "psych", icon: "🧠", label: "心理学视角", content: psychText },
      { key: "dev", icon: "🌱", label: "成长规律", content: devText },
      { key: "family", icon: "🏠", label: "家庭美育", content: familyText },
      { key: "proj", icon: "🔍", label: "投射观察", content: projContent },
    ];

    const activeContent = perspectiveTabs.find((t) => t.key === activePerspective) || perspectiveTabs[0];

    return (
      <section className="strength-card interactive-card reveal-up" data-reveal aria-label={copy.strengthAnalysis}>
        <div className="perspective-tabs">
          {perspectiveTabs.map((tab) => (
            <button
              key={tab.key}
              className={`perspective-tab ${activePerspective === tab.key ? "active" : ""}`}
              type="button"
              onClick={() => setActivePerspective(tab.key)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="perspective-content" key={activePerspective}>
          <p>{activeContent.content}</p>
        </div>

        <div className="strength-actions-bar">
          <strong>
            <UserRound size={15} strokeWidth={2} />
            {copy.strengthActions}
          </strong>
          <div className="actions-scroll">
            {strengthActions.map((action, index) => (
              <div className="action-card" key={index}>
                <b>{index + 1}</b>
                <div>
                  <span>{action.step}</span>
                  <p>{action.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="strength-closing">{copy.strengthClosing}</p>
      </section>
    );
  }

  function renderTeacherCard() {
    return (
      <section className="teacher-card" aria-label={copy.teacherGuide}>
        <div className="card-title">
          <h2>{copy.teacherGuide}</h2>
          <span>{statusText}</span>
        </div>
        <p className="teacher-copy">
          {status === "analyzing"
            ? copy.analyzingCopy
            : safeGuideText(analysis.teacherCopy, defaultAnalysis.teacherCopy)}
        </p>
        <div className="feature-strip" aria-label={copy.observed}>
          <span>{copy.observed}</span>
          {analysis.tags.map((tag) => (
            <b key={tag}>{tag}</b>
          ))}
        </div>
      </section>
    );
  }

  function renderNextCard() {
    const nextSteps = safeStepList(analysis.nextSteps);

    return (
      <section className="next-card" aria-label={copy.nextTitle}>
        <h2>{copy.nextTitle}</h2>
        <div className="step-list">
          {nextSteps.map((step, index) => (
            <button className="step-row" type="button" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
              <ChevronRight size={19} strokeWidth={2.1} />
            </button>
          ))}
        </div>
      </section>
    );
  }

  function renderCompareCard() {
    return (
      <section className="compare-card" aria-label={copy.compareLabel}>
        <div className="compare-labels">
          <span>{copy.original}</span>
          <span>{copy.guided}</span>
        </div>
        <div className="compare-body">
          <div className="mini-art">
            <img src={preview} alt={copy.originalThumb} />
          </div>
          <span className="arrow-badge" aria-hidden="true">
            <ArrowRight size={22} strokeWidth={2} />
          </span>
          <button className="after-box" type="button" onClick={runAnalysis}>
            <Sparkles size={21} strokeWidth={2.1} />
            <span>{copy.afterText}</span>
          </button>
        </div>
      </section>
    );
  }

  function renderPageIntro(title, text) {
    return (
      <section className="page-intro">
        <h2>{title}</h2>
        <p>{text}</p>
      </section>
    );
  }

  function renderSkeletonCard() {
    const skeletonRows = [
      [copy.visualCenter, analysis.skeleton?.visualCenter || copy.visualCenterHint],
      [copy.flowLine, analysis.skeleton?.flowLine || copy.flowLineHint],
      [copy.balance, analysis.skeleton?.balance || copy.balanceHint],
      [copy.depth, analysis.skeleton?.depth || copy.depthHint],
    ];

    return (
      <section className="skeleton-card" aria-label={copy.compositionSkeleton}>
        <div className="section-heading">
          <div>
            <h2>{copy.compositionSkeleton}</h2>
            <span>{copy.compositionGuideImage}</span>
          </div>
          <button
            className="pill-button"
            type="button"
            onClick={() => skeletonGuideInputRef.current?.click()}
          >
            <ImageUp size={16} strokeWidth={2.2} />
            {copy.uploadSkeletonGuide}
          </button>
        </div>

        <div className="skeleton-compare-grid">
          <article>
            <strong>{copy.original}</strong>
            <div className="skeleton-image">
              <img src={preview} alt={copy.artworkAlt} />
            </div>
          </article>
          <article>
            <strong>{copy.guided}</strong>
            {skeletonGuidePreview ? (
              <div className="skeleton-image">
                <img src={skeletonGuidePreview} alt={copy.skeletonGuideAlt} />
              </div>
            ) : (
              <button
                className="skeleton-empty"
                type="button"
                onClick={() => skeletonGuideInputRef.current?.click()}
              >
                <ImageUp size={22} strokeWidth={2.1} />
                <span>{copy.noSkeletonGuide}</span>
              </button>
            )}
          </article>
        </div>

        <div className="skeleton-list">
          {skeletonRows.map(([label, text]) => (
            <article className="skeleton-row" key={label}>
              <strong>{label}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <input
          ref={skeletonGuideInputRef}
          className="file-input"
          type="file"
          accept="image/*"
          onChange={handleSkeletonGuideChange}
        />
      </section>
    );
  }

  function renderColorCard() {
    const colorPlan = analysis.colorPlan || defaultAnalysis.colorPlan;

    return (
      <section className="color-card" aria-label={copy.colorGuide}>
        <div className="section-heading">
          <div>
            <h2>{copy.colorGuide}</h2>
            <span>{copy.colorPalette}</span>
          </div>
          <button
            className="pill-button"
            type="button"
            onClick={() => colorResultInputRef.current?.click()}
          >
            <ImageUp size={16} strokeWidth={2.2} />
            {copy.uploadColorResult}
          </button>
        </div>

        <p className="color-summary">{colorPlan.summary}</p>

        <div className="palette-list" aria-label={copy.colorPalette}>
          {colorPlan.palette.map((item) => (
            <article className="palette-row" key={`${item.name}-${item.hex}`}>
              <span className="color-swatch" style={{ backgroundColor: item.hex }} />
              <div>
                <strong>{item.name}</strong>
                <p>{item.usage}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="color-note-group">
          <div>
            <h3>{copy.colorFocus}</h3>
            {colorPlan.focus.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div>
            <h3>{copy.colorSteps}</h3>
            {colorPlan.steps.map((item, index) => (
              <p key={item}>
                <b>{index + 1}</b>
                {item}
              </p>
            ))}
          </div>
        </div>

        <input
          ref={colorResultInputRef}
          className="file-input"
          type="file"
          accept="image/*"
          onChange={handleColorResultChange}
        />
      </section>
    );
  }

  function renderColorCompareCard() {
    return (
      <section className="color-effect-card" aria-label={copy.colorEffect}>
        <div className="section-heading">
          <div>
            <h2>{copy.colorEffect}</h2>
            <span>{copy.compareLabel}</span>
          </div>
        </div>

        <div className="effect-compare-grid">
          <article>
            <strong>{copy.original}</strong>
            <div className="effect-image">
              <img src={preview} alt={copy.artworkAlt} />
            </div>
          </article>
          <article>
            <strong>{copy.guided}</strong>
            {colorResultPreview ? (
              <div className="effect-image">
                <img src={colorResultPreview} alt={copy.colorResultAlt} />
              </div>
            ) : (
              <button
                className="effect-empty"
                type="button"
                onClick={() => colorResultInputRef.current?.click()}
              >
                <ImageUp size={22} strokeWidth={2.1} />
                <span>{copy.noColorResult}</span>
              </button>
            )}
          </article>
        </div>
      </section>
    );
  }

  function renderRecordCard() {
    return (
      <section className="record-card" aria-label={copy.analysisRecord}>
        <div className="section-heading">
          <div>
            <h2>{copy.analysisRecord}</h2>
            <span>
              {records.length
                ? `${records.length} ${copy.recordUnit}`
                : copy.noSavedRecords}
            </span>
          </div>
          <button className="pill-button" type="button" onClick={handleSave}>
            <Save size={16} strokeWidth={2.2} />
            {copy.save}
          </button>
        </div>

        <article className="record-current">
          <div className="record-thumb">
            <img src={preview} alt={copy.currentArtwork} />
          </div>
          <div>
            <strong>{copy.currentAnalysis}</strong>
            <p>{safeGuideText(analysis.teacherCopy, defaultAnalysis.teacherCopy)}</p>
          </div>
        </article>

        <div className="record-list">
          {records.length === 0 ? (
            <div className="empty-record">
              <BookOpen size={26} strokeWidth={1.9} />
              <strong>{copy.noSavedRecords}</strong>
              <p>{copy.noSavedRecordsHint}</p>
            </div>
          ) : (
            records.map((record) => (
              <article className="record-item" key={record.id}>
                <div className="record-thumb small">
                  <img src={record.preview} alt={record.fileName} />
                </div>
                <div>
                  <strong>{record.fileName}</strong>
                  <span>{record.savedAt}</span>
                  <p>{safeStepList(record.analysis.nextSteps)[0]}</p>
                </div>
              </article>
            ))
          )}
        </div>

        {/* 生成历史记录 */}
        <div className="section-heading" style={{ marginTop: 18 }}>
          <div>
            <h2>{copy.generationHistory}</h2>
            <span>
              {guidanceHistory.length
                ? `${guidanceHistory.length} ${copy.recordUnit}`
                : copy.noGenerationHistory}
            </span>
          </div>
        </div>

        <p style={{ margin: "0 0 10px", color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.65 }}>
          {copy.generationHistoryHint}
        </p>

        <div className="record-list">
          {guidanceHistory.length === 0 ? (
            <div className="empty-record">
              <Sparkles size={26} strokeWidth={1.9} />
              <strong>{copy.noGenerationHistory}</strong>
              <p>{copy.noGenerationHistoryHint}</p>
            </div>
          ) : (
            guidanceHistory.map((entry) => (
              <article
                className="record-item history-item"
                key={entry.id}
                onClick={() => openPreview(`${entry.fileName} · ${entry.styleName}`, entry.generatedImage)}
              >
                <div className="record-thumb small">
                  <img src={entry.preview} alt={entry.fileName} />
                </div>
                <div>
                  <strong>{entry.fileName}</strong>
                  <span>{entry.createdAt} · {entry.styleName}</span>
                  <p>
                    <span className="history-talent-chip">{entry.talentIcon} {entry.talentType}</span>
                  </p>
                </div>
                <div className="history-gen-thumb">
                  <img src={entry.generatedImage} alt={copy.guideResult} />
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    );
  }

  function renderRecordsView() {
    return (
      <section className="records-page">
        {/* ── 已保存分析记录 ── */}
        <div className="section-heading">
          <h2>📋 分析记录</h2>
          <span>{records.length ? `${records.length} 条` : "暂无"}</span>
        </div>

        <div className="record-list">
          {records.length === 0 ? (
            <div className="empty-record">
              <BookOpen size={30} strokeWidth={1.6} />
              <strong>还没有保存记录</strong>
              <p>在分析页面点击右上角"保存记录"，分析结果会保存在这里。</p>
            </div>
          ) : (
            records.map((record) => (
              <article
                className="record-item"
                key={record.id}
                onClick={() => { if (record.preview) openPreview(record.fileName, record.preview); }}
                onContextMenu={(e) => { e.preventDefault(); if (confirm("删除这条记录？")) deleteRecord(record.id); }}
              >
                <div className="record-thumb small">
                  {record.preview ? (
                    <img src={record.preview} alt={record.fileName} />
                  ) : (
                    <FileText size={28} strokeWidth={1.5} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>{record.fileName}</strong>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{record.savedAt}</span>
                  {record.analysis?.teacherCopy && (
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {safeGuideText(record.analysis.teacherCopy, "")}
                    </p>
                  )}
                </div>
                <button
                  className="record-delete-btn"
                  onClick={(e) => { e.stopPropagation(); if (confirm("确定删除？")) deleteRecord(record.id); }}
                  title="删除"
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                </button>
              </article>
            ))
          )}
        </div>

        {/* ── 生成历史 ── */}
        <div className="section-heading" style={{ marginTop: 24 }}>
          <h2>🖼️ 生成历史</h2>
          <span>{guidanceHistory.length ? `${guidanceHistory.length} 张` : "暂无"}</span>
        </div>

        <div className="record-list">
          {guidanceHistory.length === 0 ? (
            <div className="empty-record">
              <Sparkles size={30} strokeWidth={1.6} />
              <strong>还没有生成记录</strong>
              <p>上传作品后点击"建议指导"，生成的优化图会自动保存在这里。</p>
            </div>
          ) : (
            guidanceHistory.map((entry) => (
              <article
                className="record-item history-item"
                key={entry.id}
                onClick={() => openPreview(`${entry.fileName} · ${entry.styleName}`, entry.generatedImage)}
              >
                <div className="record-thumb small">
                  <img src={entry.preview} alt={entry.fileName} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>{entry.fileName}</strong>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{entry.createdAt} · {entry.styleName}</span>
                  <p style={{ margin: "4px 0 0" }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent)", fontSize: 12, fontWeight: 600 }}>
                      {entry.talentIcon} {entry.talentType}
                    </span>
                  </p>
                </div>
                <div className="history-gen-thumb">
                  <img src={entry.generatedImage} alt="优化图" />
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    );
  }

  return (
    <main className="app-shell">
      <section className="web-app" aria-label={copy.appLabel}>
        <div className="app-layout">
          {/* ===== 可折叠侧边栏 ===== */}
          <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${pageScrolled ? "scrolled" : ""}`}>
            {/* ── 顶部：用户区 ── */}
            <div className="sidebar-section sidebar-top">
              {userLoggedIn ? (
                <div className="sidebar-user">
                  <div className="sidebar-avatar">
                    <User size={22} strokeWidth={1.8} />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="sidebar-user-info">
                      <span className="sidebar-username">{authUser?.email || "用户"}</span>
                      <span className="sidebar-user-role">已登录</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="sidebar-auth">
                  <button
                    className="sidebar-btn sidebar-btn-primary"
                    type="button"
                    onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
                    title="登录"
                  >
                    <LogIn size={18} strokeWidth={2} />
                    {!sidebarCollapsed && <span>登录</span>}
                  </button>
                  {!sidebarCollapsed && (
                    <button
                      className="sidebar-btn sidebar-btn-outline"
                      type="button"
                      onClick={() => { setAuthMode("register"); setShowAuthModal(true); }}
                      title="注册"
                    >
                      <UserPlus size={18} strokeWidth={2} />
                      <span>注册</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── 分隔线 ── */}
            <div className="sidebar-divider" />

            {/* ── 中部：快捷工具 ── */}
            <div className="sidebar-section sidebar-tools">
              {!sidebarCollapsed && (
                <span className="sidebar-section-title">快捷工具</span>
              )}
              <div className="sidebar-actions">
                <button
                  className="sidebar-action"
                  type="button"
                  onClick={handleSave}
                  title={copy.save}
                >
                  <Save size={19} strokeWidth={1.9} />
                  <span className="sidebar-label">{saved ? copy.saved : copy.save}</span>
                  {saved && <span className="sidebar-badge">✓</span>}
                </button>

                <button
                  className="sidebar-action"
                  type="button"
                  onClick={runAnalysis}
                  disabled={status === "analyzing" || !childAge}
                  title={!childAge ? "请先选择孩子年龄段" : "重新分析"}
                >
                  <RefreshCcw size={19} strokeWidth={1.9} className={status === "analyzing" ? "spinning" : ""} />
                  <span className="sidebar-label">重新分析</span>
                </button>

                <button
                  className={`sidebar-action ${extractingStatus === "loading" ? "active" : ""}`}
                  type="button"
                  onClick={handleExtractFigures}
                  disabled={extractingStatus === "loading"}
                  title="AI提取画面形象"
                >
                  <Scan size={19} strokeWidth={1.9} className={extractingStatus === "loading" ? "spinning" : ""} />
                  <span className="sidebar-label">AI提取形象</span>
                </button>

                <button
                  className="sidebar-action"
                  type="button"
                  onClick={openReport}
                  title="保存学员测评单"
                >
                  <FileImage size={19} strokeWidth={1.9} />
                  <span className="sidebar-label">保存测评单</span>
                </button>

                <button
                  className="sidebar-action"
                  type="button"
                  onClick={() => setShowWorkspace(true)}
                  title="画布工作台"
                  disabled={guidanceResults.length === 0}
                >
                  <Palette size={19} strokeWidth={1.9} />
                  <span className="sidebar-label">画布工作台</span>
                </button>
              </div>
            </div>

            {/* ── 底部弹性空间 ── */}
            <div className="sidebar-spacer" />

            {/* ── 积分显示（收费模式）── */}
            {!freeMode && (
              <>
                <div className="sidebar-divider" />
                <div className="sidebar-section">
                  {!sidebarCollapsed && (
                    <span className="sidebar-section-title">算力积分</span>
                  )}
                  <div className="sidebar-credit">
                    <span className="credit-badge">{credits}</span>
                    {!sidebarCollapsed && <span className="credit-label">次剩余</span>}
                  </div>
                  <button
                    className="sidebar-btn sidebar-btn-primary"
                    type="button"
                    onClick={openRecharge}
                    style={{ width: "100%", marginTop: 8 }}
                  >
                {sidebarCollapsed ? "+" : "充值"}
              </button>
            </div>
              </>
            )}

            {/* ── 底部分隔线 ── */}
            <div className="sidebar-divider" />

            {/* ── 底部：设置 + 折叠 ── */}
            <div className="sidebar-section sidebar-bottom">
              <button
                className="sidebar-action"
                type="button"
                onClick={() => setShowSettings(true)}
                title="设置"
              >
                <Settings size={19} strokeWidth={1.9} />
                <span className="sidebar-label">设置</span>
              </button>

              {userLoggedIn && (
                <button
                  className="sidebar-action sidebar-action-logout"
                  type="button"
                  onClick={handleLogout}
                  title="退出登录"
                >
                  <LogOut size={19} strokeWidth={1.9} />
                  <span className="sidebar-label">退出登录</span>
                </button>
              )}

              <button
                className="sidebar-action sidebar-toggle-btn"
                type="button"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                aria-label={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
                title={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen size={19} strokeWidth={1.9} />
                ) : (
                  <PanelLeftClose size={19} strokeWidth={1.9} />
                )}
                <span className="sidebar-label">{sidebarCollapsed ? "展开" : "折叠"}</span>
              </button>
            </div>
          </aside>

          {/* ── 设置弹窗 ── */}
          {showSettings && (
            <div className="settings-overlay" onClick={() => setShowSettings(false)}>
              <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                  <h2>⚙️ 设置</h2>
                  <button type="button" onClick={() => setShowSettings(false)}>
                    <X size={20} strokeWidth={2} />
                  </button>
                </div>
                <div className="settings-body">
                  <div className="settings-group">
                    <label className="settings-item">
                      <span>账户状态</span>
                      <span className="settings-value">{userLoggedIn ? `已登录 · ${authUser?.email || ""}` : "未登录"}</span>
                    </label>
                    {!userLoggedIn && (
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <button className="sidebar-btn sidebar-btn-primary" style={{ flex: 1 }} onClick={() => { setShowSettings(false); setAuthMode("login"); setShowAuthModal(true); }}>
                          登录
                        </button>
                        <button className="sidebar-btn sidebar-btn-outline" style={{ flex: 1 }} onClick={() => { setShowSettings(false); setAuthMode("register"); setShowAuthModal(true); }}>
                          注册
                        </button>
                      </div>
                    )}
                    {userLoggedIn && (
                      <div style={{ marginBottom: 8 }}>
                        <button className="sidebar-btn sidebar-btn-outline" style={{ width: "100%" }} onClick={handleLogout}>
                          退出登录
                        </button>
                      </div>
                    )}
                    <div className="settings-item">
                      <span>当前作品</span>
                      <span className="settings-value">{fileName}</span>
                    </div>
                    <div className="settings-item">
                      <span>已保存记录</span>
                      <span className="settings-value">{records.length} 条</span>
                    </div>
                    <div className="settings-item">
                      <span>收藏作品</span>
                      <span className="settings-value">{favorites.length} 幅</span>
                    </div>
                  </div>
                </div>
                <div className="settings-footer">
                  <span>儿童美育一对一点评指导网 v1.0</span>
                </div>
              </div>
            </div>
          )}

          {/* ── 算力充值弹窗 ── */}
          {showRecharge && (
            <div className="settings-overlay" onClick={() => setShowRecharge(false)}>
              <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                  <h2>⚡ 算力充值</h2>
                  <button type="button" onClick={() => setShowRecharge(false)}>
                    <X size={20} strokeWidth={2} />
                  </button>
                </div>
                <div className="settings-body">
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <span style={{ fontSize: 15, color: "var(--text-secondary)" }}>当前剩余算力</span>
                    <div style={{ fontSize: 48, fontWeight: 800, color: "var(--accent)", lineHeight: 1.2 }}>{credits}</div>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>次分析</span>
                  </div>

                  <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "var(--text-primary)" }}>
                    📦 选择算力包
                  </p>
                  <div style={{ display: "grid", gap: 10 }}>
                    {[
                      { id: "pkg_10", credits: 10, hot: false },
                      { id: "pkg_30", credits: 30, hot: true },
                      { id: "pkg_100", credits: 100, hot: false },
                      { id: "pkg_200", credits: 200, hot: false },
                    ].map((pkg) => (
                      <div
                        key={pkg.id}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "14px 16px", border: pkg.hot ? "2px solid var(--accent)" : "1px solid var(--border)",
                          borderRadius: 14, background: pkg.hot ? "var(--accent-soft)" : "#fff",
                          cursor: "pointer",
                        }}
                        onClick={() => handleRecharge(pkg.id)}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <strong style={{ fontSize: 20 }}>{pkg.credits}</strong>
                          <span style={{ fontSize: 15, color: "var(--text-secondary)" }}>次分析</span>
                          {pkg.hot && (
                            <span style={{ padding: "2px 8px", borderRadius: 6, background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 700 }}>推荐</span>
                          )}
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
                          ¥{(pkg.credits * unitPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 10, color: "var(--text-primary)" }}>
                    ✏️ 自定义算力数量
                  </p>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "14px 16px", border: "1px solid var(--border)",
                    borderRadius: 14, background: "#fff",
                  }}>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      step={10}
                      value={customCredits}
                      onChange={(e) => setCustomCredits(Math.max(10, Math.min(1000, parseInt(e.target.value) || 10)))}
                      style={{
                        flex: 1, border: "none", outline: "none", fontSize: 20, fontWeight: 700,
                        background: "transparent", textAlign: "center",
                      }}
                    />
                    <span style={{ fontSize: 15, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>次分析</span>
                    <span style={{ fontSize: 14, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      ≈ ¥{(customCredits * unitPrice).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRecharge("custom")}
                      className="sidebar-btn sidebar-btn-primary"
                      style={{ padding: "8px 16px", fontSize: 14, whiteSpace: "nowrap" }}
                    >
                      充值
                    </button>
                  </div>

                  <p style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    选择算力包或自定义数量后跳转支付页面。支付完成后刷新页面，算力自动到账。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── 登录/注册弹窗 ── */}
          {showAuthModal && (
            <div className="settings-overlay" onClick={() => setShowAuthModal(false)}>
              <div className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
                <div className="settings-header">
                  <h2>{authMode === "register" ? "📧 注册新账户" : "📧 登录"}</h2>
                  <button type="button" onClick={() => setShowAuthModal(false)}>
                    <X size={20} strokeWidth={2} />
                  </button>
                </div>
                <div className="settings-body">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const email = e.target.email.value.trim();
                      const password = e.target.password.value.trim();
                      const inviteCode = e.target.inviteCode?.value?.trim() || "";
                      handleAuthSubmit(email, password, inviteCode);
                    }}
                    style={{ display: "flex", flexDirection: "column", gap: 14 }}
                  >
                    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>邮箱</span>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        style={{
                          padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border-strong)",
                          fontSize: 16, outline: "none",
                        }}
                      />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>密码</span>
                      <input
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        placeholder="至少 6 个字符"
                        style={{
                          padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border-strong)",
                          fontSize: 16, outline: "none",
                        }}
                      />
                    </label>
                    {authMode === "register" && (
                      <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>邀请码</span>
                        <input
                          name="inviteCode"
                          type="text"
                          required
                          placeholder="请输入邀请码"
                          style={{
                            padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border-strong)",
                            fontSize: 16, outline: "none", textTransform: "uppercase", letterSpacing: 2,
                          }}
                        />
                      </label>
                    )}
                    {authError && (
                      <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{authError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="sidebar-btn sidebar-btn-primary"
                      style={{ width: "100%", padding: "12px 0", fontSize: 16 }}
                    >
                      {authLoading ? "处理中..." : authMode === "register" ? "注册" : "登录"}
                    </button>
                  </form>
                  <p style={{ textAlign: "center", marginTop: 14, fontSize: 14, color: "var(--text-secondary)" }}>
                    {authMode === "register" ? "已有账户？" : "还没有账户？"}
                    <button
                      type="button"
                      onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setAuthError(""); }}
                      style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 700, padding: 0, marginLeft: 4, fontSize: 14 }}
                    >
                      {authMode === "register" ? "去登录" : "去注册"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── AI 提取形象结果弹窗 ── */}
          {(extractedFigures || extractingStatus === "loading" || extractingStatus === "error") && (
            <div className="extract-overlay" onClick={closeExtraction}>
              <div className="extract-modal" onClick={(e) => e.stopPropagation()}>
                <div className="extract-header">
                  <h2>
                    <Scan size={20} strokeWidth={2} />
                    AI 提取画面形象
                  </h2>
                  <button type="button" onClick={closeExtraction}>
                    <X size={20} strokeWidth={2} />
                  </button>
                </div>

                <div className="extract-body">
                  {extractingStatus === "loading" && (
                    <div className="extract-loading">
                      <RefreshCcw size={32} strokeWidth={2} className="spinning" />
                      <p>AI 正在识别画面中的所有形象……</p>
                      <span>这个过程需要几秒钟，请耐心等待</span>
                    </div>
                  )}

                  {extractingStatus === "error" && (
                    <div className="extract-error">
                      <p>❌ {extractingError}</p>
                      <button className="pill-button retry-button" type="button" onClick={handleExtractFigures}>
                        <RefreshCcw size={15} strokeWidth={2.1} /> 重新提取
                      </button>
                    </div>
                  )}

                  {extractingStatus === "done" && extractedFigures && (
                    <>
                      {/* 总结 */}
                      <div className="extract-summary">
                        <Scan size={18} strokeWidth={1.8} />
                        <p>{extractedFigures.summary}</p>
                      </div>

                      {/* 统计 */}
                      <div className="extract-stats">
                        <span>共识别 <strong>{extractedFigures.totalCount}</strong> 个形象</span>
                      </div>

                      {/* 形象列表 */}
                      <div className="extract-list">
                        {extractedFigures.figures.map((figure, index) => (
                          <div className="extract-card" key={index}>
                            <div className="extract-card-header">
                              <span className="extract-index">{index + 1}</span>
                              <span className="extract-name">{figure.name}</span>
                              <span className={`extract-type extract-type-${(figure.type || "其他")}`}>
                                {figure.type}
                              </span>
                            </div>
                            <p className="extract-desc">{figure.description}</p>
                            <div className="extract-meta">
                              <span>📍 {figure.position}</span>
                              <span>🎨 {figure.color}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="extract-footer">
                  <button className="sidebar-btn sidebar-btn-primary" type="button" onClick={closeExtraction}>
                    完成
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── 学员测评单弹窗 ── */}
          {showReport && (
            <div className="report-overlay" onClick={closeReport}>
              <div className="report-modal report-a4" ref={reportRef} onClick={(e) => e.stopPropagation()}>
                <div className="report-pages">
                  <div className="report-sheet report-page">
                    <div className="report-header">
                      <span className="report-kicker">成长观察档案</span>
                      <h1>学员测评单</h1>
                      <p className="report-header-note">保留孩子原画表达，在原有手绘基础上完成构图、内容与色彩的优化建议。</p>
                      <div className="report-meta">
                        <span>作品：{fileName}</span>
                        <span>年龄段：{reportAgeLabel}</span>
                        <span>日期：{new Date().toLocaleDateString("zh-CN")}</span>
                      </div>
                      <div className="report-brand">儿童美育一对一点评指导网</div>
                    </div>

                    <div className="report-body">
                      <div className="report-summary-strip">
                        <div className="report-summary-item">
                          <span className="report-summary-label">本次风格</span>
                          <strong>{reportStyleName || "自动匹配画风"}</strong>
                        </div>
                        <div className="report-summary-item">
                          <span className="report-summary-label">优势方向</span>
                          <strong>{reportTalentProfile.icon} {reportTalentProfile.name}</strong>
                        </div>
                        <div className="report-summary-item">
                          <span className="report-summary-label">测评状态</span>
                          <strong>{analysisSource === "ai" ? "AI深度分析" : analysisSource === "local" ? "本地快速分析" : "分析中"}</strong>
                        </div>
                      </div>

                      <div className="report-compare">
                        <div className="report-image-col">
                          <span className="report-image-label">原画</span>
                          <div className="report-image-box">
                            <img src={preview} alt="原画" />
                          </div>
                        </div>
                        <div className="report-image-col">
                          <span className="report-image-label">优化图</span>
                          <div className="report-image-box">
                            {guidanceResults.length > 0 ? (
                              <img src={guidanceResults[0].image} alt="优化图" />
                            ) : (
                              <div className="report-image-empty">请先生成优化图</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {guidanceResults.length > 0 ? (
                        <>
                          <div className="report-section">
                            <h3>💬 老师点评</h3>
                            <p>{safeGuideText(analysis.teacherCopy, defaultAnalysis.teacherCopy)}</p>
                            <div className="report-tags">
                              {analysis.tags.map((tag) => (
                                <span key={tag}>{tag}</span>
                              ))}
                            </div>
                          </div>

                          <div className="report-section">
                            <h3>
                              {analysisSource === "pending" ? "⏳" : reportTalentProfile.icon} 天赋识别
                              {analysisSource === "pending" ? " — 正在从12种天赋中匹配…" : `：${reportTalentProfile.name}`}
                            </h3>
                            {analysisSource === "pending" ? (
                              <p className="report-desc">AI 老师正在逐条辨识画面中的每个元素、行为痕迹和思维特征，从12种天赋体系中选择最匹配的方向…</p>
                            ) : (
                              <>
                                <p>{reportTalentProfile.traits}</p>
                                <p className="report-desc">{reportTalentProfile.desc}</p>
                                {analysisSource === "local" && (
                                  <p className="report-note" style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8, lineHeight: 1.65 }}>
                                    ⚠️ 当前为本地初步分析。AI 深度天赋识别正在后台运行，完成后将自动更新。
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          <div className="report-section-grid">
                            <div className="report-section">
                              <h3>🧠 心理学视角</h3>
                              <p>{reportPsychology}</p>
                            </div>
                            <div className="report-section">
                              <h3>🌱 成长规律</h3>
                              <p>{reportDevelopment}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="report-section report-section-placeholder">
                          <h3>📍 当前状态</h3>
                          <p>请先点击“建议指导”生成优化图，系统会自动补全分页测评内容。</p>
                        </div>
                      )}
                    </div>

                    <div className="report-page-end">
                      <span>第 1 页</span>
                      <span>作品总览</span>
                    </div>
                  </div>

                  {guidanceResults.length > 0 && (
                    <div className="report-sheet report-page">
                      <div className="report-page-header">
                        <strong>深度解读</strong>
                        <span>第 2 页</span>
                      </div>

                      <div className="report-body">
                        <div className="report-section">
                          <h3>🏠 家庭美育</h3>
                          <p>{reportFamilyEducation}</p>
                        </div>

                        <div className="report-section">
                          <h3>🔍 投射观察</h3>
                          {reportProjectionObservations.map((o, i) => (
                            <p key={i}><strong>{o.label}：</strong>{o.text}</p>
                          ))}
                          <p className="report-desc">{reportProjectionData.disclaimer}</p>
                        </div>

                        <div className="report-section">
                          <h3>📌 给家长的五个行动建议</h3>
                          {buildStrengthActions().map((action, i) => (
                            <div className="report-action-item" key={i}>
                              <strong>{i + 1}. {action.step}</strong>
                              <p>{action.detail}</p>
                            </div>
                          ))}
                        </div>

                        <div className="report-footer">
                          <p>父母好好学习，孩子天天向上 —— 先看见孩子，再看见作品。</p>
                        </div>
                      </div>

                      <div className="report-page-end">
                        <span>第 2 页</span>
                        <span>深度分析与行动建议</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="report-actions no-print">
                  <button className="sidebar-btn sidebar-btn-primary" type="button" onClick={handleSaveReportImage}>
                    🖼️ 保存到相册
                  </button>
                  <button className="sidebar-btn sidebar-btn-primary" type="button" onClick={() => { closeReport(); setActiveTab("analysis"); }} style={{ background: "#333" }}>
                    ← 返回主页
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== 主内容区 ===== */}
          <div className="main-area">
            {/* Hero 头图 */}
        <div className={`hero ${pageScrolled ? "scrolled" : ""} reveal-up is-visible`}>
          <div className="hero-bg" />
          <div className="hero-content">
            <h1 className="hero-title">蔺老师—儿童美育一对一点评指导网</h1>
            <p className="hero-subtitle">
              从画面看见孩子 · 用优势滋养成长
            </p>
            <div className="hero-dots">
              <span className="hero-dot" style={{ background: "#FF6B4A" }} />
              <span className="hero-dot" style={{ background: "#F4C86A" }} />
              <span className="hero-dot" style={{ background: "#6E8FC7" }} />
              <span className="hero-dot" style={{ background: "#F59E0B" }} />
            </div>
          </div>
          {/* 装饰元素 */}
          <div className="hero-shape hero-shape-1" />
          <div className="hero-shape hero-shape-2" />
          <div className="hero-shape hero-shape-3" />
        </div>

        {/* ── 顶部设置按钮 ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 14px 0", position: "sticky", top: 0, zIndex: 5, background: "var(--page-bg)" }}>
          <button className="tab-btn" onClick={() => setShowSettings(true)} style={{ fontSize: 16, padding: "8px 14px" }}>
            ⚙️
          </button>
        </div>

        <div className="content upload-layout" style={{ display: activeTab === "analysis" ? "block" : "none" }}>
          {renderUploadFlow()}
          {renderStrengthCard()}
        </div>
        <div className="content upload-layout" style={{ display: activeTab === "records" ? "block" : "none" }}>
          {renderRecordsView()}
        </div>

        {previewImage ? (
          <div className="preview-modal fade-in" role="dialog" aria-modal="true">
            <button
              className="preview-backdrop"
              type="button"
              onClick={closePreview}
              aria-label={copy.closePreview}
            />
            <div className="preview-dialog">
              <div className="preview-toolbar">
                <strong>{previewImage.title}</strong>
                <button type="button" onClick={closePreview} aria-label={copy.closePreview}>
                  <X size={21} strokeWidth={2.2} />
                </button>
              </div>
              <div className="preview-stage">
                <img src={previewImage.src} alt={previewImage.title} />
              </div>
            </div>
          </div>
        ) : null}

        {/* ── 画布工作台弹窗 ── */}
        {renderWorkspaceModal()}
          </div>{/* main-area */}
        </div>{/* app-layout */}
        {/* ── 手机端底部导航 ── */}
        <nav className={`mobile-nav ${navHidden ? "nav-hidden" : ""}`}>
          <button className="mobile-nav-btn" onClick={() => setActiveTab("analysis")}>
            <Search size={20} strokeWidth={2} />
            <span>分析</span>
          </button>
          <button className="mobile-nav-btn" onClick={mobileSaveAndBack}>
            <Save size={20} strokeWidth={2} />
            <span>保存</span>
          </button>
          <button className="mobile-nav-btn" onClick={() => { setActiveTab("records"); loadRecords(); }}>
            <FileText size={20} strokeWidth={2} />
            <span>记录</span>
          </button>
        </nav>

      </section>
    </main>
  );
}
