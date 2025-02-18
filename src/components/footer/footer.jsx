import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";
import { Layers} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <Layers className="footer-logo-icon" />
              <span className="footer-logo-text">Token World</span>
            </div>
            <p className="footer-description">
              No-Code Token Deployment Platform enabling users to deploy ERC-20
              and ERC-721 tokens without writing smart contracts.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h3>Platform</h3>
              <Link to="/products">Products</Link>
              <Link to="/economics">Economics</Link>
              <Link to="/utilities">Utilities</Link>
            </div>

            <div className="footer-section">
              <h3>Resources</h3>
              <Link to="/developers">Developers</Link>
              <Link to="/use-cases">Use Cases</Link>
              <Link to="/community">Community</Link>
            </div>

            <div className="footer-section">
              <h3>Support</h3>
              <Link to="/documentation">Documentation</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Token World Foundation</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
