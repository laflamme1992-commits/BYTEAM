"use client";

import { FormEvent, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Filter,
  Clock,
  MapPin,
  Users,
  Trash2,
} from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { Header } from "@/components/workspace/Header";
import { ModalBackdrop } from "@/components/workspace/ModalBackdrop";
import { Notice } from "@/components/workspace/Notice";
import { useTeamData } from "@/lib/hooks/useTeamData";
import { createClient } from "@/lib/supabase/client";

type EventType = "training" | "match" | "tournament" | "meeting";
interface TeamEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  participants: string;
  team_id: string;
}
const types: Record<EventType, { label: string; color: string }> = {
  training: { label: "Тренировка", color: "blue" },
  match: { label: "Матч", color: "green" },
  tournament: { label: "Турнир", color: "purple" },
  meeting: { label: "Встреча", color: "amber" },
};
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export default function CalendarPage() {
  const {
    items: events,
    setItems: setEvents,
    teamId,
    loading,
    error,
    setError,
    reload,
  } = useTeamData<TeamEvent>("events");
  const [cursor, setCursor] = useState(() => new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [enabled, setEnabled] = useState<EventType[]>(
    Object.keys(types) as EventType[],
  );
  const [formDate, setFormDate] = useState<string | null>(null);
  const [selected, setSelected] = useState<TeamEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const today = dateKey(new Date());
  const anchor =
    view === "month"
      ? new Date(cursor.getFullYear(), cursor.getMonth(), 1)
      : new Date(cursor);
  const first = new Date(anchor);
  first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const days = Array.from({ length: view === "month" ? 42 : 7 }, (_, i) => {
    const d = new Date(first);
    d.setDate(d.getDate() + i);
    return d;
  });
  const visibleEvents = events.filter((e) => enabled.includes(e.type));
  const upcoming = [...visibleEvents]
    .filter((e) => e.date >= today && /^\d{4}-\d{2}-\d{2}$/.test(e.date))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 4);
  // Only compare concrete participant names at the exact same scheduled time.
  const conflicts = events.flatMap((a, i) =>
    events
      .slice(i + 1)
      .filter(
        (b) =>
          a.date === b.date &&
          /^\d{4}-\d{2}-\d{2}$/.test(a.date) &&
          /^\d{2}:\d{2}$/.test(a.time) &&
          a.time === b.time &&
          a.participants &&
          a.participants !== "—" &&
          a.participants.split(",").some(
            (p) =>
              p.trim() &&
              b.participants
                .toLowerCase()
                .split(",")
                .map((n) => n.trim())
                .includes(p.trim().toLowerCase()),
          ),
      )
      .map((b) => ({ a, b })),
  );
  function navigate(direction: number) {
    const next = new Date(cursor);
    if (view === "month") {
      next.setDate(1);
      next.setMonth(next.getMonth() + direction);
    } else next.setDate(next.getDate() + direction * 7);
    setCursor(next);
  }
  async function addEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!teamId || busy) return;
    const fields = new FormData(e.currentTarget);
    const title = String(fields.get("title") || "").trim();
    if (!title) return;
    setBusy(true);
    try {
      const { data, error } = await createClient()
        .from("events")
        .insert({
          team_id: teamId,
          title,
          type: fields.get("type"),
          date: fields.get("date"),
          time: fields.get("time") || "—",
          location: String(fields.get("location") || "").trim() || "—",
          participants: String(fields.get("participants") || "").trim() || "—",
        })
        .select()
        .single();
      if (error) throw error;
      setEvents((prev) => [...prev, data]);
      setCursor(new Date(data.date + "T12:00:00"));
      setFormDate(null);
      setError("");
    } catch {
      setError("Не удалось сохранить событие. Попробуйте снова.");
    } finally {
      setBusy(false);
    }
  }
  async function deleteEvent() {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const { error } = await createClient()
        .from("events")
        .delete()
        .eq("id", selected.id)
        .eq("team_id", teamId!);
      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== selected.id));
      setSelected(null);
      setConfirmDelete(false);
      setError("");
    } catch {
      setError("Не удалось удалить событие.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="workspace">
      <Sidebar />
      <main className="workspace-main">
        <Header
          title="Календарь"
          subtitle="Планируйте вместе. Побеждайте командой."
        >
          <div className="segmented">
            <button
              aria-pressed={view === "week"}
              onClick={() => setView("week")}
            >
              Неделя
            </button>
            <button
              aria-pressed={view === "month"}
              onClick={() => setView("month")}
            >
              Месяц
            </button>
          </div>
          <button
            className="primary-button"
            disabled={!teamId}
            onClick={() => setFormDate(today)}
          >
            <Plus size={18} />
            Новое событие
          </button>
        </Header>
        <div className="workspace-content">
          <Notice message={error} retry={reload} />
          <div className="calendar-layout">
            <section className="calendar-section">
              <div className="calendar-heading">
                <h2>
                  <CalendarDays size={21} />
                  {cursor.toLocaleDateString("ru-RU", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <div className="calendar-navigation">
                  <button
                    className="secondary-button"
                    onClick={() => setCursor(new Date())}
                  >
                    Сегодня
                  </button>
                  <div className="segmented">
                    <button
                      aria-label="Предыдущий период"
                      onClick={() => navigate(-1)}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      aria-label="Следующий период"
                      onClick={() => navigate(1)}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="empty-state">Загружаем расписание…</div>
              ) : (
                <div className="calendar-scroll">
                  <div
                    className={`calendar-grid ${view === "week" ? "week-view" : ""}`}
                  >
                    <div className="calendar-weekdays">
                      {["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"].map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>
                    <div className="calendar-days">
                      {days.map((day) => {
                        const key = dateKey(day);
                        const dayEvents = visibleEvents
                          .filter((e) => e.date === key)
                          .sort((a, b) => a.time.localeCompare(b.time));
                        return (
                          <div
                            key={key}
                            className={`calendar-day ${day.getMonth() !== cursor.getMonth() ? "outside" : ""} ${key === today ? "today" : ""}`}
                          >
                            <button
                              disabled={!teamId}
                              className="day-number"
                              aria-label={`Добавить событие: ${day.toLocaleDateString("ru-RU")}`}
                              onClick={() => setFormDate(key)}
                            >
                              {day.getDate()}
                            </button>
                            {dayEvents.map((event) => (
                              <button
                                className={`calendar-event ${types[event.type]?.color || "blue"}`}
                                key={event.id}
                                onClick={() => {
                                  setSelected(event);
                                  setConfirmDelete(false);
                                }}
                              >
                                <strong>{event.title}</strong>
                                <span>
                                  {event.time === "—"
                                    ? "Весь день"
                                    : event.time}
                                </span>
                                <small>
                                  {types[event.type]?.label || event.type}
                                </small>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              <div className="calendar-filters">
                <span>
                  <Filter size={16} />
                  Типы событий
                </span>
                {(Object.keys(types) as EventType[]).map((type) => (
                  <button
                    aria-pressed={enabled.includes(type)}
                    className={`filter-chip ${types[type].color}`}
                    key={type}
                    onClick={() =>
                      setEnabled((prev) =>
                        prev.includes(type)
                          ? prev.filter((t) => t !== type)
                          : [...prev, type],
                      )
                    }
                  >
                    <i />
                    {types[type].label}
                    {enabled.includes(type) && <X size={12} />}
                  </button>
                ))}
                <button
                  className="filter-reset"
                  onClick={() => setEnabled(Object.keys(types) as EventType[])}
                >
                  Показать все
                </button>
              </div>
              {events.some((e) => !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) && (
                <section className="panel legacy-events">
                  <h3>События без точной даты</h3>
                  <p>
                    Ранее даты были сохранены текстом. Эти события остаются
                    доступны здесь.
                  </p>
                  {events
                    .filter((e) => !/^\d{4}-\d{2}-\d{2}$/.test(e.date))
                    .map((e) => (
                      <button
                        className="upcoming-event"
                        key={e.id}
                        onClick={() => {
                          setSelected(e);
                          setConfirmDelete(false);
                        }}
                      >
                        <strong>{e.title}</strong>
                        <span>{e.date}</span>
                      </button>
                    ))}
                </section>
              )}
            </section>
            <aside className="calendar-aside">
              <section className="panel">
                <div className="panel-title">
                  <h2>Ближайшие события</h2>
                  <span className="tag blue">{upcoming.length}</span>
                </div>
                {upcoming.length ? (
                  upcoming.map((e) => (
                    <button
                      className="upcoming-event"
                      key={e.id}
                      onClick={() => {
                        setSelected(e);
                        setConfirmDelete(false);
                      }}
                    >
                      <i
                        className={`event-dot ${types[e.type]?.color || "blue"}`}
                      />
                      <div>
                        <strong>{e.title}</strong>
                        <small>
                          {new Date(e.date + "T12:00:00").toLocaleDateString(
                            "ru-RU",
                            { day: "numeric", month: "long" },
                          )}{" "}
                          · {e.time === "—" ? "Весь день" : e.time}
                        </small>
                      </div>
                      <ChevronRight size={15} />
                    </button>
                  ))
                ) : (
                  <div className="aside-empty">
                    <CalendarDays size={28} />
                    <p>
                      {teamId ? "Пока всё свободно" : "Расписание недоступно"}
                    </p>
                    <small>
                      Добавьте тренировку или матч, чтобы команда знала план.
                    </small>
                  </div>
                )}
              </section>
              <section className="panel">
                <div className="panel-title">
                  <h2>Совпадения в расписании</h2>
                  <Users size={18} />
                </div>
                <p className="muted-text">
                  Проверяем совпадение даты, времени начала и участников.
                </p>
                {conflicts.length ? (
                  conflicts.map(({ a, b }) => (
                    <div className="conflict-card" key={`${a.id}-${b.id}`}>
                      <span className="tag amber">Нужно проверить</span>
                      <h3>
                        {a.title} / {b.title}
                      </h3>
                      <p>
                        {a.date} · {a.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="availability-state">
                    <span>✓</span>
                    <p>
                      {teamId
                        ? "Совпадений не найдено"
                        : "Нет данных для проверки"}
                      <small>
                        Доступность игроков и длительность событий пока не
                        учитываются.
                      </small>
                    </p>
                  </div>
                )}
              </section>
              <div className="calendar-tip">
                <span className="eyebrow">СОВЕТ КАПИТАНУ</span>
                <p>Оставляйте время на разбор.</p>
                <small>
                  Короткая встреча после тренировки поможет закрепить результат.
                </small>
              </div>
            </aside>
          </div>
        </div>
        {formDate !== null && (
          <ModalBackdrop onClose={() => setFormDate(null)}>
            <section
              className="workspace-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-title"
            >
              <div className="modal-heading">
                <h2 id="event-title">Новое событие</h2>
                <button
                  className="icon-button"
                  aria-label="Закрыть"
                  onClick={() => setFormDate(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={addEvent}>
                <label>
                  Название
                  <input
                    autoFocus
                    name="title"
                    required
                    maxLength={200}
                    placeholder="Командная тренировка на Mirage"
                  />
                </label>
                <div className="form-grid">
                  <label>
                    Тип
                    <select name="type">
                      {Object.entries(types).map(([key, t]) => (
                        <option value={key} key={key}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Дата
                    <input
                      type="date"
                      name="date"
                      required
                      defaultValue={formDate}
                    />
                  </label>
                </div>
                <label>
                  Время начала
                  <input type="time" name="time" />
                </label>
                <label>
                  Место
                  <input
                    name="location"
                    placeholder="Сервер или ссылка на встречу"
                  />
                </label>
                <label>
                  Участники
                  <input
                    name="participants"
                    placeholder="Никнеймы через запятую"
                  />
                </label>
                <Notice message={error} />
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setFormDate(null)}
                  >
                    Отмена
                  </button>
                  <button disabled={busy} className="primary-button">
                    {busy ? "Сохраняем…" : "Создать событие"}
                  </button>
                </div>
              </form>
            </section>
          </ModalBackdrop>
        )}
        {selected && (
          <ModalBackdrop onClose={() => setSelected(null)}>
            <section
              className="workspace-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-detail-title"
            >
              <div className="modal-heading">
                <span
                  className={`tag ${types[selected.type]?.color || "blue"}`}
                >
                  {types[selected.type]?.label || selected.type}
                </span>
                <button
                  className="icon-button"
                  aria-label="Закрыть"
                  onClick={() => setSelected(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <h2 id="event-detail-title">{selected.title}</h2>
              <div className="event-details">
                <p>
                  <CalendarDays size={18} />
                  {/^\d{4}-\d{2}-\d{2}$/.test(selected.date)
                    ? new Date(selected.date + "T12:00:00").toLocaleDateString(
                        "ru-RU",
                        { day: "numeric", month: "long", year: "numeric" },
                      )
                    : selected.date}
                </p>
                <p>
                  <Clock size={18} />
                  {selected.time === "—" ? "Весь день" : selected.time}
                </p>
                <p>
                  <MapPin size={18} />
                  {selected.location}
                </p>
                <p>
                  <Users size={18} />
                  {selected.participants}
                </p>
              </div>
              <Notice message={error} />
              <div className="modal-actions">
                {confirmDelete ? (
                  <>
                    <span>Удалить безвозвратно?</span>
                    <button
                      className="secondary-button"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Отмена
                    </button>
                    <button
                      className="primary-button"
                      disabled={busy}
                      onClick={deleteEvent}
                    >
                      Удалить
                    </button>
                  </>
                ) : (
                  <button
                    className="secondary-button danger"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={16} />
                    Удалить событие
                  </button>
                )}
              </div>
            </section>
          </ModalBackdrop>
        )}
      </main>
    </div>
  );
}
