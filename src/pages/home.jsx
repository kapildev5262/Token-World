import { Link } from "react-router-dom";
import {Code, Layers, ArrowRight, BarChart } from "lucide-react";
import { useWallet } from "../components/wallet/WalletContext";
import "./home.css";

const TokenWorldHomePage = () => {
  const { account } = useWallet();
  return (
    <div className="token-world-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">No-Code Token Deployment Platform</h1>
          <p className="hero-subtitle">Deploy ERC-20 and ERC-721 tokens on your desired blockchain without writing a single line of code.</p>
          <div className="hero-buttons">
            <button className="primary-button">Get Started</button>
            <button className="secondary-button">View Documentation</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-content">
          <h2 className="section-title">Our Products</h2>

          <div className="feature-cards">
            {/* ERC-20 Token Deployment */}
            <div className="feature-card">
              <div className="feature-icon-container purple">
                <Code className="feature-icon" />
              </div>
              <h3 className="feature-title">ERC-20 Token Deployment</h3>
              <p className="feature-description">Create fungible tokens for your crypto projects without writing or deploying smart contracts.</p>
              <Link to="/erc20/" className="feature-link">
                Get started <ArrowRight className="arrow-icon" />
              </Link>
            </div>

            {/* ERC-721 Token Deployment */}
            <div className="feature-card">
              <div className="feature-icon-container blue">
                <Layers className="feature-icon" />
              </div>
              <h3 className="feature-title">ERC-721 Token Deployment</h3>
              <p className="feature-description">Launch your NFT collection on your preferred blockchain with just a few clicks.</p>
              <Link to="/erc721/" className="feature-link">
                Get started <ArrowRight className="arrow-icon" />
              </Link>
            </div>

            {/* Multi-account Distribution */}
            <div className="feature-card">
              <div className="feature-icon-container green">
                <BarChart className="feature-icon" />
              </div>
              <h3 className="feature-title">Multi-account Distribution</h3>
              <p className="feature-description">Efficiently distribute tokens to multiple accounts in a single transaction.</p>
              <Link to="/distribution/" className="feature-link">
                Get started <ArrowRight className="arrow-icon" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-content">
          <div className="benefits-layout">
            <div className="benefits-info">
              <h2 className="section-title-left">Why Choose Token World?</h2>
              <ul className="benefits-list">
                <li className="benefit-item">
                  <div className="benefit-marker">
                    <div className="benefit-dot"></div>
                  </div>
                  <div>
                    <h4 className="benefit-title">No-Code Solution</h4>
                    <p className="benefit-description">Deploy tokens without writing code or smart contracts.</p>
                  </div>
                </li>
                <li className="benefit-item">
                  <div className="benefit-marker">
                    <div className="benefit-dot"></div>
                  </div>
                  <div>
                    <h4 className="benefit-title">Multi-Blockchain Support</h4>
                    <p className="benefit-description">Deploy on Ethereum, Polygon, Binance Smart Chain, and more.</p>
                  </div>
                </li>
                <li className="benefit-item">
                  <div className="benefit-marker">
                    <div className="benefit-dot"></div>
                  </div>
                  <div>
                    <h4 className="benefit-title">Gas Efficient</h4>
                    <p className="benefit-description">Optimized contract deployments to save on gas fees.</p>
                  </div>
                </li>
                <li className="benefit-item">
                  <div className="benefit-marker">
                    <div className="benefit-dot"></div>
                  </div>
                  <div>
                    <h4 className="benefit-title">Bulk Distribution</h4>
                    <p className="benefit-description">Distribute tokens to thousands of addresses in a single transaction.</p>
                  </div>
                </li>
              </ul>
            </div>
            {!account && (
              <div>
                <h3>Ready to deploy your token?</h3>
                <p>Connect your wallet to get started with Token World&apos;s no-code deployment platform.</p>
                {/* <Wallet onClick={setPopupOpen(true)} /> */}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TokenWorldHomePage;
