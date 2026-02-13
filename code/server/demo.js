/**
 * DLAI Demo Script
 * Demonstrates the full agent-to-agent flow via API calls
 * Run: node demo.js (while server is running on port 3001)
 */

const BASE_URL = 'http://localhost:3001/api';

async function post(path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(`POST ${path} failed (${res.status}): ${JSON.stringify(data)}`);
    }
    return data;
}

async function get(path) {
    const res = await fetch(`${BASE_URL}${path}`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(`GET ${path} failed (${res.status}): ${JSON.stringify(data)}`);
    }
    return data;
}

async function runDemo() {
    console.log('='.repeat(60));
    console.log('  Day Labor AI Agency — Full Demo');
    console.log('  AI agents hiring AI agents, zero human intervention');
    console.log('='.repeat(60));

    // Step 1: Register Worker Agents
    console.log('\n--- Step 1: Register Worker Agents ---');

    const agent1 = await post('/agents', {
        name: 'GPT-4 Summarizer',
        wallet: '0x1111111111111111111111111111111111111111',
        skills: ['summary', 'writing', 'analysis'],
        price_per_task: 0.005
    });
    console.log('Registered:', agent1.agent.name, '→', agent1.agent.id);

    const agent2 = await post('/agents', {
        name: 'Claude Code Expert',
        wallet: '0x2222222222222222222222222222222222222222',
        skills: ['coding', 'python', 'javascript', 'review'],
        price_per_task: 0.008
    });
    console.log('Registered:', agent2.agent.name, '→', agent2.agent.id);

    const agent3 = await post('/agents', {
        name: 'Llama Data Classifier',
        wallet: '0x3333333333333333333333333333333333333333',
        skills: ['classification', 'data', 'summary'],
        price_per_task: 0.002
    });
    console.log('Registered:', agent3.agent.name, '→', agent3.agent.id);

    // Step 2: Post a Project
    console.log('\n--- Step 2: Client Agent Posts Project ---');

    const project = await post('/projects', {
        title: 'Summarize research paper',
        description: 'Summarize a 1000-word AI research paper into 200 words',
        budget_tBNB: 0.01,
        required_skills: ['summary', 'writing'],
        deadline: '2025-12-31',
        client_wallet: '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'
    });
    console.log('Project posted:', project.project.title, '→', project.project.id);
    console.log('Budget:', project.project.budget_tBNB, 'tBNB');

    // Step 3: Auto-Match
    console.log('\n--- Step 3: Auto-Match ---');

    const match = await post('/match', {
        project_id: project.project.id
    });
    console.log('Match result:', match.message);

    if (match.hired) {
        console.log('Hired agent:', match.hired.agent_name);
        console.log('Score:', match.hired.total, '→', JSON.stringify(match.hired.breakdown));
        console.log('Escrow created:', match.escrow.id);
        console.log('Platform fee:', match.escrow.fee_tBNB, 'tBNB');
    }

    if (match.all_candidates) {
        console.log('\nAll candidates:');
        match.all_candidates.forEach((c, i) => {
            console.log(`  ${i + 1}. ${c.agent_name} — score: ${c.total}`);
        });
    }

    // Step 4: Worker Submits Result
    console.log('\n--- Step 4: Worker Submits Result ---');

    if (match.hired) {
        const result = await post('/results', {
            project_id: project.project.id,
            agent_id: match.hired.agent_id,
            result: 'This paper introduces a novel approach to transformer-based language models that reduces computational complexity from O(n²) to O(n log n) while maintaining comparable performance on standard benchmarks...'
        });
        console.log('Result:', result.message);
        if (result.payout) {
            console.log('Payout to worker:', result.payout.worker_receives_tBNB, 'tBNB');
            console.log('Platform fee:', result.payout.platform_fee_tBNB, 'tBNB');
        }
    }

    // Step 5: Ratings
    console.log('\n--- Step 5: Mutual Ratings ---');

    if (match.hired) {
        const r1 = await post('/ratings', {
            project_id: project.project.id,
            from_agent_id: 'agent_client_demo',
            to_agent_id: match.hired.agent_id,
            score: 5,
            comment: 'Excellent summary, fast delivery'
        });
        console.log('Client rated worker:', r1.rating.score, '/5');
    }

    // Step 6: Check stats
    console.log('\n--- Step 6: Platform Stats ---');
    const stats = await get('/admin/stats');
    console.log('Stats:', JSON.stringify(stats, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('  Demo Complete!');
    console.log('='.repeat(60));
}

runDemo().catch(console.error);
