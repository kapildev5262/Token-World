import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Wallet, X, Copy, Check } from "lucide-react";
import { ethers } from "ethers";
import { useWallet } from "./WalletContext";
import "./WalletConnector.css";
import Network from "./Network";

// Define TokenFunctionalitySection outside of WalletConnector
const TokenFunctionalitySection = ({ account, selectedChain }) => {
  if (!account || !selectedChain) return null;

  return (
    <div className="section">
      <h2 className="section-title">3. Manage Tokens</h2>
      <div className="tabs-container">
        <div className="tabs">
          <button className="tab active">Create ERC-20</button>
          <button className="tab">Create ERC-721</button>
          <button className="tab">My Tokens</button>
        </div>

        <div className="tab-content">
          {/* Token creation form would go here */}
          <p>You can now create tokens on {selectedChain.name}</p>
          <p>Factory address: {selectedChain.ERC20factoryAddress}</p>

          {/* Form implementation would be added here */}
        </div>
      </div>
    </div>
  );
};

TokenFunctionalitySection.propTypes = {
  account: PropTypes.string.isRequired,
  selectedChain: PropTypes.shape({
    name: PropTypes.string.isRequired,
    ERC20factoryAddress: PropTypes.string.isRequired,
  }).isRequired,
};

const WalletConnector = () => {
  const { account, selectedChain, updateWalletState, clearWalletState } = useWallet();
  const [walletType, setWalletType] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  // Reset connection when chain changes
  useEffect(() => {
    if (account && selectedChain) {
      checkAndSwitchNetwork();
    }
  }, [selectedChain]);

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
      connect: () => setError("Coinbase Wallet integration requires additional setup"),
    },
    {
      name: "Trust Wallet",
      icon: "🔒",
      connect: () => setError("Trust Wallet integration requires additional setup"),
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

    if (!selectedChain) {
      setError("Please select a blockchain network first");
      setIsConnecting(false);
      return;
    }

    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Check if on the correct network
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        if (currentChainId !== selectedChain.chainId) {
          const switched = await switchToCorrectNetwork(selectedChain);
          if (!switched) {
            setError(`Please switch to ${selectedChain.name} in your wallet`);
            setIsConnecting(false);
            return;
          }
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        updateWalletState(userAddress, signer, provider);
        setWalletType("MetaMask");
        setShowModal(false);
        setIsPopupOpen(false); // Close popup when connected

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);
      } catch (err) {
        setError("Failed to connect to MetaMask. Please try again.");
        console.error("MetaMask connection error:", err);
      }
    } else {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
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

  const handleChainChanged = async (chainId) => {
    // If the chain changed to something other than our selected chain, check
    if (chainId !== selectedChain.chainId) {
      const switched = await switchToCorrectNetwork(selectedChain);
      if (!switched) {
        setError(`Please switch to ${selectedChain.name} in your wallet`);
        disconnectWallet();
      }
    }
  };

  const checkAndSwitchNetwork = async () => {
    if (!window.ethereum || !selectedChain) return;

    try {
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (currentChainId !== selectedChain.chainId) {
        await switchToCorrectNetwork(selectedChain);
      }
    } catch (error) {
      console.error("Failed to check network:", error);
    }
  };

  const switchToCorrectNetwork = async (chain) => {
    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chain.chainId }],
      });

      console.log(`Switched to ${chain.name}`);
      return true;
    } catch (error) {
      // If error code 4902, the chain hasn't been added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chain.chainId,
                chainName: chain.name,
                nativeCurrency: {
                  name: chain.currency.symbol,
                  symbol: chain.currency.symbol,
                  decimals: chain.currency.decimals,
                },
                rpcUrls: [chain.rpcUrl],
                blockExplorerUrls: [chain.blockExplorer],
              },
            ],
          });

          return true;
        } catch (addError) {
          console.error("Failed to add network:", addError);
          return false;
        }
      }

      console.error("Failed to switch network:", error);
      return false;
    }
  };

  function connectWalletConnect() {
    setError("WalletConnect integration requires additional setup");
    setShowModal(false);
  }

  function disconnectWallet() {
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    }

    clearWalletState();
    setWalletType("");
    setIsDropdownOpen(false);
  }

  const Modal = () => (
    <div className="wallet-modal-overlay">
      <div className="wallet-modal">
        <button onClick={() => setShowModal(false)} className="wallet-modal-close">
          <X className="h-5 w-5" />
        </button>

        <h2 className="wallet-modal-title">Connect Wallet</h2>

        {selectedChain ? (
          <div className="selected-network-info">
            <span className="network-icon">{selectedChain.icon}</span>
            <span>Connecting to {selectedChain.name}</span>
          </div>
        ) : (
          <div className="wallet-warning">Please select a network first</div>
        )}

        <div className="wallet-options">
          {walletOptions.map((wallet) => (
            <button key={wallet.name} onClick={wallet.connect} disabled={isConnecting || !selectedChain} className="wallet-option-btn">
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
      <div className="wallet-info-header" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <div className="wallet-network-info">
          <span className="network-icon">{selectedChain?.icon}</span>
          <span className="network-name">{selectedChain?.name}</span>
        </div>
        <div className="wallet-info-address">
          Account: {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      </div>

      {isDropdownOpen && (
        <div className="wallet-info-dropdown">
          <div className="wallet-details">
            <div className="wallet-details-title">Connected to {walletType}</div>
            <div className="wallet-details-network">Network: {selectedChain?.name}</div>
            <div className="wallet-details-account">
              Account: {account.slice(0, 6)}...{account.slice(-4)}
              <button onClick={copyToClipboard} className="wallet-copy-btn">
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button onClick={disconnectWallet} className="wallet-disconnect-btn">
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );

  const ConnectWalletButton = () => (
    <button onClick={() => setShowModal(true)} disabled={isConnecting || !selectedChain} className="wallet-connect-btn">
      <Wallet className="h-5 w-5" />
      <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
    </button>
  );

  const PopupContent = () => (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <button className="close-button" onClick={togglePopup}>
            ×
          </button>
        </div>

        <div className="popup-body">
          <div className="section">
            <h2 className="section-title">Select Network</h2>
            <Network />
          </div>
          <div className="section">
            <h2 className="section-title">Connect Wallet</h2>
            {account ? <WalletInfo /> : <ConnectWalletButton />}
          </div>

          {account && selectedChain && <TokenFunctionalitySection account={account} selectedChain={selectedChain} />}
        </div>
      </div>
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
        <button className="wallet-connect-btn" onClick={togglePopup}>
          <Wallet className="h-5 w-5" />
          <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
        </button>
      )}

      {isPopupOpen && <PopupContent />}
      {showModal && <Modal />}
    </div>
  );
};

export default WalletConnector;
