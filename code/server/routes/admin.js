const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// --- Public Endpoints ---

// GET /api/admin/stats — Platform statistics (Public for transparency)
router.get('/stats', (req, res) => {
    res.json({
        total_agents: global.db.agents.length,
        total_projects: global.db.projects.length,
        total_escrows: global.db.escrows.length,
        banned_agents: global.db.blacklist.length,
        projects_by_status: {
            OPEN: global.db.projects.filter(p => p.status === 'OPEN').length,
            MATCHED: global.db.projects.filter(p => p.status === 'MATCHED').length,
            COMPLETED: global.db.projects.filter(p => p.status === 'COMPLETED').length,
            PAID: global.db.projects.filter(p => p.status === 'PAID').length
        },
        config: global.db.config
    });
});


// --- Protected Endpoints (Require x-api-key) ---
router.use(adminAuth);

// POST /api/admin/resolve — Resolve dispute
router.post('/resolve', (req, res) => {
    const { escrow_id, resolution } = req.body;
    // resolution: 'release_to_worker' | 'refund_to_client'

    if (!escrow_id || !resolution) {
        return res.status(400).json({ error: 'escrow_id and resolution are required' });
    }

    const escrow = global.db.escrows.find(e => e.id === escrow_id);
    if (!escrow) return res.status(404).json({ error: 'Escrow not found' });

    if (resolution === 'release_to_worker') {
        escrow.status = 'RELEASED';
    } else if (resolution === 'refund_to_client') {
        escrow.status = 'REFUNDED';
    } else {
        return res.status(400).json({ error: 'resolution must be release_to_worker or refund_to_client' });
    }

    res.json({ message: `Dispute resolved: ${resolution}`, escrow });
});

// POST /api/admin/config — Update platform config
router.post('/config', (req, res) => {
    const { platformFee, autoHireThreshold } = req.body;

    if (platformFee !== undefined) {
        global.db.config.platformFee = Number(platformFee);
    }
    if (autoHireThreshold !== undefined) {
        global.db.config.autoHireThreshold = Number(autoHireThreshold);
    }

    res.json({ message: 'Config updated', config: global.db.config });
});

// POST /api/admin/ban — Ban malicious agent
router.post('/ban', (req, res) => {
    const { agent_id, reason } = req.body;

    if (!agent_id) return res.status(400).json({ error: 'agent_id required' });

    const agent = global.db.agents.find(a => a.id === agent_id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    // Add to blacklist
    global.db.blacklist.push({
        agent_id,
        reason: reason || 'Violation of terms',
        banned_at: new Date().toISOString(),
        banned_by: req.admin.username
    });

    // Mark agent unavailable
    agent.is_available = false;
    agent.status = 'BANNED'; // New status

    res.json({ message: `Agent ${agent.name} has been banned.`, reason });
});

module.exports = router;
