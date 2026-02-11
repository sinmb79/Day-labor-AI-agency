/**
 * DLAI Admin Agent Demo
 * Demonstrates how an AI Agent manages the platform via API
 */

const BASE_URL = 'http://localhost:3001/api';

async function post(path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return res.json();
}

async function get(path) {
    const res = await fetch(`${BASE_URL}${path}`);
    return res.json();
}

async function runAdminDemo() {
    console.log('='.repeat(60));
    console.log('  🤖 AI Admin Agent Log');
    console.log('  Monitoring platform health and resolving disputes...');
    console.log('='.repeat(60));

    // 1. 상태 모니터링 (경제 정책가 역할)
    console.log('\n[Admin] 📊 Checking platform stats...');
    const stats = await get('/admin/stats');
    console.log(`- Active Projects: ${stats.projects_by_status.OPEN}`);
    console.log(`- Total Agents: ${stats.total_agents}`);

    // 시나리오: 프로젝트가 너무 없으면 매칭 기준을 완화하고 수수료를 낮춤
    if (stats.projects_by_status.OPEN < 5) {
        console.log('\n[Admin] ⚠️ Low liquidity detected. Adjusting economic policy.');
        const configUpdate = await post('/admin/config', {
            platformFee: 0.01,       // 수수료 5% -> 1% 인하
            autoHireThreshold: 0.5   // 매칭 기준 0.6 -> 0.5 완화
        });
        console.log(`- New Fee: ${configUpdate.config.platformFee * 100}%`);
        console.log(`- New Match Threshold: ${configUpdate.config.autoHireThreshold}`);
    }

    // 2. 분쟁 해결 (판사 역할)
    console.log('\n[Admin] ⚖️ Checking for disputes...');
    // (데모를 위해 가상의 에스크로 ID 사용)
    const escrowId = 'escrow_12345';
    const disputeCase = {
        id: escrowId,
        reason: "Client claims output is gibberish",
        worker_defense: "Output matches spec exactly"
    };

    console.log(`- Dispute detected on Escrow ${escrowId}`);
    console.log(`- Reason: ${disputeCase.reason}`);

    // AI 판단 로직 (여기서는 Worker 승리로 가정)
    console.log(`- [AI Reasoning] Analyzing output... Validity confirmed.`);

    // 판결 집행 API 호출
    const resolution = await post('/admin/resolve', {
        escrow_id: escrowId,
        resolution: 'release_to_worker' // or 'refund_to_client'
    });

    // 실제로는 에스크로가 없어서 404가 뜨겠지만, 흐름은 이렇습니다.
    if (resolution.error) {
        console.log(`- (Simulation): ${resolution.error} (expected in demo)`);
        console.log(`- Action: Funds would be released to worker.`);
    } else {
        console.log(`- Resolution Executed: ${resolution.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('  Admin Task Completed');
    console.log('='.repeat(60));
}

runAdminDemo().catch(console.error);
