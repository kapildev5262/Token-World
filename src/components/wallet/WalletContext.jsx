// WalletContext.js
import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  const updateWalletState = (newAccount, newSigner, newProvider) => {
    setAccount(newAccount);
    setSigner(newSigner);
    setProvider(newProvider);
  };

  const clearWalletState = () => {
    setAccount(null);
    setSigner(null);
    setProvider(null);
  };

  return (
    <WalletContext.Provider 
      value={{
        account,
        signer,
        provider,
        updateWalletState,
        clearWalletState
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

WalletProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}