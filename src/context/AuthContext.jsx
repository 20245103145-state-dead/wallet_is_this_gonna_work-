import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import toast from "react-hot-toast";

/**
 * @context AuthContext
 * @description Manages global authentication state, linking Firebase Auth with Firestore user profiles.
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /**
         * [EDUCATIONAL COMMENT]
         * onAuthStateChanged sets up a real-time listener for the user's authentication state.
         * This ensures session persistence across browser reloads without requiring manual token management.
         */
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    /**
                     * [EDUCATIONAL COMMENT]
                     * Dual-Storage Strategy: 
                     * 1. Firebase Auth manages the secure identity (email/password/OAuth).
                     * 2. Firestore stores the extended user profile (budget, preferences) in a document matching the Auth UID.
                     */
                    const docRef = doc(db, "users", firebaseUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUser({ id: firebaseUser.uid, name: "User", ...docSnap.data() });
                    } else {
                        setUser({ id: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || "User" });
                    }

                } catch (error) {
                    console.error("Error fetching user data:", error);
                    toast.error("Failed to load user profile data.");
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    };

    const signup = async (email, password, additionalData) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        await setDoc(doc(db, "users", newUser.uid), {
            email: newUser.email,
            createdAt: new Date().toISOString(),
            budget: { total: 30000, alerts: true },
            currency: "BDT",
            ...additionalData
        });
        return newUser;
    };

    /**
     * Shared handler for OAuth providers (Google / Apple)
     * [EDUCATIONAL COMMENT]
     * Pop-up based sign-in allows users to authenticate via third-party providers. 
     * We seamlessly create a Firestore profile document for them on their first login.
     */
    const handleOAuthSignIn = async (provider) => {
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

        // Create Firestore user doc on first login only
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            await setDoc(docRef, {
                name: firebaseUser.displayName || "User",
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL || "",
                createdAt: new Date().toISOString(),
                budget: { total: 30000, alerts: true },
                currency: "BDT",
            });
        }
        return firebaseUser;
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        return handleOAuthSignIn(provider);
    };

    const loginWithApple = () => {
        const provider = new OAuthProvider("apple.com");
        provider.addScope("email");
        provider.addScope("name");
        return handleOAuthSignIn(provider);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const updateUser = async (updater) => {
        if (!user) return;
        const newObj = typeof updater === "function" ? updater(user) : { ...user, ...updater };
        const { id, ...dataToUpdate } = newObj;
        
        try {
            await updateDoc(doc(db, "users", id), dataToUpdate);
            setUser(newObj);
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Failed to update user profile.");
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, loginWithApple, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);



