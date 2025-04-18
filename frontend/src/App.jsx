import { Suspense, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./index.css";
import routes from "./routes.jsx";
import Loader from "./ui/Loader.jsx";

const App = () => {
    const router = createBrowserRouter(routes);

    // Sorry, i created the entire app at 80% zoom on my browser 😭
    useEffect(() => {
        const zoomLevel = 0.8;
        document.documentElement.style.setProperty(
            "font-size",
            `${zoomLevel * 100}%`,
        );
    }, []);
    return (
        <>
            <Suspense fallback={<Loader />}>
                <RouterProvider router={router} />
            </Suspense>
            <ToastContainer
                autoClose={2000}
                position="top-center"
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </>
    );
};

export default App;
