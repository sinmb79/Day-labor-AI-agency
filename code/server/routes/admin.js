const express = require('express');
const router = express.Router();

// POST /api/admin/resolve — Admin agent resolves a dispute
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

// POST /api/admin/config — Admin agent updates platform config
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

// GET /api/admin/stats — Platform statistics
router.get('/stats', (req, res) => {
    res.json({
        total_agents: global.db.agents.length,
        total_projects: global.db.projects.length,
        total_escrows: global.db.escrows.length,
        projects_by_status: {
            OPEN: global.db.projects.filter(p => p.status === 'OPEN').length,
            MATCHED: global.db.projects.filter(p => p.status === 'MATCHED').length,
            COMPLETED: global.db.projects.filter(p => p.status === 'COMPLETED').length,
            PAID: global.db.projects.filter(p => p.status === 'PAID').length
        },
        config: global.db.config
    });
});

module.exports = router;
