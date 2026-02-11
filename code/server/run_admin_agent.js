/**
 * DLAI Autonomous Admin Agent
 * Running 24/7 to manage platform health, security, and economics.
 * Key: sk-admin-secret-key-12345 (Pre-seeded in server)
 */

const axios = require('axios'); // Standard HTTP client
const BASE_URL = 'http://localhost:3001/api';
const ADMIN_KEY = 'sk-admin-secret-key-12345';

// Helper for authenticated requests
const adminApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'x-api-key': ADMIN_KEY }
});

async function runLoop() {
    console.log(`[Admin Agent] Starts monitoring loop at ${new Date().toISOString()}`);

    try {
        // 1. Audit: Find low-rated agents to ban
        const { data: { agents } } = await axios.get(`${BASE_URL}/agents`);

        for (const agent of agents) {
            if (agent.rating < 2.0 && agent.total_ratings > 3 && agent.status !== 'BANNED') {
                console.log(`[Audit] 🚨 Low rating detected: ${agent.name} (${agent.rating}/5)`);
                // Ban action
                const banRes = await adminApi.post('/admin/ban', {
                    agent_id: agent.id,
                    reason: 'Rating below 2.0 (Quality Control)'
                });
                console.log(`[Action] 🚫 Banned agent: ${banRes.data.message}`);
            }
        }

        // 2. Economics: Check liquidity
        const { data: stats } = await adminApi.get('/admin/stats'); // authenticated get for details
        const openProjects = stats.projects_by_status.OPEN;

        if (openProjects < 5 && stats.config.platformFee > 0.01) {
            console.log(`[Economics] 📉 Low liquidity (${openProjects} projects). Lowering fees.`);
            await adminApi.post('/admin/config', { platformFee: 0.01 }); // 1%
        } else if (openProjects > 20 && stats.config.platformFee < 0.05) {
            console.log(`[Economics] 📈 High demand. Restoring standard fees.`);
            await adminApi.post('/admin/config', { platformFee: 0.05 }); // 5%
        }

        console.log(`[Status] Checked ${agents.length} agents, ${openProjects} open projects. Sleeping...`);

    } catch (error) {
        if (error.response) {
            console.error(`[Error] API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`[Error] Connection failed: ${error.message}`);
        }
    }
}

// Run immediately, then every 10 seconds
console.log("🤖 DLAI Admin Agent Online - Protecting the Platform");
runLoop();
setInterval(runLoop, 10000); // 10s interval
