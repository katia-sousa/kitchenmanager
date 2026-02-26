import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";

function NavigationBar() {
  const { user: usuario, logout } = useAuth();
  const [tipo, setTipo] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleHomeRedirect = () => {
    if (tipo === "admin") {
      navigate("/admin");
    } else if (tipo === "nutricionista" || role === "nutricionista") {
      navigate("/home-nutricionista");
    } else if (tipo === "colaborador") {
      navigate("/painel-colaborador");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const carregarTipoUsuario = async () => {
      if (!usuario) {
        setTipo(null);
        return;
      }

      try {
        const docRef = doc(db, "usuarios", usuario.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setTipo(snap.data().tipo) || setRole(snap.data().role);
        }
      } catch (error) {
        console.error("Erro ao carregar tipo de usuário:", error);
      }
    };

    carregarTipoUsuario();
  }, [usuario]);

  const isAdmin = tipo === "admin";

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container>

        {/* 🔁 REDIRECIONAMENTO DINÂMICO */}
        <Navbar.Brand
          style={{ cursor: "pointer" }}
          onClick={handleHomeRedirect}
        >
          KitchenManager
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="menu-navbar" />
        <Navbar.Collapse id="menu-navbar">
          <Nav className="ms-auto">

            {isAdmin && (
              <>
                <Nav.Link as={Link} to="/cadastro-usuario">
                  Cadastro Usuário
                </Nav.Link>

                <Nav.Link as={Link} to="/admin">
                  Painel Admin
                </Nav.Link>

                <Nav.Link as={Link} to="/painel-colaborador">
                  Painel Colaborador
                </Nav.Link>
              </>
            )}

            <Button
              variant="danger"
              className="ms-3"
              onClick={handleLogout}
            >
              Sair
            </Button>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
