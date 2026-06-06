async function test() {
    try {
        console.log("Sending request to http://localhost:3002/api/ai/chat...");
        const response = await fetch("http://localhost:3002/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: "hello" }],
                userTxs: []
            })
        });
        console.log("Response status:", response.status);
        const text = await response.text();
        console.log("Response body:", text);
    } catch (err) {
        console.error("Fetch error:", err);
    }
}
test();
