import React, { useEffect, useState, useRef } from "react";
import { MdQrCode2 } from "react-icons/md";
import "./Send.scss";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { MdContentPaste } from "react-icons/md";
import { WORKING_API } from "../../Variables";
import { decryptData } from "../commanFunctions";
import axios from "axios";
import QrScanner from "qr-scanner";
import API from "../../APIs/API";
import BigNumber from "bignumber.js";
import Webcam from "react-webcam";
import { FilecoinTransaction } from "../../transactionLogic/index.js";
import { useDispatch, useSelector } from "react-redux";
import { savePrivateKey } from "../../Redux/actions/index";
import loading from "./loading.gif";
import paymentDone from "./green-tick.png";

const Send = () => {
  const dispatch = useDispatch();
  const filecoinTransaction = new FilecoinTransaction(WORKING_API);
  const navigate = useNavigate();

  const videoRef = useRef();
  const photoRef = useRef();

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

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [scannerOn, setScannerOn] = useState(false);
  const [amaoutValid, setAmountValid] = useState(true);

  // This UseEffect Check Balance is Exist or not when user fill amount
  useEffect(() => {
    if (amount > balance) {
      setAmountValid(false);
    } else {
      setAmountValid(true);
    }
  }, [amount]);

  // Handle fetch RPC
  const [balance, setBalance] = useState(0);
  const fetchBalance = async () => {
    let add =
      activeIndex < address.length
        ? address[activeIndex]
        : importAddress[activeIndex - address.length];
    const response = await API.post(`/api/v1/walletbalance/${add}`);
    setBalance(Number(response.data.balance) / new BigNumber(1e18));
  };

  const address = JSON.parse(localStorage.getItem("address"));
  const importAddress = JSON.parse(localStorage.getItem("import"));
  const fek = JSON.parse(localStorage.getItem("fek"));
  const activeIndex = localStorage.getItem("feai");
  useEffect(() => {
    if (!fek.length || !address.length) {
      navigate("/");
    }
    fetchBalance();
  }, []);

  const inputRef = useRef(null);
  function handlePaste(event) {
    // Get the pasted text from the clipboard
    const pastedText = event.clipboardData.getData("text/plain");

    // Do something with the pasted text (e.g. display it in the input field)
    inputRef.current.value = pastedText;
    setToAddress(pastedText);
  }

  // New Scanner Function for qr img
  const readQrCode = (file) => {
    if (!file) {
      return;
    }
    QrScanner.scanImage(file, { returnDetailedScanResult: true })
      .then((result) => {
        if (result?.data) {
          setToAddress(result.data);
          setScanResult(result.data);
          setScannerOn(false);
        }
      })
      .catch((e) => setScanResult(""));
  };

  // Create a blob img
  async function blobImg(url) {
    const pngUrl = url;
    const blob = await (await fetch(pngUrl)).blob();
    // Create file form the blob
    const image = new File([blob], "qr-code.png", { type: blob.type });
    // Share Code
    try {
      readQrCode(image);
    } catch (error) {
      console.log(error);
    }
  }

  function success(stream) {
    let v = videoRef.current;
    v.srcObject = stream;
    v.play();
  }

  function showError(error) {
    console.log(error);
  }
  function setwebcam() {
    var options = true;
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
          devices.forEach(function (device) {
            if (device.kind === "videoinput") {
              if (device.label.toLowerCase().search("back") > -1)
                options = {
                  deviceId: { exact: device.deviceId },
                  facingMode: "environment",
                };
            }
          });
          setwebcam2(options);
        });
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("no navigator.mediaDevices.enumerateDevices");
      setwebcam2(options);
    }
  }

  function setwebcam2(options) {
    var n = navigator;
    if (n.mediaDevices.getUserMedia) {
      n.mediaDevices
        .getUserMedia({ video: options, audio: false })
        .then(function (stream) {
          success(stream);
        })
        .catch(function (error) {
          showError(error);
        });
    } else if (n.getUserMedia) {
      n.getUserMedia({ video: options, audio: false }, success, showError);
    } else if (n.webkitGetUserMedia) {
      n.webkitGetUserMedia(
        { video: options, audio: false },
        success,
        showError
      );
    }
  }

  // Handle video
  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1920, height: 1080 } })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Take Photo
  const takePhoto = () => {
    const width = 414;
    const height = width / (16 / 9);

    let video = videoRef.current;
    let photo = photoRef.current;

    photo.width = width;
    photo.height = height;

    let ctx = photo.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    const canvas = document.getElementById("canvas");
    let image = canvas.toDataURL();
    blobImg(image);
  };

  const [confirmation, setConfirmation] = useState(false);
  const [transactionDone, setTransactionDone] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const privateKey = useSelector((state) => state.savePrivateKeyReducer);

  // Send Filecoin Function
  const sendFileCoin = async (privateKey) => {
    let importAddress = JSON.parse(localStorage.getItem("import"));
    let address = JSON.parse(localStorage.getItem("address"));
    const activeIndex = localStorage.getItem("feai");
    let fromAddress =
      address.length > activeIndex
        ? address[activeIndex]
        : importAddress[activeIndex - address.length];

    setTransactionLoading(true);
    setTransactionDone(false);
    const message = await filecoinTransaction.createMessage({
      To: toAddress,
      // From: "t1xhlbhvci2jnrcirlb2iw43y4jfojdtoazyvp7ai",
      From: fromAddress,
      Value: String(amount * new BigNumber(1e18)),
    });
    const signedtransaction = await filecoinTransaction.signMessage(
      message,
      privateKey
    );

    const transaction = await filecoinTransaction.pushMessage(
      signedtransaction
    );

    setTimeout(async () => {
      try {
        const waitMessage = await filecoinTransaction.waitMessage(
          transaction.data.result["/"],
          message.Nonce
        );
        handleSaveTransaction(
          toAddress,
          fromAddress,
          transaction.data.result["/"],
          String(amount * new BigNumber(1e18))
        );
        setTransactionLoading(false);
        setTransactionDone(true);
      } catch (error) {
        setTimeout(() => {
          againWaitMsgCheck(
            transaction.data.result["/"],
            message.Nonce,
            toAddress,
            fromAddress,
            amount
          );
        }, 3000);
      }
    }, 15000);
  };

  const againWaitMsgCheck = async (
    cid,
    nonce,
    toAddress,
    fromAddress,
    amount
  ) => {
    try {
      const waitMessage = await filecoinTransaction.waitMessage(cid, nonce);
      if (waitMessage?.result) {
      }
      setTransactionLoading(false);
      setTransactionDone(true);
      handleSaveTransaction(
        toAddress,
        fromAddress,
        cid,
        String(amount * new BigNumber(1e18))
      );
    } catch (error) {
      againWaitMsgCheck(cid, nonce, toAddress, fromAddress, amount);
    }
  };

  // Handle export private key
  const [inputPassword, setInputPassword] = useState("");
  const handleExportKey = () => {
    const data = JSON.parse(localStorage.getItem("fek"));
    const activeIndex = localStorage.getItem("feai");
    let importData = JSON.parse(localStorage.getItem("feik"));
    let address = JSON.parse(localStorage.getItem("address"));
    let encryptedData =
      address.length > activeIndex
        ? data[activeIndex]
        : importData[activeIndex - address.length];
    try {
      const PlainData = decryptData(inputPassword, `"${encryptedData}"`);
      dispatch(savePrivateKey(PlainData._privateKey));
      if (PlainData?._privateKey) {
        sendFileCoin(PlainData?._privateKey);
      }
    } catch (error) {
      alert("Your password is Invalid");
    }
  };

  // Handle API for save wallet transaction to our backend
  const handleSaveTransaction = async (to, fromAddress, cid, value) => {
    const response = await API.post(`/api/v1/transaction_data/${fromAddress}`, {
      cid,
      value,
      to,
    });
    if (response.data.msg == "success") {
    }
  };

  const handleValidation = () => {
    if (amaoutValid && toAddress.length && amount) {
      setConfirmation(true);
    }
  };

  const [dollarPrice, setDollarPrice] = useState(0);
  const [rate, setRate] = useState(0);
  // Handle Dollar Price
  const getDollarPrice = async () => {
    const response = await API.get(`/api/v1/d_price`);
    if (response?.data?.data?.price) {
      setRate(response?.data?.data?.price);
    }
  };

  // Only Call when page render
  useEffect(() => {
    getDollarPrice();
  }, []);

  // Call When amount change
  useEffect(() => {
    setDollarPrice(rate * amount);
  }, [amount]);

  return (
    <div>
      {!transactionDone &&
        !confirmation &&
        !transactionLoading &&
        !scannerOn && (
          <div id="send">
            <div className="container">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "11px",
                }}
              >
                <button
                  className="items"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      navigate("/wallet");
                    }
                  }}
                  onClick={() => navigate("/wallet")}
                >
                  <BsArrowLeft className="larr" />
                </button>
                <h4>Send Money</h4>
                <MdQrCode2 className="larr" />
              </div>
              <div className="second">
                <h2>To</h2>
                <div className="data">
                  <input
                    id="to-address"
                    ref={inputRef}
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="items"
                    tabIndex={1}
                    type="text"
                    placeholder="0xf033259..."
                  />
                </div>
              </div>
              <div className="third">
                <h2>Amount (FIL)</h2>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={amaoutValid ? "items" : "items error"}
                  tabIndex={2}
                  type="tel"
                  placeholder="0.0321"
                />
                <div
                  style={{
                    marginTop: ".5rem",
                    opacity: ".8",
                    fontSize: ".8rem",
                  }}
                >
                  {amount ? amount : "0"} FIL value is : ${dollarPrice}
                </div>
                {!amaoutValid && (
                  <div className="amount-error">
                    Cannot be more than {balance} FIL
                  </div>
                )}
              </div>

              <div className="forth">
                <h2>Total available amount</h2>
                <p>{balance} FIL</p>
                <button
                  onClick={() => handleValidation()}
                  type="button"
                  className="items"
                  tabIndex={3}
                >
                  Send
                </button>
              </div>
              <div className="forth">
                <button
                  type="button"
                  className="items"
                  tabIndex={4}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      setScannerOn(true);
                      setwebcam();
                    }
                  }}
                  onClick={() => setScannerOn(true) + setwebcam()}
                >
                  QR Scanner
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Scanner Open Code Below */}
      {!transactionDone && !transactionDone && scannerOn && (
        <div className="scanner-div">
          <div className="container">
            <div
              className="heading-scanner items"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  navigate("/wallet");
                }
              }}
              onClick={() => navigate("/wallet")}
            >
              <BsArrowLeft className="larr" />
            </div>
            <h3> Scan Qr Code</h3>

            <div className="camera">
              <video ref={videoRef}></video>
            </div>
            <div className="btn">
              <button
                className="items"
                tabIndex={1}
                onClick={() => takePhoto()}
              >
                Capture Qr Code
              </button>
            </div>
            <canvas
              style={{ display: "none" }}
              id="canvas"
              ref={photoRef}
            ></canvas>
            {/* <Webcam
                        audio={false}
                        screenshotFormat="image/jpeg"
                        style={{width:"80vw",height:"55vh"}}
                    >
                        {({ getScreenshot }) => (
                            <div className="btn">
                                <button
                                className="items"
                                tabIndex={1}
                                onClick={() => {
                                    const imageSrc = getScreenshot()
                                    blobImg(imageSrc)
                                }}
                            >
                                Capture Qr Code
                            </button>
                            </div>
                        )}
                    </Webcam> */}
            {/* <input className="items" tabIndex={1} type="file" onChange={(e) => readQrCode(e.target.files[0])} /> */}
          </div>
        </div>
      )}

      {/* Export private key through the input password */}
      {/* {!transactionDone && !transactionDone&& !privateKey.length && <div className='export-pop'>

                <div className='form'>
                    <div className='heading'>
                        <button style={{border:"unset"}} className='items' tabIndex={0} onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                navigate(-1);
                            }
                        }} onClick={() => navigate(-1)}>
                            <BsArrowLeft className='larr' />
                        </button>
                        <span className='export-heading'>Send Money</span></div>
                    <p className='normal-text'>*Enter your password for sending filecoin</p>
                    <form>
                        <div>
                            <input className='items' tabIndex={1} value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} type="password" htmlFor="password" placeholder='Enter your password..' />

                        </div>
                        <div className='btn'>
                            <button className='items' tabIndex={2} type='button' onClick={() => handleExportKey()}>Next</button>
                        </div>
                    </form>
                </div>
            </div>} */}

      {/* Confirmation Popup */}
      {confirmation &&
        !transactionDone &&
        !transactionLoading &&
        toAddress &&
        amount && (
          <div className="export-pop">
            <div className="form" style={{ padding: "3rem 1rem" }}>
              <div className="heading">
                <span className="export-heading">Payment Confirmation</span>
              </div>
              <p className="normal-text">
                Are you sure you want to send {amount} filecoin <br /> to{" "}
                {toAddress} address.
              </p>

              <p className="normal-text">
                *Enter your password for sending filecoin
              </p>
              <form>
                <div>
                  <input
                    className="items"
                    tabIndex={0}
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    type="password"
                    htmlFor="password"
                    placeholder="Enter your password.."
                  />
                </div>
              </form>
              <div className="btn">
                <button
                  className="items"
                  tabIndex={1}
                  onClick={() => navigate("/wallet")}
                >
                  Cancel
                </button>
                <button
                  className="items"
                  tabIndex={2}
                  onClick={() => handleExportKey()}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Loading Screen */}
      {!transactionDone && transactionLoading && (
        <div className="export-pop">
          <div className="form" style={{ padding: "5rem 1rem" }}>
            <div style={{ width: "55px", height: "55px", margin: "auto" }}>
              <img
                style={{ width: "100%", height: "100%" }}
                src={loading}
                alt=""
              />
            </div>
            <p style={{ textAlign: "center", marginTop: "10px" }}>
              Processing...
            </p>
          </div>
        </div>
      )}

      {/* After send filecoin Show it */}
      {transactionDone && !transactionLoading && (
        <div className="export-pop">
          <div className="form" style={{ padding: "2rem 1rem" }}>
            <div style={{ width: "67px", height: "61px", margin: "auto" }}>
              <img
                style={{ width: "100%", height: "100%" }}
                src={paymentDone}
                alt=""
              />
            </div>
            <div className="heading">
              <span className="export-heading">Success Transaction</span>
            </div>
            <p className="normal-text">
              Your filecoin transaction successfully completed.
            </p>
            <div className="btn">
              <button
                className="items"
                tabIndex={1}
                onClick={() => navigate("/transactions")}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {sendSuccess && <div className='inner-container'>

                <div className='form'>
                    <div className='heading'><BsArrowLeft className='larr items' tabIndex={0} onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            navigate("/wallet");
                        }
                    }} onClick={() => navigate("/wallet")} /> <span className='export-heading'>Success Transaction</span></div>
                    <p className='normal-text'>Your filecoin transaction successfully completed.</p>
                </div>
            </div>} */}
    </div>
  );
};

export default Send;
