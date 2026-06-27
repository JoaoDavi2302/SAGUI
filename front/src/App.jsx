import React, { useState } from "react";
import {
  BookOpen,
  Users,
  LayoutDashboard,
  Settings,
  LogOut,
  GraduationCap,
  BookMarked,
  CheckSquare,
  PlayCircle,
  Menu,
  X,
} from "lucide-react";

// --- COMPONENTES COMPARTILHADOS ---

const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const baseStyle =
    "px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
  >
    {children}
  </div>
);

// --- TELA DE LOGIN (P3) ---

const LoginScreen = ({ onLogin }) => {
  const [role, setRole] = useState("aluno");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600">
          <GraduationCap size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          SAGUI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistema de Gestão Acadêmica Unificada
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              onLogin(role);
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  defaultValue="demo@sagui.edu.br"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  defaultValue="123456"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Entrar como (Demo)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <Button type="submit" className="w-full">
              Entrar no Sistema
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- VIEWS DOS DASHBOARDS (P4, P5, P6, P7) ---

const AlunoDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Meus Cursos</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        {
          title: "Introdução à Programação",
          progress: 75,
          modules: 8,
          next: "Laços de Repetição",
        },
        {
          title: "Matemática Discreta",
          progress: 30,
          modules: 10,
          next: "Teoria dos Grafos",
        },
        {
          title: "Design de Interfaces",
          progress: 100,
          modules: 5,
          next: "Concluído",
        },
      ].map((course, i) => (
        <Card
          key={i}
          className="hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <BookOpen size={24} />
            </div>
            {course.progress === 100 && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                Concluído
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg mb-1">{course.title}</h3>
          <p className="text-gray-500 text-sm mb-4">
            {course.modules} Módulos no total
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className={`h-2.5 rounded-full ${
                course.progress === 100 ? "bg-green-500" : "bg-indigo-600"
              }`}
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Progresso</span>
            <span>{course.progress}%</span>
          </div>

          <Button
            variant={course.progress === 100 ? "secondary" : "primary"}
            className="w-full flex items-center justify-center gap-2"
          >
            {course.progress === 100 ? (
              <>
                <CheckSquare size={16} /> Revisar
              </>
            ) : (
              <>
                <PlayCircle size={16} /> Continuar
              </>
            )}
          </Button>
        </Card>
      ))}
    </div>
  </div>
);

const AdminDashboard = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">
        Visão Geral Administrativa
      </h2>
      <Button>+ Novo Curso</Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="flex items-center gap-4 border-l-4 border-indigo-500">
        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
          <Users size={24} />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Total de Usuários</p>
          <p className="text-2xl font-bold">1,245</p>
        </div>
      </Card>
      <Card className="flex items-center gap-4 border-l-4 border-green-500">
        <div className="p-3 bg-green-100 rounded-full text-green-600">
          <BookMarked size={24} />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Cursos Ativos</p>
          <p className="text-2xl font-bold">42</p>
        </div>
      </Card>
      <Card className="flex items-center gap-4 border-l-4 border-yellow-500">
        <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
          <CheckSquare size={24} />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Matrículas Pendentes</p>
          <p className="text-2xl font-bold">18</p>
        </div>
      </Card>
    </div>

    <Card>
      <h3 className="font-bold text-lg mb-4">Últimos Cursos Cadastrados</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 text-sm font-semibold text-gray-600">
                Curso
              </th>
              <th className="pb-3 text-sm font-semibold text-gray-600">
                Professor Responsável
              </th>
              <th className="pb-3 text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="pb-3 text-sm font-semibold text-gray-600">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 text-sm font-medium">Estrutura de Dados</td>
              <td className="py-3 text-sm text-gray-600">Carlos Silva</td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Ativo
                </span>
              </td>
              <td className="py-3">
                <Button variant="secondary" className="py-1 px-3 text-sm">
                  Editar
                </Button>
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 text-sm font-medium">
                Engenharia de Software
              </td>
              <td className="py-3 text-sm text-gray-600">Mariana Costa</td>
              <td className="py-3">
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Rascunho
                </span>
              </td>
              <td className="py-3">
                <Button variant="secondary" className="py-1 px-3 text-sm">
                  Editar
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

const ProfessorDashboard = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Meus Conteúdos</h2>
      <Button>+ Nova Aula</Button>
    </div>
    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-800 mb-6">
      Bem-vindo de volta! Você tem <strong>3 atividades</strong> aguardando
      correção na disciplina de Lógica.
    </div>
    <Card>
      <div className="text-center py-12 text-gray-500">
        <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
        <p>A visão detalhada de professor será implementada pela P7.</p>
        <p className="text-sm mt-2">
          Permite gestão de módulos, aulas e atividades.
        </p>
      </div>
    </Card>
  </div>
);

// --- LAYOUT PRINCIPAL (Base Compartilhada) ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin', 'aluno', 'professor'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (role) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Configuração de Menu baseada no Perfil
  const menuItems = {
    aluno: [
      { icon: LayoutDashboard, label: "Meu Painel" },
      { icon: BookOpen, label: "Catálogo de Cursos" },
      { icon: CheckSquare, label: "Minhas Atividades" },
    ],
    professor: [
      { icon: LayoutDashboard, label: "Painel do Professor" },
      { icon: BookMarked, label: "Gerenciar Disciplinas" },
      { icon: CheckSquare, label: "Correções" },
    ],
    admin: [
      { icon: LayoutDashboard, label: "Visão Geral" },
      { icon: Users, label: "Gestão de Usuários" },
      { icon: BookOpen, label: "Gestão de Cursos" },
      { icon: Settings, label: "Configurações do Sistema" },
    ],
  };

  const currentMenu = menuItems[userRole] || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <GraduationCap className="text-indigo-600 mr-2" size={28} />
          <span className="text-xl font-bold text-gray-800">SAGUI</span>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {currentMenu.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                index === 0
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 ${
                  index === 0 ? "text-indigo-600" : "text-gray-400"
                }`}
                size={20}
              />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 flex-shrink-0" size={20} />
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile/Global */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 md:justify-end">
          <div className="md:hidden flex items-center">
            <GraduationCap className="text-indigo-600 mr-2" size={28} />
            <span className="text-xl font-bold text-gray-800">SAGUI</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-medium text-gray-900">
                {userRole === "admin"
                  ? "Administrador do Sistema"
                  : userRole === "professor"
                  ? "Prof. Carlos"
                  : "Letícia Aluno"}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                Perfil: {userRole}
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              {userRole?.charAt(0).toUpperCase()}
            </div>
            <button
              className="md:hidden text-gray-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Conteúdo Dinâmico */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {userRole === "aluno" && <AlunoDashboard />}
          {userRole === "admin" && <AdminDashboard />}
          {userRole === "professor" && <ProfessorDashboard />}
        </main>
      </div>
    </div>
  );
}
