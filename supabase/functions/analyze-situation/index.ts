import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, person1_pov, person2_pov } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing situation:', title);

    const systemPrompt = `You are an empathetic relationship counselor AI. Your role is to:
1. Listen to both partners' perspectives without bias
2. Identify the core issues and emotions
3. Provide a fair, balanced assessment
4. Suggest constructive solutions that honor both perspectives
5. Be compassionate and understanding

Format your response as JSON with these fields:
{
  "analysis": "Deep analysis of the situation, identifying emotions, needs, and patterns",
  "verdict": "A balanced assessment - who has valid points, where both could improve",
  "solution": "Practical, actionable steps for resolution and growth",
  "person1_insights": "Specific insights for person 1",
  "person2_insights": "Specific insights for person 2"
}`;

    const userPrompt = `Situation: ${title}

Person 1's Perspective:
${person1_pov}

Person 2's Perspective:
${person2_pov}

Please analyze this situation and provide guidance.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI analysis complete');

    // Try to parse as JSON, fallback to text structure if needed
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '');
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (e) {
      // Fallback: create structured response from text
      parsedResponse = {
        analysis: aiResponse,
        verdict: "Please review the full analysis above",
        solution: "See the recommendations in the analysis",
        person1_insights: "See analysis",
        person2_insights: "See analysis"
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-situation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});