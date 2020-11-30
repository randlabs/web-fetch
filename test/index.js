const webfetch = require("../build");
const test = require("ava");

webfetch.defaults.timeout = 5;

// -----------------------------------------------------------------------------

test('Simple fetch from AlgoExplorer\'s API', async (t) => {
	const res = await webfetch.fetch("https://api.algoexplorer.io/v2/status");

	const obj = res.toJSON();

	t.assert(typeof obj["last-round"] === "number");
	t.assert(obj["last-round"] > 0);

	t.pass();
});

test('Simple JSON fetch from AlgoExplorer\'s API', async (t) => {
	const res = await webfetch.fetchJSON("https://api.algoexplorer.io/v2/status");

	t.assert(typeof res["last-round"] === "number");
	t.assert(res["last-round"] > 0);

	t.pass();
});
