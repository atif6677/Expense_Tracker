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

    try {
        const res = await fetch("http://localhost:3000/home", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ amount, description, category })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Expense added successfully");
            await fetchExpenses(); 
            renderTable();
        } else {
            alert(data.error || "Failed to add expense.");
        }
    } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong!");
    }

    amountInput.value = "";
    descriptionInput.value = "";
    categoryInput.value = "";
}

async function fetchExpenses() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`http://localhost:3000/home?page=${currentPage}&limit=${rowsPerPage}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();
        if (res.ok) {
            expenses = data.expenses || [];
            totalPages = data.totalPages || 1;
        } else {
            console.error("Failed to fetch expenses:", data.error || data.message);
        }
    } catch (err) {
        console.error("Unable to fetch data", err);
    }
}

function renderTable() {
    const parentNode = document.querySelector("#expenseList");
    parentNode.innerHTML = "";

    if (expenses.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No expenses found";
        parentNode.appendChild(li);
    } else {
        expenses.forEach(expense => {
            const li = document.createElement("li");
            li.classList.add("expense-item"); // 👈 for counting
            li.textContent = `${expense.amount} | ${expense.description} | ${expense.category}`;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete Expense";
            deleteBtn.onclick = () => deleteExpense(expense.id, li);

            li.appendChild(deleteBtn);
            parentNode.appendChild(li);
        });
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
        const res = await fetch(`http://localhost:3000/home/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            li.remove();

            // ✅ Check if current page became empty
            const remaining = document.querySelectorAll(".expense-item").length;
            if (remaining === 0 && currentPage > 1) {
                currentPage--;
            }

            await fetchExpenses();
            renderTable();
        }
    } catch (err) {
        console.error("Error:", err);
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

// ----------------- PREMIUM USER CHECK AND FEATURES -------------------
async function premiumFeatures() {
    const token = localStorage.getItem("token");

    try {
        const result = await fetch("http://localhost:3000/premium/status", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!result.ok) return;

        const data = await result.json();
        if (data.status !== "SUCCESSFUL") return;

        const buyPremiumBtn = document.querySelector("#renderBtn");
        if (buyPremiumBtn) buyPremiumBtn.style.display = "none";

        const premiumHeader = document.querySelector("#premiumUser");
        premiumHeader.innerHTML = `<p>You are a premium user now</p>`; 

        const leaderBtn = document.querySelector("#leaderBtn");
        const leaderBoardBtn = document.createElement("button");
        leaderBoardBtn.textContent = "Show LeaderBoard";

        const leaderBoardHeading = document.createElement("h3");
        leaderBoardHeading.textContent = "LeaderBoard";

        leaderBtn.appendChild(leaderBoardBtn);

        generateReport(); 

        leaderBoardBtn.onclick = async () => {
            leaderBtn.appendChild(leaderBoardHeading);
            try {
                const res = await fetch("http://localhost:3000/premium/leaderboard");
                const data = await res.json();
                const ul = document.getElementById("leaderboard");
                ul.innerHTML = "";

                data.forEach(user => {
                    const li = document.createElement("li");
                    li.textContent = `${user.name} || ₹${user.totalExpense}`;
                    ul.appendChild(li);
                });
            } catch (err) {
                console.error("Error:", err);
                alert("Unable to fetch Leaderboard");
            }
        };
    } catch (error) {
        console.error("Network error — unable to fetch premium status", error);
    }
}

// ----------------- REPORT GENERATION -------------------
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

// ----------------- BUY PREMIUM BUTTON -------------------

document.getElementById("renderBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  try {
    // 1️⃣ Create order on backend
    const res = await fetch('http://localhost:3000/payment/premium', {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create order');

    // ✅ Get payment_session_id and orderId from backend
    const { payment_session_id, order } = data;
    if (!payment_session_id || !order?.orderId) {
      throw new Error("Invalid order data from server");
    }

    const orderId = order.orderId;

    // 2️⃣ Initialize Cashfree Drop-in
    const cashfree = new Cashfree({ mode: "sandbox" });

    cashfree.checkout({
      paymentSessionId: payment_session_id,

      onSuccess: async (result) => {
        console.log("Payment success data:", result);

        // ✅ Update backend for successful payment
        await fetch(`http://localhost:3000/payment/updateTransactionStatus?order_id=${orderId}`, {
          method: 'GET'
        });

        alert("Transaction Successful ✅");
      },

      onFailure: async (err) => {
        console.error("Payment failed:", err);

        // ✅ Update backend to mark order as FAILED
        await fetch('http://localhost:3000/payment/updateTransactionStatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ order_id: orderId })
        });

        alert("Transaction Failed ❌");
      }
    });

  } catch (err) {
    console.error("Error starting payment:", err);
    alert("Error starting payment: " + err.message);
  }
});
