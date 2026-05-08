export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave nao configurada no Vercel.' });
  }
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Prompt vazio.' });
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://inpactum.vercel.app',
        'X-Title': 'Inpactum Digital'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        max_tokens: 1800,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = data?.error?.message || JSON.stringify(data);
      return res.status(response.status).json({ error: `Erro OpenRouter: ${msg}` });
    }
    const text = data.choices?.[0]?.message?.content || '';
    if (!text) return res.status(500).json({ error: 'Resposta vazia.' });
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: `Erro: ${e.message}` });
  }
}
