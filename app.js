import OBR from "https://esm.unpkg.com/@owlbear-rodeo/sdk@3.1.0";

const CHAT_CHANNEL = "com.desordenados.chat-dados/chat";
const SYNC_CHANNEL = "com.desordenados.chat-dados/sync";
const MAX_HISTORY = 500;
const MAX_SYNC = 200;

const ATTRIBUTE_LABELS = {
  AGI: "Agilidade",
  FOR: "Força",
  INT: "Intelecto",
  PRE: "Presença",
  VIG: "Vigor",
};

const SKILLS = [
  ["Acrobacia", "AGI"], ["Adestramento", "PRE"], ["Artes", "PRE"], ["Atletismo", "FOR"],
  ["Atualidades", "INT"], ["Ciências", "INT"], ["Crime", "AGI"], ["Diplomacia", "PRE"],
  ["Enganação", "PRE"], ["Fortitude", "VIG"], ["Furtividade", "AGI"], ["Iniciativa", "AGI"],
  ["Intimidação", "PRE"], ["Intuição", "PRE"], ["Investigação", "INT"], ["Luta", "FOR"],
  ["Medicina", "INT"], ["Ocultismo", "INT"], ["Percepção", "PRE"], ["Pilotagem", "AGI"],
  ["Pontaria", "AGI"], ["Profissão", "INT"], ["Reflexos", "AGI"], ["Religião", "PRE"],
  ["Sobrevivência", "INT"], ["Tática", "INT"], ["Tecnologia", "INT"], ["Vontade", "PRE"],
].map(([name, attribute]) => ({ name, attribute }));

const state = {
  identity: { id: "preview-user", connectionId: "preview-connection", name: "Agente", color: "#b51d26", role: "PLAYER" },
  displayName: "Agente",
  entries: [],
  deletedIds: new Set(),
  roomId: "preview-room",
  selectedSides: 20,
  count: 1,
  modifier: 0,
  keepMode: "highest",
};

const $ = (selector) => document.querySelector(selector);
const feed = $("#feed");
const identityButton = $("#identityButton");
const loading = $("#loading");
const errorBanner = $("#errorBanner");
const messageInput = $("#messageInput");
const testBuilder = $("#testBuilder");
const skillSelect = $("#skillSelect");
const attributeSelect = $("#attributeSelect");
const attributeValue = $("#attributeValue");
const skillBonus = $("#skillBonus");
const builderRule = $("#builderRule");
const diceRow = $("#diceRow");
const diceCount = $("#diceCount");
const modifierInput = $("#modifierInput");
const keepButton = $("#keepButton");

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function randomInt(max) {
  if (globalThis.crypto?.getRandomValues) {
    const range = 0x100000000;
    const limit = range - (range % max);
    const array = new Uint32Array(1);
    let value;
    do {
      globalThis.crypto.getRandomValues(array);
      value = array[0];
    } while (value >= limit);
    return (value % max) + 1;
  }
  return Math.floor(Math.random() * max) + 1;
}

function formatModifier(value) {
  if (!value) return "";
  return value > 0 ? ` + ${value}` : ` - ${Math.abs(value)}`;
}

function displayFormula(formula) {
  return formula
    .replace(/\+/g, " + ")
    .replace(/-(?=\d)/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

function historyKey() {
  return `desordenados.chat-dados.history.${state.roomId}`;
}

function aliasKey() {
  return `desordenados.chat-dados.alias.${state.roomId}.${state.identity.id}`;
}

function deletedKey() {
  return `desordenados.chat-dados.deleted.${state.roomId}`;
}

function loadDeletedIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(deletedKey()) || "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string").slice(-1000) : []);
  } catch {
    return new Set();
  }
}

function saveDeletedIds() {
  try {
    localStorage.setItem(deletedKey(), JSON.stringify([...state.deletedIds].slice(-1000)));
  } catch {}
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(historyKey()) || "[]");
    return Array.isArray(parsed) ? parsed.filter((x) => x?.id && Number.isFinite(x?.createdAt)).slice(-MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  try { localStorage.setItem(historyKey(), JSON.stringify(state.entries.slice(-MAX_HISTORY))); } catch {}
}

