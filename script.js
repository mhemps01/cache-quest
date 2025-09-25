const memorySize = 16;
const cacheSize = 4;
const setSize = 2; // for set-associative
let memory = [];
let cache = [];
let hits = 0;
let misses = 0;
let accessHistory = [];

function initMemory() {
  const grid = document.getElementById("memoryGrid");
  for (let i = 0; i < memorySize; i++) {
    memory.push(`M${i}`);
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = `M${i}`;
    grid.appendChild(cell);
  }
}

function initCache() {
  cache = [];
  const grid = document.getElementById("cacheSlots");
  grid.innerHTML = "";
  for (let i = 0; i < cacheSize; i++) {
    cache.push(null);
    const slot = document.createElement("div");
    slot.className = "cache-line";
    slot.id = `cache-${i}`;
    slot.textContent = "Empty";
    grid.appendChild(slot);
  }
  accessHistory = Array(cacheSize).fill(null).map(() => []);
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
    const numSets = cacheSize / setSize;
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
      misses++;
      if (set.includes(null)) {
        const emptyIndex = set.indexOf(null);
        cache[setStart + emptyIndex] = address;
        document.getElementById(`cache-${setStart + emptyIndex}`).textContent = address;
        history.push(address);
      } else {
        let evictIndex = 0;
        if (policy === "fifo") {
          evictIndex = 0;
        } else if (policy === "lru") {
          evictIndex = 0;
        }
        const evicted = history[evictIndex];
        const evictPos = set.indexOf(evicted);
        cache[setStart + evictPos] = address;
        document.getElementById(`cache-${setStart + evictPos}`).textContent = address;
        history.splice(evictIndex, 1);
        history.push(address);
      }
      return updateStats(hit);
    }
  }

  else if (cacheType === "full") {
    const pos = cache.indexOf(address);
    if (pos !== -1) {
      hit = true;
      if (policy === "lru") {
        accessHistory[0].splice(accessHistory[0].indexOf(address), 1);
        accessHistory[0].push(address);
      }
    } else {
      misses++;
      if (cache.includes(null)) {
        const emptyIndex = cache.indexOf(null);
        cache[emptyIndex] = address;
        document.getElementById(`cache-${emptyIndex}`).textContent = address;
        accessHistory[0].push(address);
      } else {
        let evictIndex = 0;
        if (policy === "fifo") {
          evictIndex = 0;
        } else if (policy === "lru") {
          evictIndex = 0;
        }
        const evicted = accessHistory[0][evictIndex];
        const evictPos = cache.indexOf(evicted);
        cache[evictPos] = address;
        document.getElementById(`cache-${evictPos}`).textContent = address;
        accessHistory[0].splice(evictIndex, 1);
        accessHistory[0].push(address);
      }
      return updateStats(hit);
    }
  }

  if (hit) hits++;
  else misses++;
  updateStats(hit);
}

function updateStats(hit) {
  document.getElementById("hits").textContent = hits;
  document.getElementById("misses").textContent = misses;
}

initMemory();
initCache();

document.getElementById("cacheType").addEventListener("change", initCache);
document.getElementById("policy").addEventListener("change", initCache);
