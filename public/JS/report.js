document.addEventListener("DOMContentLoaded", () => {
  const filterSelect = document.getElementById("filterSelect");
  const generateBtn = document.getElementById("generateReportBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const reportTableBody = document.getElementById("reportTableBody");

  const salary = localStorage.getItem("userSalary") || "N/A";
  document.getElementById("salaryValue").textContent = salary;

  // Helper: get week number
  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  // Filter expenses
  function filterExpenses(data, period) {
    const now = new Date();
    return data.filter(item => {
      const createdAt = new Date(item.createdAt);

      if (period === "daily") {
        return createdAt.toDateString() === now.toDateString();
      }
      if (period === "weekly") {
        return (
          createdAt.getFullYear() === now.getFullYear() &&
          getWeekNumber(createdAt) === getWeekNumber(now)
        );
      }
      if (period === "monthly") {
        return (
          createdAt.getFullYear() === now.getFullYear() &&
          createdAt.getMonth() === now.getMonth()
        );
      }
      return true;
    });
  }

  // Render table
  function renderTable(data) {
    reportTableBody.innerHTML = "";
    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.description}</td>
        <td>${item.amount}</td>
        <td>${item.category}</td>
        <td>${new Date(item.createdAt).toLocaleDateString()}</td>
      `;
      reportTableBody.appendChild(tr);
    });
  }

  // Generate report
  generateBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/expenses");
      const data = await res.json();
      const filter = filterSelect.value;

      const filtered = filterExpenses(data, filter);
      renderTable(filtered);
    } catch (err) {
      console.error(err);
    }
  });

  // Download CSV
  downloadBtn.addEventListener("click", () => {
    let csv = "Description,Amount,Category,Date\n";
    const rows = reportTableBody.querySelectorAll("tr");

    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      const rowData = Array.from(cols).map(td => td.textContent).join(",");
      csv += rowData + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
