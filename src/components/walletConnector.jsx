import React, { useState, useEffect } from 'react';
import { Wallet, X } from 'lucide-react';

const WalletConnector = () => {
  const [account, setAccount] = useState('');
  const [walletType, setWalletType] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const walletOptions = [
    {
      name: 'MetaMask',
      icon: '🦊',
      connect: connectMetaMask
    },
    {
      name: 'WalletConnect',
      icon: '🔗',
      connect: connectWalletConnect
    },
    {
      name: 'Coinbase Wallet',
      icon: '📱',
      connect: () => setError('Coinbase Wallet integration requires additional setup')
    },
    {
      name: 'Trust Wallet',
      icon: '🔒',
      connect: () => setError('Trust Wallet integration requires additional setup')
    }
  ];

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setWalletType('MetaMask');
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    }
  };

  async function connectMetaMask() {
    setIsConnecting(true);
    setError('');

    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setWalletType('MetaMask');
        setShowModal(false);
      } catch (err) {
        setError('Failed to connect to MetaMask. Please try again.');
        console.error('MetaMask connection error:', err);
      }
    } else {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
    }
    setIsConnecting(false);
  }

  function connectWalletConnect() {
    setError('WalletConnect integration requires additional setup');
    setShowModal(false);
  }

  function disconnectWallet() {
    setAccount('');
    setWalletType('');
  }

  const Modal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm relative">
        <button 
          onClick={() => setShowModal(false)}
          className="btn-primary"
        >
          
        </button>
        
        <h2 className="text-xl font-bold mb-4">Connect Wallet</h2>
        
        <div className="space-y-2">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.name}
              onClick={wallet.connect}
              disabled={isConnecting}
              className="w-full p-3 border rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <span className="text-2xl">{wallet.icon}</span>
              <span className="font-medium">{wallet.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md p-4 space-y-4">
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <div className="font-bold">Error</div>
          <div>{error}</div>
        </div>
      )}

      {account ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 text-green-700 rounded-lg">
            <div className="font-bold">Connected to {walletType}</div>
            <div>Account: {account.slice(0, 6)}...{account.slice(-4)}</div>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          disabled={isConnecting}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Wallet className="h-5 w-5" />
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>
      )}

      {showModal && <Modal />}
    </div>
  );
};

export default WalletConnector;