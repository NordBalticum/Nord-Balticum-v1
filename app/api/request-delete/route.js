// ✅ Server-side route for account deletion request
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { email } = await req.json();

    // ✅ Įrašo užklausą į logs lentelę (arba kitaip tvarkom)
    const { error } = await supabase.from("logs").insert([
      {
        user_id: email,
        action: "request_delete",
        details: "User requested account deletion.",
      },
    ]);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
