const fs = require('fs');
const content = fs.readFileSync('src/components/Periodontograma.tsx', 'utf-8');

const lines = content.split('\n');

const cleaned = lines.filter((line, i) => {
  if (line.includes('const [showInternalAnatomy, setShowInternalAnatomy]')) return false;
  if (line.includes('const [interactiveMode, setInteractiveMode]')) return false;
  return true;
});

// We need to also remove handleInteractiveBoneLossChange
// It spans multiple lines, so let's find it.
let result = cleaned.join('\n');
const boneLossMatch = result.match(/const handleInteractiveBoneLossChange =[\s\S]*?};\n/);
if (boneLossMatch) {
  result = result.replace(boneLossMatch[0], '');
}

// We should also look for Activity import since we used it before in the simulation panel, but we might still use it or not. Let's see if it causes lint errors if unused.

fs.writeFileSync('src/components/Periodontograma.tsx', result);
console.log('Cleaned up');
