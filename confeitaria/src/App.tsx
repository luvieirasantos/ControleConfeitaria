import Header from "./components/Header";
import Menu from "./components/Menu";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import NovaEncomenda from "./pages/NovaEncomenda";
import Encomendas from "./pages/Encomendas";
import RegistrarGasto from "./pages/RegistrarGasto";
import Resumo from "./pages/Resumo";
import Gastos from "./pages/Gastos";
import Relatorio from "./pages/Relatorio";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Menu />
          <main className="flex-1 flex justify-center items-start p-8 bg-gray-50">
            <div className="w-full max-w-3xl">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/produtos" element={<Produtos />} />
                <Route path="/nova-encomenda" element={<NovaEncomenda />} />
                <Route path="/encomendas" element={<Encomendas />} />
                <Route path="/registrar-gasto" element={<RegistrarGasto />} />
                <Route path="/resumo" element={<Resumo />} />
                <Route path="/gastos" element={<Gastos />} />
                <Route path="/relatorio" element={<Relatorio />} />

              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
