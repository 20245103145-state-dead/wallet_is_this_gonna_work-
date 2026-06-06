import { useState } from "react";
import { TrendingUp, TrendingDown, X as CloseIcon, Loader2 } from "lucide-react";
import { z } from "zod";
import { EXPENSE_CATS, INCOME_CATS } from "../constants/categories";
import { useTransactions } from "../context/TransactionContext";
import { useAuth } from "../context/AuthContext";
import { convertCurrency } from "../utils/currency";

export default function AddTransactionModal({ onClose, toast }) {
    const { user } = useAuth();
    const { addTransaction } = useTransactions();
    const [type, setType] = useState("expense");
    const [form, setForm] = useState({ amount: "", category: "", currency: user?.currency || "BDT", date: new Date().toISOString().split("T")[0], note: "" });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const cats = type === "expense" ? EXPENSE_CATS : INCOME_CATS;

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const save = async () => {
        const schema = z.object({
            amount: z.coerce.number().positive("Enter a valid positive amount"),
            category: z.string().min(1, "Select a category"),
            currency: z.string(),
            date: z.string(),
            note: z.string().optional()
        });

        try {
            schema.parse(form);
            setErrors({});
            setIsSaving(true);
            
            let finalAmount = +form.amount;
            const mainCurrency = user?.currency || "BDT";
            
            if (form.currency !== mainCurrency) {
                try {
                    finalAmount = await convertCurrency(finalAmount, form.currency, mainCurrency);
                } catch (e) {
                    toast("Failed to convert currency. Try again later.", "error");
                    setIsSaving(false);
                    return;
                }
            }

            const tx = { 
                type, 
                amount: finalAmount, 
                originalAmount: +form.amount,
                originalCurrency: form.currency,
                category: form.category, 
                currency: mainCurrency, 
                date: form.date, 
                note: form.note 
            };

            await addTransaction(tx);
            toast(`${type === "income" ? "Income" : "Expense"} recorded!`, "success");
            onClose();
        } catch (err) {
            setIsSaving(false);
            const e = {};
            if (err.errors) {
                err.errors.forEach(error => {
                    if (!e[error.path[0]]) e[error.path[0]] = error.message;
                });
            }
            setErrors(e);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} role="presentation">
            <div className="modal" role="dialog" aria-labelledby="modal-title" aria-modal="true">
                <div className="modal-header">
                    <div className="modal-title" id="modal-title">Add Transaction</div>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal"><CloseIcon size={18} /></button>
                </div>
                <div className="type-toggle">
                    <button className={`type-btn ${type === "income" ? "active income" : ""}`} onClick={() => { setType("income"); set("category", ""); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".4rem" }}><TrendingUp size={16} /> Income</button>
                    <button className={`type-btn ${type === "expense" ? "active expense" : ""}`} onClick={() => { setType("expense"); set("category", ""); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".4rem" }}><TrendingDown size={16} /> Expense</button>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label" htmlFor="amount-input">Amount</label>
                        <input id="amount-input" className={`form-input ${errors.amount ? "error" : ""}`} type="number" placeholder="0.00" value={form.amount} onChange={e => set("amount", e.target.value)} aria-invalid={!!errors.amount} aria-describedby={errors.amount ? "amount-error" : undefined} />
                        {errors.amount && <div id="amount-error" className="form-error" role="alert">{errors.amount}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="currency-select">Currency</label>
                        <select id="currency-select" className="form-input form-select" value={form.currency} onChange={e => set("currency", e.target.value)} aria-label="Select currency">
                            {["BDT", "USD", "EUR", "GBP", "AED", "INR"].map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="category-select">Category</label>
                    <select id="category-select" className={`form-input form-select ${errors.category ? "error" : ""}`} value={form.category} onChange={e => set("category", e.target.value)} aria-invalid={!!errors.category} aria-describedby={errors.category ? "category-error" : undefined}>
                        <option value="">Select category</option>
                        {cats.map(c => <option key={c}>{c}</option>)}
                    </select>
                    {errors.category && <div id="category-error" className="form-error" role="alert">{errors.category}</div>}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="date-input">Date</label>
                    <input id="date-input" className="form-input" type="date" value={form.date} onChange={e => set("date", e.target.value)} aria-label="Transaction date" />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="note-input">Note (optional)</label>
                    <input id="note-input" className="form-input" placeholder="Brief description..." value={form.note} onChange={e => set("note", e.target.value)} aria-label="Transaction note" />
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={save} disabled={isSaving}>
                    {isSaving ? <Loader2 size={18} className="spin" style={{ animation: "spin 1s linear infinite" }} /> : "Save Transaction"}
                </button>
            </div>
        </div>
    );
}
