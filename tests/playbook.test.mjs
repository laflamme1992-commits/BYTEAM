import test from "node:test";
import assert from "node:assert/strict";
import {
  blankEntry,
  parseEntry,
  cloneEntry,
  createTemplate,
  decodeImport,
  exportEntries,
  matchesEntry,
  safeUrl,
  MAX_IMPORT_BYTES,
} from "../lib/playbook/model.ts";
function entry() {
  return {
    ...blankEntry(),
    title: "A-сплит",
    summary: "Выход через коннектор",
    call: "Альфа",
    tags: ["раскидка"],
    roles: [
      {
        id: "role-one",
        player: "Лис",
        role: "Поддержка",
        position: "Т-спавн",
        action: "Дать дым на лестницу",
      },
    ],
    steps: [
      {
        id: "step-one",
        time: "По коллу",
        roleId: "role-one",
        action: "Дать гранату",
      },
    ],
    grenades: [
      {
        id: "grenade-one",
        type: "Дым",
        roleId: "role-one",
        from: "Т-спавн",
        target: "Лестница",
        aim: "Проверенный ориентир",
        timing: "По сигналу",
        technique: "Стоя",
        url: "https://example.com/video",
      },
    ],
  };
}
test("playbook preserves roles, ordered steps, grenades and contingency", () => {
  const e = {
    ...entry(),
    fallback: "Перегруппироваться",
    notes: "Сохранить дым",
  };
  assert.deepEqual(parseEntry(e), e);
});
test("playbook rejects broken role references and duplicate identifiers", () => {
  const e = entry();
  assert.equal(
    parseEntry({ ...e, steps: [{ ...e.steps[0], roleId: "missing" }] }),
    null,
  );
  assert.equal(parseEntry({ ...e, roles: [e.roles[0], e.roles[0]] }), null);
  assert.equal(parseEntry({ ...e, steps: [e.steps[0], e.steps[0]] }), null);
  assert.equal(
    parseEntry({ ...e, grenades: [{ ...e.grenades[0], roleId: "unknown" }] }),
    null,
  );
  assert.equal(
    parseEntry({ ...e, roles: [{ ...e.roles[0], id: "x".repeat(101) }] }),
    null,
  );
});
test("playbook URLs reject scripts, local files and credential-bearing links", () => {
  for (const u of [
    "javascript:alert(1)",
    "file:///etc/passwd",
    "data:text/html,test",
    "https://user:secret@example.com",
  ])
    assert.equal(safeUrl(u), "");
  assert.equal(safeUrl("https://example.com/clip"), "https://example.com/clip");
  assert.equal(
    parseEntry({ ...entry(), videoUrl: "javascript:alert(1)" }).videoUrl,
    "",
  );
});
test("export import makes independent copies without replacing existing IDs", () => {
  const e = entry();
  const imported = decodeImport(exportEntries([e]));
  assert.equal(imported.length, 1);
  assert.notEqual(imported[0].id, e.id);
  assert.equal(imported[0].roles[0].id, imported[0].steps[0].roleId);
  assert.equal(imported[0].grenades[0].aim, e.grenades[0].aim);
  assert.match(imported[0].title, /копия/);
});
test("invalid and oversized imports fail as a whole", () => {
  const good = entry();
  for (const raw of [
    "{",
    "null",
    JSON.stringify({ version: 2, entries: [good] }),
    JSON.stringify({ version: 1, entries: [good, { ...good, side: "X" }] }),
    JSON.stringify({ version: 1, entries: [] }),
  ])
    assert.throws(() => decodeImport(raw));
  assert.throws(() => decodeImport(" ".repeat(MAX_IMPORT_BYTES + 1)), /3 МБ/);
});
test("search includes call, players, positions and grenade targets with combined filters", () => {
  const e = entry();
  for (const q of ["альфа", "ЛИС", "лестница", "коннектор"])
    assert(matchesEntry(e, q, "Mirage", "T", "strategy", false));
  assert(!matchesEntry(e, "", "Nuke", "", "", false));
  assert(!matchesEntry(e, "", "", "", "", true));
  assert(matchesEntry({ ...e, favorite: true }, "", "", "", "", true));
});
test("copy does not mutate original roles, steps, utilities or tags", () => {
  const e = entry();
  const clone = cloneEntry(e);
  clone.roles[0].player = "Другой";
  clone.steps[0].action = "Другой шаг";
  clone.grenades[0].target = "Другая цель";
  clone.tags.push("другая");
  assert.equal(e.roles[0].player, "Лис");
  assert.equal(e.steps[0].action, "Дать гранату");
  assert.equal(e.grenades[0].target, "Лестница");
  assert.equal(e.tags.length, 1);
});
test("full-round template covers setup through finish and marks lineups unverified", () => {
  const t = createTemplate();
  assert(parseEntry(t));
  assert.equal(t.roles.length, 5);
  assert.equal(t.kind, "round");
  assert.equal(t.steps.length, 5);
  assert.match(t.grenades[0].aim, /не готовая раскидка/);
  assert(t.fallback);
});
