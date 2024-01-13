const {
  program
} = require('commander');
const {
  createWallet,
  importWallet,
  listWallets,
  generateAddress,
} = require('./walletManager');

const { getBalance, getTransactions } = require('./apiManager')

const promptForAddress = async () => {
  const inquirer = await getInquirer();
  const { address } = await inquirer.prompt([{
    type: 'input',
    name: 'address',
    message: 'Enter the wallet address:',
  }]);
  return address;
};

async function getInquirer() {
  if (!global.inquirer) {
    const inquirerModule = await import('inquirer');
    global.inquirer = inquirerModule.default;
  }
  return global.inquirer;
}
let currentWallet = null;

async function walletMenu(wallet) {
  const inquirer = await getInquirer();
  const answers = await inquirer.prompt([{
    type: 'list',
    name: 'walletAction',
    message: 'Select an action for your wallet:',
    choices: [
      'Generate Address',
      'Get Balance',
      'Get Transactions',
      'Back to Main Menu'
    ],
  }]);

  if (!currentWallet) {
    console.log("No wallet is currently selected.");
    return;
  }

  switch (answers.walletAction) {
    case 'Generate Address':
      await generateAddress(currentWallet);
      break;
    case 'Get Balance':
      await getBalance(currentWallet.address);
      break;
    case 'Get Transactions':
      await getTransactions(currentWallet.address);
      break;
    case 'Back to Main Menu':
      return;
  }
  await walletMenu(wallet);
}

async function mainMenu() {
  const inquirer = await getInquirer();
  const answers = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'Select an action:',
    choices: [
      'Create Wallet',
      'Import Wallet',
      'List Wallets',
      'Get Balance',
      'Get Transactions',
      'Exit'
    ],
  }]);

  switch (answers.action) {
    case 'Create Wallet':
      const {
        walletName
      } = await inquirer.prompt([{
        type: 'input',
        name: 'walletName',
        message: 'Enter a name for the new wallet:',
      }]);
      const createdWallet = createWallet(walletName);
      console.log(`Wallet Created: \nName: ${createdWallet.name}\nAddress: ${createdWallet.address}\nMnemonic: ${createdWallet.mnemonic}`);
      break;
    case 'Import Wallet':
      const { mnemonic } = await inquirer.prompt([{
        type: 'input',
        name: 'mnemonic',
        message: 'Enter your BIP39 mnemonic:',
      }]);
      try {
        const importedWallet = importWallet(mnemonic);
        console.log(`Wallet Imported: \nAddress: ${importedWallet.address}`);
        currentWallet = importedWallet;
        console.log(currentWallet);
        await walletMenu();
      } catch (error) {
        console.error(`Error importing wallet: ${error.message}`);
      }
      break;
    case 'List Wallets':
      listWallets();
      break;
    case 'Get Balance':
      const addressForBalance = await promptForAddress();
      await getBalance(addressForBalance);
      break;

    case 'Get Transactions':
      const addressForTransactions = await promptForAddress();
      await getTransactions(addressForTransactions);
      break;

    case 'Exit':
      process.exit();
  }

  await mainMenu();
}

program
  .command('start')
  .description('Start the interactive CLI')
  .action(mainMenu);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  mainMenu();
}
