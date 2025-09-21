const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const { groth16 } = require("snarkjs");
const verificationKey = require("./verification_key.json");

const app = express();
app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync("votes.json")) fs.writeFileSync("votes.json", "[]");

if (!fs.existsSync("nullifiers.json")) fs.writeFileSync("nullifiers.json", "[]");

// Имиња на кандидатите (менувај по потреба)
const candidateNames = [
    "Ана Јовановска",
    "Бобан Ристевски",
    "Сања Трајковска",
    "Марио Стојанов"
];

function getOfficialRoot() {
    try {
        return fs.readFileSync("root.txt", "utf8").trim();
    } catch (e) {
        return null;
    }
}

app.post("/api/vote", async (req, res) => {
    // console.log("RECEIVED INPUT:", req.body); // <-- ОВА ДОДАЈ ГО
    const { proof, publicSignals } = req.body;

    if (!proof || !publicSignals) {
        return res.status(400).json({ status: "missing proof or publicSignals" });
    }

    try {
        // 1. Проверка на Merkle root
        const officialRoot = getOfficialRoot();
        if (!officialRoot) {
            return res.status(500).json({ status: "missing official root" });
        }

        // Провери го редоследот на publicSignals според circom!
        // Претпоставуваме: [valid, vote_out, nullifier, root_out]
        const voteIdx = parseInt(publicSignals[1], 10);
        const nullifier = publicSignals[2];
        const root = "0x" + BigInt(publicSignals[3]).toString(16).padStart(64, '0');
        console.log()
        if (root !== officialRoot) {
            return res.status(400).json({ status: "invalid root!" });
        }

        const isValid = await groth16.verify(verificationKey, publicSignals, proof);
        if (!isValid){
            return res.status(400).json({ status: "invalid proof" });
        }

        const nullifiers = JSON.parse(fs.readFileSync("nullifiers.json"));
        if(nullifiers.includes(nullifier)){
           return res.status(400).json({ status: "already voted" });
        }
    
            const votes = JSON.parse(fs.readFileSync("votes.json"));
            votes.push(voteIdx);
            fs.writeFileSync("votes.json", JSON.stringify(votes));

            nullifiers.push(nullifier);
            fs.writeFileSync("nullifiers.json", JSON.stringify(nullifiers));

            res.json({ status: "ok" });
                
        }
     catch (e) {
        res.status(500).json({ status: "error", error: e.toString() });
    }
});

const admin_code = "finki2025";

app.post("/api/results", (req, res) => {
    const { code } = req.body;
    if (code !== admin_code) {
        return res.status(401).json({ error: "Invalid password" });
    }
    try {
        const votes = JSON.parse(fs.readFileSync("votes.json"));
        const results = Array(candidateNames.length).fill(0);
        votes.forEach(v => {
            const idx = parseInt(v, 10);
            if (idx >= 0 && idx < candidateNames.length) results[idx]++;
        });
        const candidates = candidateNames.map((name, i) => ({
            name,
            votes: results[i]
        }));
        res.json({ candidates });
    } catch (e) {
        res.status(500).json({ status: "error", error: e.toString() });
    }
});


app.listen(5000, () => {
    console.log("Backend running on port 5000");
});
