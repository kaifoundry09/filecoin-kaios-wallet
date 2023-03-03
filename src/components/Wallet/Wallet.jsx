import React from "react";
import "./Wallet.scss";
import "../Send/Send.scss";
import { AiFillSetting } from "react-icons/ai";
import { FiArrowUpRight } from "react-icons/fi";
import { FaRegCopy } from "react-icons/fa";
import { BsCurrencyDollar } from "react-icons/bs";
import { IoMdRefresh } from "react-icons/io";
import { BiArrowFromBottom, BiArrowFromTop } from "react-icons/bi";
import { decryptData, copyToClipboard } from "../commanFunctions";
import { WORKING_API } from "../../Variables";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../APIs/API";
import BigNumber from "bignumber.js";
import axios from "axios";
import loading from "../Send/loading.gif";
// import noTransection from "./transection-img.png";

function Wallet() {
  const navigate = useNavigate();

  const [dollarPrice, setDollarPrice] = useState(0);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [rate, setRate] = useState(0);

  localStorage.setItem("completed", true);
  const address = localStorage.getItem("address");
  const fek = localStorage.getItem("fek");
  useEffect(() => {
    if (!fek || !address) {
      navigate("/");
    }
    fetchBalance();
  }, []);

  // Handle fetch RPC
  const [balance, setBalance] = useState(0);
  const [fontSizeBalance, setFontSizeBalance] = useState("");
  const fetchBalance = async () => {
    setTransactionLoading(true);
    const response = await API.post(
      `/api/v1/walletbalance/${address.slice(1, -1)}`
    );
    setBalance(Number(response.data.balance) / new BigNumber(1e18));
    if (
      String(Number(response.data.balance) / new BigNumber(1e18)).length < 15
    ) {
      setFontSizeBalance("font-1_5");
    } else if (
      String(Number(response.data.balance) / new BigNumber(1e18)).length < 20
    ) {
      setFontSizeBalance("font-1_3");
    } else if (
      String(Number(response.data.balance) / new BigNumber(1e18)).length < 25
    ) {
      setFontSizeBalance("font-1_2");
    } else {
      setFontSizeBalance("font-1_1");
    }
    setTransactionLoading(false);
  };

  useEffect(() => {
    getDollarPrice();
  }, [balance]);

  // Handle Dollar Price
  const getDollarPrice = async () => {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price/?ids=filecoin&vs_currencies=usd`
    );
    if (response?.data?.filecoin?.usd) {
      setDollarPrice(response?.data?.filecoin?.usd * balance);
      setRate(response?.data?.filecoin?.usd);
    }
  };

  // function createKaiAd() {
  //     console.log('creating add')
  //     getKaiAd({
  //       publisher: '8aea7e5d-a9cf-42bb-8f0c-e7f349921411',
  //       app: 'Memer',
  //       slot: 'Random',
  //       onerror: err => console.log('Ad error: ', err),
  //       onready: ad => {
  //         console.log('in ready')
  //         let button = document.getElementById('t')
  //         button.addEventListener('build', function btnListener() {
  //           // button.removeEventListener('build', btnListener)

  //           // calling 'display' will display the ad
  //           console.log('in the listner')
  //           ad.call('display')
  //           // createKaiAd()

  //         })
  //         // user clicked the ad
  //         ad.on('click', () => {
  //           console.log('click event')
  //           var message = document.getElementById("qr");
  //           message.focus()
  //           // createKaiAd()
  //         })

  //         // user closed the ad (currently only with fullscreen)
  //         ad.on('close', () => {
  //           console.log('close event')
  //           var message = document.getElementById("qr");
  //           message.focus()
  //           // createKaiAd()
  //         })

  //         // the ad succesfully displayed
  //         ad.on('display', () => console.log('display event'))
  //       }
  //     });
  //   }

  //   createKaiAd()

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

  useEffect(() => {
    document.body.addEventListener("keydown", handleKeydown);
    return () => document.body.removeEventListener("keydown", handleKeydown);
  }, []);

  function handleKeydown(e) {
    e.stopImmediatePropagation();
    console.log("E", e.key);
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

  // Handle Refrece
  const handleReloadData = async () => {
    fetchBalance();
  };

  return (
    <div className="wallet-container">
      <div className="header-top">
        <button
          className="items"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key == "Enter") {
              navigate("/setting");
            }
          }}
          onClick={() => navigate("/setting")}
        >
          <AiFillSetting />
        </button>
      </div>
      <div className="wallet-header">
        <div className="content">
          <div className={`wallet-balance ${fontSizeBalance}`}>⨎{balance}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: ".9rem",
              marginTop: "6px",
              color: "#fff",
              marginBottom: "6px",
              opacity: "0.8",
            }}
          >
            <BsCurrencyDollar />
            {dollarPrice.toFixed(2)}
          </div>

          <p style={{ marginTop: "8px" }}>{address.slice(1, 42)}</p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
              color: "#fff",
              marginTop: "6px",
            }}
          >
            <button
              className="items"
              style={{ margin: "0 4px" }}
              tabIndex={1}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  copyToClipboard(address.slice(1, -1));
                }
              }}
              onClick={() => {
                copyToClipboard(address.slice(1, -1));
              }}
            >
              <FaRegCopy />
            </button>
            <button
              className="items"
              style={{ margin: "0 4px" }}
              tabIndex={2}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleReloadData();
                }
              }}
              onClick={() => {
                handleReloadData();
              }}
            >
              <IoMdRefresh />
            </button>
          </div>
        </div>
        <div className="wallet-function">
          <div className="functions">
            <button
              className="items"
              tabIndex={3}
              onKeyPress={(e) => {
                console.log("e", e);
                if (e.key === "Enter") {
                  navigate("/send");
                }
              }}
              onClick={() => navigate("/send")}
            >
              <BiArrowFromBottom className="dicon" />
            </button>
            <p>Send</p>
          </div>
          <div className="functions">
            <button
              className="items"
              tabIndex={4}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  navigate("/recieve");
                }
              }}
              onClick={() => navigate("/recieve")}
            >
              <BiArrowFromTop className="dicon" />
            </button>
            <p>Receive</p>
          </div>
        </div>
      </div>

      {/* Loading Screen */}
      {transactionLoading && (
        <div
          className="export-pop"
          style={{ width: "100vw", position: "relative", zIndex: "20" }}
        >
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

      {/* <div className='wallet-body'> */}
      {/* This code for if not have any transaction then show it */}
      {/* <div className='no-transaction'>
                    <img alt='' src={noTransection} />
                    <div>You have no transactions</div>
                </div> */}

      {/* This Code for Transection */}
      {/* <div className='body-heading'>Transaction</div>
                <div className='all-transaction'>
                    <div onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            navigate('/details')
                        }
                    }} onClick={() => navigate('/details')} className='trans items' tabIndex={4}>
                        <div className='trns-icon'>
                            <FiArrowUpRight />
                        </div>
                        <div>
                            <div className='from-add'><div className='trans-point'>FROM ADDRESS : </div> 0x0000...</div>
                            <div className='to-add'><div className='trans-point'>TO ADDRESS : </div> 0x0000...</div>
                            <div className='value'><div className='trans-point'>VALUE : </div>0</div>
                        </div>
                    </div>
                </div> */}
      {/* </div> */}
    </div>
  );
}

export default Wallet;
