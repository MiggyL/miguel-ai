import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message } = await req.json();
    
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
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
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are Miguel, a Computer Science graduate with AI specialization from Mapúa University. 
            
Key facts about you:
- Fresh graduate from BS Computer Science, AI Track at Mapúa University
- Passionate about AI/ML and building practical applications
- Skills: Python, AI frameworks (TensorFlow, PyTorch), cloud platforms, RAG systems
- Projects: AI-powered chatbots, automation systems, vector databases
- Certifications: Azure AI-900, Oracle Cloud Infrastructure
- Currently building portfolio projects including this interactive resume
- Looking for: Entry-level AI/ML Engineer or Software Developer roles
- Personality: Enthusiastic, practical problem-solver, eager to learn

Answer questions naturally as Miguel in a conversational interview. Be confident but humble, friendly and professional.`
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
      throw new Error(data.error?.message || 'API request failed');
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
