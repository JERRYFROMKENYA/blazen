// pocketbase.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import PocketBase, { AsyncAuthStore } from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PocketBaseContext = createContext();

export const usePocketBase = () => useContext(PocketBaseContext);

export const PocketBaseProvider = ({ children }) => {
    const [pb, setPb] = useState();

    useEffect(() => {
        const initializePocketBase = async () => {
            // This is where our auth session will be stored. It's PocketBase magic.
            const store = new AsyncAuthStore({
                save: async (serialized) => AsyncStorage.setItem('pb_auth', serialized),
                initial: await AsyncStorage.getItem('pb_auth'),
                clear: async () => AsyncStorage.removeItem('pb_auth'),
            });
            const pbInstance = new PocketBase("https://138.197.89.72:8090/", store);
            setPb(pbInstance);

        };

        initializePocketBase().then(r => {});
    }, []);

    return (
        <PocketBaseContext.Provider value={{ pb }}>
            {children}
        </PocketBaseContext.Provider>
    );
};
