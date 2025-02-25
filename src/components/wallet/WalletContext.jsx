import PropTypes from 'prop-types';
// WalletContext.jsx
import  { createContext, useContext, useState } from 'react';


const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [selectedChain, setSelectedChain] = useState(null);

  const updateWalletState = (address, newSigner, newProvider) => {
    setAccount(address);
    setSigner(newSigner);
    setProvider(newProvider);
  };

  const clearWalletState = () => {
    setAccount("");
    setSigner(null);
    setProvider(null);
  };

  const updateSelectedChain = (chain) => {
    setSelectedChain(chain);
  };

  return (
    <WalletContext.Provider 
      value={{ 
        account, 
        signer, 
        provider, 
        selectedChain,
        updateWalletState, 
        clearWalletState,
        updateSelectedChain
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);

WalletProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// export function useWallet() {
//   const context = useContext(WalletContext);
//   if (context === undefined) {
//     throw new Error('useWallet must be used within a WalletProvider');
//   }
//   return context;
// }
