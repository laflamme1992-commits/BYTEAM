"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  Check,
  ClipboardList,
  Copy,
  HeartHandshake,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { EntryEditor } from "@/components/playbook/EntryEditor";
import {
  blankEntry,
  parseEntry,
  type PlaybookEntry,
} from "@/lib/playbook/model";
import { localSnapshot, persistLocal } from "@/lib/playbook/storage";
import { Sidebar } from "@/components/ui/Sidebar";
import { Header } from "@/components/workspace/Header";
import { Notice } from "@/components/workspace/Notice";
import { useTeamData } from "@/lib/hooks/useTeamData";
import { createClient } from "@/lib/supabase/client";
import { staffRoles, StaffRole, TaskProposal } from "@/lib/ai/staff";

type Message = {
  role: "user" | "assistant";
  content: string;
  source?: string;
  proposal?: TaskProposal | null;
  saved?: boolean;
};
interface Task {
  id: string;
  title: string;
  status: string;
  assignee: string;
}
interface TeamEvent {
  id: string;
  title: string;
  date: string;
  time: string;
}
const roleIcons = {
  manager: ClipboardList,
  scout: Search,
  coach: Target,
  analyst: Sparkles,
  psychologist: HeartHandshake,
};
const initialChats = () =>
  Object.fromEntries(
    staffRoles.map((role) => [
      role.id,
      [{ role: "assistant", content: role.greeting }],
    ]),
  ) as Record<StaffRole, Message[]>;

