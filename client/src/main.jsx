import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css"
import App from "./App.jsx"
import Error from "./Error"

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <Error />,
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)