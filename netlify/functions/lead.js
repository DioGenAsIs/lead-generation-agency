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

  // ✅ anti-bot: ограничим размер тела (простая защита от мусора)
  if ((event.body || '').length > 10_000) {
    return json(413, { error: 'Payload too large' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  // ✅ anti-bot: honeypot + timestamp (серверная проверка)
  const hp = (payload.hp || payload.company || '').toString().trim(); // поддержка обоих названий
  const ts = Number(payload.ts || 0);
  if (hp) return json(200, { ok: true });                 // honeypot заполнен → "тихо" игнорируем
  if (!ts) return json(400, { error: 'Bad request' });    // нет timestamp
  if (Date.now() - ts < 2500) return json(200, { ok: true }); // слишком быстро → вероятно бот

  const name = (payload.name || '').toString().trim();
  const phone = (payload.phone || '').toString().trim();
  const telegram = (payload.telegram || '').toString().trim();
  const course = (payload.course || '').toString().trim();
  const budget = (payload.budget || '').toString().trim();
  const source = (payload.source || 'site').toString().trim();
  const utm = payload.utm || null;
  const consent = !!payload.consent;

  // ✅ чуть надёжнее: считаем цифры телефона
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
        phone, // оставляем как ввёл пользователь (можешь заменить на phoneDigits при желании)
        telegram: telegram || null,
        course: course || null,
        budget: budget || null,
        source: source || null,
        utm: utm || null
      }
    ])
    .select('id');

  if (error) {
    return json(500, { error: error.message });
  }

  return json(200, { ok: true, id: data?.[0]?.id });
};
