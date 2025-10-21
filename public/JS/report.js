let currentPage = 1;
let totalPages = 1;
let selectedDate = null;   // for daily
let selectedMonth = null;  // for monthly
let selectedYear = null;   // for monthly

const generateBtn = document.getElementById("generateReportBtn");
const downloadBtn = document.getElementById("downloadBtn");

// 🔒 Disable both buttons initially
generateBtn.disabled = true;
downloadBtn.disabled = true;

document.getElementById("filterSelect").addEventListener("change", (e) => {
    const filter = e.target.value;
    const dateContainer = document.getElementById("dateContainer");
    dateContainer.innerHTML = "";

    // Reset selections
    selectedDate = null;
    selectedMonth = null;
    selectedYear = null;
    generateBtn.disabled = true;
    downloadBtn.disabled = true;

    if (filter === "daily") {
        const input = document.createElement("input");
        input.type = "date";
        input.id = "dailyDate";
        input.onchange = () => {
            selectedDate = input.value;
            const enable = !!selectedDate;
            generateBtn.disabled = !enable;
            downloadBtn.disabled = !enable;
        };
        dateContainer.appendChild(input);

    } else if (filter === "monthly") {
        const monthInput = document.createElement("input");
        monthInput.type = "month";
        monthInput.id = "monthDate";
        monthInput.onchange = () => {
            const [year, month] = monthInput.value.split("-");
            selectedYear = year;
            selectedMonth = month;
            const enable = selectedMonth && selectedYear;
            generateBtn.disabled = !enable;
            downloadBtn.disabled = !enable;
        };
        dateContainer.appendChild(monthInput);
    }
    // For "all" or invalid option → both stay disabled
});

generateBtn.addEventListener("click", () => {
    // Button only works when enabled
    currentPage = 1;
    fetchExpenses();
});

downloadBtn.addEventListener("click", downloadCSV);

document.getElementById("prevPageBtn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        fetchExpenses();
    }
});

document.getElementById("nextPageBtn").addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchExpenses();
    }
});

document.getElementById("rowsPerPage").addEventListener("change", () => {
    currentPage = 1;
    fetchExpenses();
});

async function fetchExpenses() {
    const token = localStorage.getItem("token");
    const filter = document.getElementById("filterSelect").value;
    const salary = localStorage.getItem("userSalary") || "0";
    const limit = document.getElementById("rowsPerPage").value;
    const pageIndicator = document.getElementById("pageIndicator");
    pageIndicator.textContent = "Loading...";

    let params = { page: currentPage, limit, filter, salary };

    if (filter === "daily" && selectedDate) params.date = selectedDate;
    if (filter === "monthly" && selectedMonth && selectedYear) {
        params.month = selectedMonth;
        params.year = selectedYear;
    }

    try {
        const res = await axios.get("/report/paginated-and-filtered", {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data;
        totalPages = data.totalPages;
        renderTableAndSummary(data);
        updatePageIndicator(totalPages);

    } catch (err) {
        console.error(err);
        const message = err.response?.data?.error || "Unable to fetch report data.";
        alert(message);
        pageIndicator.textContent = "Error";
        document.getElementById("reportTableBody").innerHTML =
            '<tr><td colspan="4">Error loading data.</td></tr>';
    }
}

function renderTableAndSummary(data) {
    const { expenses, totalMonthlyExpense, savings } = data;
    const salary = localStorage.getItem("userSalary") || "0";
    const tbody = document.getElementById("reportTableBody");
    const summaryDiv = document.getElementById("monthlySummary");

    tbody.innerHTML = "";
    summaryDiv.innerHTML = "";

    if (typeof savings !== 'undefined') {
        summaryDiv.innerHTML = `
            <div style="background-color: #f0f8ff; border: 1px solid #d1e7fd; padding: 10px; border-radius: 5px; margin-top: 10px;">
                <strong>Summary:</strong> 
                Salary (₹${parseFloat(salary).toFixed(2)}) - 
                Total Expenses (₹${totalMonthlyExpense.toFixed(2)}) = 
                <strong>Savings (₹${savings.toFixed(2)})</strong>
            </div>
        `;
    }

    if (!expenses || expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No expenses found for this period.</td></tr>';
        return;
    }

    expenses.forEach((exp) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${exp.amount}</td>
            <td>${exp.description}</td>
            <td>${exp.category}</td>
            <td>${new Date(exp.createdAt).toLocaleDateString()}</td>
        `;
        tbody.appendChild(row);
    });
}

function updatePageIndicator(totalPages) {
    document.getElementById("pageIndicator").textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prevPageBtn").disabled = currentPage <= 1;
    document.getElementById("nextPageBtn").disabled = currentPage >= totalPages;
}

async function downloadCSV() {
    const token = localStorage.getItem("token");
    const filter = document.getElementById("filterSelect").value;
    const salary = localStorage.getItem("userSalary") || "0";

    let params = { filter, salary };
    if (filter === "daily" && selectedDate) params.date = selectedDate;
    if (filter === "monthly" && selectedMonth && selectedYear) {
        params.month = selectedMonth;
        params.year = selectedYear;
    }

    try {
        const res = await axios.get("/report/download", {
            params,
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob"
        });

        const blob = res.data;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "expense_report.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error(err);
        alert(err.message || "Failed to download CSV.");
    }
}
