import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://localhost:8000"

export default function Dashboard() {
    const [summaries, setSummaries] = useState([])
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API}/dashboard`).then(res => {
            setSummaries(res.data)
            setLoading(false)
        })
    }, [])

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f0fdf4" }}>
            <div style={{ backgroundColor: "#059669", color: "white", padding: "1rem 2rem" }}>
                <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>Homeo AI — Doctor Dashboard</h1>
                <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.85 }}>All completed patient cases</p>
            </div>

            <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>

                {/* Patient list */}
                <div style={{ width: "320px", borderRight: "1px solid #d1fae5", overflowY: "auto", backgroundColor: "white" }}>
                    {loading && <p style={{ padding: "1rem", color: "#6b7280" }}>Loading cases...</p>}
                    {!loading && summaries.length === 0 && <p style={{ padding: "1rem", color: "#6b7280" }}>No completed cases yet.</p>}
                    {summaries.map((s, i) => (
                        <div key={i}
                            onClick={() => setSelected(s)}
                            style={{
                                padding: "1rem 1.25rem", borderBottom: "1px solid #f0fdf4", cursor: "pointer",
                                backgroundColor: selected === s ? "#ecfdf5" : "white",
                                borderLeft: selected === s ? "3px solid #059669" : "3px solid transparent"
                            }}>
                            <div style={{ fontWeight: 600, color: "#065f46", fontSize: "0.95rem" }}>
                                {s.patients?.name || s.patient_id}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.2rem" }}>
                                {s.patients?.age}y · {s.patients?.gender}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.2rem" }}>
                                {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Case summary view */}
                <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
                    {!selected && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
                            Select a patient to view their case summary
                        </div>
                    )}
                    {selected && (
                        <div style={{ maxWidth: "700px" }}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <h2 style={{ color: "#065f46", margin: 0, fontSize: "1.3rem" }}>{selected.patients?.name}</h2>
                                <p style={{ color: "#6b7280", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
                                    {selected.patients?.age} years · {selected.patients?.gender} · ID: {selected.patient_id}
                                </p>
                            </div>

                            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                                <h3 style={{ color: "#065f46", marginTop: 0, marginBottom: "1rem", fontSize: "1rem", borderBottom: "1px solid #d1fae5", paddingBottom: "0.5rem" }}>
                                    Case Summary
                                </h3>
                                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.9rem", lineHeight: 1.8, color: "#1f2937", margin: 0 }}>
                                    {selected.summary}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}