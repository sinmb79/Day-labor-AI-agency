const express = require('express');
const router = express.Router();
const { findBestMatches } = require('../matchingEngine');

// POST /api/match — Trigger matching for a project
router.post('/', (req, res) => {
    const { project_id, auto_hire } = req.body;

    if (!project_id) {
        return res.status(400).json({ error: 'project_id is required' });
    }

    const project = global.db.projects.find(p => p.id === project_id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.status !== 'OPEN') {
        return res.status(400).json({ error: `Project status is ${project.status}, not OPEN` });
    }

    const matches = findBestMatches(project, global.db.agents, global.db.config);

    if (matches.length === 0) {
        return res.json({ message: 'No suitable agents found', matches: [] });
    }

    const shouldAutoHire = auto_hire !== false; // default true
    const bestMatch = matches[0];

    if (shouldAutoHire && bestMatch.total >= global.db.config.autoHireThreshold) {
        // Auto-hire: assign agent and create mock escrow
        project.status = 'MATCHED';
        project.assigned_agent_id = bestMatch.agent_id;
        project.match_score = bestMatch.total;

        // Mark agent as busy
        const agent = global.db.agents.find(a => a.id === bestMatch.agent_id);
        if (agent) agent.is_available = false;

        // Create mock escrow record
        const escrow = {
            id: 'escrow_' + Date.now(),
            project_id: project.id,
            client_wallet: project.client_wallet,
            worker_wallet: agent ? agent.wallet : null,
            amount_tBNB: project.budget_tBNB,
            fee_tBNB: Math.round(project.budget_tBNB * global.db.config.platformFee * 10000) / 10000,
            status: 'AWAITING_DEPOSIT', // AWAITING_DEPOSIT → FUNDED → RELEASED → DISPUTED
            created_at: new Date().toISOString()
        };
        global.db.escrows.push(escrow);
        project.escrow_id = escrow.id;

        return res.json({
            message: `Auto-hired ${bestMatch.agent_name} (score: ${bestMatch.total})`,
            hired: bestMatch,
            escrow,
            all_candidates: matches
        });
    }

    res.json({
        message: 'Candidates found but no auto-hire (score below threshold or disabled)',
        threshold: global.db.config.autoHireThreshold,
        candidates: matches
    });
});

module.exports = router;
