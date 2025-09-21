import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminCheck() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Демонстративен пасворд
  const ADMIN_PASSWORD = "finki2025";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError("");
      navigate("/admin/results");
    } else {
      setError("Неточен пасворд!");
    }
  };

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
        >
          Најави се
        </button>
        <div style={{ color: "red", marginTop: 10, minHeight: 24, textAlign: "center" }}>
          {error}
        </div>
      </form>
    </div>
  );
}

export default AdminCheck;
