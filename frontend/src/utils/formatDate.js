/**
 * Parse an ISO string from the backend (which may lack the trailing 'Z')
 * and treat it as UTC so the browser converts to the user's local timezone.
 */
function parseUTC(iso) {
  if (!iso) return new Date(NaN);
  // If it already has a timezone offset or 'Z', parse as-is
  if (iso.endsWith("Z") || iso.includes("+") || /\d{2}:\d{2}$/.test(iso.slice(-6))) {
    return new Date(iso);
  }
  // Otherwise append Z to force UTC interpretation
  return new Date(iso + "Z");
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = parseUTC(iso);
  if (isNaN(d)) return "";
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso) {
  if (!iso) return "";
  const d = parseUTC(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString(undefined, {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function formatDateOnly(iso) {
  if (!iso) return "";
  const d = parseUTC(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
