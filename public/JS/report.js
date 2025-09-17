let currentPage = 1;
let totalPages = 1;

document.addEventListener("DOMContentLoaded", () => {
    fetchExpenses(); // Fetch initial report on page load
});

document.getElementById("generateReportBtn").addEventListener("click", () => {
    currentPage = 1;
    fetchExpenses();
});

document.getElementById("downloadBtn").addEventListener("click", downloadCSV);

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
    const limit = document.getElementById("rowsPerPage").value; // 👈 get selected value
    const pageIndicator = document.getElementById("pageIndicator");
    pageIndicator.textContent = "Loading...";

    try {
        const res = await fetch(
            `http://localhost:3000/report/paginated-and-filtered?page=${currentPage}&limit=${limit}&filter=${filter}&salary=${salary}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to fetch report");
        }

        const data = await res.json();
        totalPages = data.totalPages;
        renderTableAndSummary(data);
        updatePageIndicator(totalPages);

    } catch (err) {
        console.error(err);
        alert(err.message || "Unable to fetch report data.");
        pageIndicator.textContent = "Error";
        document.getElementById("reportTableBody").innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
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
                <strong>Monthly Summary:</strong> 
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
    document.getElementById("prevPageBtn").disabled = (currentPage <= 1);
    document.getElementById("nextPageBtn").disabled = (currentPage >= totalPages);
}

async function downloadCSV() {
    const token = localStorage.getItem("token");
    const filter = document.getElementById("filterSelect").value;
    const salary = localStorage.getItem("userSalary") || "0";

    try {
        const res = await fetch(
            `http://localhost:3000/report/download?filter=${filter}&salary=${salary}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to download CSV.");
        
        const blob = await res.blob();
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
        alert(err.message);
    }
}
