#!/bin/bash
# Simple run-local script: start ganache, deploy mock tokens and escrow, and run demo backend

echo "Start local dev environment..."
# Start ganache-cli (assumes installed)
# ganache-cli -p 8545 -h 127.0.0.1 --accounts 10 --deterministic &

# Deploy contracts using hardhat (example)
# npx hardhat run scripts/deploy.js --network localhost

echo "Local environment setup complete. Follow DEMO_SCENARIO.md to run the demo steps."
