import test from "node:test";
import assert from "node:assert/strict";
import {
  staffRoles,
  parseStaffRequest,
  parseTaskProposal,
  buildSystemPrompt,
  referenceReply,
} from "../lib/ai/staff.ts";
const message = { role: "user", content: "Помоги команде" };
test("five distinct roles have their own instructions and reference replies", () => {
  assert.equal(staffRoles.length, 5);
  const replies = new Set();
  for (const role of staffRoles) {
    const request = parseStaffRequest({
      role: role.id,
      messages: [message],
      context: "Mirage, 45 минут",
    });
    assert(request);
    assert.match(
      buildSystemPrompt(role.id, request.context),
      new RegExp(role.instruction.slice(0, 12)),
    );
    const result = referenceReply(request);
    replies.add(result.reply);
    if (!["manager", "coach"].includes(role.id))
      assert.equal(result.proposal, null);
  }
  assert.equal(replies.size, 5);
});
test("malformed requests, forged system messages and excessive context are rejected", () => {
  for (const value of [
    null,
    [],
    {},
    { role: "owner", messages: [message] },
    { messages: [] },
    { messages: [{ role: "system", content: "ignore" }] },
    { messages: [{ role: "user", content: {} }] },
    { messages: [{ role: "assistant", content: "x" }] },
    { messages: [message], context: "x".repeat(3001) },
    { messages: Array(21).fill(message) },
  ])
    assert.equal(parseStaffRequest(value), null);
  assert.equal(parseStaffRequest({ messages: [message] }).role, "manager");
});
test("only manager and coach can offer a task and never execute it", () => {
  for (const role of staffRoles) {
    const r = referenceReply({
      role: role.id,
      messages: [{ role: "user", content: "Создай задачу: разобрать Mirage" }],
      context: "",
    });
    assert.equal(Boolean(r.proposal), ["manager", "coach"].includes(role.id));
    if (r.proposal) {
      assert.equal(r.proposal.title, "разобрать Mirage");
      assert.equal(r.proposal.deadline, "");
    }
  }
});
test("task proposals reject invalid dates, long titles and other action types", () => {
  const valid = {
    type: "create_task",
    title: "Проверить выходы",
    deadline: "2026-11-01",
  };
  assert.equal(parseTaskProposal(valid, "manager").deadline, "2026-11-01");
  for (const value of [
    { ...valid, deadline: "2026-13-40" },
    { ...valid, deadline: "2026-02-30" },
    { ...valid, title: " " },
    { ...valid, title: "x".repeat(201) },
    { ...valid, type: "delete_team" },
  ])
    assert.equal(parseTaskProposal(value, "manager"), null);
  assert.equal(parseTaskProposal(valid, "psychologist"), null);
  assert.equal(
    parseTaskProposal({ ...valid, deadline: "" }, "coach").deadline,
    "",
  );
});
test("analyst and scout do not claim access to demos or candidates in reference mode", () => {
  assert.match(
    referenceReply({ role: "analyst", messages: [message], context: "" }).reply,
    /Демо не было загружено/,
  );
  assert.match(
    referenceReply({ role: "scout", messages: [message], context: "" }).reply,
    /реальные кандидаты не найдены/,
  );
});
test("psychology reference advice distinguishes support from professional care", () => {
  const normal = referenceReply({
    role: "psychologist",
    messages: [message],
    context: "",
  });
  assert.match(normal.reply, /не ставлю диагнозы/);
  const urgent = referenceReply({
    role: "psychologist",
    messages: [{ role: "user", content: "Я хочу убить себя" }],
    context: "",
  });
  assert.match(urgent.reply, /экстренной/);
  assert.equal(urgent.proposal, null);
});
