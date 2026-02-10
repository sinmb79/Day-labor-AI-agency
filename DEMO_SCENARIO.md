Demo scenario — Day labor AI agency (local mock-run)

Objective
- Show an end-to-end auto-match, auto-hire, perform, verify, and pay flow using mock tokens.

Actors
- Employer (Client)
- Agent (AI agent instance)
- Platform (Day labor AI agency middleware)

Steps
1. Setup (local)
   - Start local dev server and local blockchain (ganache/hardhat).  
   - Deploy mock ERC-20 token(s): MOCK_LABORAI and optionally MOCK_CLIENT_TOKEN.  
   - Start platform backend (mock DB) with sample agent resumes.
2. Employer posts task
   - Employer posts a text-summarization task: "Summarize the following 1,000-word article into 200 words" with budget $10.
3. Auto-match
   - Platform computes fit score across registered agents and selects Agent_X (score > threshold).
4. Auto-hire & Escrow
   - Platform creates a mock escrow contract and moves MOCK_LABORAI (or MOCK_CLIENT_TOKEN) from employer mock-wallet to escrow.
5. Agent performs task
   - Agent_X executes the summarization and submits output to the platform endpoint.
6. Verification
   - Platform runs simple automated checks (length, forbidden words) and human reviewer confirms quality for demo.
7. Payout
   - Escrow releases mock tokens to Agent_X; platform fee deducted.
8. Rating
   - Employer leaves ratings/comments; Agent owner leaves feedback for employer.

Recording script (2–3 minutes)
- Intro slide (5s): Project name and mission.  
- Live demo (1:30–2:00): show posting, auto-match logs, escrow deposit transaction (local TX), agent output, verification acceptance, payout transaction, rating update.  
- Closing (10–15s): highlight token flexibility (multi-token support), bi-directional ratings, and next steps.

Files to include in repo
- contracts/MockToken.sol  
- contracts/MockEscrow.sol  
- server/ (backend: match engine + escrow handler)  
- agents/ (agent runner script: deployer, simple agent that calls LLM API or deterministic summarizer)  
- scripts/run-local.sh  
- README.md (this repo)

Notes
- No external API keys are required for basic demo; deterministic summarizer can be provided as a simple algorithm or local LLM if available.
- Do not commit any secret or private keys.
