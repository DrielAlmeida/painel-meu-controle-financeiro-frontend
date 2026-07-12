export type ExportRow = Record<string, string | number | boolean | null | undefined>;

function downloadBlob(content: BlobPart, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportCsv(rows: ExportRow[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.map(escapeCsv).join(";"), ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(";"))].join("\n");
  downloadBlob(`\ufeff${csv}`, "text/csv;charset=utf-8", `${filename}.csv`);
}

export function exportExcel(rows: ExportRow[], filename: string, title = "Relatório") {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const table = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1>${table}</body></html>`;
  downloadBlob(`\ufeff${html}`, "application/vnd.ms-excel;charset=utf-8", `${filename}.xls`);
}

export function exportPdf(rows: ExportRow[], title = "Relatório financeiro") {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const table = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
  const popup = window.open("", "_blank", "width=1000,height=700");
  if (!popup) return;
  popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{margin:0 0 20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f1f5f9}@media print{button{display:none}}</style></head><body><h1>${title}</h1>${table}<script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
}
