const circomlibjs = require('circomlibjs');

(async () => {
  const poseidon = await circomlibjs.buildPoseidon();
  const secret = 'c1f5d41d74b2b7f5df0128a9512870af840136f4b73bbf4f0f1d1b2a6da23635';
  const big = BigInt('0x' + secret);
  const leaf = poseidon([big]);
  const leafHex = '0x' + poseidon.F.toString(leaf, 16).padStart(64, '0');
  console.log('leaf:', leafHex);
})();
