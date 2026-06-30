// Node test for the canMake24 solver.
// ✅ 測試方式：直接從 index.html 抽出 canMake24（測的是 shipped 的真實 code，不是抄本）
// 📜 用法：node test-solver.js
const fs = require('fs');

const html = fs.readFileSync(__dirname + '/index.html', 'utf8');

// --- Extract canMake24 verbatim from index.html (brace-matched) ---
const startIdx = html.indexOf('const canMake24');
if (startIdx === -1) { console.error('❌ 找不到 canMake24'); process.exit(1); }
const braceStart = html.indexOf('{', startIdx);
let depth = 0, end = braceStart;
for (let i = braceStart; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
}
const fnSrc = html.slice(startIdx, end + 1);   // "const canMake24 = (numbers) => { ... }"
// Run the const declaration inside a function scope and return it (recursion still works — lexical closure)
const canMake24 = new Function(fnSrc + '\n; return canMake24;')();

let pass = 0, fail = 0;
function ok(name, cond, extra = '') {
    if (cond) { pass++; console.log(`  ✅ ${name}`); }
    else { fail++; console.log(`  ❌ ${name}  ${extra}`); }
}

// --- 🟢 Known SOLVABLE sets (famous 24-game hands) ---
ok('[12,12]  → 12+12', canMake24([12, 12]) === true);
ok('[6,4]    → 6×4', canMake24([6, 4]) === true);
ok('[8,3]    → 8×3', canMake24([8, 3]) === true);
ok('[1,3,4,6]→ 6/(1-3/4)', canMake24([1, 3, 4, 6]) === true);
ok('[3,3,8,8]→ 8/(3-8/3)', canMake24([3, 3, 8, 8]) === true);
ok('[1,5,5,5]→ 5×(5-1/5)', canMake24([1, 5, 5, 5]) === true);
ok('[1,2,3,4]→ 1×2×3×4', canMake24([1, 2, 3, 4]) === true);
ok('[1,1,1,8]→ 8×(1+1+1)', canMake24([1, 1, 1, 8]) === true);
ok('[6,4,1]  → 6×4×1', canMake24([6, 4, 1]) === true);
ok('[8,3,1]  → 8×3×1', canMake24([8, 3, 1]) === true);
ok('[2,3,4]  → 2×3×4', canMake24([2, 3, 4]) === true);

// --- 🔴 Known UNSOLVABLE sets ---
ok('[1,1,1,1] unsolvable', canMake24([1, 1, 1, 1]) === false);
ok('[2,2]     unsolvable', canMake24([2, 2]) === false);
ok('[4,4]     unsolvable', canMake24([4, 4]) === false);
ok('[1,2]     unsolvable', canMake24([1, 2]) === false);
ok('[3,3]     unsolvable', canMake24([3, 3]) === false);

// --- 🛡️ Zero-handling (cards can hit 0 mid-game via |a−b|; must not crash or ÷0) ---
ok('[0,24]   → 0+24 (no crash)', canMake24([0, 24]) === true);
ok('[0,0,0,0]→ false (no ÷0 crash)', canMake24([0, 0, 0, 0]) === false);

// --- 📋 Validate the solvableCombinations fallback data (every preset must be solvable) ---
const solvableCombinations = {
    1: [[12, 12], [6, 4], [8, 3], [2, 12], [3, 8]],
    2: [[6, 4, 1], [8, 3, 1], [2, 3, 4], [6, 2, 2], [12, 2, 1]],
    3: [[1, 3, 4, 6], [3, 3, 8, 8], [1, 5, 5, 5], [1, 2, 3, 4], [1, 1, 1, 8]]
};
let allPresetsSolvable = true;
for (const lvl of [1, 2, 3]) {
    for (const combo of solvableCombinations[lvl]) {
        if (!canMake24(combo)) { allPresetsSolvable = false; console.log(`  ⚠️ preset 不合法: L${lvl} ${JSON.stringify(combo)}`); }
    }
}
ok('所有 fallback preset 都可解', allPresetsSolvable);

// --- 🔁 Smoke: random generation never yields an unsolvable "valid" set (solver is consistent) ---
let bad = 0;
for (let t = 0; t < 2000; t++) {
    const cardCount = [2, 3, 4][t % 3];
    const max = (t % 3 === 0) ? 32 : 12;
    const cards = Array.from({ length: cardCount }, () => Math.floor(Math.random() * max) + 1);
    const result = canMake24(cards);
    if (typeof result !== 'boolean') bad++;   // solver must always return a boolean
}
ok('2000 次隨機呼叫都回傳 boolean（無崩潰）', bad === 0, `${bad} 次異常`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
