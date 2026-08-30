import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Сообщения не найдены' }, { status: 400 });
    }

    // Берём последний вопрос пользователя
    const userMessage = messages[messages.length - 1]?.content || '';

    // Пробуем OpenRouter (бесплатно)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'microsoft/phi-3-mini-128k-instruct', // бесплатная модель
        messages: [
          {
            role: 'system',
            content: `Ты — BYTEAM AI, помощник капитана киберспортивной команды по CS2.
Отвечай на вопросы по делу, на русском языке, кратко и полезно.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      // Если OpenRouter не работает — возвращаем умную заглушку
      return NextResponse.json({
        reply: generateSmartResponse(userMessage)
      });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || generateSmartResponse(userMessage);

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({
      reply: generateSmartResponse('ошибка')
    });
  }
}

// Функция-заглушка с умными ответами
function generateSmartResponse(question: string): string {
  const q = question.toLowerCase();
  
  if (q.includes('мираж') || q.includes('mirage')) {
    return `🎯 BYTEAM AI: Игра на Mirage требует контроля центральной части карты. Советую:
1. Занять контроль над "коннектором" и "паласом" на CT стороне.
2. На T стороне — агрессивно заходить на "А" через "аппарты" или на "Б" через "андерпасс".
3. Используйте дымовые гранаты для закрытия углов.
4. Тренируйте выходы на "мид" — это ключевая позиция.`;
  }
  
  if (q.includes('даст') || q.includes('dust') || q.includes('дасте')) {
    return `🎯 BYTEAM AI: Dust 2 — классическая карта. Ключевые моменты:
1. На T стороне — контроль "лонга" и "ката" на А.
2. На CT стороне — удерживайте "мид" и "катку".
3. Используйте дым на "дверях" в "лонге" и на "миде".
4. AWP особенно силён на этой карте — используйте "мид" и "лонг".`;
  }
  
  if (q.includes('инферно') || q.includes('inferno')) {
    return `🎯 BYTEAM AI: Inferno — карта с узкими проходами. Советую:
1. На T стороне — контроль "банана" и "мида".
2. На CT стороне — агрессивный контроль "аппартов".
3. Используйте молотовы для очистки "банана".
4. Тренируйте выходы на "Б" через "комнаты".`;
  }

  return `🎯 BYTEAM AI: Отличный вопрос! Рекомендую начать с разбора демок профессиональных команд. 
Обратите внимание на позиционирование, использование гранат и командную работу. 
Конкретные советы зависят от карты и стиля игры вашей команды.`;
}