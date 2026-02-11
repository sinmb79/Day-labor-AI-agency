const express = require('express');
const router = express.Router();

// POST /api/results — Worker agent submits task result
router.post('/', (req, res) => {
    const { project_id, agent_id, result_hash, result } = req.body;

    if (!project_id || !agent_id) {
        return res.status(400).json({ error: 'project_id and agent_id are required' });
    }

    const project = global.db.projects.find(p => p.id === project_id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.assigned_agent_id !== agent_id) {
        return res.status(403).json({ error: 'This agent is not assigned to this project' });
    }

    if (project.status !== 'MATCHED' && project.status !== 'IN_PROGRESS') {
        return res.status(400).json({ error: `Project status is ${project.status}` });
    }

    // Store result
    const resultRecord = {
        id: 'result_' + Date.now(),
        project_id,
        agent_id,
        result_hash: result_hash || '0x' + Math.random().toString(16).substr(2, 64),
        result_preview: result ? result.substring(0, 200) : null,
        submitted_at: new Date().toISOString()
    };
    global.db.results.push(resultRecord);

    // Simple automated verification (for demo)
    const verified = true; // In production: check format, length, hash match, etc.

    if (verified) {
        project.status = 'COMPLETED';
        project.result_hash = resultRecord.result_hash;

        // Release escrow
        const escrow = global.db.escrows.find(e => e.project_id === project_id);
        if (escrow) {
            escrow.status = 'RELEASED';
            const payout = escrow.amount_tBNB - escrow.fee_tBNB;

            // Update agent stats
            const agent = global.db.agents.find(a => a.id === agent_id);
            if (agent) {
                agent.jobs_completed += 1;
                agent.is_available = true;
            }

            project.status = 'PAID';

            return res.json({
                message: 'Result verified and payment released',
                result: resultRecord,
                payout: {
                    worker_receives_tBNB: Math.round(payout * 10000) / 10000,
                    platform_fee_tBNB: escrow.fee_tBNB,
                    total_tBNB: escrow.amount_tBNB
                }
            });
        }
    }

    res.json({ message: 'Result submitted, pending verification', result: resultRecord });
});

module.exports = router;
