#!/usr/bin/env node
// DEVOPS-006: fail if a file about to be uploaded contains the bypass secret (from env BYPASS,
// never argv), a protection-bypass header name, or the Vercel bypass cookie name. Counts only.
import { readFileSync } from 'node:fs';

const file = process.argv[2];
const s = readFileSync(file, 'utf8');
const hits = ['x-vercel-protection-bypass', 'x-vercel-set-bypass-cookie', '_vercel_jwt']
  .filter((n) => s.toLowerCase().includes(n)).length
  + (process.env.BYPASS && s.includes(process.env.BYPASS) ? 1 : 0);
if (hits) { console.log(`::error::leak check failed for upload file (${hits} hit(s))`); process.exit(1); }
console.log('leak check: ok');
