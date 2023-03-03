import React, { useEffect, useState } from "react";
import "./Details.scss";
import { FaRegCopy } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import API from "../../APIs/API";
import BigNumber from "bignumber.js";

function Details() {
  const navigate = useNavigate();
  const param = useParams();
  const messageid = param.messageid.slice(1);
  const address = localStorage.getItem("address").slice(1, -1);

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

  const [transactionData, setTransactionData] = useState([]);
  // Handle Api Call for Getting All Data from Message id
  const getDataFromMsg = async () => {
    if (address.slice(0, 1) == "f") {
      const response = await API.get(
        `/api/v1/transaction_details/${address}?cid=${messageid}`
      );
      if (response?.data?.messages?.result) {
        setTransactionData(response.data.messages.result);
      }
    } else if (address.slice(0, 1) == "t") {
      const response = await API.post(
        `/api/v1/transaction_details/${address}?cid=${messageid}`
      );
      if (response?.data?.messages?.result) {
        setTransactionData(response.data.messages.result);
      }
    }
  };

  useEffect(() => {
    getDataFromMsg();
  }, []);

  return (
    <div>
      <div id="details">
        <div className="container">
          <div className="first">
            <button
              style={{ fontSize: "1.3rem" }}
              className="items"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  navigate(-1);
                }
              }}
              onClick={() => navigate(-1)}
            >
              <BsArrowLeft className="larr" />
            </button>
            <h3>Transaction Details</h3>
          </div>
          <div className="second">
            <h2>To</h2>
            <div className="data">
              <span>{transactionData?.to?.slice(0, 42)}</span>
              <FaRegCopy
                className="items"
                tabIndex={1}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    navigator.clipboard.writeText("").then(function (x) {
                      alert("Copied to clipboard");
                    });
                  }
                }}
                onClick={() => {
                  navigator.clipboard.writeText("").then(function (x) {
                    alert("Copied to clipboard");
                  });
                }}
              />
            </div>
          </div>
          <div className="second">
            <h2>From</h2>
            <div className="data">
              <span>{transactionData?.from?.slice(0, 42)}</span>
              <FaRegCopy
                className="items"
                tabIndex={2}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    navigator.clipboard.writeText("").then(function (x) {
                      alert("Copied to clipboard");
                    });
                  }
                }}
                onClick={() => {
                  navigator.clipboard.writeText("").then(function (x) {
                    alert("Copied to clipboard");
                  });
                }}
              />
            </div>
          </div>

          <div className="second">
            <h2>Amount (FIL)</h2>
            <div className="data">
              <span>
                {Number(transactionData?.value) / new BigNumber(1e18)} FIL
              </span>
            </div>
          </div>
          <div className="second">
            <h2>Time</h2>
            {transactionData?.timestamp && (
              <div className="data">
                <span>{transactionData?.timestamp}</span>
              </div>
            )}
            {transactionData?.block_time && (
              <div className="data">
                <span>{transactionData?.block_time}</span>
              </div>
            )}
          </div>
          <div className="second">
            <h2>Block ID</h2>
            <div className="data">
              <span>
                {address.slice(0, 1) == "f"
                  ? transactionData?.cid?.slice(0, 62)
                  : transactionData?.signed_cid?.slice(0, 62)}
              </span>
              <FaRegCopy
                className="items"
                tabIndex={3}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    navigator.clipboard.writeText("").then(function (x) {
                      alert("Copied to clipboard");
                    });
                  }
                }}
                onClick={() => {
                  navigator.clipboard.writeText("").then(function (x) {
                    alert("Copied to clipboard");
                  });
                }}
              />
            </div>
          </div>
          {/* <div className="second">
                        <h2>Miner</h2>
                        <div className='data'><span>
                            f01228008...</span><FaRegCopy className='items' tabIndex={4} onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    navigator.clipboard.writeText("").then(function (x) {
                                        alert("Copied to clipboard");
                                    });
                                }
                            }} onClick={() => {
                                navigator.clipboard.writeText("").then(function (x) {
                                    alert("Copied to clipboard");
                                });
                            }} /></div>
                    </div> */}
          <div className="second">
            <h2>Block No.</h2>
            <div className="data">
              <span>{transactionData?.height}</span>
              <FaRegCopy
                className="items"
                tabIndex={4}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    navigator.clipboard.writeText("").then(function (x) {
                      alert("Copied to clipboard");
                    });
                  }
                }}
                onClick={() => {
                  navigator.clipboard.writeText("").then(function (x) {
                    alert("Copied to clipboard");
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
