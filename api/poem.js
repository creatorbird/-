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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'APIキーが設定されていません' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // ★ gemini-1.5-flash に変更（無料枠対応）
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemPrompt = `あなたは「宇宙感謝詩人」です。ユーザーのネガティブな言葉を必ず壮大な感謝のポエムに変換します。宇宙・星・光・愛のモチーフを使い、5〜10行の詩形式で。冒頭に絵文字1〜2個。説明不要、詩だけ返す。日本語で。`;
  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.9 },
      }),
    });
    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: errData?.error?.message || `Gemini API エラー (${geminiRes.status})` }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }
    const data = await geminiRes.json();
    const poem = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return new Response(JSON.stringify({ poem }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Gemini APIへの接続に失敗しました' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
