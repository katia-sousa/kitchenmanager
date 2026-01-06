import "bootstrap/dist/css/bootstrap.min.css";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CadastroEstabelecimento from "./pages/CadastroEstabelecimento";
import CadastroUsuario from "./pages/CadastroUsuario";
import Login from "./pages/Login";
import PainelAdmin from "./pages/PainelAdmin";
import PainelColaborador from "./pages/PainelColaborador";

function PrivateRoute({ children, tipo }) {
  const { user, userData, loading } = useAuth();
  if (loading) return <p className="text-center mt-5">Carregando...</p>;
  if (!user) return <Navigate to="/login" />;

  if (tipo && userData?.tipo !== tipo) {
    return <Navigate to={userData?.tipo === "admin" ? "/admin" : "/colaborador"} />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
          <Route path="/cadastro-estabelecimento" element={<CadastroEstabelecimento />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute tipo="admin">
                <PainelAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="/colaborador"
            element={
              <PrivateRoute tipo="colaborador">
                <PainelColaborador />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
