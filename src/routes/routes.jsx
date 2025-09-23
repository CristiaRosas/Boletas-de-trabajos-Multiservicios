import { createBrowserRouter, RouterProvider } from "react-router-dom";
import FormatoControlVisita from "../pages/InformeControl";

const router = createBrowserRouter([
    {
        path: "/",
        element: <FormatoControlVisita />   
    }
]);

const MyRoutes = () => <RouterProvider router={router}/>

export default MyRoutes;