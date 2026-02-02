const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, refine } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Adjust the system prompt based on whether we're refining
    const systemPrompt = refine 
      ? `Tu es un assistant personnel qui affine les suggestions d'habitudes pour les rendre ENCORE PLUS PRÉCISES et SPÉCIFIQUES.

L'utilisateur a déjà reçu des suggestions générales, maintenant il veut des habitudes plus :
- CONCRÈTES avec des chiffres précis (durées, quantités, fréquences)
- DÉTAILLÉES avec des actions très spécifiques
- PERSONNALISÉES pour son contexte

Exemples de progression :
Général → Précis :
- "Faire du sport" → "30 min de HIIT à 7h le matin, 3x/semaine (Lundi/Mercredi/Vendredi)"
- "Mieux manger" → "Préparer 3 repas avec 30g de protéines et 400g de légumes à 12h30"
- "Lire plus" → "Lire 20 pages d'un livre de développement personnel entre 21h et 21h30"

Suggère 3-5 habitudes ULTRA-PRÉCISES avec des détails concrets.
Chaque explication (max 150 caractères) doit mentionner l'impact SPÉCIFIQUE.

Réponds en français.`
      : `Tu es un assistant personnel qui aide les utilisateurs à atteindre leurs objectifs en suggérant des habitudes concrètes et réalisables.

Ton rôle est de :
- Comprendre les objectifs de l'utilisateur (devenir plus beau, plus musclé, plus productif, etc.)
- Suggérer 3-5 habitudes spécifiques et actionnables
- Pour chaque habitude, expliquer brièvement les bénéfices en 1-2 phrases courtes (max 150 caractères)
- Donner des habitudes courtes et claires (max 50 caractères pour le nom)
- Rester motivant et positif

Exemples :
- "Boire 2L d'eau par jour" → "Hydrate ton corps et booste ton énergie. Améliore ta peau et ta concentration."
- "20 pompes chaque matin" → "Renforce ton corps et réveille tes muscles. Démarre ta journée avec de l'énergie."
- "Méditer 10 minutes" → "Calme ton esprit et réduit le stress. Améliore ta concentration au quotidien."

Réponds en français et reste concis.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_habits",
              description: "Suggère des habitudes concrètes pour atteindre l'objectif de l'utilisateur",
              parameters: {
                type: "object",
                properties: {
                  habits: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { 
                          type: "string",
                          description: "Nom de l'habitude (max 50 caractères)"
                        },
                        icon: { 
                          type: "string",
                          enum: ["hydratation", "sport", "nutrition", "sommeil", "meditation", "lecture", "travail", "social"],
                          description: "Icône représentant l'habitude"
                        },
                        reason: {
                          type: "string",
                          description: "Explication des bénéfices en 1-2 phrases courtes (max 150 caractères)"
                        }
                      },
                      required: ["name", "icon", "reason"]
                    },
                    minItems: 3,
                    maxItems: 5
                  },
                  message: {
                    type: "string",
                    description: "Message encourageant très court (optionnel, max 100 caractères)"
                  }
                },
                required: ["habits"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_habits" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessaie dans un instant." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants pour l'IA." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erreur de l'assistant IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Extract the tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function.name === "suggest_habits") {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback if no tool call
    const content = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer de suggestions.";
    return new Response(
      JSON.stringify({ message: content, habits: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in habit-assistant:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
