import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css"
import App from "./App.jsx"
import Error from "./Error"

import { Notification, NotificationProvider } from "./component/Notification";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <Error />,
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <NotificationProvider>
            <Notification/>
            <RouterProvider router={router} />
        </NotificationProvider>
    </React.StrictMode>
)