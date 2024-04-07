const { response } = require("express");
const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const User = require("../models/user");

// Post routes to add person 
router.post('/signup', async (req, res) => {
  try {
    const data = req.body // Assuming that request body contains the person  data
    const newUser = new User(data);
    const response = await newUser.save();
    console.log('data saved');

    const payload = {
      id: response.id,
    }
    console.log(JSON.stringify(payload));

    const token = generateToken(payload);
    console.log('Token is :', token);

    res.status(200).json({ response: response, token: token });

  }
  catch (err) {
    console.log(err);
    res.status(500).json(response);

  }
})
//  Login route
router.post('/login', async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;
    // find the user by username
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
    // If user or password doesn't exist
    if (!user || !(await User.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    //  generate token now
    const payload = {
      id: user.id
    }

    const token = generateToken(payload);

    // return token as response 
    res.json({ token })
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });

  }
})

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });

  }

})


// Update data in persons table
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; //Extract the id from the data
    const { currentPassword, newPassword } = req.body // extract current and new passwords from request body

    //find the user by userId 

    const user = await User.findById(userId);

    //If password does not match return error 
    if (!user || (await User.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Update the user's password
    user.passwordc = newPassword;
    await user.save();

    console.log('Password updated');
    res.status(200).json({ message: 'Password updated successfully' })
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' })

  }
})


// const updatedPersonData = req.body;
// const response = await Person.findByIdAndUpdate(personId, updatedPersonData, {
//   new: true,
//   runValidators: true
// })

// if (!response) {
//   return res.status(404).json({ error: 'Person not found' })
// }



module.exports = router;