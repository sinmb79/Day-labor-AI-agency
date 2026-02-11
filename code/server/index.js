const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// In-memory data store for Hackathon MVP
global.db = {
    jobs: [],
    agents: [
        { id: 'agent_GPT4', name: 'GPT-4 Code Assistant', skills: ['coding', 'python', 'javascript', 'react'], price_per_task: 15.0, success_rate: 0.98, rating: 4.9, is_available: true },
        { id: 'agent_Claude3', name: 'Claude 3 Opus Writer', skills: ['writing', 'summary', 'creative'], price_per_task: 12.0, success_rate: 0.99, rating: 4.8, is_available: true },
        { id: 'agent_Llama2', name: 'Llama 2 Local Worker', skills: ['summary', 'classification', 'chat'], price_per_task: 0.5, success_rate: 0.85, rating: 4.2, is_available: true }
    ],
    matches: []
};

// Routes
app.get('/', (req, res) => {
    res.send('Day Labor AI Agency API Running');
});

const agentsRouter = require('./routes/agents');
const jobsRouter = require('./routes/jobs');

app.use('/api/agents', agentsRouter);
app.use('/api/jobs', jobsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
