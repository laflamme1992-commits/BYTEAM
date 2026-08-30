import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Сообщения не найдены' }, { status: 400 });
    }

    // Системный промпт
    const systemMessage = {
      role: 'system',
      content: `Ты — BYTEAM AI, помощник капитана киберспортивной команды по CS2.
Ты помогаешь с планированием тренировок, анализом игроков и стратегиями.
Отвечай кратко, по делу, на русском языке.
Твой тон — уверенный, профессиональный, но дружелюбный.
Если тебя спрашивают про статистику — уточняй, что ты не имеешь доступа к реальной статистике.
Всегда давай конкретные, полезные советы.`
    };

    const fullMessages = [systemMessage, ...messages];

    // Пытаемся через OpenAPIs (самый стабильный)
    const response = await fetch('https://api.openapis.online/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin', // любой ключ
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: fullMessages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAPIs error:', data);
      // Пробуем запасной вариант — KeylessAI
      const fallbackResponse = await fetch('https://keylessai.thryx.workers.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: fullMessages,
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      const fallbackData = await fallbackResponse.json();

      if (!fallbackResponse.ok) {
        console.error('KeylessAI error:', fallbackData);
        return NextResponse.json(
          { error: 'Оба AI-провайдера недоступны. Попробуйте позже.' },
          { status: 500 }
        );
      }

      const fallbackReply = fallbackData.choices?.[0]?.message?.content || 'Не удалось получить ответ';
      return NextResponse.json({ reply: fallbackReply });
    }

    const reply = data.choices?.[0]?.message?.content || 'Не удалось получить ответ';
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обращении к AI. Проверьте интернет.' },
      { status: 500 }
    );
  }
}