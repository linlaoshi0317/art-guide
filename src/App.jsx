import { useMemo, useRef, useState } from "react";
import { Download, FileText, LogIn, RefreshCcw, Save, Search, Settings, Sparkles, Upload, X } from "lucide-react";

const GBS = 1;
const C = { newArtwork: "新作品", title: "蔺老师—儿童美育一对一点评指导网", saved: "已保存", save: "保存记录", replace: "更换", artworkAlt: "上传的孩子手绘作品", guideAction: "一键优化", guideGenerating: "正在生成优化图……", guideDone: "已生成优化图", guideFailed: "生成失败", guideFailedHint: "刚刚没生成成功，可以稍后重试。", guideEmpty: "上传作品后点「一键优化」生成优化图。", guideResult: "优化效果", strengthClosing: "父母好好学习，孩子天天向上——先看见孩子，再看见作品。", closePreview: "关闭", styleSelectTitle: "画风方向", styleSelectHint: "可以自动匹配或指定完成风格", styleAuto: "自动根据作品匹配", original: "原画", guided: "优化后", noSavedRecords: "暂无保存记录", noSavedRecordsHint: "分析完成后点「保存记录」在此查看", analysisRecord: "分析记录", justNow: "刚刚", generationHistory: "生成历史", generationHistoryHint: "每次「一键优化」生成的优化图会自动保存在这里", noGenerationHistory: "暂无生成记录", viewReport: "查看测评单", downloadReport: "下载测评单", reportTitle: "学员测评单" };

