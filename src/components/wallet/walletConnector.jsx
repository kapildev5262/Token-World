import { useState } from 'react';
import { Wallet, X, Copy, Check } from 'lucide-react';
import { ethers } from "ethers";
import { useWallet } from './WalletContext';
import './WalletConnector.css';

const WalletConnector = () => {
  const { account, updateWalletState, clearWalletState } = useWallet();
  const [walletType, setWalletType] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const walletOptions = [
    {
      name: "MetaMask",
      icon: "🦊",
      connect: connectMetaMask,
    },
    {
      name: "WalletConnect",
      icon: "🔗",
      connect: connectWalletConnect,
    },
    {
      name: "Coinbase Wallet",
      icon: "📱",
      connect: () =>
        setError("Coinbase Wallet integration requires additional setup"),
    },
    {
      name: "Trust Wallet",
      icon: "🔒",
      connect: () =>
        setError("Trust Wallet integration requires additional setup"),
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(account);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  async function connectMetaMask() {
    setIsConnecting(true);
    setError("");

    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        updateWalletState(userAddress, signer, provider);
        setWalletType("MetaMask");
        setShowModal(false);

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      } catch (err) {
        setError("Failed to connect to MetaMask. Please try again.");
        console.error("MetaMask connection error:", err);
      }
    } else {
      setError(
        "MetaMask is not installed. Please install MetaMask to continue."
      );
    }
    setIsConnecting(false);
  }

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      updateWalletState(accounts[0], signer, provider);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  function connectWalletConnect() {
    setError("WalletConnect integration requires additional setup");
    setShowModal(false);
  }

  function disconnectWallet() {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
    
    clearWalletState();
    setWalletType("");
    setIsDropdownOpen(false);
  }

  const Modal = () => (
    <div className="wallet-modal-overlay">
      <div className="wallet-modal">
        <button
          onClick={() => setShowModal(false)}
          className="wallet-modal-close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="wallet-modal-title">Connect Wallet</h2>

        <div className="wallet-options">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.name}
              onClick={wallet.connect}
              disabled={isConnecting}
              className="wallet-option-btn"
            >
              <span className="wallet-option-icon">{wallet.icon}</span>
              <span className="wallet-option-name">{wallet.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const WalletInfo = () => (
    <div className="wallet-info-container">
      <div 
        className="wallet-info-header"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="wallet-info-address">
        Account: {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      </div>
      
      {isDropdownOpen && (
        <div className="wallet-info-dropdown">
          <div className="wallet-details">
            <div className="wallet-details-title">Connected to {walletType}</div>
            <div className="wallet-details-account">
              Account: {account.slice(0, 6)}...{account.slice(-4)}
              <button
                onClick={copyToClipboard}
                className="wallet-copy-btn"
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="wallet-disconnect-btn"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="wallet-container">
      {error && (
        <div className="wallet-error">
          <div className="wallet-error-title">Error</div>
          <div className="wallet-error-message">{error}</div>
        </div>
      )}

      {account ? (
        <WalletInfo />
      ) : (
        <button
          onClick={() => setShowModal(true)}
          disabled={isConnecting}
          className="wallet-connect-btn"
        >
          <Wallet/>
          <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
        </button>
      )}

      {showModal && <Modal />}
    </div>
  );
};

export default WalletConnector;