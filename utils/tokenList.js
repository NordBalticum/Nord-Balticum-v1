// 📁 src/utils/tokenlist.js

const isTestnet = process.env.NEXT_PUBLIC_TESTNET === "true";

// ✅ Dinaminis tokenų sąrašas pagal aplinką
const tokenList = isTestnet
  ? [
      {
        symbol: "tUSDT",
        name: "Test Tether USD",
        address: "0x7ef95a0Fe8c8eeF8eD1eAe33d3cD3f7B8b1e5783", // BSC Testnet Faucet Token
        decimals: 18,
        logo: "/logos/usdt.svg",
        active: true,
      },
      {
        symbol: "tDAI",
        name: "Test DAI",
        address: "0x8a9424745056Eb399FD19a0EC26A14316684e274", // Example Test Token
        decimals: 18,
        logo: "/logos/dai.svg",
        active: true,
      },
    ]
  : [
      {
        symbol: "USDT",
        name: "Tether USD",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum Mainnet
        decimals: 6,
        logo: "/logos/usdt.svg",
        active: true,
      },
      {
        symbol: "BUSD",
        name: "Binance USD",
        address: "0xe9e7cea3dedca5984780bafc599bd69add087d56", // BSC Mainnet
        decimals: 18,
        logo: "/logos/busd.svg",
        active: false, // Išjungtas laikinai
      },
      {
        symbol: "DAI",
        name: "DAI Stablecoin",
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // Ethereum Mainnet
        decimals: 18,
        logo: "/logos/dai.svg",
        active: true,
      },
    ];

export default tokenList;
