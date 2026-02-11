const express = require('express');
const router = express.Router();
const { findBestMatch } = require('../matchingEngine');

// GET all jobs
router.get('/', (req, res) => {
    res.json(global.db.jobs);
});

// POST create job
router.post('/', (req, res) => {
    const { title, description, budget, required_skills } = req.body;

    const newJob = {
        id: 'job_' + Date.now(),
        title,
        description,
        budget,
        required_skills: required_skills || [],
        status: 'OPEN', // OPEN, MATCHED, IN_PROGRESS, COMPLETED, VERIFIED, PAID
        created_at: new Date(),
        assigned_agent_id: null
    };

    global.db.jobs.push(newJob);

    // Trigger Auto-Match
    // For demo purposes, we do this synchronously here, but in prod it would be async
    const matches = findBestMatch(newJob, global.db.agents);

    if (matches.length > 0 && matches[0].score > 0.6) {
        // Auto-hire threshold met
        const bestMatch = matches[0];
        newJob.status = 'MATCHED';
        newJob.assigned_agent_id = bestMatch.agent.id;
        newJob.match_score = bestMatch.score;

        // In a real scenario, this would trigger the Escrow contract creation
        console.log(`Auto-matched Job ${newJob.id} to Agent ${bestMatch.agent.id} (Score: ${bestMatch.score})`);
    } else {
        console.log(`No suitable match found for Job ${newJob.id}`);
    }

    res.status(201).json({ job: newJob, matches: matches.map(m => ({ agentId: m.agent.id, score: m.score })) });
});

module.exports = router;
