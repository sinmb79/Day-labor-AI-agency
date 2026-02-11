// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MockEscrow is ReentrancyGuard {
    struct Escrow {
        address employer;
        address token;
        uint256 amount;
        address agent;
        bool funded;
        bool released;
    }

    mapping(bytes32 => Escrow) public escrows;

    event EscrowCreated(bytes32 indexed id, address employer, address token, uint256 amount, address agent);
    event EscrowFunded(bytes32 indexed id);
    event EscrowReleased(bytes32 indexed id);

    function createEscrow(bytes32 id, address token, uint256 amount, address agent) external {
        require(escrows[id].employer == address(0), "exists");
        escrows[id] = Escrow({
            employer: msg.sender,
            token: token,
            amount: amount,
            agent: agent,
            funded: false,
            released: false
        });
        emit EscrowCreated(id, msg.sender, token, amount, agent);
    }

    function fundEscrow(bytes32 id) external nonReentrant {
        Escrow storage e = escrows[id];
        require(e.employer != address(0), "not found");
        require(!e.funded, "already funded");
        IERC20(e.token).transferFrom(msg.sender, address(this), e.amount);
        e.funded = true;
        emit EscrowFunded(id);
    }

    function releaseEscrow(bytes32 id) external nonReentrant {
        Escrow storage e = escrows[id];
        require(e.funded, "not funded");
        require(!e.released, "released");
        // For demo simplicity, allow employer to release (in prod, use verifier/multisig)
        require(msg.sender == e.employer, "only employer");
        e.released = true;
        IERC20(e.token).transfer(e.agent, e.amount);
        emit EscrowReleased(id);
    }
}
