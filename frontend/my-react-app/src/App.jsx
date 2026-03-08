import "./App.css";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import LoginPage, { WelcomeSetup } from "./pages/loginpage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) return null;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      cacheLocation="localstorage"
      onRedirectCallback={(appState) => {
        const path = appState?.returnTo || "/dashboard";
        window.location.replace(window.location.origin + path);
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup" element={
            <ProtectedRoute>
              <WelcomeSetup />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  );
}

export default App;