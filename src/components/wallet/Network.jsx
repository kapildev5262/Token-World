// Network.jsx
import { useState } from 'react';
import { useWallet } from './WalletContext';
import Chains from './Chains';
import './Network.css';

const Network = () => {
  const [activeTab, setActiveTab] = useState('All');
  const { selectedChain, updateSelectedChain } = useWallet();

  const tabs = [
    'All', 
    'ERC-20 Token Deployment', 
    'ERC-721 Token Deployment', 
    'Multi-account Distribution'
  ];

  const handleChainSelect = (chain) => {
    updateSelectedChain(chain);
  };

  return (
    <div className="blockchain-selector">
      {/* Tab selector */}
      <div className="tab-container">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Blockchain grid */}
      <div className="blockchain-grid">
        {Chains.map(chain => (
          <div 
            key={chain.chainId}
            className={`blockchain-item ${selectedChain?.chainId === chain.chainId ? 'selected' : ''}`}
            onClick={() => handleChainSelect(chain)}
          >
            <div className="blockchain-icon">{chain.icon}</div>
            <div className="blockchain-name">{chain.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Network;