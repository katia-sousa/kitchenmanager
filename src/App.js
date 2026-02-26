// src/App.js
import "bootstrap/dist/css/bootstrap.min.css";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import CadastroEstabelecimento from "./pages/CadastroEstabelecimento";
import CadastroUsuario from "./pages/CadastroUsuario";
import CategoriaDetalhe from "./pages/CategoriaDetalhe";
import Categorias from "./pages/Categorias";
import Colaboradores from "./pages/Colaboradores";
import ControleEstoque from "./pages/ControleEstoque";
import Estoque from "./pages/Estoque";
import EstoqueNutricionista from "./pages/EstoqueNutricionista";
import Fornecedores from "./pages/Fornecedores";
import HistoricoEstoque from "./pages/HistoricoEstoque";
import HomeColaborador from "./pages/HomeColaborador";
import HomeNutricionista from "./pages/HomeNutricionista";
import Login from "./pages/Login";
import PainelAdmin from "./pages/PainelAdmin";
import PainelColaborador from "./pages/PainelColaborador";
import RegistrarSaidas from "./pages/RegistrarSaidas";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-light">
          <Navbar />
          <main className="flex-grow-1 container py-4">
            <Routes>
             {/* REDIRECIONA "/" para login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* ROTA DE LOGIN */}
              <Route path="/login" element={<Login />} />
              <Route path="/kitchenmanager" element={<Login />} />
             <Route
                path="/admin/estabelecimento/:estabelecimentoId/historico-estoque"
                element={<HistoricoEstoque />}
              />

              <Route
                path="/admin"
                element={<PrivateRoute element={<PainelAdmin />} />}
              />

              <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
              <Route path="/cadastro-estabelecimento" element={<CadastroEstabelecimento />} />
              <Route path="/painel-colaborador" element={<PainelColaborador />} />
              <Route path="/home-nutricionista" element={<HomeNutricionista />} />
              <Route path="/colaboradores" element={<Colaboradores />} />
              <Route path="/controle-estoque/:estabelecimentoId" element={<ControleEstoque />} />
              <Route path="/admin/estabelecimento/:estabelecimentoId/estoque" element={<Estoque />} />
              <Route  path="/admin/estabelecimento/:estabelecimentoId/registrar-saidas" element={<RegistrarSaidas/>} />
              <Route path="/home-colaborador" element={<HomeColaborador />} />
              <Route path="/estoque-nutricionista/:id" element={<EstoqueNutricionista />}
/>
              <Route
                path="/admin/estabelecimento/:estabelecimentoId/categorias"
                element={<PrivateRoute element={<Categorias />} />}
              />
              <Route
                path="/admin/estabelecimento/:id/fornecedores"
                element={<Fornecedores />}
              />
              <Route path="/categoria-detalhes" element={<CategoriaDetalhe />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
