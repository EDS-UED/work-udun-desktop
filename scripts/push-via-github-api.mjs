#!/usr/bin/env node
/**
 * Push local HEAD to GitHub when `git push` to github.com:443 fails.
 * Uses api.github.com (Git Data API) with `gh auth token`.
 */
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(import.meta.dirname, '..');
const REPO = 'theyangsong/udun-website-new';
const BASE_SHA = process.env.GITHUB_BASE_SHA || 'd8d210ddd14ec7a814660dc2ee2b5a4fa9245482';
const COMMIT_MESSAGE =
  process.env.GITHUB_COMMIT_MESSAGE ||
  execSync('git log -1 --format=%B', { cwd: repoRoot, encoding: 'utf8' }).trim();

function ghApi(method, route, body) {
  const args = ['api', '-X', method, '-H', 'Accept: application/vnd.github+json', route];
  if (body !== undefined) {
    args.push('--input', '-');
  }
  try {
    return execFileSync('gh', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      input: body !== undefined ? JSON.stringify(body) : undefined,
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    const stderr = error.stderr?.toString?.() || '';
    const stdout = error.stdout?.toString?.() || '';
    throw new Error(`${route} failed: ${stderr || stdout || error.message}`);
  }
}

function parseDiff() {
  const out = execSync(`git diff --name-status ${BASE_SHA} HEAD`, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const entries = [];
  for (const line of out.split('\n').filter(Boolean)) {
    const tab = line.indexOf('\t');
    if (tab === -1) continue;
    const status = line.slice(0, tab);
    const path = line.slice(tab + 1);
    if (status.startsWith('R')) {
      const parts = path.split('\t');
      entries.push({ kind: 'delete', path: parts[0] });
      entries.push({ kind: 'upsert', path: parts[1] || parts[0] });
      continue;
    }
    if (status === 'D') entries.push({ kind: 'delete', path });
    else entries.push({ kind: 'upsert', path });
  }
  return entries;
}

function isBinary(filePath) {
  const buf = readFileSync(filePath);
  return buf.includes(0);
}

function createBlob(filePath) {
  const abs = join(repoRoot, filePath);
  const buf = readFileSync(abs);
  if (isBinary(abs)) {
    const res = JSON.parse(
      ghApi('POST', `repos/${REPO}/git/blobs`, {
        content: buf.toString('base64'),
        encoding: 'base64',
      }),
    );
    return res.sha;
  }
  const res = JSON.parse(
    ghApi('POST', `repos/${REPO}/git/blobs`, {
      content: buf.toString('utf8'),
      encoding: 'utf8',
    }),
  );
  return res.sha;
}

function fileMode(filePath) {
  const abs = join(repoRoot, filePath);
  const mode = statSync(abs).mode & 0o777;
  return mode & 0o111 ? '100755' : '100644';
}

function main() {
  const baseCommit = JSON.parse(ghApi('GET', `repos/${REPO}/git/commits/${BASE_SHA}`));
  const baseTreeSha = baseCommit.tree.sha;
  const diff = parseDiff();
  const tree = [];

  for (const entry of diff) {
    if (entry.kind === 'delete') {
      tree.push({ path: entry.path, mode: '100644', type: 'blob', sha: null });
      process.stderr.write(`delete ${entry.path}\n`);
      continue;
    }
    const sha = createBlob(entry.path);
    tree.push({
      path: entry.path,
      mode: fileMode(entry.path),
      type: 'blob',
      sha,
    });
    process.stderr.write(`blob ${entry.path}\n`);
  }

  const newTree = JSON.parse(
    ghApi('POST', `repos/${REPO}/git/trees`, {
      base_tree: baseTreeSha,
      tree,
    }),
  );

  const newCommit = JSON.parse(
    ghApi('POST', `repos/${REPO}/git/commits`, {
      message: COMMIT_MESSAGE,
      tree: newTree.sha,
      parents: [BASE_SHA],
    }),
  );

  ghApi('PATCH', `repos/${REPO}/git/refs/heads/main`, {
    sha: newCommit.sha,
    force: false,
  });

  console.log(`Updated main → ${newCommit.sha}`);
}

main();
