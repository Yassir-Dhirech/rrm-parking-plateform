import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <div>Login page (todo)</div>,
  },
  {
    element: <ProtectedRoute allowedRoles={["AGENT"]} />,
    children: [
      { path: "/agent", element: <div>Agent dashboard (todo)</div> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["ADMIN_SI"]} />,
    children: [
      { path: "/admin", element: <div>Admin dashboard (todo)</div> },
    ],
  },
]);