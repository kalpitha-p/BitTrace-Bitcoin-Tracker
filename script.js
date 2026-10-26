const button = document.querySelector("button");
const results = document.getElementById("results");

button.onclick = async function () {
    const transactionId = document
        .getElementById("transactionId")
        .value.trim();

    if (transactionId === "") {
        results.textContent = "Please enter a Bitcoin Transaction ID!";
        return;
    }

    try {
        button.textContent = "Searching...";
        button.disabled = true;
        results.textContent = "Fetching transaction details...";

        const response = await fetch(
            `https://blockstream.info/api/tx/${transactionId}`
        );

        if (!response.ok) {
            throw new Error("Transaction not found");
        }

        const tx = await response.json();
        saveSearch(tx.txid);

        results.innerHTML = `
            <h2>Transaction Details</h2>
        <p><strong>Transaction ID:</strong></p>
<div class="txid-row">
    <span class="txid-text">${tx.txid}</span>
    <button type="button" id="copyTxid">Copy ID</button>
</div>
<p>
    <a
        class="explorer-link"
        href="https://blockstream.info/tx/${tx.txid}"
        target="_blank"
        rel="noopener noreferrer"
    >
        View on Blockstream Explorer ↗
    </a>
</p>
            <p><strong>Status:</strong>
    <span class="status-badge ${tx.status.confirmed ? "confirmed" : "unconfirmed"}">
        ${tx.status.confirmed ? "Confirmed" : "Unconfirmed"}
    </span>
</p>
            <p><strong>Block Height:</strong>
                ${tx.status.block_height ?? "Not confirmed yet"}
            </p>
            <p><strong>Transaction Fee:</strong>
                ${tx.fee} satoshis
            </p>
        `;
        document.getElementById("copyTxid").onclick = async function () {
    try {
        await navigator.clipboard.writeText(tx.txid);
        this.textContent = "Copied!";
    } catch (error) {
        this.textContent = "Copy unavailable";
    }
};

    } catch (error) {
        results.textContent =
            "Transaction not found, or the API is unavailable. Please check the ID and try again.";
    } finally {
        button.textContent = "Track Transaction";
        button.disabled = false;
    }
};
async function loadBlockHeight() {
    const blockHeightElement = document.getElementById("blockHeight");

    try {
        const response = await fetch(
            "https://blockstream.info/api/blocks/tip/height"
        );

        if (!response.ok) {
            throw new Error("Could not load block height");
        }

        const height = await response.text();
        blockHeightElement.textContent =
            Number(height).toLocaleString("en-US");
    } catch (error) {
        blockHeightElement.textContent = "Temporarily unavailable";
    }
}

loadBlockHeight();
function saveSearch(txid) {
    const historyElement = document.getElementById("searchHistory");

    let history = JSON.parse(
        localStorage.getItem("bittraceHistory") || "[]"
    );

    history = [txid, ...history.filter(id => id !== txid)].slice(0, 5);

    localStorage.setItem("bittraceHistory", JSON.stringify(history));

    renderHistory();
}

function renderHistory() {
    const historyElement = document.getElementById("searchHistory");

    const history = JSON.parse(
        localStorage.getItem("bittraceHistory") || "[]"
    );

    if (history.length === 0) {
        historyElement.innerHTML = "<p>No recent searches yet.</p>";
        return;
    }

    historyElement.innerHTML = history.map(txid => `
        <div class="history-item">
            <span class="history-id">${txid}</span>
            <button type="button" data-txid="${txid}">Search again</button>
        </div>
    `).join("");

    historyElement.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => {
            document.getElementById("transactionId").value =
                button.dataset.txid;

            document.querySelector(".search-box button").click();
        });
    });
}

// Make the Search card functional
document.getElementById("searchCard").addEventListener("click", function () {
    const input = document.getElementById("transactionId");
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus();
});

// Make the Verify card functional
document.getElementById("verifyCard").addEventListener("click", function () {
    const input = document.getElementById("transactionId");
    const transactionId = input.value.trim();

    if (transactionId === "") {
        input.focus();
        alert("Please enter a Bitcoin transaction ID first!");
    } else {
        document.querySelector("button").click();
    }
});

// Make the Explore card functional
document.getElementById("exploreCard").addEventListener("click", function () {
    const input = document.getElementById("transactionId");
    const transactionId = input.value.trim();

    if (transactionId !== "") {
        window.open(
            "https://blockstream.info/tx/" + encodeURIComponent(transactionId),
            "_blank"
        );
    } else {
        window.open("https://blockstream.info/", "_blank");
    }
});

renderHistory();
