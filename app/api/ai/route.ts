import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  buildSystemPrompt,
  parseStaffRequest,
  parseTaskProposal,
  referenceReply,
} from "@/lib/ai/staff";

export async function GET() {
  return NextResponse.json(
    {
      configured: Boolean(
        process.env.OPENROUTER_API_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
      provider: "OpenRouter",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }
  const parsed = parseStaffRequest(payload);
  if (!parsed)
    return NextResponse.json(
      { error: "Проверьте роль, сообщения и размер контекста." },
      { status: 400 },
    );
  const fallback = () =>
    NextResponse.json({
      ...referenceReply(parsed),
      source: "fallback",
      role: parsed.role,
    });
  if (
    !process.env.OPENROUTER_API_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
    return fallback();
  try {
    // Paid model access is available only to an authenticated workspace user.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } },
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return NextResponse.json(
        {
          error:
            "Войдите в аккаунт, чтобы использовать подключённую ИИ-модель.",
        },
        { status: 401 },
      );
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        signal: AbortSignal.timeout(20000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "openrouter/free",
          messages: [
            {
              role: "system",
              content: buildSystemPrompt(parsed.role, parsed.context),
            },
            ...parsed.messages,
          ],
          temperature: 0.4,
          max_tokens: 1100,
          response_format: { type: "json_object" },
        }),
      },
    );
    if (!response.ok) return fallback();
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return fallback();
    const result = JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, ""));
    if (
      typeof result.reply !== "string" ||
      !result.reply.trim() ||
      result.reply.length > 12000
    )
      return fallback();
    return NextResponse.json({
      reply: result.reply,
      proposal: parseTaskProposal(result.proposal, parsed.role),
      source: "model",
      role: parsed.role,
    });
  } catch {
    return fallback();
  }
}
