import { useMemo, useRef, useState, useEffect } from "react";
import { Download, FileText, RefreshCcw, Save, Search, Sparkles, Upload, X } from "lucide-react";

const GBS = 1;
const C = { newArtwork: "新作品", title: "儿童美育一对一点评指导网", saved: "已保存", save: "保存记录", replace: "更换", artworkAlt: "上传的孩子手绘作品", guideAction: "一键优化", guideGenerating: "正在生成优化图……", guideDone: "已生成优化图", guideFailed: "生成失败", guideFailedHint: "刚刚没生成成功，可以稍后重试。", guideEmpty: "上传作品后点「一键优化」生成优化图。", guideResult: "优化效果", strengthClosing: "父母好好学习，孩子天天向上——先看见孩子，再看见作品。", closePreview: "关闭", styleSelectTitle: "画风方向", styleSelectHint: "可以自动匹配或指定完成风格", styleAuto: "自动根据作品匹配", original: "原画", guided: "优化后", noSavedRecords: "暂无保存记录", noSavedRecordsHint: "分析完成后点「保存记录」在此查看", analysisRecord: "分析记录", justNow: "刚刚", generationHistory: "生成历史", generationHistoryHint: "每次「一键优化」生成的优化图会自动保存在这里", noGenerationHistory: "暂无生成记录", viewReport: "查看测评单", downloadReport: "下载测评单", reportTitle: "学员测评单" };

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
async function API(url, body) { const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const data = await resp.json().catch(() => ({})); if (!resp.ok) throw new Error(data.error || data.message || "请求失败"); return data; }
function NA(raw) { if (!raw || typeof raw !== "object") return DA; const pa = raw.psychologyAnalysis || {}, fe = raw.familyEducation || {}, pr = raw.projectionAnalysis || {}, ti = raw.talentInsight || {}, pw = raw.parentWording || {}; return { teacherCopy: sn(raw.teacherCopy, ""), psychologyAnalysis: { emotionState: sn(pa.emotionState), securityLevel: sn(pa.securityLevel), selfCognition: sn(pa.selfCognition), keyEvidence: Array.isArray(pa.keyEvidence) ? pa.keyEvidence.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [] }, familyEducation: { parentInterference: sn(fe.parentInterference), strengthPotential: sn(fe.strengthPotential), actionSuggestions: Array.isArray(fe.actionSuggestions) ? fe.actionSuggestions.filter(e => typeof e === "string" && e.trim()).slice(0, 5) : [] }, projectionAnalysis: { attentionProjection: sn(pr.attentionProjection), relationshipProjection: sn(pr.relationshipProjection), needProjection: sn(pr.needProjection) }, talentInsight: { primaryTalent: sn(ti.primaryTalent), evidenceList: Array.isArray(ti.evidenceList) ? ti.evidenceList.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [] }, parentWording: { shouldSay: Array.isArray(pw.shouldSay) ? pw.shouldSay.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [], shouldNotSay: Array.isArray(pw.shouldNotSay) ? pw.shouldNotSay.filter(e => typeof e === "string" && e.trim()).slice(0, 4) : [] } }; }
function FIA(dataUrl, origW, origH) { if (!origW || !origH) return Promise.resolve(dataUrl); return new Promise((resolve) => { const img = new Image(); img.onload = () => { const ir = img.width / img.height, tr = origW / origH; if (Math.abs(ir - tr) < .01) { resolve(dataUrl); return; } const c = document.createElement("canvas"); let cw, ch, sx, sy; if (ir > tr) { ch = img.height; cw = Math.round(img.height * tr); sx = Math.round((img.width - cw) / 2); sy = 0; } else { cw = img.width; ch = Math.round(img.width / tr); sx = 0; sy = Math.round((img.height - ch) / 2); } c.width = cw; c.height = ch; c.getContext("2d").drawImage(img, sx, sy, cw, ch, 0, 0, cw, ch); resolve(c.toDataURL("image/png")); }; img.onerror = () => resolve(dataUrl); img.src = dataUrl; }); }

