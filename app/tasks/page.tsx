"use client";

import { FormEvent, useState } from "react";
import {
  Plus,
  Search,
  CalendarDays,
  UserRound,
  ArrowRight,
  Trash2,
  List,
  Columns3,
  CheckCheck,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { Header } from "@/components/workspace/Header";
import { ModalBackdrop } from "@/components/workspace/ModalBackdrop";
import { Notice } from "@/components/workspace/Notice";
import { useTeamData } from "@/lib/hooks/useTeamData";
import { createClient } from "@/lib/supabase/client";

type Status = "todo" | "in_progress" | "done";
interface Task {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  status: Status;
  team_id: string;
}
const columns: { id: Status; label: string; color: string }[] = [
  { id: "todo", label: "Нужно сделать", color: "blue" },
  { id: "in_progress", label: "В работе", color: "purple" },
  { id: "done", label: "Готово", color: "green" },
];
function deadlineLabel(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(value + "T12:00:00").toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      })
    : value;
}
export default function TasksPage() {
  const {
    items: tasks,
    setItems: setTasks,
    teamId,
    loading,
    error,
    setError,
    reload,
  } = useTeamData<Task>("tasks");
  const [formStatus, setFormStatus] = useState<Status | null>(null);
  const [search, setSearch] = useState("");
  const [assignee, setAssignee] = useState("");
  const [sort, setSort] = useState("default");
  const [view, setView] = useState("board");
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const visible = tasks
    .filter(
      (t) =>
        `${t.title} ${t.assignee}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (!assignee || t.assignee === assignee),
    )
    .sort((a, b) =>
      sort === "deadline"
        ? (a.deadline || "9999").localeCompare(b.deadline || "9999")
        : 0,
    );
  async function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!teamId || busy) return;
    const fields = new FormData(e.currentTarget);
    const title = String(fields.get("title") || "").trim();
    if (!title) return;
    setBusy(true);
    try {
      const { data, error } = await createClient()
        .from("tasks")
        .insert({
          title,
          team_id: teamId,
          assignee:
            String(fields.get("assignee") || "").trim() || "Не назначен",
          deadline: fields.get("deadline") || "Без срока",
          status: formStatus,
        })
        .select()
        .single();
      if (error) throw error;
      setTasks((prev) => [data, ...prev]);
      setFormStatus(null);
      setError("");
    } catch {
      setError("Не удалось сохранить задачу. Попробуйте снова.");
    } finally {
      setBusy(false);
    }
  }
  async function updateTask(id: string, status: Status) {
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await createClient()
        .from("tasks")
        .update({ status })
        .eq("id", id)
        .eq("team_id", teamId!);
      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      setError("");
    } catch {
      setError("Не удалось изменить статус задачи.");
    } finally {
      setBusy(false);
    }
  }
  async function deleteTask(id: string) {
    setBusy(true);
    try {
      const { error } = await createClient()
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("team_id", teamId!);
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setPendingDelete(null);
      setError("");
    } catch {
      setError("Не удалось удалить задачу.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="workspace">
      <Sidebar />
      <main className="workspace-main">
        <Header
          title="Задачи"
          subtitle="Меньше хаоса. Больше командной работы."
        >
          <button
            className="primary-button purple-button"
            disabled={!teamId}
            onClick={() => setFormStatus("todo")}
          >
            <Plus size={18} />
            Создать задачу
          </button>
        </Header>
        <div className="workspace-content">
          <Notice message={error} retry={reload} />
          <div className="workspace-toolbar">
            <div className="section-tab">
              <CheckCheck size={18} />
              Командные задачи <span>{tasks.length}</span>
            </div>
            <div className="toolbar-controls">
              <label className="search-field">
                <Search size={17} />
                <input
                  aria-label="Поиск задач"
                  placeholder="Найти задачу…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <select
                aria-label="Исполнитель"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Все исполнители</option>
                {[...new Set(tasks.map((t) => t.assignee))].map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
              <select
                aria-label="Порядок задач"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="default">По добавлению</option>
                <option value="deadline">По сроку</option>
              </select>
              <div className="segmented">
                <button
                  aria-label="Доска"
                  aria-pressed={view === "board"}
                  onClick={() => setView("board")}
                >
                  <Columns3 size={18} />
                </button>
                <button
                  aria-label="Список"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="empty-state">Загружаем задачи…</div>
          ) : (
            <div className={`task-board ${view === "list" ? "list-view" : ""}`}>
              {columns.map((column) => {
                const entries = visible.filter((t) => t.status === column.id);
                return (
                  <section
                    className={`task-column ${column.color}`}
                    key={column.id}
                  >
                    <div className="column-heading">
                      <h2>
                        <i />
                        {column.label}
                        <span>{entries.length}</span>
                      </h2>
                      <span className="column-dots" aria-hidden="true">
                        •••
                      </span>
                    </div>
                    <div className="task-stack">
                      {entries.map((task) => (
                        <article className="task-card" key={task.id}>
                          <div className="task-card-top">
                            <span className={`tag ${column.color}`}>
                              {column.id === "done" ? "Выполнено" : "Команда"}
                            </span>
                            <button
                              className="icon-button danger"
                              aria-label={`Удалить задачу ${task.title}`}
                              onClick={() => setPendingDelete(task.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <h3>{task.title}</h3>
                          <p className="task-description">
                            {column.id === "done"
                              ? "Задача завершена. Отличная работа!"
                              : column.id === "in_progress"
                                ? "В фокусе команды прямо сейчас."
                                : "Готова к работе — начните, когда будете готовы."}
                          </p>
                          <div className="task-meta">
                            <span>
                              <span className="mini-avatar">
                                <UserRound size={14} />
                              </span>
                              {task.assignee}
                            </span>
                            <span
                              className={
                                /^\d{4}-/.test(task.deadline) &&
                                task.deadline <
                                  new Date().toLocaleDateString("sv-SE") &&
                                task.status !== "done"
                                  ? "overdue"
                                  : ""
                              }
                            >
                              <CalendarDays size={14} />
                              {deadlineLabel(task.deadline)}
                            </span>
                          </div>
                          <button
                            disabled={busy}
                            className="task-next"
                            onClick={() =>
                              updateTask(
                                task.id,
                                column.id === "todo"
                                  ? "in_progress"
                                  : column.id === "in_progress"
                                    ? "done"
                                    : "in_progress",
                              )
                            }
                          >
                            {column.id === "todo"
                              ? "Начать работу"
                              : column.id === "in_progress"
                                ? "Завершить"
                                : "Вернуть в работу"}
                            <ArrowRight size={14} />
                          </button>
                        </article>
                      ))}
                      {!entries.length && (
                        <div className="column-empty">
                          <CheckCheck size={25} />
                          <p>
                            {search || assignee
                              ? "Ничего не найдено"
                              : "Здесь пока нет задач"}
                          </p>
                          <small>
                            {search || assignee
                              ? "Попробуйте изменить фильтры"
                              : "Большие победы начинаются с маленьких шагов"}
                          </small>
                        </div>
                      )}
                    </div>
                    <button
                      className="add-task"
                      disabled={!teamId}
                      onClick={() => setFormStatus(column.id)}
                    >
                      <Plus size={17} />
                      Добавить задачу
                    </button>
                  </section>
                );
              })}
            </div>
          )}
          <p className="workspace-footnote">
            Всё важное — на одной доске. У каждой задачи есть свой следующий
            шаг.
          </p>
        </div>
        {formStatus && (
          <ModalBackdrop onClose={() => setFormStatus(null)}>
            <section
              className="workspace-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-form-title"
            >
              <div className="modal-heading">
                <h2 id="task-form-title">Новая задача</h2>
                <button
                  aria-label="Закрыть"
                  className="icon-button"
                  onClick={() => setFormStatus(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={addTask}>
                <label>
                  Название
                  <input
                    name="title"
                    required
                    maxLength={200}
                    autoFocus
                    placeholder="Например, разобрать демо на Mirage"
                  />
                </label>
                <label>
                  Исполнитель
                  <input name="assignee" placeholder="Никнейм игрока" />
                </label>
                <label>
                  Срок выполнения
                  <input type="date" name="deadline" />
                </label>
                <label>
                  Статус
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Status)}
                  >
                    {columns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Notice message={error} />
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setFormStatus(null)}
                  >
                    Отмена
                  </button>
                  <button
                    disabled={busy}
                    className="primary-button purple-button"
                  >
                    {busy ? "Сохраняем…" : "Создать задачу"}
                  </button>
                </div>
              </form>
            </section>
          </ModalBackdrop>
        )}
        {pendingDelete && (
          <ModalBackdrop onClose={() => setPendingDelete(null)}>
            <section
              className="workspace-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-title"
            >
              <h2 id="delete-title">Удалить задачу?</h2>
              <p>Восстановить её после удаления не получится.</p>
              <div className="modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setPendingDelete(null)}
                >
                  Отмена
                </button>
                <button
                  disabled={busy}
                  className="primary-button"
                  onClick={() => deleteTask(pendingDelete)}
                >
                  Удалить
                </button>
              </div>
            </section>
          </ModalBackdrop>
        )}
      </main>
    </div>
  );
}
