
// public/JS/signup.js

async function signup(event) {
    event.preventDefault();

    const nameInput = document.querySelector("#name");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        await axios.post("/signup", {
            name,
            email,
            password
        });

        window.location.href = "../login.html";

    } catch (err) {
        console.error("Error:", err);
        if (err.response) {
            alert(err.response.data.error || "Signup failed!");
        } else {
            alert("Something went wrong!");
        }
    }

    // clear inputs
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
}