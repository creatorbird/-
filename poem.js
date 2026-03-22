// api/poem.js  — Vercel Serverless Function（Gemini版）

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { text } = body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'テキストが空です' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (text.length > 500) {
    return new Response(JSON.stringify({ error: '500文字以内で入力してください' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ★ 環境変数名が変わる
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'APIキーが設定されていません' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ★ GeminiのAPIエンドポイント
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemPrompt = `あなたは「宇宙感謝詩人」です。
ユーザーが送ってくるネガティブな言葉や愚痴を受け取り、
必ず「壮大な感謝のポエム」に変換して返します。

【ルール】
- どんなネガティブな内容でも、ポジティブな感謝の詩に昇華すること
- 宇宙・星・光・愛・成長などのモチーフを使い、壮大な表現にすること
- 詩は5〜10行程度、改行を活用した詩的な形式にすること
- 冒頭に「✨」などの絵文字を1〜2個使ってよい
- 余計な説明や前置きは不要。詩だけを返すこと
- 日本語で返すこと`;

  try {
    // ★ Gemini のリクエスト形式
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.9,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      const message = errData?.error?.message || `Gemini API エラー (${geminiRes.status})`;
      return new Response(JSON.stringify({ error: message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await geminiRes.json();

    // ★ Geminiのレスポンス構造から本文を取り出す
    const poem = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    return new Response(JSON.stringify({ poem }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Gemini APIへの接続に失敗しました' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
