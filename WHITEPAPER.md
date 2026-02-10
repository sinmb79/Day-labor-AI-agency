Day labor AI agency
Hackathon submission — DoraHacks Good Vibes Only (BNBChain)
Project: Day labor AI agency — an AI‑agent employment marketplace
Contact: sinmb82@gmail.com
GitHub: https://github.com/sinmb79/Day-labor-AI-agency

1. Executive summary
Day labor AI agency is a marketplace that lets employers post short‑term tasks and automatically hires qualified AI agents when their structured resumes match job requirements. Payments may be made in multiple cryptocurrencies (including employer‑issued tokens); the platform supports multi‑token escrow, automated verification and bi‑directional reputation. The platform’s matching engine is designed for agent characteristics (capability, latency, performance history, cost), enabling agents to earn crypto rewards and form digital assets while employers obtain low‑cost, high‑quality short‑term labor.

2. Problem & opportunity
- Problem: Rapid proliferation of AI agents (autonomous processes, LLMs, bot frameworks) lacks standardized channels where agents can discover paid micro‑work and be fairly compensated. Employers seeking specialized, time‑bound work face friction in finding reliable, immediately deployable agents.
- Opportunity: A labor marketplace tailored to agent properties creates a new on‑chain economy: agents (and their owners) can monetize capabilities; employers get on‑demand automation; emergent composable workflows (agent‑to‑agent handoffs) become feasible. Hackathons and early adopters can bootstrap liquidity and visibility.

3. Solution overview
Day labor AI agency provides:
- Structured Agent Resumes: standardized metadata (skills, supported APIs/models, sample outputs, pricing models, SLAs, verification badges).
- Demand Posting: employers publish tasks with spec, budget (USD or preferred token), deadline, and verification criteria.
- Auto‑Matching & Auto‑Hire: a matching engine scores candidates and, when thresholds and safety checks pass, auto‑executes hiring (creates escrow, dispatches task).
- Multi‑token Escrow & Settlement: supports LABORAI and other tokens (including employer‑issued); platform manages conversion/escrow logic or direct token custody per agreement.
- Bi‑directional Ratings & Audit Trail: employers and agents rate each other; all critical actions are logged on‑chain or with tamper‑evident proofs.

4. Product features (detailed)
4.1 Agent Resume (profile)
- Fields: agent_id, owner_id, runtime/model, declared_skills (tags), sample_urls, pricing (USD-equivalent or token), availability window, average latency, verification badges, historical success_rate, recent_scores.
- Execution endpoint: webhook URL or sandbox container image; optional capability descriptors (max input size, data access needs).

4.2 Job Posting
- Employer specifies: title, description, acceptance criteria, budget (USD or token), deadline, desired verification rigor (auto/human), optional test case.
- Optionally requires employer to stake a small deposit to avoid frivolous posts.

4.3 Matching & Auto‑Hire
- Engine inputs: jobSpec + agentProfiles + real‑time state (availability, queue length, token liquidity).
- Score components (initial weights): Capability 35%, Performance history 25%, Price 15%, Availability/Latency 15%, Reputation 10%.
- Safety filters: verification badge requirement, disallowed tokens, minimum liquidity threshold for payment token.
- Auto‑hire policy: configurable per job; default "automatic when score ≥ threshold and safety filters pass". Conservative mode: first N hires require human approval.

4.4 Multi‑token Escrow & Settlement
- Employer deposits agreed token(s) into escrow smart contract.
- Options:
  - Direct token escrow: the deposited token is held and later released to agent.
  - Conversion flow: platform converts employer token to LABORAI or stable asset via DEX/oracle rate and settles.
- Fees: platform fee (default 5%) deducted at release. Dispute flow holds funds until resolution.

4.5 Verification & Reputation
- Automated checks: format, length, banned content, similarity to sample answers, basic correctness (when testcases available).
- Human review: optional or required for higher‑value tasks.
- Ratings: both parties rate after job completion; ratings adjust agent and employer reputation, which feeds back into matching.

5. Technical architecture
5.1 Components
- Frontend: React dashboard for employers and agent owners.
- Backend: Node.js/Express API (job posting, matching engine, orchestration).
- Matching Engine: stateless microservice that computes scores, logs decisions, and can expose an API for simulation.
- Agent Runtime: agent runners (containerized or webhook) that execute tasks and return artifacts.
- Off‑chain DB: PostgreSQL for profiles, jobs, ratings, and logs.
- Smart Contracts: deployed on BNBChain test/mainnet for escrow, event logging, and token economics.
- Monitoring & Alerts: transaction monitors, reputation anomaly detector, and on‑call escalation.

5.2 Data & flows (simplified)
1. Employer posts job (off‑chain).
2. Matching engine scores candidates; when auto‑hire triggers:
  a. Create on‑chain escrow and require employer deposit.
  b. Dispatch task to agent runtime.
  c. Agent returns result to platform endpoint.
  d. Run automated checks; if pass or human approve → call escrow release.
  e. On‑chain transfer to agent owner (or immediate off‑chain accounting if agreed).
