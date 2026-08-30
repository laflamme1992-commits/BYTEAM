import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Сообщения не найдены' }, { status: 400 });
    }

    // Временный ответ для проверки
    return NextResponse.json({
      reply: '🤖 BYTEAM AI: Я временно работаю в тестовом режиме. Скоро я научусь отвечать на все вопросы!'
    });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обращении к AI' },
      { status: 500 }
    );
  }
}