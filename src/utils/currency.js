export const CURRENCY_SYMBOLS = {
    BDT: "৳",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "د.إ",
    INR: "₹"
};

const FALLBACK_RATES = {
    usd: { bdt: 117.0, eur: 0.92, gbp: 0.78, aed: 3.67, inr: 83.5, usd: 1.0 },
    eur: { bdt: 127.0, usd: 1.09, gbp: 0.85, aed: 3.99, inr: 90.7, eur: 1.0 },
    gbp: { bdt: 148.0, usd: 1.28, eur: 1.18, aed: 4.70, inr: 106.3, gbp: 1.0 },
    aed: { bdt: 31.8, usd: 0.27, eur: 0.25, gbp: 0.21, inr: 22.7, aed: 1.0 },
    inr: { bdt: 1.40, usd: 0.012, eur: 0.011, gbp: 0.0094, aed: 0.044, inr: 1.0 },
    bdt: { usd: 0.0085, eur: 0.0079, gbp: 0.0068, aed: 0.031, inr: 0.71, bdt: 1.0 }
};

export const fetchExchangeRate = async (fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return 1;
    
    const from = fromCurrency.toLowerCase();
    const to = toCurrency.toLowerCase();
    const dateStr = new Date().toISOString().split("T")[0];
    const cacheKey = `mywallet_rates_${from}_${dateStr}`;
    
    // 1. Try reading from localStorage cache
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const data = JSON.parse(cached);
            if (data && data[to]) {
                return data[to];
            }
        }
    } catch (e) {
        console.warn("Storage access failed or not available:", e);
    }
    
    // 2. Fetch from live API
    try {
        const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`);
        if (!res.ok) throw new Error("Failed to fetch rates");
        const data = await res.json();
        
        if (data && data[from] && data[from][to]) {
            // Save rates to local cache
            try {
                // Try to clean up older keys to keep storage clean
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith("mywallet_rates_") && !key.endsWith(dateStr)) {
                        localStorage.removeItem(key);
                    }
                }
                localStorage.setItem(cacheKey, JSON.stringify(data[from]));
            } catch (e) {
                console.warn("Saving to cache failed:", e);
            }
            return data[from][to];
        }
        throw new Error("Exchange rate not found in API response");
    } catch (error) {
        console.warn(`Live rate fetch failed for ${from} to ${to}, returning offline fallback:`, error);
        
        // 3. Fallback to predefined rates
        if (FALLBACK_RATES[from] && FALLBACK_RATES[from][to] !== undefined) {
            return FALLBACK_RATES[from][to];
        }
        return 1.0; // Ultimate safety fallback
    }
};

export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    const rate = await fetchExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
};

