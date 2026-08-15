import { KEY_FORMATS } from "./keyFormats.js";
import { draw, computeLayout, nearestPin, setPinDepth, defaultDepths, sanitizeDepths, depthIndexFromTopY, depthIndexFromBottomY } from "./renderer.js";
import { getPpi, isCalibrated, initCalibration } from "./calibration.js";
import { listSavedKeys, saveKey, deleteKey, exportAllAsJson, importFromJson } from "./storage.js";

const els = {
  manufacturerSelect: document.getElementById("manufacturerSelect"),
  formatSelect: document.getElementById("formatSelect"),
  specPanel: document.getElementById("specPanel"),
  bittingReadout: document.getElementById("bittingReadout"),
  pinLabel: document.getElementById("pinLabel"),
  pinPrev: document.getElementById("pinPrev"),
  pinNext: document.getElementById("pinNext"),
  depthUp: document.getElementById("depthUp"),
  depthDown: document.getElementById("depthDown"),
  canvas: document.getElementById("keyCanvas"),
  calibWarning: document.getElementById("calibWarning"),
  saveBtn: document.getElementById("saveBtn"),
  myKeysBtn: document.getElementById("myKeysBtn"),
  shareBtn: document.getElementById("shareBtn"),
  keysModal: document.getElementById("keysModal"),
  keysClose: document.getElementById("keysClose"),
  keysList: document.getElementById("keysList"),
  exportAllBtn: document.getElementById("exportAllBtn"),
  importFile: document.getElementById("importFile"),
  saveModal: document.getElementById("saveModal"),
  saveNameInput: document.getElementById("saveNameInput"),
  saveCancel: document.getElementById("saveCancel"),
  saveConfirm: document.getElementById("saveConfirm"),
  toast: document.getElementById("toast"),
};

const ctx = els.canvas.getContext("2d");

const state = {
  formatIndex: 0,
  depths: [],
  selectedPin: 0,
  ppi: getPpi(),
};

function currentFormat() {
  return KEY_FORMATS[state.formatIndex];
}

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.add("hidden"), 1800);
}

// Countries listed first, in this order; any others found in the data are
// appended after, alphabetically, so a new country never gets lost.
const PRIORITY_COUNTRIES = ["Australia"];

const DEFAULT_MANUFACTURER = "Lockwood";

function populateManufacturers() {
  const countryOf = new Map(); // manufacturer -> country
  const manufacturerOrder = []; // first-seen order, for stable within-group ordering
  KEY_FORMATS.forEach((f) => {
    if (countryOf.has(f.manufacturer)) return;
    countryOf.set(f.manufacturer, f.country);
    manufacturerOrder.push(f.manufacturer);
  });

  const manufacturersByCountry = new Map();
  manufacturerOrder.forEach((m) => {
    const country = countryOf.get(m);
    if (!manufacturersByCountry.has(country)) manufacturersByCountry.set(country, []);
    manufacturersByCountry.get(country).push(m);
  });

  const remaining = [...manufacturersByCountry.keys()]
    .filter((c) => !PRIORITY_COUNTRIES.includes(c))
    .sort();
  const countryOrder = [...PRIORITY_COUNTRIES.filter((c) => manufacturersByCountry.has(c)), ...remaining];

  els.manufacturerSelect.innerHTML = "";
  countryOrder.forEach((country) => {
    const group = document.createElement("optgroup");
    group.label = country;
    manufacturersByCountry.get(country).forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      group.appendChild(opt);
    });
    els.manufacturerSelect.appendChild(group);
  });
}

function populateFormats(manufacturer) {
  els.formatSelect.innerHTML = "";
  KEY_FORMATS.forEach((f, i) => {
    if (f.manufacturer !== manufacturer) return;
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = f.formatName;
    els.formatSelect.appendChild(opt);
  });
}

function setFormat(index, { resetDepths = true } = {}) {
  state.formatIndex = index;
  const f = currentFormat();
  els.manufacturerSelect.value = f.manufacturer;
  populateFormats(f.manufacturer);
  els.formatSelect.value = String(index);
  if (resetDepths) {
    state.depths = defaultDepths(f);
    state.selectedPin = 0;
  }
  renderSpec();
  resizeCanvas();
  render();
}

function renderSpec() {
  const f = currentFormat();
  const link = f.formatLink && f.formatLink.startsWith("http")
    ? `<a href="${f.formatLink}" target="_blank" rel="noopener">spec sheet</a>`
    : "";
  els.specPanel.innerHTML = `
    <div><b>${f.manufacturer} ${f.formatName}</b> ${link}</div>
    <div>${f.pinNum} pins &middot; ${f.sides === 2 ? "double-sided" : "single-sided"} &middot; ${f.stop === 2 ? "tip stop" : "shoulder stop"}</div>
    <div>Depth range ${f.minDepthInd}&ndash;${f.maxDepthInd} &middot; step ${f.depthStepIn}" &middot; MACS ${f.macs} &middot; clearance ${f.clearance}</div>
  `;
}

