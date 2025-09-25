let memorySize = 16;
let cacheSize = 4;
let setSize = 2;
let cache = [];
let hits = 0;
let misses = 0;
let accessHistory = [];
let leaderboard = [];

function initCache() {
  cache = Array(cacheSize).fill(null);
  accessHistory = Array(Math.ceil(cacheSize / setSize)).fill(null).map(() => []);
  const grid = document.getElementById("cacheSlots");
  grid.innerHTML = "";
  for (let i = 0; i < cacheSize; i++) {
    const slot = document.createElement("div");
    slot.className = "cache-line";
    slot.id = `cache-${i}`;
    slot.textContent = "Empty";
    grid.appendChild(slot);
  }
  document.getElementById("accessList").innerHTML = "";
}

function startGame() {
  cacheSize = parseInt(document.getElementById("cacheSize").value);
  setSize = cacheSize >= 4 ? 2 : 1;
  hits = 0;
  misses = 0;
  document.getElementById("hits").textContent = hits;
  document.getElementById("misses").textContent = misses;
  initCache();
}

function drawCard() {
  const cardIndex = Math.floor(Math.random() * memorySize);
  const address = `M${cardIndex}`;
  document.getElementById("currentCard").textContent = `Current Card: ${address}`;

  const cacheType = document.getElementById("cacheType").value;
  const policy = document.getElementById("policy").value;

  let hit = false;

  if (cacheType === "direct") {
    const index = cardIndex % cacheSize;
    if (cache[index] === address) {
      hit = true;
    } else {
      cache[index] = address;
      document.getElementById(`cache-${index}`).textContent = address;
    }
  }

  else if (cacheType === "set") {
    const numSets = Math.floor(cacheSize / setSize);
    const setIndex = cardIndex % numSets;
    const setStart = setIndex * setSize;
    const setEnd = setStart + setSize;
    const set = cache.slice(setStart, setEnd);
    const history = accessHistory[setIndex];

    const pos = set.indexOf(address);
    if (pos !== -1) {
      hit = true;
      if (policy === "lru") {
        history.splice(history.indexOf(address), 1);
        history.push(address);
      }
    } else {
      if (set.includes(null)) {
        const emptyIndex = set.indexOf(null);
        cache[setStart + emptyIndex] = address;
        document.getElementById(`cache-${setStart + emptyIndex}`).textContent = address;
        history.push(address);
      } else {
        const evicted = history[0];
        const evictPos = set.indexOf(evicted);
        cache[setStart + evictPos] = address;
        document.getElementById(`cache-${setStart + evictPos}`).textContent = address;
        history.shift();
        history.push(address);
      }
    }
  }

  else if (cacheType === "full") {
    const pos = cache.indexOf(address);
    const history = accessHistory[0];
    if (pos !== -1) {
      hit = true;
      if (policy === "lru") {
        history.splice(history.indexOf(address), 1);
        history.push(address);
      }
    } else {
      if (cache.includes(null)) {
        const emptyIndex = cache.indexOf(null);
        cache[emptyIndex] = address;
        document.getElementById(`cache-${emptyIndex}`).textContent = address;
        history.push(address);
      } else {
        const evicted = history[0];
        const evictPos = cache.indexOf(evicted);
        cache[evictPos] = address;
        document.getElementById(`cache-${evictPos}`).textContent = address;
        history.shift();
        history.push(address);
      }
    }
  }

  if (hit) hits++;
  else misses++;
  updateStats(address, hit);
}

function updateStats(address, hit) {
  document.getElementById("hits").textContent = hits;
  document.getElementById("misses").textContent = misses;

  const total = hits + misses;
  const ratio = total ? (hits / total).toFixed(2) : 0;

  const accessList = document.getElementById("accessList");
  const item = document.createElement("li");
  item.textContent = `${address} → ${hit ? "Hit ✅" : "Miss ❌"}`;
  accessList.appendChild(item);

  leaderboard.push({ name: `Player ${leaderboard.length + 1}`, ratio });
  leaderboard.sort((a, b) => b.ratio - a.ratio);
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";
  leaderboard.slice(0, 5).forEach(player => {
    const item = document.createElement("li");
    item.textContent = `${player.name}: Hit Ratio ${player.ratio}`;
    list.appendChild(item);
  });
}