// Styles
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
  h3: { margin: "0 0 10px", fontSize: 16, color: "#1a1a1a" },
  h4: { margin: "0 0 6px", fontSize: 14, color: "#C08552" },
  text: { color: "#555", lineHeight: 1.85, margin: 0, fontSize: 14 },
  textSmall: { color: "#888", fontSize: 13, lineHeight: 1.7 },
  tag: { display: "inline-block", background: "#FFF3ED", color: "#E07B39", padding: "2px 10px", borderRadius: 12, fontSize: 12, marginRight: 6, marginBottom: 4 },
  evidenceList: { paddingLeft: 16, margin: "4px 0 0", fontSize: 13, color: "#555", lineHeight: 1.7 },
  actionList: { paddingLeft: 16, margin: "4px 0 0", fontSize: 13, color: "#555", lineHeight: 1.7 },
  section: { marginBottom: 20 },
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
  resultActions: { display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" },
};

export function App() {
  const fiRef = useRef(null), aSeq = useRef(0), gSeq = useRef(0), gVar = useRef(0), cfRef = useRef({ name: "", src: "" }), rptRef = useRef(null);
  const [preview, setPreview] = useState(null), [analysis, setAnalysis] = useState(DA), [status, setStatus] = useState("idle");
  const [aSrc, setASrc] = useState("idle"), [gStatus, setGStatus] = useState("idle"), [gErr, setGErr] = useState("");
  const [gResults, setGResults] = useState([]), [styleGuide, setStyleGuide] = useState(null), [styleId, setStyleId] = useState("auto");
  const [fileName, setFileName] = useState(""), [childAge, setChildAge] = useState(""), [childName, setChildName] = useState(""), [gNote, setGNote] = useState("");
  const [records, setRecords] = useState([]), [gHistory, setGHistory] = useState([]), [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis"), [showReport, setShowReport] = useState(false), [previewImage, setPreviewImage] = useState(null);
  const selStyle = useMemo(() => GSO(styleId), [styleId]);
  const sName = useMemo(() => SDN(styleGuide), [styleGuide]);
  const isDone = status === "done";

  useEffect(() => { if (!window.html2canvas) { const s = document.createElement("script"); s.src = "https://registry.npmmirror.com/html2canvas/1.4.1/files/dist/html2canvas.min.js"; document.head.appendChild(s); } }, []);

  async function runAnalysis(fSrc, fMeta) { const seq = ++aSeq.current; setStatus("analyzing"); setASrc("pending"); try { const du = await TDU(fSrc); const ai = await API("/api/analyze", { fileName: fMeta.name || C.newArtwork, image: du, childAge, childName }).then(d => NA(d.analysis || d)).catch(() => null); if (aSeq.current !== seq) return; if (ai) { setAnalysis(ai); setASrc("ai"); } else { setASrc("local"); } } catch { if (aSeq.current === seq) setASrc("local"); } finally { if (aSeq.current === seq) setStatus("done"); } }

  async function runGuidance() { if (!preview || gStatus === "generating") return; const vb = ++gVar.current, seq = ++gSeq.current; const vars = Array.from({ length: GBS }, (_, i) => vb + i); gVar.current += GBS - 1; setGStatus("generating"); setGErr(""); setGResults([]); setStyleGuide(null); try { const du = await TDU(preview); const sp = selStyle.id === "auto" ? null : selStyle; const results = await Promise.allSettled(vars.map(v => API("/api/generate-guidance-image", { fileName: cfRef.current.name || C.newArtwork, image: du, stylePreset: sp, variant: v, talentType: null, note: gNote }).then(async d => { let img = d.image; if (d.originalWidth && d.originalHeight) img = await FIA(img, d.originalWidth, d.originalHeight); return { image: img, model: d.model, styleGuide: d.styleGuide || null, variant: d.variant || v }; }))); if (gSeq.current !== seq) return; const ok = results.filter(r => r.status === "fulfilled").map(r => r.value); if (ok.length > 0) { setGResults(ok); setStyleGuide(ok[0].styleGuide || null); setGStatus("done"); setGHistory(h => [{ id: `${Date.now()}`, createdAt: new Date().toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit" }), fileName: fileName || C.newArtwork, preview, generatedImage: ok[0].image, styleName: SDN(ok[0].styleGuide || null) }, ...h].slice(0, 50)); } else { const fe = results.find(r => r.status === "rejected"); setGErr(fe?.reason?.message || C.guideFailedHint); setGStatus("error"); } } catch (e) { if (gSeq.current === seq) { setGErr(e.message || C.guideFailedHint); setGStatus("error"); } } }

  function handleFile(e) { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const src = String(r.result); cfRef.current = { name: f.name, src }; setPreview(src); setFileName(f.name.replace(/\.[^.]+$/, "") || C.newArtwork); setGResults([]); setGErr(""); setGStatus("idle"); setStyleGuide(null); gVar.current = 0; runAnalysis(src, cfRef.current); }; r.readAsDataURL(f); }
  function handleSave() { if (!isDone) return; const rec = { id: `${Date.now()}`, fileName: fileName || C.newArtwork, preview, analysis, savedAt: C.justNow }; setRecords(r => [rec, ...r].slice(0, 50)); setSaved(true); setTimeout(() => setSaved(false), 1600); try { fetch("/api/records/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: rec.fileName, preview, analysis }) }).catch(() => {}); } catch {} }

  async function exportReport() { const el = rptRef.current; if (!el || !window.html2canvas) return; try { const orig = { w: el.style.width, mw: el.style.maxWidth, mh: el.style.maxHeight, ov: el.style.overflow, fs: el.style.fontSize }; const im = window.innerWidth < 860; el.style.width = im ? "600px" : "1240px"; el.style.maxWidth = im ? "600px" : "1240px"; el.style.maxHeight = "none"; el.style.overflow = "visible"; el.style.fontSize = "24px"; const ac = el.querySelector(".report-actions"); if (ac) ac.style.display = "none"; const imgs = el.querySelectorAll("img"); await Promise.all(Array.from(imgs).map(i => new Promise(r => { if (i.complete && i.naturalWidth > 0) r(); else { i.onload = r; i.onerror = r; setTimeout(r, 5000); } }))); await new Promise(r => setTimeout(r, 200)); const cv = await window.html2canvas(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", windowHeight: el.scrollHeight, height: el.scrollHeight }); Object.assign(el.style, { width: orig.w, maxWidth: orig.mw, maxHeight: orig.mh, overflow: orig.ov, fontSize: orig.fs }); if (ac) ac.style.display = ""; const blob = await new Promise(r => cv.toBlob(r, "image/png", 1)); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.download = "学员测评单.png"; a.href = url; a.click(); URL.revokeObjectURL(url); } catch { window.print(); } }

  const a = analysis, pa = a.psychologyAnalysis, fe = a.familyEducation, pr = a.projectionAnalysis, ti = a.talentInsight, pw = a.parentWording;

  function updateTeacherCopy(v) { setAnalysis(prev => ({ ...prev, teacherCopy: v })); }

  return (
    <main style={st.page}><div style={st.container}>
      <header style={st.header}><h1 style={st.h1}>{C.title}</h1><p style={st.sub}>从画面看见孩子 · 用优势滋养成长</p></header>
      {activeTab === "analysis" && <div>
        <div style={st.card}><div style={st.stepLabel}>1 上传作品</div><label style={{ display: "block", cursor: "pointer" }}>{preview ? <img src={preview} alt="" style={st.img} /> : <div style={st.placeholder}>上传作品</div>}<input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} /></label>
          <div style={{ marginTop: 12 }}><span style={{ fontSize: 12, color: "#888" }}>孩子姓名（选填）</span><input type="text" placeholder="输入孩子姓名或昵称" value={childName} onChange={e => setChildName(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginTop: 4 }} /></div>
          <div style={{ marginTop: 12 }}><span style={{ fontSize: 12, color: "#E07B39" }}>*必选 </span><select value={childAge} onChange={e => setChildAge(e.target.value)} style={{ ...st.select, width: "auto", marginBottom: 0 }}><option value="">选择年龄段</option><option value="3-5">3~5岁 · 象征期</option><option value="5-8">5~8岁 · 意向表现期</option><option value="8-12">8~12岁 · 写实期</option><option value="12+">12岁+ · 专业发展期</option></select></div></div>
        <div style={st.card}><div style={st.stepLabel}>2 选择画风方向并生成优化图</div><select value={styleId} onChange={e => { setStyleId(e.target.value); setGResults([]); setGErr(""); setGStatus("idle"); setStyleGuide(null); }} style={st.select}>{styleGroups.map(g => <optgroup key={g.label} label={g.label}>{g.options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</optgroup>)}</select><p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>{selStyle.summary}</p><textarea placeholder="补充说明（可选）" value={gNote} onChange={e => setGNote(e.target.value)} rows={2} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontSize: 13, marginBottom: 12, resize: "vertical" }} />
          <button onClick={runGuidance} disabled={gStatus === "generating" || !preview} style={gStatus === "generating" || !preview ? st.btnDisabled : st.btnPrimary}>{gStatus === "generating" ? <RefreshCcw size={18} className="spinning" /> : <Sparkles size={18} />}{gStatus === "generating" ? C.guideGenerating : C.guideAction}</button></div>
        {gStatus !== "idle" && <div style={st.card}><div style={st.stepLabel}>3 对比结果 {gStatus === "done" ? "✓" : gStatus === "error" ? "✗" : "…"} {sName !== "自动匹配画风" ? `· ${sName}` : ""}</div><div style={st.compareGrid}><div><div style={st.compareLabel}>{C.original}</div><img src={preview} alt="" style={{ ...st.img, cursor: "pointer" }} onClick={() => setPreviewImage({ src: preview, title: C.original })} /></div><div style={st.divider}>→</div><div><div style={st.compareLabel}>{C.guideResult}</div>{gResults.length > 0 ? <img src={gResults[0].image} alt="" style={{ ...st.img, cursor: "pointer" }} onClick={() => setPreviewImage({ src: gResults[0].image, title: C.guideResult })} /> : gStatus === "generating" ? <div style={{ ...st.placeholder, padding: 40 }}>生成中……</div> : <div style={{ ...st.placeholder, padding: 30, fontSize: 13 }}>{C.guideEmpty}</div>}</div></div></div>}
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
        <div style={st.card}><h3 style={st.h3}>📋 {C.analysisRecord}</h3>{records.length === 0 ? <div style={{ textAlign: "center", color: "#888" }}><p>{C.noSavedRecords}</p><p style={st.textSmall}>{C.noSavedRecordsHint}</p></div> : records.map(r => <div key={r.id} style={st.recordItem} onClick={() => { setAnalysis(r.analysis); setActiveTab("analysis"); }}><img src={r.preview} alt="" style={st.thumb} /><div><strong style={{ fontSize: 14 }}>{r.fileName}</strong><br /><span style={st.textSmall}>{r.savedAt}</span></div></div>)}</div>
        <div style={st.card}><h3 style={st.h3}>🖼️ {C.generationHistory}</h3>{gHistory.length === 0 ? <div style={{ textAlign: "center", color: "#888" }}><p>{C.noGenerationHistory}</p><p style={st.textSmall}>{C.generationHistoryHint}</p></div> : gHistory.map(h => <div key={h.id} style={st.recordItem}><img src={h.generatedImage} alt="" style={st.thumb} /><div><strong style={{ fontSize: 14 }}>{h.fileName}</strong><br /><span style={st.textSmall}>{h.createdAt} · {h.styleName}</span></div></div>)}</div>
      </div>}
    </div>

    <input ref={fiRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    {previewImage && <div style={st.overlay} onClick={() => setPreviewImage(null)}><div style={{ ...st.modal, maxWidth: "90vw", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}><div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 600 }}>{previewImage.title}</span><button onClick={() => setPreviewImage(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button></div><img src={previewImage.src} alt="" style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }} /></div></div>}
    {showReport && <div style={st.overlay} onClick={() => setShowReport(false)}><div style={st.modal} onClick={e => e.stopPropagation()}><div style={{ ...st.modalScroll, textAlign: "center" }} ref={rptRef}><div style={{ textAlign: "center", marginBottom: 20 }}><h1 style={{ fontSize: 22, margin: 0 }}>{C.reportTitle}</h1><p style={st.textSmall}>{childName ? `${childName} · ` : ""}{fileName || C.newArtwork} · 年龄:{childAge || "未选择"}</p></div>
      {preview && <div style={{ textAlign: "center", marginBottom: 16 }}><img src={preview} alt="" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 12 }} /></div>}
      {a.teacherCopy && <div style={{ marginBottom: 16 }}><h3 style={st.h3}>📝 老师点评</h3><p style={st.text}>{a.teacherCopy}</p></div>}
      {pa.emotionState && <div style={{ marginBottom: 16 }}><h3 style={st.h3}>🧠 心理分析</h3><p style={st.text}><strong>情绪状态：</strong>{pa.emotionState}</p>{pa.securityLevel && <p style={st.text}><strong>安全感：</strong>{pa.securityLevel}</p>}{pa.selfCognition && <p style={st.text}><strong>自我认知：</strong>{pa.selfCognition}</p>}</div>}
      {fe.parentInterference && <div style={{ marginBottom: 16 }}><h3 style={st.h3}>🏠 家庭教育</h3><p style={st.text}>{fe.parentInterference}</p>{fe.strengthPotential && <p style={st.text}><strong>优势潜能：</strong>{fe.strengthPotential}</p>}{fe.actionSuggestions.length > 0 && <ol style={st.actionList}>{fe.actionSuggestions.map((s, i) => <li key={i}>{s}</li>)}</ol>}</div>}
      {pr.attentionProjection && <div style={{ marginBottom: 16 }}><h3 style={st.h3}>🔍 心理投射</h3><p style={st.text}>{pr.attentionProjection}</p>{pr.relationshipProjection && <p style={st.text}>{pr.relationshipProjection}</p>}{pr.needProjection && <p style={st.text}>{pr.needProjection}</p>}</div>}
      {ti.primaryTalent && <div style={{ marginBottom: 16 }}><h3 style={st.h3}>🌟 天赋识别</h3><p style={st.text}>{ti.primaryTalent}</p></div>}
      {pw.shouldSay.length > 0 && <div style={{ marginBottom: 16 }}><h3 style={st.h3}>💬 家长引导话术</h3><p style={{ ...st.text, color: "#2E7D32", fontWeight: 600 }}>✅ 建议这样说：</p><ul style={st.actionList}>{pw.shouldSay.map((s, i) => <li key={i} style={{ color: "#2E7D32" }}>"{s}"</li>)}</ul>{pw.shouldNotSay.length > 0 && <><p style={{ ...st.text, color: "#C62828", fontWeight: 600 }}>❌ 避免这样说：</p><ul style={st.actionList}>{pw.shouldNotSay.map((s, i) => <li key={i} style={{ color: "#C62828" }}>"{s}"</li>)}</ul></>}</div>}
      {gResults.length > 0 && <div style={{ marginBottom: 16 }}><h3 style={st.h3}>{C.guideResult}</h3><img src={gResults[0].image} alt="" style={{ maxWidth: "100%", borderRadius: 12 }} /></div>}
      <div style={{ textAlign: "center", paddingTop: 12, borderTop: "1px solid #eee" }}><p style={st.textSmall}>{C.strengthClosing}</p></div>
    </div><div style={st.modalActions} className="report-actions"><button onClick={() => setShowReport(false)} style={st.btnSecondary}><X size={16} /> {C.closePreview}</button><button onClick={exportReport} style={st.btnAccent}><Download size={16} /> {C.downloadReport}</button></div></div></div>}
    <nav style={st.nav}><button onClick={() => setActiveTab("analysis")} style={st.navBtn(activeTab === "analysis")}><Search size={20} /><span>分析</span></button><button onClick={() => setActiveTab("records")} style={st.navBtn(activeTab === "records")}><FileText size={20} /><span>记录</span></button></nav>
    </main>
  );
}
