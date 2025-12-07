// 🚫 Redirect if user not logged in
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "./login.html";
}

// 🔐 Check if user is premium and update UI
async function checkPremiumAccess() {
  try {
    const res = await axios.get("/premium/status", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const status = res.data.status;
    const leaderboardLink = document.querySelector('a[href="./leaderboard.html"]');
    const reportLink = document.querySelector('a[href="./report.html"]');

    if (status === "SUCCESSFUL") {
      // ✅ Premium user — keep links active
      leaderboardLink?.classList.remove("disabled-link");
      reportLink?.classList.remove("disabled-link");
    } else {
      // 🚫 Non-premium user — disable restricted links
      [leaderboardLink, reportLink].forEach(link => {
        if (link) {
          link.classList.add("disabled-link");

          // ✅ Attach event in capture phase so it fires before navigation
          link.addEventListener("click", e => {
            e.preventDefault();
            e.stopImmediatePropagation(); // stop other handlers
            alert("🚫 This feature is available only for Premium Users.");
          }, { capture: true });
        }
      });
    }
  } catch (err) {
    console.error("Error checking premium access:", err);
  }
}

// 🧾 Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./login.html";
});

// Run automatically when the page loads
document.addEventListener("DOMContentLoaded", checkPremiumAccess);
