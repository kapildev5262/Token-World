const Chains = [
  {
    name: "Sepolia",  // Changed to match official MetaMask network name
    chainId: "0xaa36a7", // 11155111 in hex
    icon: '🔷',
    rpcUrl: "https://rpc.sepolia.org", // Updated to official RPC URL
    blockExplorer: "https://sepolia.etherscan.io",
    ERC20factoryAddress: "0x3506bDaDB1a7C7649180Be7C0A10B4b0806DC111",
    ERC721factoryAddress: "0x6B39D21905218f8E3091D64eE86f3Df8f34d4D08",
    currency: {
      name: "Sepolia Ether", // Added currency name
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    name: "Base Sepolia", // Changed to match official network name
    chainId: "0x14a34", // 84532 in hex
    icon: '◯',
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    ERC20factoryAddress: "0x56C9B53F4D2C3E2A0D6A51f354aC73F0861fBeBA",
    ERC721factoryAddress: "0x2964a73662E87BC8394fbc512ae854504B291b8E",
    currency: {
      name: "Ether", // Added currency name
      symbol: "ETH",
      decimals: 18,
    },
  },
  // {
  //   name: "Base",
  //   chainId: "0x2105", // 8453 in hex
  //   icon: '◯',
  //   rpcUrl: "https://mainnet.base.org",
  //   blockExplorer: "https://basescan.org",
  //   ERC20factoryAddress: "0x0000000000000000000000000000000000000000", // Replace with actual address
  //   ERC721factoryAddress: "0x0000000000000000000000000000000000000000", // Replace with actual address
  //   currency: {
  //     name: "Ether",
  //     symbol: "ETH",
  //     decimals: 18,
  //   },
  // },
];

export default Chains;

//   ethereum: {
//     name: "Ethereum Mainnet",
//     chainId: "0x1", // 1 in hex
//     rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
//     blockExplorer: "https://etherscan.io",
//     ERC20factoryAddress: "0xYourEthereumFactoryAddress", 
//     ERC721factoryAddress: "0xYourEthereumFactoryAddress", 
//     currency: {
//       symbol: "ETH",
//       decimals: 18,
//     },
//   },
//   polygon: {
//     name: "Polygon Mainnet",
//     chainId: "0x89", // 137 in hex
//     rpcUrl: "https://polygon-rpc.com",
//     blockExplorer: "https://polygonscan.com",
//     ERC20factoryAddress: "0xYourEthereumFactoryAddress", 
//     ERC721factoryAddress: "0xYourEthereumFactoryAddress", 
//     currency: {
//       symbol: "MATIC",
//       decimals: 18,
//     },
//   },
//   bsc: {
//     name: "Binance Smart Chain",
//     chainId: "0x38", // 56 in hex
//     rpcUrl: "https://bsc-dataseed.binance.org",
//     blockExplorer: "https://bscscan.com",
//     ERC20factoryAddress: "0xYourEthereumFactoryAddress", // Replace with actual address
//     ERC721factoryAddress: "0xYourEthereumFactoryAddress", // Replace with actual address
//     currency: {
//       symbol: "BNB",
//       decimals: 18,
//     },
//   },
//   arbitrum: {
//     name: "Arbitrum One",
//     chainId: "0xA4B1", // 42161 in hex
//     rpcUrl: "https://arb1.arbitrum.io/rpc",
//     blockExplorer: "https://arbiscan.io",
//     ERC20factoryAddress: "0xYourEthereumFactoryAddress", // Replace with actual address
//     ERC721factoryAddress: "0xYourEthereumFactoryAddress", // Replace with actual address
//     currency: {
//       symbol: "ETH",
//       decimals: 18,
//     },
//   },
//   avalanche: {
//     name: "Avalanche C-Chain",
//     chainId: "0xA86A", // 43114 in hex
//     rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
//     blockExplorer: "https://snowtrace.io",
//     ERC20factoryAddress: "0xYourEthereumFactoryAddress", // Replace with actual address
//     ERC721factoryAddress: "0xYourEthereumFactoryAddress", // Replace with actual address
//     currency: {
//       symbol: "AVAX",
//       decimals: 18,
//     },
//   },