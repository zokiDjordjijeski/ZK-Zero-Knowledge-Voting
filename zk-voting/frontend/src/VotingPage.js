import React, { useState } from "react";
import whitelist from "./whitelist.json";
import { generateProof } from "./utils/proofGenerator";
import { useNavigate } from "react-router-dom";


//const candidates change if needed candidateNames
const candidates = [
  { id: 0, name: "Ана Јовановска" },
  { id: 1, name: "Бобан Ристевски" },
  { id: 2, name: "Сања Трајковска" },
  { id: 3, name: "Марио Стојанов" }
];


function App() {
  const navigate = useNavigate();

  const [vote, setVote] = useState("");
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const merkleRoot = whitelist.root;

  function findVoter(secret) {
    return whitelist.voters.find(
      (v) => String(v.secret) === String(secret)
    );
  }

  const handleVote = async () => {
    setStatus(""); 
    setLoading(true);

    if (!secret || vote ==="") {
      setStatus("Внеси избор и тајна!");
      setLoading(false);
      return;
    }

    if (
    secret === "0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    setStatus("Овој secret не е валиден гласач!");
    setLoading(false);
    return;
  }
    const voter = findVoter(secret);
  
  if (!voter) {
      setStatus("Твојот secret не е во whitelist!");
      setLoading(false);
      return;
    }

    const input = {
  vote: Number(vote), // ако е мал број, ова е во ред
  secret: '0x' + secret, // hex string со 0x префикс
  root: merkleRoot,
  pathElements: voter.pathElements,
  pathIndices: voter.pathIndices
};




    try {
      const { proof, publicSignals } = await generateProof(input);

      const res = await fetch("http://localhost:5000/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof, publicSignals })
      });
          const data = await res.json();

      
      if (data.status === "ok") {
        setStatus("Гласот е успешно запишан!");
        setVote("");
        setSecret("");
      } else if (data.status === "already voted") {
        setStatus("Веќе имаш гласано!");
      } else {
        setStatus("Грешка: " + (data.status || "Пробај повторно"));
      }
    } catch (e) {
      setStatus("Грешка: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      margin: 0,
      padding: 0,
      fontFamily: "'Segoe UI', 'Arial', sans-serif",
      background: "linear-gradient(135deg, #ffe600 0%, #d20a0a 100%)"
    }}>
      <div className="header" style={{
        background: "#d20a0a",
        color: "#fff",
        padding: "24px 0 16px 0",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
      }}>
        <img src="/logo192.png" alt="FINKI Logo" style={{ height: 56, marginBottom: 8 }} />
        <h1 style={{ margin: 0 }}>Електронско Гласање</h1>
        <div style={{ fontSize: "1.1em" }}>Информациска Безбедност</div>
      </div>
      <div className="main-container" style={{
        maxWidth: 480,
        margin: "40px auto 0 auto",
        background: "rgba(255,255,255,0.93)",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
        padding: "32px 24px 24px 24px"
      }}>
        <div className="vote-title" style={{
          color: "#d20a0a",
          fontWeight: "bold",
          fontSize: "1.3em",
          marginBottom: 26,
          textAlign: "center"
        }}>
          Гласајте за вашиот кандидат<br />
          <span style={{ fontSize: "0.98em", color: "#444" }}>
            (Пример - избори за студентски парламент)
          </span>
        </div>
        <ul className="candidate-list" style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 24px 0"
        }}>
          {candidates.map(c => (
            <li
              key={c.id}
              style={{
                background: "#ffe600",
                marginBottom: 12,
                borderRadius: 6,
                padding: "14px 16px",
                fontSize: "1.1em",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                border: "2px solid #d20a0a",
                transition: "background 0.2s, border 0.2s"
              }}
              onClick={() => setVote(String(c.id))}
            >
              <input
                type="radio"
                name="candidate"
                checked={vote === String(c.id)}
                onChange={() => setVote(String(c.id))}
                style={{ marginRight: 10 }}
              />
              {c.name}
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Твоја тајна"
          value={secret}
          onChange={e => setSecret(e.target.value)}
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
          className="vote-btn"
          onClick={handleVote}
          disabled={loading}
          style={{
            display: "block",
            width: "100%",
            background: "#d20a0a",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: 14,
            fontSize: "1.1em",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: 0,
            transition: "background 0.2s"
          }}
        >
          ГЛАСАЈ
        </button>
        <div style={{
          minHeight: 28,
          margin: "10px 0",
          color: status.includes("успешен") ? "green" : "red",
          textAlign: "center"
        }}>
          {status}
        </div>
        <button
    onClick={() => navigate("/admin/results")}
    disabled={loading}
    style={{
     width: "100%",
    padding: "10px",
    marginTop: "10px",
    marginBottom: "5px",
    background: "#ffe600",
    color: "#d20a0a",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "1em",
    cursor: "pointer"
  }}
>
  Прикажи резултати
</button>

        
      </div>
      <div className="footer" style={{
        textAlign: "center",
        color: "#fff",
        marginTop: 38,
        fontSize: "1em",
        opacity: 0.86
      }}>
        Проект за предметот <b>Информациска Безбедност</b> — ФИНКИ, УКИМ &copy; 2025
      </div>
    </div>
  );
}

export default App;
