import fs from 'node:fs';
import { config } from '../config.js';

/**
 * Bazë të dhënash e thjeshtë me skedar JSON.
 * Për prodhim mund të zëvendësohet me MongoDB/PostgreSQL pa ndryshuar rrugët (routes).
 */
let cache = null;

function load() {
  if (cache) return cache;
  if (!fs.existsSync(config.paths.db)) {
    fs.copyFileSync(config.paths.seed, config.paths.db);
  }
  cache = JSON.parse(fs.readFileSync(config.paths.db, 'utf-8'));
  return cache;
}

function save() {
  const tmp = `${config.paths.db}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2));
  fs.renameSync(tmp, config.paths.db);
}

export const db = {
  get data() {
    return load();
  },
  /** Ekzekuton një ndryshim dhe e ruan në disk. */
  update(mutator) {
    const data = load();
    const result = mutator(data);
    save();
    return result;
  },
};
