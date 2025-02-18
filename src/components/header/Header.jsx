import  { useState } from "react";
import { Link } from "react-router-dom";
import WalletConnector from "../wallet/walletConnector";
import { Layers } from "lucide-react";
import "./Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <Link to={"/"} className="mb-4">
        <div className="logo-container">
          <Layers className="logo-icon" />
          <span className="logo-text">Token World</span>
        </div>
      </Link>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li>
          <a href="#hero" className="reffer">
            Products
          </a>
        </li>
        <li>
          <a href="#skills" className="reffer">
            Economics
          </a>
        </li>
        <li>
          <a href="#experience" className="reffer">
            Utilities
          </a>
        </li>
        <li>
          <a href="#projects" className="reffer">
            Support
          </a>
        </li>
      </ul>
      <WalletConnector/>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
    </header>
  );
};

export default Header;
