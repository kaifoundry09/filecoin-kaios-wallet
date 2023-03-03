import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import { BsArrowLeft } from "react-icons/bs";
import noTransection from "./transection-img.png";
import "./Transaction.scss";
import API from "../../APIs/API";
import BigNumber from "bignumber.js";
import loading from "../Send/loading.gif";

const Transaction = () => {
  const navigate = useNavigate();

  function nav(move) {
    try {
      const currentIndex = document.activeElement.tabIndex;
      const next = currentIndex + move;
      const items = document.querySelectorAll(".items");
      const targetElement = items[next];
      targetElement.focus();
    } catch (e) {
      console.log("Home Error:", e);
    }
  }

  function handleKeydown(e) {
    e.stopImmediatePropagation();
    switch (e.key) {
      case "ArrowUp":
        nav(-1);
        break;
      case "ArrowDown":
        nav(1);
        break;
      case "ArrowRight":
        nav(1);
        break;
      case "ArrowLeft":
        nav(-1);
        break;
    }
  }

  useEffect(() => {
    document.body.addEventListener("keydown", handleKeydown);
    return () => document.body.removeEventListener("keydown", handleKeydown);
  }, []);

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const [status, setStatus] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionData, setTransactionData] = useState([]);
  const address = localStorage.getItem("address").slice(1, -1);

  // Handle Fetch Transaction History
  const fetchTransactionHistory = async () => {
    setTransactionLoading(true);
    if (address.slice(0, 1) == "f") {
      const response = await API.get(`/api/v1/alltransaction/${address}`);
      if (response?.data?.messages?.length) {
        setStatus(true);
        setTransactionData(response.data.messages);
      } else {
        console.log(response.data);
      }
    } else if (address.slice(0, 1) == "t") {
      const response = await API.post(`/api/v1/alltransaction/${address}`);
      if (response?.data?.messages?.length) {
        setStatus(true);
        setTransactionData(response.data.messages);
      } else {
        console.log(response.data);
      }
    }
    setTransactionLoading(false);
  };

  return (
    <div className="transaction-body">
      {/* This code for if not have any transaction then show it */}
      {!status && !transactionLoading && (
        <div className="notransaction-section">
          <div className="heading">
            <button
              className="items"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  navigate(-1);
                }
              }}
              onClick={() => navigate(-1)}
            >
              <BsArrowLeft />
            </button>
          </div>
          <div className="no-transaction">
            <img alt="" src={noTransection} />
            <div>You have no transactions</div>
          </div>
        </div>
      )}

      {/* This Code for Transection */}
      {status && !transactionLoading && (
        <div className="transaction-section">
          <div className="body-heading">
            <button
              className="items"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  navigate(-1);
                }
              }}
              onClick={() => navigate(-1)}
            >
              <BsArrowLeft />
            </button>{" "}
            Transactions
          </div>

          <div className="all-transaction">
            {transactionData.map((element, index) => {
              return (
                <div key={index} className="trans">
                  <button
                    className="items"
                    tabIndex={index + 1}
                    key={index}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        navigate(
                          `/details/:${
                            address.slice(0, 1) == "f"
                              ? element.cid
                              : element.signed_cid
                          }`
                        );
                      }
                    }}
                    onClick={() =>
                      navigate(
                        `/details/:${
                          address.slice(0, 1) == "f"
                            ? element.cid
                            : element.signed_cid
                        }`
                      )
                    }
                  >
                    <div className="wrap">
                      <div style={{ display: "inline-block" }}>
                        <div className="trns-icon">
                          {element.from == address ? (
                            <FiArrowUpRight />
                          ) : (
                            <FiArrowDownLeft />
                          )}
                        </div>
                      </div>
                      <div className="trans-sec">
                        <div className="from-add">
                          <div className="trans-point">FROM ADDRESS : </div>{" "}
                          {element.from.slice(0, 5)}....{element.from.slice(-5)}
                        </div>
                        <div className="to-add">
                          <div className="trans-point">TO ADDRESS : </div>{" "}
                          {element.to.slice(0, 5)}....{element.to.slice(-5)}
                        </div>
                        <div className="value">
                          <div className="trans-point">VALUE : </div>
                          {Number(element.value) / new BigNumber(1e18)}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {transactionLoading && (
        <div>
          <div className="form" style={{ padding: "5rem 1rem" }}>
            <div style={{ width: "55px", height: "55px", margin: "auto" }}>
              <img
                style={{ width: "100%", height: "100%" }}
                src={loading}
                alt=""
              />
            </div>
            <p style={{ textAlign: "center", marginTop: "10px" }}>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaction;
