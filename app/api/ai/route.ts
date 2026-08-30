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
      // Если модель недоступна, возвращаем заглушку
      return NextResponse.json({
        reply: '🤖 BYTEAM AI: Модель временно недоступна. Попробуйте позже!'
      });
    }

    const data = await response.json();
    let reply = data?.generated_text || 'Не удалось получить ответ';

    // Если ответ слишком короткий
    if (reply.length < 10) {
      reply = '🤖 BYTEAM AI: Отличный вопрос! Попробуйте начать с базовых тренировок и разбора демок.';
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({
      reply: '🤖 BYTEAM AI: Временная ошибка. Пожалуйста, попробуйте ещё раз.'
    });
  }
}