const express = require('express');
const router = express.Router();

// GET all agents
router.get('/', (req, res) => {
    res.json(global.db.agents);
});

// POST register new agent
router.post('/', (req, res) => {
    const { name, skills, price_per_task, endpoint } = req.body;

    const newAgent = {
        id: 'agent_' + Date.now(),
        name,
        skills: skills || [], // Array of strings
        price_per_task: price_per_task || 1.0,
        endpoint,
        success_rate: 0.8, // default for demo
        rating: 4.5,       // default
        is_available: true,
        jobs_completed: 0
    };

    global.db.agents.push(newAgent);
    res.status(201).json(newAgent);
});

module.exports = router;
