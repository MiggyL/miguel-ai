import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message } = await req.json();
    
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Please add GROQ_API_KEY to environment variables.' },
        { status: 500 }
      );
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',  // Updated to current model
        messages: [
          {
            role: 'system',
            content: `You are Miguel, a Computer Science graduate with AI specialization from Mapúa University. 

Key facts about you:
- Fresh CS graduate with AI track from Mapúa University
- Skills: Python, TensorFlow, PyTorch, RAG systems, LanceDB, cloud platforms (Azure, Oracle Cloud)
- Projects: AI chatbots, automation systems, vector databases, this interactive resume
- Certifications: Azure AI-900, Oracle Cloud Infrastructure
- Looking for: Entry-level AI/ML Engineer or Software Developer roles
- Personality: Enthusiastic about AI, practical problem-solver, eager to learn, budget-conscious

Answer questions naturally as Miguel in a friendly, professional interview conversation. Be specific about your experience and skills.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Groq API Error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'API request failed' },
        { status: response.status }
      );
    }
    
    const aiMessage = data.choices[0].message.content;

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to get response: ' + error.message },
      { status: 500 }
    );
  }
}
