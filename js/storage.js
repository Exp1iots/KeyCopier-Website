const KEYS_STORAGE = "keycopier_saved_keys";

function readAll() {
  try {
    const raw = localStorage.getItem(KEYS_STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(KEYS_STORAGE, JSON.stringify(list));
}

export function listSavedKeys() {
  return readAll().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveKey({ name, manufacturer, formatName, depths }) {
  const list = readAll();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name || `${manufacturer} ${formatName}`,
    manufacturer,
    formatName,
    depths: [...depths],
    savedAt: Date.now(),
  };
  list.push(entry);
  writeAll(list);
  return entry;
}

export function deleteKey(id) {
  writeAll(readAll().filter((k) => k.id !== id));
}

export function exportAllAsJson() {
  return JSON.stringify(readAll(), null, 2);
}

export function importFromJson(json) {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("Invalid file: expected an array of saved keys");
  const list = readAll();
  const existingIds = new Set(list.map((k) => k.id));
  let added = 0;
  for (const item of parsed) {
    if (!item || !item.formatName || !Array.isArray(item.depths)) continue;
    const id = existingIds.has(item.id) ? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : item.id;
    list.push({ ...item, id, savedAt: item.savedAt || Date.now() });
    added++;
  }
  writeAll(list);
  return added;
}
