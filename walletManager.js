const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const fs = require('fs');
const path = require('path');

const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);

function saveAllWallets(newWallet) {
  const filePath = path.join(__dirname, 'all_wallets.json');

  let wallets;
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    wallets = JSON.parse(data);
    if (!Array.isArray(wallets)) {
      wallets = [wallets];
    }
  } else {
    wallets = [];
  }
  const walletToSave = {
    name: newWallet.name,
    address: newWallet.address
  };

  wallets.push(walletToSave);
  fs.writeFileSync(filePath, JSON.stringify(wallets, null, 2));
}


function createWallet(name) {
  const mnemonic = bip39.generateMnemonic();

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const derivationPath = "m/44'/0'/0'/0/0";
  const keyPair = root.derivePath(derivationPath);
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

  const wallet = {
    name,
    mnemonic,
    address,
  };

  saveAllWallets(wallet);
  return wallet;
}

function importWallet(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic');
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const derivationPath = "m/44'/0'/0'/0/0";
  const keyPair = root.derivePath(derivationPath);
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

  return {
    mnemonic,
    address,
  };
}

function listWallets() {
  const filePath = path.join(__dirname, 'all_wallets.json');
  const wallets = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log('\n')
  if (wallets && Array.isArray(wallets)) {
    console.log('Index | Name\t\t\t\t| Address');
    console.log('-'.repeat(80));

    wallets.forEach((wallet, index) => {
      console.log(`${index + 1}     | ${wallet.name.padEnd(30)} | ${wallet.address}`);
      console.log('-'.repeat(80));
    });
  } else {
    console.log('No wallets found.');
  }
}

function generateAddress(wallet) {
  const mnemonic = wallet.mnemonic;
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const derivationPath = "m/44'/0'/0'/0/1";
  const keyPair = root.derivePath(derivationPath);
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  console.log(`Address: ${address}`);
  console.log(wallet.address)
  return {
    address,
  };
}

module.exports = { createWallet, importWallet, listWallets, generateAddress };