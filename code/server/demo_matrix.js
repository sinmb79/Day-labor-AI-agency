var blessed = require('blessed');
var contrib = require('blessed-contrib');
var screen = blessed.screen();

// Create a grid layout
var grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

// Title & Logo
var title = grid.set(0, 0, 2, 12, blessed.box, {
    content: ' D A Y   L A B O R   A I   A G E N C Y \n Autonomous Agent Marketplace on BNB Chain',
    style: { fg: 'green', bold: true, border: { fg: 'cyan' } },
    align: 'center', valign: 'middle'
});

// Worker Status (Left)
var clientLog = grid.set(2, 0, 4, 4, contrib.log, {
    fg: "green", selectedFg: "green", label: 'Client Agent (GPT-4o)'
});

// Matching Process (Center)
var matchDonut = grid.set(2, 4, 4, 4, contrib.donut, {
    label: 'Matching Engine Confidence',
    radius: 10,
    arcWidth: 4,
    remainColor: 'black',
    yPadding: 2,
    data: [{ percent: 0, label: 'Score', color: 'green' }]
});

// Worker Status (Right)
var workerLog = grid.set(2, 8, 4, 4, contrib.log, {
    fg: "cyan", selectedFg: "cyan", label: 'Worker Agent (Claude-3.5)'
});

// Escrow / Transaction Log (Bottom)
var txLog = grid.set(6, 0, 6, 8, contrib.log, {
    fg: "yellow", label: 'BNB Testnet Ledger / Escrow Operations'
});

// System Stats (Bottom Right)
var stats = grid.set(6, 8, 6, 4, contrib.line, {
    style: { line: "yellow", text: "green", baseline: "black" },
    xLabelPadding: 3, label: 'Platform Activity Layer'
});

screen.render();

// Simulation Scenario
let step = 0;
const series1 = { title: 'TX Volume', x: [], y: [] };

setInterval(function () {
    step++;

    // Client Activity
    if (step === 2) clientLog.log("Initializing Project: 'Summarize 200pg Report'");
    if (step === 4) clientLog.log("Uploading spec to IPFS...");
    if (step === 6) clientLog.log("Posting Job to DLAI Network...");
    if (step === 8) clientLog.log("Budget: 0.05 tBNB secured.");
    if (step === 35) clientLog.log("Received Result Hash: 0x8f2a...");
    if (step === 38) clientLog.log("Verifying output quality...");
    if (step === 42) clientLog.log("Approve Release. Rating: 5/5");

    // Matching Animation
    if (step > 8 && step < 20) {
        let pct = Math.min((step - 8) * 9, 87);
        matchDonut.setData([{ percent: pct, label: 'Match %', color: 'green' }]);
        if (step % 2 === 0) txLog.log(`Scoring Agent_${Math.floor(Math.random() * 900) + 100}: Score ${(Math.random() * 0.5 + 0.3).toFixed(2)}`);
    }

    if (step === 20) {
        matchDonut.setData([{ percent: 94, label: 'MATCHED', color: 'cyan' }]);
        txLog.log(">> BEST MATCH FOUND: Agent_Claude_Code (Score: 0.94)");
    }

    // Worker Activity
    if (step === 22) workerLog.log("New Task Alert: ID #9283");
    if (step === 24) workerLog.log("Accepting Escrow Terms...");
    if (step === 26) workerLog.log("Downloading Context from IPFS...");
    if (step === 29) workerLog.log("Processing (Reasoning Loop)...");
    if (step === 32) workerLog.log("Generating Final Summary...");
    if (step === 34) workerLog.log("Submitting Result Hash to Chain...");

    // Blockchain Log
    if (step === 9) txLog.log("[BNB] Contract Created: 0x71C...93A");
    if (step === 21) txLog.log("[BNB] Escrow Funded: 0.05 tBNB (Tx: 0xAB...12)");
    if (step === 34) txLog.log("[BNB] Result Hash Committed (Tx: 0xCD...34)");
    if (step === 43) txLog.log("[BNB] Payment Released: 0.0475 tBNB -> Worker");
    if (step === 43) txLog.log("[BNB] Platform Fee: 0.0025 tBNB -> Treasury");
    if (step === 45) txLog.log("[BNB] NFT Resume Updated: +1 Job, +5.0 Rating");

    // Graph Data
    series1.x.push(new Date().toTimeString().substr(0, 8));
    series1.y.push(Math.random() * 10 + (step > 20 ? 30 : 5));
    if (series1.x.length > 10) { series1.x.shift(); series1.y.shift(); }
    stats.setData([series1]);

    screen.render();

    if (step > 60) process.exit(0); // End demo
}, 800);

screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
});
