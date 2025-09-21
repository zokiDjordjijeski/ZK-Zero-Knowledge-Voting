pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/MerkleTree.circom";

template Sum(N) {
    signal input in[N];
    signal output out;

    signal acc[N];
    acc[0] <== in[0];
    for (var i = 1; i < N; i++) {
        acc[i] <== acc[i-1] + in[i];
    }
    out <== acc[N-1];
}

template VoteWithMerkle(N, DEPTH) {
    signal input vote;
    signal input secret;
    signal input root;
    signal input pathElements[DEPTH];
    signal input pathIndices[DEPTH];

    signal output valid;
    signal output vote_out;
    signal output nullifier;
    signal output root_out;

    // 1. Проверка дали vote е валиден избор
    component eqs[N];
    signal sumArr[N];

    for (var i = 0; i < N; i++) {
        eqs[i] = IsEqual();
        eqs[i].in[0] <== vote;
        eqs[i].in[1] <== i;
        sumArr[i] <== eqs[i].out;
    }

    component s = Sum(N);
    for (var i = 0; i < N; i++) {
        s.in[i] <== sumArr[i];
    }
    s.out === 1;

// Проверка: secret != 0
    component isZero = IsZero();
    isZero.in <== secret;
    isZero.out === 0;

    // 2. Merkle proof: Дали hash(secret) е во дрвото?
    component hasher = Poseidon(1);
    hasher.inputs[0] <== secret;
    signal leaf <== hasher.out;

   component mp = MerkleProofChecker(DEPTH);
    mp.leaf <== leaf;
    for (var i = 0; i < DEPTH; i++) {
    mp.pathElements[i] <== pathElements[i];
    mp.pathIndices[i] <== pathIndices[i];
    }
    mp.root <== root;
    mp.valid === 1;

    // 3. Nullifier (anti double-vote)
    component nhash = Poseidon(1);
    nhash.inputs[0] <== secret;
    nullifier <== nhash.out;

    valid <== 1;
    vote_out <== vote;
    root_out <== root;
}

component main = VoteWithMerkle(4, 4); // 4 кандидати, дрво од 16 гласачи (DEPTH=4)
