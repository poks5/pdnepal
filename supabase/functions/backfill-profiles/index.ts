import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // List all auth users
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (listErr) return new Response(JSON.stringify({ error: listErr.message }), { status: 500 });

  const results: any[] = [];

  for (const user of users) {
    // Insert profile if not exists
    const { data: existing } = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
    
    let profileResult;
    if (!existing) {
      profileResult = await supabase.from("profiles").insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email || "Unknown",
        language: user.user_metadata?.language || "en",
        phone: user.user_metadata?.phone || null,
        hospital: user.user_metadata?.hospital || null,
      });
    }

    // Get existing roles
    const { data: existingRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    // Add default role if none
    if (!existingRoles || existingRoles.length === 0) {
      const role = user.user_metadata?.role || "patient";
      await supabase.from("user_roles").insert({ user_id: user.id, role });
    }

    // Assign admin+doctor to anilpokhrel@gmail.com
    if (user.email === "anilpokhrel@gmail.com") {
      const hasAdmin = existingRoles?.some((r: any) => r.role === "admin");
      const hasDoctor = existingRoles?.some((r: any) => r.role === "doctor");
      
      if (!hasAdmin) {
        await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
      }
      if (!hasDoctor) {
        await supabase.from("user_roles").insert({ user_id: user.id, role: "doctor" });
      }
    }

    results.push({ 
      email: user.email, 
      id: user.id, 
      profileExisted: !!existing,
      profileErr: profileResult?.error?.message,
      roles: existingRoles?.map((r: any) => r.role)
    });
  }

  return new Response(JSON.stringify({ success: true, users: results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
