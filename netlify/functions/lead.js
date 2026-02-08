import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const data = JSON.parse(event.body);

    const { error } = await supabase
      .from('leads')
      .insert([
        {
          name: data.name || null,
          phone: data.phone,
          telegram: data.telegram || null,
          course: data.course || null,
          budget: data.budget || null
        }
      ]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
