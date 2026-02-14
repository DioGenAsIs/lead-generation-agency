const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Лучше НЕ '*'. Поставь сюда домен сайта: https://your-site.netlify.app
// Можно прокинуть через env, чтобы не хардкодить.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
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
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
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
    // "тихо" игнорируем
    return { statusCode: 204, body: '' };
  }

  // Время на странице (ts должен быть поставлен ДО сабмита, на загрузке страницы)
  const ts = Number(payload.ts || 0);
  if (!ts) return json(400, { error: 'Bad request' });

  const ageMs = Date.now() - ts;
  if (ageMs < 1500) {
    return json(429, { error: 'Too fast. Please try again.' });
  }

  // Поля формы (новая схема)
  const name = String(payload.name || '').trim();
  const phoneRaw = String(payload.phone || '').trim();
  const telegram = String(payload.telegram || '').trim();
  const whatsapp = String(payload.whatsapp || '').trim();
  const website = String(payload.website || '').trim();
  const budget = String(payload.budget || '').trim();
  const source = String(payload.source || 'site').trim() || null;
  const utm = payload.utm ?? null;

  // Валидации
  if (!name) {
    return json(400, { error: 'Name is required' });
  }

  const phoneDigits = phoneRaw.replace(/\D/g, '');
  if (!phoneDigits || phoneDigits.length < 6) {
    return json(400, { error: 'Phone is required' });
  }

  // Нужно хотя бы одно: Telegram или WhatsApp
  if (!telegram && !whatsapp) {
    return json(400, { error: 'Telegram or WhatsApp is required' });
  }

  // Consent НЕ сохраняем в таблицу, но требуем
  const consent = !!payload.consent;
  if (!consent) {
    return json(400, { error: 'Consent is required' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const row = {
    name,
    phone: phoneRaw, // оставляем как ввёл пользователь
    telegram: telegram || null,
    whatsapp: whatsapp || null,
    website: website || null,
    budget: budget || null,
    source,
    utm,
  };

  // Если ты пока НЕ добавлял колонку website, но хочешь не терять значение:
  // row.course = website || null;

  const { data, error } = await supabase
    .from('leads')
    .insert([row])
    .select('id');

  if (error) {
    return json(500, { error: error.message });
  }

  return json(200, { ok: true, id: data?.[0]?.id });
};
