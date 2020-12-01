window.addEventListener("load", function () {
	WebFetch.fetchJSON("https://api.algoexplorer.io/v2/status").then((res) => {
		const elem = document.getElementById("output");
		elem.innerText = "Current round is: " + res["last-round"].toString();
	});
});
