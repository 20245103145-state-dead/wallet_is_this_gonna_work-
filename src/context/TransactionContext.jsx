import { createContext, useContext, useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

/**
 * @context TransactionContext
 * @description Manages global state for user transactions and goals. It synchronizes data in real-time with Firestore.
 */
const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setGoals([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const uid = user.uid || user.id;

        let txLoaded = false;
        let goalsLoaded = false;
        
        const checkDone = () => {
            if (txLoaded && goalsLoaded) setLoading(false);
        };

        /**
         * [EDUCATIONAL COMMENT]
         * onSnapshot establishes a real-time listener (WebSocket connection) with Firestore.
         * Whenever a transaction is created, modified, or deleted, this callback fires instantly,
         * keeping the UI perfectly in sync without manual polling.
         * Notice how we fetch subcollections specific to the authenticated user's ID (`users/${uid}/transactions`).
         */
        const qTxs = query(collection(db, `users/${uid}/transactions`));
        const unsubTxs = onSnapshot(qTxs, (snapshot) => {
            const txData = [];
            // Put id LAST so Firestore's real doc id always overrides any stale 'id' field stored in the document data
            snapshot.forEach((d) => txData.push({ ...d.data(), id: d.id }));
            setTransactions(txData);
            txLoaded = true;
            checkDone();
        }, (error) => {
            console.error("Transactions snapshot error:", error);
            toast.error("Failed to sync real-time transactions.");
            txLoaded = true;
            checkDone();
        });

        const qGoals = query(collection(db, `users/${uid}/goals`));
        const unsubGoals = onSnapshot(qGoals, (snapshot) => {
            const goalData = [];
            snapshot.forEach((d) => goalData.push({ ...d.data(), id: d.id }));
            setGoals(goalData);
            goalsLoaded = true;
            checkDone();
        }, (error) => {
            console.error("Goals snapshot error:", error);
            toast.error("Failed to sync real-time goals.");
            goalsLoaded = true;
            checkDone();
        });

        /**
         * [EDUCATIONAL COMMENT]
         * Cleanup function: We must return a function to unsubscribe from listeners when the component unmounts
         * or when the `user` dependency changes. This prevents memory leaks and unintended background reads.
         */
        return () => {
            unsubTxs();
            unsubGoals();
        };
    }, [user]);

    const addTransaction = async (tx) => {
        if (!user) return;
        try {
            const uid = user.uid || user.id;
            await addDoc(collection(db, `users/${uid}/transactions`), tx);
        } catch (error) {
            console.error("Error adding transaction: ", error);
            toast.error("Failed to add transaction.");
            throw error;
        }
    };

    const deleteTransaction = async (id) => {
        if (!user) return;
        try {
            const uid = user.uid || user.id;
            await deleteDoc(doc(db, `users/${uid}/transactions`, id));
        } catch (error) {
            console.error("Error deleting transaction: ", error);
            toast.error("Failed to delete transaction.");
            throw error;
        }
    };

    const updateTransaction = async (id, updatedData) => {
        if (!user) return;
        try {
            const uid = user.uid || user.id;
            await updateDoc(doc(db, `users/${uid}/transactions`, id), updatedData);
        } catch (error) {
            console.error("Error updating transaction:", error);
            toast.error("Failed to update transaction.");
            throw error;
        }
    };

    const addGoal = async (goal) => {
        if (!user) return;
        try {
            const uid = user.uid || user.id;
            await addDoc(collection(db, `users/${uid}/goals`), goal);
        } catch (error) {
            console.error("Error adding goal: ", error);
            toast.error("Failed to add goal.");
            throw error;
        }
    };

    const updateGoal = async (id, amount) => {
        if (!user) return;
        try {
            const uid = user.uid || user.id;
            const goal = goals.find(g => g.id === id);
            if (goal) {
                const newCurrent = Math.min(goal.target, goal.current + amount);
                await updateDoc(doc(db, `users/${uid}/goals`, id), { current: newCurrent });
            }
        } catch (error) {
            console.error("Error updating goal: ", error);
            toast.error("Failed to update goal progress.");
            throw error;
        }
    };

    const deleteGoal = async (id) => {
        if (!user) return;
        try {
            const uid = user.uid || user.id;
            await deleteDoc(doc(db, `users/${uid}/goals`, id));
        } catch (error) {
            console.error("Error deleting goal: ", error);
            toast.error("Failed to delete goal.");
            throw error;
        }
    };

    const editGoal = async (id, updatedData) => {
        if (!user) return;
        try {
            const uid = user.uid || user.id;
            await updateDoc(doc(db, `users/${uid}/goals`, id), updatedData);
        } catch (error) {
            console.error("Error editing goal: ", error);
            toast.error("Failed to edit goal.");
            throw error;
        }
    };

    return (
        <TransactionContext.Provider value={{ transactions, goals, loading, addTransaction, deleteTransaction, updateTransaction, addGoal, updateGoal, deleteGoal, editGoal }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => useContext(TransactionContext);

