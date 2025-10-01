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
            "http://localhost:3000/home",
            { amount, description, category },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Expense added successfully");
        await fetchExpenses();
        renderTable();

    } catch (err) {
        console.error("Error:", err);
        alert(err.response?.data?.error || "Failed to add expense.");
    }

    amountInput.value = "";
    descriptionInput.value = "";
    categoryInput.value = "";
}


async function fetchExpenses() {
    const token = localStorage.getItem("token");
    try {
        const res = await axios.get("http://localhost:3000/home", {
            params: { page: currentPage, limit: rowsPerPage },
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        expenses = res.data.expenses || [];
        totalPages = res.data.totalPages || 1;
        
    } catch (err) {
        console.error("Unable to fetch data", err);
        if (err.response) {
            console.error("Failed to fetch expenses:", err.response.data.error || err.response.data.message);
        }
    }
}

function renderTable() {
    const parentNode = document.querySelector("#expenseList");

    if (expenses.length === 0) {
        parentNode.innerHTML = "<li>No expenses found</li>";
    } else {
        parentNode.innerHTML = expenses.map(expense => `
            <li class="expense-item">
                ${expense.amount} | ${expense.description} | ${expense.category}
                <button onclick="deleteExpense(${expense.id}, this.parentNode)">Delete Expense</button>
            </li>
        `).join("");
    }

    updatePageInfo();
}



function updatePageInfo() {
    document.querySelector("#pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;
}

async function deleteExpense(id, li) {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
        // 1️⃣ Delete the expense from backend
        await axios.delete(`http://localhost:3000/home/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 2️⃣ Fetch current page
        await fetchExpenses();

        // 3️⃣ Fill current page if it has fewer than rowsPerPage and there are more pages
        while (expenses.length < rowsPerPage && currentPage < totalPages) {
            currentPage++; // move to next page
            const res = await axios.get("http://localhost:3000/home", {
                params: { page: currentPage, limit: rowsPerPage },
                headers: { Authorization: `Bearer ${token}` }
            });
            const nextExpenses = res.data.expenses || [];
            if (nextExpenses.length === 0) break;

            // Take only needed number to fill the current page
            const needed = rowsPerPage - expenses.length;
            expenses = expenses.concat(nextExpenses.slice(0, needed));

            // If there are leftover items in next page, keep them for that page
            // (optional: you can update a local cache of pages if needed)
        }

        // 4️⃣ If current page is empty, go back one page
        if (expenses.length === 0 && currentPage > 1) {
            currentPage--;
            await fetchExpenses();
        }

        renderTable();

    } catch (err) {
        console.error(err);
        alert("Something went wrong!");
    }
}




// Pagination controls
document.getElementById("rowsPerPage").addEventListener("change", async e => {
    rowsPerPage = parseInt(e.target.value);
    currentPage = 1;
    await fetchExpenses();
    renderTable();
});

document.getElementById("prevBtn").addEventListener("click", async () => {
    if (currentPage > 1) {
        currentPage--;
        await fetchExpenses();
        renderTable();
    }
});

document.getElementById("nextBtn").addEventListener("click", async () => {
    if (currentPage < totalPages) {
        currentPage++;
        await fetchExpenses();
        renderTable();
    }
});


async function display() {
    await fetchExpenses();
    renderTable();
    premiumFeatures();
}

display();

// PREMIUM USER CHECK AND FEATURES
async function premiumFeatures() {
    const token = localStorage.getItem("token");

    try {
        const { status } = (await axios.get("http://localhost:3000/premium/status", {
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


// REPORT GENERATION
async function generateReport() {
    const reportContainer = document.createElement("div");
    const salaryInput = document.createElement("input");
    salaryInput.type = "number";
    salaryInput.placeholder = "Enter your monthly salary";
    salaryInput.id = "salaryInput";

    const reportBtn = document.createElement("button");
    reportBtn.textContent = "Generate Report";

    reportBtn.onclick = () => {
        const salary = salaryInput.value.trim();
        if (!salary) {
            alert("Please enter your salary first.");
            return;
        }
        localStorage.setItem("userSalary", salary);
        window.location.href = "report.html";
    };

    reportContainer.appendChild(salaryInput);
    reportContainer.appendChild(reportBtn);
    document.getElementById("reportDiv").appendChild(reportContainer);
}

// BUY PREMIUM BUTTON


document.getElementById("renderBtn").addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    try {
        // 1️⃣ Create order on backend (status: PENDING)
        const res = await axios.get("http://localhost:3000/payment/premium", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const { payment_session_id } = res.data;
        if (!payment_session_id) throw new Error("Failed to create payment session");

        // 2️⃣ Initialize Cashfree Drop-in and let it redirect automatically
        const cashfree = new Cashfree({ mode: "sandbox" });
        cashfree.checkout({ paymentSessionId: payment_session_id });

        // No need for onSuccess/onFailure handlers here
    } catch (err) {
        const message = err.response?.data?.error || err.message;
        alert("Error starting payment: " + message);
    }
});
