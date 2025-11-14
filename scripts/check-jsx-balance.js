const fs = require('fs');
const path = require('path');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.jsx')) {
      checkFile(full);
    }
  }
}

function countOccurrences(str, sub) {
  let count = 0;
  let idx = 0;
  while ((idx = str.indexOf(sub, idx)) !== -1) {
    count++;
    idx += sub.length;
  }
  return count;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const openDiv = countOccurrences(content, '<div');
  const closeDiv = countOccurrences(content, '</div>');
  if (openDiv !== closeDiv) {
    console.log(`${filePath}: <div> ${openDiv} vs </div> ${closeDiv}`);
  }
  const openSpan = countOccurrences(content, '<span');
  const closeSpan = countOccurrences(content, '</span>');
  if (openSpan !== closeSpan) {
    console.log(`${filePath}: <span> ${openSpan} vs </span> ${closeSpan}`);
  }
}

console.log('Checking JSX tag balance in src/pages and src/components...');
walk(path.join(__dirname, '..', 'src'));
console.log('Done.');
