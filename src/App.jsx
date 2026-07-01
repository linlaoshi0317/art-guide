import { useMemo, useRef, useState } from "react";
import { Download, FileText, LogIn, RefreshCcw, Save, Search, Settings, Sparkles, Upload, X } from "lucide-react";
import "./html2canvas.min.js";

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
};

export function App() {
  const fiRef = useRef(null), aSeq = useRef(0), gSeq = useRef(0), gVar = useRef(0), cfRef = useRef({ name: "", src: "" }), rptRef = useRef(null);
  const [preview, setPreview] = useState(null), [analysis, setAnalysis] = useState(DA), [status, setStatus] = useState("idle");
  const [aSrc, setASrc] = useState("idle"), [gStatus, setGStatus] = useState("idle"), [gErr, setGErr] = useState("");
  const [gResults, setGResults] = useState([]), [styleGuide, setStyleGuide] = useState(null), [styleId, setStyleId] = useState("auto");
  const [fileName, setFileName] = useState(""), [childAge, setChildAge] = useState(""), [childName, setChildName] = useState(""), [gNote, setGNote] = useState("");
  const [records, setRecords] = useState([]), [gHistory, setGHistory] = useState([]), [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis"), [showReport, setShowReport] = useState(false), [previewImage, setPreviewImage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [exporting, setExporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [authToken, setAuthToken] = useState(() => { try { return localStorage.getItem("art_token") || ""; } catch { return ""; } });
  const [authUser, setAuthUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authInviteCode, setAuthInviteCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const selStyle = useMemo(() => GSO(styleId), [styleId]);
  const sName = useMemo(() => SDN(styleGuide), [styleGuide]);
  const isDone = status === "done";



  async function runAnalysis(fSrc, fMeta) { const seq = ++aSeq.current; setStatus("analyzing"); setASrc("pending"); try { const du = await TDU(fSrc); const ai = await API("/api/analyze", { fileName: fMeta.name || C.newArtwork, image: du, childAge, childName }).then(d => NA(d.analysis || d)).catch(() => null); if (aSeq.current !== seq) return; if (ai) { setAnalysis(ai); setASrc("ai"); } else { setASrc("local"); } } catch { if (aSeq.current === seq) setASrc("local"); } finally { if (aSeq.current === seq) setStatus("done"); } }

  async function runGuidance() { if (!preview || gStatus === "generating") return; const vb = ++gVar.current, seq = ++gSeq.current; const vars = Array.from({ length: GBS }, (_, i) => vb + i); gVar.current += GBS - 1; setGStatus("generating"); setGErr(""); setGResults([]); setStyleGuide(null); try { const du = await TDU(preview); const sp = selStyle.id === "auto" ? null : selStyle; const results = await Promise.allSettled(vars.map(v => API("/api/generate-guidance-image", { fileName: cfRef.current.name || C.newArtwork, image: du, stylePreset: sp, variant: v, talentType: null, note: gNote }).then(async d => { let img = d.image; if (d.originalWidth && d.originalHeight) img = await FIA(img, d.originalWidth, d.originalHeight); return { image: img, model: d.model, styleGuide: d.styleGuide || null, variant: d.variant || v, originalWidth: d.originalWidth, originalHeight: d.originalHeight }; }))); if (gSeq.current !== seq) return; const ok = results.filter(r => r.status === "fulfilled").map(r => r.value); if (ok.length > 0) { setGResults(ok); setStyleGuide(ok[0].styleGuide || null); setGStatus("done"); runAnalysis(ok[0].image || preview, cfRef.current); const entryBase = { id: `${Date.now()}`, createdAt: new Date().toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit" }), fileName: fileName || C.newArtwork, preview, generatedImage: ok[0].image, styleName: SDN(ok[0].styleGuide || null) }; setGHistory(h => [entryBase, ...h].slice(0, 50)); } else { const fe = results.find(r => r.status === "rejected"); setGErr(fe?.reason?.message || C.guideFailedHint); setGStatus("error"); } } catch (e) { if (gSeq.current === seq) { setGErr(e.message || C.guideFailedHint); setGStatus("error"); } } }

  function handleFile(e) { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const rawSrc = String(r.result); const img = new Image(); img.onload = () => { const MAX = 1024; let w = img.width, h = img.height; if (w > MAX || h > MAX) { const ratio = Math.min(MAX / w, MAX / h); w = Math.round(w * ratio); h = Math.round(h * ratio); } const c = document.createElement("canvas"); c.width = w; c.height = h; c.getContext("2d").drawImage(img, 0, 0, w, h); const src = c.toDataURL("image/jpeg", 0.85); cfRef.current = { name: f.name, src }; setPreview(src); const rawName = f.name.replace(/\.[^.]+$/, "") || C.newArtwork; const cleanName = /^(screenshot|IMG_|mmexport|wx_camera|Screenshot|MicroMsg|com\.|Image_)/.test(rawName) ? C.newArtwork : rawName; setFileName(cleanName); setAnalysis(DA); setStatus("idle"); setASrc("idle"); setGResults([]); setGErr(""); setGStatus("idle"); setStyleGuide(null); gVar.current = 0; runAnalysis(src, cfRef.current); }; img.src = rawSrc; }; r.readAsDataURL(f); }
  function handleSave() { if (!isDone) return; const rec = { id: `${Date.now()}`, fileName: fileName || C.newArtwork, preview, analysis, savedAt: C.justNow }; setRecords(r => [rec, ...r].slice(0, 50)); setSaved(true); setToastMsg("✅ 已保存到记录"); setShowToast(true); setTimeout(() => { setSaved(false); setShowToast(false); }, 2000); try { fetch("/api/records/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: rec.fileName, preview, analysis }) }).catch(() => {}); } catch {} }

  async function handleAuth() { setAuthError(""); setAuthLoading(true); try { const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login"; const body = authMode === "register" ? { email: authEmail, password: authPassword, inviteCode: authInviteCode } : { email: authEmail, password: authPassword }; const resp = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const data = await resp.json().catch(() => ({})); if (!resp.ok) { setAuthError(data.error || "操作失败"); return; } setAuthToken(data.token); setAuthUser(data.user); localStorage.setItem("art_token", data.token); setShowSettings(false); } catch { setAuthError("网络错误"); } finally { setAuthLoading(false); } }
  function handleLogout() { setAuthToken(""); setAuthUser(null); localStorage.removeItem("art_token"); }

  async function exportReport() {
    const el = rptRef.current;
    if (!el) return;

    setExporting(true);

    try {
      // ★ 克隆报告到 body 外，确保捕获完整长图
      const paper = el.querySelector(".report-paper");
      if (!paper) throw new Error("未找到报告内容");

      const clone = paper.cloneNode(true);
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.width = "600px";
      clone.style.maxWidth = "600px";
      clone.style.maxHeight = "none";
      clone.style.overflow = "visible";
      clone.style.background = "#fdfaf5";
      clone.style.zIndex = "99999";

      const cloneActions = clone.querySelector(".report-actions");
      if (cloneActions) cloneActions.style.display = "none";

      document.body.appendChild(clone);

      // 等待所有图片在克隆中加载完毕
      const cloneImgs = clone.querySelectorAll("img");
      await Promise.all(Array.from(cloneImgs).map(i => new Promise(r => {
        if (i.complete && i.naturalWidth > 0) r();
        else { i.onload = r; i.onerror = r; setTimeout(r, 5000); }
      })));

      await new Promise(r => setTimeout(r, 500));

      // html2canvas 捕获完整长图
      let cv;
      try {
        cv = await window.html2canvas(clone, {
          backgroundColor: "#fdfaf5",
          scale: 2,
          windowHeight: clone.scrollHeight,
          height: clone.scrollHeight,
          logging: false
        });
      } catch {
        cv = await window.html2canvas(clone, {
          backgroundColor: "#fdfaf5",
          scale: 1,
          windowHeight: clone.scrollHeight,
          height: clone.scrollHeight,
          logging: false
        });
      }

      // 清理克隆
      document.body.removeChild(clone);

      // 生成 blob
      let blob;
      try {
        blob = await new Promise((resolve, reject) => {
          cv.toBlob(b => b ? resolve(b) : reject(new Error("empty")), "image/png", 1);
        });
      } catch {
        const dataUrl = cv.toDataURL("image/png");
        const byteStr = atob(dataUrl.split(",")[1]);
        const ab = new ArrayBuffer(byteStr.length);
        const ua = new Uint8Array(ab);
        for (let i = 0; i < byteStr.length; i++) ua[i] = byteStr.charCodeAt(i);
        blob = new Blob([ab], { type: "image/png" });
      }

      const isMobile = /iPhone|iPad|iPod|Android|HarmonyOS|OpenHarmony/i.test(navigator.userAgent);

      // 移动端：系统分享 → 直接存相册
      if (isMobile && navigator.share && navigator.canShare) {
        const file = new File([blob], "学员测评单.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: "学员测评单" });
            return;
          } catch {
            // 用户取消分享 → 走下载通道
          }
        }
      }

      // 直接下载
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = "学员测评单.png";
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

    } catch (e) {
      console.error("导出失败:", e);
      setToastMsg("导出失败，请重试");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      try {
        const leftover = document.body.querySelector('[style*="left: -9999px"]');
        if (leftover?.classList?.contains("report-paper")) leftover.remove();
      } catch {}
    } finally {
      setExporting(false);
    }
  }

  const a = analysis, pa = a.psychologyAnalysis, fe = a.familyEducation, pr = a.projectionAnalysis, ti = a.talentInsight, pw = a.parentWording;

  function updateTeacherCopy(v) { setAnalysis(prev => ({ ...prev, teacherCopy: v })); }

  return (
    <main style={st.page}><style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.spinning{animation:spin 1s linear infinite}@keyframes fadeInUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    {!authToken ? <div style={{ ...st.container, maxWidth: 420, paddingTop: 80 }}>
      <header style={st.header}><h1 style={st.h1}>{C.title}</h1><p style={st.sub}>注册账号后使用</p></header>
      <div style={st.card}>
        <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
          <button onClick={() => setAuthMode("login")} style={{ flex: 1, padding: 12, border: "none", background: authMode === "login" ? "#E07B39" : "#f5f1eb", color: authMode === "login" ? "#fff" : "#5c4a3a", borderRadius: "12px 0 0 12px", cursor: "pointer", fontWeight: 600, fontSize: 15 }}>登录</button>
          <button onClick={() => setAuthMode("register")} style={{ flex: 1, padding: 12, border: "none", background: authMode === "register" ? "#E07B39" : "#f5f1eb", color: authMode === "register" ? "#fff" : "#5c4a3a", borderRadius: "0 12px 12px 0", cursor: "pointer", fontWeight: 600, fontSize: 15 }}>注册</button>
        </div>
        <input type="email" placeholder="请输入邮箱" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #e8e0d5", fontSize: 14, marginBottom: 10, background: "#fdfcf9", outline: "none" }} />
        <input type="password" placeholder="请输入密码（6位以上）" value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #e8e0d5", fontSize: 14, marginBottom: 10, background: "#fdfcf9", outline: "none" }} />
        {authMode === "register" && <input type="text" placeholder="请输入邀请码" value={authInviteCode} onChange={e => setAuthInviteCode(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1.5px solid #e8e0d5", fontSize: 14, marginBottom: 10, background: "#fdfcf9", outline: "none" }} />}
        {authError && <p style={{ color: "#C62828", fontSize: 13, marginBottom: 10, textAlign: "center" }}>{authError}</p>}
        <button onClick={handleAuth} disabled={authLoading} style={{ ...st.btnPrimary, opacity: authLoading ? 0.6 : 1 }}>{authLoading ? "处理中……" : authMode === "register" ? "注册" : "登录"}</button>
        {authMode === "register" && <p style={{ ...st.textSmall, textAlign: "center", marginTop: 12 }}>需持有邀请码才能注册</p>}
      </div>
    </div> : <><div style={st.container}>
      <header style={st.header}><h1 style={st.h1}>{C.title}</h1><p style={st.sub}>从画面看见孩子 · 用优势滋养成长</p><button onClick={() => setShowSettings(true)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#888" }} title="设置"><Settings size={20} /></button></header>
      {activeTab === "analysis" && <div>
        <div style={st.card}><div style={st.stepLabel}><span style={st.stepNum}>1</span> 上传作品</div><label style={{ display: "block", cursor: "pointer" }}>{preview ? <img src={preview} alt="" style={st.img} /> : <div style={st.placeholder}>上传作品</div>}<input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} /></label>
          <div style={{ marginTop: 12 }}><span style={{ fontSize: 12, color: "#888" }}>孩子姓名（选填）</span><input type="text" placeholder="输入孩子姓名或昵称" value={childName} onChange={e => setChildName(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginTop: 4 }} /></div>
          <div style={{ marginTop: 12 }}><span style={{ fontSize: 12, color: "#E07B39" }}>*必选 </span><select value={childAge} onChange={e => setChildAge(e.target.value)} style={{ ...st.select, width: "auto", marginBottom: 0 }}><option value="">选择年龄段</option><option value="3-5">3~5岁 · 象征期</option><option value="5-8">5~8岁 · 意向表现期</option><option value="8-12">8~12岁 · 写实期</option><option value="12+">12岁+ · 专业发展期</option></select></div></div>
        <div style={st.card}><div style={st.stepLabel}><span style={st.stepNum}>2</span> 选择画风并生成</div><select value={styleId} onChange={e => { setStyleId(e.target.value); setGResults([]); setGErr(""); setGStatus("idle"); setStyleGuide(null); }} style={st.select}>{styleGroups.map(g => <optgroup key={g.label} label={g.label}>{g.options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</optgroup>)}</select><p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>{selStyle.summary}</p>
          <textarea placeholder="补充说明（可选）" value={gNote} onChange={e => setGNote(e.target.value)} rows={2} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontSize: 13, marginBottom: 12, resize: "vertical" }} />
          <button onClick={runGuidance} disabled={gStatus === "generating" || !preview || !childAge} style={gStatus === "generating" || !preview || !childAge ? st.btnDisabled : st.btnPrimary}>{!childAge && preview ? "请先选择年龄段" : gStatus === "generating" ? <><RefreshCcw size={18} className="spinning" />AI 优化中...</> : <><Sparkles size={18} />{C.guideAction}</>}</button></div>
        {gStatus !== "idle" && <div style={st.card}><div style={st.stepLabel}><span style={st.stepNum}>3</span> 生成结果 {gStatus === "done" ? "✓" : gStatus === "error" ? "✗" : "…"} {sName !== "自动匹配画风" ? `· ${sName}` : ""}</div>
          {gResults.length > 0 ? <>
            <div style={st.compareGrid}><div><div style={st.compareLabel}>{C.original}</div><img src={preview} alt="" style={{ ...st.img, cursor: "pointer" }} onClick={() => setPreviewImage({ src: preview, title: C.original })} /></div><div style={st.dividerIcon}>→</div><div><div style={st.compareLabel}>{C.guideResult}</div><img src={gResults[0].image} alt="" style={{ ...st.img, cursor: "pointer" }} onClick={() => setPreviewImage({ src: gResults[0].image, title: C.guideResult })} /></div></div>
          </> : gStatus === "generating" ? <div style={{ ...st.placeholder, padding: 40 }}>生成中……</div> : <div style={{ ...st.placeholder, padding: 30, fontSize: 13 }}>{C.guideEmpty}</div>}
        </div>}
        {gStatus === "error" && <div style={st.errorBox}>❌ {gErr}<br /><button onClick={runGuidance} style={{ ...st.btnAccent, marginTop: 8 }}>重新生成</button></div>}

        {(status === "done" || aSrc !== "idle") && <div>
          {isDone && <div style={st.card}><h3 style={st.h3}>📝 老师点评 <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>（可编辑）</span></h3><textarea value={a.teacherCopy} onChange={e => updateTeacherCopy(e.target.value)} rows={3} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, lineHeight: 1.7, resize: "vertical", fontFamily: "inherit" }} /></div>}
          {!isDone && a.teacherCopy && <div style={st.card}><h3 style={st.h3}>📝 老师点评</h3><p style={st.text}>{a.teacherCopy}</p></div>}
          {!isDone && !a.teacherCopy && aSrc === "local" && <div style={st.card}><p style={{ ...st.text, textAlign: "center" }}>AI 分析暂不可用，请稍后重试。</p></div>}

          {(pa.emotionState || pa.securityLevel || pa.selfCognition) && <div style={st.card}>
            <h3 style={st.h3}>🧠 心理分析</h3>
            {pa.emotionState && <div style={st.section}><h4 style={st.h4}>情绪状态</h4><p style={st.text}>{pa.emotionState}</p></div>}
            {pa.securityLevel && <div style={st.section}><h4 style={st.h4}>安全感评估</h4><p style={st.text}>{pa.securityLevel}</p></div>}
            {pa.selfCognition && <div style={st.section}><h4 style={st.h4}>自我认知</h4><p style={st.text}>{pa.selfCognition}</p></div>}
            {pa.keyEvidence.length > 0 && <div><h4 style={st.h4}>关键证据</h4><ul style={st.evidenceList}>{pa.keyEvidence.map((e, i) => <li key={i}>{e}</li>)}</ul></div>}
          </div>}

          {(fe.parentInterference || fe.strengthPotential || fe.actionSuggestions.length > 0) && <div style={st.card}>
            <h3 style={st.h3}>🏠 家庭教育分析</h3>
            {fe.parentInterference && <div style={st.section}><h4 style={st.h4}>可能的干扰</h4><p style={st.text}>{fe.parentInterference}</p></div>}
            {fe.strengthPotential && <div style={st.section}><h4 style={st.h4}>优势潜能</h4><p style={st.text}>{fe.strengthPotential}</p></div>}
            {fe.actionSuggestions.length > 0 && <div><h4 style={st.h4}>行动建议</h4><ol style={st.actionList}>{fe.actionSuggestions.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}</ol></div>}
          </div>}

          {(pr.attentionProjection || pr.relationshipProjection || pr.needProjection) && <div style={st.card}>
            <h3 style={st.h3}>🔍 心理投射分析</h3>
            {pr.attentionProjection && <div style={st.section}><h4 style={st.h4}>注意力投射</h4><p style={st.text}>{pr.attentionProjection}</p></div>}
            {pr.relationshipProjection && <div style={st.section}><h4 style={st.h4}>关系投射</h4><p style={st.text}>{pr.relationshipProjection}</p></div>}
            {pr.needProjection && <div style={st.section}><h4 style={st.h4}>需求投射</h4><p style={st.text}>{pr.needProjection}</p></div>}
          </div>}

          {(ti.primaryTalent || ti.evidenceList.length > 0) && <div style={st.card}>
            <h3 style={st.h3}>🌟 天赋识别</h3>
            {ti.primaryTalent && <div style={st.section}><h4 style={st.h4}>主导天赋</h4><p style={st.text}>{ti.primaryTalent}</p></div>}
            {ti.evidenceList.length > 0 && <div><h4 style={st.h4}>画面证据</h4><ul style={st.evidenceList}>{ti.evidenceList.map((e, i) => <li key={i}>{e}</li>)}</ul></div>}
          </div>}

          {(pw.shouldSay.length > 0 || pw.shouldNotSay.length > 0) && <div style={st.card}>
            <h3 style={st.h3}>💬 家长引导话术</h3>
            {pw.shouldSay.length > 0 && <div style={st.section}><h4 style={{ ...st.h4, color: "#2E7D32" }}>✅ 建议这样说</h4><ul style={st.actionList}>{pw.shouldSay.map((s, i) => <li key={i} style={{ marginBottom: 6, color: "#2E7D32" }}>"{s}"</li>)}</ul></div>}
            {pw.shouldNotSay.length > 0 && <div style={st.section}><h4 style={{ ...st.h4, color: "#C62828" }}>❌ 避免这样说</h4><ul style={st.actionList}>{pw.shouldNotSay.map((s, i) => <li key={i} style={{ marginBottom: 6, color: "#C62828" }}>"{s}"</li>)}</ul></div>}
          </div>}

          {isDone && <div style={st.resultActions}><button onClick={handleSave} style={st.btnSecondary}><Save size={16} /> {saved ? C.saved : C.save}</button><button onClick={() => setShowReport(true)} style={st.btnAccent}><FileText size={16} /> {C.viewReport}</button></div>}
        </div>}
      </div>}

      {activeTab === "records" && <div>
        <div style={st.card}><h3 style={st.h3}>📋 {C.analysisRecord} <span style={{ fontSize: 12, color: "#aaa", fontWeight: 400 }}>（{records.length}条）</span></h3>
          {records.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: "#888" }}><p style={{ margin: 0 }}>{C.noSavedRecords}</p><p style={{ ...st.textSmall, marginTop: 8 }}>{C.noSavedRecordsHint}</p></div>
          : records.map((r, idx) => <div key={r.id} style={{ ...st.recordItem, cursor: "pointer" }} onClick={() => { setAnalysis(r.analysis); setActiveTab("analysis"); }}>
            {r.preview ? <img src={r.preview} alt="" style={st.thumb} /> : <div style={{ ...st.thumb, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎨</div>}
            <div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{r.fileName}</strong><br /><span style={st.textSmall}>{r.savedAt}</span></div>
            <button onClick={e => { e.stopPropagation(); setRecords(prev => prev.filter((_, i) => i !== idx)); }} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 18, padding: 4 }} title="删除">×</button>
          </div>)}
        </div>
        <div style={st.card}><h3 style={st.h3}>🖼️ {C.generationHistory} <span style={{ fontSize: 12, color: "#aaa", fontWeight: 400 }}>（{gHistory.length}条）</span></h3>
          {gHistory.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: "#888" }}><p style={{ margin: 0 }}>{C.noGenerationHistory}</p><p style={{ ...st.textSmall, marginTop: 8 }}>{C.generationHistoryHint}</p></div>
          : gHistory.map(h => <div key={h.id} style={{ ...st.recordItem, cursor: "pointer" }} onClick={() => setPreviewImage({ src: h.generatedImage, title: h.fileName })}>
            <img src={h.generatedImage} alt="" style={st.thumb} />
            <div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{h.fileName}</strong><br /><span style={st.textSmall}>{h.createdAt} · {h.styleName}</span></div>
          </div>)}
        </div>
      </div>}
    </div>

    <input ref={fiRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    {previewImage && <div style={st.overlay} onClick={() => setPreviewImage(null)}><div style={{ ...st.modal, maxWidth: "90vw", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}><div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 600 }}>{previewImage.title}</span><button onClick={() => setPreviewImage(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button></div>
      <img src={previewImage.src} alt="" style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }} />
    </div></div>}
    {showReport && <div style={st.overlay} onClick={() => setShowReport(false)}><div style={st.modal} onClick={e => e.stopPropagation()}><div style={{ ...st.modalScroll, textAlign: "center" }} ref={rptRef}>
      {/* 全局样式 + 纸质纹理 */}
      <style>{`
        .report-paper { background: #fdfaf5; background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); }
        .report-card { background: rgba(255,255,255,0.75); border-radius: 14px; padding: 22px 20px; margin-bottom: 18px; border: 1px solid rgba(180,160,140,0.15); box-shadow: 0 1px 3px rgba(140,110,70,0.06); }
        .report-h2 { font-size: 17px; font-weight: 700; color: #3d2e1f; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.02em; }
        .report-h3 { font-size: 11px; color: #b8a088; font-weight: 700; margin: 0 0 4px; letter-spacing: 0.1em; text-transform: uppercase; }
        .report-p { font-size: 14px; color: #4a3828; line-height: 1.85; margin: 0; }
        .report-divider { height: 1px; background: linear-gradient(90deg, transparent, #d4c4b0, transparent); margin: 24px 0; border: none; }
        .report-img { max-width: 100%; border-radius: 12px; box-shadow: 0 2px 16px rgba(80,50,20,0.1); border: 1px solid rgba(180,160,140,0.15); }
        .report-tag { display: inline-block; background: #faf3e8; color: #b87a4a; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-right: 6px; margin-bottom: 4px; letter-spacing: 0.03em; }
        .report-highlight { background: linear-gradient(135deg, #fdf6ee, #fef9f3); border-left: 3px solid #E07B39; border-radius: 0 12px 12px 0; padding: 16px 18px; margin-bottom: 18px; }
        .report-footer { color: #c4b4a0; font-size: 11px; font-style: italic; }
        @media (min-width: 860px) {
          .report-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        }
      `}</style>
      <div className="report-paper" style={{ padding: "40px 32px 32px", fontFamily: "'Noto Serif SC', 'PingFang SC', 'Noto Sans SC', serif", color: "#3d2e1f" }}>
      {/* Report Header */}
      <div style={{ textAlign: "center", marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #e8dcc8" }}>
        <div style={{ fontSize: 11, color: "#c4b088", letterSpacing: "0.15em", marginBottom: 8, fontWeight: 600 }}>CHILDREN'S ART ASSESSMENT</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#3d2e1f", margin: "0 0 8px", letterSpacing: "-0.01em", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>{C.reportTitle}</h1>
        <p style={{ fontSize: 13, color: "#9b8970", margin: 0, letterSpacing: "0.03em" }}>姓名：{childName || "未填写"}　　年龄：{childAge || "未选择"}</p>
      </div>

      {/* Original Image */}
      {preview && <div style={{ marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#b8a088", fontWeight: 700, marginBottom: 10, letterSpacing: "0.1em" }}>🎨 原画</div>
        <img src={preview} alt="" className="report-img" style={{ maxHeight: 380 }} />
      </div>}

      {/* Teacher Comment */}
      {a.teacherCopy && <div className="report-highlight">
        <div style={{ fontSize: 11, color: "#E07B39", fontWeight: 700, marginBottom: 8, letterSpacing: "0.1em" }}>📝 老师点评</div>
        <p className="report-p">{a.teacherCopy}</p>
      </div>}

      {/* Psychology */}
      {(pa.emotionState || pa.securityLevel || pa.selfCognition) && <div className="report-card">
        <h2 className="report-h2"><span style={{ fontSize: 20 }}>🧠</span> 心理分析</h2>
        <div className="report-grid2">
          {pa.emotionState && <div><div className="report-h3">情绪状态</div><p className="report-p" style={{ fontSize: 13 }}>{pa.emotionState}</p></div>}
          {pa.securityLevel && <div><div className="report-h3">安全感</div><p className="report-p" style={{ fontSize: 13 }}>{pa.securityLevel}</p></div>}
          {pa.selfCognition && <div><div className="report-h3">自我认知</div><p className="report-p" style={{ fontSize: 13 }}>{pa.selfCognition}</p></div>}
        </div>
        {pa.keyEvidence.length > 0 && <div style={{ marginTop: 14 }}><div className="report-h3" style={{ marginBottom: 8 }}>关键证据</div><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{pa.keyEvidence.map((e, i) => <span key={i} className="report-tag">{e}</span>)}</div></div>}
      </div>}

      {/* Family Education */}
      {(fe.parentInterference || fe.strengthPotential || fe.actionSuggestions.length > 0) && <div className="report-card">
        <h2 className="report-h2"><span style={{ fontSize: 20 }}>🏠</span> 家庭教育</h2>
        {fe.parentInterference && <div style={{ marginBottom: 12 }}><div className="report-h3">可能的干扰</div><p className="report-p" style={{ fontSize: 13 }}>{fe.parentInterference}</p></div>}
        {fe.strengthPotential && <div style={{ marginBottom: 12 }}><div className="report-h3">优势潜能</div><p className="report-p" style={{ fontSize: 13 }}>{fe.strengthPotential}</p></div>}
        {fe.actionSuggestions.length > 0 && <div><div className="report-h3" style={{ marginBottom: 8 }}>行动建议</div><ol style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: "#4a3828", lineHeight: 2 }}>{fe.actionSuggestions.map((s, i) => <li key={i} style={{ paddingLeft: 4 }}>{s}</li>)}</ol></div>}
      </div>}

      {/* Projection */}
      {(pr.attentionProjection || pr.relationshipProjection || pr.needProjection) && <div className="report-card">
        <h2 className="report-h2"><span style={{ fontSize: 20 }}>🔍</span> 心理投射</h2>
        <div className="report-grid2">
          {pr.attentionProjection && <div><div className="report-h3">注意力投射</div><p className="report-p" style={{ fontSize: 13 }}>{pr.attentionProjection}</p></div>}
          {pr.relationshipProjection && <div><div className="report-h3">关系投射</div><p className="report-p" style={{ fontSize: 13 }}>{pr.relationshipProjection}</p></div>}
          {pr.needProjection && <div><div className="report-h3">需求投射</div><p className="report-p" style={{ fontSize: 13 }}>{pr.needProjection}</p></div>}
        </div>
      </div>}

      {/* Talent */}
      {ti.primaryTalent && <div className="report-highlight">
        <div style={{ fontSize: 11, color: "#E07B39", fontWeight: 700, marginBottom: 8, letterSpacing: "0.1em" }}>🌟 天赋识别</div>
        <p className="report-p">{ti.primaryTalent}</p>
        {ti.evidenceList.length > 0 && <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>{ti.evidenceList.map((e, i) => <span key={i} className="report-tag" style={{ background: "#fef5ee", color: "#c0652a" }}>{e}</span>)}</div>}
      </div>}

      {/* Parent Wording */}
      {(pw.shouldSay.length > 0 || pw.shouldNotSay.length > 0) && <div className="report-card">
        <h2 className="report-h2"><span style={{ fontSize: 20 }}>💬</span> 家长引导话术</h2>
        <div className="report-grid2">
          {pw.shouldSay.length > 0 && <div style={{ background: "#f8faf5", borderRadius: 12, padding: 16, border: "1px solid #e0e8d5" }}>
            <div style={{ fontSize: 11, color: "#5a8a3c", fontWeight: 700, marginBottom: 10, letterSpacing: "0.06em" }}>✅ 建议这样说</div>
            <ul style={{ paddingLeft: 16, margin: 0, fontSize: 13, color: "#4a3828", lineHeight: 2 }}>{pw.shouldSay.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>"{s}"</li>)}</ul>
          </div>}
          {pw.shouldNotSay.length > 0 && <div style={{ background: "#fef8f6", borderRadius: 12, padding: 16, border: "1px solid #f5ddd5" }}>
            <div style={{ fontSize: 11, color: "#c0392b", fontWeight: 700, marginBottom: 10, letterSpacing: "0.06em" }}>❌ 避免这样说</div>
            <ul style={{ paddingLeft: 16, margin: 0, fontSize: 13, color: "#4a3828", lineHeight: 2 }}>{pw.shouldNotSay.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>"{s}"</li>)}</ul>
          </div>}
        </div>
      </div>}

      <hr className="report-divider" />

      {/* Original + Optimized Images */}
      {preview && <div style={{ marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#b8a088", fontWeight: 700, marginBottom: 10, letterSpacing: "0.1em" }}>🎨 原画</div>
        <img src={preview} alt="" className="report-img" style={{ maxHeight: 380 }} />
      </div>}
      {gResults.length > 0 && <div style={{ marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#b8a088", fontWeight: 700, marginBottom: 10, letterSpacing: "0.1em" }}>🖼️ {C.guideResult}</div>
        <img src={gResults[0].image} alt="" className="report-img" />
      </div>}

      {/* Footer */}
      <div style={{ textAlign: "center", paddingTop: 20, borderTop: "1px solid #e8dcc8" }}>
        <p className="report-footer">{C.strengthClosing}</p>
      </div>
      </div>
    </div><div style={st.modalActions} className="report-actions"><button onClick={() => setShowReport(false)} style={st.btnSecondary}><X size={16} /> {C.closePreview}</button><button onClick={exportReport} disabled={exporting} style={exporting ? st.btnDisabled : st.btnAccent}>{exporting ? <><RefreshCcw size={16} className="spinning" /> 导出中...</> : <><Download size={16} /> {C.downloadReport}</>}</button></div></div></div>}
    <nav style={st.nav}><button onClick={() => setActiveTab("analysis")} style={st.navBtn(activeTab === "analysis")}><Search size={20} /><span>分析</span></button><button onClick={() => setActiveTab("records")} style={st.navBtn(activeTab === "records")}><FileText size={20} /><span>记录</span></button></nav>

    {/* Toast */}
    {showToast && <div style={{ position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", background: "#3d3226", color: "#fff", padding: "10px 24px", borderRadius: 20, fontSize: 14, fontWeight: 600, zIndex: 300, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", animation: "fadeInUp 0.3s ease" }}>{toastMsg}</div>}

    {/* Settings Modal */}
    {showSettings && <div style={st.overlay} onClick={() => setShowSettings(false)}><div style={{ ...st.modal, maxWidth: 420 }} onClick={e => e.stopPropagation()}><div style={st.modalScroll}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><h2 style={{ margin: 0, fontSize: 20 }}>设置</h2><button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button></div>
      {authUser ? <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 16, margin: "0 0 4px" }}>已登录：{authUser.email}</p>
        <p style={{ ...st.textSmall, marginBottom: 16 }}>积分：{authUser.credits || 0}</p>
        <button onClick={handleLogout} style={{ ...st.btnSecondary, color: "#C62828" }}>退出登录</button>
      </div> : <div>
        <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
          <button onClick={() => setAuthMode("login")} style={{ flex: 1, padding: 10, border: "none", background: authMode === "login" ? "#E07B39" : "#f0f0f0", color: authMode === "login" ? "#fff" : "#555", borderRadius: "8px 0 0 8px", cursor: "pointer", fontWeight: 600 }}>登录</button>
          <button onClick={() => setAuthMode("register")} style={{ flex: 1, padding: 10, border: "none", background: authMode === "register" ? "#E07B39" : "#f0f0f0", color: authMode === "register" ? "#fff" : "#555", borderRadius: "0 8px 8px 0", cursor: "pointer", fontWeight: 600 }}>注册</button>
        </div>
        <input type="email" placeholder="邮箱" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 8 }} />
        <input type="password" placeholder="密码" value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 8 }} />
        {authMode === "register" && <input type="text" placeholder="邀请码" value={authInviteCode} onChange={e => setAuthInviteCode(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 8 }} />}
        {authError && <p style={{ color: "#C62828", fontSize: 13, marginBottom: 8 }}>{authError}</p>}
        <button onClick={handleAuth} disabled={authLoading} style={{ ...st.btnPrimary, opacity: authLoading ? 0.6 : 1 }}>{authLoading ? "处理中……" : authMode === "register" ? "注册" : "登录"}</button>
      </div>}
    </div></div></div>}
    </>
    }
    </main>
  );
}
