const { workerData, parentPort } = require('worker_threads');

function performWork(numIterations) {
  for (let j = 0; j < numIterations; j++) {
    const result = Math.sqrt(j * 1000);
  }
}

performWork(workerData.numIterations);

parentPort.postMessage('done');
