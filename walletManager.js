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
    addresses: [newWallet.address] // change this line
  };

  wallets.push(walletToSave);
  fs.writeFileSync(filePath, JSON.stringify(wallets, null, 2));
}

function findWalletNameByAddress(address) {
  console.log(address);
  const filePath = path.join(__dirname, 'all_wallets.json');
  const wallets = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (let wallet of wallets) {
    if (wallet.addresses.flat().includes(address)) {
      return wallet.name;
    }
  }
  throw new Error('Wallet not found');
}

function addAddressToWallet(walletName, newAddress) {
  const filePath = path.join(__dirname, 'all_wallets.json');
  let wallets = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (let wallet of wallets) {
    if (wallet.name === walletName) {
      wallet.addresses[0].push(newAddress);
      fs.writeFileSync(filePath, JSON.stringify(wallets, null, 2));
      return;
    }
  }
  throw new Error('Wallet not found');
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
    address: [address], // change this line
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

  const walletName = findWalletNameByAddress(address);

  return {
    name: walletName,
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

function getWalletByName(walletName) {
  const filePath = path.join(__dirname, 'all_wallets.json');
  const wallets = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (let wallet of wallets) {
    if (wallet.name === walletName) {
      return wallet;
    }
  }
  throw new Error('Wallet not found');
}

function generateAddress(wallet) {
  const mnemonic = wallet.mnemonic;
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);

  // Get the wallet by name
  const walletData = getWalletByName(wallet.name);

  // Generate the derivation path dynamically
  const addressIndex = walletData.addresses[0].length;
  const derivationPath = `m/44'/0'/0'/0/${addressIndex}`;

  const keyPair = root.derivePath(derivationPath);
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  console.log(`Address: ${address}`);

  addAddressToWallet(wallet.name, address);

  return {
    address,
  };
}

module.exports = { createWallet, importWallet, listWallets, generateAddress };