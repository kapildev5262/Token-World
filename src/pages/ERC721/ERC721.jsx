import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../../components/wallet/WalletContext";
import WalletConnector from "../../components/wallet/walletConnector";

// Import ABIs (you'll need to create these files)
import { ERC721FactoryABI } from "./ERC721FactoryABI";
import { CustomERC721ABI } from "./CustomERC721ABI";
import { MintableERC721ABI } from "./MintableERC721ABI";

import "./erc721.css";

const ERC721FactoryUI = () => {
  const { account, signer, selectedChain } = useWallet();
  const contractAddress = selectedChain?.ERC721factoryAddress;

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
    baseURI: "",
    initialMintSize: "1",
    isMintable: false,
    royaltyFee: "0",
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
    quantity: "",
    isFactoryCreated: false,
    isMintable: false,
    isCreator: false,
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
        const factoryContract = new ethers.Contract(contractAddress, ERC721FactoryABI, signer);
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

        // Set fee form default values
        setFeeForm({
          smallTierFee: ethers.formatEther(fees.small),
          mediumTierFee: ethers.formatEther(fees.medium),
          largeTierFee: ethers.formatEther(fees.large),
        });

        // Get contract balance if owner
        if (ownerAddress.toLowerCase() === account.toLowerCase()) {
          const balance = await factoryContract.getContractBalance();
          setFactoryBalance(ethers.formatEther(balance));
        }

        // Clear error messages
        setError("");
      } catch (err) {
        console.error("Error initializing contract:", err);
        // setError(`Failed to initialize contract: ${err.message}`);
      }
    };

    initializeContract();
  }, [signer, account, contractAddress]);

  // Calculate fee based on initial mint size
  const calculateFee = () => {
    if (!tokenForm.initialMintSize || isNaN(tokenForm.initialMintSize)) {
      return "0";
    }

    const mintSize = parseInt(tokenForm.initialMintSize);
    let fee;

    if (mintSize < 50) {
      fee = currentFees.small;
    } else if (mintSize < 200) {
      fee = currentFees.medium;
    } else {
      fee = currentFees.large;
    }

    setTokenForm((prev) => ({ ...prev, fee }));
    return fee;
  };

  // Update fee when token supply or fee structure changes
  useEffect(() => {
    calculateFee();
  }, [tokenForm.initialMintSize, currentFees]);

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

      if (!tokenForm.name || !tokenForm.symbol || !tokenForm.baseURI) {
        setError("Name, symbol and baseURI are required");
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

      if (tokenForm.baseURI.length > 512) {
        setError("Base URI must be 512 characters or less");
        return;
      }

      if (parseInt(tokenForm.initialMintSize) > 500) {
        setError("Initial mint size must be 500 or less");
        return;
      }

      if (parseInt(tokenForm.royaltyFee) > 10000) {
        setError("Royalty fee must be 10000 basis points (100%) or less");
        return;
      }

      const feeAmount = ethers.parseEther(tokenForm.fee);
      const royaltyBasisPoints = parseInt(tokenForm.royaltyFee);

      const tx = await contract.deployToken(tokenForm.name, tokenForm.symbol, tokenForm.baseURI, parseInt(tokenForm.initialMintSize), tokenForm.isMintable, royaltyBasisPoints, { value: feeAmount });

      setSuccess("Deploying token, please wait for confirmation...");

      const receipt = await tx.wait();
      const tokenCreatedEvent = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event) => event?.name === "TokenDeployed");

      if (tokenCreatedEvent) {
        const [tokenAddress, creator, name, symbol, initialMintSize, isMintable] = tokenCreatedEvent.args;

        // Add to deployed tokens list
        setDeployedTokens((prev) => [
          ...prev,
          {
            name: name,
            symbol: symbol,
            address: tokenAddress,
            initialMintSize: initialMintSize.toString(),
            creator: creator,
            isMintable: isMintable,
          },
        ]);

        setSuccess(`Token deployed successfully! Address: ${tokenAddress}`);

        // Reset form fields
        setTokenForm({
          name: "",
          symbol: "",
          baseURI: "",
          initialMintSize: "1",
          isMintable: false,
          royaltyFee: "0",
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

      // Try to access creator function
      try {
        const tokenContract = new ethers.Contract(tokenAddress, MintableERC721ABI, contract.runner);
        const creator = await tokenContract.creator();

        // Not the creator
        if (creator.toLowerCase() !== account.toLowerCase()) {
          return {
            isValid: false,
            message: "You are not the creator of this token",
          };
        }

        // Check if token is mintable by checking for factoryBatchMint function
        try {
          // This will throw if function doesn't exist
          const mintFunctionFragment = tokenContract.interface.getFunction("factoryBatchMint");

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
        return {
          isValid: false,
          message: "Error validating token: " + err.message,
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

  // Mint tokens
  const mintTokens = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!contract) {
        setError("Contract not connected");
        return;
      }

      if (!tokenOpsForm.tokenAddress || !tokenOpsForm.recipient || !tokenOpsForm.quantity) {
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

      const quantity = parseInt(tokenOpsForm.quantity);
      if (isNaN(quantity) || quantity <= 0 || quantity > 500) {
        setError("Quantity must be between 1 and 500");
        return;
      }

      // Calculate fee
      let fee;
      if (quantity < 50) {
        fee = currentFees.small;
      } else if (quantity < 200) {
        fee = currentFees.medium;
      } else {
        fee = currentFees.large;
      }

      const feeAmount = ethers.parseEther(fee);

      setSuccess("Preparing to mint tokens...");

      const tx = await contract.mintToken(tokenOpsForm.tokenAddress, tokenOpsForm.recipient, quantity, { value: feeAmount });

      setSuccess("Minting tokens, please wait for confirmation...");

      const receipt = await tx.wait();

      // Look for TokenMinted event
      const tokenMintedEvent = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event) => event?.name === "TokenMinted");

      if (tokenMintedEvent) {
        setSuccess(`Successfully minted ${tokenOpsForm.quantity} tokens to ${tokenOpsForm.recipient}`);
      } else {
        setSuccess(`Transaction confirmed, but no minting event found. Please verify your NFTs.`);
      }

      // Reset form fields
      setTokenOpsForm({
        ...tokenOpsForm,
        recipient: "",
        quantity: "",
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

      const amount = withdrawalAmount ? ethers.parseEther(withdrawalAmount) : 0;

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

      const parsedAmount = ethers.parseUnits(recoveryForm.amount, 18); // Assuming ERC20 with 18 decimals

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
        <h1>ERC721 NFT Factory</h1>
        <div className="connection-info">
          {!account && (
            <div>
              <h3>Ready to deploy your NFT collection?</h3>
              <p>Connect your wallet and start creating ERC-721 NFTs</p>
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
                <li>Small Batch (&lt;50): {currentFees.small} ETH</li>
                <li>Medium Batch (50-199): {currentFees.medium} ETH</li>
                <li>Large Batch (≥200): {currentFees.large} ETH</li>
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
            <h2>Create New NFT Collection</h2>
            <form onSubmit={deployToken}>
              <div className="form-group">
                <label>Collection Name (max 32 chars):</label>
                <input type="text" name="name" value={tokenForm.name} onChange={handleTokenFormChange} placeholder="e.g., My Awesome NFTs" maxLength={32} required />
              </div>

              <div className="form-group">
                <label>Collection Symbol (max 8 chars):</label>
                <input type="text" name="symbol" value={tokenForm.symbol} onChange={handleTokenFormChange} placeholder="e.g., ANFT" maxLength={8} required />
              </div>

              <div className="form-group">
                <label>Base URI:</label>
                <input type="text" name="baseURI" value={tokenForm.baseURI} onChange={handleTokenFormChange} placeholder="e.g., https://example.com/metadata/" required />
                <p className="input-note">This is the base URL for your token metadata. Example: https://example.com/metadata/</p>
              </div>

              <div className="form-group">
                <label>Initial Mint Size (max 500):</label>
                <input type="number" name="initialMintSize" value={tokenForm.initialMintSize} onChange={handleTokenFormChange} placeholder="e.g., 10" min="1" max="500" required />
                <p className="input-note">Number of NFTs to mint initially.</p>
              </div>

              <div className="form-group">
                <label>Royalty Fee (basis points, max 10000):</label>
                <input type="number" name="royaltyFee" value={tokenForm.royaltyFee} onChange={handleTokenFormChange} placeholder="e.g., 250 (2.5%)" min="0" max="10000" required />
                <p className="input-note">100 basis points = 1%. Maximum is 10000 (100%).</p>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="isMintable" checked={tokenForm.isMintable} onChange={handleTokenFormChange} />
                  Make Collection Mintable
                </label>
                <p className="input-note">Enable to mint additional NFTs after initial deployment.</p>
              </div>

              <button type="submit" className="deploy-btn">
                Deploy Collection
              </button>
            </form>
          </div>

          <div className="section">
            <h2>Mint Additional NFTs</h2>
            <p className="section-info">For factory-created mintable collections only. You must be the collection creator.</p>
            <form onSubmit={mintTokens}>
              <div className="form-group">
                <label>Collection Address:</label>
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
                    Validate Collection
                  </button>
                </div>
              )}

              <div className="form-group">
                <label>Recipient Address:</label>
                <input type="text" name="recipient" value={tokenOpsForm.recipient} onChange={handleTokenOpsFormChange} placeholder="0x..." required />
              </div>

              <div className="form-group">
                <label>Quantity to Mint (max 500):</label>
                <input type="number" name="quantity" value={tokenOpsForm.quantity} onChange={handleTokenOpsFormChange} placeholder="e.g., 10" min="1" max="500" required />
              </div>

              <button type="submit" className="mint-btn">
                Mint NFTs
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
              <h2>Your Deployed Collections</h2>
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
                      <p>Initial Mint Size: {token.initialMintSize}</p>
                      <p>{token.isMintable ? "Mintable" : "Non-Mintable"}</p>
                    </div>
                    <div className="token-actions">
                      <button
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(token.address);
                          setSuccess("Collection address copied to clipboard!");
                          setTimeout(() => setSuccess(""), 3000);
                        }}
                      >
                        Copy Address
                      </button>
                      {token.isMintable && (
                        <button
                          className="mint-more-btn"
                          onClick={() => {
                            setTokenOpsForm({
                              ...tokenOpsForm,
                              tokenAddress: token.address,
                            });
                            document.getElementById("mint-section")?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          Mint More
                        </button>
                      )}
                    </div>
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

export default ERC721FactoryUI;
