import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar } from "recharts";

// ============================================================
// THEME & CONSTANTS
// ============================================================
const TEAL = "#008080";
const TEAL_LIGHT = "#e0f5f5";
const TEAL_MID = "#40b0b0";
const TEAL_DARK = "#005f5f";
const ROSE = "#e85b8a";
const AMBER = "#f59e0b";
const LAVENDER = "#8b5cf6";

const CYCLE_DATA = [
  { month: "Jan", length: 28, stress: 4, sleep: 7.2, predicted: 28 },
  { month: "Feb", length: 30, stress: 6, sleep: 6.5, predicted: 29 },
  { month: "Mar", length: 27, stress: 3, sleep: 7.8, predicted: 28 },
  { month: "Apr", length: 29, stress: 5, sleep: 7.0, predicted: 28 },
  { month: "May", length: 31, stress: 7, sleep: 6.2, predicted: 30 },
  { month: "Jun", length: 28, stress: 4, sleep: 7.5, predicted: 29 },
  { month: "Jul", length: null, stress: null, sleep: null, predicted: 29 },
];

const RADAR_DATA = [
  { metric: "Cycle Reg.", score: 72 },
  { metric: "Sleep", score: 85 },
  { metric: "Stress Mgmt", score: 60 },
  { metric: "Activity", score: 78 },
  { metric: "Nutrition", score: 65 },
  { metric: "Hydration", score: 80 },
];

const SYMPTOM_DATA = [
  { day: "D1", cramps: 7, fatigue: 6, mood: 4 },
  { day: "D2", cramps: 8, fatigue: 7, mood: 3 },
  { day: "D3", cramps: 5, fatigue: 6, mood: 5 },
  { day: "D4", cramps: 3, fatigue: 4, mood: 6 },
  { day: "D5", cramps: 1, fatigue: 3, mood: 7 },
  { day: "D6", cramps: 0, fatigue: 2, mood: 8 },
  { day: "D7", cramps: 0, fatigue: 1, mood: 8 },
];

const KNOWLEDGE_BASE = {
  "irregular cycle": "Irregular cycles can result from stress, hormonal imbalances, thyroid issues, or significant weight changes. Cycles ranging 21–35 days are considered normal. Tracking patterns over 3+ months helps identify irregularities worth consulting a doctor about.",
  "pcos": "PCOS (Polycystic Ovary Syndrome) symptoms include irregular periods, excess androgen levels, and polycystic ovaries. Key signs: cycles longer than 35 days, acne, excess hair growth, and weight gain. A gynecologist can diagnose via ultrasound and blood tests.",
  "cramps": "Period cramps (dysmenorrhea) are caused by prostaglandins triggering uterine contractions. Evidence-based relief: ibuprofen/naproxen (anti-prostaglandins), heat therapy on the lower abdomen, light exercise, magnesium supplementation, and reducing caffeine. Severe cramps may indicate endometriosis.",
  "hormonal imbalance": "Signs of hormonal imbalance include mood swings, irregular periods, acne, hair loss, weight changes, and fatigue. Contributing factors: high stress (cortisol spikes), poor sleep, nutritional deficiencies (iron, B vitamins), and thyroid dysfunction. Lifestyle changes and blood tests are the first steps.",
  "late period": "A period is considered late after 5+ days from your expected date. Common causes: stress, illness, significant weight change, intense exercise, travel, pregnancy, or PCOS. One-off delays are usually benign. Repeated delays warrant a medical consultation.",
  "fertility window": "Your fertile window is typically 5 days before ovulation plus ovulation day itself (day 14 in a 28-day cycle). Signs of ovulation: clear stretchy cervical mucus, slight basal body temperature rise (~0.2°C), and mild one-sided pelvic pain (mittelschmerz). Ovulation predictor kits detect the LH surge 12–36 hours before ovulation.",
  "heavy bleeding": "Heavy menstrual bleeding (menorrhagia) means soaking a pad/tampon hourly for several hours. Causes: fibroids, polyps, adenomyosis, hormonal imbalances, or blood clotting disorders. Iron-deficiency anemia is a common complication. Medical evaluation is recommended if bleeding significantly impacts daily life.",
  "stress cycle": "Stress affects your cycle by elevating cortisol, which suppresses GnRH (gonadotropin-releasing hormone), disrupting ovulation timing. Even moderate chronic stress can shift your cycle by 1–7 days. Mindfulness, adequate sleep (7–9 hrs), and stress management techniques can help regulate this.",
  "sleep cycle": "Poor sleep disrupts melatonin and cortisol rhythms, which in turn affect estrogen and progesterone levels. Aim for 7–9 hours of quality sleep. Consistent sleep schedules improve cycle regularity. Studies show women with sleep disorders have 2.3× higher rates of menstrual irregularities.",
  "default": "I can help you understand menstrual health topics including cycle patterns, symptoms, hormonal health, PCOS indicators, and wellness strategies. Try asking about: irregular cycles, cramps relief, hormonal imbalance, fertility window, or stress effects on your cycle."
};

