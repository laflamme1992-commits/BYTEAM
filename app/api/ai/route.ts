import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Сообщения не найдены' }, { status: 400 });
    }

    // Берём последний вопрос пользователя
    const userMessage = messages[messages.length - 1]?.content || '';

    // Используем бесплатную модель на Hugging Face
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: userMessage,
        }),
      }
    );

    if (!response.ok) {
      // Пробуем запасной вариант
      const fallbackResponse = await fetch(
        'https://api-inference.huggingface.co/models/google/flan-t5-base',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: userMessage,
          }),
        }
      );

      if (!fallbackResponse.ok) {
        return NextResponse.json(
          { error: 'AI временно недоступен. Попробуйте позже.' },
          { status: 500 }
        );
      }

      const fallbackData = await fallbackResponse.json();
      let fallbackReply = fallbackData?.generated_text || 'Не удалось получить ответ';

      // Делаем ответ более человеческим
      if (fallbackReply.length < 10) {
        fallbackReply = 'Вот что я могу посоветовать: попробуйте начать с базовых тренировок. Удачи!';
      }

      return NextResponse.json({ reply: fallbackReply });
    }

    const data = await response.json();
    let reply = data?.generated_text || 'Не удалось получить ответ';

    // Если ответ слишком короткий или бессмысленный
    if (reply.length < 10) {
      reply = 'Вот что я могу посоветовать: попробуйте начать с базовых тренировок. Удачи!';
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обращении к AI' },
      { status: 500 }
    );
  }
}