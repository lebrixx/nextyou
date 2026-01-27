import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const allowedOrigins = [
  'https://habitflow-neon-pulse.lovable.app',
  'https://id-preview--02242e9b-a733-4244-a277-ad7efa295676.lovable.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
  'capacitor://localhost',
  'http://localhost'
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '';
  const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed) || origin === allowed);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { habits, stats } = await req.json();
    
    if (!habits || !Array.isArray(habits)) {
      throw new Error('Invalid habits data');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Tu es un expert en psychologie comportementale et en formation d'habitudes.
Analyse les habitudes fournies et pour chacune :
- Évalue la difficulté (score de 1 à 10)
- Détermine la catégorie (too_hard, too_easy, perfect, redundant, energy_draining)
- Fournis une recommandation précise
- Suggère une version "2 minutes" simplifiée
- Propose des habitudes dérivées si pertinent

Réponds UNIQUEMENT avec un JSON valide au format :
{
  "analysis": [
    {
      "habit_id": "uuid",
      "difficulty_score": 7,
      "category": "too_hard",
      "recommendation_type": "simplify",
      "reason": "Raison détaillée",
      "two_minute_version": "Version ultra-simple",
      "suggested_new_habits": ["Habitude 1", "Habitude 2"]
    }
  ]
}`;

    const userPrompt = `Voici les habitudes et leurs statistiques :
${JSON.stringify({ habits, stats }, null, 2)}

Analyse chaque habitude et fournis tes recommandations.`;

    console.log('Calling Lovable AI for habit analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte, réessayez plus tard.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits insuffisants, veuillez recharger votre compte.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Lovable AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in habit-difficulty-analyzer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
