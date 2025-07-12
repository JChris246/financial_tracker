import React, { useContext, useState } from "react";

const AppContext = React.createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [balance, setBalance] = useState({
        balance: 0,
        stock: {}, crypto: {}, cash: {},
        totalIncome: 0, totalSpend: 0, totalStock: 0, totalCrypto: 0
    });

    return (
        <AppContext.Provider value={{ balance, setBalance }}>
            { children }
        </AppContext.Provider>
    );
};