const BigNumber = require("bignumber.js");
const axios = require("axios");
const BN = require("bn.js");
const cbor = require("ipld-dag-cbor").util;
const {
  getDigest,
  getCoinTypeFromPath,
  addressAsBytes,
  bytesToAddress,
  tryToPrivateKeyBuffer,
} = require("./utils");
const { ProtocolIndicator } = require("./constants");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const secp256k1 = require("secp256k1");

// start of Util Functions
function serializeBigNum(gasprice) {
  if (gasprice == "0") {
    return Buffer.from("");
  }
  const gaspriceBigInt = new BN(gasprice, 10);
  const gaspriceBuffer = gaspriceBigInt.toArrayLike(
    Buffer,
    "be",
    gaspriceBigInt.byteLength()
  );
  return Buffer.concat([Buffer.from("00", "hex"), gaspriceBuffer]);
}

// end of util functions

// start of create message functions
async function getNonce(address) {
  const ret = await axios.post("https://wallaby.node.glif.io", {
    jsonrpc: "2.0",
    id: 0,
    method: "Filecoin.MpoolGetNonce",
    params: [address],
  });
  return ret.data.result;
}

async function estimateMessageGas(message) {
  const ret = await axios.post("https://wallaby.node.glif.io", {
    jsonrpc: "2.0",
    id: 0,
    method: "Filecoin.GasEstimateMessageGas",
    params: [message, { MaxFee: "30000000000000" }, []],
  });
  // console.log('estimate', ret)
  return ret.data.result;
}

async function createMessage(message) {
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
    Nonce: message.Nonce ? message.Nonce : await getNonce(message.From),
  };

  if (msg.GasLimit === 0) msg = await estimateMessageGas(msg);

  return msg;
}

// end of create message functions

// start of signing a transaction

function transactionSerializeRaw(message) {
  if (!("to" in message) || typeof message.to !== "string") {
    throw new Error("'to' is a required field and has to be a 'string'");
  }
  if (!("from" in message) || typeof message.from !== "string") {
    throw new Error("'from' is a required field and has to be a 'string'");
  }
  if (!("nonce" in message) || typeof message.nonce !== "number") {
    throw new Error("'nonce' is a required field and has to be a 'number'");
  }
  if (
    !("value" in message) ||
    typeof message.value !== "string" ||
    message.value === "" ||
    message.value.includes("-")
  ) {
    throw new Error(
      "'value' is a required field and has to be a 'string' but not empty or negative"
    );
  }
  if (!("gasfeecap" in message) || typeof message.gasfeecap !== "string") {
    throw new Error("'gasfeecap' is a required field and has to be a 'string'");
  }
  if (!("gaspremium" in message) || typeof message.gaspremium !== "string") {
    throw new Error(
      "'gaspremium' is a required field and has to be a 'string'"
    );
  }
  if (!("gaslimit" in message) || typeof message.gaslimit !== "number") {
    throw new Error("'gaslimit' is a required field and has to be a 'number'");
  }
  if (!("method" in message) || typeof message.method !== "number") {
    throw new Error("'method' is a required field and has to be a 'number'");
  }
  if (!("params" in message) || typeof message.params !== "string") {
    throw new Error("'params' is a required field and has to be a 'string'");
  }

  const to = addressAsBytes(message.to);
  const from = addressAsBytes(message.from);

  const value = serializeBigNum(message.value);
  const gasfeecap = serializeBigNum(message.gasfeecap);
  const gaspremium = serializeBigNum(message.gaspremium);

  const message_to_encode = [
    0,
    to,
    from,
    message.nonce,
    value,
    message.gaslimit,
    gasfeecap,
    gaspremium,
    message.method,
    Buffer.from(message.params, "base64"),
  ];

  return cbor.serialize(message_to_encode);
}

