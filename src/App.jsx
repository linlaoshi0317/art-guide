import { useMemo, useRef, useState, useEffect } from "react";
import { Download, FileText, Palette, RefreshCcw, Save, Search, Sparkles, Upload, X } from "lucide-react";

const GBS = 1;
const C = { newArtwork: "新作品", title: "儿童美育一对一点评指导网", saved: "已保存", save: "保存记录", replace: "更换", artworkAlt: "上传的孩子手绘作品", guideAction: "一键优化", guideGenerating: "正在生成优化图……", guideDone: "已生成优化图", guideFailed: "生成失败", guideFailedHint: "刚刚没生成成功，可以稍后重试。", guideEmpty: "上传作品后点「一键优化」生成优化图。", guideResult: "优化效果", strengthClosing: "父母好好学习，孩子天天向上——先看见孩子，再看见作品。", closePreview: "关闭", matchedStyle: "本次匹配风格", styleSelectTitle: "画风方向", styleSelectHint: "可以自动匹配或指定完成风格", styleAuto: "自动根据作品匹配", nextTitle: "下一步怎么画", original: "原画", guided: "优化后", noSavedRecords: "暂无保存记录", noSavedRecordsHint: "分析完成后点「保存记录」在此查看", analysisRecord: "分析记录", compositionSkeleton: "构图骨架", visualCenter: "视觉中心", flowLine: "动线", balance: "平衡", depth: "层次", justNow: "刚刚", generationHistory: "生成历史", generationHistoryHint: "每次「一键优化」生成的优化图会自动保存在这里", noGenerationHistory: "暂无生成记录", colorGuide: "上色指导", colorFocus: "上色重点", colorSteps: "上色顺序", viewReport: "查看测评单", downloadReport: "下载测评单", reportTitle: "学员测评单" };

