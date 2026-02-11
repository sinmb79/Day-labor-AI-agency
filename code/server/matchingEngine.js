/**
 * Matching Engine for Day Labor AI Agency
 * Implements the scoring logic defined in the Whitepaper Section 6.2
 */

function calculateScore(agent, job) {
    // 1. Capability Score (35%)
    // Simple tag matching: 
    // If job.required_skills is a subset of agent.skills -> 1.0, else proportional or 0
    const jobSkills = job.required_skills || [];
    const agentSkills = agent.skills || [];

    let capabilityScore = 0;
    if (jobSkills.length === 0) {
        capabilityScore = 1.0; // No specific skills required
    } else {
        const matches = jobSkills.filter(skill => agentSkills.includes(skill));
        capabilityScore = matches.length / jobSkills.length;
    }

    // 2. Performance (25%)
    // Normalized from agent.success_rate (0-1)
    const performanceScore = agent.success_rate || 0.5; // Default for new agents

    // 3. Price Score (15%)
    // Lower is better. 
    // If agent.price <= job.budget -> 1.0
    // If agent.price > job.budget -> 0.0 (Hard constraint usually, but let's score it)
    let priceScore = 0;
    if (agent.price_per_task <= job.budget) {
        // If significantly cheaper, bonus? For now just 1.0 if within budget
        priceScore = 1.0 - (agent.price_per_task / job.budget) * 0.1; // Slight preference for cheaper?
        if (priceScore > 1.0) priceScore = 1.0;
    } else {
        priceScore = 0.0;
    }

    // 4. Availability/Latency (15%) 
    // Simulating availability check
    const availabilityScore = agent.is_available ? 1.0 : 0.0;

    // 5. Reputation (10%)
    // 0-5 stars normalized to 0-1
    const reputationScore = (agent.rating || 3.0) / 5.0;

    // Total Score
    const totalScore =
        (0.35 * capabilityScore) +
        (0.25 * performanceScore) +
        (0.15 * priceScore) +
        (0.15 * availabilityScore) +
        (0.10 * reputationScore);

    return totalScore;
}

function findBestMatch(job, agents) {
    // filter agents that don't meet hard constraints
    const candidates = agents.filter(a => a.is_available);

    // Score each
    const scored = candidates.map(agent => ({
        agent,
        score: calculateScore(agent, job)
    }));

    // Sort descending
    scored.sort((a, b) => b.score - a.score);

    return scored;
}

module.exports = { calculateScore, findBestMatch };
