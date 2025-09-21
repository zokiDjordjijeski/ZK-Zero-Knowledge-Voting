// src/utils/zkVote.js
import { groth16 } from "snarkjs";

// input: { vote, secret, root, pathElements, pathIndices }
export async function generateProof(input) {
  // патеките до wasm и zkey можеш да ги направиш параметар ако сакаш
  const wasmPath = "/vote.wasm";
  const zkeyPath = "/vote_0000.zkey";

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    wasmPath,
    zkeyPath
  );

  return { proof, publicSignals };
}