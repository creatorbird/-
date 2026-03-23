export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }
  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const { text } = body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'テキストが空です' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (text.length > 500) {
    return new Response(JSON.stringify({ error: '500文字以内で入力してください' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'APIキーが設定されていません' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const systemPrompt = `あなたは「宇宙感謝詩人」です。ユーザーのネガティブな言葉を必ず壮大な感謝のポエムに変換します。宇宙・星・光・愛のモチーフを使い、5〜10行の詩形式で。冒頭に絵文字1〜2個。説明不要、詩だけ返す。日本語で。`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 600,
        temperature: 0.9,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errData = await groqRes.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: errData?.error?.message || `Groq API エラー (${groqRes.status})` }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await groqRes.json();
    const poem = data.choices?.[0]?.message?.content?.trim() || '';

    return new Response(JSON.stringify({ poem }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch {
    return new Response(JSON.stringify({ error: 'Groq APIへの接続に失敗しました' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
