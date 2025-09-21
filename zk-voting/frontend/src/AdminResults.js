import React, { useState } from "react";

function AdminResults() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  // handle password submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Неточен пасворд!");
        setLoading(false);
        return;
      }
      setCandidates(data.candidates || []);
      setUnlocked(true);
      setLoading(false);
    } catch (e) {
      setError("Грешка при вчитување на резултати");
      setLoading(false);
    }
  };

  // logout/lock
  const handleLock = () => {
    setUnlocked(false);
    setPassword("");
    setCandidates([]);
    setError("");
  };

  if (!unlocked) {
    // AdminCheck view
    return (
      <div style={{
        maxWidth: 400,
        margin: "60px auto",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
        padding: "32px 24px"
      }}>
        <h2 style={{ textAlign: "center", color: "#d20a0a" }}>Admin Check</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Внеси пасворд"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "1em",
              borderRadius: 6,
              border: "2px solid #d20a0a",
              marginBottom: 18
            }}
            disabled={loading}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#ffe600",
              color: "#d20a0a",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "1em",
              cursor: "pointer"
            }}
            disabled={loading}
          >
            {loading ? "Вчитувам..." : "Најави се"}
          </button>
          <div style={{ color: "red", marginTop: 10, minHeight: 24, textAlign: "center" }}>
            {error}
          </div>
        </form>
      </div>
    );
  }

  // Results view
  return (
    <div style={{
      maxWidth: 500,
      margin: "60px auto",
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
      padding: "32px 24px"
    }}>
      <h2 style={{ textAlign: "center", color: "#d20a0a", marginBottom: 24 }}>Резултати од гласање</h2>
      <button
        onClick={handleLock}
        style={{
          marginBottom: 16,
          background: "#ffe600",
          color: "#d20a0a",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "1em",
          cursor: "pointer",
          padding: "8px 18px"
        }}
      >
        Заклучи
      </button>
      {loading ? (
        <p>Вчитувам...</p>
      ) : candidates.length === 0 ? (
        <div style={{textAlign:'center', marginTop:40}}>Нема гласови.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "2px solid #d20a0a", padding: "8px" }}>Кандидат</th>
              <th style={{ borderBottom: "2px solid #d20a0a", padding: "8px" }}>Гласови</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((cand, idx) => (
              <tr key={idx}>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{cand.name}</td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee", textAlign: "center" }}>{cand.votes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminResults;
