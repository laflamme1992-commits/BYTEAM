import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Сообщение не найдено' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Ты — BYTEAM AI, помощник капитана киберспортивной команды по CS2.
          Ты помогаешь с планированием тренировок, анализом игроков и стратегиями.
          Отвечай кратко, по делу, на русском языке. Твой тон — уверенный, профессиональный, но дружелюбный.`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'Не удалось получить ответ';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Ошибка при обращении к AI' }, { status: 500 });
  }
}