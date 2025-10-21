// Function to fetch and render the leaderboard data
async function fetchAndRenderLeaderboard() {
    const ul = document.getElementById("leaderboardList");
    ul.innerHTML = "<li>Fetching data...</li>";

    try {
        const res = await axios.get("/premium/leaderboard");
        const data = res.data;
        
        ul.innerHTML = ""; // Clear the loading message

        if (data.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No users found on the leaderboard.";
            ul.appendChild(li);
        } else {
            data.forEach((user, index) => {
                const li = document.createElement("li");
                // Display rank, name, and total expense
                li.textContent = `#${index + 1} - ${user.name} || ₹${user.totalExpense}`;
                ul.appendChild(li);
            });
        }
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        ul.innerHTML = "<li>Error loading leaderboard. Please try again later.</li>";
        if (err.response) {
            alert(err.response.data.error || "Unable to fetch Leaderboard.");
        } else {
            alert("Network error: Could not connect to the server.");
        }
    }
}

// Automatically call the function when the page loads
document.addEventListener("DOMContentLoaded", fetchAndRenderLeaderboard);