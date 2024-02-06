const nodeURLs = [
  'https://node1.tigristrade.info',
  'https://node2.tigristrade.info'
  // 'https://arb.do.gkx.dev'
];

export let RelayNode = (new Date().getTimezoneOffset()) > 120 ? 'https://node2.tigristrade.info' : 'https://node1.tigristrade.info';

async function selectOptimalRelayNode() {
    try {
        // Select the node with the lowest ping
        const promises = [];
        for (const nodeURL of nodeURLs) {
            promises.push(
                fetch(nodeURL + '/health?timestamp=' + Date.now())
            );
        }
        const result = await Promise.any(promises);
        // nodeURL cut off everything after the last slash without the slash itself
        const nodeURL = result.url.slice(0, result.url.lastIndexOf('/'));
        const hostname = new URL(result.url).hostname;
        const ping = Date.now() - JSON.parse(await result.text()).timestamp;
        if (nodeURL !== RelayNode) console.log(`Switched to node @ ${hostname} with ${ping}ms ping`);
        return nodeURL;
    } catch {
        console.log('Unable to connect to any relay nodes, retrying in 10 seconds');
        return RelayNode;
    }
}

async function updateRelayNode() {
    const newRelayNode = await selectOptimalRelayNode();
    if (newRelayNode === RelayNode) return;
    RelayNode = newRelayNode;
}

setInterval(updateRelayNode, 10000);
