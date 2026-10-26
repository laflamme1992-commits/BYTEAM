export const maps = [
  "Mirage",
  "Inferno",
  "Dust2",
  "Ancient",
  "Nuke",
  "Anubis",
  "Overpass",
  "Vertigo",
  "Train",
] as const;
export const kinds = {
  strategy: "Стратегия",
  round: "Полный раунд",
  grenade: "Граната",
  tip: "Фишка",
} as const;
export const economies = {
  any: "Любая закупка",
  full: "Полная закупка",
  force: "Форс",
  eco: "Эко",
  pistol: "Пистолетный",
} as const;
export const grenadeTypes = [
  "Дым",
  "Флешка",
  "Молотов",
  "Зажигательная",
  "Осколочная",
  "Ложная",
] as const;
export type PlayerRole = {
  id: string;
  player: string;
  role: string;
  position: string;
  action: string;
};
export type RoundStep = {
  id: string;
  time: string;
  roleId: string;
  action: string;
};
export type Grenade = {
  id: string;
  type: (typeof grenadeTypes)[number];
  roleId: string;
  from: string;
  target: string;
  aim: string;
  timing: string;
  technique: string;
  url: string;
};
export type PlaybookEntry = {
  id: string;
  title: string;
  map: (typeof maps)[number];
  side: "T" | "CT";
  kind: keyof typeof kinds;
  economy: keyof typeof economies;
  site: string;
  summary: string;
  call: string;
  fallback: string;
  notes: string;
  videoUrl: string;
  tags: string[];
  roles: PlayerRole[];
  steps: RoundStep[];
  grenades: Grenade[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};
export const MAX_ENTRIES = 250;
export const MAX_IMPORT_BYTES = 3_000_000;
export function safeUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 1000 || !value.trim())
    return "";
  try {
    const u = new URL(value.trim());
    return ["https:", "http:"].includes(u.protocol) &&
      !u.username &&
      !u.password
      ? u.href
      : "";
  } catch {
    return "";
  }
}
function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function validDate(value: unknown) {
  return (
    typeof value === "string" &&
    value.length <= 40 &&
    Number.isFinite(Date.parse(value))
  );
}
export function parseEntry(value: unknown): PlaybookEntry | null {
  if (
    !record(value) ||
    typeof value.id !== "string" ||
    !/^[a-zA-Z0-9-]{1,100}$/.test(value.id) ||
    !text(value.title, 120) ||
    !maps.includes(value.map as never) ||
    !["T", "CT"].includes(String(value.side)) ||
    !Object.hasOwn(kinds, String(value.kind)) ||
    !Object.hasOwn(economies, String(value.economy)) ||
    !validDate(value.createdAt) ||
    !validDate(value.updatedAt)
  )
    return null;
  if (
    !Array.isArray(value.roles) ||
    value.roles.length > 8 ||
    !Array.isArray(value.steps) ||
    value.steps.length > 30 ||
    !Array.isArray(value.grenades) ||
    value.grenades.length > 20
  )
    return null;
  const roleIds = new Set<string>();
  const roles: PlayerRole[] = [];
  for (const r of value.roles) {
    if (
      !record(r) ||
      typeof r.id !== "string" ||
      !/^[a-zA-Z0-9-]{1,100}$/.test(r.id) ||
      roleIds.has(String(r.id))
    )
      return null;
    roleIds.add(String(r.id));
    roles.push({
      id: text(r.id, 100),
      player: text(r.player, 80),
      role: text(r.role, 80),
      position: text(r.position, 160),
      action: text(r.action, 1200),
    });
  }
  const steps: RoundStep[] = [];
  const seen = new Set<string>();
  for (const s of value.steps) {
    if (
      !record(s) ||
      typeof s.id !== "string" ||
      !/^[a-zA-Z0-9-]{1,100}$/.test(s.id) ||
      seen.has(String(s.id)) ||
      (s.roleId && !roleIds.has(String(s.roleId)))
    )
      return null;
    seen.add(String(s.id));
    steps.push({
      id: text(s.id, 100),
      time: text(s.time, 50),
      roleId: text(s.roleId, 100),
      action: text(s.action, 1200),
    });
  }
  const grenades: Grenade[] = [];
  seen.clear();
  for (const g of value.grenades) {
    if (
      !record(g) ||
      typeof g.id !== "string" ||
      !/^[a-zA-Z0-9-]{1,100}$/.test(g.id) ||
      seen.has(String(g.id)) ||
      !grenadeTypes.includes(g.type as never) ||
      (g.roleId && !roleIds.has(String(g.roleId)))
    )
      return null;
    seen.add(String(g.id));
    grenades.push({
      id: text(g.id, 100),
      type: g.type as Grenade["type"],
      roleId: text(g.roleId, 100),
      from: text(g.from, 200),
      target: text(g.target, 200),
      aim: text(g.aim, 1200),
      timing: text(g.timing, 120),
      technique: text(g.technique, 200),
      url: safeUrl(g.url),
    });
  }
  return {
    id: value.id,
    title: text(value.title, 120),
    map: value.map as PlaybookEntry["map"],
    side: value.side as "T" | "CT",
    kind: value.kind as PlaybookEntry["kind"],
    economy: value.economy as PlaybookEntry["economy"],
    site: text(value.site, 80),
    summary: text(value.summary, 1200),
    call: text(value.call, 200),
    fallback: text(value.fallback, 1600),
    notes: text(value.notes, 6000),
    videoUrl: safeUrl(value.videoUrl),
    tags: Array.isArray(value.tags)
      ? [...new Set(value.tags.map((t) => text(t, 30)).filter(Boolean))].slice(
          0,
          12,
        )
      : [],
    roles,
    steps,
    grenades,
    favorite: value.favorite === true,
    createdAt: value.createdAt as string,
    updatedAt: value.updatedAt as string,
  };
}
export function blankEntry(): PlaybookEntry {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    map: "Mirage",
    side: "T",
    kind: "strategy",
    economy: "any",
    site: "A",
    summary: "",
    call: "",
    fallback: "",
    notes: "",
    videoUrl: "",
    tags: [],
    roles: [],
    steps: [],
    grenades: [],
    favorite: false,
    createdAt: now,
    updatedAt: now,
  };
}
export function cloneEntry(entry: PlaybookEntry): PlaybookEntry {
  const now = new Date().toISOString();
  return {
    ...entry,
    id: crypto.randomUUID(),
    title: (entry.title + " · копия").slice(0, 120),
    roles: entry.roles.map((r) => ({ ...r })),
    steps: entry.steps.map((s) => ({ ...s })),
    grenades: entry.grenades.map((g) => ({ ...g })),
    tags: [...entry.tags],
    createdAt: now,
    updatedAt: now,
  };
}
export function decodeImport(raw: string): PlaybookEntry[] {
  if (new TextEncoder().encode(raw).length > MAX_IMPORT_BYTES)
    throw new Error("Файл слишком большой. Максимум — 3 МБ.");
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Не удалось прочитать JSON-файл.");
  }
  if (
    !record(data) ||
    data.version !== 1 ||
    !Array.isArray(data.entries) ||
    data.entries.length > MAX_ENTRIES ||
    !data.entries.length
  )
    throw new Error("Нужен экспорт плейбука BYTEAM версии 1, до 250 записей.");
  const entries = data.entries.map(parseEntry);
  if (entries.some((e) => !e))
    throw new Error(
      "Файл содержит повреждённые записи. Ничего не импортировано.",
    );
  return (entries as PlaybookEntry[]).map(cloneEntry);
}
export function exportEntries(entries: PlaybookEntry[]) {
  return JSON.stringify(
    {
      application: "BYTEAM",
      version: 1,
      exportedAt: new Date().toISOString(),
      entries,
    },
    null,
    2,
  );
}
export function matchesEntry(
  entry: PlaybookEntry,
  query: string,
  map: string,
  side: string,
  kind: string,
  favorites: boolean,
) {
  const haystack = [
    entry.title,
    entry.summary,
    entry.call,
    entry.site,
    ...entry.tags,
    ...entry.roles.flatMap((r) => [r.player, r.role, r.position, r.action]),
    ...entry.grenades.flatMap((g) => [g.from, g.target, g.aim]),
  ]
    .join(" ")
    .toLocaleLowerCase("ru");
  return (
    (!query.trim() ||
      haystack.includes(query.trim().toLocaleLowerCase("ru"))) &&
    (!map || entry.map === map) &&
    (!side || entry.side === side) &&
    (!kind || entry.kind === kind) &&
    (!favorites || entry.favorite)
  );
}
export function createTemplate(): PlaybookEntry {
  const e = blankEntry();
  const slots = [
    "Капитан",
    "Первый контакт",
    "Размен",
    "Поддержка",
    "Контроль фланга",
  ].map((role, i) => ({
    id: crypto.randomUUID(),
    player: `Игрок ${i + 1}`,
    role,
    position: "Укажите стартовую позицию",
    action: "Запишите свой маршрут, задачу и условие перехода.",
  }));
  return {
    ...e,
    title: "Шаблон · командный выход на A",
    kind: "round",
    economy: "full",
    summary:
      "Учебная структура полного раунда. Замените позиции, тайминги и гранаты на проверенные вашей командой.",
    call: "Альфа — старт по команде капитана",
    roles: slots,
    steps: [
      {
        id: crypto.randomUUID(),
        time: "Начало раунда",
        roleId: "",
        action: "Проверить закупку, роли и наличие нужных гранат.",
      },
      {
        id: crypto.randomUUID(),
        time: "Подготовка",
        roleId: slots[3].id,
        action:
          "Подтвердить готовность раскидки. Капитан даёт сигнал после готовности всех.",
      },
      {
        id: crypto.randomUUID(),
        time: "Выход",
        roleId: slots[1].id,
        action: "Первый контакт; напарник держит дистанцию для размена.",
      },
      {
        id: crypto.randomUUID(),
        time: "После установки",
        roleId: "",
        action:
          "Сообщить место бомбы, оставшееся время и выбранные позиции. Распределить направления контроля.",
      },
      {
        id: crypto.randomUUID(),
        time: "Завершение",
        roleId: "",
        action: "Зафиксировать результат и один вопрос для разбора.",
      },
    ],
    grenades: [
      {
        id: crypto.randomUUID(),
        type: "Дым",
        roleId: slots[3].id,
        from: "Запишите точку броска",
        target: "Запишите перекрываемую позицию",
        aim: "Добавьте проверенный ориентир или ссылку на видео. Это не готовая раскидка.",
        timing: "По сигналу капитана",
        technique: "Укажите способ броска",
        url: "",
      },
    ],
    fallback:
      "Запишите условия отмены выхода, запасное решение и кто даёт команду.",
    notes:
      "Шаблон помогает распределить обязанности. Все раскидки и тайминги нужно проверить на актуальной версии карты.",
  };
}
