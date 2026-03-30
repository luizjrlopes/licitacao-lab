import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { AuthenticatedRoute } from "../components/AuthenticatedRoute";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { NoticesPage } from "../pages/NoticesPage";
import { LotDetailPage } from "../pages/LotDetailPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "notices",
        element: (
          <AuthenticatedRoute>
            <NoticesPage />
          </AuthenticatedRoute>
        ),
      },
      {
        path: "lots/:id",
        element: (
          <AuthenticatedRoute>
            <LotDetailPage />
          </AuthenticatedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
