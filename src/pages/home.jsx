import React from "react";
import phone from "../assets/Icons/phonesvg.svg";
import email from "../assets/Icons/emailsvg.svg";

import "./home.css";

const Main = () => {
  

  return (
    <>
      
      {/* Case Studies Section */}
      <section className="casestudy1">
        <div className="container">
          <div className="headLink">
            <h2 className="text-center w-100 mb-4">All Services</h2>
          </div>
          <div className="row g-4">
            <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
              <div className="caseItem">
                <div className="icon">
                  <img src="https://cdn-icons-png.flaticon.com/128/4547/4547543.png" />
                </div>
                <h4>Coinbaazar</h4>
                <p>
                  A Web 3.0 unified P2P Marketplace for buying/selling Bitcoins with 500+ payments, 385+ altcoins,
                  products and services.
                </p>
                <div className="hoverText">
                  <div>
                    <h4>Coinbaazar</h4>
                    <a href="#/">
                      <i className="fa-solid fa-arrow-right-long"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
              <div className="caseItem">
                <div className="icon">
                  <img src="https://cdn-icons-png.flaticon.com/128/4547/4547543.png" />
                </div>
                <h4>Fitelo</h4>
                <p>
                  Achieve long-term wellness through simple, powerful, and holistic changes in your nutrition and eating
                  habits
                </p>
                <div className="hoverText">
                  <div>
                    <h4>Fitelo</h4>
                    <a href="#/">
                      <i className="fa-solid fa-arrow-right-long"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
              <div className="caseItem">
                <div className="icon">
                  <img src="https://cdn-icons-png.flaticon.com/128/4547/4547543.png" />
                </div>
                <h4>MultiPad</h4>
                <p>
                  MultiPad is the only multi-chain launchpad that's committed to community, offering reasonable and
                  guaranteed IDO allocations.
                </p>
                <div className="hoverText">
                  <div>
                    <h4>MultiPad</h4>
                    <a href="#/">
                      <i className="fa-solid fa-arrow-right-long"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 mt-5 text-center">
            <button className="btn-primary">Read All Stories</button>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="inquiry">
        <div className="container">
          <h2>Have any inquiry?</h2>

          <div className="custom-colMain">
            <div className="custom-col">
              <div className="meLink">
                <a href="tel:+919509504256">
                  <img src={phone} className="img-fluid" />
                  +91-9509504256
                </a>
              </div>
            </div>

            <div className="custom-col">
              <div className="meLink">
                <a href="mailto:kapildev5262@gmail.com">
                  <img src={email} className="img-fluid" />
                  kapildev5262@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Main;
