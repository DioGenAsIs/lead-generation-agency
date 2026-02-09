const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed. Use POST.' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Netlify env vars.' });
  }

  if ((event.body || '').length > 10_000) {
    return json(413, { error: 'Payload too large' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  // Honeypot (если заполнен — почти точно бот)
  const hp = String(payload.hp || '').trim();
  if (hp) {
    // можно "тихо" игнорировать, но лучше возвращать 204
    return { statusCode: 204, body: '' };
  }

  // Время на странице (ts должен быть поставлен ДО сабмита, на загрузке страницы)
  const ts = Number(payload.ts || 0);
  if (!ts) return json(400, { error: 'Bad request' });

  const ageMs = Date.now() - ts;
  // Если отправили слишком быстро — не пишем в БД и говорим “слишком быстро”
  if (ageMs < 1500) {
    return json(429, { error: 'Too fast. Please try again.' });
  }

  const name = String(payload.name || '').trim() || null;
  const phoneRaw = String(payload.phone || '').trim();
  const telegram = String(payload.telegram || '').trim() || null;
  const course = String(payload.course || '').trim() || null;
  const budget = String(payload.budget || '').trim() || null;
  const source = String(payload.source || 'site').trim() || null;
  const utm = payload.utm ?? null;

  const phoneDigits = phoneRaw.replace(/\D/g, '');
  if (!phoneDigits || phoneDigits.length < 6) {
    return json(400, { error: 'Phone is required' });
  }

  // Consent НЕ сохраняем в таблицу, но требуем
  const consent = !!payload.consent;
  if (!consent) {
    return json(400, { error: 'Consent is required' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from('leads')
    .insert([
      {
        name,
        phone: phoneRaw, // оставляем как ввёл пользователь
        telegram,
        course,
        budget,
        source,
        utm,
      },
    ])
    .select('id');

  if (error) {
    return json(500, { error: error.message });
  }

  return json(200, { ok: true, id: data?.[0]?.id });
};
