import { createClient } from "@supabase/supabase-js";

// ✅ Apsauga nuo klaidų, jei nėra ENV kintamųjų
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("❌ Trūksta `Supabase` konfigūracijos. Patikrink `.env.local`!");
}

// ✅ Sukuriame `Supabase` klientą
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase;
