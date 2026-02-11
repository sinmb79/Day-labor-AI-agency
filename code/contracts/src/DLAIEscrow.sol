// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DLAIEscrow
 * @notice Escrow contract for Day Labor AI Agency
 * @dev Holds tBNB (native token) for agent-to-agent payments on BNB Testnet
 */
contract DLAIEscrow is ReentrancyGuard {
    
    address public owner;
    address public feeRecipient;
    uint256 public platformFeeBps = 500; // 5% = 500 basis points

    struct Job {
        address client;
        address worker;
        uint256 amount;
        uint256 fee;
        uint256 deadline;
        JobStatus status;
    }

    enum JobStatus { 
        Created,    // 0: escrow created, awaiting deposit
        Funded,     // 1: client deposited tBNB
        Completed,  // 2: worker submitted, verified, funds released
        Disputed,   // 3: dispute raised
        Refunded    // 4: refunded to client
    }

    mapping(bytes32 => Job) public jobs;

    event EscrowCreated(bytes32 indexed jobId, address client, address worker, uint256 amount);
    event EscrowFunded(bytes32 indexed jobId, uint256 amount);
    event EscrowReleased(bytes32 indexed jobId, address worker, uint256 payout, uint256 fee);
    event EscrowDisputed(bytes32 indexed jobId);
    event EscrowRefunded(bytes32 indexed jobId, address client, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _feeRecipient) {
        owner = msg.sender;
        feeRecipient = _feeRecipient;
    }

    /// @notice Create an escrow for a job
    function createEscrow(
        bytes32 jobId,
        address worker,
        uint256 deadline
    ) external {
        require(jobs[jobId].client == address(0), "Job exists");
        require(worker != address(0), "Invalid worker");

        uint256 fee = 0; // calculated on deposit
        jobs[jobId] = Job({
            client: msg.sender,
            worker: worker,
            amount: 0,
            fee: fee,
            deadline: deadline,
            status: JobStatus.Created
        });

        emit EscrowCreated(jobId, msg.sender, worker, 0);
    }

    /// @notice Client deposits tBNB into escrow
    function deposit(bytes32 jobId) external payable nonReentrant {
        Job storage job = jobs[jobId];
        require(job.client == msg.sender, "Not client");
        require(job.status == JobStatus.Created, "Not in Created status");
        require(msg.value > 0, "No value");

        uint256 fee = (msg.value * platformFeeBps) / 10000;
        job.amount = msg.value;
        job.fee = fee;
        job.status = JobStatus.Funded;

        emit EscrowFunded(jobId, msg.value);
    }

    /// @notice Release funds to worker after verification
    function release(bytes32 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Funded, "Not funded");
        // Allow client or owner (admin agent) to release
        require(msg.sender == job.client || msg.sender == owner, "Not authorized");

        job.status = JobStatus.Completed;

        uint256 payout = job.amount - job.fee;

        // Transfer payout to worker
        (bool sent1, ) = payable(job.worker).call{value: payout}("");
        require(sent1, "Worker transfer failed");

        // Transfer fee to platform
        if (job.fee > 0) {
            (bool sent2, ) = payable(feeRecipient).call{value: job.fee}("");
            require(sent2, "Fee transfer failed");
        }

        emit EscrowReleased(jobId, job.worker, payout, job.fee);
    }

    /// @notice Raise a dispute (locks funds)
    function dispute(bytes32 jobId) external {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Funded, "Not funded");
        require(msg.sender == job.client || msg.sender == job.worker, "Not party");

        job.status = JobStatus.Disputed;
        emit EscrowDisputed(jobId);
    }

    /// @notice Admin resolves dispute
    function resolveDispute(bytes32 jobId, bool releaseToWorker) external onlyOwner nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Disputed, "Not disputed");

        if (releaseToWorker) {
            job.status = JobStatus.Completed;
            uint256 payout = job.amount - job.fee;
            (bool sent1, ) = payable(job.worker).call{value: payout}("");
            require(sent1, "Transfer failed");
            if (job.fee > 0) {
                (bool sent2, ) = payable(feeRecipient).call{value: job.fee}("");
                require(sent2, "Fee transfer failed");
            }
            emit EscrowReleased(jobId, job.worker, payout, job.fee);
        } else {
            job.status = JobStatus.Refunded;
            (bool sent, ) = payable(job.client).call{value: job.amount}("");
            require(sent, "Refund failed");
            emit EscrowRefunded(jobId, job.client, job.amount);
        }
    }

    /// @notice Update platform fee (admin only)
    function setFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // max 10%
        platformFeeBps = newFeeBps;
    }

    /// @notice Get job details
    function getJob(bytes32 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }
}
