const bip39 = require("bip39");

const mnmonic = bip39.generateMnemonic()
exports.default = mnmonic;