import { test } from "node:test";
import assert from "node:assert/strict";
import { buildScript, highlight, estimateTokens, optimizePrompt, HARDENING } from "./script.js";

test("buildScript includes only selected blocks, in catalog order", () => {
  const s = buildScript(["ntp", "bloat"]);
  assert.ok(s.indexOf("Remove consumer bloatware") < s.indexOf("Sync time"));
  assert.ok(!s.includes("BitLocker"));
  assert.ok(s.trimEnd().endsWith('Write-Log "Done"'));
});

test("buildScript with nothing selected asks for a step", () => {
  assert.match(buildScript([]), /Pick at least one/);
});

test("highlight round-trips the source exactly", () => {
  const all = buildScript(HARDENING.map((h) => h.id));
  assert.equal(highlight(all).map((t) => t[0]).join(""), all);
  assert.ok(highlight(all).some(([, k]) => k === "cmdlet"));
});

test("token optimizer trims filler and never grows the prompt", () => {
  const p = "Could you please   basically summarize this report\n\n\n\nin order to brief the team?";
  const o = optimizePrompt(p);
  assert.equal(o, "summarize this report\n\nbrief the team?");
  assert.ok(estimateTokens(o) < estimateTokens(p));
});
