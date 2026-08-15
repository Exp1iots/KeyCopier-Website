const STORAGE_KEY = "keycopier_ppi";
const DEFAULT_PPI = 96;
const MM_PER_IN = 25.4;

// Dimensions in mm (source of truth, shown to the user); converted to inches
// internally since the key contour geometry is defined in inches.
const REF_OBJECTS = {
  card: { wMm: 85.60, hMm: 53.98, shape: "rect" }, // ISO/IEC 7810 ID-1 (credit/ID card)
  aud20: { wMm: 144, hMm: 65, shape: "rect" }, // Australian $20 polymer note
  aud1: { wMm: 25.00, hMm: 25.00, shape: "circle" }, // Australian $1 coin
  aud2: { wMm: 20.50, hMm: 20.50, shape: "circle" }, // Australian $2 coin
};

function mmToIn(mm) {
  return mm / MM_PER_IN;
}

export function getSavedPpi() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const n = raw ? parseFloat(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getPpi() {
  return getSavedPpi() || DEFAULT_PPI;
}

export function isCalibrated() {
  return getSavedPpi() !== null;
}

export function initCalibration({ onSave }) {
  const modal = document.getElementById("calibModal");
  const refSelect = document.getElementById("refObject");
  const boxWrap = document.getElementById("calibBoxWrap");
  const box = document.getElementById("calibBox");
  const handle = document.getElementById("calibHandle");
  const manualField = document.getElementById("manualField");
  const manualPpi = document.getElementById("manualPpi");
  const ppiReadout = document.getElementById("ppiReadout");
  const boxSizeReadout = document.getElementById("boxSizeReadout");
  const nudgeUp = document.getElementById("nudgeUp");
  const nudgeDown = document.getElementById("nudgeDown");
  const cancelBtn = document.getElementById("calibCancel");
  const saveBtn = document.getElementById("calibSave");
  const openBtn = document.getElementById("calibrateBtn");
  const warnBtn = document.getElementById("calibWarningBtn");

  function currentRef() {
    return REF_OBJECTS[refSelect.value] || REF_OBJECTS.card;
  }

  function currentAspect() {
    const { wMm, hMm } = currentRef();
    return { wIn: mmToIn(wMm), hIn: mmToIn(hMm) };
  }

  let boxWidthPx = getPpi() * currentAspect().wIn;

  function setReadouts(ppi) {
    ppiReadout.textContent = `${ppi.toFixed(1)} px/inch · ${(ppi / MM_PER_IN * 10).toFixed(1)} px/cm`;
  }

  function applyBoxSize() {
    const { wMm, hMm, shape } = currentRef();
    const { wIn, hIn } = currentAspect();
    box.style.width = boxWidthPx + "px";
    box.style.height = (boxWidthPx * (hIn / wIn)) + "px";
    box.classList.toggle("circle", shape === "circle");
    const ppi = boxWidthPx / wIn;
    setReadouts(ppi);
    boxSizeReadout.textContent = shape === "circle"
      ? `${wMm.toFixed(1)} mm diameter`
      : `${wMm.toFixed(1)} × ${hMm.toFixed(1)} mm`;
  }

  function syncMode() {
    const manual = refSelect.value === "manual";
    boxWrap.classList.toggle("hidden", manual);
    boxSizeReadout.classList.toggle("hidden", manual);
    manualField.classList.toggle("hidden", !manual);
    if (manual) {
      setReadouts(parseFloat(manualPpi.value || "0"));
    } else {
      applyBoxSize();
    }
  }

  function getPpiFromReadout() {
    const n = parseFloat(ppiReadout.textContent);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_PPI;
  }

  refSelect.addEventListener("change", () => {
    // keep the same physical ppi when swapping reference object
    const ppi = getPpiFromReadout();
    boxWidthPx = ppi * currentAspect().wIn;
    syncMode();
  });

  manualPpi.addEventListener("input", () => {
    setReadouts(parseFloat(manualPpi.value || "0"));
  });

  // drag-resize handle
  let dragging = false;
  let dragStartX = 0;
  let dragStartWidth = 0;

  handle.addEventListener("pointerdown", (e) => {
    dragging = true;
    dragStartX = e.clientX;
    dragStartWidth = boxWidthPx;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    boxWidthPx = Math.max(30, dragStartWidth + dx);
    applyBoxSize();
  });
  const endDrag = () => {
    dragging = false;
  };
  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);

  nudgeUp.addEventListener("click", () => {
    if (refSelect.value === "manual") {
      manualPpi.value = (parseFloat(manualPpi.value || "0") + 0.5).toFixed(1);
      manualPpi.dispatchEvent(new Event("input"));
    } else {
      boxWidthPx += 1;
      applyBoxSize();
    }
  });
  nudgeDown.addEventListener("click", () => {
    if (refSelect.value === "manual") {
      manualPpi.value = Math.max(20, parseFloat(manualPpi.value || "0") - 0.5).toFixed(1);
      manualPpi.dispatchEvent(new Event("input"));
    } else {
      boxWidthPx = Math.max(30, boxWidthPx - 1);
      applyBoxSize();
    }
  });

  function open() {
    const saved = getPpi();
    boxWidthPx = saved * currentAspect().wIn;
    manualPpi.value = saved.toFixed(1);
    syncMode();
    modal.classList.remove("hidden");
  }

  function close() {
    modal.classList.add("hidden");
    if (modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }

  openBtn.addEventListener("click", open);
  warnBtn.addEventListener("click", open);
  cancelBtn.addEventListener("click", close);

  saveBtn.addEventListener("click", () => {
    const ppi = refSelect.value === "manual" ? parseFloat(manualPpi.value) : boxWidthPx / currentAspect().wIn;
    if (Number.isFinite(ppi) && ppi > 0) {
      localStorage.setItem(STORAGE_KEY, String(ppi));
      close();
      onSave && onSave(ppi);
    }
  });

  return { open, close };
}
