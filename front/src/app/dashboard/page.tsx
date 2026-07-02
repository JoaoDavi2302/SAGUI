// homepage de dashboard
'use client';
import { useAuth } from '@/services/auth/AuthContext';
import database from '@/components/mock.json';
import React, { useMemo } from 'react';
import { DashboardProvider } from '@/services/poo/dashboard/dashboardProvider';
import { DisciplineEntity, User } from '@/services/poo/shared/types';


export default function DashboardPage() {
  const auth = useAuth();
  const user = auth?.user;
  const dashboard = DashboardProvider.create("ADMIN", user, database);
  const data = dashboard.getData();
  
 
  const usersMap = useMemo(() => {
    if (!data.users) return {};
    return Object.fromEntries(data.users.map((u: User) => [String(u.id), u.name]));
  }, [data.users]);
  console.log("Users Map:", usersMap);
  console.log("Performance Data:", data.student_performance);
  const disciplinesMap = useMemo(() => {
    if (!data.subjects) return {};
    return Object.fromEntries(data.subjects.map((s: DisciplineEntity) => [String(s.id), s.name]));
  }, [data.subjects]);

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Administrativo</h1>
          <p className="text-gray-500 mt-1">Visão geral do sistema acadêmico SAGUI</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          Gerar Relatório
        </button>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total de Alunos</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">1.248</p>
          <p className="text-sm text-green-600 mt-2 font-medium flex items-center gap-1">↑ +12% este mês</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Professores Ativos</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">84</p>
          <p className="text-sm text-blue-600 mt-2 font-medium flex items-center gap-1">→ Estável</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Cursos Registrados</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
          <p className="text-sm text-green-600 mt-2 font-medium flex items-center gap-1">↑ +2 este semestre</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Disciplinas</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">156</p>
          <p className="text-sm text-gray-500 mt-2 font-medium flex items-center gap-1">Formatadas para o semestre</p>
        </div>
      </div>

      {/* Área de Gráfico e Desempenho */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[320px]">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Relatório de Desempenho dos Alunos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-400 text-sm">
                  <th className="p-3">Aluno</th>
                  <th className="p-3">Disciplina</th>
                  <th className="p-3">Progresso</th>
                  <th className="p-3">Nota</th>
                </tr>
              </thead>
              <tbody>
                {data.student_performance?.map((perf, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">{usersMap[String(perf.student_id)] || "Aluno Desconhecido"}</td>
                    <td className="p-3">{disciplinesMap[String(perf.discipline_id)] || "Indefinida"}</td>
                    <td className="p-3">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[150px]">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${perf.progress_percent}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{perf.progress_percent}%</span>
                    </td>
                    <td className="p-3 font-semibold text-gray-800">{perf.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feed de Atividades Recentes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[320px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Atividades Recentes</h3>
          <ul className="space-y-5">
            <li className="flex gap-4">
              <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
              <div>
                <p className="text-gray-800 font-medium text-sm">Novo curso de I.A. adicionado</p>
                <p className="text-gray-500 text-xs mt-0.5">Há 2 horas</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
              <div>
                <p className="text-gray-800 font-medium text-sm">Matrículas em lote concluídas</p>
                <p className="text-gray-500 text-xs mt-0.5">Há 5 horas</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}