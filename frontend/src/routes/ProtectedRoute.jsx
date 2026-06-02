import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Later: replace with real auth check from AuthContext
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;