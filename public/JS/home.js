let expenses = [];
let currentPage = 1;
let rowsPerPage = 10;
let totalPages = 1;

async function home(event) {
    event.preventDefault();

    const amountInput = document.querySelector("#amount");
    const descriptionInput = document.querySelector("#description");
    const categoryInput = document.querySelector("#category");

    const amount = Number(amountInput.value);
    const description = descriptionInput.value.trim();
    const category = categoryInput.value;
    const token = localStorage.getItem("token");

    if (!amount || !description || !category) {
        return alert("Please fill all fields");
    }

    try {
        await axios.post(
            "/home",
            { amount, description, category },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Expense added successfully");
        await fetchExpenses(); // keep separate
    } catch (err) {
        console.error("Error:", err);
        alert(err.response?.data?.error || "Failed to add expense.");
    }
}

async function fetchExpenses() {
    const token = localStorage.getItem("token");
    try {
        const res = await axios.get("/home", {
            params: { page: currentPage, limit: rowsPerPage },
            headers: { Authorization: `Bearer ${token}` }
        });
        
        expenses = res.data.expenses || [];
        totalPages = res.data.totalPages || 1;

        renderTable(); // render separately
    } catch (err) {
        console.error("Unable to fetch data", err);
        if (err.response) {
            console.error("Failed to fetch expenses:", err.response.data.error || err.response.data.message);
        }
    }
}

function renderTable() {
    const tbody = document.getElementById("expenseList");
    tbody.innerHTML = ""; // Clear previous entries

    if (!expenses || expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No expenses found.</td></tr>';
        updatePageInfo();
        return;
    }

    expenses.forEach(expense => {
        const row = document.createElement("tr");
        row.dataset.id = expense.id; // for event delegation
        row.innerHTML = `
            <td>${expense.amount}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td><button class="delete-btn">Delete Expense</button></td>
        `;
        tbody.appendChild(row);
    });

    updatePageInfo();
}

function updatePageInfo() {
    document.querySelector("#pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;
}

/* ✅ Simplified deleteExpense logic */
async function deleteExpense(id) { 
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
        await axios.delete(`/home/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Re-fetch to update table
        await fetchExpenses();

        // If page is empty after deletion → go back one page
        if (expenses.length === 0 && currentPage > 1) {
            currentPage--;
            await fetchExpenses();
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong!");
    }
}

/* ✅ Use Event Delegation for Delete Buttons */
document.getElementById("expenseList").addEventListener("click", async e => {
    if (e.target.classList.contains("delete-btn")) {
        const row = e.target.closest("tr");
        const id = row?.dataset.id;
        if (id) await deleteExpense(id);
    }
});

/* Pagination controls */
document.getElementById("rowsPerPage").addEventListener("change", async e => {
    rowsPerPage = parseInt(e.target.value);
    currentPage = 1;
    await fetchExpenses();
});

document.getElementById("prevBtn").addEventListener("click", async () => {
    if (currentPage > 1) {
        currentPage--;
        await fetchExpenses();
    }
});

document.getElementById("nextBtn").addEventListener("click", async () => {
    if (currentPage < totalPages) {
        currentPage++;
        await fetchExpenses();
    }
});

async function display() {
    await fetchExpenses();
    premiumFeatures();
}

display();

/* PREMIUM USER CHECK AND FEATURES */
async function premiumFeatures() {
    const token = localStorage.getItem("token");

    try {
        const { status } = (await axios.get("/premium/status", {
            headers: { Authorization: `Bearer ${token}` }
        })).data;

        if (status !== "SUCCESSFUL") return;

        const buyPremiumBtn = document.querySelector("#renderBtn");
        if (buyPremiumBtn) buyPremiumBtn.style.display = "none";

        document.querySelector("#premiumUser").innerHTML = `<p>You are a premium user now</p>`;

        const leaderBtn = document.querySelector("#leaderBtn");
        leaderBtn.innerHTML = '';
        const leaderBoardBtn = document.createElement("button");
        leaderBoardBtn.textContent = "Show LeaderBoard";
        leaderBoardBtn.onclick = () => window.location.href = "leaderboard.html";
        leaderBtn.appendChild(leaderBoardBtn);

        generateReport();
    } catch (err) {
        console.error("Unable to fetch premium status", err);
    }
}

/* REPORT GENERATION */
function generateReport() {
    const reportDiv = document.getElementById("reportDiv");
    reportDiv.innerHTML = `
        <input type="number" placeholder="Enter your monthly salary" id="salaryInput" />
        <button id="generateReportBtn">Generate Report</button>
    `;
    document.getElementById("generateReportBtn").onclick = () => {
        const salary = document.getElementById("salaryInput").value.trim();
        if (!salary) return alert("Please enter your salary");
        localStorage.setItem("userSalary", salary);
        window.location.href = "report.html";
    };
}

/* BUY PREMIUM BUTTON */
document.getElementById("renderBtn").addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    try {
        const res = await axios.get("/payment/premium", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const { payment_session_id } = res.data;
        if (!payment_session_id) throw new Error("Failed to create payment session");

        const cashfree = new Cashfree({ mode: "sandbox" });
        cashfree.checkout({ paymentSessionId: payment_session_id });
    } catch (err) {
        const message = err.response?.data?.error || err.message;
        alert("Error starting payment: " + message);
    }
});

/* DOWNLOAD EXPENSES */
document.getElementById("downloadExpences").addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    try {
        const linkexpenses = await axios.get("/home/download", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (linkexpenses.status === 200) {
            window.location.href = linkexpenses.data.link;
        }

    } catch (error) {
        console.error(error);
    }
});
