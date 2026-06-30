import { useState } from "react";
import { Sparkles, Search, FileText } from "lucide-react";

export function App() {
  const [tab, setTab] = useState("analysis");
  const [preview, setPreview] = useState(null);

  function handleFile(e) { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setPreview(String(r.result)); r.readAsDataURL(f); }

  const S = {
    card: { background: "#fff", borderRadius: 18, padding: 20, marginBottom: 16, boxShadow: "0 1px 0 rgba(255,255,255,0.7), 0 12px 30px rgba(15,23,42,0.04)" },
    stepLabel: { fontSize: 13, color: "#888", marginBottom: 12, letterSpacing: 1 },
    btn: { width: "100%", padding: 14, background: "#E07B39", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
    placeholder: { border: "2px dashed #ddd", borderRadius: 12, padding: 60, textAlign: "center", color: "#aaa", fontSize: 18, letterSpacing: 4, cursor: "pointer" },
  };

  function navStyle(active) { return { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, border: "none", background: "none", color: active ? "#E07B39" : "#888", fontSize: 11, cursor: "pointer", padding: "6px 12px" }; }

  return (
    <main style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px 100px" }}>
        <header style={{ textAlign: "center", padding: "30px 0 20px" }}>
          <h1 style={{ fontSize: 22, margin: 0, color: "#1a1a1a" }}>儿童美育一对一点评指导网</h1>
          <p style={{ color: "#888", fontSize: 14, marginTop: 4 }}>从画面看见孩子 · 用优势滋养成长</p>
        </header>

        {tab === "analysis" && <div>
          <div style={S.card}>
            <div style={S.stepLabel}>1 上传作品</div>
            <label style={{ display: "block", cursor: "pointer" }}>
              {preview ? <img src={preview} alt="" style={{ width: "100%", borderRadius: 12, maxHeight: 300, objectFit: "contain" }} /> : <div style={S.placeholder}>上传作品</div>}
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </label>
          </div>
          <div style={S.card}>
            <div style={S.stepLabel}>2 选择画风方向并生成优化图</div>
            <select style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 12 }}>
              <option>自动根据作品匹配</option><option>日系温暖手绘动画</option><option>日系通透光影</option>
            </select>
            <button style={S.btn}><Sparkles size={18} /> 一键优化</button>
          </div>
          <div style={S.card}>
            <h3 style={{ margin: "0 0 12px" }}>老师点评</h3>
            <p style={{ color: "#555", lineHeight: 1.8 }}>上传作品后，AI 老师会分析孩子的画面并给出专业建议。</p>
          </div>
        </div>}

        {tab === "records" && <div style={{ ...S.card, textAlign: "center", color: "#888" }}>
          <p style={{ margin: 0 }}>暂无保存记录</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>分析完成后点「保存记录」在此查看</p>
        </div>}
      </div>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 100 }}>
        <button onClick={() => setTab("analysis")} style={navStyle(tab === "analysis")}><Search size={20} /><span>分析</span></button>
        <button onClick={() => setTab("records")} style={navStyle(tab === "records")}><FileText size={20} /><span>记录</span></button>
      </nav>
    </main>
  );
}
