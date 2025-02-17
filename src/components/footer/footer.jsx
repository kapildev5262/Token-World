import React from "react";
import "./footer.css";
import { Link } from "react-router-dom";

import Logo from "../../assets/logo"
import skype from "../../assets/Icons/skype.svg";
import phone from "../../assets/Icons/phone.svg";
import mail from "../../assets/Icons/mil.svg";
import facebook from "../../assets/Icons/facebook-icon.png";
import twitter from "../../assets/Icons/twitter.png";
import instagram from "../../assets/Icons/instagram.png";
import linkedin from "../../assets/Icons/linkedin-icon.png";
import pinterest from "../../assets/Icons/pinterest.png";
import medium from "../../assets/Icons/medium.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="row">
          <div className="col-xxl-3 col-xl-3 col-lg-4 col-md-12 col-sm-12 col-12">
            <div className="fAddress">
              <Link to={"/"} className="mb-4">
                <Logo></Logo>
              </Link>
              <h4>Quick Contact</h4>
              <ul>
                <li>
                  <span>
                    <img src={skype} />
                  </span>
                  <a href="#/">KDcomapany.Skype</a>
                </li>
                <li>
                  <span>
                    <img src={phone} />
                  </span>{" "}
                  <a href="tel:+919509504256">+91-9509504256</a>
                </li>
                <li>
                  <span>
                    <img src={mail} />
                  </span>
                  <a href="#">kapildev5262@gmail.com</a>
                </li>
              </ul>
            </div>
            <div className="socialMedia">
              <a href="#" aria-label="Facebook">
                <img src={facebook} alt="Facebook" />
              </a>
              <a href="#" aria-label="Twitter">
                <img src={twitter} alt="Twitter" />
              </a>
              <a href="#" aria-label="Instagram">
                <img src={instagram} alt="Instagram" />
              </a>
              <a href="#" aria-label="LinkedIn">
                <img src={linkedin} alt="LinkedIn" />
              </a>
              <a href="#" aria-label="Pinterest">
                <img src={pinterest} alt="Pinterest" />
              </a>
              <a href="#" aria-label="Medium">
                <img src={medium} alt="Medium" />
              </a>
            </div>
          </div>

          <div className="col-xxl-2 col-xl-2 col-lg-2 col-md-3 col-sm-6 col-6">
            <div className="fLinks">
              <h4>COMPANY</h4>
              <ul>
                <li>
                  <Link to={"/about-us/"}>About us</Link>
                </li>
                <li>
                  <Link to={"/contact/"}>Contact Us</Link>
                </li>
                <li>
                  <Link to={"/careers/"}>Careers</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="copyRight">
        <div className="container">
          <p className="m-0 text-center">© 2024 | KD&Company</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
