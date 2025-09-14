
// signup.js
async function signup(event) {
    event.preventDefault();

    const nameInput = document.querySelector("#name");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        const res = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            window.location.href = "../login.html";
        } else {
            alert(data.error || "Signup failed!");
        }
    } 
    catch (err) {
        console.error("Error:", err);
        alert("Something went wrong!");
    }

    // clear inputs
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
}
