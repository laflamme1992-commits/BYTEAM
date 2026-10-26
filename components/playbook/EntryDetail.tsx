"use client";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Check,
  ClipboardList,
  Copy,
  Flame,
  Pencil,
  Play,
  Shield,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { economies, kinds, type PlaybookEntry } from "@/lib/playbook/model";
export function EntryDetail({
  entry,
  prep,
  onPrep,
  onEdit,
  onFavorite,
  onDuplicate,
  onDelete,
  onShareToTeam,
  canCopyToTeam,
  busy,
}: {
  entry: PlaybookEntry;
  prep: boolean;
  onPrep: (value: boolean) => void;
  onEdit: () => void;
  onFavorite: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onShareToTeam: () => void;
  canCopyToTeam: boolean;
  busy: boolean;
}) {
  const [roleId, setRoleId] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const role = entry.roles.find((r) => r.id === roleId);
  const playerName = (id: string) =>
    entry.roles.find((r) => r.id === id)?.player ||
    entry.roles.find((r) => r.id === id)?.role ||
    "Вся команда";
  const steps = entry.steps.filter(
    (s) => !role || !s.roleId || s.roleId === role.id,
  );
  const grenades = entry.grenades.filter(
    (g) => !role || !g.roleId || g.roleId === role.id,
  );
  async function copy() {
    const content = [
      entry.title,
      `${entry.map} · ${entry.side} · ${economies[entry.economy]}`,
      entry.summary,
      `Колл: ${entry.call || "не указан"}`,
      ...(role ? [role] : entry.roles).map(
        (r) => `${r.player || r.role} · ${r.position}: ${r.action}`,
      ),
      ...steps.map(
        (s) =>
          `${s.time || "По порядку"} · ${playerName(s.roleId)}: ${s.action}`,
      ),
      ...grenades.map(
        (g) =>
          `${g.type} · ${playerName(g.roleId)} · ${g.from} → ${g.target}\n${g.aim}\n${g.technique} · ${g.timing}${g.url ? "\n" + g.url : ""}`,
      ),
      entry.fallback ? `План Б: ${entry.fallback}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopyError(
        "Браузер не разрешил копирование. Можно выделить текст вручную.",
      );
    }
  }
  return (
    <article className={`pb-detail ${prep ? "pb-prep" : ""}`}>
      <header className="pb-detail-header">
        <div className="pb-detail-tags">
          <span className={`pb-side ${entry.side.toLowerCase()}`}>
            {entry.side === "T" ? "T · Атака" : "CT · Защита"}
          </span>
          <span>{kinds[entry.kind]}</span>
          <span>
            {entry.map} · {entry.site || "Все зоны"}
          </span>
        </div>
        <div className="pb-detail-title">
          <h2>{entry.title}</h2>
          <button
            className="icon-button"
            aria-label={entry.favorite ? "Убрать из избранного" : "В избранное"}
            aria-pressed={entry.favorite}
            disabled={busy}
            onClick={onFavorite}
          >
            <Star size={20} fill={entry.favorite ? "currentColor" : "none"} />
          </button>
        </div>
        <p>
          {entry.summary ||
            "Добавьте короткую идею и условия применения в редакторе."}
        </p>
        <div className="pb-detail-actions">
          <button
            className={prep ? "primary-button" : "secondary-button"}
            onClick={() => onPrep(!prep)}
          >
            {prep ? <X size={15} /> : <Play size={15} />}{" "}
            {prep ? "Выйти из памятки" : "Перед игрой"}
          </button>
          <button className="secondary-button" onClick={onEdit} disabled={busy}>
            <Pencil size={15} />
            Редактировать
          </button>
          <button className="secondary-button" onClick={copy}>
            <Copy size={15} />
            {copied ? "Скопировано" : "Копировать план"}
          </button>
        </div>
      </header>
      <div className="pb-detail-body">
        <div className="pb-call">
          <span>
            <Shield size={17} />
            КОЛЛ И УСЛОВИЯ
          </span>
          <strong>{entry.call || "Колл ещё не записан"}</strong>
          <small>{economies[entry.economy]}</small>
        </div>
        {entry.roles.length > 0 && (
          <label className="pb-role-select">
            Показывать действия
            <select
              aria-label="Показывать действия"
              value={role?.id || ""}
              onChange={(e) => {
                setRoleId(e.target.value);
                setCopied(false);
              }}
            >
              <option value="">Вся команда</option>
              {entry.roles.map((r, i) => (
                <option key={r.id} value={r.id}>
                  {r.player || `Игрок ${i + 1}`} · {r.role || "Роль не указана"}
                </option>
              ))}
            </select>
          </label>
        )}
        <section className="pb-section">
          <h3>
            <Users size={18} />
            {role ? "Моя роль" : "Роли и позиции"}
            <span>{role ? 1 : entry.roles.length}</span>
          </h3>
          {entry.roles.length ? (
            <div className="pb-role-grid">
              {(role ? [role] : entry.roles).map((r, i) => (
                <div className="pb-role-card" key={r.id}>
                  <div>
                    <span className="pb-player-number">
                      {entry.roles.findIndex((x) => x.id === r.id) + 1}
                    </span>
                    <h4>
                      {r.player || `Игрок ${i + 1}`}
                      <small>{r.role || "Роль не указана"}</small>
                    </h4>
                  </div>
                  <p className="pb-position">
                    {r.position || "Позиция не записана"}
                  </p>
                  <p>{r.action || "Добавьте задачу игрока."}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="pb-empty-section">
              Распределите роли в редакторе: кто начинает, кто разменивает, кто
              даёт гранаты.
            </p>
          )}
        </section>
        <section className="pb-section">
          <h3>
            <ClipboardList size={18} />
            Ход раунда<span>{steps.length}</span>
          </h3>
          {steps.length ? (
            <ol className="pb-timeline">
              {steps.map((step) => (
                <li key={step.id}>
                  <span className="pb-step-number">
                    {entry.steps.findIndex((s) => s.id === step.id) + 1}
                  </span>
                  <div>
                    <div className="pb-step-meta">
                      <strong>{step.time || "Следующий шаг"}</strong>
                      <span>{playerName(step.roleId)}</span>
                    </div>
                    <p>{step.action || "Действие не записано"}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="pb-empty-section">
              Добавьте последовательность действий: от закупки до завершения
              раунда.
            </p>
          )}
        </section>
        <section className="pb-section">
          <h3>
            <Flame size={18} />
            Гранаты и раскидки<span>{grenades.length}</span>
          </h3>
          {grenades.length ? (
            <div className="pb-grenades">
              {grenades.map((g) => (
                <article className="pb-grenade" key={g.id}>
                  <div className="pb-grenade-top">
                    <span>{g.type}</span>
                    <small>{playerName(g.roleId)}</small>
                  </div>
                  <h4>
                    {g.from || "Откуда"}
                    <ArrowRight size={15} />
                    {g.target || "Куда"}
                  </h4>
                  <dl>
                    <div>
                      <dt>Прицел</dt>
                      <dd>{g.aim || "Ориентир ещё не записан"}</dd>
                    </div>
                    <div>
                      <dt>Бросок</dt>
                      <dd>{g.technique || "Способ не указан"}</dd>
                    </div>
                    <div>
                      <dt>Когда</dt>
                      <dd>{g.timing || "Тайминг не указан"}</dd>
                    </div>
                  </dl>
                  {g.url && (
                    <a href={g.url} target="_blank" rel="noopener noreferrer">
                      Открыть видео
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="pb-empty-section">
              Здесь будут точки броска, цели, ориентиры и видео ваших
              проверенных гранат.
            </p>
          )}
        </section>
        {entry.fallback && (
          <section className="pb-fallback">
            <h3>План Б · если что-то пошло не так</h3>
            <p>{entry.fallback}</p>
          </section>
        )}
        {!prep && (
          <>
            <section className="pb-section">
              <h3>
                <BookOpen size={18} />
                Заметки
              </h3>
              <p className="pb-notes">
                {entry.notes ||
                  "Записывайте фишки и уточнения после тренировок."}
              </p>
              {entry.videoUrl && (
                <a
                  className="pb-video"
                  href={entry.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Видео стратегии / полный раунд
                  <ArrowUpRight size={16} />
                </a>
              )}
            </section>
            {entry.tags.length > 0 && (
              <div className="pb-tags">
                {entry.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            )}
            <footer className="pb-detail-footer">
              <span>
                Обновлено{" "}
                {new Date(entry.updatedAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <div>
                {canCopyToTeam && (
                  <button
                    className="secondary-button"
                    disabled={busy}
                    onClick={onShareToTeam}
                  >
                    <Users size={14} />
                    Копировать в команду
                  </button>
                )}
                <button
                  className="icon-button"
                  aria-label="Создать копию записи"
                  disabled={busy}
                  onClick={onDuplicate}
                >
                  <Copy size={16} />
                </button>
                <button
                  className="icon-button danger"
                  aria-label="Удалить запись"
                  disabled={busy}
                  onClick={onDelete}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </footer>
          </>
        )}
        {prep && (entry.notes || entry.videoUrl) && (
          <details
            className="pb-prep-extras"
            open={entry.kind === "tip" || entry.kind === "grenade"}
          >
            <summary>Заметки и видео</summary>
            {entry.notes && <p className="pb-notes">{entry.notes}</p>}
            {entry.videoUrl && (
              <a
                className="pb-video"
                href={entry.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть видео
                <ArrowUpRight size={16} />
              </a>
            )}
          </details>
        )}
        {prep && (
          <p className="pb-prep-note">
            <Check size={16} />
            Сверьте роли, готовность гранат и сигнал начала до входа на сервер.
          </p>
        )}
        {copyError && (
          <p className="pb-error" role="status">
            {copyError}
          </p>
        )}
      </div>
    </article>
  );
}
