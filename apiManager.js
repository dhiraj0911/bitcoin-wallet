const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.BLOCKCYPHER_API_KEY;
const BASE_URL = 'https://api.blockcypher.com/v1/btc/main';

async function getBalance(address) {
    try {
        const url = `${BASE_URL}/addrs/${address}/balance?token=${API_KEY}`;
        const response = await axios.get(url);
        const balanceInBTC = response.data.balance / 100000000;
        console.log(`${balanceInBTC} BTC`);
    } catch (error) {
        console.error('Error fetching balance:', error);
        return null;
    }
}

async function getTransactions(address) {
    try {
        const url = `${BASE_URL}/addrs/${address}?token=${API_KEY}`;
        const response = await axios.get(url);
        const transactions = response.data.txrefs || [];

        // Get only the latest 10 transactions
        const latestTransactions = transactions.slice(0, 10);

        console.log("Latest 10 Transactions:");
        console.table(latestTransactions.map(tx => ({
            "Tx Hash": tx.tx_hash,
            "Block Height": tx.block_height,
            // "Output N": tx.tx_output_n,
            "Value": tx.value,
            "Reference Balance (BTC)": (tx.ref_balance) / 100000000,
            "Confirmed": new Date(tx.confirmed).toLocaleString(),
            "Double Spend": tx.double_spend
        })));
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

module.exports = { getBalance, getTransactions };
