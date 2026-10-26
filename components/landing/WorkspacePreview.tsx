"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MoreHorizontal,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { BrandMark } from "@/components/ui/BrandMark";

const tabs = [
  { id: "calendar", label: "Календарь", icon: CalendarDays },
  { id: "tasks", label: "Задачи", icon: CheckSquare },
  { id: "ai", label: "ИИ-штаб", icon: Sparkles },
] as const;
type Tab = (typeof tabs)[number]["id"];

export function WorkspacePreview() {
  const [tab, setTab] = useState<Tab>("calendar");
  return (
    <div className="landing-preview-wrap">
      <div className="preview-caption">
        <span>
          <i />
          ПРИМЕР РАБОЧЕГО ПРОСТРАНСТВА
        </span>
        <span>
          ВСЁ ПОД КОНТРОЛЕМ <ArrowUpRight size={10} />
        </span>
      </div>
      <div className="product-preview">
        <div className="preview-chrome">
          <div className="window-dots">
            <i />
            <i />
            <i />
          </div>
          <span>byteam / моя команда</span>
          <span className="preview-workspace-icon">
            <Target size={13} />
          </span>
        </div>
        <div className="preview-body">
          <aside className="preview-sidebar" aria-hidden="true">
            <BrandMark className="preview-mini-brand" size={25} />
            <LayoutDashboard size={17} />
            <Users size={17} />
            <CalendarDays
              size={17}
              className={tab === "calendar" ? "selected" : ""}
            />
            <CheckSquare
              size={17}
              className={tab === "tasks" ? "selected" : ""}
            />
            <Sparkles size={17} className={tab === "ai" ? "selected" : ""} />
            <span className="preview-mini-avatar">К</span>
          </aside>
          <div className="preview-main">
            <div className="preview-page-heading">
              <div>
                <span className="preview-eyebrow">ПРОСТРАНСТВО КОМАНДЫ</span>
                <h2>{tabs.find((t) => t.id === tab)?.label}</h2>
              </div>
              <span className="preview-team-badge">
                <Users size={12} />
                Моя команда
              </span>
            </div>
            <div
              className="preview-tabs"
              role="tablist"
              aria-label="Пример интерфейса"
            >
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  role="tab"
                  id={`preview-tab-${id}`}
                  aria-controls={`preview-panel-${id}`}
                  aria-selected={tab === id}
                  tabIndex={tab === id ? 0 : -1}
                  onKeyDown={(event) => {
                    const current = tabs.findIndex((t) => t.id === id);
                    const target =
                      event.key === "ArrowRight"
                        ? (current + 1) % tabs.length
                        : event.key === "ArrowLeft"
                          ? (current + tabs.length - 1) % tabs.length
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? tabs.length - 1
                              : -1;
                    if (target < 0) return;
                    event.preventDefault();
                    setTab(tabs[target].id);
                    event.currentTarget.parentElement
                      ?.querySelectorAll<HTMLButtonElement>("button")
                      [target]?.focus();
                  }}
                  key={id}
                  onClick={() => setTab(id)}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
            <div
              className="preview-panel"
              role="tabpanel"
              id={`preview-panel-${tab}`}
              aria-labelledby={`preview-tab-${tab}`}
              tabIndex={0}
            >
              {tab === "calendar" && (
                <>
                  <div className="preview-calendar-title">
                    <strong>План на неделю</strong>
                    <span>
                      <ChevronLeft size={13} />
                      <ChevronRight size={13} />
                    </span>
                  </div>
                  <div className="preview-calendar">
                    <div className="preview-day">
                      <span>
                        ПН <b>21</b>
                      </span>
                      <div className="preview-event mint">
                        <small>18:00 — 19:30</small>
                        <strong>Командная тренировка</strong>
                        <span>Mirage · Разбор выходов</span>
                        <i>ТРЕНИРОВКА</i>
                      </div>
                    </div>
                    <div className="preview-day">
                      <span>
                        ВТ <b>22</b>
                      </span>
                      <div className="preview-event violet">
                        <small>19:00 — 20:00</small>
                        <strong>Разбор демо</strong>
                        <span>Работа над ошибками</span>
                        <i>ВСТРЕЧА</i>
                      </div>
                    </div>
                    <div className="preview-day">
                      <span>
                        СР <b>23</b>
                      </span>
                      <div className="preview-event amber">
                        <small>20:00 — 22:00</small>
                        <strong>Тренировочный матч</strong>
                        <span>Проверяем тактику</span>
                        <i>МАТЧ</i>
                      </div>
                    </div>
                  </div>
                  <div className="preview-bottom-note">
                    <Check size={13} />
                    <span>У каждого — свой план. У команды — общая цель.</span>
                  </div>
                </>
              )}
              {tab === "tasks" && (
                <div className="preview-kanban">
                  {[
                    {
                      label: "В планах",
                      title: "Разобрать Mirage",
                      detail: "Подготовить два выхода на точку А",
                      color: "mint",
                      person: "Капитан",
                    },
                    {
                      label: "В работе",
                      title: "Тренировка гранат",
                      detail: "Повторить раскидки на трёх позициях",
                      color: "violet",
                      person: "Игрок",
                    },
                    {
                      label: "Готово",
                      title: "Посмотреть демо",
                      detail: "Обсудить ключевые ошибки матча",
                      color: "amber",
                      person: "Команда",
                    },
                  ].map((c, i) => (
                    <div key={c.label}>
                      <h3>
                        {c.label}
                        <span>1</span>
                      </h3>
                      <div className={`preview-task ${c.color}`}>
                        <MoreHorizontal size={14} />
                        <span className="preview-task-label">
                          {i === 2 ? "Завершено" : "Команда"}
                        </span>
                        <strong>{c.title}</strong>
                        <p>{c.detail}</p>
                        <footer>
                          <span className="preview-person">
                            {c.person.slice(0, 1)}
                          </span>
                          {c.person}
                          {i === 2 && <Check size={13} />}
                        </footer>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tab === "ai" && (
                <div className="preview-ai">
                  <div className="preview-question">
                    Как подготовиться к следующему матчу?
                  </div>
                  <div className="preview-answer">
                    <span>
                      <Sparkles size={15} />
                      BYTEAM · ИИ-штаб
                    </span>
                    <p>Начните с конкретного плана:</p>
                    {[
                      "Выберите карту и цель тренировки",
                      "Разберите три ключевых раунда",
                      "Проверьте тактику в тренировочном матче",
                    ].map((s, i) => (
                      <div key={s}>
                        <b>0{i + 1}</b>
                        {s}
                      </div>
                    ))}
                  </div>
                  <small>Пример ответа помощника</small>
                </div>
              )}
            </div>
            <Link className="preview-open" href={`/${tab}`}>
              <span>
                Открыть{" "}
                {tab === "calendar"
                  ? "календарь"
                  : tab === "tasks"
                    ? "доску задач"
                    : "помощника"}
              </span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
      <div className="preview-floating-note" aria-hidden="true">
        <span>
          <Check size={15} />
        </span>
        <div>
          <strong>Команда на одной волне</strong>
          <small>От первой задачи до следующего матча</small>
        </div>
      </div>
    </div>
  );
}
