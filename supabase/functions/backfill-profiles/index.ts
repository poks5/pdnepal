import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // List all auth users
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (listErr) return new Response(JSON.stringify({ error: listErr.message }), { status: 500 });

  const results: any[] = [];

  for (const user of users) {
    // Backfill profile
    const { error: profileErr } = await supabase.from("profiles").upsert({
      user_id: user.id,
      full_name: user.user_metadata?.full_name || user.email,
      language: user.user_metadata?.language || "en",
      phone: user.user_metadata?.phone || null,
      hospital: user.user_metadata?.hospital || null,
    }, { onConflict: "user_id" });

    // Backfill role if missing
    const { data: existingRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!existingRoles || existingRoles.length === 0) {
      const role = user.user_metadata?.role || "patient";
      await supabase.from("user_roles").insert({ user_id: user.id, role });
    }

    // Assign admin+doctor to anilpokhrel@gmail.com
    if (user.email === "anilpokhrel@gmail.com") {
      await supabase.from("user_roles").upsert(
        { user_id: user.id, role: "admin" },
        { onConflict: "user_id,role" }
      );
      // Check if doctor role exists
      const hasDoctor = existingRoles?.some((r: any) => r.role === "doctor");
      if (!hasDoctor) {
        await supabase.from("user_roles").insert({ user_id: user.id, role: "doctor" });
      }
    }

    results.push({ email: user.email, id: user.id, profileErr: profileErr?.message });
  }

  return new Response(JSON.stringify({ success: true, users: results }), {
    headers: { "Content-Type": "application/json" },
  });
});