function mergeEntries(incoming) {
  const map = new Map();
  [...state.entries, ...incoming].forEach((entry) => {
    if (entry?.id && !state.deletedIds.has(entry.id)) map.set(entry.id, entry);
  });
  state.entries = [...map.values()]
    .filter((entry) => !state.deletedIds.has(entry.id))
    .sort((a,b) => a.createdAt - b.createdAt)
    .slice(-MAX_HISTORY);
  saveHistory();
  renderFeed();
}

function mergeDeletedIds(incoming = []) {
  let changed = false;
  for (const id of incoming) {
    if (typeof id !== "string" || state.deletedIds.has(id)) continue;
    state.deletedIds.add(id);
    changed = true;
  }
  if (!changed) return;
  state.entries = state.entries.filter((entry) => !state.deletedIds.has(entry.id));
  saveDeletedIds();
  saveHistory();
  renderFeed();
}

function canDeleteEntry(entry) {
  return state.identity.role === "GM" || entry.authorId === state.identity.id;
}

async function deleteEntry(entryId) {
  const entry = state.entries.find((item) => item.id === entryId);
  if (!entry || !canDeleteEntry(entry)) return;
  const label = entry.kind === "roll" ? "esta rolagem" : "esta mensagem";
  if (!confirm(`Apagar ${label}?`)) return;

  mergeDeletedIds([entryId]);
  if (!OBR.isAvailable) return;
  try {
    await OBR.broadcast.sendMessage(CHAT_CHANNEL, { type: "delete", entryId }, { destination: "REMOTE" });
  } catch (error) {
    console.error(error);
    setError("A mensagem foi apagada neste navegador, mas a exclusão não foi sincronizada com os outros jogadores.");
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function relativeTime(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 10) return "agora";
  if (seconds < 60) return `${seconds}s atrás`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atrás`;
  const months = Math.floor(days / 30);
  return `${months} mês${months === 1 ? "" : "es"} atrás`;
}

function rollDetailsHtml(entry) {
  const terms = entry.terms.map((term) => {
    let keptMarked = false;
    const rolls = term.rolls.map((value) => {
      const isKept = term.keep && !keptMarked && value === term.kept;
      if (isKept) keptMarked = true;
      return `<b class="${isKept ? "kept" : ""}">${value}</b>`;
    }).join("");
    return `<div class="roll-detail-line"><span>${term.count}d${term.sides}</span><span class="roll-pips">${rolls}</span></div>`;
  }).join("");
  const modifier = entry.modifier ? `<div class="roll-detail-line"><span>Modificador</span><b>${entry.modifier > 0 ? "+" : ""}${entry.modifier}</b></div>` : "";
  return `<details class="roll-details"><summary>ver dados</summary>${terms}${modifier}</details>`;
}

function entryHtml(entry) {
  const author = escapeHtml(entry.authorName);
  const time = relativeTime(entry.createdAt);
  const deleteControl = canDeleteEntry(entry)
    ? `<button class="delete-entry" type="button" data-entry-id="${escapeHtml(entry.id)}" aria-label="Apagar ${entry.kind === "roll" ? "rolagem" : "mensagem"}" title="Apagar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 10v7m4-7v7"/></svg></button>`
    : "";
  const meta = `<header><span class="author-line"><span class="author-signal"></span><strong>${author}</strong></span><div class="card-actions"><time>${time}</time>${deleteControl}</div></header>`;
  if (entry.kind === "chat") {
    return `<article class="message-card chat-card" data-entry-id="${escapeHtml(entry.id)}">
      ${meta}
      <div class="chat-text">${escapeHtml(entry.text)}</div>
    </article>`;
  }
  const naturalClass = entry.natural === 20 ? "natural-20" : entry.natural === 1 ? "natural-1" : "";
  return `<article class="message-card roll-card ${naturalClass}" data-entry-id="${escapeHtml(entry.id)}">
    ${meta}
    <div class="roll-title">${escapeHtml(entry.title)}</div>
    ${entry.subtitle ? `<div class="roll-subtitle">${escapeHtml(entry.subtitle)}</div>` : ""}
    <div class="formula-box"><span class="readout-label">Fórmula</span>${escapeHtml(displayFormula(entry.formula))}</div>
    <div class="result-box">${entry.total}</div>
    ${rollDetailsHtml(entry)}
  </article>`;
}

function renderFeed() {
  if (!state.entries.length) {
    feed.innerHTML = `<div class="empty-state"><div class="empty-d20">20</div><strong>Nenhuma mensagem ainda</strong><span>Envie uma mensagem ou faça a primeira rolagem.</span></div>`;
    return;
  }
  feed.innerHTML = state.entries.map(entryHtml).join("") + '<div id="feedBottom"></div>';
  requestAnimationFrame(() => $("#feedBottom")?.scrollIntoView({ block: "end" }));
}

function setError(message = "") {
  if (!message) {
    errorBanner.textContent = "";
    errorBanner.classList.add("hidden");
    return;
  }
  errorBanner.textContent = message;
  errorBanner.classList.remove("hidden");
}

function author() {
  return {
    authorId: state.identity.id,
    authorName: state.displayName || state.identity.name || "Agente",
    authorColor: state.identity.color || "#b51d26",
  };
}

function makeSimpleRoll({ title, subtitle, count, sides, modifier, keepMode }) {
  count = Math.max(1, Math.min(50, Math.trunc(count)));
  sides = Math.max(2, Math.min(1000, Math.trunc(sides)));
  const rolls = Array.from({ length: count }, () => randomInt(sides));
  const shouldKeep = sides === 20 && count > 1 && keepMode;
  const kept = shouldKeep ? (keepMode === "lowest" ? Math.min(...rolls) : Math.max(...rolls)) : undefined;
  const subtotal = kept ?? rolls.reduce((sum, value) => sum + value, 0);
  return {
    kind: "roll",
    id: makeId(),
    ...author(),
    createdAt: Date.now(),
    title,
    subtitle,
    formula: shouldKeep ? `${count}d${sides}${keepMode === "lowest" ? "kl" : "kh"}${formatModifier(modifier)}` : `${count}d${sides}${formatModifier(modifier)}`,
    total: subtotal + modifier,
    modifier,
    natural: sides === 20 ? (kept ?? rolls[0]) : undefined,
    terms: [{ count, sides, rolls, subtotal, keep: shouldKeep ? keepMode : undefined, kept }],
  };
}

function makeOrderRoll(skill, attribute, attrValue, bonus) {
  if (attrValue <= 0) {
    return makeSimpleRoll({
      title: `Teste de ${skill} com ${ATTRIBUTE_LABELS[attribute]}`,
      subtitle: "Atributo 0 — mantém o menor d20",
      count: 2, sides: 20, modifier: bonus, keepMode: "lowest",
    });
  }
  return makeSimpleRoll({
    title: `Teste de ${skill} com ${ATTRIBUTE_LABELS[attribute]}`,
    subtitle: "Mantém o maior d20",
    count: attrValue, sides: 20, modifier: bonus, keepMode: "highest",
  });
}

function parseAndRollFormula(input) {
  const normalized = input.replace(/\s+/g, "").toLowerCase();
  if (!normalized) throw new Error("Digite uma fórmula.");
  const tokens = normalized.match(/[+-]?[^+-]+/g);
  if (!tokens) throw new Error("Fórmula inválida.");
  let modifier = 0;
  let total = 0;
  let natural;
  const terms = [];

  for (const raw of tokens) {
    const sign = raw.startsWith("-") ? -1 : 1;
    const token = raw.replace(/^[+-]/, "");
    const diceMatch = token.match(/^(\d*)d(\d+)(kh|kl)?$/);
    if (!diceMatch) {
      if (!/^\d+$/.test(token)) throw new Error(`Termo inválido: ${raw}`);
      const value = sign * Number(token);
      modifier += value;
      total += value;
      continue;
    }
    const count = Math.max(1, Math.min(50, Number(diceMatch[1] || "1")));
    const sides = Math.max(2, Math.min(1000, Number(diceMatch[2])));
    const explicitKeep = diceMatch[3];
    const keep = explicitKeep === "kl" ? "lowest" : explicitKeep === "kh" ? "highest" : (sides === 20 && count > 1 ? "highest" : undefined);
    const rolls = Array.from({ length: count }, () => randomInt(sides));
    const kept = keep ? (keep === "lowest" ? Math.min(...rolls) : Math.max(...rolls)) : undefined;
    const subtotal = kept ?? rolls.reduce((sum, value) => sum + value, 0);
    total += sign * subtotal;
    if (natural === undefined && sides === 20) natural = kept ?? rolls[0];
    terms.push({ count, sides, rolls, subtotal: sign * subtotal, keep, kept });
  }

  // Exibe KH automaticamente quando a fórmula recebeu um pool de d20 sem seletor explícito.
  const displayTerms = tokens.map((raw) => {
    const signPrefix = raw.startsWith("-") ? "-" : raw.startsWith("+") ? "+" : "";
    const token = raw.replace(/^[+-]/, "");
    const match = token.match(/^(\d*)d(20)$/);
    if (match && Number(match[1] || "1") > 1) return `${signPrefix}${match[1]}d20kh`;
    return raw;
  }).join("");

  return {
    kind: "roll", id: makeId(), ...author(), createdAt: Date.now(),
    title: "Rolagem personalizada", formula: displayTerms, total, modifier, terms, natural,
  };
}

async function publish(entry) {
  mergeEntries([entry]);
  if (!OBR.isAvailable) return;
  try {
    await OBR.broadcast.sendMessage(CHAT_CHANNEL, { type: "entry", entry }, { destination: "REMOTE" });
  } catch (error) {
    console.error(error);
    setError("A mensagem ficou salva localmente, mas não foi enviada aos outros jogadores.");
  }
}

async function getIdentity() {
  if (!OBR.isAvailable) return state.identity;
  const [connectionId, name, color, role] = await Promise.all([
    OBR.player.getConnectionId(), OBR.player.getName(), OBR.player.getColor(), OBR.player.getRole(),
  ]);
  return { id: OBR.player.id, connectionId, name, color, role };
}

function loadAlias() {
  const stored = localStorage.getItem(aliasKey());
  state.displayName = stored?.trim() || state.identity.name || "Agente";
  identityButton.textContent = `${state.displayName} · ${state.identity.role === "GM" ? "Mestre" : "Jogador"}`;
}

function changeAlias() {
  const next = prompt("Nome que aparecerá no chat e nas rolagens:", state.displayName);
  if (next === null) return;
  const clean = next.trim().slice(0, 40);
  if (!clean) return;
  state.displayName = clean;
  localStorage.setItem(aliasKey(), clean);
  identityButton.textContent = `${clean} · ${state.identity.role === "GM" ? "Mestre" : "Jogador"}`;
}

function populateTestBuilder() {
  skillSelect.innerHTML = SKILLS.map((skill) => `<option value="${skill.name}">${skill.name}</option>`).join("");
  skillSelect.value = "Vontade";
  updateAttributeOptions();
  updateBuilderRule();
}

function selectedSkill() {
  return SKILLS.find((skill) => skill.name === skillSelect.value) || SKILLS[0];
}

function updateAttributeOptions() {
  const base = selectedSkill().attribute;
  const current = attributeSelect.value || "AUTO";
  attributeSelect.innerHTML = `<option value="AUTO">${ATTRIBUTE_LABELS[base]} (base)</option>` +
    Object.entries(ATTRIBUTE_LABELS).map(([key,label]) => `<option value="${key}">${label}</option>`).join("");
  attributeSelect.value = [...attributeSelect.options].some((o) => o.value === current) ? current : "AUTO";
}

function resolvedAttribute() {
  return attributeSelect.value === "AUTO" ? selectedSkill().attribute : attributeSelect.value;
}

function updateBuilderRule() {
  const value = Number(attributeValue.value || 0);
  builderRule.textContent = value <= 0 ? "Atributo 0: 2d20 e mantém o menor." : `${value}d20 e mantém o maior.`;
  $("#orderRollButton").textContent = `Rolar ${skillSelect.value} com ${ATTRIBUTE_LABELS[resolvedAttribute()]}`;
}

const DICE = [4,6,8,10,12,20];
const DIE_ICONS = {
  4: `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4 28 26H4Z"/><path d="M16 4v22M4 26l12-9 12 9"/></svg>`,
  6: `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="22" height="22" rx="1"/><path d="M5 10 10 5M22 27l5-5M10 5l17 17M5 10l17 17"/></svg>`,
  8: `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3 28 16 16 29 4 16Z"/><path d="m16 3 6 13-6 13-6-13Z"/><path d="M4 16h24"/></svg>`,
  10: `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3 26 10l3 10-13 9L3 20l3-10Z"/><path d="M16 3 9 18l7 11 7-11Z"/><path d="M6 10l3 8-6 2M26 10l-3 8 6 2"/></svg>`,
  12: `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 9 5 4 9-5 9-8 3-9-4-4-8 4-9Z"/><path d="m16 8 6 4 1 7-7 5-7-5 1-7Z"/><path d="M16 3v5M7 8l3 4M25 8l-3 4M29 17l-6 2M24 26l-8-2M7 25l2-6M3 17l6 2"/></svg>`,
  20: `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2 12 8v12l-12 8L4 22V10Z"/><path d="m16 2 5 14-5 14-5-14Z"/><path d="M4 10l17 6 7-6M4 22l12-6 12 6"/><path d="m11 16 5-5 5 5-5 5Z"/></svg>`,
};
function renderDiceRow() {
  diceRow.innerHTML = DICE.map((die) => `<button class="die-button ${state.selectedSides === die ? "selected" : ""}" data-die="${die}" title="d${die}" aria-label="Selecionar d${die}"><span class="die-icon">${DIE_ICONS[die]}</span><small>d${die}</small></button>`).join("");
  diceRow.querySelectorAll(".die-button").forEach((button) => button.addEventListener("click", () => {
    state.selectedSides = Number(button.dataset.die);
    renderDiceRow();
    updateTray();
  }));
}

function updateTray() {
  diceCount.textContent = String(state.count);
  modifierInput.value = String(state.modifier);
  const canKeep = state.selectedSides === 20 && state.count > 1;
  keepButton.disabled = !canKeep;
  keepButton.classList.toggle("active", canKeep);
  keepButton.textContent = state.keepMode === "highest" ? "KH" : "KL";
}

async function sendComposer() {
  const text = messageInput.value.trim();
  if (!text) return;
  setError();
  if (text.toLowerCase().startsWith("/r ")) {
    try {
      await publish(parseAndRollFormula(text.slice(3)));
      messageInput.value = "";
    } catch (error) {
      setError(error instanceof Error ? error.message : "Fórmula inválida.");
    }
    return;
  }
  await publish({ kind: "chat", id: makeId(), ...author(), createdAt: Date.now(), text });
  messageInput.value = "";
}

async function initializeOwlbear() {
  if (!OBR.isAvailable) {
    state.roomId = "preview-room";
    state.deletedIds = loadDeletedIds();
    state.entries = loadHistory().filter((entry) => !state.deletedIds.has(entry.id));
    loadAlias();
    renderFeed();
    loading.classList.add("hidden");
    return;
  }

  OBR.onReady(async () => {
    state.identity = await getIdentity();
    state.roomId = OBR.room.id;
    state.deletedIds = loadDeletedIds();
    state.entries = loadHistory().filter((entry) => !state.deletedIds.has(entry.id));
    loadAlias();
    renderFeed();
    loading.classList.add("hidden");

    OBR.broadcast.onMessage(CHAT_CHANNEL, (event) => {
      const payload = event.data;
      if (payload?.type === "entry" && payload.entry) mergeEntries([payload.entry]);
      if (payload?.type === "delete" && payload.entryId) mergeDeletedIds([payload.entryId]);
    });

    OBR.broadcast.onMessage(SYNC_CHANNEL, async (event) => {
      const payload = event.data;
      if (payload?.type === "request" && payload.requester && payload.requester !== state.identity.connectionId) {
        if (Array.isArray(payload.deletedIds)) mergeDeletedIds(payload.deletedIds);
        await OBR.broadcast.sendMessage(SYNC_CHANNEL, {
          type: "history",
          target: payload.requester,
          entries: state.entries.slice(-MAX_SYNC),
          deletedIds: [...state.deletedIds].slice(-1000),
        }, { destination: "REMOTE" });
      }
      if (payload?.type === "history" && payload.target === state.identity.connectionId) {
        if (Array.isArray(payload.deletedIds)) mergeDeletedIds(payload.deletedIds);
        if (Array.isArray(payload.entries)) mergeEntries(payload.entries);
      }
    });

    OBR.player.onChange(async () => {
      state.identity = await getIdentity();
      loadAlias();
    });

    await OBR.broadcast.sendMessage(SYNC_CHANNEL, {
      type: "request",
      requester: state.identity.connectionId,
      deletedIds: [...state.deletedIds].slice(-1000),
    }, { destination: "REMOTE" });
  });
}

// UI events
$("#testToggle").addEventListener("click", () => testBuilder.classList.toggle("hidden"));
$("#testClose").addEventListener("click", () => testBuilder.classList.add("hidden"));
identityButton.addEventListener("click", changeAlias);
skillSelect.addEventListener("change", () => { updateAttributeOptions(); updateBuilderRule(); });
attributeSelect.addEventListener("change", updateBuilderRule);
attributeValue.addEventListener("input", updateBuilderRule);
skillBonus.addEventListener("input", updateBuilderRule);
$("#orderRollButton").addEventListener("click", async () => {
  const skill = selectedSkill();
  const attribute = resolvedAttribute();
  const attrValue = Number(attributeValue.value || 0);
  const bonus = Number(skillBonus.value || 0);
  await publish(makeOrderRoll(skill.name, attribute, attrValue, bonus));
  testBuilder.classList.add("hidden");
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    void sendComposer();
  }
});

