
"use client";

import { useEffect, useState } from "react";
import { useMagicLink } from "@/context/MagicLinkContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import styles from "@/styles/admin.module.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function UsersAdmin() {
  const { user } = useMagicLink();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push("/");
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (!error) setUsers(data);
    setLoading(false);
  };

  const updateUserStatus = async (id, updates) => {
    await supabase.from("users").update(updates).eq("id", id);
    fetchUsers();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>👥 Users</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Created</th>
              <th>Ban</th>
              <th>Freeze</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>{u.banned ? "Yes" : "No"}</td>
                <td>{u.wallet_frozen ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => updateUserStatus(u.id, { banned: !u.banned })}>
                    {u.banned ? "Unban" : "Ban"}
                  </button>
                  <button onClick={() => updateUserStatus(u.id, { wallet_frozen: !u.wallet_frozen })}>
                    {u.wallet_frozen ? "Unfreeze" : "Freeze"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
