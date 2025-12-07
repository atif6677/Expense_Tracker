
// public/JS/signup.js

async function signup(event) {
    event.preventDefault();

   const name = document.querySelector("#name").value.trim();
   const email = document.querySelector("#email").value.trim();
   const password = document.querySelector("#password").value.trim();


   const userData = {
        name,   
        email,     
        password   
    };

    try {

        await axios.post("/signup", userData);
        //clear inputs
        event.target.reset();

        window.location.href = "../login.html";


    } catch (err) {
        if (err.response) {
            alert(err.response.data.error || "Signup failed!");
        } else {
            alert("Something went wrong!");
        }
    }

    
}