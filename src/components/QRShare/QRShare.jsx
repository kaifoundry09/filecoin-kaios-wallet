import React, { useState, useEffect } from "react";
import { MdContentCopy, MdShare, MdOutlineQrCode2 } from "react-icons/md";
import {
  BsArrowLeft,
  BsWhatsapp,
  BsFacebook,
  BsLinkedin,
} from "react-icons/bs";
import "./QRShare.scss";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode.react";

const QRShare = () => {
  const param = useParams();

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

  return (
    <div id="QRShare">
      <div className="container">
        <h3>
          QR Code <MdOutlineQrCode2 className="icon" />
        </h3>
        <div className="qr">
          {/* <MdOutlineQrCode2 className='icon' />  */}
          <QRCode
            className="icon"
            size={256}
            style={{
              height: "auto",
              maxWidth: "100%",
              width: "100%",
              borderRadius: "0.5rem",
            }}
            value={param?.address.slice(1)}
            viewBox={`0 0 256 256`}
            id="qr-code-id"
            includeMargin={true}
          />
        </div>
        <div className="key">
          <p>{param?.address && param?.address.slice(1, -1)}</p>
          {/* <div className='flex'>
                        <button className="icons items" tabIndex={1} onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                navigator.clipboard.writeText(address.slice(1, -1)).then(function (x) {
                                    alert("Copied to clipboard");
                                });
                            }
                        }} onClick={() => {
                            navigator.clipboard.writeText(address.slice(1, -1)).then(function (x) {
                                alert("Copied to clipboard");
                            });
                        }} >
                            <MdContentCopy className="icon" />
                        </button>
                        <button className=" icons items" tabIndex={2} onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                shareFiles();
                            }
                        }} onClick={() => shareFiles()} >
                            <MdShare id='share' className="icon" />
                        </button>
                    </div> */}
        </div>
      </div>
    </div>
  );
};

export default QRShare;
