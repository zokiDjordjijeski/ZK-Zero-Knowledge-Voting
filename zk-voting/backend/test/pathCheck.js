const circomlibjs = require("circomlibjs");
const { MerkleTree } = require("fixed-merkle-tree");

async function main() {
    const poseidon = await circomlibjs.buildPoseidon();
    // Фикс: прифати и BigInt и array!
    const poseidonHash = (inputs) => {
        if (!Array.isArray(inputs)) inputs = [inputs];
        return poseidon.F.toObject(poseidon(inputs.map(BigInt)));
    };

    const inputs = [
        123n, 456n, 789n, 321n, 654n, 987n
    ];
    let leaves = inputs.map(val => poseidonHash([val]));
    while (leaves.length < 16) leaves.push(0n);

    const tree = new MerkleTree(4, leaves, { hashFunction: poseidonHash });
    const myIndex = 1;
    const proof = tree.path(myIndex);

    console.log("==== MERKLE TREE TEST ====");
    console.log("Leaf value:", inputs[myIndex].toString());
    console.log("Leaf hash:", leaves[myIndex].toString());
    console.log("Path Elements:", proof.pathElements.map(x => x.toString()));
    console.log("Path Indices:", proof.pathIndices);
    console.log("Merkle Root:", tree.root().toString());
}

main();
