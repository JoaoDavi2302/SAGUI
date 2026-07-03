// homepage de dashboard
'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Users, GraduationCap, BookOpen, Layers, FileDown, Search } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import jsPDF from 'jspdf';
import data from '../../services/mock_completo.json';

const studentConceptsData = [
  { name: 'Excelente', value: 30 },
  { name: 'Bom', value: 40 },
  { name: 'Regular', value: 20 },
  { name: 'Insuficiente', value: 10 },
];
const COLORS = ['#16a34a', '#2563eb', '#ca8a04', '#dc2626'];

const MetricCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: any }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Icon size={24} /></div>
    <div><h3 className="text-sm font-medium text-gray-500">{title}</h3><p className="text-2xl font-bold text-gray-900">{value}</p></div>
  </div>
);

export default function DashboardPage() {
  const [busca, setBusca] = useState('');

  const alunosFiltrados = useMemo(() => {
    return data.usuarios
      .filter((a: any) => a.nome.toLowerCase().includes(busca.toLowerCase()))
      .sort((a: any, b: any) => a.nome.localeCompare(b.nome));
  }, [busca]);

  const alunosPorAno = useMemo(() => {
    return alunosFiltrados.reduce((acc: any, aluno: any) => {
      (acc[aluno.ano_cadastro] = acc[aluno.ano_cadastro] || []).push(aluno);
      return acc;
    }, {});
  }, [alunosFiltrados]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Relatorio Geral de Desempenho", 10, 10);
    doc.save("relatorio_geral.pdf");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <MetricCard title="Total de Alunos" value={data.usuarios.length} icon={Users} />
        <MetricCard title="Cursos Ativos" value={data.cursos.length} icon={BookOpen} />
        <MetricCard title="Disciplinas" value={data.disciplinas.length} icon={Layers} />
        <MetricCard title="Total de Matrículas" value={data.matriculas.length} icon={GraduationCap} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Alunos por Ano de Cadastro</h3>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
              <input 
                placeholder="Pesquisar aluno..." 
                className="pl-9 pr-4 py-2 border rounded-lg text-sm"
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
          
          <div className="max-h-[500px] overflow-y-auto">
            {Object.keys(alunosPorAno).sort((a,b) => Number(b) - Number(a)).map(ano => (
              <div key={ano} className="mb-6">
                <h4 className="font-bold text-gray-700 bg-gray-50 p-2 rounded">Ano {ano}</h4>
                <table className="w-full text-left mt-2">
                  <thead className="text-sm text-gray-500"><tr><th>Nome</th><th>ID</th></tr></thead>
                  <tbody>
                    {alunosPorAno[ano].map((a: any) => (
                      <tr key={a.id} className="border-b text-sm">
                        <td className="py-2">
                          <Link href={`/dashboard/${a.id}`} className="text-blue-600 hover:underline font-medium">
                            {a.nome}
                          </Link>
                        </td>
                        <td>{a.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-2 text-sm">Desempenho Geral</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={studentConceptsData} innerRadius={50} outerRadius={70} dataKey="value">
                  {studentConceptsData.map((entry, index) => <Cell key={index} fill={COLORS[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <button onClick={generatePDF} className="w-full mt-4 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              <FileDown size={18} /> Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}