const styleGroups = [
  { label: "自动", options: [{ id: "auto", label: C.styleAuto, summary: "AI 先看孩子画的主题、线条、留白和颜色，再自动选最合适的完成方向。" }] },
  { label: "日系动画/插画", options: [
    { id: "jp-warm-animation", label: "日系温暖手绘动画", summary: "柔和水彩、自然背景、暖光空气感。", styleName: "日系温暖手绘动画", styleCategory: "warm Japanese-inspired hand-drawn animated film atmosphere", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用柔和水彩、暖光、浅绿、浅蓝和米白色。", compositionDirection: "保留原主体位置，用背景层次和小道具补完整。" },
    { id: "jp-clear-light", label: "日系通透光影", summary: "高饱和天空、透明光斑、清爽城市感。", styleName: "日系通透光影", styleCategory: "transparent anime light and sky illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "提高天空蓝、夕阳橙和亮部透明感。", compositionDirection: "用光线方向和远近景把视线带回主角。" },
    { id: "jp-soft-character", label: "日系柔和人物插画", summary: "五官柔和、发丝细腻、色调干净。", styleName: "日系柔和人物插画", styleCategory: "soft delicate anime character illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "肤色通透、眼睛和发色轻柔渐变。", compositionDirection: "强化脸部和上半身中心。" },
    { id: "jp-retro-cel", label: "90年代赛璐璐复古", summary: "清晰黑线、平涂色块、老动画质感。", styleName: "90年代赛璐璐复古", styleCategory: "retro cel animation flat color", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用平涂高纯色和硬边阴影。", compositionDirection: "用大色块分出主角、背景和装饰区。" },
    { id: "jp-thick-paint", label: "日系厚涂", summary: "色块堆叠、体积感强、光影厚实。", styleName: "日系厚涂", styleCategory: "anime painterly illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "用分层色块塑造体积。", compositionDirection: "让主体最大明暗对比集中在视觉中心。" },
    { id: "jp-flat-anime", label: "平涂二次元", summary: "干净纯色、少量阴影、线条精致。", styleName: "平涂二次元", styleCategory: "clean flat anime illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "用干净纯色加少量阴影。", compositionDirection: "用对齐的背景形状让画面更有秩序。" },
    { id: "jp-ukiyoe", label: "浮世绘和风", summary: "传统版画、波浪远山、平面化线条。", styleName: "浮世绘和风", styleCategory: "ukiyo-e inspired Japanese print", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用古朴蓝、米白、朱红和墨色。", compositionDirection: "用平面图案和大曲线组织留白。" },
  ]},
  { label: "欧美主流", options: [
    { id: "western-2d-fairytale", label: "欧美童话2D手绘", summary: "流畅曲线、饱满色彩、童话华丽感。", styleName: "欧美童话2D手绘", styleCategory: "western 2D fairytale hand-drawn animation", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用饱满但不刺眼的主色。", compositionDirection: "用优雅曲线把主角包围起来。" },
    { id: "western-3d-cartoon", label: "3D卡通写实", summary: "圆润体块、柔和材质、真实光影。", styleName: "3D卡通写实", styleCategory: "soft 3D cartoon realism", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用柔和材质色和清楚高光。", compositionDirection: "通过景深和投影建立前后空间。" },
    { id: "american-cartoon", label: "美式卡通", summary: "极简线条、大头比例、高饱和撞色。", styleName: "美式卡通", styleCategory: "bold American cartoon", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用高饱和撞色但主色稳定。", compositionDirection: "用大形状和强对比推到画面前面。" },
    { id: "vintage-illustration", label: "美式复古插画", summary: "油画质感、暖棕复古色、大气。", styleName: "美式复古插画", styleCategory: "vintage golden-age illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "用暖棕、奶油白、深绿和柔红。", compositionDirection: "用大块明暗关系稳定画面。" },
    { id: "comic-hero", label: "美式漫画", summary: "硬朗粗线、强明暗、速度线。", styleName: "美式漫画", styleCategory: "bold western comic-book illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用强明暗和鲜明主色。", compositionDirection: "用斜线动势和大对比增强冲击力。" },
  ]},
  { label: "国风画风", options: [
    { id: "cn-gongbi", label: "国风工笔", summary: "细腻线条、淡染花鸟、精致素雅。", styleName: "国风工笔", styleCategory: "Chinese gongbi fine-line painting", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用淡染色、浅青绿、胭脂和米白。", compositionDirection: "用留白和细线组织空间。" },
    { id: "cn-ink", label: "水墨国风", summary: "水墨晕染、留白写意、黑白层次。", styleName: "水墨国风", styleCategory: "Chinese ink wash painting", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "以墨色和浅淡色为主。", compositionDirection: "用留白和墨色浓淡分出前后景。" },
    { id: "cn-guochao", label: "新国潮平涂", summary: "传统纹样加现代高饱和色。", styleName: "新国潮平涂", styleCategory: "modern Chinese guochao flat illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用朱红、青绿、金黄、深蓝。", compositionDirection: "用对称、重复和纹样边框增强完整度。" },
    { id: "cn-dunhuang", label: "敦煌壁画风", summary: "矿物颜料、浓烈撞色、古典氛围。", styleName: "敦煌壁画风", styleCategory: "Dunhuang mural inspired mineral color", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用矿物感青绿、赭石、金黄、朱红。", compositionDirection: "用飘带和云纹形成视线流动。" },
  ]},
  { label: "其他特色", options: [
    { id: "oil-texture", label: "油画肌理", summary: "画布颗粒、厚重颜料、氛围浓郁。", styleName: "油画肌理", styleCategory: "oil painting texture", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用厚重色层和统一光源。", compositionDirection: "用大块明暗和背景色层整理画面重心。" },
    { id: "pixel-art", label: "像素画风", summary: "方块色块、复古游戏质感。", styleName: "像素画风", styleCategory: "pixel art game illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用有限色板和清楚色块。", compositionDirection: "用网格感和重复块面组织画面。" },
    { id: "clay-stop-motion", label: "黏土定格", summary: "立体黏土、哑光材质、手作质感。", styleName: "黏土定格", styleCategory: "clay stop-motion handmade scene", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用哑光黏土色和柔和阴影。", compositionDirection: "用立体前后关系和软投影增强空间。" },
    { id: "minimal-flat", label: "极简扁平", summary: "简约几何、无渐变、干净现代。", styleName: "极简扁平", styleCategory: "minimal flat geometric illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用两到三种主色。", compositionDirection: "用对齐、重复和大留白建立秩序感。" },
    { id: "gothic-dark", label: "哥特暗黑", summary: "低饱和冷色、尖锐线条。", styleName: "哥特暗黑", styleCategory: "soft gothic dark fantasy illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用低饱和紫、蓝灰、黑褐。", compositionDirection: "用尖形轮廓和明暗聚焦主角。" },
  ]},
];
const SO = styleGroups.flatMap(g => g.options);
const GSO = (id) => SO.find(o => o.id === id) || SO[0];
const SDN = (v) => v?.styleName || "自动匹配画风";

const DA = {
  teacherCopy: "",
  psychologyAnalysis: { emotionState: "", securityLevel: "", selfCognition: "", keyEvidence: [] },
  familyEducation: { parentInterference: "", strengthPotential: "", actionSuggestions: [] },
  projectionAnalysis: { attentionProjection: "", relationshipProjection: "", needProjection: "" },
  talentInsight: { primaryTalent: "", evidenceList: [] },
  parentWording: { shouldSay: [], shouldNotSay: [] },
};

function sn(v, fb = "") { if (typeof v !== "string") return fb; const t = v.trim(); return (!t || /[�锟]/.test(t)) ? fb : t; }
function TDU(input) { if (input.startsWith("data:image/")) return Promise.resolve(input); return fetch(input).then(r => { if (!r.ok) throw new Error("load_failed"); return r.blob(); }).then(b => new Promise((resolve, reject) => { const fr = new FileReader(); fr.onload = () => resolve(String(fr.result)); fr.onerror = () => reject(new Error("read_failed")); fr.readAsDataURL(b); })); }
async function API(url, body) { const headers = { "Content-Type": "application/json" }; try { const token = localStorage.getItem("art_token"); if (token) headers["Authorization"] = `Bearer ${token}`; } catch {} const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) }); const data = await resp.json().catch(() => ({})); if (!resp.ok) throw new Error(data.error || data.message || "请求失败"); return data; }
function NA(raw) { if (!raw || typeof raw !== "object") return DA; const pa = raw.psychologyAnalysis || {}, fe = raw.familyEducation || {}, pr = raw.projectionAnalysis || {}, ti = raw.talentInsight || {}, pw = raw.parentWording || {}; return { teacherCopy: sn(raw.teacherCopy, ""), psychologyAnalysis: { emotionState: sn(pa.emotionState), securityLevel: sn(pa.securityLevel), selfCognition: sn(pa.selfCognition), keyEvidence: Array.isArray(pa.keyEvidence) ? pa.keyEvidence.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [] }, familyEducation: { parentInterference: sn(fe.parentInterference), strengthPotential: sn(fe.strengthPotential), actionSuggestions: Array.isArray(fe.actionSuggestions) ? fe.actionSuggestions.filter(e => typeof e === "string" && e.trim()).slice(0, 5) : [] }, projectionAnalysis: { attentionProjection: sn(pr.attentionProjection), relationshipProjection: sn(pr.relationshipProjection), needProjection: sn(pr.needProjection) }, talentInsight: { primaryTalent: sn(ti.primaryTalent), evidenceList: Array.isArray(ti.evidenceList) ? ti.evidenceList.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [] }, parentWording: { shouldSay: Array.isArray(pw.shouldSay) ? pw.shouldSay.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [], shouldNotSay: Array.isArray(pw.shouldNotSay) ? pw.shouldNotSay.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [] } }; }
function FIA(dataUrl, origW, origH) { if (!origW || !origH) return Promise.resolve(dataUrl); return new Promise((resolve) => { const img = new Image(); img.onload = () => { const ir = img.width / img.height, tr = origW / origH; if (Math.abs(ir - tr) < .01) { resolve(dataUrl); return; } const c = document.createElement("canvas"); let cw, ch, sx, sy; if (ir > tr) { ch = img.height; cw = Math.round(img.height * tr); sx = Math.round((img.width - cw) / 2); sy = 0; } else { cw = img.width; ch = Math.round(img.width / tr); sx = 0; sy = Math.round((img.height - ch) / 2); } c.width = cw; c.height = ch; c.getContext("2d").drawImage(img, sx, sy, cw, ch, 0, 0, cw, ch); resolve(c.toDataURL("image/png")); }; img.onerror = () => resolve(dataUrl); img.src = dataUrl; }); }
// 等比缩放（不裁切），使图片完全容纳在目标尺寸内
function RESIZE(dataUrl, tw, th) { if (!tw || !th) return Promise.resolve(dataUrl); return new Promise((resolve) => { const img = new Image(); img.onload = () => { if (img.width === tw && img.height === th) { resolve(dataUrl); return; } const c = document.createElement("canvas"); c.width = tw; c.height = th; const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, tw, th); resolve(c.toDataURL("image/png")); }; img.onerror = () => resolve(dataUrl); img.src = dataUrl; }); }
// 获取图片尺寸
function GSZ(dataUrl) { return new Promise((resolve) => { const img = new Image(); img.onload = () => resolve({ w: img.width, h: img.height }); img.onerror = () => resolve(null); img.src = dataUrl; }); }

// Styles
const st = {
  page: { minHeight: "100vh", background: "linear-gradient(180deg, #faf8f5 0%, #f5f1eb 100%)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Noto Sans SC', sans-serif", WebkitFontSmoothing: "antialiased" },
  container: { maxWidth: 900, margin: "0 auto", padding: "0 20px 120px" },
  header: { textAlign: "center", padding: "44px 20px 28px", position: "relative" },
  h1: { fontSize: 24, margin: 0, color: "#1a1a1a", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3 },
  sub: { color: "#9b8c7c", fontSize: 14, marginTop: 6, fontWeight: 400, letterSpacing: "0.04em" },
  card: { background: "#ffffff", borderRadius: 20, padding: 22, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.04)" },
  stepLabel: { fontSize: 12, color: "#b8a99a", marginBottom: 14, letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 },
  stepNum: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 11, background: "#E07B39", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  placeholder: { border: "2px dashed #e8e0d5", borderRadius: 16, padding: "52px 20px", textAlign: "center", color: "#c4b8a8", fontSize: 16, letterSpacing: "0.06em", cursor: "pointer", fontWeight: 500, transition: "all 0.2s", background: "#fdfcf9" },
  img: { width: "100%", borderRadius: 14, maxHeight: 320, objectFit: "contain", background: "#faf8f5" },
  select: { width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #e8e0d5", fontSize: 14, marginBottom: 12, background: "#fdfcf9", color: "#3d3226", appearance: "none", WebkitAppearance: "none", outline: "none", cursor: "pointer" },
  btnPrimary: { width: "100%", padding: "15px 20px", background: "linear-gradient(135deg, #E07B39 0%, #d4692a 100%)", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 8px rgba(224,123,57,0.25)", transition: "all 0.2s", letterSpacing: "0.02em" },
  btnDisabled: { width: "100%", padding: "15px 20px", background: "#e8e0d5", color: "#b8a99a", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "0.02em" },
  btnSecondary: { padding: "11px 18px", background: "#f5f1eb", color: "#5c4a3a", border: "1.5px solid #e8e0d5", borderRadius: 12, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500, transition: "all 0.2s" },
  btnAccent: { padding: "11px 18px", background: "linear-gradient(135deg, #E07B39 0%, #d4692a 100%)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, boxShadow: "0 2px 6px rgba(224,123,57,0.2)" },
  h3: { margin: "0 0 10px", fontSize: 16, color: "#1a1a1a", fontWeight: 600, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8 },
  h4: { margin: "0 0 4px", fontSize: 13, color: "#9b8c7c", fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" },
  text: { color: "#4a3f35", lineHeight: 1.82, margin: 0, fontSize: 14 },
  textSmall: { color: "#9b8c7c", fontSize: 12, lineHeight: 1.7 },
  tag: { display: "inline-block", background: "#fdf3ea", color: "#c0652a", padding: "3px 10px", borderRadius: 10, fontSize: 11, marginRight: 6, marginBottom: 4, fontWeight: 500 },
  evidenceList: { paddingLeft: 18, margin: "4px 0 0", fontSize: 13, color: "#5c4a3a", lineHeight: 1.8 },
  actionList: { paddingLeft: 18, margin: "4px 0 0", fontSize: 13, color: "#5c4a3a", lineHeight: 1.8 },
  section: { marginBottom: 18 },
  divider: { height: 1, background: "#f0ebe0", margin: "8px 0 16px", border: "none" },
  nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-around", padding: "6px 0 16px", zIndex: 100 },
  navBtn: (active) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "none", color: active ? "#E07B39" : "#b8a99a", fontSize: 10, cursor: "pointer", padding: "6px 16px", fontWeight: active ? 600 : 400, transition: "all 0.2s" }),
  compareGrid: { display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 6, alignItems: "start" },
  compareLabel: { fontSize: 11, color: "#b8a99a", marginBottom: 6, textAlign: "center", fontWeight: 600, letterSpacing: "0.04em" },
  dividerIcon: { fontSize: 18, color: "#d4c8b8", padding: "0 4px", alignSelf: "center", marginTop: -12 },
  errorBox: { background: "#fef5f0", color: "#b8542a", padding: 14, borderRadius: 12, marginTop: 12, fontSize: 13, border: "1px solid #fde8d8" },
  recordItem: { display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid #f5f1eb", cursor: "pointer", transition: "background 0.15s" },
  thumb: { width: 52, height: 52, borderRadius: 12, objectFit: "cover", background: "#f5f1eb", flexShrink: 0 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modal: { background: "#fff", borderRadius: 24, maxWidth: 440, width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" },
  modalScroll: { overflow: "auto", padding: 24, flex: 1 },
  modalActions: { display: "flex", gap: 10, padding: 16, borderTop: "1px solid #f0ebe0" },
  resultActions: { display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" },import { useMemo, useRef, useState } from "react";
import { Download, FileText, LogIn, RefreshCcw, Save, Search, Settings, Sparkles, Upload, X } from "lucide-react";

const GBS = 1;
const C = { newArtwork: "新作品", title: "蔺老师—儿童美育一对一点评指导网", saved: "已保存", save: "保存记录", replace: "更换", artworkAlt: "上传的孩子手绘作品", guideAction: "一键优化", guideGenerating: "正在生成优化图……", guideDone: "已生成优化图", guideFailed: "生成失败", guideFailedHint: "刚刚没生成成功，可以稍后重试。", guideEmpty: "上传作品后点「一键优化」生成优化图。", guideResult: "优化效果", strengthClosing: "父母好好学习，孩子天天向上——先看见孩子，再看见作品。", closePreview: "关闭", styleSelectTitle: "画风方向", styleSelectHint: "可以自动匹配或指定完成风格", styleAuto: "自动根据作品匹配", original: "原画", guided: "优化后", noSavedRecords: "暂无保存记录", noSavedRecordsHint: "分析完成后点「保存记录」在此查看", analysisRecord: "分析记录", justNow: "刚刚", generationHistory: "生成历史", generationHistoryHint: "每次「一键优化」生成的优化图会自动保存在这里", noGenerationHistory: "暂无生成记录", viewReport: "查看测评单", downloadReport: "下载测评单", reportTitle: "学员测评单" };

const styleGroups = [
  { label: "自动", options: [{ id: "auto", label: C.styleAuto, summary: "AI 先看孩子画的主题、线条、留白和颜色，再自动选最合适的完成方向。" }] },
  { label: "日系动画/插画", options: [
    { id: "jp-warm-animation", label: "日系温暖手绘动画", summary: "柔和水彩、自然背景、暖光空气感。", styleName: "日系温暖手绘动画", styleCategory: "warm Japanese-inspired hand-drawn animated film atmosphere", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用柔和水彩、暖光、浅绿、浅蓝和米白色。", compositionDirection: "保留原主体位置，用背景层次和小道具补完整。" },
    { id: "jp-clear-light", label: "日系通透光影", summary: "高饱和天空、透明光斑、清爽城市感。", styleName: "日系通透光影", styleCategory: "transparent anime light and sky illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "提高天空蓝、夕阳橙和亮部透明感。", compositionDirection: "用光线方向和远近景把视线带回主角。" },
    { id: "jp-soft-character", label: "日系柔和人物插画", summary: "五官柔和、发丝细腻、色调干净。", styleName: "日系柔和人物插画", styleCategory: "soft delicate anime character illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "肤色通透、眼睛和发色轻柔渐变。", compositionDirection: "强化脸部和上半身中心。" },
    { id: "jp-retro-cel", label: "90年代赛璐璐复古", summary: "清晰黑线、平涂色块、老动画质感。", styleName: "90年代赛璐璐复古", styleCategory: "retro cel animation flat color", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用平涂高纯色和硬边阴影。", compositionDirection: "用大色块分出主角、背景和装饰区。" },
    { id: "jp-thick-paint", label: "日系厚涂", summary: "色块堆叠、体积感强、光影厚实。", styleName: "日系厚涂", styleCategory: "anime painterly illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "用分层色块塑造体积。", compositionDirection: "让主体最大明暗对比集中在视觉中心。" },
    { id: "jp-flat-anime", label: "平涂二次元", summary: "干净纯色、少量阴影、线条精致。", styleName: "平涂二次元", styleCategory: "clean flat anime illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "用干净纯色加少量阴影。", compositionDirection: "用对齐的背景形状让画面更有秩序。" },
    { id: "jp-ukiyoe", label: "浮世绘和风", summary: "传统版画、波浪远山、平面化线条。", styleName: "浮世绘和风", styleCategory: "ukiyo-e inspired Japanese print", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用古朴蓝、米白、朱红和墨色。", compositionDirection: "用平面图案和大曲线组织留白。" },
  ]},
  { label: "欧美主流", options: [
    { id: "western-2d-fairytale", label: "欧美童话2D手绘", summary: "流畅曲线、饱满色彩、童话华丽感。", styleName: "欧美童话2D手绘", styleCategory: "western 2D fairytale hand-drawn animation", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用饱满但不刺眼的主色。", compositionDirection: "用优雅曲线把主角包围起来。" },
    { id: "western-3d-cartoon", label: "3D卡通写实", summary: "圆润体块、柔和材质、真实光影。", styleName: "3D卡通写实", styleCategory: "soft 3D cartoon realism", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用柔和材质色和清楚高光。", compositionDirection: "通过景深和投影建立前后空间。" },
    { id: "american-cartoon", label: "美式卡通", summary: "极简线条、大头比例、高饱和撞色。", styleName: "美式卡通", styleCategory: "bold American cartoon", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用高饱和撞色但主色稳定。", compositionDirection: "用大形状和强对比推到画面前面。" },
    { id: "vintage-illustration", label: "美式复古插画", summary: "油画质感、暖棕复古色、大气。", styleName: "美式复古插画", styleCategory: "vintage golden-age illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "用暖棕、奶油白、深绿和柔红。", compositionDirection: "用大块明暗关系稳定画面。" },
    { id: "comic-hero", label: "美式漫画", summary: "硬朗粗线、强明暗、速度线。", styleName: "美式漫画", styleCategory: "bold western comic-book illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用强明暗和鲜明主色。", compositionDirection: "用斜线动势和大对比增强冲击力。" },
  ]},
  { label: "国风画风", options: [
    { id: "cn-gongbi", label: "国风工笔", summary: "细腻线条、淡染花鸟、精致素雅。", styleName: "国风工笔", styleCategory: "Chinese gongbi fine-line painting", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用淡染色、浅青绿、胭脂和米白。", compositionDirection: "用留白和细线组织空间。" },
    { id: "cn-ink", label: "水墨国风", summary: "水墨晕染、留白写意、黑白层次。", styleName: "水墨国风", styleCategory: "Chinese ink wash painting", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "以墨色和浅淡色为主。", compositionDirection: "用留白和墨色浓淡分出前后景。" },
    { id: "cn-guochao", label: "新国潮平涂", summary: "传统纹样加现代高饱和色。", styleName: "新国潮平涂", styleCategory: "modern Chinese guochao flat illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用朱红、青绿、金黄、深蓝。", compositionDirection: "用对称、重复和纹样边框增强完整度。" },
    { id: "cn-dunhuang", label: "敦煌壁画风", summary: "矿物颜料、浓烈撞色、古典氛围。", styleName: "敦煌壁画风", styleCategory: "Dunhuang mural inspired mineral color", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用矿物感青绿、赭石、金黄、朱红。", compositionDirection: "用飘带和云纹形成视线流动。" },
  ]},
  { label: "其他特色", options: [
    { id: "oil-texture", label: "油画肌理", summary: "画布颗粒、厚重颜料、氛围浓郁。", styleName: "油画肌理", styleCategory: "oil painting texture", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用厚重色层和统一光源。", compositionDirection: "用大块明暗和背景色层整理画面重心。" },
    { id: "pixel-art", label: "像素画风", summary: "方块色块、复古游戏质感。", styleName: "像素画风", styleCategory: "pixel art game illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用有限色板和清楚色块。", compositionDirection: "用网格感和重复块面组织画面。" },
    { id: "clay-stop-motion", label: "黏土定格", summary: "立体黏土、哑光材质、手作质感。", styleName: "黏土定格", styleCategory: "clay stop-motion handmade scene", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用哑光黏土色和柔和阴影。", compositionDirection: "用立体前后关系和软投影增强空间。" },
    { id: "minimal-flat", label: "极简扁平", summary: "简约几何、无渐变、干净现代。", styleName: "极简扁平", styleCategory: "minimal flat geometric illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用两到三种主色。", compositionDirection: "用对齐、重复和大留白建立秩序感。" },
    { id: "gothic-dark", label: "哥特暗黑", summary: "低饱和冷色、尖锐线条。", styleName: "哥特暗黑", styleCategory: "soft gothic dark fantasy illustration", sceneDirection: "添加与原画内容直接相关的背景。", colorDirection: "使用低饱和紫、蓝灰、黑褐。", compositionDirection: "用尖形轮廓和明暗聚焦主角。" },
  ]},
];
const SO = styleGroups.flatMap(g => g.options);
const GSO = (id) => SO.find(o => o.id === id) || SO[0];
const SDN = (v) => v?.styleName || "自动匹配画风";

const DA = {
  teacherCopy: "",
  psychologyAnalysis: { emotionState: "", securityLevel: "", selfCognition: "", keyEvidence: [] },
  familyEducation: { parentInterference: "", strengthPotential: "", actionSuggestions: [] },
  projectionAnalysis: { attentionProjection: "", relationshipProjection: "", needProjection: "" },
  talentInsight: { primaryTalent: "", evidenceList: [] },
  parentWording: { shouldSay: [], shouldNotSay: [] },
};

function sn(v, fb = "") { if (typeof v !== "string") return fb; const t = v.trim(); return (!t || /[�锟]/.test(t)) ? fb : t; }
function TDU(input) { if (input.startsWith("data:image/")) return Promise.resolve(input); return fetch(input).then(r => { if (!r.ok) throw new Error("load_failed"); return r.blob(); }).then(b => new Promise((resolve, reject) => { const fr = new FileReader(); fr.onload = () => resolve(String(fr.result)); fr.onerror = () => reject(new Error("read_failed")); fr.readAsDataURL(b); })); }
async function API(url, body) { const headers = { "Content-Type": "application/json" }; try { const token = localStorage.getItem("art_token"); if (token) headers["Authorization"] = `Bearer ${token}`; } catch {} const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) }); const data = await resp.json().catch(() => ({})); if (!resp.ok) throw new Error(data.error || data.message || "请求失败"); return data; }
function NA(raw) { if (!raw || typeof raw !== "object") return DA; const pa = raw.psychologyAnalysis || {}, fe = raw.familyEducation || {}, pr = raw.projectionAnalysis || {}, ti = raw.talentInsight || {}, pw = raw.parentWording || {}; return { teacherCopy: sn(raw.teacherCopy, ""), psychologyAnalysis: { emotionState: sn(pa.emotionState), securityLevel: sn(pa.securityLevel), selfCognition: sn(pa.selfCognition), keyEvidence: Array.isArray(pa.keyEvidence) ? pa.keyEvidence.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [] }, familyEducation: { parentInterference: sn(fe.parentInterference), strengthPotential: sn(fe.strengthPotential), actionSuggestions: Array.isArray(fe.actionSuggestions) ? fe.actionSuggestions.filter(e => typeof e === "string" && e.trim()).slice(0, 5) : [] }, projectionAnalysis: { attentionProjection: sn(pr.attentionProjection), relationshipProjection: sn(pr.relationshipProjection), needProjection: sn(pr.needProjection) }, talentInsight: { primaryTalent: sn(ti.primaryTalent), evidenceList: Array.isArray(ti.evidenceList) ? ti.evidenceList.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [] }, parentWording: { shouldSay: Array.isArray(pw.shouldSay) ? pw.shouldSay.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [], shouldNotSay: Array.isArray(pw.shouldNotSay) ? pw.shouldNotSay.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [] } }; }
function FIA(dataUrl, origW, origH) { if (!origW || !origH) return Promise.resolve(dataUrl); return new Promise((resolve) => { const img = new Image(); img.onload = () => { const ir = img.width / img.height, tr = origW / origH; if (Math.abs(ir - tr) < .01) { resolve(dataUrl); return; } const c = document.createElement("canvas"); let cw, ch, sx, sy; if (ir > tr) { ch = img.height; cw = Math.round(img.height * tr); sx = Math.round((img.width - cw) / 2); sy = 0; } else { cw = img.width; ch = Math.round(img.width / tr); sx = 0; sy = Math.round((img.height - ch) / 2); } c.width = cw; c.height = ch; c.getContext("2d").drawImage(img, sx, sy, cw, ch, 0, 0, cw, ch); resolve(c.toDataURL("image/png")); }; img.onerror = () => resolve(dataUrl); img.src = dataUrl; }); }
// 等比缩放（不裁切），使图片完全容纳在目标尺寸内
function RESIZE(dataUrl, tw, th) { if (!tw || !th) return Promise.resolve(dataUrl); return new Promise((resolve) => { const img = new Image(); img.onload = () => { if (img.width === tw && img.height === th) { resolve(dataUrl); return; } const c = document.createElement("canvas"); c.width = tw; c.height = th; const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, tw, th); resolve(c.toDataURL("image/png")); }; img.onerror = () => resolve(dataUrl); img.src = dataUrl; }); }
// 获取图片尺寸
function GSZ(dataUrl) { return new Promise((resolve) => { const img = new Image(); img.onload = () => resolve({ w: img.width, h: img.height }); img.onerror = () => resolve(null); img.src = dataUrl; }); }

// Styles
const st = {
  page: { minHeight: "100vh", background: "linear-gradient(180deg, #faf8f5 0%, #f5f1eb 100%)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Noto Sans SC', sans-serif", WebkitFontSmoothing: "antialiased" },
  container: { maxWidth: 900, margin: "0 auto", padding: "0 20px 120px" },
  header: { textAlign: "center", padding: "44px 20px 28px", position: "relative" },
  h1: { fontSize: 24, margin: 0, color: "#1a1a1a", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3 },
  sub: { color: "#9b8c7c", fontSize: 14, marginTop: 6, fontWeight: 400, letterSpacing: "0.04em" },
  card: { background: "#ffffff", borderRadius: 20, padding: 22, marginBottom: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.04)" },
  stepLabel: { fontSize: 12, color: "#b8a99a", marginBottom: 14, letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 },
  stepNum: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 11, background: "#E07B39", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  placeholder: { border: "2px dashed #e8e0d5", borderRadius: 16, padding: "52px 20px", textAlign: "center", color: "#c4b8a8", fontSize: 16, letterSpacing: "0.06em", cursor: "pointer", fontWeight: 500, transition: "all 0.2s", background: "#fdfcf9" },
  img: { width: "100%", borderRadius: 14, maxHeight: 320, objectFit: "contain", background: "#faf8f5" },
  select: { width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #e8e0d5", fontSize: 14, marginBottom: 12, background: "#fdfcf9", color: "#3d3226", appearance: "none", WebkitAppearance: "none", outline: "none", cursor: "pointer" },
  btnPrimary: { width: "100%", padding: "15px 20px", background: "linear-gradient(135deg, #E07B39 0%, #d4692a 100%)", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 8px rgba(224,123,57,0.25)", transition: "all 0.2s", letterSpacing: "0.02em" },
  btnDisabled: { width: "100%", padding: "15px 20px", background: "#e8e0d5", color: "#b8a99a", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "0.02em" },
  btnSecondary: { padding: "11px 18px", background: "#f5f1eb", color: "#5c4a3a", border: "1.5px solid #e8e0d5", borderRadius: 12, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500, transition: "all 0.2s" },
  btnAccent: { padding: "11px 18px", background: "linear-gradient(135deg, #E07B39 0%, #d4692a 100%)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, boxShadow: "0 2px 6px rgba(224,123,57,0.2)" },
  h3: { margin: "0 0 10px", fontSize: 16, color: "#1a1a1a", fontWeight: 600, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8 },
  h4: { margin: "0 0 4px", fontSize: 13, color: "#9b8c7c", fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" },
  text: { color: "#4a3f35", lineHeight: 1.82, margin: 0, fontSize: 14 },
  textSmall: { color: "#9b8c7c", fontSize: 12, lineHeight: 1.7 },
  tag: { display: "inline-block", background: "#fdf3ea", color: "#c0652a", padding: "3px 10px", borderRadius: 10, fontSize: 11, marginRight: 6, marginBottom: 4, fontWeight: 500 },
  evidenceList: { paddingLeft: 18, margin: "4px 0 0", fontSize: 13, color: "#5c4a3a", lineHeight: 1.8 },
  actionList: { paddingLeft: 18, margin: "4px 0 0", fontSize: 13, color: "#5c4a3a", lineHeight: 1.8 },
  section: { marginBottom: 18 },
  divider: { height: 1, background: "#f0ebe0", margin: "8px 0 16px", border: "none" },
  nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-around", padding: "6px 0 16px", zIndex: 100 },
  navBtn: (active) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "none", color: active ? "#E07B39" : "#b8a99a", fontSize: 10, cursor: "pointer", padding: "6px 16px", fontWeight: active ? 600 : 400, transition: "all 0.2s" }),
  compareGrid: { display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 6, alignItems: "start" },
  compareLabel: { fontSize: 11, color: "#b8a99a", marginBottom: 6, textAlign: "center", fontWeight: 600, letterSpacing: "0.04em" },
  dividerIcon: { fontSize: 18, color: "#d4c8b8", padding: "0 4px", alignSelf: "center", marginTop: -12 },
  errorBox: { background: "#fef5f0", color: "#b8542a", padding: 14, borderRadius: 12, marginTop: 12, fontSize: 13, border: "1px solid #fde8d8" },
  recordItem: { display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid #f5f1eb", cursor: "pointer", transition: "background 0.15s" },
  thumb: { width: 52, height: 52, borderRadius: 12, objectFit: "cover", background: "#f5f1eb", flexShrink: 0 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modal: { background: "#fff", borderRadius: 24, maxWidth: 440, width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" },
  modalScroll: { overflow: "auto", padding: 24, flex: 1 },
  modalActions: { display: "flex", gap: 10, padding: 16, borderTop: "1px solid #f0ebe0" },
  resultActions: { display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" },
