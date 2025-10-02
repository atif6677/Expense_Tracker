// src/routes/signupRoute.js

const express = require('express');
const router = express.Router();
const addUserSignup = require('../controllers/signupController');


router.post('/signup', addUserSignup);

router.get('/signup', (req, res) => {
    res.send("Signup route working!");
});


module.exports = router;