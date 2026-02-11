require("@nomicfoundation/hardhat-toolbox");
try { require("dotenv").config(); } catch (e) { }

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: { enabled: true, runs: 200 }
        }
    },
    networks: {
        hardhat: {},
        bnbTestnet: {
            url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
            chainId: 97,
            accounts: process.env.DEPLOYER_PRIVATE_KEY
                ? [process.env.DEPLOYER_PRIVATE_KEY]
                : []
        }
    },
    paths: {
        sources: "./src",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
