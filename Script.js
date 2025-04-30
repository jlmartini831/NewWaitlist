
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2n-VrmMoEfuyitS1sxAAvbf6bOdkugK1PcpY-ai8N847eOIbuYX6fBEm73t3Sqf1NW-K2nPdZ995C/gviz/tq?tqx=out:json';

async function fetchSheetData() {
  const res = await fetch(sheetUrl);
  const text = await res.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));
  return json.table.rows.map(row => row.c.map(cell => cell ? cell.v : ""));
}

function extractTables(data) {
  let tables = { carnegie: [], cranberryEnroll: [], cranberryGoals: [] };
  let current = null;

  for (let row of data) {
    if (row[0].toLowerCase().includes("carnegie waitlist")) current = "carnegie";
    else if (row[0].toLowerCase().includes("cranberry enrollment")) current = "cranberryEnroll";
    else if (row[0].toLowerCase().includes("cranberry goals")) current = "cranberryGoals";
    else if (current && row.some(cell => cell !== "")) tables[current].push(row);
  }
  return tables;
}

function renderTable(rows) {
  let html = "<table>";
  for (let i = 0; i < rows.length; i++) {
    html += "<tr>";
    for (let cell of rows[i]) {
      html += i === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`;
    }
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

async function updateDashboard() {
  try {
    const data = await fetchSheetData();
    const tables = extractTables(data);

    document.getElementById("carnegie-table").innerHTML = renderTable(tables.carnegie);
    document.getElementById("cranberry-enrollment-table").innerHTML = renderTable(tables.cranberryEnroll);
    document.getElementById("cranberry-goals-table").innerHTML = renderTable(tables.cranberryGoals);

    const today = new Date().toLocaleDateString();
    document.getElementById("lastUpdated").innerText = "Last Updated: " + today;
  } catch (err) {
    console.error("Failed to load data:", err);
  }
}

updateDashboard();
setInterval(updateDashboard, 30000);
