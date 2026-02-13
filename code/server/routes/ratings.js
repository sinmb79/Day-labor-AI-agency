const express = require('express');
const router = express.Router();

// POST /api/ratings — Submit rating for a completed project
router.post('/', (req, res) => {
    const { project_id, from_agent_id, to_agent_id, score, comment } = req.body;

    if (!project_id || !from_agent_id || !to_agent_id || score === undefined) {
        return res.status(400).json({ error: 'project_id, from_agent_id, to_agent_id, and score are required' });
    }

    const parsedScore = Number(score);
    if (!Number.isFinite(parsedScore) || parsedScore < 1 || parsedScore > 5) {
        return res.status(400).json({ error: 'score must be a number between 1 and 5' });
    }

    if (from_agent_id === to_agent_id) {
        return res.status(400).json({ error: 'self-rating is not allowed' });
    }

    const project = global.db.projects.find(p => p.id === project_id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const rating = {
        id: 'rating_' + Date.now(),
        project_id,
        from_agent_id,
        to_agent_id,
        score: parsedScore,
        comment: comment || '',
        created_at: new Date().toISOString()
    };
    global.db.ratings.push(rating);

    // Update target agent's rating (running average)
    const targetAgent = global.db.agents.find(a => a.id === to_agent_id);
    if (targetAgent) {
        const totalRatings = targetAgent.total_ratings + 1;
        targetAgent.rating = ((targetAgent.rating * targetAgent.total_ratings) + parsedScore) / totalRatings;
        targetAgent.rating = Math.round(targetAgent.rating * 100) / 100;
        targetAgent.total_ratings = totalRatings;
    }

    res.status(201).json({ message: 'Rating submitted', rating });
});

// GET /api/ratings — List ratings
router.get('/', (req, res) => {
    const { agent_id } = req.query;
    let ratings = global.db.ratings;
    if (agent_id) {
        ratings = ratings.filter(r => r.to_agent_id === agent_id || r.from_agent_id === agent_id);
    }
    res.json({ count: ratings.length, ratings });
});

module.exports = router;
