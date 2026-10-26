"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  ArrowUpRight,
  CalendarDays,
  Target,
  Bot,
  Copy,
  Check,
} from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { Header } from "@/components/workspace/Header";
import { Notice } from "@/components/workspace/Notice";
import { useTeamData } from "@/lib/hooks/useTeamData";

type Message = { role: "user" | "assistant"; content: string; source?: string };
interface Task {
  id: string;
  status: string;
}
interface TeamEvent {
  id: string;
  title: string;
  date: string;
  time: string;
}
const greeting: Message = {
  role: "assistant",
  content:
    "Привет! Давайте сделаем команду сильнее. Помогу разобраться в тактике, спланировать тренировки и подготовиться к турниру. С чего начнём?",
};
const suggestions = [
  "Составь план тренировок на неделю",
  "Как улучшить игру на Mirage?",
  "Как подготовиться к турниру?",
  "Как проводить разбор демо?",
];
export default function AIPage() {
  const { items: tasks, error } = useTeamData<Task>("tasks");
  const { items: events } = useTeamData<TeamEvent>("events");
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);
  useEffect(
    () => () => {
      requestRef.current?.abort();
    },
    [],
  );
  async function send(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const next: Message[] = [
      ...messages,
      { role: "user", content: input.trim() },
    ];
    setMessages(next);
    setInput("");
    setBusy(true);
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .slice(-20)
            .map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== "string") throw new Error();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, source: data.source },
      ]);
    } catch {
      if (!controller.signal.aborted)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Не удалось получить ответ. Попробуйте отправить вопрос ещё раз.",
          },
        ]);
    } finally {
      setBusy(false);
    }
  }
  async function copyReply() {
    try {
      await navigator.clipboard.writeText(
        [...messages].reverse().find((m) => m.role === "assistant")?.content ||
          "",
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  const completed = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const today = new Date().toLocaleDateString("sv-SE");
  const upcoming = [...events]
    .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.date >= today)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 3);
  return (
    <div className="workspace">
      <Sidebar />
      <main className="workspace-main">
        <Header
          title="ИИ-менеджер команды"
          subtitle="Больше ясности в планах. Больше уверенности в игре."
        >
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => setMessages([greeting])}
          >
            <RefreshCw size={15} />
            Новый диалог
          </button>
        </Header>
        <div className="workspace-content">
          <Notice message={error} />
          <div className="ai-layout">
            <section className="panel ai-chat">
              <div className="chat-heading">
                <span>
                  <Sparkles size={19} />
                  BYTEAM · ИИ-помощник
                </span>
                <span className="chat-status">
                  {busy ? "Готовим ответ…" : "Готов помочь"}
                </span>
              </div>
              <div
                className="chat-messages"
                role="log"
                aria-label="Переписка с помощником"
              >
                {messages.map((message, index) => (
                  <div className={`chat-message ${message.role}`} key={index}>
                    {message.role === "assistant" && (
                      <span className="bot-avatar">
                        <Bot size={20} />
                      </span>
                    )}
                    <div>
                      <div className="chat-bubble">{message.content}</div>
                      {message.source === "fallback" && (
                        <small className="reply-source">
                          Справочный ответ · ИИ-сервис недоступен
                        </small>
                      )}
                    </div>
                  </div>
                ))}
                {messages.length === 1 && (
                  <div className="starter-plan">
                    <span className="eyebrow">С ЧЕГО НАЧНЁМ?</span>
                    <h2>Каждая победа начинается с плана.</h2>
                    <p>
                      Выберите тему или задайте свой вопрос. Тактика,
                      подготовка, работа над ошибками — разберём по шагам.
                    </p>
                    {suggestions.map((q, i) => (
                      <button key={q} onClick={() => setInput(q)}>
                        <span
                          className={`suggestion-icon ${i % 2 ? "purple" : "blue"}`}
                        >
                          {i % 2 ? (
                            <Target size={17} />
                          ) : (
                            <CalendarDays size={17} />
                          )}
                        </span>
                        {q}
                        <ArrowUpRight size={15} />
                      </button>
                    ))}
                  </div>
                )}
                {busy && (
                  <div className="thinking" role="status">
                    <i />
                    <i />
                    <i />
                    Помощник готовит ответ
                  </div>
                )}
                <div ref={endRef} />
              </div>
              <div className="chat-composer">
                <div className="chat-tools">
                  <button onClick={copyReply}>
                    <Copy size={13} />
                    {copied ? "Скопировано" : "Скопировать ответ"}
                  </button>
                  <span>Советы требуют проверки тренером</span>
                </div>
                <form onSubmit={send}>
                  <input
                    aria-label="Сообщение помощнику"
                    placeholder="Что обсудим с командой?"
                    maxLength={4000}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={busy}
                  />
                  <button
                    className="primary-button"
                    disabled={busy || !input.trim()}
                    aria-label="Отправить сообщение"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <small>
                  Помощник отвечает на ваши сообщения. Данные команды
                  автоматически ему не передаются.
                </small>
              </div>
            </section>
            <aside className="ai-aside">
              <section className="panel">
                <div className="panel-title">
                  <h2>Прогресс команды</h2>
                  <span className="tag blue">Задачи</span>
                </div>
                <div className="progress-summary">
                  <div
                    className="progress-ring"
                    style={{
                      background: `conic-gradient(var(--accent) ${progress}%, #24372d 0)`,
                    }}
                  >
                    <span>{tasks.length ? `${progress}%` : "—"}</span>
                  </div>
                  <div>
                    <strong>
                      {completed} из {tasks.length}
                    </strong>
                    <small>задач выполнено</small>
                    <span className="progress-caption">
                      {!tasks.length
                        ? "Добавьте первую задачу"
                        : progress === 100
                          ? "Отличная работа!"
                          : "Шаг за шагом к цели"}
                    </span>
                  </div>
                </div>
                <Link className="panel-link" href="/tasks">
                  Открыть доску задач <ArrowUpRight size={14} />
                </Link>
              </section>
              <section className="panel">
                <div className="panel-title">
                  <h2>Ближайшие события</h2>
                  <Link href="/calendar">Календарь</Link>
                </div>
                {upcoming.length ? (
                  upcoming.map((event) => (
                    <Link
                      className="upcoming-event"
                      href="/calendar"
                      key={event.id}
                    >
                      <i className="event-dot" />
                      <div>
                        <strong>{event.title}</strong>
                        <small>
                          {new Date(
                            event.date + "T12:00:00",
                          ).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                          })}{" "}
                          · {event.time === "—" ? "Весь день" : event.time}
                        </small>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="aside-empty">
                    <CalendarDays size={26} />
                    <p>План ещё не составлен</p>
                    <small>
                      Запланируйте следующую тренировку в календаре команды.
                    </small>
                  </div>
                )}
              </section>
              <section className="panel coach-note">
                <span className="note-icon">
                  <Check size={19} />
                </span>
                <h2>Работайте над главным</h2>
                <p>
                  Одна конкретная цель на тренировку полезнее десяти размытых.
                  Определите фокус и обсудите результат с командой.
                </p>
                <span className="eyebrow">ПАМЯТКА КАПИТАНА</span>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
