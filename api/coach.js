export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages, summary } = req.body || {};
  if (!summary) return res.status(400).json({ error: 'Missing summary' });

  const system = `You are ASVIRO TIMEFLOW's productivity coach.
Rules:
- Analyze ONLY the provided data. Never invent statistics.
- Clearly separate OBSERVATIONS (from data) from SUGGESTIONS.
- If data is missing, say so honestly.
- Be warm, specific, and practical. Max 200 words. Use short bullet points.`;

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(200).json({ text: fallback(summary), warn: 'No API key — using local analysis' });

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: 'DATA:\n' + JSON.stringify(summary, null, 2) },
          ...(messages || [{ role: 'user', content: "Give me today's productivity observations and 3 concrete suggestions." }]),
        ],
        temperature: 0.6, max_tokens: 500,
      }),
    });
    if (!r.ok) { console.error(await r.text()); return res.status(200).json({ text: fallback(summary), warn: 'AI provider error' }); }
    const j = await r.json();
    const text = j.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ text: text || fallback(summary) });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ text: fallback(summary), warn: 'Network error' });
  }
}

function fallback(s) {
  const out = [];
  out.push('OBSERVATIONS');
  out.push(`• Tasks: ${s.tasks.completed}/${s.tasks.total} complete (${s.tasks.completionPct}%), ${s.tasks.pending} pending.`);
  out.push(`• Overdue: ${s.tasks.overdue} task${s.tasks.overdue===1?'':'s'}.`);
  out.push(`• Focus: ${s.focus.totalSessions} sessions logged, ${s.focus.sessionsLast7} in the last week.`);
  const highestQ = s.tasks.byQuadrant.slice().sort((a,b)=>b.count-a.count)[0];
  if (highestQ && highestQ.count > 0) out.push(`• Heaviest matrix quadrant: Q${highestQ.q} (${highestQ.count} tasks).`);

  out.push('', 'SUGGESTIONS');
  if (s.tasks.overdue > 0) out.push('• Triage overdue items first — reschedule or drop them today.');
  if (s.focus.sessionsLast7 < 5) out.push('• Aim for one extra Pomodoro per day to build a focus rhythm.');
  if (s.tasks.pending > s.tasks.completed && s.tasks.total > 0) out.push('• You have more pending than complete — pick ONE quadrant-1 task and finish it before adding more.');
  if (s.tasks.total === 0) out.push('• No tasks recorded. Start by adding 3 concrete tasks for today.');
  if (out.filter(x=>x.startsWith('•')).length <= 3) out.push('• Keep your not-to-do rules visible while planning your next block.');
  return out.join('\n');
}
