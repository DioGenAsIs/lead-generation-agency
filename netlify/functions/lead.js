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
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function normalizeConsent(value) {
  if (value === true) return true;
  if (value === false || value == null) return false;
  const v = String(value).toLowerCase().trim();
  return v === 'on' || v === 'true' || v === '1' || v === 'yes';
}

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed. Use POST.' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Netlify env vars.' });
  }

  // anti-bot: ограничим размер тела
  if ((event.body || '').length > 10_000) {
    return json(413, { error: 'Payload too large' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  // anti-bot: honeypot + timestamp
  const hp = (payload.hp || payload.company || '').toString().trim(); // поддержка обоих названий
  const ts = Number(payload.ts || 0);

  // honeypot заполнен → "тихо" игнорируем
  if (hp) return json(200, { ok: true });

  // если ты НЕ отправляешь ts с фронта — убери эти 2 проверки ниже
  if (!ts) return json(400, { error: 'Bad request' });
  if (Date.now() - ts < 2500) return json(200, { ok: true });

  const name = (payload.name || '').toString().trim();
  const phone = (payload.phone || '').toString().trim();
  const telegram = (payload.telegram || '').toString().trim();
  const course = (payload.course || '').toString().trim();
  const budget = (payload.budget || '').toString().trim();
  const source = (payload.source || 'site').toString().trim();
  const utm = payload.utm || null;

  // ✅ главное исправление
  const consent = normalizeConsent(payload.consent);

  // валидация телефона по цифрам
  const phoneDigits = phone.replace(/\D/g, '');
  if (!phoneDigits || phoneDigits.length < 6) {
    return json(400, { error: 'Phone is required' });
  }

  if (!consent) {
    return json(400, { error: 'Consent is required' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase
    .from('leads')
    .insert([
      {
        name: name || null,
        phone, // можно заменить на phoneDigits если хочешь хранить только цифры
        telegram: telegram || null,
        course: course || null,
        budget: budget || null,
        source: source || null,
        utm: utm || null,
        consent // ✅ сохраняем
      }
    ])
    .select('id');

  if (error) {
    console.error('Supabase insert error:', error);
    return json(500, { error: error.message });
  }

  return json(200, { ok: true, id: data?.[0]?.id });
};