function getAIResponse(query) {
  const q = query.toLowerCase();
  for (const [key, response] of Object.entries(KNOWLEDGE_BASE)) {
    if (key === "default") continue;
    if (q.includes(key) || key.split(" ").some(word => q.includes(word))) {
      return response;
    }
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return "Hello! I'm your MenstruAI health assistant. I'm here to help you understand your menstrual health, cycle patterns, symptoms, and overall wellness. What would you like to know today?";
  }
  return KNOWLEDGE_BASE["default"];
}

// ============================================================
// UTILITY COMPONENTS
// ============================================================

function GlassCard({ children, className = "", style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: 20,
        border: "1px solid rgba(0,128,128,0.12)",
        boxShadow: "0 4px 24px rgba(0,128,128,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s, transform 0.2s",
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

function Badge({ label, color = TEAL, bg = TEAL_LIGHT }) {
  return (
    <span style={{
      background: bg,
      color,
      fontSize: 11,
      fontWeight: 700,
      padding: "3px 10px",
      borderRadius: 20,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      {label}
    </span>
  );
}

function RiskIndicator({ level }) {
  const config = {
    low: { color: "#059669", bg: "#d1fae5", label: "Low Risk", icon: "✓" },
    medium: { color: "#d97706", bg: "#fef3c7", label: "Moderate", icon: "⚠" },
    high: { color: "#dc2626", bg: "#fee2e2", label: "Elevated", icon: "!" },
  };
  const c = config[level] || config.low;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 30, background: c.bg }}>
      <span style={{ color: c.color, fontWeight: 700, fontSize: 14 }}>{c.icon}</span>
      <span style={{ color: c.color, fontWeight: 600, fontSize: 13 }}>{c.label}</span>
    </div>
  );
}

function ProgressRing({ value, max = 100, size = 80, stroke = 8, color = TEAL, label, sublabel }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / max) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,128,128,0.1)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div style={{ textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", lineHeight: 1 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 10, color: "#8b92a5", marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

function PulsingDot({ color = TEAL }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: 10, height: 10 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%", background: color, opacity: 0.4,
        animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite"
      }} />
      <span style={{ position: "absolute", inset: "2px", borderRadius: "50%", background: color }} />
    </span>
  );
}

// ============================================================
// SECTIONS
// ============================================================

