import { useState } from "react"
import axios from "axios"
import Dashboard from "./Dashboard"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

function Register({ onRegistered }) {
  const [form, setForm] = useState({ name: "", age: "", gender: "Male" })
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!form.name || !form.age) return
    setLoading(true)
    const res = await axios.post(`${API}/register`, {
      name: form.name, age: parseInt(form.age), gender: form.gender
    })
    onRegistered(res.data.session_id, form.name)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0fdf4" }}>
      <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#065f46", marginBottom: "0.25rem" }}>Homeo AI</h1>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.5rem" }}>AI-assisted case taking for homeopathic consultation</p>

        <label style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}>Full Name</label>
        <input
          style={{ width: "100%", border: "1px solid #d1fae5", borderRadius: "8px", padding: "0.65rem", marginTop: "0.25rem", marginBottom: "1rem", fontSize: "0.95rem", boxSizing: "border-box" }}
          placeholder="Enter your name"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <label style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}>Age</label>
        <input
          type="number"
          style={{ width: "100%", border: "1px solid #d1fae5", borderRadius: "8px", padding: "0.65rem", marginTop: "0.25rem", marginBottom: "1rem", fontSize: "0.95rem", boxSizing: "border-box" }}
          placeholder="Your age"
          onChange={e => setForm({ ...form, age: e.target.value })}
        />

        <label style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}>Gender</label>
        <select
          style={{ width: "100%", border: "1px solid #d1fae5", borderRadius: "8px", padding: "0.65rem", marginTop: "0.25rem", marginBottom: "1.5rem", fontSize: "0.95rem", boxSizing: "border-box" }}
          onChange={e => setForm({ ...form, gender: e.target.value })}>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{ width: "100%", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "8px", padding: "0.75rem", fontSize: "1rem", fontWeight: 500, cursor: "pointer" }}>
          {loading ? "Starting..." : "Begin Consultation"}
        </button>
      </div>
    </div>
  )
}

function Chat({ sessionId, patientName }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hello ${patientName}! I'm here to help your doctor understand your health better. Please tell me — what is the main health concern that brings you here today?` }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = { role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    const res = await axios.post(`${API}/chat`, { session_id: sessionId, content: input })
    setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }])
    setLoading(false)
    if (res.data.is_complete) setComplete(true)
  }

  if (complete) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0fdf4" }}>
      <div style={{ textAlign: "center", padding: "2rem", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: "400px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
        <h2 style={{ color: "#065f46", fontWeight: 600 }}>Case Taking Complete</h2>
        <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>Your information has been saved. The doctor will review your case shortly.</p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ backgroundColor: "#059669", color: "white", padding: "1rem 1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>Homeo AI — Case Taking</h1>
        <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.85 }}>Answer honestly — this helps your doctor</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", backgroundColor: "#f9fafb", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "75%", padding: "0.65rem 1rem", borderRadius: "16px", fontSize: "0.95rem", lineHeight: 1.5,
              backgroundColor: m.role === "user" ? "#059669" : "white",
              color: m.role === "user" ? "white" : "#1f2937",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)"
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ backgroundColor: "white", padding: "0.65rem 1rem", borderRadius: "16px", color: "#9ca3af", fontSize: "0.9rem", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              Typing...
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", padding: "1rem", backgroundColor: "white", borderTop: "1px solid #e5e7eb" }}>
        <input
          style={{ flex: 1, border: "1px solid #d1fae5", borderRadius: "8px", padding: "0.65rem 1rem", fontSize: "0.95rem", outline: "none" }}
          placeholder="Type your answer..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          style={{ backgroundColor: "#059669", color: "white", border: "none", borderRadius: "8px", padding: "0.65rem 1.25rem", cursor: "pointer", fontWeight: 500 }}>
          Send
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [sessionId, setSessionId] = useState(null)
  const [patientName, setPatientName] = useState("")

  if (window.location.pathname === "/dashboard") return <Dashboard />
  if (!sessionId) return <Register onRegistered={(sid, name) => { setSessionId(sid); setPatientName(name) }} />
  return <Chat sessionId={sessionId} patientName={patientName} />
}