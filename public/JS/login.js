//login.js
async function login(event) {
    event.preventDefault();
    

    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value.trim();

 
    try {
        const res = await axios.post('/login', { email, password });

        // On success, axios provides the response data directly in `res.data`
        localStorage.setItem("token", res.data.token);
        window.location.href = "../home.html"; // redirect to home page 

    } 
    catch (err) {
        if (err.response) {
            alert(err.response.data.error || "Login failed!");
        } else {
            alert("Something went wrong!");
        }
    }

    event.target.reset();
}

//forgot password

document.getElementById('forgotPasswordBtn').addEventListener('click', () => {

  //  prevent duplicate forms
  if (document.getElementById('forgotForm')) return;

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
      const res = await axios.post('/password/forgotpassword', { email });

      alert(res.data.message || 'Reset link sent to your email!');
      
      //  remove the form after alert
      forgotForm.remove();

    } catch (err) {
      if (err.response) {
        alert(err.response.data.error || 'Something went wrong');
      } else {
        alert('Something went wrong');
      }
      //  still remove the form on error so user clicks again
      forgotForm.remove();
    }
  });
});
