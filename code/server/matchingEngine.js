/**
 * Matching Engine v2 — AI Agent Only
 * Implements Whitepaper Section 6.2
 * 
 * Score = 0.35 × capability + 0.25 × performance + 0.15 × price + 0.15 × availability + 0.10 × reputation
 */

function cosineSimilarity(skillsA, skillsB) {
    if (skillsA.length === 0 || skillsB.length === 0) return 0;
    const setA = new Set(skillsA.map(s => s.toLowerCase()));
    const setB = new Set(skillsB.map(s => s.toLowerCase()));
    const intersection = [...setA].filter(s => setB.has(s));
    return intersection.length / Math.sqrt(setA.size * setB.size);
}

function calculateScore(agent, project) {
    // 1. Capability (35%) — soft cosine similarity
    const capabilityScore = project.required_skills.length === 0
        ? 1.0
        : cosineSimilarity(agent.skills, project.required_skills);

    // 2. Performance (25%) — historical success rate
    const performanceScore = agent.success_rate || 0.5;

    // 3. Price (15%) — lower is better, must be within budget
    let priceScore = 0;
    if (agent.price_per_task <= project.budget_tBNB) {
        priceScore = 1.0 - (agent.price_per_task / project.budget_tBNB) * 0.5;
    }

    // 4. Availability (15%)
    const availabilityScore = agent.is_available ? 1.0 : 0.0;

    // 5. Reputation (10%) — rating 0-5 normalized
    const reputationScore = (agent.rating || 3.0) / 5.0;

    const totalScore =
        0.35 * capabilityScore +
        0.25 * performanceScore +
        0.15 * priceScore +
        0.15 * availabilityScore +
        0.10 * reputationScore;

    return {
        total: Math.round(totalScore * 1000) / 1000,
        breakdown: {
            capability: Math.round(capabilityScore * 100) / 100,
            performance: Math.round(performanceScore * 100) / 100,
            price: Math.round(priceScore * 100) / 100,
            availability: Math.round(availabilityScore * 100) / 100,
            reputation: Math.round(reputationScore * 100) / 100
        }
    };
}

function findBestMatches(project, agents, config) {
    const candidates = agents.filter(a => {
        if (!a.is_available) return false;
        if (a.price_per_task > project.budget_tBNB) return false;
        // Safety: new agents limited to low-value projects
        if (project.budget_tBNB > 0.05 && a.jobs_completed < config.minJobsForHighValue && a.success_rate < config.minSuccessRateForHighValue) {
            return false;
        }
        return true;
    });

    const scored = candidates.map(agent => {
        const score = calculateScore(agent, project);
        return { agent_id: agent.id, agent_name: agent.name, ...score };
    });

    scored.sort((a, b) => b.total - a.total);
    return scored;
}

module.exports = { calculateScore, findBestMatches, cosineSimilarity };
