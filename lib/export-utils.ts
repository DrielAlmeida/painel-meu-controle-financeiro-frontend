export type ExportRow = Record<
  string,
  string | number | boolean | null | undefined
>;

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

function asText(value: unknown) {
  return value == null ? "" : String(value);
}

function neutralizeSpreadsheetFormula(value: unknown) {
  const text = asText(value);
  return /^\s*[=+\-@]/.test(text) ? `'${text}` : text;
}

function escapeCsv(value: unknown) {
  const text = neutralizeSpreadsheetFormula(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(value: unknown) {
  return asText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlTable(rows: ExportRow[], protectSpreadsheet = false) {
  const headers = Object.keys(rows[0]);
  const safeCell = (value: unknown) =>
    escapeHtml(
      protectSpreadsheet ? neutralizeSpreadsheetFormula(value) : value,
    );

  return `<table><thead><tr>${headers
    .map((header) => `<th>${safeCell(header)}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map(
      (row) =>
        `<tr>${headers
          .map((header) => `<td>${safeCell(row[header])}</td>`)
          .join("")}</tr>`,
    )
    .join("")}</tbody></table>`;
}

export function exportCsv(rows: ExportRow[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(escapeCsv).join(";"),
    ...rows.map((row) =>
      headers.map((header) => escapeCsv(row[header])).join(";"),
    ),
  ].join("\n");
  downloadBlob(
    `\ufeff${csv}`,
    "text/csv;charset=utf-8",
    `${filename}.csv`,
  );
}

export function exportExcel(
  rows: ExportRow[],
  filename: string,
  title = "Relatório",
) {
  if (!rows.length) return;
  const table = htmlTable(rows, true);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body><h1>${escapeHtml(title)}</h1>${table}</body></html>`;
  downloadBlob(
    `\ufeff${html}`,
    "application/vnd.ms-excel;charset=utf-8",
    `${filename}.xls`,
  );
}

export function exportPdf(
  rows: ExportRow[],
  title = "Relatório financeiro",
) {
  if (!rows.length) return;

  const popup = window.open("", "_blank", "width=1000,height=700");
  if (!popup) return;

  popup.opener = null;
  const popupDocument = popup.document;
  const meta = popupDocument.createElement("meta");
  meta.setAttribute("charset", "utf-8");

  const style = popupDocument.createElement("style");
  style.textContent =
    "body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{margin:0 0 20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f1f5f9}";

  const heading = popupDocument.createElement("h1");
  heading.textContent = title;

  const table = popupDocument.createElement("table");
  const headers = Object.keys(rows[0]);
  const tableHead = popupDocument.createElement("thead");
  const headerRow = popupDocument.createElement("tr");

  for (const header of headers) {
    const cell = popupDocument.createElement("th");
    cell.textContent = header;
    headerRow.appendChild(cell);
  }

  tableHead.appendChild(headerRow);
  table.appendChild(tableHead);

  const tableBody = popupDocument.createElement("tbody");
  for (const row of rows) {
    const tableRow = popupDocument.createElement("tr");
    for (const header of headers) {
      const cell = popupDocument.createElement("td");
      cell.textContent = asText(row[header]);
      tableRow.appendChild(cell);
    }
    tableBody.appendChild(tableRow);
  }

  table.appendChild(tableBody);
  popupDocument.title = title;
  popupDocument.head.replaceChildren(meta, style);
  popupDocument.body.replaceChildren(heading, table);

  window.setTimeout(() => {
    popup.focus();
    popup.print();
  }, 0);
}
