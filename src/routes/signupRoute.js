const addUserSignup = require('../controllers/signupController');
const express = require('express');
const router = express.Router();


router.post('/signup', addUserSignup);

router.get('/signup', (req, res) => {
    res.send("Signup route working!");
});


module.exports = router;