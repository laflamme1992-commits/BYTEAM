"use client";
import { FormEvent, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { ModalBackdrop } from "@/components/workspace/ModalBackdrop";
import {
  maps,
  kinds,
  economies,
  grenadeTypes,
  safeUrl,
  type PlaybookEntry,
  type PlayerRole,
  type RoundStep,
  type Grenade,
} from "@/lib/playbook/model";
const tabs = [
  ["base", "Основа"],
  ["roles", "Роли игроков"],
  ["steps", "Ход раунда"],
  ["grenades", "Гранаты"],
] as const;
export function EntryEditor({
  entry,
  onClose,
  onSave,
}: {
  entry: PlaybookEntry;
  onClose: () => void;
  onSave: (entry: PlaybookEntry) => Promise<void>;
}) {
  const [draft, setDraft] = useState(entry);
  const [tab, setTab] = useState<string>("base");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(entry);
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const patch = (value: Partial<PlaybookEntry>) =>
    setDraft((prev) => ({ ...prev, ...value }));
  function close() {
    if (busy) return;
    if (!dirty || window.confirm("Закрыть без сохранения изменений?"))
      onClose();
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!draft.title.trim()) {
      setTab("base");
      setError("Добавьте название записи.");
      return;
    }
    if (
      [draft.videoUrl, ...draft.grenades.map((g) => g.url)].some(
        (url) => url.trim() && !safeUrl(url),
      )
    ) {
      setError(
        "Ссылки должны начинаться с https:// или http:// и не содержать логин и пароль.",
      );
      return;
    }
    setBusy(true);
    try {
      await onSave(draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить запись.");
    } finally {
      setBusy(false);
    }
  }
  function changeRole(id: string, value: Partial<PlayerRole>) {
    patch({
      roles: draft.roles.map((r) => (r.id === id ? { ...r, ...value } : r)),
    });
  }
  function removeRole(id: string) {
    patch({
      roles: draft.roles.filter((r) => r.id !== id),
      steps: draft.steps.map((s) =>
        s.roleId === id ? { ...s, roleId: "" } : s,
      ),
      grenades: draft.grenades.map((g) =>
        g.roleId === id ? { ...g, roleId: "" } : g,
      ),
    });
  }
  function changeStep(id: string, value: Partial<RoundStep>) {
    patch({
      steps: draft.steps.map((s) => (s.id === id ? { ...s, ...value } : s)),
    });
  }
  function changeGrenade(id: string, value: Partial<Grenade>) {
    patch({
      grenades: draft.grenades.map((g) =>
        g.id === id ? { ...g, ...value } : g,
      ),
    });
  }
  function move(index: number, direction: number) {
    const steps = [...draft.steps];
    [steps[index], steps[index + direction]] = [
      steps[index + direction],
      steps[index],
    ];
    patch({ steps });
  }
  function roleOptions() {
    return (
      <>
        <option value="">Вся команда / не назначен</option>
        {draft.roles.map((r, i) => (
          <option key={r.id} value={r.id}>
            {r.player || r.role || `Игрок ${i + 1}`}
          </option>
        ))}
      </>
    );
  }
  return (
    <ModalBackdrop onClose={close}>
      <section
        className="workspace-modal pb-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pb-editor-title"
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">ПЛЕЙБУК КОМАНДЫ</span>
            <h2 id="pb-editor-title">
              {entry.title ? "Редактировать запись" : "Новая запись"}
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Закрыть редактор"
            onClick={close}
            disabled={busy}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="pb-editor-tabs" aria-label="Разделы редактора">
          {tabs.map(([id, label]) => (
            <button
              type="button"
              key={id}
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
            >
              {label}
              <span>
                {id === "roles"
                  ? draft.roles.length
                  : id === "steps"
                    ? draft.steps.length
                    : id === "grenades"
                      ? draft.grenades.length
                      : ""}
              </span>
            </button>
          ))}
        </nav>
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="pb-editor-fields">
            {tab === "base" && (
              <>
                <label>
                  Название
                  <input
                    autoFocus
                    value={draft.title}
                    maxLength={120}
                    onChange={(e) => patch({ title: e.target.value })}
                    placeholder="Например, A-сплит через коннектор"
                  />
                </label>
                <div className="pb-form-grid">
                  <label>
                    Карта
                    <select
                      aria-label="Карта"
                      value={draft.map}
                      onChange={(e) =>
                        patch({ map: e.target.value as PlaybookEntry["map"] })
                      }
                    >
                      {maps.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Сторона
                    <select
                      aria-label="Сторона"
                      value={draft.side}
                      onChange={(e) =>
                        patch({ side: e.target.value as "T" | "CT" })
                      }
                    >
                      <option value="T">T · Атака</option>
                      <option value="CT">CT · Защита</option>
                    </select>
                  </label>
                  <label>
                    Тип записи
                    <select
                      aria-label="Тип записи"
                      value={draft.kind}
                      onChange={(e) =>
                        patch({ kind: e.target.value as PlaybookEntry["kind"] })
                      }
                    >
                      {Object.entries(kinds).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Закупка
                    <select
                      aria-label="Закупка"
                      value={draft.economy}
                      onChange={(e) =>
                        patch({
                          economy: e.target.value as PlaybookEntry["economy"],
                        })
                      }
                    >
                      {Object.entries(economies).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Точка / зона
                  <input
                    value={draft.site}
                    onChange={(e) => patch({ site: e.target.value })}
                    maxLength={80}
                    placeholder="A, B, мид, ретейк…"
                  />
                </label>
                <label>
                  Коротко: цель и идея
                  <textarea
                    aria-label="Коротко: цель и идея"
                    value={draft.summary}
                    onChange={(e) => patch({ summary: e.target.value })}
                    maxLength={1200}
                    rows={3}
                    placeholder="Что хотим получить и при каких условиях играем этот план"
                  />
                </label>
                <label>
                  Колл / сигнал начала
                  <input
                    value={draft.call}
                    onChange={(e) => patch({ call: e.target.value })}
                    maxLength={200}
                    placeholder="Как называем стратегию и когда начинаем"
                  />
                </label>
                <label>
                  План Б / условие отмены
                  <textarea
                    aria-label="План Б / условие отмены"
                    value={draft.fallback}
                    onChange={(e) => patch({ fallback: e.target.value })}
                    maxLength={1600}
                    rows={3}
                    placeholder="Что делаем, если потеряли игрока, не прошла граната или точка закрыта"
                  />
                </label>
                <label>
                  Ссылка на видео / разбор
                  <input
                    type="url"
                    value={draft.videoUrl}
                    onChange={(e) => patch({ videoUrl: e.target.value })}
                    maxLength={1000}
                    placeholder="https://…"
                  />
                </label>
                <label>
                  Метки через запятую
                  <input
                    value={draft.tags.join(", ")}
                    onChange={(e) =>
                      patch({
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trimStart())
                          .slice(0, 12),
                      })
                    }
                    placeholder="быстрый выход, размен, раскидка"
                    maxLength={370}
                  />
                </label>
                <label>
                  Заметки
                  <textarea
                    aria-label="Заметки"
                    value={draft.notes}
                    onChange={(e) => patch({ notes: e.target.value })}
                    maxLength={6000}
                    rows={5}
                    placeholder="Проверенные фишки, детали и выводы после тренировки"
                  />
                </label>
              </>
            )}
            {tab === "roles" && (
              <>
                <p className="pb-editor-help">
                  Запишите стартовую позицию и задачу каждого игрока. Затем
                  назначьте роли шагам раунда и гранатам.
                </p>
                {draft.roles.map((role, i) => (
                  <fieldset className="pb-edit-card" key={role.id}>
                    <legend>Игрок {i + 1}</legend>
                    <button
                      className="icon-button danger pb-remove"
                      type="button"
                      aria-label={`Удалить роль ${i + 1}`}
                      onClick={() => removeRole(role.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="pb-form-grid">
                      <label>
                        Игрок / ник
                        <input
                          value={role.player}
                          onChange={(e) =>
                            changeRole(role.id, { player: e.target.value })
                          }
                          maxLength={80}
                        />
                      </label>
                      <label>
                        Роль в стратегии
                        <input
                          value={role.role}
                          onChange={(e) =>
                            changeRole(role.id, { role: e.target.value })
                          }
                          maxLength={80}
                          placeholder="Энтри, размен, поддержка…"
                        />
                      </label>
                    </div>
                    <label>
                      Стартовая позиция / маршрут
                      <input
                        value={role.position}
                        onChange={(e) =>
                          changeRole(role.id, { position: e.target.value })
                        }
                        maxLength={160}
                      />
                    </label>
                    <label>
                      Что делает и за что отвечает
                      <textarea
                        aria-label="Что делает и за что отвечает"
                        value={role.action}
                        onChange={(e) =>
                          changeRole(role.id, { action: e.target.value })
                        }
                        maxLength={1200}
                        rows={3}
                      />
                    </label>
                  </fieldset>
                ))}
                <button
                  className="secondary-button"
                  type="button"
                  disabled={draft.roles.length >= 8}
                  onClick={() =>
                    patch({
                      roles: [
                        ...draft.roles,
                        {
                          id: crypto.randomUUID(),
                          player: "",
                          role: "",
                          position: "",
                          action: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Добавить игрока
                </button>
                <small className="pb-editor-help">
                  До 8 ролей, включая запасные варианты.
                </small>
              </>
            )}
            {tab === "steps" && (
              <>
                <p className="pb-editor-help">
                  Порядок шагов важен. Опишите начало, подготовку, выход,
                  действия после установки и завершение раунда.
                </p>
                {draft.steps.map((step, i) => (
                  <fieldset className="pb-edit-card" key={step.id}>
                    <legend>Шаг {i + 1}</legend>
                    <div className="pb-step-controls">
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Поднять шаг ${i + 1}`}
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Опустить шаг ${i + 1}`}
                        disabled={i === draft.steps.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-button danger"
                        aria-label={`Удалить шаг ${i + 1}`}
                        onClick={() =>
                          patch({
                            steps: draft.steps.filter((s) => s.id !== step.id),
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="pb-form-grid">
                      <label>
                        Тайминг / условие
                        <input
                          value={step.time}
                          onChange={(e) =>
                            changeStep(step.id, { time: e.target.value })
                          }
                          maxLength={50}
                          placeholder="1:35 или по готовности"
                        />
                      </label>
                      <label>
                        Кто выполняет
                        <select
                          aria-label="Кто выполняет"
                          value={step.roleId}
                          onChange={(e) =>
                            changeStep(step.id, { roleId: e.target.value })
                          }
                        >
                          {roleOptions()}
                        </select>
                      </label>
                    </div>
                    <label>
                      Действие
                      <textarea
                        aria-label="Действие"
                        value={step.action}
                        onChange={(e) =>
                          changeStep(step.id, { action: e.target.value })
                        }
                        maxLength={1200}
                        rows={3}
                      />
                    </label>
                  </fieldset>
                ))}
                <button
                  type="button"
                  className="secondary-button"
                  disabled={draft.steps.length >= 30}
                  onClick={() =>
                    patch({
                      steps: [
                        ...draft.steps,
                        {
                          id: crypto.randomUUID(),
                          time: "",
                          roleId: "",
                          action: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Добавить шаг
                </button>
              </>
            )}
            {tab === "grenades" && (
              <>
                <p className="pb-editor-help">
                  Для точной раскидки нужны точка броска, цель, ориентир прицела
                  и способ броска. Прикрепляйте проверенное видео.
                </p>
                {draft.grenades.map((g, i) => (
                  <fieldset className="pb-edit-card" key={g.id}>
                    <legend>Граната {i + 1}</legend>
                    <button
                      className="icon-button danger pb-remove"
                      type="button"
                      aria-label={`Удалить гранату ${i + 1}`}
                      onClick={() =>
                        patch({
                          grenades: draft.grenades.filter((x) => x.id !== g.id),
                        })
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="pb-form-grid">
                      <label>
                        Тип
                        <select
                          aria-label="Тип"
                          value={g.type}
                          onChange={(e) =>
                            changeGrenade(g.id, {
                              type: e.target.value as Grenade["type"],
                            })
                          }
                        >
                          {grenadeTypes.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Кто бросает
                        <select
                          aria-label="Кто бросает"
                          value={g.roleId}
                          onChange={(e) =>
                            changeGrenade(g.id, { roleId: e.target.value })
                          }
                        >
                          {roleOptions()}
                        </select>
                      </label>
                      <label>
                        Откуда
                        <input
                          value={g.from}
                          onChange={(e) =>
                            changeGrenade(g.id, { from: e.target.value })
                          }
                          maxLength={200}
                        />
                      </label>
                      <label>
                        Куда
                        <input
                          value={g.target}
                          onChange={(e) =>
                            changeGrenade(g.id, { target: e.target.value })
                          }
                          maxLength={200}
                        />
                      </label>
                    </div>
                    <label>
                      Ориентир / куда навести прицел
                      <textarea
                        aria-label="Ориентир / куда навести прицел"
                        value={g.aim}
                        onChange={(e) =>
                          changeGrenade(g.id, { aim: e.target.value })
                        }
                        rows={3}
                        maxLength={1200}
                      />
                    </label>
                    <div className="pb-form-grid">
                      <label>
                        Способ броска
                        <input
                          value={g.technique}
                          onChange={(e) =>
                            changeGrenade(g.id, { technique: e.target.value })
                          }
                          maxLength={200}
                          placeholder="Стоя, с шагом, в прыжке…"
                        />
                      </label>
                      <label>
                        Тайминг / сигнал
                        <input
                          value={g.timing}
                          onChange={(e) =>
                            changeGrenade(g.id, { timing: e.target.value })
                          }
                          maxLength={120}
                        />
                      </label>
                    </div>
                    <label>
                      Ссылка на видео
                      <input
                        type="url"
                        value={g.url}
                        onChange={(e) =>
                          changeGrenade(g.id, { url: e.target.value })
                        }
                        maxLength={1000}
                        placeholder="https://…"
                      />
                    </label>
                  </fieldset>
                ))}
                <button
                  type="button"
                  className="secondary-button"
                  disabled={draft.grenades.length >= 20}
                  onClick={() =>
                    patch({
                      grenades: [
                        ...draft.grenades,
                        {
                          id: crypto.randomUUID(),
                          type: "Дым",
                          roleId: "",
                          from: "",
                          target: "",
                          aim: "",
                          timing: "",
                          technique: "",
                          url: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Добавить гранату
                </button>
              </>
            )}
          </fieldset>
          {error && (
            <p className="pb-error" role="alert">
              {error}
            </p>
          )}
          <div className="pb-editor-footer">
            <span>
              {dirty
                ? "Есть несохранённые изменения"
                : "Все изменения — после сохранения"}
            </span>
            <button
              type="button"
              className="secondary-button"
              onClick={close}
              disabled={busy}
            >
              Отмена
            </button>
            <button className="primary-button" disabled={busy}>
              {busy ? "Сохраняем…" : "Сохранить запись"}
            </button>
          </div>
        </form>
      </section>
    </ModalBackdrop>
  );
}