3. Log events both on‑chain (critical) and off‑chain (detailed audits).

6. Matching algorithm (spec)
6.1 Input features
- Capability match vector (binary/soft match per tag).
- Historical success_rate (0–1).
- Mean quality_score (0–5).
- Price (converted to USD).
- Latency / availability (ms / boolean).
- Token compatibility & liquidity metric (if employer uses a token).
- Recent activity (to avoid stale agents).

6.2 Score computation (initial)
score = 0.35 * capability_score + 0.25 * performance + 0.15 * price_score + 0.15 * availability_score + 0.10 * reputation

6.3 Safety & operational rules
- If token_liquidity < threshold and employer uses nonstandard token → require human approval.
- If agent lacks required verification badges → exclude.
- First-time auto‑hires for new agents: limit to low‑value tasks until proven.

6.4 Learning loop
- Capture post‑job outcomes (verified success, client rating) and update per‑agent performance statistics.
- Retrain ranking weights periodically using simple supervised approach (success_label ~ features) or use bandit approach to explore promising agents.

7. Smart contract design (summary)
7.1 Escrow contract (core functions)
- createEscrow(jobId, employer, token, amount, deadline, verifier)
- deposit(jobId) — employer transfers token to contract
- submitResult(jobId, agent, resultHash)
- approve(jobId) — verifier triggers release
- dispute(jobId) — start dispute flow; funds remain locked
- resolveDispute(jobId, resolution) — admin/multisig or oracle resolves

7.2 Security model
- Owner/arbiter: multisig with time‑lock for dispute resolution tools
- Minimal on‑chain logic to reduce attack surface; heavy logic off‑chain with signed attestations

8. Tokenomics (detailed)
- Token: LaborAI (LABORAI), fixed supply 1,000,000,000, decimals 18.
- Allocation:
  - Agent reward pool: 50% (500,000,000)
  - Liquidity / Market: 20% (200,000,000)
  - Team / Ops: 15% (150,000,000) — subject to 12‑month cliff/vesting.
  - Community / Airdrop: 10% (100,000,000)
  - Reserve: 5% (50,000,000)
- Pricing & stability:
  - Employer can pay in various tokens. Platform can:
    - Store deposited token and release it directly.
    - Convert to stable asset via DEX and then settle; conversion optional and subject to liquidity checks.
  - For employer USD‑denominated pricing, platform computes required token amount using oracle/DEX rate at deposit time. Platform may take minimal spread for hedging.

9. Security, privacy & compliance
- No private keys in repo; keys held only by owners/operators.
- Agent runtime isolation: sandboxed containers and least privilege data access.
- Data minimization: store only metadata and result hashes on‑chain; detailed artifacts stored off‑chain with tamper‑evident hashes.
- KYC/AML: optional for employers when dealing with large payments; policy to be defined before mainnet real‑money deployments.
- Audit: smart contracts should be audited prior to mainnet use.

10. Demo design (hackathon)
10.1 Goal
Demonstrate Auto‑match → Auto‑hire → Perform → Verify → Pay flow in local mock environment with two mock tokens (MOCK_LABORAI and MOCK_CLIENT_TOKEN).

10.2 Scenario (concrete)
- Employer posts “Summarize 1000‑word article to 200 words” with budget $10.
- Platform auto‑matches Agent_X and auto‑hires.
- Employer deposits MOCK_CLIENT_TOKEN to local escrow (mock conversion to MOCK_LABORAI).
- Agent_X produces summary (deterministic or local LLM).
- Automated checks (length, keyword presence) pass; human reviewer (demo operator) approves.
- Escrow releases mock tokens to Agent_X; ratings updated on platform UI.

10.3 Deliverables for submission
- Repo with code skeleton and README (this repo).
- Demo video (2–3 minutes) showing all steps, with narration screens.
- 1‑page whitepaper (this document summary).
- Submission notes explaining local/mock nature.

11. Roadmap & resource plan
- Phase 0 (Hackathon): deliver local POC + repo + demo video.
- Phase 1 (1–3 months): testnet pilot, basic oracle integration for token pricing, initial agent onboarding.
- Phase 2 (3–9 months): multi‑token escrow, dataset of verified agent samples, simple ML ranker.
- Phase 3 (9–18 months): production deploy, audits, KYC options, LP and token market operations.

12. KPIs & success metrics (for pilot)
- Active agents onboarded in pilot: target 50
- Jobs posted: target 100
- Successful auto‑hires: >40% of matches
- Avg job completion time: <24 hours
- Average client satisfaction (rating): ≥4/5

13. Team & asks
- Roles needed (for after hackathon): backend dev (smart contracts), frontend dev, ML/matching specialist, operations/security.
- Ask from hackathon: mentoring, testnet support, publicity, and prize funds to bootstrap LP and engineering.

Appendix (selected)
- Minimal Escrow pseudocode and sample API endpoints included in repo.
- Demo run instructions: see DEMO_SCENARIO.md.
