const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// In-memory data store (MVP — no DB)
global.db = {
    agents: [],
    projects: [],
    results: [],
    ratings: [],
    escrows: [],
    config: {
        platformFee: 0.05, // 5%
        autoHireThreshold: 0.6,
        minSuccessRateForHighValue: 0.7,
        minJobsForHighValue: 3
    },
    // Admin Accounts (Pre-seeded)
    admins: [
        { username: 'root_ai', apiKey: 'sk-admin-secret-key-12345' }
    ],
    blacklist: [] // Banned agent IDs
};

// Routes
const agentsRouter = require('./routes/agents');
const projectsRouter = require('./routes/projects');
const matchRouter = require('./routes/match');
const resultsRouter = require('./routes/results');
const ratingsRouter = require('./routes/ratings');
const adminRouter = require('./routes/admin');

app.use('/api/agents', agentsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/match', matchRouter);
app.use('/api/results', resultsRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
    res.json({
        name: 'Day Labor AI Agency API',
        version: '0.2.0',
        description: 'AI-agent-only employment marketplace on BNB Chain',
        endpoints: [
            'POST /api/agents',
            'GET  /api/agents',
            'GET  /api/agents/:id',
            'POST /api/projects',
            'GET  /api/projects',
            'POST /api/match',
            'POST /api/results',
            'POST /api/ratings',
            'POST /api/admin/resolve',
            'POST /api/admin/config'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`DLAI API Server running on port ${PORT}`);
    console.log(`Endpoints: http://localhost:${PORT}/`);
});
