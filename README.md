# ZK Zero Knowledge Voting

Privacy-preserving voting prototype using zero-knowledge proofs and smart contracts. Voters prove eligibility and that they vote only once, without revealing identity or vote.

## Features
- Merkle tree–based voter eligibility
- Nullifier prevents double-voting
- Zero-knowledge proof verification on-chain
- Publicly verifiable tally (on- or off-chain aggregation)
- Frontend for proof generation + vote submission

## Tech Stack
- Circuits: Circom + snarkjs (Groth16)
- Smart Contracts: Solidity (Hardhat)
- Frontend: React / Next.js
- Hashing: Poseidon / Keccak
- Scripts: Node.js / TypeScript

## Repository (example)
```
circuits/      # vote.circom, merkle.circom, build artifacts
contracts/     # Voting.sol, Verifier.sol
scripts/       # compile, setup, deploy, proof generation
frontend/      # DApp UI
test/          # contract / circuit tests
config/        # network + election config
```

## Quick Start
```
git clone https://github.com/zokiDjordjijeski/ZK-Zero-Knowledge-Voting.git
cd ZK-Zero-Knowledge-Voting
yarn install
yarn circuits:compile
yarn circuits:setup      # trusted setup (Groth16)
npx hardhat node
yarn deploy:local
cd frontend
yarn install
yarn dev
```

## Typical Scripts
(Adapt if different)
```
yarn circuits:clean
yarn circuits:compile
yarn circuits:setup
yarn circuits:export:verifier
yarn deploy:local
yarn test
```

## Environment Variables
Root .env (example):
```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ALCHEMY_API_KEY=...
ELECTION_ID=example-2025
```
Frontend .env.local:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ELECTION_ID=example-2025
```

## How It Works (Simplified)
1. Admin publishes Merkle root of eligible voters.
2. Voter generates proof locally: inclusion + unused nullifier + valid candidate.
3. Contract verifies proof; stores nullifier; emits event.
4. Tally script or on-chain method counts commitments.

## Security Notes
- Prototype only; not audited.
- Trusted setup required (Groth16).
- No coercion resistance yet.
- Ensure consistent hashing between frontend, circuit, and contracts.

## Roadmap (Short)
- Universal setup (Plonk/Halo2)
- Batch proof verification
- Improved UX performance
- Audit & hardening

## Contributing
Fork → branch → PR. Use conventional commits (feat:, fix:, etc.).

## License
MIT.

## Disclaimer
Educational prototype. Not production-ready.
