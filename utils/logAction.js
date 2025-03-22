import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Loguoja veiksmą į `logs` lentelę
 * @param {string} userId - Vartotojo ID (uuid)
 * @param {string} action - Veiksmas (pvz. "SEND_BNB", "RECEIVE_TOKEN")
 * @param {string} [context] - Papildomas kontekstas (pvz. recipient adresas)
 */
export const logAction = async (userId, action, context = "") => {
  try {
    await supabase.from("logs").insert([
      {
        user_id: userId,
        action,
        context,
      },
    ]);
    console.log(`✅ Log saved: ${action}`);
  } catch (error) {
    console.error("❌ Log klaida:", error.message);
  }
};
