const { response } = require("express");
const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const User = require('../models/user');
const Candidate = require("../models/candidate");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === 'admin';

  } catch (err) {
    return false;

  }
}

// Post routes to add person 
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (! await checkAdminRole(req.user.id))
      return res.status(403).json({ message: 'User does not have admin' });

    const data = req.body // Assuming that request body contains the person  data
    const newcandidate = new Candidate(data);
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
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: 'user does not has admin' });

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

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: 'user does not have admin' });

    const candidateID = req.params.candidateID;

    // Updated data for the person

    const response = await Candidate.findByIdAndDelete(candidateID);


    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    console.log('candidate deleted');
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})

//Lets start voting 
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
  //No admin can vote and user can only vote for once 
  candidateID = req.params.candidateID;
  userId = req.user.id;

  try {
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(403).json({ message: 'Candidate not found' })
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ message: 'User not found' })
    }

    if (user.role == 'admin') {
      return res.status(403).json({ message: 'Admin is not allowed to vote' })
    }
    if (user.isVoted) {
      return res.status(400).json({ message: 'You have already voted' })
    }


    //Update the candidate document to record the vote
    candidate.votes.push({ user: userId })
    candidate.voteCount++;
    await candidate.save();


    //update user document

    user.isVoted = true
    await user.save();

    return res.status(200).json({ message: 'Vote recorded succeefully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal error' })
  }
});

//vote count 
router.get('/vote/count', async (req, res) => {
  try {
    const candidate = await Candidate.find().sort({ voteCount: 'desc' });
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount
      }
    });

    return res.status(200).json(voteRecord)
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal error' })
  }

});


//Get list of all candidates with only name and party

router.get('/', async (req, res) => {
  try {
    //  Here find all the candidates and select only the name and the party name, excluding _id

    const candidates = await candidate.find({}, 'name party -_id');

    //  return the list the of the candidates
    res.status(200).json(candidates)
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' })

  }
})






module.exports = router;