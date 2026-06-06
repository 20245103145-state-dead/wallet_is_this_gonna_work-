import { CURRENCY_SYMBOLS } from "./currency";

export const fmt = (n, currencyCode = "BDT") => {
    const code = (currencyCode || "BDT").toUpperCase();
    const symbol = CURRENCY_SYMBOLS[code] !== undefined ? CURRENCY_SYMBOLS[code] : code + " ";
    const locale = code === "USD" ? "en-US" : 
                   code === "EUR" ? "de-DE" : 
                   code === "GBP" ? "en-GB" : 
                   code === "INR" ? "en-IN" : 
                   code === "AED" ? "ar-AE" : "en-BD";
                   
    const num = isNaN(Number(n)) ? 0 : Number(n);
    return symbol + num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

