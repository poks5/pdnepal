import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("No authorization header");

    // Verify user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { photoUrl } = await req.json();
    if (!photoUrl) throw new Error("photoUrl is required");

    // Generate signed URL if it's a storage path
    let imageUrl = photoUrl;
    if (!photoUrl.startsWith("http")) {
      const { data: signedData } = await supabase.storage
        .from("clinical-photos")
        .createSignedUrl(photoUrl, 600);
      if (signedData?.signedUrl) imageUrl = signedData.signedUrl;
    }

    // Call AI to analyze the image
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a clinical assistant specializing in peritoneal dialysis exit site assessment. 
Analyze the exit site photo and provide:
1. Overall assessment: normal, mild concern, moderate concern, or severe concern
2. Observed signs (list): redness, swelling, discharge, crusting, granulation tissue, tunnel infection signs
3. Recommendation: what action to take
4. Confidence level: low, medium, high

IMPORTANT: This is a screening aid only, not a diagnosis. Always recommend clinical review for any concern.
Respond using the provided tool function.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Please analyze this PD catheter exit site photo for signs of infection or complications." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "exit_site_analysis",
              description: "Structured analysis of PD exit site photo",
              parameters: {
                type: "object",
                properties: {
                  assessment: {
                    type: "string",
                    enum: ["normal", "mild_concern", "moderate_concern", "severe_concern"],
                    description: "Overall assessment level",
                  },
                  observed_signs: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of observed clinical signs",
                  },
                  recommendation: {
                    type: "string",
                    description: "Recommended action",
                  },
                  confidence: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                    description: "Confidence in the assessment",
                  },
                  details: {
                    type: "string",
                    description: "Detailed description of findings",
                  },
                },
                required: ["assessment", "observed_signs", "recommendation", "confidence", "details"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "exit_site_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    let analysis;

    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: parse from content
      analysis = {
        assessment: "unknown",
        observed_signs: [],
        recommendation: "Unable to analyze. Please consult your healthcare provider.",
        confidence: "low",
        details: aiResult.choices?.[0]?.message?.content || "Analysis unavailable",
      };
    }

    // If concerning, auto-create clinical alert
    if (analysis.assessment === "moderate_concern" || analysis.assessment === "severe_concern") {
      await supabase.from("clinical_alerts").insert({
        patient_id: user.id,
        alert_type: "exit_site_ai_flag",
        severity: analysis.assessment === "severe_concern" ? "high" : "medium",
        title: "🤖 AI Exit Site Flag",
        message: `AI detected ${analysis.observed_signs.join(", ")} at exit site. ${analysis.recommendation}`,
        details: JSON.stringify(analysis),
      });
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-exit-site-photo error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