function transactionSignRaw(unsignedMessage, privateKey) {
  if (typeof unsignedMessage === "object") {
    unsignedMessage = transactionSerializeRaw(unsignedMessage);
  }
  if (typeof unsignedMessage === "string") {
    unsignedMessage = Buffer.from(unsignedMessage, "hex");
  }

  // verify format and convert to buffer if needed
  privateKey = tryToPrivateKeyBuffer(privateKey);

  const messageDigest = getDigest(unsignedMessage);
  console.log("messageDigest", messageDigest);
  console.log("privateKey", privateKey);
  // const signature = ecdsaSign({},messageDigest, privateKey);
  // const signature = ec.sign(messageDigest, privateKey, { canonical: false })
  // console.log('signature', signature)

  // using secp256k1
  // const secpsignature = secp256k1.ecdsaSign(messageDigest, privateKey)

  // const signtx = Buffer.concat([
  //     Buffer.from(secpsignature.signature),
  //     Buffer.from([secpsignature.recid]),
  // ]);

  // return signtx;

  // console.log('secpsignature', signtx.toString('base64'))

  // using elliptic
  const ecSig = ec.sign(messageDigest, privateKey, { canonical: false });

  const signature = Buffer.concat([
    ecSig.r.toArrayLike(Buffer, "be", 32),
    ecSig.s.toArrayLike(Buffer, "be", 32),
  ]);
  let recid = ecSig.recoveryParam;
  if (ecSig.s.cmp(ec.nh) === 1) {
    ecSig.s = ec.n.sub(ecSig.s);
    recid ^= 1;
  }
  const signatureLowS = Buffer.concat([
    ecSig.r.toArrayLike(Buffer, "be", 32),
    ecSig.s.toArrayLike(Buffer, "be", 32),
  ]);

  const ellipticsignature = Buffer.concat([
    Buffer.from(signature),
    Buffer.from([recid]),
  ]);
  console.log("ellipticsignature", ellipticsignature.toString("base64"));
  return ellipticsignature;
}

function transactionSign(unsignedMessage, privateKey) {
  if (typeof unsignedMessage !== "object") {
    throw new Error(
      "'message' need to be an object. Cannot be under CBOR format."
    );
  }
  const signature = transactionSignRaw(unsignedMessage, privateKey);

  const signedMessage = {};

  signedMessage.message = unsignedMessage;

  // TODO: support BLS scheme
  signedMessage.signature = {
    data: signature.toString("base64"),
    type: ProtocolIndicator.SECP256K1,
  };

  return signedMessage;
}

function transactionSignLotus(unsignedMessage, privateKey) {
  const signedMessage = transactionSign(unsignedMessage, privateKey);

  return JSON.stringify({
    Message: {
      From: signedMessage.message.from,
      GasLimit: signedMessage.message.gaslimit,
      GasFeeCap: signedMessage.message.gasfeecap,
      GasPremium: signedMessage.message.gaspremium,
      Method: signedMessage.message.method,
      Nonce: signedMessage.message.nonce,
      Params: unsignedMessage.params,
      To: signedMessage.message.to,
      Value: signedMessage.message.value,
    },
    Signature: {
      Data: signedMessage.signature.data,
      Type: signedMessage.signature.type,
    },
  });
}

function messageToSigner(message) {
  return {
    to: message.To,
    from: message.From,
    nonce: message.Nonce,
    value: message.Value.toString(),
    gaslimit: Number(message.GasLimit.toString()),
    gasfeecap: message.GasFeeCap.toString(),
    gaspremium: message.GasPremium.toString(),
    method: message.Method,
    params: message.Params,
  };
}

async function signMessage(message, privkey) {
  // check if the address is available
  // We will check if the encrypted private key is available in localstorage n the below commented line
  // if (this.addresses.length === 0) await this.initAddresses();

  // check if the private keys are available for the from address
  // if (!this.privKeys[message.From]){
  //   throw new Error('From address not found');
  // }

  const signedTx = transactionSignLotus(messageToSigner(message), privkey);
  return JSON.parse(signedTx);
}

// end of signing a transaction

// start of sending a transaction to mpool

async function pushMessage(message) {
  const ret = await axios.post("https://wallaby.node.glif.io", {
    jsonrpc: "2.0",
    id: 0,
    method: "Filecoin.MpoolPush",
    params: [message],
  });
  return ret;
}

// end of sending a transaction to mpool

async function main() {
  // var nonce = await getNonce('t1koe725vbxdxr3ae6jdahpnm7kh2l2icbnaaujpq')
  // console.log(nonce)

  var message = await createMessage({
    To: "t1g3doy7tecgxp6w7j4kzenqv6b2znr7gdn3lxqaq",
    From: "t1koe725vbxdxr3ae6jdahpnm7kh2l2icbnaaujpq",
    Value: new BigNumber(1e17),
  });
  console.log("message", message);

  const privkey =
    "bfd5e5201e6ce8339838c077c4ca94bdec05dd15c828c0300f7a979eaad3189c";
  var signedtransaction = await signMessage(message, privkey);
  console.log("signedtransaction", signedtransaction);

  var transaction = await pushMessage(signedtransaction);
  console.log("transaction", transaction.data);
}

main();
