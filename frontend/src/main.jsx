import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import DBConnectForm from "./components/DBConnectForm.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/db-connection",
        element: <DBConnectForm />,
    },
]);

createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />,
);
