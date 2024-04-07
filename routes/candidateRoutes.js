const { response } = require("express");
const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const candidate = require("../models/candidate");


const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === 'admin';

  } catch (err) {
    return false;

  }
}

// Post routes to add person 
router.post('/', async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: 'User is not a admin' });

    const data = req.body // Assuming that request body contains the person  data
    const newcandidate = new candidate(data);
    const response = await newcandidate.save();
    console.log('data saved');
    res.status(200).json({ response: response });
  }
  catch (err) {
    console.log(err);
    res.status(500).json(response);

  }
})

// Update data in persons table
router.put('/:candidateID', async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: 'user is not a admin' });

    const candidateID = req.params.candidateID;

    const updatedCandidateData = req.body; // Updated data for the person

    const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose validation
    })

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    console.log('candidate data updated');
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})






module.exports = router;