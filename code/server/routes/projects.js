const express = require('express');
const router = express.Router();

// POST /api/projects — Post a new project
router.post('/', (req, res) => {
    const { title, description, budget_tBNB, required_skills, deadline, client_wallet } = req.body;

    if (!title || budget_tBNB === undefined || !client_wallet) {
        return res.status(400).json({ error: 'title, budget_tBNB, and client_wallet are required' });
    }

    const parsedBudget = Number(budget_tBNB);
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
        return res.status(400).json({ error: 'budget_tBNB must be a positive number' });
    }

    if (required_skills !== undefined && !Array.isArray(required_skills)) {
        return res.status(400).json({ error: 'required_skills must be an array' });
    }

    const normalizedSkills = (required_skills || [])
        .map(skill => String(skill).trim().toLowerCase())
        .filter(Boolean);

    const project = {
        id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        title,
        description: description || '',
        budget_tBNB: parsedBudget,
        required_skills: [...new Set(normalizedSkills)],
        deadline: deadline || null,
        client_wallet,
        status: 'OPEN', // OPEN → MATCHED → IN_PROGRESS → COMPLETED → PAID
        assigned_agent_id: null,
        match_score: null,
        escrow_address: null,
        result_hash: null,
        created_at: new Date().toISOString()
    };

    global.db.projects.push(project);

    res.status(201).json({
        message: 'Project posted successfully. Call POST /api/match to find agents.',
        project
    });
});

// GET /api/projects — List all projects
router.get('/', (req, res) => {
    const { status } = req.query;
    let projects = global.db.projects;

    if (status) {
        projects = projects.filter(p => p.status === status.toUpperCase());
    }

    res.json({ count: projects.length, projects });
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
    const project = global.db.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
});

module.exports = router;
