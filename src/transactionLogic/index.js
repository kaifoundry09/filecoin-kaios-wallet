const axios = require("axios");
const { signMessage } = require("./src/transaction");
const BigNumber = require("bignumber.js");

class FilecoinTransaction {
  constructor(rpc) {
    this.rpc = rpc;
  }

  async getNonce(address) {
    const ret = await axios.post(this.rpc, {
      jsonrpc: "2.0",
      id: 0,
      method: "Filecoin.MpoolGetNonce",
      params: [address],
    });
    if (ret?.data?.result) {
      return ret.data.result;
    }
    return 0;
  }

  async estimateMessageGas(message) {
    const ret = await axios.post(this.rpc, {
      jsonrpc: "2.0",
      id: 0,
      method: "Filecoin.GasEstimateMessageGas",
      params: [message, { MaxFee: "30000000000000" }, []],
    });
    return ret.data.result;
  }

  async createMessage(message) {
    //message is an object { To, From, Value }
    console.log("message", message);
    let msg = {
      To: message.To,
      From: message.From,
      Value: message.Value ? message.Value : new BigNumber(0),
      GasLimit: message.GasLimit ? message.GasLimit : 0,
      GasFeeCap: message.GasFeeCap ? message.GasFeeCap : new BigNumber(0),
      GasPremium: message.GasPremium ? message.GasPremium : new BigNumber(0),
      Method: message.Method ? message.Method : 0,
      Params: message.Params ? message.Params : "",
      Version: message.Version ? message.Version : 0,
      Nonce: message.Nonce ? message.Nonce : await this.getNonce(message.From),
    };

    if (msg.GasLimit === 0) msg = await this.estimateMessageGas(msg);

    return msg;
  }

  async signMessage(message, privkey) {
    const signedMessage = await signMessage(message, privkey);
    return signedMessage;
  }

  async pushMessage(message) {
    const ret = await axios.post(this.rpc, {
      jsonrpc: "2.0",
      id: 0,
      method: "Filecoin.MpoolPush",
      params: [message],
    });
    return ret;
  }

  async waitMessage(cid, nonce) {
    const ret = await axios.post(this.rpc, {
      jsonrpc: "2.0",
      id: 1,
      method: "Filecoin.StateWaitMsg",
      params: [{ "/": cid }, nonce, 333580, true],
    });
    return ret;
  }

  async findMessage(cid) {
    const ret = await axios.post(this.rpc, {
      jsonrpc: "2.0",
      id: 1,
      method: "Filecoin.ChainGetMessage",
      params: [{ "/": cid }],
    });
    return ret;
  }
}

// export default FilecoinTransaction
export { FilecoinTransaction };

// module.exports = {
//     FilecoinTransaction
// }