feed.addEventListener("click", (event) => {
  const button = event.target.closest?.(".delete-entry");
  if (!button) return;
  void deleteEntry(button.dataset.entryId);
});

$("#countMinus").addEventListener("click", () => { state.count = Math.max(1,state.count-1); updateTray(); });
$("#countPlus").addEventListener("click", () => { state.count = Math.min(50,state.count+1); updateTray(); });
modifierInput.addEventListener("input", () => { state.modifier = Number(modifierInput.value || 0); });
keepButton.addEventListener("click", () => { state.keepMode = state.keepMode === "highest" ? "lowest" : "highest"; updateTray(); });
$("#rollButton").addEventListener("click", async () => {
  const isPool = state.selectedSides === 20 && state.count > 1;
  const entry = makeSimpleRoll({
    title: state.selectedSides === 20 ? "Teste rápido" : "Rolagem de dano / efeito",
    subtitle: isPool ? (state.keepMode === "highest" ? "Pool d20 — mantém o maior" : "Pool d20 — mantém o menor") : undefined,
    count: state.count,
    sides: state.selectedSides,
    modifier: state.modifier,
    keepMode: isPool ? state.keepMode : undefined,
  });
  await publish(entry);
});

populateTestBuilder();
renderDiceRow();
updateTray();
initializeOwlbear().catch((error) => {
  console.error(error);
  loading.classList.add("hidden");
  setError("Não foi possível conectar ao Owlbear Rodeo.");
});
