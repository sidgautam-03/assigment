// worker.js

const { parentPort } = require('node:worker_threads');

parentPort.on('message', (transactions) => {
    // payload validation
    try {
        if (!Array.isArray(transactions)) {
            throw new TypeError('Input payload must be an array of transactions.');
        }

        const validationTransactions = [];
        const rejectedTransactions = [];

        let totalCredits = 0;
        let totalDebits = 0;

        // validation and rejection logic
        transactions.forEach((tx, index) => {

            const rejections = [];

            // Rejection Criterion 1: Missing transaction ID
            if (tx.id === undefined || tx.id === null || tx.id === '') {
                rejections.push('Missing transaction Id');
            }

            // Rejection Criterion 2: Amount is negative or not a valid number
            if (typeof tx.amount !== 'number' || Number.isNaN(tx.amount) || tx.amount < 0) {
                rejections.push('Amount must be a non-negative number');
            }

            // Rejection Criterion 3: Invalid type
            if (tx.type !== 'credit' && tx.type !== 'debit') {
                rejections.push("Type must be either 'credit' or 'debit'");
            }

            // If invalid, move to the rejected list, otherwise process
            if (rejections.length > 0) {
                rejectedTransactions.push({
                    index,
                    transaction: tx,
                    reasons: rejections,
                });
            } else {
                validationTransactions.push(tx);

                // task 2: calculate totals for valid records
                if (tx.type === 'credit') {
                    totalCredits += tx.amount;
                } else {
                    totalDebits += tx.amount;
                }
            }
        });

        // construct processing response

        const output = {

            totalCredits: totalCredits,
            totalDebits: totalDebits,
            balance: totalCredits - totalDebits,
            transactionCount: validationTransactions.length,
            rejectedCount: rejectedTransactions.length,
            rejectedTransactions,
        };

        parentPort.postMessage({
            ok: true,
            valid: validationTransactions,
            rejected: rejectedTransactions,
            totalCredits,
            totalDebits,
        });

    } catch (error) {
        parentPort.postMessage({ ok: false, error: error.message });
    }
});