function renderBitting() {
  els.bittingReadout.textContent = state.depths.join("-");
  els.pinLabel.textContent = `Pin ${state.selectedPin + 1} of ${currentFormat().pinNum}`;
}

function dpr() {
  return window.devicePixelRatio || 1;
}

let layout = null;

function resizeCanvas() {
  const f = currentFormat();
  layout = computeLayout(f, state.ppi);
  const ratio = dpr();
  els.canvas.style.width = layout.width + "px";
  els.canvas.style.height = layout.height + "px";
  els.canvas.width = Math.round(layout.width * ratio);
  els.canvas.height = Math.round(layout.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function render() {
  const f = currentFormat();
  draw(ctx, f, state.depths, { pxPerInch: state.ppi, selectedPin: state.selectedPin, theme: "dark" });
  renderBitting();
}

function selectPin(i) {
  const f = currentFormat();
  state.selectedPin = Math.min(Math.max(i, 0), f.pinNum - 1);
  render();
}

function stepDepth(delta) {
  const f = currentFormat();
  const cur = state.depths[state.selectedPin];
  setPinDepth(f, state.depths, state.selectedPin, cur + delta);
  render();
}

function updateCalibWarning() {
  els.calibWarning.classList.toggle("hidden", isCalibrated());
}

// ---- pointer interaction on canvas ----
let dragPinIndex = null;
let dragSide = "top";

els.canvas.addEventListener("pointerdown", (e) => {
  const rect = els.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const f = currentFormat();
  const pin = nearestPin(f, state.ppi, x);
  selectPin(pin);

  const inBlade = y >= layout.topEdgeY - 4 && y <= layout.baselineY + 4;
  if (!inBlade) return;

  dragPinIndex = pin;
  dragSide = f.sides === 2 && y > (layout.topEdgeY + layout.baselineY) / 2 ? "bottom" : "top";
  els.canvas.setPointerCapture(e.pointerId);
  applyDragDepth(y, f);
});

els.canvas.addEventListener("pointermove", (e) => {
  if (dragPinIndex === null) return;
  const rect = els.canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  applyDragDepth(y, currentFormat());
});

function endDrag() {
  dragPinIndex = null;
}
els.canvas.addEventListener("pointerup", endDrag);
els.canvas.addEventListener("pointercancel", endDrag);

function applyDragDepth(y, f) {
  const desired = dragSide === "top"
    ? depthIndexFromTopY(f, state.ppi, layout, y)
    : depthIndexFromBottomY(f, state.ppi, layout, y);
  setPinDepth(f, state.depths, dragPinIndex, desired);
  render();
}

// ---- keyboard ----
function closeModal(modalEl) {
  modalEl.classList.add("hidden");
  if (modalEl.contains(document.activeElement)) {
    document.activeElement.blur();
  }
}

const calibModalEl = document.getElementById("calibModal");

window.addEventListener("keydown", (e) => {
  const active = document.activeElement;
  const tag = active && active.tagName;
  const focusVisible = active && active.offsetParent !== null; // false for inputs left behind in a hidden modal
  if ((tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") && focusVisible) return;
  const anyModalOpen = !els.saveModal.classList.contains("hidden") ||
    !els.keysModal.classList.contains("hidden") ||
    !calibModalEl.classList.contains("hidden");
  if (anyModalOpen) return;
  switch (e.key) {
    case "ArrowLeft":
      selectPin(state.selectedPin - 1);
      e.preventDefault();
      break;
    case "ArrowRight":
      selectPin(state.selectedPin + 1);
      e.preventDefault();
      break;
    case "ArrowUp":
      stepDepth(-1);
      e.preventDefault();
      break;
    case "ArrowDown":
      stepDepth(1);
      e.preventDefault();
      break;
  }
});

// ---- controls ----
els.manufacturerSelect.addEventListener("change", () => {
  populateFormats(els.manufacturerSelect.value);
  const firstIdx = KEY_FORMATS.findIndex((f) => f.manufacturer === els.manufacturerSelect.value);
  setFormat(firstIdx);
});
els.formatSelect.addEventListener("change", () => {
  setFormat(parseInt(els.formatSelect.value, 10));
});
els.pinPrev.addEventListener("click", () => selectPin(state.selectedPin - 1));
els.pinNext.addEventListener("click", () => selectPin(state.selectedPin + 1));
els.depthUp.addEventListener("click", () => stepDepth(-1));
els.depthDown.addEventListener("click", () => stepDepth(1));

// ---- calibration ----
initCalibration({
  onSave: (ppi) => {
    state.ppi = ppi;
    updateCalibWarning();
    resizeCanvas();
    render();
    toast("Calibration saved");
  },
});
updateCalibWarning();

window.addEventListener("resize", () => {
  // Page zoom fires resize and changes devicePixelRatio, which changes how many
  // CSS px span a physical inch, so re-read here to keep the contour true to size.
  state.ppi = getPpi();
  resizeCanvas();
  render();
});

// ---- save / my keys ----
els.saveBtn.addEventListener("click", () => {
  const f = currentFormat();
  els.saveNameInput.value = `${f.manufacturer} ${f.formatName}`;
  els.saveModal.classList.remove("hidden");
  els.saveNameInput.focus();
  els.saveNameInput.select();
});
els.saveCancel.addEventListener("click", () => closeModal(els.saveModal));
els.saveConfirm.addEventListener("click", () => {
  const f = currentFormat();
  saveKey({
    name: els.saveNameInput.value.trim(),
    manufacturer: f.manufacturer,
    formatName: f.formatName,
    depths: state.depths,
  });
  closeModal(els.saveModal);
  toast("Key saved");
});

function renderKeysList() {
  const items = listSavedKeys();
  if (items.length === 0) {
    els.keysList.innerHTML = `<p style="color:var(--dim);font-size:13px;">No saved keys yet.</p>`;
    return;
  }
  els.keysList.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "key-row";
    const date = new Date(item.savedAt).toLocaleDateString();
    row.innerHTML = `
      <div class="key-row-info">
        <div class="name">${escapeHtml(item.name)}</div>
        <div class="meta">${escapeHtml(item.manufacturer)} ${escapeHtml(item.formatName)} &middot; ${escapeHtml(item.depths.join("-"))} &middot; ${date}</div>
      </div>
      <div class="key-row-actions">
        <button class="btn load-btn" type="button">Load</button>
        <button class="btn delete-btn" type="button">Delete</button>
      </div>
    `;
    row.querySelector(".load-btn").addEventListener("click", () => {
      const idx = KEY_FORMATS.findIndex((f) => f.manufacturer === item.manufacturer && f.formatName === item.formatName);
      if (idx === -1) {
        toast("Format not found");
        return;
      }
      setFormat(idx, { resetDepths: false });
      state.depths = sanitizeDepths(currentFormat(), item.depths);
      state.selectedPin = 0;
      render();
      closeModal(els.keysModal);
      toast(`Loaded "${item.name}"`);
    });
    row.querySelector(".delete-btn").addEventListener("click", () => {
      deleteKey(item.id);
      renderKeysList();
    });
    els.keysList.appendChild(row);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

els.myKeysBtn.addEventListener("click", () => {
  renderKeysList();
  els.keysModal.classList.remove("hidden");
});
els.keysClose.addEventListener("click", () => closeModal(els.keysModal));

els.exportAllBtn.addEventListener("click", () => {
  const json = exportAllAsJson();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "key-copier-keys.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

els.importFile.addEventListener("change", async () => {
  const file = els.importFile.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const added = importFromJson(text);
    toast(`Imported ${added} key(s)`);
    renderKeysList();
  } catch (err) {
    toast("Import failed: " + err.message);
  }
  els.importFile.value = "";
});

// ---- clipboard ----
// navigator.clipboard only exists in a secure context (https / localhost), so
// fall back to a temporary selection, then to a prompt the user can copy from.
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through: permission denied or unavailable
    }
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    if (ok) return true;
  } catch {
    // fall through
  }
  // Last resort: show the value so it can be copied by hand. prompt() itself
  // throws in sandboxed/embedded contexts, so it can't be the final word.
  try {
    window.prompt("Copy this:", text);
  } catch {
    toast(`Couldn't copy automatically: ${text}`);
  }
  return false;
}

// ---- copy bitting ----
els.bittingReadout.addEventListener("click", async () => {
  const code = state.depths.join("-");
  const copied = await copyText(code);
  if (!copied) return;
  toast(`Copied ${code}`);
  els.bittingReadout.classList.add("copied");
  clearTimeout(els.bittingReadout._copyTimer);
  els.bittingReadout._copyTimer = setTimeout(
    () => els.bittingReadout.classList.remove("copied"),
    900
  );
});

// ---- share link ----
els.shareBtn.addEventListener("click", async () => {
  const f = currentFormat();
  const url = new URL(window.location.href);
  url.hash = `m=${encodeURIComponent(f.manufacturer)}&f=${encodeURIComponent(f.formatName)}&d=${state.depths.join("-")}`;
  if (await copyText(url.toString())) {
    toast("Link copied");
  }
});

function loadFromHash() {
  if (!window.location.hash) return false;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const m = params.get("m");
  const fmt = params.get("f");
  const d = params.get("d");
  if (!m || !fmt || !d) return false;
  const idx = KEY_FORMATS.findIndex((k) => k.manufacturer === m && k.formatName === fmt);
  if (idx === -1) return false;
  setFormat(idx, { resetDepths: false });
  const f = currentFormat();
  const depths = d.split("-").map((n) => parseInt(n, 10));
  state.depths = sanitizeDepths(f, depths);
  state.selectedPin = 0;
  render();
  return true;
}

// ---- init ----
populateManufacturers();
if (!loadFromHash()) {
  const defaultIndex = KEY_FORMATS.findIndex((f) => f.manufacturer === DEFAULT_MANUFACTURER);
  setFormat(defaultIndex >= 0 ? defaultIndex : 0);
}