function DashboardSection({ onNavigate }) {
  const [cycleDay, setCycleDay] = useState(18);
  const [phase, setPhase] = useState("Luteal");
  const daysToNext = 29 - cycleDay;

  const phases = [
    { name: "Menstrual", days: "1–5", color: "#e85b8a", active: cycleDay <= 5 },
    { name: "Follicular", days: "6–13", color: "#f59e0b", active: cycleDay > 5 && cycleDay <= 13 },
    { name: "Ovulation", days: "14–16", color: "#10b981", active: cycleDay > 13 && cycleDay <= 16 },
    { name: "Luteal", days: "17–28", color: "#8b5cf6", active: cycleDay > 16 },
  ];

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${TEAL} 0%, #005f5f 50%, #0a3d3d 100%)`,
        borderRadius: 28, padding: "40px 36px", marginBottom: 28,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 280, height: 280, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)"
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: "40%",
          width: 180, height: 180, borderRadius: "50%",
          background: "rgba(255,255,255,0.04)"
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Good morning, Priya ✦
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 8, fontFamily: "'Playfair Display', Georgia, serif" }}>
                Day {cycleDay} of your cycle
              </div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 20 }}>
                You're in the <strong style={{ color: "#c8f7f7" }}>{phase} phase</strong> · Next cycle in {daysToNext} days
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => onNavigate("predict")}
                  style={{
                    background: "rgba(255,255,255,0.95)", color: TEAL_DARK,
                    border: "none", padding: "10px 22px", borderRadius: 30,
                    fontWeight: 700, fontSize: 13, cursor: "pointer"
                  }}
                >
                  Predict Next Cycle →
                </button>
                <button
                  onClick={() => onNavigate("assistant")}
                  style={{
                    background: "rgba(255,255,255,0.12)", color: "#fff",
                    border: "1px solid rgba(255,255,255,0.3)", padding: "10px 22px", borderRadius: 30,
                    fontWeight: 600, fontSize: 13, cursor: "pointer"
                  }}
                >
                  Ask AI Assistant
                </button>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <ProgressRing value={cycleDay} max={29} size={110} stroke={9} color="#c8f7f7" label={`${cycleDay}`} sublabel="day" />
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>of 29-day cycle</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Timeline */}
      <GlassCard style={{ padding: "24px 28px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#8b92a5", textTransform: "uppercase", marginBottom: 16 }}>
          Cycle Phase Timeline
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {phases.map(p => (
            <div key={p.name} style={{
              flex: "1 1 120px",
              padding: "14px 16px", borderRadius: 14,
              background: p.active ? p.color + "18" : "#f8f9fb",
              border: `2px solid ${p.active ? p.color : "transparent"}`,
              transition: "all 0.3s"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.active ? p.color : "#d1d5db" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: p.active ? p.color : "#9ca3af" }}>{p.name}</span>
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Days {p.days}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Avg Cycle", value: "29d", icon: "◎", color: TEAL },
          { label: "Last Duration", value: "5d", icon: "🔴", color: ROSE },
          { label: "Sleep Avg", value: "7.1h", icon: "◐", color: LAVENDER },
          { label: "Stress Level", value: "4/10", icon: "◈", color: AMBER },
        ].map(s => (
          <GlassCard key={s.label} style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#8b92a5", marginTop: 4 }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Cycle Trend Chart */}
      <GlassCard style={{ padding: "24px 28px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>Cycle Length Trends</div>
            <div style={{ fontSize: 12, color: "#8b92a5", marginTop: 2 }}>Actual vs AI predicted</div>
          </div>
          <Badge label="6 months" />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={CYCLE_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={TEAL} stopOpacity={0.25} />
                <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ROSE} stopOpacity={0.15} />
                <stop offset="95%" stopColor={ROSE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis domain={[24, 34]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,128,128,0.15)", fontSize: 12, background: "rgba(255,255,255,0.97)" }}
              formatter={(val, name) => [val ? `${val} days` : "–", name === "length" ? "Actual" : "Predicted"]}
            />
            <Area type="monotone" dataKey="length" stroke={TEAL} strokeWidth={2.5} fill="url(#actualGrad)" dot={{ r: 4, fill: TEAL, strokeWidth: 0 }} connectNulls={false} />
            <Area type="monotone" dataKey="predicted" stroke={ROSE} strokeWidth={2} fill="url(#predGrad)" strokeDasharray="5 4" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 16, height: 2.5, background: TEAL, borderRadius: 2, display: "inline-block" }} />Actual
          </span>
          <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 16, height: 2, background: ROSE, borderRadius: 2, display: "inline-block", opacity: 0.7 }} />AI Predicted
          </span>
        </div>
      </GlassCard>

      {/* Health Score Radar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <GlassCard style={{ padding: "24px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Health Score</div>
          <div style={{ fontSize: 11, color: "#8b92a5", marginBottom: 12 }}>6 wellness dimensions</div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(0,0,0,0.07)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "#9ca3af" }} />
              <Radar dataKey="score" stroke={TEAL} fill={TEAL} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard style={{ padding: "24px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Symptom Tracker</div>
          <div style={{ fontSize: 11, color: "#8b92a5", marginBottom: 12 }}>Last cycle, 7 days</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={SYMPTOM_DATA} margin={{ left: -30, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }} />
              <Bar dataKey="cramps" fill={ROSE} radius={[3, 3, 0, 0]} opacity={0.8} />
              <Bar dataKey="fatigue" fill={AMBER} radius={[3, 3, 0, 0]} opacity={0.8} />
              <Bar dataKey="mood" fill={TEAL} radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
            {[["Cramps", ROSE], ["Fatigue", AMBER], ["Mood", TEAL]].map(([l, c]) => (
              <span key={l} style={{ fontSize: 10, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />{l}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ============================================================
// PREDICT SECTION
// ============================================================
function PredictSection() {
  const [form, setForm] = useState({ cycleLength: 29, stressLevel: 4, sleepHours: 7, activityLevel: 3 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 400);
    return () => clearInterval(id);
  }, [loading]);

  const predict = async () => {
    setLoading(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2200));
    // Lightweight heuristic model (simulates ML output)
    const base = form.cycleLength;
    const stressFactor = (form.stressLevel - 5) * 0.4;
    const sleepFactor = (7 - form.sleepHours) * 0.3;
    const activityFactor = (form.activityLevel - 3) * -0.2;
    const predicted = Math.round((base + stressFactor + sleepFactor + activityFactor) * 10) / 10;
    const confidence = Math.max(72, Math.min(96, 88 - Math.abs(stressFactor) * 3 - Math.abs(sleepFactor) * 2));
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + predicted);
    setResult({ predicted, confidence: Math.round(confidence), nextDate: nextDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) });
    setLoading(false);
  };

  const SliderInput = ({ label, key_, min, max, step = 1, unit = "" }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</label>
        <span style={{
          background: TEAL_LIGHT, color: TEAL_DARK, padding: "3px 12px",
          borderRadius: 20, fontSize: 13, fontWeight: 700
        }}>{form[key_]}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={form[key_]}
        onChange={e => setForm(f => ({ ...f, [key_]: parseFloat(e.target.value) }))}
        style={{ width: "100%", accentColor: TEAL, height: 4, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: TEAL, textTransform: "uppercase", marginBottom: 6 }}>AI Prediction Engine</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", fontFamily: "'Playfair Display', Georgia, serif" }}>Cycle Predictor</div>
        <div style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>Powered by regression + sequence modeling. Enter your current health metrics.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Input Form */}
        <GlassCard style={{ padding: "28px 28px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid rgba(0,128,128,0.1)" }}>
            Health Metrics Input
          </div>
          <SliderInput label="Average Cycle Length" key_="cycleLength" min={21} max={45} unit=" days" />
          <SliderInput label="Current Stress Level" key_="stressLevel" min={1} max={10} unit="/10" />
          <SliderInput label="Average Sleep Hours" key_="sleepHours" min={4} max={10} step={0.5} unit="h" />
          <SliderInput label="Physical Activity" key_="activityLevel" min={1} max={10} unit="/10" />
          <button
            onClick={predict}
            disabled={loading}
            style={{
              width: "100%", padding: "14px 0",
              background: loading ? "#e5e7eb" : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
              color: loading ? "#9ca3af" : "#fff",
              border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {loading ? `Analyzing${dots}` : "✦ Generate Prediction"}
          </button>
        </GlassCard>

        {/* Result Panel */}
        <div>
          {!result && !loading && (
            <GlassCard style={{ padding: "32px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>◎</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#9ca3af" }}>Set your metrics and run the prediction to see your next cycle forecast</div>
            </GlassCard>
          )}
          {loading && (
            <GlassCard style={{ padding: "40px 28px", textAlign: "center" }}>
              <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 24px" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    position: "absolute", inset: i * 10,
                    borderRadius: "50%", border: `2px solid ${TEAL}`,
                    opacity: 0.4 - i * 0.1,
                    animation: `spin ${1 + i * 0.3}s linear infinite ${i % 2 ? "reverse" : ""}`,
                  }} />
                ))}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>◎</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>AI model running{dots}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>Analyzing patterns across 6 months of data</div>
            </GlassCard>
          )}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <GlassCard style={{ padding: "28px 28px", background: `linear-gradient(135deg, ${TEAL_LIGHT}, rgba(255,255,255,0.95))` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                  ✦ Prediction Result
                </div>
                <div style={{ fontSize: 42, fontWeight: 800, color: TEAL_DARK, lineHeight: 1 }}>{result.predicted}<span style={{ fontSize: 16, fontWeight: 600, color: TEAL }}> days</span></div>
                <div style={{ fontSize: 14, color: "#374151", marginTop: 8 }}>Predicted next cycle length</div>
                <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(255,255,255,0.7)", borderRadius: 12 }}>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Expected next period</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>{result.nextDate}</div>
                </div>
              </GlassCard>

              <GlassCard style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Prediction Confidence</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: TEAL }}>{result.confidence}%</span>
                </div>
                <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${result.confidence}%`,
                    background: `linear-gradient(90deg, ${TEAL}, ${TEAL_MID})`,
                    borderRadius: 4, transition: "width 1s cubic-bezier(0.4,0,0.2,1)"
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
                  <span>Low</span><span>High</span>
                </div>
              </GlassCard>

              <GlassCard style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 12 }}>Influencing Factors</div>
                {[
                  { label: "Stress impact", value: form.stressLevel > 6 ? "High" : form.stressLevel > 3 ? "Moderate" : "Low", color: form.stressLevel > 6 ? "#dc2626" : form.stressLevel > 3 ? "#d97706" : "#059669" },
                  { label: "Sleep quality", value: form.sleepHours >= 7 ? "Optimal" : form.sleepHours >= 6 ? "Fair" : "Poor", color: form.sleepHours >= 7 ? "#059669" : form.sleepHours >= 6 ? "#d97706" : "#dc2626" },
                  { label: "Activity effect", value: form.activityLevel >= 6 ? "Positive" : "Neutral", color: form.activityLevel >= 6 ? "#059669" : "#6b7280" },
                ].map(f => (
                  <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>{f.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: f.color, padding: "2px 10px", borderRadius: 20, background: f.color + "15" }}>{f.value}</span>
                  </div>
                ))}
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INSIGHTS / RISK SECTION
// ============================================================
function InsightsSection() {
  const [activeRisk, setActiveRisk] = useState(null);

  const risks = [
    {
      id: "pcos",
      title: "PCOS Indicators",
      level: "medium",
      icon: "⬡",
      description: "Mild hormonal irregularity patterns detected. 2 out of 5 common PCOS markers present.",
      markers: [
        { name: "Cycle variability > 7 days", present: true },
        { name: "Irregular anovulatory cycles", present: false },
        { name: "Elevated androgen signs", present: false },
        { name: "Cycle length > 35 days", present: false },
        { name: "Stress-related delays", present: true },
      ],
      recommendation: "Consider tracking basal body temperature and consulting a gynecologist for a hormonal panel if pattern continues for 3+ months."
    },
    {
      id: "thyroid",
      title: "Thyroid Pattern",
      level: "low",
      icon: "◈",
      description: "No significant thyroid-related cycle disruption patterns detected.",
      markers: [
        { name: "Unusual cycle shortening", present: false },
        { name: "Excessive fatigue pattern", present: false },
        { name: "Significant weight fluctuation", present: false },
      ],
      recommendation: "Your cycle patterns don't suggest thyroid involvement. Maintain annual blood work as standard practice."
    },
    {
      id: "hormonal",
      title: "Hormonal Balance",
      level: "medium",
      icon: "◎",
      description: "Luteal phase appears slightly shortened based on cycle pattern analysis.",
      markers: [
        { name: "Luteal phase < 10 days", present: true },
        { name: "Premenstrual mood shifts", present: true },
        { name: "Cycle shortening trend", present: false },
      ],
      recommendation: "Consider vitamin B6 and magnesium supplementation. Reduce evening screen time to improve melatonin-progesterone balance."
    },
  ];

  const tips = [
    { icon: "◐", title: "Optimize Sleep", body: "Aim for 7–9 hrs with consistent sleep/wake times. Irregular sleep disrupts LH surge timing.", color: LAVENDER },
    { icon: "◇", title: "Stress Protocol", body: "High cortisol delays ovulation by 1–7 days. Try 10-min daily breathwork in your follicular phase.", color: AMBER },
    { icon: "◉", title: "Anti-inflammatory Diet", body: "Omega-3s, turmeric, and leafy greens reduce prostaglandin-driven cramping significantly.", color: TEAL },
    { icon: "△", title: "Cycle Syncing", body: "Align exercise intensity with your phase: HIIT in follicular, yoga & walks in luteal.", color: ROSE },
  ];

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: TEAL, textTransform: "uppercase", marginBottom: 6 }}>ML Risk Engine</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", fontFamily: "'Playfair Display', Georgia, serif" }}>Health Insights</div>
        <div style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>AI-analyzed risk indicators and personalized recommendations.</div>
      </div>

      {/* Risk Cards */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14 }}>Risk Assessment</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {risks.map(r => (
            <GlassCard
              key={r.id}
              onClick={() => setActiveRisk(activeRisk?.id === r.id ? null : r)}
              style={{ padding: "20px 24px", cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: r.level === "high" ? "#fee2e2" : r.level === "medium" ? "#fef3c7" : "#d1fae5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}>
                    {r.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{r.description}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <RiskIndicator level={r.level} />
                  <span style={{ color: "#9ca3af", fontSize: 12 }}>{activeRisk?.id === r.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {activeRisk?.id === r.id && (
                <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Detected Markers</div>
                  {r.markers.map(m => (
                    <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: m.present ? "#fee2e2" : "#d1fae5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700,
                        color: m.present ? "#dc2626" : "#059669"
                      }}>
                        {m.present ? "✗" : "✓"}
                      </div>
                      <span style={{ fontSize: 13, color: m.present ? "#374151" : "#9ca3af" }}>{m.name}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 14, padding: "14px 16px", background: TEAL_LIGHT, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>AI Recommendation</div>
                    <div style={{ fontSize: 13, color: TEAL_DARK, lineHeight: 1.6 }}>{r.recommendation}</div>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Personalized Tips */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14 }}>Personalized Wellness Tips</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {tips.map(t => (
            <GlassCard key={t.title} style={{ padding: "20px 20px" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, marginBottom: 12,
                background: t.color + "20",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: t.color
              }}>{t.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{t.body}</div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// AI ASSISTANT SECTION
// ============================================================
function AssistantSection() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm MenstruAI, your intelligent health companion. I can answer questions about cycle patterns, symptoms, hormonal health, PCOS, fertility, and wellness strategies. How can I help you today?",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [dots, setDots] = useState(".");
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (!thinking) return;
    const id = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 350);
    return () => clearInterval(id);
  }, [thinking]);

  const quickQuestions = [
    "Why is my cycle irregular?",
    "How to reduce cramps?",
    "What is my fertile window?",
    "Signs of hormonal imbalance?",
  ];

  const send = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setMessages(m => [...m, { role: "user", text: msg, time }]);
    setThinking(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const response = getAIResponse(msg);
    setThinking(false);
    setMessages(m => [...m, {
      role: "assistant", text: response,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    }]);
  }, [input]);

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: TEAL, textTransform: "uppercase", marginBottom: 6 }}>FAISS-Powered NLP</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", fontFamily: "'Playfair Display', Georgia, serif" }}>AI Health Assistant</div>
        <div style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>Ask anything about your menstrual health.</div>
      </div>

      {/* Quick questions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {quickQuestions.map(q => (
          <button key={q} onClick={() => send(q)} style={{
            background: TEAL_LIGHT, color: TEAL_DARK, border: "1px solid rgba(0,128,128,0.2)",
            padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer"
          }}>
            {q}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <GlassCard style={{ marginBottom: 0 }}>
        {/* Chat header */}
        <div style={{
          padding: "16px 24px", borderBottom: "1px solid rgba(0,128,128,0.08)",
          display: "flex", alignItems: "center", gap: 12,
          background: `linear-gradient(135deg, ${TEAL_LIGHT}, rgba(255,255,255,0.6))`,
          borderRadius: "20px 20px 0 0"
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#fff"
          }}>◎</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>MenstruAI Assistant</div>
            <div style={{ fontSize: 11, color: TEAL, display: "flex", alignItems: "center", gap: 5 }}>
              <PulsingDot color={TEAL} /> Online · Knowledge base active
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ height: 380, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "80%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                background: m.role === "user"
                  ? `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`
                  : "rgba(248,250,252,0.95)",
                border: m.role === "assistant" ? "1px solid rgba(0,128,128,0.1)" : "none",
                color: m.role === "user" ? "#fff" : "#374151",
                fontSize: 14, lineHeight: 1.6,
              }}>
                {m.text}
              </div>
              <span style={{ fontSize: 10, color: "#9ca3af", marginTop: 4, padding: "0 4px" }}>{m.time}</span>
            </div>
          ))}
          {thinking && (
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{
                padding: "12px 18px", borderRadius: "4px 18px 18px 18px",
                background: "rgba(248,250,252,0.95)", border: "1px solid rgba(0,128,128,0.1)"
              }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: "50%", background: TEAL,
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                    }} />
                  ))}
                  <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 6 }}>Thinking{dots}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "16px 20px", borderTop: "1px solid rgba(0,128,128,0.08)",
          display: "flex", gap: 10, alignItems: "center"
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !thinking && send()}
            placeholder="Ask about your cycle, symptoms, hormones..."
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 30,
              border: "1.5px solid rgba(0,128,128,0.18)", outline: "none",
              fontSize: 14, background: "#fafbfc",
              transition: "border-color 0.2s"
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || thinking}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: input.trim() && !thinking ? `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` : "#e5e7eb",
              border: "none", cursor: input.trim() && !thinking ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: input.trim() && !thinking ? "#fff" : "#9ca3af",
              transition: "all 0.2s"
            }}
          >
            ↑
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

// ============================================================
// LOG SECTION
// ============================================================
function LogSection() {
  const [entries, setEntries] = useState([
    { date: "Jun 28", flow: "medium", cramps: 6, mood: "anxious", notes: "Bloating, started ibuprofen" },
    { date: "Jun 27", flow: "heavy", cramps: 8, mood: "irritable", notes: "Heavy day, used heating pad" },
    { date: "Jun 26", flow: "medium", cramps: 4, mood: "neutral", notes: "Cycle day 1" },
  ]);
  const [form, setForm] = useState({ date: "", flow: "medium", cramps: 3, mood: "neutral", notes: "" });
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!form.date) return;
    setEntries(e => [form, ...e]);
    setForm({ date: "", flow: "medium", cramps: 3, mood: "neutral", notes: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const flowColors = { light: "#fce7f3", medium: "#fbcfe8", heavy: "#f9a8d4", spotting: "#fdf4ff" };
  const moodEmojis = { happy: "😊", neutral: "😐", anxious: "😰", irritable: "😤", tired: "😴", sad: "😔" };

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: TEAL, textTransform: "uppercase", marginBottom: 6 }}>Daily Tracking</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", fontFamily: "'Playfair Display', Georgia, serif" }}>Cycle Log</div>
        <div style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>Track daily symptoms to improve AI prediction accuracy.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Log Form */}
        <GlassCard style={{ padding: "24px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 20 }}>Add Entry</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(0,128,128,0.15)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 8 }}>Flow Intensity</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["spotting", "light", "medium", "heavy"].map(f => (
                <button key={f} onClick={() => setForm(fr => ({ ...fr, flow: f }))} style={{
                  flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                  border: `2px solid ${form.flow === f ? ROSE : "transparent"}`,
                  background: form.flow === f ? flowColors[f] : "#f8f9fb",
                  color: form.flow === f ? "#be185d" : "#9ca3af", cursor: "pointer"
                }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Cramp Intensity</label>
              <span style={{ fontSize: 12, fontWeight: 700, color: ROSE }}>{form.cramps}/10</span>
            </div>
            <input type="range" min={0} max={10} value={form.cramps}
              onChange={e => setForm(f => ({ ...f, cramps: +e.target.value }))}
              style={{ width: "100%", accentColor: ROSE }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 8 }}>Mood</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(moodEmojis).map(([m, e]) => (
                <button key={m} onClick={() => setForm(f => ({ ...f, mood: m }))} style={{
                  padding: "6px 12px", borderRadius: 20, fontSize: 12,
                  border: `2px solid ${form.mood === m ? LAVENDER : "transparent"}`,
                  background: form.mood === m ? "#ede9fe" : "#f8f9fb",
                  color: form.mood === m ? "#7c3aed" : "#6b7280", cursor: "pointer"
                }}>{e} {m}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any symptoms, medications, observations..."
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(0,128,128,0.15)",
                fontSize: 13, resize: "vertical", minHeight: 70, outline: "none", fontFamily: "inherit", boxSizing: "border-box"
              }} />
          </div>
          <button onClick={save} style={{
            width: "100%", padding: "13px 0",
            background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
            color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}>
            {saved ? "✓ Entry Saved!" : "+ Save Entry"}
          </button>
        </GlassCard>

        {/* Entries List */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>Recent Entries</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map((e, i) => (
              <GlassCard key={i} style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{e.date || new Date().toLocaleDateString()}</span>
                  <span style={{ fontSize: 20 }}>{moodEmojis[e.mood] || "😐"}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: flowColors[e.flow] || "#fce7f3", color: "#be185d", fontWeight: 600 }}>
                    {e.flow} flow
                  </span>
                  <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: "#fee2e2", color: "#dc2626", fontWeight: 600 }}>
                    cramps: {e.cramps}/10
                  </span>
                </div>
                {e.notes && <div style={{ fontSize: 12, color: "#6b7280" }}>{e.notes}</div>}
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function MenstruAI() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "◎" },
    { id: "predict", label: "Predict", icon: "◈" },
    { id: "insights", label: "Insights", icon: "◇" },
    { id: "assistant", label: "AI Chat", icon: "◐" },
    { id: "log", label: "Log", icon: "△" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Nunito', system-ui, sans-serif", background: "#f4f7f6", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        @keyframes ping { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.6);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        * { box-sizing: border-box; }
        input[type=range]::-webkit-slider-thumb { cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,128,128,0.2); border-radius: 3px; }
      `}</style>

      {/* Top Nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,128,128,0.1)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: "#fff"
              }}>◎</div>
              <div>
                <span style={{ fontSize: 16, fontWeight: 800, color: TEAL_DARK, fontFamily: "'Playfair Display', serif" }}>MenstruAI</span>
                <span style={{ fontSize: 10, color: "#9ca3af", display: "block", lineHeight: 1 }}>Intelligent Health System</span>
              </div>
            </div>

            {/* Desktop Tabs */}
            <div style={{ display: "flex", gap: 4 }}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                    border: "none", cursor: "pointer",
                    background: activeTab === t.id ? TEAL_LIGHT : "transparent",
                    color: activeTab === t.id ? TEAL_DARK : "#6b7280",
                    transition: "all 0.2s"
                  }}
                >
                  <span style={{ marginRight: 5 }}>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: `linear-gradient(135deg, #f9a8d4, #e879f9)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#fff"
              }}>P</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
        {activeTab === "dashboard" && <DashboardSection onNavigate={setActiveTab} />}
        {activeTab === "predict" && <PredictSection />}
        {activeTab === "insights" && <InsightsSection />}
        {activeTab === "assistant" && <AssistantSection />}
        {activeTab === "log" && <LogSection />}
      </div>

      {/* Bottom Mobile Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(0,128,128,0.1)",
        display: "flex", justifyContent: "space-around",
        padding: "8px 0 12px",
        zIndex: 100
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              padding: "4px 12px", borderRadius: 12,
              transition: "all 0.2s"
            }}
          >
            <span style={{ fontSize: 18, color: activeTab === t.id ? TEAL : "#9ca3af" }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: activeTab === t.id ? TEAL_DARK : "#9ca3af" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
