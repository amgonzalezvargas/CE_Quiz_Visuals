// Generates Module_X_Story.md from Module_X_Explorer.html (data) and Module_X_Quiz_Page.html (title + narrative).
// No LLM is used: data constants are evaluated programmatically; text is extracted by regex.
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const dir = __dirname;
const decode = (s) => s
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&rsquo;/g, '’').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ').trim();
const fmt = (n) => n.toLocaleString('en-US');

for (let m = 1; m <= 4; m++) {
  const exp = fs.readFileSync(path.join(dir, `Module_${m}_Explorer.html`), 'utf8');
  const quiz = fs.readFileSync(path.join(dir, `Module_${m}_Quiz_Page.html`), 'utf8');

  const start = exp.indexOf('const TRAJECTORY_1');
  const endMatch = exp.match(/const TRAJECTORIES = \[[^\]]*\];/);
  const code = exp.slice(start, endMatch.index + endMatch[0].length) + '\nthis.T = TRAJECTORIES;';
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const trajs = ctx.T;

  const title = decode(quiz.match(/<p class="font-semibold text-sm sm:text-base text-slate-900">(Case study[^<]*)<\/p>/)[1]);
  const narrative = decode(quiz.match(/<article[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>/)[1]);

  let md = `# ${title}\n\n## Context Window Explorer — plain-text story\n\n### Scenario description\n${narrative}\n\n`;
  md += `Each trajectory below lists its timeline steps in the order they appear in the Context Window Explorer.\n`;
  md += `Token figures: "+N" is the delta added by that step; "Running total" is the value shown in the Context Window Usage meter after the step is revealed.\n\n---\n\n`;

  trajs.forEach((t) => {
    md += `## ${t.name}\n\n`;
    md += `- Context window limit: ${fmt(t.limit)} tokens\n`;
    md += `- Effective context length (ECL) marker: ${fmt(t.effectiveLength)} tokens (${Math.round(t.effectiveLength / t.limit * 100)}%)\n\n`;
    let total = 0, n = 0;
    t.blocks.forEach((b) => {
      if (b.divider) {
        md += `### ${b.danger ? '⚠ ' : ''}Section: ${b.text}\n\n`;
        return;
      }
      n++;
      total += b.tokens;
      const pct = (total / t.limit * 100).toFixed(1);
      md += `#### Step ${n}${b.phase ? ' — ' + b.phase : ''}\n`;
      md += `- **Tag:** ${b.badge}\n`;
      md += `- **Label:** ${b.label}\n`;
      md += `- **Tokens:** +${fmt(b.tokens)}\n`;
      md += `- **Running total:** ${fmt(total)} / ${fmt(t.limit)} (${pct}%)\n`;
      if (b.flagText) md += `- **Flag:** ${b.flagText}\n`;
      md += `- **Caption:** ${b.caption}\n\n`;
      md += `Content:\n\n\`\`\`text\n${b.content}\n\`\`\`\n\n`;
    });
    md += `**Final token count for this trajectory:** ${fmt(total)} / ${fmt(t.limit)} (${(total / t.limit * 100).toFixed(1)}%)\n\n---\n\n`;
  });

  fs.writeFileSync(path.join(dir, `Module_${m}_Story.md`), md, 'utf8');
  console.log(`Module_${m}_Story.md written (${md.length} chars, ${trajs.length} trajectories)`);
}
