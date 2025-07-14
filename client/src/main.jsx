import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import TransactionHistory from "./TransactionHistory";
import Error from "./Error";

import { Notification, NotificationProvider } from "./component/Notification";
import { AppProvider } from "./AppContext";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <Error />,
    },
    {
        path: "/history",
        element: <TransactionHistory />,
        errorElement: <Error />,
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <NotificationProvider>
            <Notification/>
            <AppProvider>
                <RouterProvider router={router} />
            </AppProvider>
        </NotificationProvider>
    </React.StrictMode>
);