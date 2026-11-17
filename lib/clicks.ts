import fs from "node:fs";
import path from "node:path";

/**
 * Click counters per product (used to rank "Most popular of last month").
 * Stored next to store.json in DATA_DIR (a Fly volume in production).
 * Writes are debounced; on read-only storage (Vercel) counting is simply skipped.
 */
const DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "clicks.json");

type Counts = Record<string, number>;
let counts: Counts | null = null;
let stamp = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

function mtime(): number {
  try {
    return fs.statSync(FILE).mtimeMs;
  } catch {
    return 0;
  }
}

function load(): Counts {
  const m = mtime();
  if (counts && (timer || m === stamp)) return counts; // pending writes win over disk
  try {
    counts = m ? (JSON.parse(fs.readFileSync(FILE, "utf8")) as Counts) : {};
  } catch {
    counts = {};
  }
  stamp = m;
  return counts;
}

function flush() {
  timer = null;
  if (!counts) return;
  try {
    fs.mkdirSync(DIR, { recursive: true });
    const tmp = FILE + "." + process.pid + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(counts));
    fs.renameSync(tmp, FILE);
    stamp = mtime();
  } catch {
    // read-only storage: ignore
  }
}

export function addClick(id: number, weight: number): void {
  const c = load();
  c[String(id)] = (c[String(id)] || 0) + weight;
  if (!timer) timer = setTimeout(flush, 4000);
}

export function getClickCounts(): Counts {
  return load();
}
