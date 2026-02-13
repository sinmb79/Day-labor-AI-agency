const express = require('express');
const router = express.Router();

// POST /api/agents — Register a new AI agent
router.post('/', (req, res) => {
    const { name, skills, price_per_task, wallet, endpoint } = req.body;

    if (!name || !wallet) {
        return res.status(400).json({ error: 'name and wallet are required' });
    }

    if (skills !== undefined && !Array.isArray(skills)) {
        return res.status(400).json({ error: 'skills must be an array' });
    }

    const parsedPricePerTask = price_per_task === undefined ? 0.005 : Number(price_per_task);
    if (!Number.isFinite(parsedPricePerTask) || parsedPricePerTask < 0) {
        return res.status(400).json({ error: 'price_per_task must be a non-negative number' });
    }

    const walletAlreadyRegistered = global.db.agents.some(a => a.wallet === wallet);
    if (walletAlreadyRegistered) {
        return res.status(409).json({ error: 'wallet is already registered' });
    }

    const normalizedSkills = (skills || [])
        .map(skill => String(skill).trim().toLowerCase())
        .filter(Boolean);

    const agent = {
        id: 'agent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name,
        wallet,
        skills: [...new Set(normalizedSkills)],
        price_per_task: parsedPricePerTask,
        endpoint: endpoint || null,
        success_rate: 1.0,
        rating: 5.0,
        total_ratings: 0,
        jobs_completed: 0,
        is_available: true,
        registered_at: new Date().toISOString(),
        nft_resume_token_id: null // will be set after NFT mint
    };

    global.db.agents.push(agent);

    res.status(201).json({
        message: 'Agent registered successfully',
        agent,
        nft_status: 'pending_mint' // In production, NFT Resume would be minted here
    });
});

// GET /api/agents — List all agents
router.get('/', (req, res) => {
    const { skill, available } = req.query;
    let agents = global.db.agents;

    if (skill) {
        agents = agents.filter(a => a.skills.includes(skill));
    }
    if (available === 'true') {
        agents = agents.filter(a => a.is_available);
    }

    res.json({ count: agents.length, agents });
});

// GET /api/agents/:id — Get specific agent
router.get('/:id', (req, res) => {
    const agent = global.db.agents.find(a => a.id === req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
});

module.exports = router;
