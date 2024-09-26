// `app/(auth)/auth.jsx`

import { useSegments, useRouter, useNavigationContainerRef } from 'expo-router';
import { useState, useEffect, createContext, useContext } from 'react';
import { usePocketBase } from '@/components/Services/Pocketbase';
import {Alert} from "react-native";

const AuthContext = createContext({
    signIn: (email, password) => {},
    signOut: () => {},
    createAccount: () => {},
    createNewAccount: ({ email, password, passwordConfirm, name }) => {},
    refreshAuth: () => {},
    isLoggedIn: false,
    isInitialized: false,
    user: {},
    did:{}
});

export function useAuth() {
    return useContext(AuthContext);
}

function useProtectedRoute(user, isInitialized) {
    const router = useRouter();
    const segments = useSegments();
    const [isNavigationReady, setIsNavigationReady] = useState(false);
    const rootNavRef = useNavigationContainerRef();

    useEffect(() => {
        const unsubscribe = rootNavRef?.addListener('state', (event) => {
            setIsNavigationReady(true);
        });
        return function cleanup() {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [rootNavRef.current]);

    useEffect(() => {
        if (!isNavigationReady) return;
        const inAuthGroup = segments[0] === '(auth)' || segments[1] === 'login';
        if (!isInitialized) return;

        if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        }
    }, [user, segments, isNavigationReady, isInitialized]);
}

export function AuthProvider({ children }) {
    const { pb } = usePocketBase();
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [did, setDid]=useState(null);

    useEffect(() => {
        const checkAuthStatus = async () => {
            if (pb) {
                const isLoggedIn = pb.authStore.isValid;
                setIsLoggedIn(isLoggedIn);
                setUser(isLoggedIn ? pb.authStore.model : null);
                setIsInitialized(true);
            if (user) {
                if(user.is_banned){
                    Alert.alert("Account Banned", "Your account has been banned. Contact support for more information")
                    await appSignOut()

                }
                    try {
                        pb.collection('customer_did').getFirstListItem(`user = "${user.id}"`, {
                            sort: 'updated',
                        }).then(did=>{
                            setDid(did.did);
                            console.log(did)
                        })

                    } catch (error) {
                        // console.error("Error fetching DID:", error);
                    }

                }
            }
        };

        checkAuthStatus();
    }, [pb]);

    const appSignIn = async (email, password) => {
        if (!pb) return { error: 'PocketBase not initialized' };

        try {
            const resp = await pb.collection('users').authWithPassword(email, password);
            setUser(pb.authStore.isValid ? pb.authStore.model : null);
            setIsLoggedIn(pb.authStore.isValid ?? false);
            if(!resp.record.verified){
                Alert.alert("Verify Email", "Please verify your email to continue. Check your email for the verification link.",
                [{
                    text: "Send new Mail",
                    onPress: async () => {
                        await pb.collection('users').requestVerification(resp.record.email);
                        Alert.alert("Verification","Verification email sent. Check your email for the verification link.")
                        try {
                            await pb.authStore.clear();
                            setUser(null);
                            setIsLoggedIn(false);
                            return { user: null };
                        } catch (e) {
                            return { error: e };
                        }
                    }
                },
                    {
                        text: "Cancel",
                        onPress: async () => {
                            console.log("Cancel Pressed")
                            try {
                                await pb.authStore.clear();
                                setUser(null);
                                setIsLoggedIn(false);
                                return {user: null};
                            } catch (e) {
                                return {error: e};
                            }
                        },
                        style: "cancel"
                    }

                ]
                )
            return { user: null };
            }
           else if(resp.record.is_banned){
                Alert.alert("Account Banned", "Your account has been banned. Contact support for more information")
                try {
                    await pb.authStore.clear();
                    setUser(null);
                    setIsLoggedIn(false);
                    return { user: null };
                } catch (e) {
                    return { error: e };
                }

            }else{
                return { user: resp.record };
            }
        } catch (e) {
            return { error: e };
        }
    };

    const appSignOut = async () => {
        if (!pb) return { error: 'PocketBase not initialized' };

        try {
            await pb.authStore.clear();
            setUser(null);
            setIsLoggedIn(false);
            return { user: null };
        } catch (e) {
            return { error: e };
        }
    };

    const createAccount = async ({ email, password, passwordConfirm, name }) => {
        if (!pb) return { error: 'PocketBase not initialized' };
        try {
            const resp = await pb.collection('users').create({
                email,
                password,
                passwordConfirm,
                name: name ?? '',
            });
            await appSignIn(email, password)

            return { user: resp };
        } catch (e) {
            return { error: e };
        }
    };

    const refreshAuth = async () => {
        if (!pb) return { error: 'PocketBase not initialized' };

        try {
            const isLoggedIn = pb.authStore.isValid;
            setIsLoggedIn(isLoggedIn);
            setUser(isLoggedIn ? pb.authStore.model : null);
            return { user: pb.authStore.model };
        } catch (e) {
            return { error: e };
        }
    };

    useProtectedRoute(user, isInitialized);

    return (
        <AuthContext.Provider
            value={{
                signIn: (email, password) => appSignIn(email, password),
                signOut: () => appSignOut(),
                createNewAccount: ({ email, password, passwordConfirm, name }) =>
                    createAccount({ email, password, passwordConfirm, name }),
                refreshAuth: () => refreshAuth(),
                isLoggedIn,
                isInitialized,
                user,
                did
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}