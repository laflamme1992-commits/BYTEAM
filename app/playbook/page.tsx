"use client";
import { ChangeEvent, useRef, useState } from "react";
import {
  BookOpen,
  Download,
  Filter,
  HardDrive,
  Plus,
  Search,
  Star,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import { Header } from "@/components/workspace/Header";
import { ModalBackdrop } from "@/components/workspace/ModalBackdrop";
import { EntryEditor } from "@/components/playbook/EntryEditor";
import { EntryDetail } from "@/components/playbook/EntryDetail";
import { usePlaybook } from "@/lib/hooks/usePlaybook";
import {
  blankEntry,
  cloneEntry,
  createTemplate,
  decodeImport,
  exportEntries,
  maps,
  kinds,
  matchesEntry,
  MAX_IMPORT_BYTES,
  type PlaybookEntry,
} from "@/lib/playbook/model";
import styles from "./playbook.module.css";
export default function PlaybookPage() {
  const book = usePlaybook();
  const [query, setQuery] = useState("");
  const [map, setMap] = useState("");
  const [side, setSide] = useState("");
  const [kind, setKind] = useState("");
  const [favorites, setFavorites] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [editor, setEditor] = useState<{
    entry: PlaybookEntry;
    original?: string;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PlaybookEntry | null>(
    null,
  );
  const [prep, setPrep] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const visible = book.entries
    .filter((e) => matchesEntry(e, query, map, side, kind, favorites))
    .sort(
      (a, b) =>
        Number(b.favorite) - Number(a.favorite) ||
        b.updatedAt.localeCompare(a.updatedAt),
    );
  const selected =
    visible.find((e) => e.id === selectedId) || visible[0] || null;
  function resetFilters() {
    setQuery("");
    setMap("");
    setSide("");
    setKind("");
    setFavorites(false);
  }
  function select(entry: PlaybookEntry) {
    setSelectedId(entry.id);
    setPrep(false);
    setMessage("");
  }
  async function action(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Не удалось выполнить действие.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function saveEntry(entry: PlaybookEntry) {
    const saved = await book.save(entry, editor?.original);
    setEditor(null);
    setSelectedId(saved.id);
    resetFilters();
    setMessage(
      book.source === "local"
        ? "Запись сохранена на этом устройстве. Сделайте экспорт, чтобы поделиться с командой."
        : "Запись сохранена в командный плейбук.",
    );
  }
  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await action(async () => {
      if (file.size > MAX_IMPORT_BYTES)
        throw new Error("Файл слишком большой. Максимум — 3 МБ.");
      const entries = decodeImport(await file.text());
      book.importLocal(entries);
      setSelectedId(entries[0].id);
      resetFilters();
      setMessage(
        `Добавлено записей: ${entries.length}. Исходные записи не изменены.`,
      );
    });
  }
  function download() {
    const blob = new Blob([exportEntries(book.entries)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `byteam-playbook-${new Date().toLocaleDateString("sv-SE")}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setMessage(
      "Экспорт содержит весь выбранный плейбук. Передавайте его только тем, кому доверяете.",
    );
  }
  return (
    <div className={`workspace ${styles.playbook}`}>
      <Sidebar />
      <main className="workspace-main">
        <Header
          title="Плейбук"
          subtitle="Ваши стратегии, роли и раскидки. Вспомнить план — за один взгляд."
        >
          <button
            className="secondary-button"
            disabled={!book.entries.length || busy}
            onClick={download}
            aria-label="Экспорт всего плейбука"
          >
            <Download size={16} />
            Экспорт
          </button>
          <button
            className="primary-button"
            disabled={busy}
            onClick={() => setEditor({ entry: blankEntry() })}
          >
            <Plus size={17} />
            Новая запись
          </button>
        </Header>
        <div className="workspace-content">
          <div className="pb-storage">
            <div>
              <span className="eyebrow">ХРАНИЛИЩЕ</span>
              <div className="segmented">
                <button
                  aria-pressed={book.source === "local"}
                  onClick={() => {
                    book.setSource("local");
                    setSelectedId("");
                    setPrep(false);
                  }}
                >
                  <HardDrive size={15} />
                  На устройстве
                </button>
                <button
                  aria-pressed={book.source === "team"}
                  disabled={!book.remoteReady}
                  title={
                    !book.remoteReady
                      ? "Командное хранилище пока не подключено"
                      : "Плейбук команды капитана"
                  }
                  onClick={() => {
                    book.setSource("team");
                    setSelectedId("");
                    setPrep(false);
                  }}
                >
                  <Users size={15} />
                  Команда
                </button>
              </div>
            </div>
            <p>
              {book.source === "local"
                ? "Записи хранятся в этом браузере. Экспортируйте файл для резервной копии и передачи команде."
                : "Командное хранилище капитана. Доступ определяется правами команды в Supabase."}
            </p>
            <input
              ref={importRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              aria-label="Импорт плейбука"
              onChange={importFile}
            />
            <button
              className="secondary-button"
              disabled={book.source !== "local" || busy}
              onClick={() => importRef.current?.click()}
            >
              <Upload size={16} />
              Импорт
            </button>
          </div>
          {book.error && (
            <p className="pb-storage-warning" role="status">
              {book.error}
              <button disabled={book.loading} onClick={book.reload}>
                {book.loading ? "Проверяем…" : "Проверить подключение"}
              </button>
            </p>
          )}
          {error && (
            <div className="pb-error" role="alert">
              {error}
              <button
                className="icon-button"
                aria-label="Закрыть сообщение об ошибке"
                onClick={() => setError("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="pb-toolbar">
            <label className="pb-search">
              <Search size={18} />
              <span className="sr-only">Поиск в плейбуке</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Название, колл, игрок, позиция…"
              />
            </label>
            <select
              aria-label="Фильтр карты"
              value={map}
              onChange={(e) => setMap(e.target.value)}
            >
              <option value="">Все карты</option>
              {maps.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <select
              aria-label="Фильтр стороны"
              value={side}
              onChange={(e) => setSide(e.target.value)}
            >
              <option value="">Обе стороны</option>
              <option value="T">T · Атака</option>
              <option value="CT">CT · Защита</option>
            </select>
            <select
              aria-label="Фильтр типа записи"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="">Все записи</option>
              {Object.entries(kinds).map(([id, label]) => (
                <option value={id} key={id}>
                  {label}
                </option>
              ))}
            </select>
            <button
              className={`secondary-button ${favorites ? "pb-favorites-active" : ""}`}
              aria-pressed={favorites}
              onClick={() => setFavorites(!favorites)}
            >
              <Star size={16} fill={favorites ? "currentColor" : "none"} />
              Избранное
            </button>
            {(query || map || side || kind || favorites) && (
              <button
                className="icon-button"
                aria-label="Сбросить фильтры"
                onClick={resetFilters}
              >
                <Filter size={17} />
                <X size={12} />
              </button>
            )}
          </div>
          {book.entries.length === 0 ? (
            <section className="pb-empty">
              <span className="pb-empty-icon">
                <BookOpen size={34} />
              </span>
              <span className="eyebrow">ПЛАН, КОТОРЫЙ ВСЕГДА ПОД РУКОЙ</span>
              <h2>Не держите всю стратегию в голове.</h2>
              <p>
                Запишите роли, маршрут, гранаты и действия после установки.
                Перед матчем откройте памятку — каждый вспомнит свою задачу.
              </p>
              <div className="pb-empty-features">
                <span>01 · Кто и где играет</span>
                <span>02 · Когда и куда бросает</span>
                <span>03 · Что делаем дальше</span>
              </div>
              <div>
                <button
                  className="primary-button"
                  onClick={() => setEditor({ entry: blankEntry() })}
                >
                  <Plus size={16} />
                  Создать первую запись
                </button>
                <button
                  className="secondary-button"
                  onClick={() => setEditor({ entry: createTemplate() })}
                >
                  Попробовать шаблон раунда
                </button>
              </div>
              <small>
                Шаблон — заготовка для редактирования, а не проверенная игровая
                стратегия.
              </small>
            </section>
          ) : (
            <div className={`pb-layout ${prep ? "pb-layout-prep" : ""}`}>
              <aside className="pb-library" aria-label="Записи плейбука">
                <div className="pb-library-heading">
                  <span>БИБЛИОТЕКА</span>
                  <strong>
                    {visible.length} / {book.entries.length}
                  </strong>
                </div>
                {visible.length ? (
                  visible.map((entry) => (
                    <button
                      key={entry.id}
                      className={`pb-library-entry ${selected?.id === entry.id ? "selected" : ""}`}
                      aria-pressed={selected?.id === entry.id}
                      onClick={() => select(entry)}
                    >
                      <div>
                        <span>
                          {entry.map} <i>·</i> {entry.side}
                        </span>
                        {entry.favorite && (
                          <Star size={13} fill="currentColor" />
                        )}
                      </div>
                      <h3>{entry.title}</h3>
                      <p>
                        {entry.summary ||
                          entry.call ||
                          "Откройте, чтобы посмотреть план"}
                      </p>
                      <footer>
                        <span>{kinds[entry.kind]}</span>
                        <span>
                          {entry.roles.length} ролей · {entry.grenades.length}{" "}
                          гранат
                        </span>
                      </footer>
                    </button>
                  ))
                ) : (
                  <div className="pb-no-results">
                    <Search size={24} />
                    <p>Ничего не найдено</p>
                    <button onClick={resetFilters}>Сбросить фильтры</button>
                  </div>
                )}
              </aside>
              {selected ? (
                <EntryDetail
                  key={selected.id}
                  entry={selected}
                  prep={prep}
                  onPrep={setPrep}
                  busy={busy}
                  onEdit={() =>
                    setEditor({ entry: selected, original: selected.updatedAt })
                  }
                  onFavorite={() =>
                    action(async () => {
                      const saved = await book.save(
                        { ...selected, favorite: !selected.favorite },
                        selected.updatedAt,
                      );
                      setSelectedId(saved.id);
                    })
                  }
                  onDuplicate={() =>
                    action(async () => {
                      const copy = await book.save(cloneEntry(selected));
                      resetFilters();
                      setSelectedId(copy.id);
                      setMessage("Копия создана. Исходная запись не изменена.");
                    })
                  }
                  onDelete={() => setPendingDelete(selected)}
                  canCopyToTeam={book.source === "local" && book.remoteReady}
                  onShareToTeam={() =>
                    action(async () => {
                      await book.copyToTeam(selected);
                      setMessage(
                        "Копия добавлена в командный плейбук. Локальная запись сохранена.",
                      );
                    })
                  }
                />
              ) : (
                <div className="pb-no-results">
                  <BookOpen size={30} />
                  <p>Измените фильтры, чтобы выбрать запись.</p>
                </div>
              )}
            </div>
          )}
          <p className="pb-announcement" role="status">
            {message}
          </p>
          {editor && (
            <EntryEditor
              key={editor.entry.id}
              entry={editor.entry}
              onClose={() => setEditor(null)}
              onSave={saveEntry}
            />
          )}
          {pendingDelete && (
            <ModalBackdrop
              onClose={() => {
                if (!busy) setPendingDelete(null);
              }}
            >
              <section
                className="workspace-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pb-delete-title"
              >
                <h2 id="pb-delete-title">Удалить запись?</h2>
                <p>
                  «{pendingDelete.title}» будет удалена из выбранного хранилища.
                  Для резервной копии можно сначала экспортировать плейбук.
                </p>
                <div className="modal-actions">
                  <button
                    className="secondary-button"
                    disabled={busy}
                    onClick={() => setPendingDelete(null)}
                  >
                    Отмена
                  </button>
                  <button
                    className="primary-button"
                    disabled={busy}
                    onClick={() =>
                      action(async () => {
                        await book.remove(pendingDelete);
                        setPendingDelete(null);
                        setMessage("Запись удалена.");
                      })
                    }
                  >
                    {busy ? "Удаляем…" : "Удалить"}
                  </button>
                </div>
              </section>
            </ModalBackdrop>
          )}
        </div>
      </main>
    </div>
  );
}