const styleGroups = [
  { label: "自动", options: [{ id: "auto", label: C.styleAuto, summary: "AI 先看孩子画的主题、线条、留白和颜色，再自动选最合适的完成方向。" }] },
  { label: "日系动画/插画", options: [
    { id: "jp-warm-animation", label: "日系温暖手绘动画", summary: "柔和水彩、自然背景、暖光空气感。", styleName: "日系温暖手绘动画", styleCategory: "warm Japanese-inspired hand-drawn animated film atmosphere", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用柔和水彩、暖光、浅绿、浅蓝和米白色。", compositionDirection: "保留原主体位置，用背景层次和小道具补完整。" },
    { id: "jp-clear-light", label: "日系通透光影", summary: "高饱和天空、透明光斑、清爽城市感。", styleName: "日系通透光影", styleCategory: "transparent anime light and sky illustration", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "提高天空蓝、夕阳橙和亮部透明感。", compositionDirection: "用光线方向和远近景把视线带回主角。" },
    { id: "jp-soft-character", label: "日系柔和人物插画", summary: "五官柔和、发丝细腻、色调干净。", styleName: "日系柔和人物插画", styleCategory: "soft delicate anime character illustration", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "肤色通透、眼睛和发色轻柔渐变。", compositionDirection: "强化脸部和上半身中心。" },
    { id: "jp-retro-cel", label: "90年代赛璐璐复古", summary: "清晰黑线、平涂色块、老动画质感。", styleName: "90年代赛璐璐复古", styleCategory: "retro cel animation flat color", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用平涂高纯色和硬边阴影。", compositionDirection: "用大色块分出主角、背景和装饰区。" },
    { id: "jp-thick-paint", label: "日系厚涂", summary: "色块堆叠、体积感强、光影厚实。", styleName: "日系厚涂", styleCategory: "anime painterly illustration", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "用分层色块塑造体积。", compositionDirection: "让主体最大明暗对比集中在视觉中心。" },
    { id: "jp-flat-anime", label: "平涂二次元", summary: "干净纯色、少量阴影、线条精致。", styleName: "平涂二次元", styleCategory: "clean flat anime illustration", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "用干净纯色加少量阴影。", compositionDirection: "用对齐的背景形状让画面更有秩序。" },
    { id: "jp-ukiyoe", label: "浮世绘和风", summary: "传统版画、波浪远山、平面化线条。", styleName: "浮世绘和风", styleCategory: "ukiyo-e inspired Japanese print", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用古朴蓝、米白、朱红和墨色。", compositionDirection: "用平面图案和大曲线组织留白。" },
  ]},
  { label: "欧美主流", options: [
    { id: "western-2d-fairytale", label: "欧美童话2D手绘", summary: "流畅曲线、饱满色彩、童话华丽感。", styleName: "欧美童话2D手绘", styleCategory: "western 2D fairytale hand-drawn animation", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用饱满但不刺眼的主色。", compositionDirection: "用优雅曲线把主角包围起来。" },
    { id: "western-3d-cartoon", label: "3D卡通写实", summary: "圆润体块、柔和材质、真实光影。", styleName: "3D卡通写实", styleCategory: "soft 3D cartoon realism", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用柔和材质色和清楚高光。", compositionDirection: "通过景深和投影建立前后空间。" },
    { id: "american-cartoon", label: "美式卡通", summary: "极简线条、大头比例、高饱和撞色。", styleName: "美式卡通", styleCategory: "bold American cartoon", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用高饱和撞色但主色稳定。", compositionDirection: "用大形状和强对比推到画面前面。" },
    { id: "vintage-illustration", label: "美式复古插画", summary: "油画质感、暖棕复古色、大气。", styleName: "美式复古插画", styleCategory: "vintage golden-age illustration", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "用暖棕、奶油白、深绿和柔红。", compositionDirection: "用大块明暗关系稳定画面。" },
    { id: "comic-hero", label: "美式漫画", summary: "硬朗粗线、强明暗、速度线。", styleName: "美式漫画", styleCategory: "bold western comic-book illustration", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用强明暗和鲜明主色。", compositionDirection: "用斜线动势和大对比增强冲击力。" },
  ]},
  { label: "国风画风", options: [
    { id: "cn-gongbi", label: "国风工笔", summary: "细腻线条、淡染花鸟、精致素雅。", styleName: "国风工笔", styleCategory: "Chinese gongbi fine-line painting", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用淡染色、浅青绿、胭脂和米白。", compositionDirection: "用留白和细线组织空间。" },
    { id: "cn-ink", label: "水墨国风", summary: "水墨晕染、留白写意、黑白层次。", styleName: "水墨国风", styleCategory: "Chinese ink wash painting", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "以墨色和浅淡色为主。", compositionDirection: "用留白和墨色浓淡分出前后景。" },
    { id: "cn-guochao", label: "新国潮平涂", summary: "传统纹样加现代高饱和色。", styleName: "新国潮平涂", styleCategory: "modern Chinese guochao flat illustration", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用朱红、青绿、金黄、深蓝。", compositionDirection: "用对称、重复和纹样边框增强完整度。" },
    { id: "cn-dunhuang", label: "敦煌壁画风", summary: "矿物颜料、浓烈撞色、古典氛围。", styleName: "敦煌壁画风", styleCategory: "Dunhuang mural inspired mineral color", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用矿物感青绿、赭石、金黄、朱红。", compositionDirection: "用飘带和云纹形成视线流动。" },
  ]},
  { label: "其他特色", options: [
    { id: "oil-texture", label: "油画肌理", summary: "画布颗粒、厚重颜料、氛围浓郁。", styleName: "油画肌理", styleCategory: "oil painting texture", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用厚重色层和统一光源。", compositionDirection: "用大块明暗和背景色层整理画面重心。" },
    { id: "pixel-art", label: "像素画风", summary: "方块色块、复古游戏质感。", styleName: "像素画风", styleCategory: "pixel art game illustration", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用有限色板和清楚色块。", compositionDirection: "用网格感和重复块面组织画面。" },
    { id: "clay-stop-motion", label: "黏土定格", summary: "立体黏土、哑光材质、手作质感。", styleName: "黏土定格", styleCategory: "clay stop-motion handmade scene", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用哑光黏土色和柔和阴影。", compositionDirection: "用立体前后关系和软投影增强空间。" },
    { id: "minimal-flat", label: "极简扁平", summary: "简约几何、无渐变、干净现代。", styleName: "极简扁平", styleCategory: "minimal flat geometric illustration", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用两到三种主色。", compositionDirection: "用对齐、重复和大留白建立秩序感。" },
    { id: "gothic-dark", label: "哥特暗黑", summary: "低饱和冷色、尖锐线条。", styleName: "哥特暗黑", styleCategory: "soft gothic dark fantasy illustration", sceneDirection: "只添加与原画内容直接相关的背景。", colorDirection: "使用低饱和紫、蓝灰、黑褐。", compositionDirection: "用尖形轮廓和明暗聚焦主角。" },
  ]},
];
const SO = styleGroups.flatMap(g => g.options);
const GSO = (id) => SO.find(o => o.id === id) || SO[0];
const SDN = (v) => v?.styleName || "自动匹配画风";

const DSK = { visualCenter: "画面主角的重心需要被看见。", flowLine: "用一条方向线把视线带回主角。", balance: "左右或上下需要有回应关系。", depth: "前景、中景、背景可以分得更清楚。" };
const DCP = { summary: "用暖金色做主角亮点，深蓝和红色让画面更完整。", palette: [{ hex: "#F4C86A", name: "暖金色" }, { hex: "#F7D7C4", name: "柔肤色" }, { hex: "#1D2B4D", name: "深蓝色" }, { hex: "#6F92C9", name: "眼睛蓝" }, { hex: "#C83E45", name: "点缀红" }], focus: ["先确定主角头发和眼睛的色彩性格。", "服装用深色压住重心。", "小角色用不同色相区分。"], steps: ["先铺头发、皮肤、衣服的大色块。", "再加头发暗部和衣服折痕。", "最后点眼睛高光和配件亮点。"] };
const DA = { teacherCopy: "这张作品线条观察很认真，细节已经很多了。下一步可以把主体再突出一点。", tags: ["观察认真", "主体明确"], nextSteps: ["先圈出主角并加重轮廓", "把相关元素靠近放成一组", "重复一个有趣的形状"], skeleton: { ...DSK }, colorPlan: { ...DCP } };

const sn = (v, fb = "") => { if (typeof v !== "string") return fb; const t = v.trim(); return (!t || /[�锟]/.test(t)) ? fb : t; };

function AIL(dataUrl) { return new Promise((resolve) => { const img = new Image(); img.onload = () => { resolve({ ...DA, teacherCopy: "本地分析：这是一张充满童趣的作品，继续加油！" }); }; img.onerror = () => resolve(DA); img.src = dataUrl; }); }
function TDU(input) { if (input.startsWith("data:image/")) return Promise.resolve(input); return fetch(input).then(r => { if (!r.ok) throw new Error("load_failed"); return r.blob(); }).then(b => new Promise((resolve, reject) => { const fr = new FileReader(); fr.onload = () => resolve(String(fr.result)); fr.onerror = () => reject(new Error("read_failed")); fr.readAsDataURL(b); })); }
async function API(url, body) { const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const data = await resp.json().catch(() => ({})); if (!resp.ok) throw new Error(data.error || data.message || "请求失败"); return data; }
function NA(raw) { if (!raw || typeof raw !== "object") return DA; const cp = raw.colorPlan && typeof raw.colorPlan === "object" ? raw.colorPlan : {}, sk = raw.skeleton && typeof raw.skeleton === "object" ? raw.skeleton : {}; return { teacherCopy: sn(raw.teacherCopy, DA.teacherCopy), tags: Array.isArray(raw.tags) ? raw.tags.filter(t => typeof t === "string" && t.trim()).slice(0, 5) : DA.tags, nextSteps: Array.isArray(raw.nextSteps) ? raw.nextSteps.filter(t => typeof t === "string" && t.trim()).slice(0, 3) : DA.nextSteps, skeleton: { visualCenter: sn(sk.visualCenter, DSK.visualCenter), flowLine: sn(sk.flowLine, DSK.flowLine), balance: sn(sk.balance, DSK.balance), depth: sn(sk.depth, DSK.depth) }, colorPlan: { summary: sn(cp.summary, DCP.summary), palette: Array.isArray(cp.palette) ? cp.palette.slice(0, 6).map(p => ({ hex: p?.hex || "#F4C86A", name: p?.name || "主色" })) : DCP.palette, focus: Array.isArray(cp.focus) ? cp.focus.filter(t => typeof t === "string" && t.trim()).slice(0, 4) : DCP.focus, steps: Array.isArray(cp.steps) ? cp.steps.filter(t => typeof t === "string" && t.trim()).slice(0, 4) : DCP.steps } }; }
function FIA(dataUrl, origW, origH) { if (!origW || !origH) return Promise.resolve(dataUrl); return new Promise((resolve) => { const img = new Image(); img.onload = () => { const ir = img.width / img.height, tr = origW / origH; if (Math.abs(ir - tr) < .01) { resolve(dataUrl); return; } const c = document.createElement("canvas"); let cw, ch, sx, sy; if (ir > tr) { ch = img.height; cw = Math.round(img.height * tr); sx = Math.round((img.width - cw) / 2); sy = 0; } else { cw = img.width; ch = Math.round(img.width / tr); sx = 0; sy = Math.round((img.height - ch) / 2); } c.width = cw; c.height = ch; c.getContext("2d").drawImage(img, sx, sy, cw, ch, 0, 0, cw, ch); resolve(c.toDataURL("image/png")); }; img.onerror = () => resolve(dataUrl); img.src = dataUrl; }); }

// ===================== INLINE STYLES =====================
const st = {
  page: { minHeight: "100vh", background: "#f5f4f0", fontFamily: "system-ui, -apple-system, sans-serif" },
  container: { maxWidth: 600, margin: "0 auto", padding: "20px 16px 100px" },
  header: { textAlign: "center", padding: "30px 0 20px" },
  h1: { fontSize: 22, margin: 0, color: "#1a1a1a" },
  sub: { color: "#888", fontSize: 14, marginTop: 4 },
  card: { background: "#fff", borderRadius: 18, padding: 20, marginBottom: 16, boxShadow: "0 1px 0 rgba(255,255,255,0.7), 0 12px 30px rgba(15,23,42,0.04)" },
  stepLabel: { fontSize: 13, color: "#888", marginBottom: 12, letterSpacing: 1 },
  placeholder: { border: "2px dashed #ddd", borderRadius: 12, padding: 60, textAlign: "center", color: "#aaa", fontSize: 18, letterSpacing: 4, cursor: "pointer" },
  img: { width: "100%", borderRadius: 12, maxHeight: 300, objectFit: "contain" },
  select: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 12, background: "#fff" },
  btnPrimary: { width: "100%", padding: 14, background: "#E07B39", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDisabled: { width: "100%", padding: 14, background: "#ccc", color: "#999", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  btnSecondary: { padding: "10px 20px", background: "#f0f0f0", color: "#555", border: "none", borderRadius: 10, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  btnAccent: { padding: "10px 20px", background: "#E07B39", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  tag: { background: "#FFF3ED", color: "#E07B39", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 500 },
  skeletonGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  skItem: { fontSize: 14 },
  skLabel: { fontSize: 12, color: "#C08552", display: "block", marginBottom: 4 },
  h3: { margin: "0 0 12px", fontSize: 16 },
  text: { color: "#555", lineHeight: 1.8, margin: 0 },
  textSmall: { color: "#888", fontSize: 13 },
  nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 100 },
  navBtn: (active) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, border: "none", background: "none", color: active ? "#E07B39" : "#888", fontSize: 11, cursor: "pointer", padding: "6px 12px" }),
  compareGrid: { display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" },
  compareLabel: { fontSize: 12, color: "#888", marginBottom: 4, textAlign: "center" },
  divider: { fontSize: 20, color: "#ccc", padding: "0 8px" },
  errorBox: { background: "#FFF3ED", color: "#C0652A", padding: 12, borderRadius: 10, marginTop: 12, fontSize: 14 },
  recordItem: { display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f0f0f0", cursor: "pointer" },
  thumb: { width: 56, height: 56, borderRadius: 8, objectFit: "cover", background: "#f5f5f5" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { background: "#fff", borderRadius: 18, maxWidth: 700, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" },
  modalScroll: { overflow: "auto", padding: 24, flex: 1 },
  modalActions: { display: "flex", gap: 10, padding: 16, borderTop: "1px solid #eee" },
  loading: { textAlign: "center", padding: 20, color: "#888" },
  resultActions: { display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" },
};

// ===================== APP =====================
export function App() {
  const fiRef = useRef(null), aSeq = useRef(0), gSeq = useRef(0), gVar = useRef(0), cfRef = useRef({ name: "", src: "" }), rptRef = useRef(null);
  const [preview, setPreview] = useState(null), [analysis, setAnalysis] = useState(DA), [status, setStatus] = useState("idle");
  const [aSrc, setASrc] = useState("idle"), [gStatus, setGStatus] = useState("idle"), [gErr, setGErr] = useState("");
  const [gResults, setGResults] = useState([]), [styleGuide, setStyleGuide] = useState(null), [styleId, setStyleId] = useState("auto");
  const [fileName, setFileName] = useState(""), [childAge, setChildAge] = useState("5-8"), [gNote, setGNote] = useState("");
  const [records, setRecords] = useState([]), [gHistory, setGHistory] = useState([]), [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis"), [showReport, setShowReport] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const selStyle = useMemo(() => GSO(styleId), [styleId]);
  const sName = useMemo(() => SDN(styleGuide), [styleGuide]);
  const isDone = status === "done";

  useEffect(() => { if (!window.html2canvas) { const s = document.createElement("script"); s.src = "https://registry.npmmirror.com/html2canvas/1.4.1/files/dist/html2canvas.min.js"; document.head.appendChild(s); } }, []);

  async function runAnalysis(fSrc, fMeta) { const seq = ++aSeq.current; setStatus("analyzing"); setASrc("pending"); try { const du = await TDU(fSrc); const [ai, lo] = await Promise.all([API("/api/analyze", { fileName: fMeta.name || C.newArtwork, image: du, childAge }).then(d => NA(d.analysis || d)).catch(() => null), AIL(du)]); if (aSeq.current !== seq) return; if (ai) { setAnalysis(ai); setASrc("ai"); } else { setAnalysis(lo); setASrc("local"); } } catch { if (aSeq.current === seq) { setAnalysis(DA); setASrc("local"); } } finally { if (aSeq.current === seq) setStatus("done"); } }

  async function runGuidance() { if (!preview || gStatus === "generating") return; const vb = ++gVar.current, seq = ++gSeq.current; const vars = Array.from({ length: GBS }, (_, i) => vb + i); gVar.current += GBS - 1; setGStatus("generating"); setGErr(""); setGResults([]); setStyleGuide(null); try { const du = await TDU(preview); const sp = selStyle.id === "auto" ? null : selStyle; const results = await Promise.allSettled(vars.map(v => API("/api/generate-guidance-image", { fileName: cfRef.current.name || C.newArtwork, image: du, stylePreset: sp, variant: v, talentType: null, note: gNote }).then(async d => { let img = d.image; if (d.originalWidth && d.originalHeight) img = await FIA(img, d.originalWidth, d.originalHeight); return { image: img, model: d.model, styleGuide: d.styleGuide || null, variant: d.variant || v }; }))); if (gSeq.current !== seq) return; const ok = results.filter(r => r.status === "fulfilled").map(r => r.value); if (ok.length > 0) { setGResults(ok); setStyleGuide(ok[0].styleGuide || null); setGStatus("done"); setGHistory(h => [{ id: `${Date.now()}`, createdAt: new Date().toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit" }), fileName: fileName || C.newArtwork, preview, generatedImage: ok[0].image, styleName: SDN(ok[0].styleGuide || null) }, ...h].slice(0, 50)); } else { const fe = results.find(r => r.status === "rejected"); setGErr(fe?.reason?.message || C.guideFailedHint); setGStatus("error"); } } catch (e) { if (gSeq.current === seq) { setGErr(e.message || C.guideFailedHint); setGStatus("error"); } } }

  function handleFile(e) { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const src = String(r.result); cfRef.current = { name: f.name, src }; setPreview(src); setFileName(f.name.replace(/\.[^.]+$/, "") || C.newArtwork); setGResults([]); setGErr(""); setGStatus("idle"); setStyleGuide(null); gVar.current = 0; runAnalysis(src, cfRef.current); }; r.readAsDataURL(f); }
  function handleSave() { if (!isDone) return; const rec = { id: `${Date.now()}`, fileName: fileName || C.newArtwork, preview, analysis, savedAt: C.justNow }; setRecords(r => [rec, ...r].slice(0, 50)); setSaved(true); setTimeout(() => setSaved(false), 1600); try { fetch("/api/records/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: rec.fileName, preview, analysis }) }).catch(() => {}); } catch {} }

  async function exportReport() { const el = rptRef.current; if (!el || !window.html2canvas) return; try { const orig = { w: el.style.width, mw: el.style.maxWidth, mh: el.style.maxHeight, ov: el.style.overflow, fs: el.style.fontSize }; const im = window.innerWidth < 860; el.style.width = im ? "600px" : "1240px"; el.style.maxWidth = im ? "600px" : "1240px"; el.style.maxHeight = "none"; el.style.overflow = "visible"; el.style.fontSize = "24px"; const ac = el.querySelector(".report-actions"); if (ac) ac.style.display = "none"; const imgs = el.querySelectorAll("img"); await Promise.all(Array.from(imgs).map(i => new Promise(r => { if (i.complete && i.naturalWidth > 0) r(); else { i.onload = r; i.onerror = r; setTimeout(r, 5000); } }))); await new Promise(r => setTimeout(r, 200)); const cv = await window.html2canvas(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", windowHeight: el.scrollHeight, height: el.scrollHeight }); Object.assign(el.style, { width: orig.w, maxWidth: orig.mw, maxHeight: orig.mh, overflow: orig.ov, fontSize: orig.fs }); if (ac) ac.style.display = ""; const blob = await new Promise(r => cv.toBlob(r, "image/png", 1)); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.download = "学员测评单.png"; a.href = url; a.click(); URL.revokeObjectURL(url); } catch { window.print(); } }

  return (
    <main style={st.page}>
      <div style={st.container}>
        <header style={st.header}><h1 style={st.h1}>{C.title}</h1><p style={st.sub}>从画面看见孩子 · 用优势滋养成长</p></header>

        {activeTab === "analysis" && <div>
          {/* Step 1: Upload */}
          <div style={st.card}>
            <div style={st.stepLabel}>1 上传作品</div>
            <label style={{ display: "block", cursor: "pointer" }}>
              {preview ? <img src={preview} alt="" style={st.img} /> : <div style={st.placeholder}>上传作品</div>}
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </label>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 12, color: "#E07B39" }}>*必选 </span>
              <select value={childAge} onChange={e => setChildAge(e.target.value)} style={{ ...st.select, width: "auto", marginBottom: 0 }}>
                <option value="">选择年龄段</option><option value="3-5">3~5岁</option><option value="5-8">5~8岁</option><option value="8-12">8~12岁</option><option value="12+">12岁+</option>
              </select>
            </div>
          </div>

          {/* Step 2: Style + Generate */}
          <div style={st.card}>
            <div style={st.stepLabel}>2 选择画风方向并生成优化图</div>
            <select value={styleId} onChange={e => { setStyleId(e.target.value); setGResults([]); setGErr(""); setGStatus("idle"); setStyleGuide(null); }} style={st.select}>
              {styleGroups.map(g => <optgroup key={g.label} label={g.label}>{g.options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</optgroup>)}
            </select>
            <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>{selStyle.summary}</p>
            <textarea placeholder="补充说明（可选）例如：希望背景更丰富……" value={gNote} onChange={e => setGNote(e.target.value)} rows={2} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontSize: 13, marginBottom: 12, resize: "vertical" }} />
            <button onClick={runGuidance} disabled={gStatus === "generating" || !preview} style={gStatus === "generating" || !preview ? st.btnDisabled : st.btnPrimary}>
              {gStatus === "generating" ? <RefreshCcw size={18} className="spinning" /> : <Sparkles size={18} />}
              {gStatus === "generating" ? C.guideGenerating : C.guideAction}
            </button>
          </div>

          {/* Step 3: Compare (conditional) */}
          {gStatus !== "idle" && <div style={st.card}>
            <div style={st.stepLabel}>3 对比结果 {gStatus === "done" ? "✓" : gStatus === "error" ? "✗" : "…"} {sName !== "自动匹配画风" ? `· ${sName}` : ""}</div>
            <div style={st.compareGrid}>
              <div><div style={st.compareLabel}>{C.original}</div><img src={preview} alt="" style={{ ...st.img, cursor: "pointer" }} onClick={() => setPreviewImage({ src: preview, title: C.original })} /></div>
              <div style={st.divider}>→</div>
              <div><div style={st.compareLabel}>{C.guideResult}</div>
                {gResults.length > 0 ? <img src={gResults[0].image} alt="" style={{ ...st.img, cursor: "pointer" }} onClick={() => setPreviewImage({ src: gResults[0].image, title: C.guideResult })} /> : gStatus === "generating" ? <div style={{ ...st.placeholder, padding: 40 }}>生成中……</div> : <div style={{ ...st.placeholder, padding: 30, fontSize: 13 }}>{C.guideEmpty}</div>}
              </div>
            </div>
          </div>}
          {gStatus === "error" && <div style={st.errorBox}>❌ {gErr}<br /><button onClick={runGuidance} style={{ ...st.btnAccent, marginTop: 8 }}>重新生成</button></div>}

          {/* Analysis Result */}
          {(status === "done" || aSrc !== "idle") && <div>
            <div style={st.card}><h3 style={st.h3}>老师点评</h3><p style={st.text}>{analysis.teacherCopy}</p><div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>{analysis.tags.map((t, i) => <span key={i} style={st.tag}>{t}</span>)}</div></div>
            <div style={st.card}><h3 style={st.h3}>{C.compositionSkeleton}</h3><div style={st.skeletonGrid}>
              <div style={st.skItem}><span style={st.skLabel}>{C.visualCenter}</span><span style={st.textSmall}>{analysis.skeleton.visualCenter}</span></div>
              <div style={st.skItem}><span style={st.skLabel}>{C.flowLine}</span><span style={st.textSmall}>{analysis.skeleton.flowLine}</span></div>
              <div style={st.skItem}><span style={st.skLabel}>{C.balance}</span><span style={st.textSmall}>{analysis.skeleton.balance}</span></div>
              <div style={st.skItem}><span style={st.skLabel}>{C.depth}</span><span style={st.textSmall}>{analysis.skeleton.depth}</span></div>
            </div></div>
            <div style={st.card}><h3 style={st.h3}>{C.nextTitle}</h3><ol style={{ paddingLeft: 18, margin: 0 }}>{analysis.nextSteps.map((s, i) => <li key={i} style={st.text}>{s}</li>)}</ol></div>
            <div style={st.card}><h3 style={st.h3}>{C.colorGuide}</h3><p style={st.textSmall}>{analysis.colorPlan.summary}</p><div style={{ display: "flex", gap: 10, margin: "8px 0", flexWrap: "wrap" }}>{analysis.colorPlan.palette.map((c, i) => <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}><span style={{ width: 18, height: 18, borderRadius: 4, background: c.hex, display: "inline-block" }} />{c.name}</span>)}</div></div>
            <div style={st.resultActions}>
              <button onClick={handleSave} disabled={!isDone} style={!isDone ? { ...st.btnSecondary, opacity: 0.5 } : st.btnSecondary}><Save size={16} /> {saved ? C.saved : C.save}</button>
              <button onClick={() => setShowReport(true)} disabled={!isDone} style={!isDone ? { ...st.btnAccent, opacity: 0.5 } : st.btnAccent}><FileText size={16} /> {C.viewReport}</button>
            </div>
          </div>}
        </div>}

        {/* Records Tab */}
        {activeTab === "records" && <div>
          <div style={st.card}><h3 style={st.h3}>📋 {C.analysisRecord}</h3>
            {records.length === 0 ? <div style={{ textAlign: "center", color: "#888" }}><p>{C.noSavedRecords}</p><p style={st.textSmall}>{C.noSavedRecordsHint}</p></div>
              : records.map(r => <div key={r.id} style={st.recordItem} onClick={() => { setAnalysis(r.analysis); setActiveTab("analysis"); }}><img src={r.preview} alt="" style={st.thumb} /><div><strong style={{ fontSize: 14 }}>{r.fileName}</strong><br /><span style={st.textSmall}>{r.savedAt}</span></div></div>)}
          </div>
          <div style={st.card}><h3 style={st.h3}>🖼️ {C.generationHistory}</h3>
            {gHistory.length === 0 ? <div style={{ textAlign: "center", color: "#888" }}><p>{C.noGenerationHistory}</p><p style={st.textSmall}>{C.generationHistoryHint}</p></div>
              : gHistory.map(h => <div key={h.id} style={st.recordItem}><img src={h.generatedImage} alt="" style={st.thumb} /><div><strong style={{ fontSize: 14 }}>{h.fileName}</strong><br /><span style={st.textSmall}>{h.createdAt} · {h.styleName}</span></div></div>)}
          </div>
        </div>}
      </div>

      <input ref={fiRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

      {/* Preview Modal */}
      {previewImage && <div style={st.overlay} onClick={() => setPreviewImage(null)}><div style={{ ...st.modal, maxWidth: 500 }} onClick={e => e.stopPropagation()}><div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 600 }}>{previewImage.title}</span><button onClick={() => setPreviewImage(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button></div><img src={previewImage.src} alt="" style={{ width: "100%" }} /></div></div>}

      {/* Report Modal */}
      {showReport && <div style={st.overlay} onClick={() => setShowReport(false)}><div style={st.modal} onClick={e => e.stopPropagation()}>
        <div style={st.modalScroll} ref={rptRef}>
          <div style={{ textAlign: "center", marginBottom: 20 }}><h1 style={{ fontSize: 22, margin: 0 }}>{C.reportTitle}</h1><p style={st.textSmall}>{fileName || C.newArtwork} · 年龄:{childAge || "未选择"}</p></div>
          {preview && <div style={{ textAlign: "center", marginBottom: 16 }}><img src={preview} alt="" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 12 }} /></div>}
          <div style={{ marginBottom: 16 }}><h3 style={st.h3}>老师点评</h3><p style={st.text}>{analysis.teacherCopy}</p><div style={{ display: "flex", gap: 6, marginTop: 8 }}>{analysis.tags.map((t, i) => <span key={i} style={st.tag}>{t}</span>)}</div></div>
          <div style={{ marginBottom: 16 }}><h3 style={st.h3}>{C.compositionSkeleton}</h3><div style={st.skeletonGrid}>{["visualCenter", "flowLine", "balance", "depth"].map(k => <div key={k}><strong style={st.skLabel}>{C[k]}</strong><p style={{ ...st.textSmall, margin: 0 }}>{analysis.skeleton[k]}</p></div>)}</div></div>
          <div style={{ marginBottom: 16 }}><h3 style={st.h3}>{C.nextTitle}</h3><ol style={{ paddingLeft: 18 }}>{analysis.nextSteps.map((s, i) => <li key={i} style={st.text}>{s}</li>)}</ol></div>
          <div style={{ marginBottom: 16 }}><h3 style={st.h3}>{C.colorGuide}</h3><p style={st.textSmall}>{analysis.colorPlan.summary}</p></div>
          {gResults.length > 0 && <div style={{ marginBottom: 16 }}><h3 style={st.h3}>{C.guideResult}</h3><img src={gResults[0].image} alt="" style={{ maxWidth: "100%", borderRadius: 12 }} /></div>}
          <div style={{ textAlign: "center", paddingTop: 12, borderTop: "1px solid #eee" }}><p style={st.textSmall}>{C.strengthClosing}</p></div>
        </div>
        <div style={st.modalActions} className="report-actions">
          <button onClick={() => setShowReport(false)} style={st.btnSecondary}><X size={16} /> {C.closePreview}</button>
          <button onClick={exportReport} style={st.btnAccent}><Download size={16} /> {C.downloadReport}</button>
        </div>
      </div></div>}

      {/* Mobile Nav */}
      <nav style={st.nav}>
        <button onClick={() => setActiveTab("analysis")} style={st.navBtn(activeTab === "analysis")}><Search size={20} /><span>分析</span></button>
        <button onClick={() => setActiveTab("records")} style={st.navBtn(activeTab === "records")}><FileText size={20} /><span>记录</span></button>
      </nav>
    </main>
  );
}
