// public/JS/home.js
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "./login.html";
}

let expenses = [];
let currentPage = 1;
let rowsPerPage = 10;
let totalPages = 1;

async function home(event) {
    event.preventDefault();
    const amount = Number(document.querySelector("#amount").value);
    const description = document.querySelector("#description").value.trim();
    const category = document.querySelector("#category").value;
    const token = localStorage.getItem("token");

    if (!amount || !description || !category) {
        return alert("Please fill all fields");
    }

    const expenseData = { amount, description, category };

    try {
        await axios.post("/home", expenseData, {
         headers: { Authorization: `Bearer ${token}` },
         }
        );
        alert("Expense added successfully");
        await fetchExpenses();
        event.target.reset();
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
        renderTable();
    } catch (err) {
        console.error("Unable to fetch data", err);
        if (err.response) {
            console.error("Failed to fetch expenses:", err.response.data.error || err.response.data.message);
        }
    }
}

function renderTable() {
    const tbody = document.getElementById("expenseList");
    tbody.innerHTML = "";

    if (!expenses || expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No expenses found.</td></tr>';
        updatePageInfo();
        return;
    }

    expenses.forEach(expense => {
        const row = document.createElement("tr");
        row.dataset.id = expense._id; 
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

async function deleteExpense(id) { 
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
        await axios.delete(`/home/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await fetchExpenses();
        if (expenses.length === 0 && currentPage > 1) {
            currentPage--;
            await fetchExpenses();
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong!");
    }
}

document.getElementById("expenseList").addEventListener("click", async e => {
    if (e.target.classList.contains("delete-btn")) {
        const row = e.target.closest("tr");
        const id = row?.dataset.id;
        if (id) await deleteExpense(id);
    }
});

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
    checkPremiumStatus();
}

display();

async function checkPremiumStatus(redirectIfNotPremium = false) {
  const token = localStorage.getItem("token");
  if (!token) {
  window.location.href = "./login.html";
  return;
  }

  try {
    const res = await axios.get("/premium/status", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const status = res.data.status;
    const buyBtn = document.getElementById("renderBtn");
    const leaderboardLink = document.querySelector('a[href="./leaderboard.html"]');
    const reportLink = document.querySelector('a[href="./report.html"]');

    if (status === "SUCCESSFUL") {
      if (buyBtn) buyBtn.style.display = "none";
      leaderboardLink?.classList.remove("disabled-link");
      reportLink?.classList.remove("disabled-link");

      if (!document.querySelector(".premium-badge")) {
        const badge = document.createElement("span");
        badge.textContent = "🌟 Premium User";
        badge.classList.add("premium-badge");
        document.querySelector(".nav-actions").prepend(badge);
      }
    } else {
      if (buyBtn) buyBtn.style.display = "inline-block";
      [leaderboardLink, reportLink].forEach(link => {
        if (link) {
          link.classList.add("disabled-link");
          link.addEventListener(
            "click",
            e => {
              e.preventDefault();
              e.stopImmediatePropagation();
              alert("🚫 This feature is available only for Premium Users.");
            },
            { capture: true }
          );
        }
      });
    }
  } catch (err) {
    console.error("Error checking premium status:", err);
  }
}

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

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
});

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