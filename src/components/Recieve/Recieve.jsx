import React, { useState, useEffect } from "react";
import { MdContentCopy, MdShare, MdOutlineQrCode2 } from "react-icons/md";
import {
  BsArrowLeft,
  BsWhatsapp,
  BsFacebook,
  BsLinkedin,
} from "react-icons/bs";
import "./Recieve.scss";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode.react";

const Recieve = () => {
  const navigate = useNavigate();
  const address = JSON.parse(localStorage.getItem("address"));
  const activeIndex = localStorage.getItem("feai");
  const shareUrl = window.location.origin + `/qrcode/:${address[activeIndex]}`;

  async function shareFiles() {
    const pngUrl = document.getElementById("qr-code-id").toDataURL();
    const blob = await (await fetch(pngUrl)).blob();
    // Create file form the blob
    const image = new File([blob], "qr-code.png", { type: blob.type });
    // Share Code
    try {
      let url = `https://wa.me/?text=Filecoin_Address:-${address[activeIndex]} and Link ${shareUrl}`;
      window.location = url;
    } catch (error) {
      console.log(error);
    }
  }

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
    <div id="Recieve">
      <div className="container">
        {/* <button className='back-heading items' tabIndex={0} onKeyPress={(e) => {
                    if (e.key === "Enter") {
                        navigate("/wallet");
                    }
                }} onClick={() => navigate("wallet")}><BsArrowLeft className='larr'/></button><h3> Receive Filecoin </h3> */}
        <button
          className="back-heading items"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              navigate("/wallet");
            }
          }}
          onClick={() => navigate("/wallet")}
        >
          <BsArrowLeft className="larr" />
          <h3>Receive Filecoin</h3>
        </button>
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
            value={address[activeIndex]}
            viewBox={`0 0 256 256`}
            id="qr-code-id"
            includeMargin={true}
          />
        </div>
        <div className="key">
          <p>{address.length && address[activeIndex]}</p>
          <div className="flex">
            <button
              className="icons items"
              tabIndex={1}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  navigator.clipboard
                    .writeText(address[activeIndex])
                    .then(function (x) {
                      alert("Copied to clipboard");
                    });
                }
              }}
              onClick={() => {
                navigator.clipboard
                  .writeText(address[activeIndex])
                  .then(function (x) {
                    alert("Copied to clipboard");
                  });
              }}
            >
              <MdContentCopy className="icon" />
            </button>
            <button
              className=" icons items"
              tabIndex={2}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  shareFiles();
                }
              }}
              onClick={() => shareFiles()}
            >
              <MdShare id="share" className="icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recieve;
