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

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(200).json({
      text: fallback(summary),
      warn: 'No API key — using local analysis'
    });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  // Default prompt if client sends none
  const clientMsgs = Array.isArray(messages) && messages.length
    ? messages
    : [{ role: 'user', content: "Give me today's productivity observations and 3 concrete suggestions." }];

  // Gemini contents array: first exchange carries the DATA payload
  const contents = [
    {
      role: 'user',
      parts: [{ text: 'DATA:\n' + JSON.stringify(summary, null, 2) }],
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I have your productivity data. What would you like me to analyze?' }],
    },
    ...clientMsgs.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ];

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 600,
          topP: 0.95,
        },
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error('Gemini error:', errText);
      return res.status(200).json({
        text: fallback(summary),
        warn: 'AI provider error',
      });
    }

    const j = await r.json();
    const text = j?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!text) {
      return res.status(200).json({
        text: fallback(summary),
        warn: 'Empty response — using local analysis',
      });
    }

    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(200).json({
      text: fallback(summary),
      warn: 'Network error',
    });
  }
}

function fallback(s) {
  const out = [];
  out.push('OBSERVATIONS');
  out.push(
    `• Tasks: ${s.tasks.completed}/${s.tasks.total} complete (${s.tasks.completionPct}%), ${s.tasks.pending} pending.`
  );
  out.push(`• Overdue: ${s.tasks.overdue} task${s.tasks.overdue === 1 ? '' : 's'}.`);
  out.push(
    `• Focus: ${s.focus.totalSessions} sessions logged, ${s.focus.sessionsLast7} in the last week.`
  );

  const highestQ = s.tasks.byQuadrant.slice().sort((a, b) => b.count - a.count)[0];
  if (highestQ && highestQ.count > 0) {
    out.push(`• Heaviest matrix quadrant: Q${highestQ.q} (${highestQ.count} tasks).`);
  }

  out.push('', 'SUGGESTIONS');
  if (s.tasks.overdue > 0) {
    out.push('• Triage overdue items first — reschedule or drop them today.');
  }
  if (s.focus.sessionsLast7 < 5) {
    out.push('• Aim for one extra Pomodoro per day to build a focus rhythm.');
  }
  if (s.tasks.pending > s.tasks.completed && s.tasks.total > 0) {
    out.push('• You have more pending than complete — pick ONE quadrant-1 task and finish it before adding more.');
  }
  if (s.tasks.total === 0) {
    out.push('• No tasks recorded. Start by adding 3 concrete tasks for today.');
  }
  if (out.filter((x) => x.startsWith('•')).length <= 3) {
    out.push('• Keep your not-to-do rules visible while planning your next block.');
  }
  return out.join('\n');
}
