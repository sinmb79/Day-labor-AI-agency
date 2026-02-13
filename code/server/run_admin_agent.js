/**
 * DLAI Autonomous Admin Agent
 * Running 24/7 to manage platform health, security, and economics.
 * Key: sk-admin-secret-key-12345 (Pre-seeded in server)
 */

const BASE_URL = 'http://localhost:3001/api';
const ADMIN_KEY = 'sk-admin-secret-key-12345';

async function apiRequest(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(`${options.method || 'GET'} ${path} failed (${res.status}): ${JSON.stringify(data)}`);
    }
    return data;
}

async function adminRequest(path, options = {}) {
    return apiRequest(path, {
        ...options,
        headers: {
            'x-api-key': ADMIN_KEY,
            ...(options.headers || {})
        }
    });
}

async function runLoop() {
    console.log(`[Admin Agent] Starts monitoring loop at ${new Date().toISOString()}`);

    try {
        // 1. Audit: Find low-rated agents to ban
        const { agents } = await apiRequest('/agents');

        for (const agent of agents) {
            if (agent.rating < 2.0 && agent.total_ratings > 3 && agent.status !== 'BANNED') {
                console.log(`[Audit] 🚨 Low rating detected: ${agent.name} (${agent.rating}/5)`);
                // Ban action
                const banRes = await adminRequest('/admin/ban', {
                    method: 'POST',
                    body: JSON.stringify({
                        agent_id: agent.id,
                        reason: 'Rating below 2.0 (Quality Control)'
                    })
                });
                console.log(`[Action] 🚫 Banned agent: ${banRes.message}`);
            }
        }

        // 2. Economics: Check liquidity
        const stats = await adminRequest('/admin/stats');
        const openProjects = stats.projects_by_status.OPEN;

        if (openProjects < 5 && stats.config.platformFee > 0.01) {
            console.log(`[Economics] 📉 Low liquidity (${openProjects} projects). Lowering fees.`);
            await adminRequest('/admin/config', {
                method: 'POST',
                body: JSON.stringify({ platformFee: 0.01 })
            });
        } else if (openProjects > 20 && stats.config.platformFee < 0.05) {
            console.log(`[Economics] 📈 High demand. Restoring standard fees.`);
            await adminRequest('/admin/config', {
                method: 'POST',
                body: JSON.stringify({ platformFee: 0.05 })
            });
        }

        console.log(`[Status] Checked ${agents.length} agents, ${openProjects} open projects. Sleeping...`);

    } catch (error) {
        console.error(`[Error] ${error.message}`);
    }
}

// Run immediately, then every 10 seconds
console.log('🤖 DLAI Admin Agent Online - Protecting the Platform');
runLoop();
setInterval(runLoop, 10000); // 10s interval
