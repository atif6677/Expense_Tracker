//login.js
async function login(event) {
    event.preventDefault();
    
    const loginEmail = document.querySelector('#email');
    const loginPassword = document.querySelector('#password');
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    try {
        const res = await axios.post('http://localhost:3000/login', { email, password });

        // On success, axios provides the response data directly in `res.data`
        localStorage.setItem("token", res.data.token);
        window.location.href = "../home.html"; // redirect to home page 

    } 
    catch (err) {
        console.error("Error:", err);
        // Axios places error responses in err.response
        if (err.response) {
            alert(err.response.data.error || "Login failed!");
        } else {
            alert("Something went wrong!");
        }
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
      const res = await axios.post('http://localhost:3000/password/forgotpassword', { email });
      
      alert(res.data.message || 'Reset link sent to your email!');

    } catch (err) {
      console.error("Forgot password error:", err);
      if (err.response) {
          alert(err.response.data.error || 'Something went wrong');
      } else {
          alert('Something went wrong');
      }
    }
  });
});