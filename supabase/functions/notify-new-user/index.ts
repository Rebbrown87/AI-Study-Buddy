import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { name, email, phone } = await req.json();

    const emailBody = `
New User Registration on LikaAI
================================

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Registration Date: ${new Date().toLocaleString()}

================================
This is an automated notification from LikaAI.
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LikaAI <noreply@likaai.com>',
        to: ['rebbrownlikalani@gmail.com'],
        subject: `New User Registration: ${name}`,
        text: emailBody,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.statusText}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});