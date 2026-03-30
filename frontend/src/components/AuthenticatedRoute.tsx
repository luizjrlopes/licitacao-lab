import { Navigate, useLocation } from "react-router-dom";
import { useAuthToken } from "../hooks/useAuthToken";

export function AuthenticatedRoute({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const { isAuthenticated } = useAuthToken();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}