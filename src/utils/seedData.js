export const seedDemoData = (userId) => {
    const now = new Date();
    const txs = [];
    const cats = ["Food & Dining", "Transport", "Shopping", "Bills & Utilities", "Health", "Entertainment", "Salary", "Freelance"];
    for (let i = 0; i < 30; i++) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const isIncome = i % 7 === 0 || i % 15 === 0;
        txs.push({
            type: isIncome ? "income" : "expense",
            amount: isIncome ? (15000 + Math.random() * 20000) : (200 + Math.random() * 3000),
            category: isIncome ? (i % 15 === 0 ? "Freelance" : "Salary") : cats[i % 6],
            note: isIncome ? "Regular income" : `${cats[i % 6]} expense`,
            date: d.toISOString().split("T")[0],
            currency: "BDT",
            userId,
        });
    }
    return txs;
};

