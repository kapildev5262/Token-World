import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ERC20FactoryABI } from "./ERC20FactoryABI";
import { ERC20ABI } from "./ERC20ABI";
import { MintableERC20ABI } from "./MintableERC20ABI";
import "./erc20.css";

import { useWallet } from "../../components/wallet/WalletContext";
import WalletConnector from "../../components/wallet/walletConnector";

const ERC20FactoryUI = () => {
  const { account, signer, selectedChain } = useWallet();
  const contractAddress = selectedChain?.ERC20factoryAddress;

  // State variables
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [factoryBalance, setFactoryBalance] = useState("0");
  const [currentFees, setCurrentFees] = useState({
    small: "0",
    medium: "0",
    large: "0",
  });

  // Token creation state
  const [tokenForm, setTokenForm] = useState({
    name: "",
    symbol: "",
    initialSupply: "",
    decimals: "18",
    isMintable: false,
    fee: "0",
  });

  // Fee update state
  const [feeForm, setFeeForm] = useState({
    smallTierFee: "",
    mediumTierFee: "",
    largeTierFee: "",
  });

  // Token operations state
  const [tokenOpsForm, setTokenOpsForm] = useState({
    tokenAddress: "",
    recipient: "",
    amount: "",
    isFactoryCreated: false,
    isMintable: false,
    isCreator: false,
    mintFee: "0",
  });

  // Withdrawal state
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  // Recovery state
  const [recoveryForm, setRecoveryForm] = useState({
    tokenAddress: "",
    recipient: "",
    amount: "",
  });

  // Deployed tokens state
  const [deployedTokens, setDeployedTokens] = useState([]);

  // Error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initialize contract when wallet is connected
  useEffect(() => {
    const initializeContract = async () => {
      if (!signer) return;

      try {
        // Initialize the contract with connected signer
        const factoryContract = new ethers.Contract(contractAddress, ERC20FactoryABI, signer);
        setContract(factoryContract);

        // Check if the connected account is the owner
        const ownerAddress = await factoryContract.owner();
        setIsOwner(ownerAddress.toLowerCase() === account.toLowerCase());

        // Get current fees
        const fees = await factoryContract.getCurrentFees();
        setCurrentFees({
          small: ethers.formatEther(fees.small),
          medium: ethers.formatEther(fees.medium),
          large: ethers.formatEther(fees.large),
        });

        // Get contract balance if owner
        if (ownerAddress.toLowerCase() === account.toLowerCase()) {
          const balance = await factoryContract.getContractBalance();
          setFactoryBalance(ethers.formatEther(balance));
        }

        // Set fee form default values
        setFeeForm({
          smallTierFee: ethers.formatEther(fees.small),
          mediumTierFee: ethers.formatEther(fees.medium),
          largeTierFee: ethers.formatEther(fees.large),
        });

        // Clear error messages
        setError("");
      } catch (err) {
        console.error("Error initializing contract:", err);
        // setError(`Failed to initialize contract: ${err.message}`);
      }
    };

    initializeContract();
  }, [signer, account, contractAddress]);

  // Calculate fee based on initial supply
  const calculateFee = () => {
    if (!tokenForm.initialSupply || isNaN(tokenForm.initialSupply)) {
      return "0";
    }

    const supply = parseInt(tokenForm.initialSupply);
    let fee;

    if (supply < 1000) {
      fee = currentFees.small;
    } else if (supply < 10000) {
      fee = currentFees.medium;
    } else {
      fee = currentFees.large;
    }

    setTokenForm((prev) => ({ ...prev, fee }));
    return fee;
  };

  const calculateMintFee = () => {
    if (!tokenOpsForm.amount || isNaN(tokenOpsForm.amount)) {
      return "0";
    }

    const mintsupply = parseInt(tokenOpsForm.amount);
    let mintFee;

    if (mintsupply < 1000) {
      mintFee = currentFees.small;
    } else if (mintsupply < 10000) {
      mintFee = currentFees.medium;
    } else {
      mintFee = currentFees.large;
    }

    setTokenOpsForm((prev) => ({ ...prev, mintFee }));
    return mintFee;
  };

  // Update fee when token supply or fee structure changes
  useEffect(() => {
    calculateFee();
  }, [tokenForm.initialSupply, currentFees]);

  useEffect(() => {
    calculateMintFee();
  }, [tokenOpsForm.amount, currentFees]);

  // Deploy token
  const deployToken = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!contract) {
        setError("Contract not connected");
        return;
      }

      if (!tokenForm.name || !tokenForm.symbol || !tokenForm.initialSupply) {
        setError("All fields are required");
        return;
      }

      // Validation
      if (tokenForm.name.length > 32) {
        setError("Name must be 32 characters or less");
        return;
      }

      if (tokenForm.symbol.length > 8) {
        setError("Symbol must be 8 characters or less");
        return;
      }

      if (parseInt(tokenForm.decimals) > 18) {
        setError("Decimals must be 18 or less");
        return;
      }

      const feeAmount = ethers.parseEther(tokenForm.fee);

      const tx = await contract.deployToken(tokenForm.name, tokenForm.symbol, tokenForm.initialSupply, tokenForm.decimals, tokenForm.isMintable, { value: feeAmount });

      setSuccess("Deploying token, please wait for confirmation...");

      const receipt = await tx.wait();
      const tokenCreatedEvent = receipt.logs
        .filter((log) => {
          try {
            const parsedLog = contract.interface.parseLog({
              topics: log.topics,
              data: log.data,
            });
            return parsedLog.name === "TokenDeployed";
          } catch (e) {
            return false;
          }
        })
        .map((log) =>
          contract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          })
        )[0];

      if (tokenCreatedEvent) {
        const [tokenAddress, creator, name, symbol, initialSupply, decimals, , isMintable] = tokenCreatedEvent.args;

        // Add to deployed tokens list
        setDeployedTokens((prev) => [
          ...prev,
          {
            name: name,
            symbol: symbol,
            address: tokenAddress,
            initialSupply: initialSupply,
            decimals: decimals,
            isMintable: isMintable,
            creator: creator,
          },
        ]);

        setSuccess(`Token deployed successfully! Address: ${tokenAddress}`);

        // Reset form fields
        setTokenForm({
          name: "",
          symbol: "",
          initialSupply: "",
          decimals: "18",
          isMintable: false,
          fee: "0",
        });
      } else {
        setSuccess("Token deployed, but could not retrieve the address");
      }
    } catch (err) {
      setError(`Failed to deploy token: ${err.message}`);
    }
  };

  const validateTokenForMinting = async (tokenAddress, account, contract) => {
    if (!tokenAddress || !ethers.isAddress(tokenAddress) || !contract || !account) {
      return {
        isValid: false,
        message: "Please enter a valid token address",
      };
    }

    try {
      // Check if token was created by factory
      const creator = await contract.getTokenCreator(tokenAddress);

      // Token not created by factory
      if (creator === ethers.ZeroAddress) {
        return {
          isValid: false,
          message: "This token was not created by this factory",
        };
      }

      // Not the creator
      if (creator.toLowerCase() !== account.toLowerCase()) {
        return {
          isValid: false,
          message: "You are not the creator of this token",
        };
      }

      // Check if token is mintable
      try {
        const tokenContract = new ethers.Contract(tokenAddress, MintableERC20ABI, contract.runner);

        // This will throw if function doesn't exist
        const mintFunctionFragment = tokenContract.interface.getFunction("mint");

        if (!mintFunctionFragment) {
          return {
            isValid: false,
            message: "This token is not mintable",
          };
        }

        return {
          isValid: true,
          message: "Token is valid and mintable",
        };
      } catch (err) {
        return {
          isValid: false,
          message: "This token is not mintable",
        };
      }
    } catch (err) {
      console.error("Error validating token:", err);
      return {
        isValid: false,
        message: "Error validating token: " + err.message,
      };
    }
  };

  // Replace the mintTokens function with this improved version
  const mintTokens = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!contract) {
        setError("Contract not connected");
        return;
      }

      if (!tokenOpsForm.tokenAddress || !tokenOpsForm.recipient || !tokenOpsForm.amount) {
        setError("All fields are required");
        return;
      }

      if (!ethers.isAddress(tokenOpsForm.tokenAddress)) {
        setError("Invalid token address");
        return;
      }

      if (!ethers.isAddress(tokenOpsForm.recipient)) {
        setError("Invalid recipient address");
        return;
      }

      // Validate token before attempting to mint
      const validation = await validateTokenForMinting(tokenOpsForm.tokenAddress, account, contract);

      if (!validation.isValid) {
        setError(validation.message);
        return;
      }

      try {
        // Calculate fee based on the non-decimal adjusted amount
        const feeAmount = ethers.parseEther(tokenOpsForm.mintFee);

        // Send the transaction with the correct fee
        setSuccess("Preparing to mint tokens...");
        const tx = await contract.mintToken(
          tokenOpsForm.tokenAddress,
          tokenOpsForm.recipient,
          parseInt(tokenOpsForm.amount), // THIS IS KEY: use the non-decimal adjusted amount
          { value: feeAmount }
        );

        setSuccess("Minting tokens, please wait for confirmation...");

        const receipt = await tx.wait();

        // Look for TokenMinted event
        const tokenMintedEvent = receipt.logs
          .filter((log) => {
            try {
              const parsedLog = contract.interface.parseLog({
                topics: log.topics,
                data: log.data,
              });
              return parsedLog.name === "TokenMinted";
            } catch (e) {
              return false;
            }
          })
          .map((log) =>
            contract.interface.parseLog({
              topics: log.topics,
              data: log.data,
            })
          )[0];

        if (tokenMintedEvent) {
          setSuccess(`Successfully minted ${tokenOpsForm.amount} tokens to ${tokenOpsForm.recipient}`);
        } else {
          setSuccess(`Transaction confirmed, but no minting event found. Please verify the balance.`);
        }

        // Reset form fields
        setTokenOpsForm({
          ...tokenOpsForm,
          recipient: "",
          amount: "",
        });
      } catch (err) {
        if (err.message.includes("user rejected")) {
          setError("Transaction was rejected by user");
        } else if (err.message.includes("insufficient funds")) {
          setError("Insufficient funds to complete this transaction");
        } else {
          setError(`Failed to mint tokens: ${err.message}`);
        }
      }
    } catch (err) {
      setError(`Failed to mint tokens: ${err.message}`);
    }
  };

  // Update fees (owner only)
  const updateFees = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!contract) {
        setError("Contract not connected");
        return;
      }

      if (!isOwner) {
        setError("Only the owner can update fees");
        return;
      }

      if (!feeForm.smallTierFee || !feeForm.mediumTierFee || !feeForm.largeTierFee) {
        setError("All fee fields are required");
        return;
      }

      const smallFee = ethers.parseEther(feeForm.smallTierFee);
      const mediumFee = ethers.parseEther(feeForm.mediumTierFee);
      const largeFee = ethers.parseEther(feeForm.largeTierFee);

      const tx = await contract.updateFees(smallFee, mediumFee, largeFee);

      setSuccess("Updating fees, please wait for confirmation...");

      await tx.wait();

      // Update local state
      setCurrentFees({
        small: feeForm.smallTierFee,
        medium: feeForm.mediumTierFee,
        large: feeForm.largeTierFee,
      });

      setSuccess("Fees updated successfully");
    } catch (err) {
      setError(`Failed to update fees: ${err.message}`);
    }
  };

  // Withdraw fees (owner only)
  const withdrawFees = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!contract) {
        setError("Contract not connected");
        return;
      }

      if (!isOwner) {
        setError("Only the owner can withdraw fees");
        return;
      }

      const amount = withdrawalAmount ? ethers.parseEther(withdrawalAmount) : ethers.BigNumber.from("0");

      const tx = await contract.withdrawFees(amount);

      setSuccess("Withdrawing fees, please wait for confirmation...");

      await tx.wait();

      // Update contract balance
      const newBalance = await contract.getContractBalance();
      setFactoryBalance(ethers.formatEther(newBalance));

      setSuccess(`Successfully withdrew ${withdrawalAmount || factoryBalance} ETH`);
      setWithdrawalAmount("");
    } catch (err) {
      setError(`Failed to withdraw fees: ${err.message}`);
    }
  };

  // Recover ERC20 tokens (owner only)
  const recoverTokens = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!contract) {
        setError("Contract not connected");
        return;
      }

      if (!isOwner) {
        setError("Only the owner can recover tokens");
        return;
      }

      if (!recoveryForm.tokenAddress || !recoveryForm.recipient || !recoveryForm.amount) {
        setError("All fields are required");
        return;
      }

      if (!ethers.isAddress(recoveryForm.tokenAddress)) {
        setError("Invalid token address");
        return;
      }

      if (!ethers.isAddress(recoveryForm.recipient)) {
        setError("Invalid recipient address");
        return;
      }

      // Get token decimals
      const tokenContract = new ethers.Contract(recoveryForm.tokenAddress, ERC20ABI, signer);

      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(recoveryForm.amount, decimals);

      const tx = await contract.recoverERC20(recoveryForm.tokenAddress, recoveryForm.recipient, parsedAmount);

      setSuccess("Recovering tokens, please wait for confirmation...");

      await tx.wait();
      setSuccess(`Successfully recovered ${recoveryForm.amount} tokens to ${recoveryForm.recipient}`);

      // Reset form fields
      setRecoveryForm({
        tokenAddress: "",
        recipient: "",
        amount: "",
      });
    } catch (err) {
      setError(`Failed to recover tokens: ${err.message}`);
    }
  };

  // Handle changes for token form
  const handleTokenFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTokenForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle changes for fee form
  const handleFeeFormChange = (e) => {
    const { name, value } = e.target;
    setFeeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle changes for token operations form
  const handleTokenOpsFormChange = (e) => {
    const { name, value } = e.target;
    setTokenOpsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle changes for recovery form
  const handleRecoveryFormChange = (e) => {
    const { name, value } = e.target;
    setRecoveryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="factory-container">
      <header className="factory-header">
        <h1>ERC20 Token Factory</h1>
        <div className="connection-info">
          {!account && (
            <div>
              <h3>Ready to deploy your token?</h3>
              <p>Connect your wallet and start minting ERC-20 Token</p>
              <WalletConnector />
            </div>
          )}
          {account && <div className="account-info">{isOwner && <span className="owner-badge">Owner</span>}</div>}
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="contract-connection">
        <h2>Contract Connection</h2>

        {isOwner && (
          <div className="contract-info">
            <p>Connected to:{contractAddress}</p>
            <div className="fee-info">
              <p>Current Fees:</p>
              <ul>
                <li>Small Supply (&lt;1000): {currentFees.small} ETH</li>
                <li>Medium Supply (1000-9999): {currentFees.medium} ETH</li>
                <li>Large Supply (≥10000): {currentFees.large} ETH</li>
              </ul>
            </div>
            <div className="owner-info">
              <p>Contract Balance: {factoryBalance} ETH</p>
            </div>
          </div>
        )}
      </div>

      {account && !contract && (
        <div className="loading-container">
          <p>Connecting to contract...</p>
        </div>
      )}

      {contract && (
        <div className="main-content">
          <div className="section">
            <h2>Create New Token</h2>
            <form onSubmit={deployToken}>
              <div className="form-group">
                <label>Token Name (max 32 chars):</label>
                <input type="text" name="name" value={tokenForm.name} onChange={handleTokenFormChange} placeholder="e.g., My Cool Token" maxLength={32} required />
              </div>

              <div className="form-group">
                <label>Token Symbol (max 8 chars):</label>
                <input type="text" name="symbol" value={tokenForm.symbol} onChange={handleTokenFormChange} placeholder="e.g., MCT" maxLength={8} required />
              </div>

              <div className="form-group">
                <label>Initial Supply (whole tokens):</label>
                <input type="number" name="initialSupply" value={tokenForm.initialSupply} onChange={handleTokenFormChange} placeholder="e.g., 1000000" min="1" required />
              </div>

              <div className="form-group">
                <label>Decimals (max 18):</label>
                <input type="number" name="decimals" value={tokenForm.decimals} onChange={handleTokenFormChange} placeholder="e.g., 18" min="0" max="18" required />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="isMintable" checked={tokenForm.isMintable} onChange={handleTokenFormChange} />
                  Make Token Mintable
                </label>
              </div>

              <button type="submit" className="deploy-btn">
                Deploy Token
              </button>
            </form>
          </div>

          <div className="section">
            <h2>Mint Additional Tokens</h2>
            <p className="section-info">For factory-created mintable tokens only. You must be the token creator.</p>
            <form onSubmit={mintTokens}>
              <div className="form-group">
                <label>Token Address:</label>
                <input type="text" name="tokenAddress" value={tokenOpsForm.tokenAddress} onChange={handleTokenOpsFormChange} placeholder="0x..." required />
              </div>

              {tokenOpsForm.tokenAddress && ethers.isAddress(tokenOpsForm.tokenAddress) && (
                <div className="token-validation-status">
                  <button
                    type="button"
                    className="validate-btn"
                    onClick={async () => {
                      const validation = await validateTokenForMinting(tokenOpsForm.tokenAddress, account, contract);
                      if (validation.isValid) {
                        setSuccess(validation.message);
                      } else {
                        setError(validation.message);
                      }
                    }}
                  >
                    Validate Token
                  </button>
                </div>
              )}

              <div className="form-group">
                <label>Recipient Address:</label>
                <input type="text" name="recipient" value={tokenOpsForm.recipient} onChange={handleTokenOpsFormChange} placeholder="0x..." required />
              </div>

              <div className="form-group">
                <label>Amount to Mint:</label>
                <input type="text" name="amount" value={tokenOpsForm.amount} onChange={handleTokenOpsFormChange} placeholder="e.g., 1000" required />
              </div>

              <button type="submit" className="mint-btn">
                Mint Tokens
              </button>
            </form>
          </div>

          {isOwner && (
            <div className="admin-sections">
              <div className="section">
                <h2>Update Fees (Owner Only)</h2>
                <form onSubmit={updateFees}>
                  <div className="form-group">
                    <label>Small Tier Fee (ETH):</label>
                    <input type="text" name="smallTierFee" value={feeForm.smallTierFee} onChange={handleFeeFormChange} placeholder={currentFees.small} required />
                  </div>

                  <div className="form-group">
                    <label>Medium Tier Fee (ETH):</label>
                    <input type="text" name="mediumTierFee" value={feeForm.mediumTierFee} onChange={handleFeeFormChange} placeholder={currentFees.medium} required />
                  </div>

                  <div className="form-group">
                    <label>Large Tier Fee (ETH):</label>
                    <input type="text" name="largeTierFee" value={feeForm.largeTierFee} onChange={handleFeeFormChange} placeholder={currentFees.large} required />
                  </div>

                  <button type="submit" className="update-btn">
                    Update Fees
                  </button>
                </form>
              </div>

              <div className="section">
                <h2>Withdraw Fees (Owner Only)</h2>
                <p className="section-info">Current contract balance: {factoryBalance} ETH</p>
                <form onSubmit={withdrawFees}>
                  <div className="form-group">
                    <label>Amount to Withdraw (ETH):</label>
                    <input type="text" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(e.target.value)} placeholder="Leave empty to withdraw all" />
                  </div>

                  <button type="submit" className="withdraw-btn">
                    Withdraw
                  </button>
                </form>
              </div>

              <div className="section">
                <h2>Recover ERC20 Tokens (Owner Only)</h2>
                <p className="section-info">Emergency function to recover tokens accidentally sent to the contract.</p>
                <form onSubmit={recoverTokens}>
                  <div className="form-group">
                    <label>Token Address:</label>
                    <input type="text" name="tokenAddress" value={recoveryForm.tokenAddress} onChange={handleRecoveryFormChange} placeholder="0x..." required />
                  </div>

                  <div className="form-group">
                    <label>Recipient Address:</label>
                    <input type="text" name="recipient" value={recoveryForm.recipient} onChange={handleRecoveryFormChange} placeholder="0x..." required />
                  </div>

                  <div className="form-group">
                    <label>Amount to Recover:</label>
                    <input type="text" name="amount" value={recoveryForm.amount} onChange={handleRecoveryFormChange} placeholder="e.g., 1000" required />
                  </div>

                  <button type="submit" className="recover-btn">
                    Recover Tokens
                  </button>
                </form>
              </div>
            </div>
          )}

          {deployedTokens.length > 0 && (
            <div className="section deployed-tokens">
              <h2>Your Deployed Tokens</h2>
              <div className="tokens-list">
                {deployedTokens.map((token, index) => (
                  <div key={index} className="token-card">
                    <h3>
                      {token.name} ({token.symbol})
                    </h3>
                    <p className="token-address">
                      Address: {token.address.substring(0, 8)}...
                      {token.address.substring(token.address.length - 6)}
                    </p>
                    <div className="token-details">
                      <p>Initial Supply: {token.initialSupply}</p>
                      <p>Decimals: {token.decimals}</p>
                      <p>{token.isMintable ? "Mintable" : "Non-Mintable"}</p>
                    </div>
                    <button
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(token.address);
                        setSuccess("Token address copied to clipboard!");
                        setTimeout(() => setSuccess(""), 3000);
                      }}
                    >
                      Copy Address
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ERC20FactoryUI;
