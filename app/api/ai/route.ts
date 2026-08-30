import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Используем KeylessAI — бесплатный прокси к LLM
const openai = new OpenAI({
  apiKey: 'not-needed', // ключ не требуется
  baseURL: 'https://keylessai.thryx.workers.dev/v1',
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Сообщения не найдены' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // можно оставить или заменить на любую модель
      messages: [
        {
          role: 'system',
          content: `Ты — BYTEAM AI, помощник капитана киберспортивной команды по CS2.
          Ты помогаешь с планированием тренировок, анализом игроков и стратегиями.
          Отвечай кратко, по делу, на русском языке.
          Твой тон — уверенный, профессиональный, но дружелюбный.
          Если тебя спрашивают про статистику — уточняй, что ты не имеешь доступа к реальной статистике.
          Всегда давай конкретные, полезные советы.`
        },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'Не удалось получить ответ';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: 'Ошибка при обращении к AI' }, { status: 500 });
  }
}