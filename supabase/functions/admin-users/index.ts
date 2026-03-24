import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check caller is admin
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: adminCheck } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // ACTION: list-emails - get all user emails
    if (req.method === "GET" && action === "list-emails") {
      const { data: { users }, error } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;

      const emailMap: Record<string, string> = {};
      for (const u of users) {
        emailMap[u.id] = u.email || "";
      }
      return new Response(JSON.stringify({ emailMap }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ACTION: create-user - create a new user with role
    if (req.method === "POST" && action === "create-user") {
      const body = await req.json();
      const { email, password, fullName, phone, role, hospital, language } = body;

      if (!email || !password || !fullName || !role) {
        return new Response(JSON.stringify({ error: "Missing required fields: email, password, fullName, role" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Create auth user with auto-confirm
      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role, language: language || "en" },
      });

      if (createErr) throw createErr;

      // The handle_new_user trigger will create profile and assign role.
      // But since the trigger defaults non-patient/caregiver to 'patient', 
      // we need to fix the role if it's a privileged one.
      const privilegedRoles = ["doctor", "nurse", "dietician", "coordinator", "admin"];
      if (privilegedRoles.includes(role)) {
        await adminClient
          .from("user_roles")
          .update({ role })
          .eq("user_id", newUser.user.id);
      }

      // Update profile with extra fields
      if (phone || hospital) {
        await adminClient
          .from("profiles")
          .update({ phone: phone || null, hospital: hospital || null })
          .eq("user_id", newUser.user.id);
      }

      return new Response(JSON.stringify({ success: true, userId: newUser.user.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
