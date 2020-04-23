#!/usr/bin/env node

/* eslint-disable */

const fs = require('fs');
const lockfile = require('@yarnpkg/lockfile');

const [, , lockfilePath, ...packages] = process.argv;

if (!lockfile || !packages || packages.length === 0) {
  console.log('USAGE: orml-check-deps path/to/yarn.lock package-prefix-to-check');
  process.exit(1);
}

const file = fs.readFileSync(lockfilePath, 'utf8');

const json = lockfile.parse(file).object;

const deps = Object.keys(json).filter((x) => packages.some((p) => x.startsWith(p)));

const resolved = Object.create(null);

for (const dep of deps) {
  const key = /^(.*)@.*?$/.exec(dep)[1];
  const set = resolved[key] || new Set();
  set.add(json[dep].version);
  resolved[key] = set;
}

const result = Object.entries(resolved).filter(([, v]) => v.size > 1);
if (result.length > 0) {
  console.warn(
    'Multiple instances of dependencies detected, ensure that there is only one version of each package in your dependency tree.'
  );
  console.log();
  for (const [name, versions] of result) {
    console.log(`${name}:`);
    for (const ver of versions) {
      console.log(`\t${ver}`);
    }
    console.log();
  }
  process.exit(1);
}
