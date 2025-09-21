const fs = require('fs');
const crypto = require('crypto');
const circomlibjs = require('circomlibjs');

// Колку гласачи сакаш (менувај тука)
const NUM_VOTERS = 10;

// Помошна функција: најблискиот поголем степен на 2
function nextPowerOf2(x) {
    return Math.pow(2, Math.ceil(Math.log2(x)));
}

(async () => {
    // 1. Генерирај тајни (32-бајтни hex стрингови)
    const TREE_LEAVES = nextPowerOf2(NUM_VOTERS);

    const secrets = [];
    for (let i = 0; i < NUM_VOTERS; i++) {
        const secret = crypto.randomBytes(32).toString('hex');
        secrets.push(secret);
    }
    // Padding со нули (секој padding е 32 бајти нула)
    for (let i = NUM_VOTERS; i < TREE_LEAVES; i++) {
        secrets.push('0'.repeat(64));
    }

    // 2. Hash(secret) со Poseidon
    const poseidon = await circomlibjs.buildPoseidon();

    // Сега секој leaf е BigInt (field element)
    const leaves = secrets.map(s => {
        const big = BigInt('0x' + s);
        const hash = poseidon([big]);
        return hash;
    });

    // Poseidon hash за пар од BigInt
    function poseidonHash(a, b) {
        return poseidon([a, b]);
    }

    // Градење Merkle дрво
    function buildMerkleTree(leaves) {
        let layers = [leaves];
        while (layers[layers.length - 1].length > 1) {
            const prevLayer = layers[layers.length - 1];
            const nextLayer = [];
            for (let i = 0; i < prevLayer.length; i += 2) {
                let left = prevLayer[i];
                let right = prevLayer[i + 1];
                if (right === undefined) right = left; // ако е непарен број, дуплирај го последниот
                nextLayer.push(poseidonHash(left, right));
            }
            layers.push(nextLayer);
        }
        return layers;
    }

    // 3. Генерирај default hashes за padding на секое ниво
    function getDefaultHashes(depth) {
        const defaults = [];
        defaults[0] = poseidon([BigInt(0)]);
        for (let i = 1; i < depth; i++) {
            defaults[i] = poseidonHash(defaults[i - 1], defaults[i - 1]);
        }
        return defaults;
    }

    // 4. Гради дрво и добиј root
    const treeLayers = buildMerkleTree(leaves);
    const TREE_DEPTH = treeLayers.length - 1;
    const root = treeLayers[treeLayers.length - 1][0];

    // 5. Генерирај default hashes
    const defaultHashes = getDefaultHashes(TREE_DEPTH);

    // Merkle proof за секој leaf
    function getMerkleProof(index, treeLayers, defaultHashes) {
        const proof = [];
        let idx = index;
        for (let l = 0; l < treeLayers.length - 1; l++) {
            const layer = treeLayers[l];
            const pairIdx = idx ^ 1;
            if (pairIdx < layer.length) {
                proof.push(layer[pairIdx]);
            } else {
                // Ако sibling нема, користи default hash за тоа ниво
                proof.push(defaultHashes[l]);
            }
            idx = Math.floor(idx / 2);
        }
        return proof;
    }

    // Помошна функција за pathIndices (лево/десно)
    function getPathIndices(index, depth) {
        const res = [];
        let idx = index;
        for (let i = 0; i < depth; i++) {
            res.push(idx % 2);
            idx = Math.floor(idx / 2);
        }
        return res;
    }

    // 6. Подготви output (сите вредности се hex strings!)
    const voters = secrets.map((secret, i) => ({
        secret,
        leaf: '0x' + poseidon.F.toString(leaves[i], 16).padStart(64, '0'),
        pathElements: getMerkleProof(i, treeLayers, defaultHashes).map(p => '0x' + poseidon.F.toString(p, 16).padStart(64, '0')),
        pathIndices: getPathIndices(i, TREE_DEPTH)
    }));

    // 7. Сними резултатите
    fs.writeFileSync('whitelist.json', JSON.stringify({
        root: '0x' + poseidon.F.toString(root, 16).padStart(64, '0'),
        voters
    }, null, 2));

    console.log('Merkle root:', '0x' + poseidon.F.toString(root, 16));
    console.log('Пример гласач:', voters[0]);
    console.log('Се е снимено во voters_poseidon.json');
})();
