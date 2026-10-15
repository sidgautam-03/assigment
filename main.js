// main.js

const { Worker } = require('node:worker_threads');
const path = require('node:path');

// test dataset for both valid and invalid input items
const transactions = [
    { id: 1, amount: 100, type: 'credit' },
    { id: 2, amount: 200, type: 'credit' },
    { id: 3, amount: -50, type: 'debit' },
    { id: 4, amount: 30, type: 'invalid_type' },
    { amount: 50, type: 'credit' },
    { id: 6, amount: 50, type: 'debit' },
];

function processTransactions(data) {
    return new Promise((resolve, reject) => {
        const workerPath = path.resolve(__dirname, 'worker.js');
        const worker = new Worker(workerPath);

        // send payload to the worker
        worker.postMessage(data);

        // success response listener
        worker.on('message', (result) => {
            worker.terminate();
            resolve(result);
        });

        // the worker crashed
        worker.on('error', (err) => {
           worker.terminate();
           reject(new Error('Worker Thread Error: ${err.message}'));
        });

        worker.on('exit', (code) => {

            if(code !==0){

                reject(new Error('Worker thread abruptly stopped with exit code ${code}'));
            }

        });
    });
}

async function run(){

    try{

        const result = await processTransactions(transactions);
        console.log('--Processing Complete---');
        console.log(JSON.stringify(result, null, 2));
    } catch(error){

        console.error('--Worker Failed--');
        console.error(error.message);
    }

}

run();