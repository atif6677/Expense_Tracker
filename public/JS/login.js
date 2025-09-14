
//login.js
async function login(event) {
    event.preventDefault();
    
    const loginEmail = document.querySelector('#email');
    const loginPassword = document.querySelector('#password');
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    try {
        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();  //  grab backend response

        if (res.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "../home.html"; // redirect to home page 

        } else {
            alert(data.error || "Login failed!");
        }
    } 
    catch (err) {
        console.error("Error:", err);
        alert("Something went wrong!");
    }

    loginEmail.value = "";
    loginPassword.value = "";
}

//forgot password


document.getElementById('forgotPasswordBtn').addEventListener('click', () => {
  const forgotForm = document.createElement('form');
  forgotForm.id = 'forgotForm';
  forgotForm.innerHTML = `
    <input type="email" id="forgotEmail" placeholder="Enter your email" required />
    <button type="submit">Send Reset Link</button>
  `;
  document.body.appendChild(forgotForm);

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();

    try {
      const res = await fetch('http://localhost:3000/password/forgotpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'Reset link sent to your email!');
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      alert('Something went wrong');
    }
  });
});