export default function AIPage() {
  const { items: tasks, teamId, error } = useTeamData<Task>("tasks");
  const { items: events } = useTeamData<TeamEvent>("events");
  const [activeRole, setActiveRole] = useState<StaffRole>("manager");
  const [chats, setChats] = useState(initialChats);
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const [includeTeamData, setIncludeTeamData] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [adviceDraft, setAdviceDraft] = useState<PlaybookEntry | null>(null);
  const [proposal, setProposal] = useState<{
    index: number;
    value: TaskProposal;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const proposalRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (proposal) {
      proposalRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      proposalRef.current
        ?.querySelector("input")
        ?.focus({ preventScroll: true });
    }
  }, [proposal]);
  const requestRef = useRef<AbortController | null>(null);
  const selected = staffRoles.find((role) => role.id === activeRole)!;
  const Icon = roleIcons[activeRole];
  const messages = chats[activeRole];
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);
  useEffect(
    () => () => {
      requestRef.current?.abort();
    },
    [],
  );
  function switchRole(role: StaffRole) {
    setActiveRole(role);
    setInput("");
    setCopied(false);
    setProposal(null);
    setActionError("");
  }
  async function send(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const role = activeRole;
    const next: Message[] = [
      ...chats[role],
      { role: "user", content: input.trim() },
    ];
    setChats((prev) => ({ ...prev, [role]: next }));
    setInput("");
    setBusy(true);
    setCopied(false);
    const controller = new AbortController();
    requestRef.current = controller;
    const shared = [
      context,
      includeTeamData
        ? JSON.stringify({
            tasks: tasks
              .slice(0, 5)
              .map((t) => ({ title: t.title.slice(0, 100), status: t.status })),
            events: events.slice(0, 5).map((e) => ({
              title: e.title.slice(0, 100),
              date: e.date,
              time: e.time,
            })),
          })
        : "",
    ]
      .filter(Boolean)
      .join("\n")
      .slice(0, 3000);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          context: shared,
          messages: next
            .slice(-20)
            .map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== "string")
        throw new Error(
          data.error || "Не удалось получить ответ. Попробуйте ещё раз.",
        );
      setChats((prev) => ({
        ...prev,
        [role]: [
          ...prev[role],
          {
            role: "assistant",
            content: data.reply,
            source: data.source,
            proposal: data.proposal,
          },
        ],
      }));
    } catch (error) {
      if (!controller.signal.aborted)
        setChats((prev) => ({
          ...prev,
          [role]: [
            ...prev[role],
            {
              role: "assistant",
              content:
                error instanceof Error
                  ? error.message
                  : "Не удалось связаться с помощником.",
            },
          ],
        }));
    } finally {
      setBusy(false);
    }
  }
  async function saveTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!teamId || !proposal || saving) return;
    const fields = new FormData(e.currentTarget);
    const title = String(fields.get("title") || "").trim();
    if (!title) return;
    setSaving(true);
    setActionError("");
    try {
      const { error } = await createClient()
        .from("tasks")
        .insert({
          team_id: teamId,
          title,
          assignee:
            String(fields.get("assignee") || "").trim() || "Не назначен",
          deadline: fields.get("deadline") || "Без срока",
          status: "todo",
        });
      if (error) throw error;
      setChats((prev) => ({
        ...prev,
        [activeRole]: prev[activeRole].map((m, i) =>
          i === proposal.index ? { ...m, saved: true } : m,
        ),
      }));
      setProposal(null);
      setAnnouncement("Задача сохранена на доску команды.");
    } catch {
      setActionError(
        "Не удалось сохранить задачу. Предложение осталось в диалоге — попробуйте снова.",
      );
    } finally {
      setSaving(false);
    }
  }
  function reviewForPlaybook(index: number) {
    const answer = messages[index];
    if (answer.content.length > 6000) {
      setAnnouncement(
        "Ответ длиннее лимита заметки. Попросите специалиста сократить его перед сохранением.",
      );
      return;
    }
    const question =
      messages
        .slice(0, index)
        .reverse()
        .find((message) => message.role === "user")?.content || "Идея команды";
    setAdviceDraft({
      ...blankEntry(),
      title: `${selected.title} · ${question}`.slice(0, 120),
      kind: activeRole === "analyst" ? "tip" : "strategy",
      summary:
        answer.source === "fallback"
          ? "Справочный шаблон. Уточните карту и проверьте идею на тренировке."
          : "Идея ИИ. Уточните карту, роли и проверьте план на тренировке.",
      notes: answer.content,
    });
  }
  async function saveAdvice(entry: PlaybookEntry) {
    const validated = parseEntry({
      ...entry,
      updatedAt: new Date().toISOString(),
    });
    if (!validated) throw new Error("Не удалось проверить запись плейбука.");
    persistLocal([validated, ...localSnapshot()]);
    setAdviceDraft(null);
    setAnnouncement("Идея сохранена в локальный плейбук на этом устройстве.");
  }
  async function copyReply() {
    try {
      await navigator.clipboard.writeText(
        [...messages].reverse().find((m) => m.role === "assistant")?.content ||
          "",
      );
      setCopied(true);
    } catch {
      setAnnouncement(
        "Браузер не разрешил копирование. Выделите текст ответа вручную.",
      );
    }
  }
  const completed = tasks.filter((t) => t.status === "done").length;
  return (
    <div className="workspace">
      <Sidebar />
      <main className="workspace-main">
        <Header
          title="Ваш ИИ-штаб"
          subtitle="Пять специалистов. Одна команда. Общая цель."
        >
          <button
            className="secondary-button"
            disabled={busy || saving}
            onClick={() => {
              setChats((prev) => ({
                ...prev,
                [activeRole]: initialChats()[activeRole],
              }));
              setProposal(null);
              setInput("");
            }}
          >
            <RefreshCw size={15} />
            Новый диалог
          </button>
        </Header>
        <div className="workspace-content">
          <Notice message={error} />
          <p className="staff-intro">
            Выберите специалиста под свою задачу. Диалоги раздельные, а общий
            контекст задаёте вы.
          </p>
          <div
            className="staff-roles"
            role="group"
            aria-label="Специалисты ИИ-штаба"
          >
            {staffRoles.map((role) => {
              const RoleIcon = roleIcons[role.id];
              return (
                <button
                  key={role.id}
                  className={`staff-role ${activeRole === role.id ? "selected" : ""}`}
                  aria-pressed={activeRole === role.id}
                  disabled={busy || saving}
                  onClick={() => switchRole(role.id)}
                >
                  <RoleIcon size={22} />
                  <strong>{role.title}</strong>
                  <span>{role.short}</span>
                </button>
              );
            })}
          </div>
          <div className="ai-layout">
            <section className="panel ai-chat">
              <div className="chat-heading">
                <span>
                  <Icon size={19} />
                  {selected.title}
                </span>
                <span className="chat-status">
                  {busy ? "Готовим ответ…" : "Готов помочь"}
                </span>
              </div>
              <p className="staff-description">{selected.description}</p>
              {activeRole === "psychologist" && (
                <p className="staff-boundary">
                  <ShieldCheck size={16} />
                  ИИ поддерживает общение и подготовку к игре. Он не заменяет
                  квалифицированного психолога и экстренную помощь.
                </p>
              )}
              <div
                className="chat-messages"
                role="log"
                aria-label={`Диалог: ${selected.title}`}
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
                          Справочный шаблон · живая ИИ-модель не подключена или
                          недоступна
                        </small>
                      )}
                      {index > 0 &&
                        message.role === "assistant" &&
                        message.source &&
                        ["coach", "analyst"].includes(activeRole) && (
                          <button
                            className="secondary-button staff-to-playbook"
                            onClick={() => reviewForPlaybook(index)}
                          >
                            Проверить и добавить в плейбук
                          </button>
                        )}
                      {message.proposal && (
                        <div className="staff-proposal">
                          <span className="eyebrow">
                            {message.saved
                              ? "ЗАДАЧА СОХРАНЕНА"
                              : "ПРЕДЛОЖЕНИЕ · ЕЩЁ НЕ СОХРАНЕНО"}
                          </span>
                          <h3>{message.proposal.title}</h3>
                          {message.saved ? (
                            <Link className="panel-link" href="/tasks">
                              <Check size={14} />
                              Сохранено — открыть задачи
                            </Link>
                          ) : (
                            <button
                              className="secondary-button"
                              disabled={busy || saving}
                              onClick={() => {
                                setProposal({
                                  index,
                                  value: message.proposal!,
                                });
                                setActionError("");
                              }}
                            >
                              <Plus size={15} />
                              Проверить и создать задачу
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {messages.length === 1 && (
                  <div className="starter-plan">
                    <span className="eyebrow">ПОПРОБУЙТЕ СПРОСИТЬ</span>
                    <h2>{selected.short}</h2>
                    {selected.suggestions.map((q) => (
                      <button key={q} onClick={() => setInput(q)}>
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
                    {selected.title} готовит ответ
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
                  <span>Изменения — после подтверждения</span>
                </div>
                <form onSubmit={send}>
                  <label className="sr-only" htmlFor="staff-message">
                    Сообщение специалисту
                  </label>
                  <input
                    id="staff-message"
                    placeholder={`Вопрос: ${selected.title.toLowerCase()}`}
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
                  В запрос попадают сообщения этого диалога и указанный вами
                  контекст. Другие диалоги не передаются.
                </small>
              </div>
            </section>
            <aside className="ai-aside">
              <section className="panel">
                <div className="panel-title">
                  <h2>Общий контекст</h2>
                  <Users size={18} />
                </div>
                <label className="staff-context-label" htmlFor="staff-context">
                  Цели, роли, карта и доступное время
                </label>
                <textarea
                  id="staff-context"
                  className="staff-context"
                  maxLength={1200}
                  rows={6}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="CS2, Mirage. Играем вт/чт с 19:00. Цель — улучшить размены."
                />
                <small className="staff-context-note">
                  Используется при следующем запросе к любому специалисту.
                  Хранится только на этой странице до обновления.
                </small>
                <label className="staff-share">
                  <input
                    type="checkbox"
                    checked={includeTeamData}
                    disabled={!teamId}
                    onChange={(e) => setIncludeTeamData(e.target.checked)}
                  />
                  Добавить в запрос до 5 задач и событий команды
                </label>
                <p className="staff-context-note">
                  Не добавляйте в общий контекст личные переживания других
                  игроков без их согласия.
                </p>
              </section>
              <section className="panel">
                <div className="panel-title">
                  <h2>Работа команды</h2>
                  <CalendarDays size={18} />
                </div>
                <div className="staff-task-summary">
                  <strong>
                    {completed} / {tasks.length}
                  </strong>
                  <span>задач выполнено</span>
                </div>
                <Link href="/tasks" className="panel-link">
                  Доска задач
                  <ArrowUpRight size={15} />
                </Link>
                <Link href="/calendar" className="panel-link">
                  Календарь
                  <ArrowUpRight size={15} />
                </Link>
              </section>
              <section className="panel staff-capabilities">
                <h2>Что уже можно</h2>
                <p>
                  Раздельные консультации, общий контекст, предложения задач с
                  подтверждением.
                </p>
                <h2>Что ещё разрабатывается</h2>
                <p>
                  Авторазбор демок, внешняя база игроков, актуальный поиск
                  турниров и действия с календарём.
                </p>
                <p className="staff-context-note">
                  Если модель недоступна, показывается справочный шаблон.
                  Подключение модели настраивается администратором.
                </p>
              </section>
            </aside>
          </div>
          <Link href="/playbook" className="panel-link">
            Открыть плейбук команды
            <ArrowUpRight size={15} />
          </Link>
          {adviceDraft && (
            <EntryEditor
              entry={adviceDraft}
              onClose={() => setAdviceDraft(null)}
              onSave={saveAdvice}
            />
          )}
          <p className="staff-announcement" role="status">
            {announcement}
          </p>
          {proposal && (
            <section
              ref={proposalRef}
              className="panel staff-task-form"
              aria-labelledby="proposal-title"
            >
              <div className="panel-title">
                <h2 id="proposal-title">Проверьте задачу перед сохранением</h2>
                <button
                  className="secondary-button"
                  disabled={saving}
                  onClick={() => setProposal(null)}
                >
                  Закрыть
                </button>
              </div>
              <form onSubmit={saveTask}>
                <label>
                  Название
                  <input
                    name="title"
                    maxLength={200}
                    required
                    defaultValue={proposal.value.title}
                  />
                </label>
                <label>
                  Исполнитель
                  <input
                    name="assignee"
                    maxLength={100}
                    defaultValue={proposal.value.assignee}
                    placeholder="Не назначен"
                  />
                </label>
                <label>
                  Срок
                  <input
                    type="date"
                    name="deadline"
                    defaultValue={proposal.value.deadline}
                  />
                </label>
                <Notice
                  message={
                    actionError ||
                    (!teamId
                      ? "Для сохранения подключите Supabase и создайте команду."
                      : "")
                  }
                />
                <button className="primary-button" disabled={!teamId || saving}>
                  {saving ? "Сохраняем…" : "Подтвердить и сохранить"}
                </button>
              </form>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
