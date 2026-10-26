import { parseEntry, MAX_ENTRIES, type PlaybookEntry } from "./model";
export const STORAGE_KEY = "byteam.playbook.v1";
const EMPTY: PlaybookEntry[] = [];
let cachedRaw: string | null = null;
let cachedEntries = EMPTY;
const listeners = new Set<() => void>();
export function subscribeLocal(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
export function serverSnapshot() {
  return EMPTY;
}
export function localSnapshot() {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedEntries;
    cachedRaw = raw;
    if (!raw) {
      cachedEntries = EMPTY;
      return cachedEntries;
    }
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.entries)) throw new Error();
    const parsed = data.entries.map(parseEntry);
    if (
      parsed.length > MAX_ENTRIES ||
      parsed.some((e: PlaybookEntry | null) => !e)
    )
      throw new Error();
    cachedEntries = parsed;
    return cachedEntries;
  } catch {
    return cachedEntries;
  }
}
export function persistLocal(entries: PlaybookEntry[]) {
  if (entries.length > MAX_ENTRIES)
    throw new Error(
      "Лимит локального плейбука — 250 записей. Сначала сделайте экспорт и удалите ненужное.",
    );
  const old = localStorage.getItem(STORAGE_KEY);
  if (old) {
    let valid = false;
    try {
      const data = JSON.parse(old);
      valid =
        data.version === 1 &&
        Array.isArray(data.entries) &&
        data.entries.length <= MAX_ENTRIES &&
        data.entries.every((e: unknown) => parseEntry(e));
    } catch {}
    if (!valid)
      throw new Error(
        "Сохранение остановлено: локальное хранилище повреждено. Сначала сохраните резервную копию данных браузера.",
      );
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, entries }));
  } catch {
    throw new Error(
      "Браузер не смог сохранить запись. Проверьте доступность и свободное место хранилища.",
    );
  }
  for (const listener of listeners) listener();
}
