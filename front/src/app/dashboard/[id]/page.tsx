'use client';
import React, { use, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import data from '@/services/mock_completo.json';

export default function DetalhesAlunoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const alunoRelatorio = useMemo(() => {
    console.log("ID recebido da URL:", id);
    console.log("Dados do JSON:", data);
    const usuario = data.usuarios.find(u => u.id === Number(id));
    console.log("Usuário encontrado:", usuario);
    if (!usuario) return null;

    const matriculas = data.matriculas.filter(m => m.aluno_id === usuario.id);
    
    const detalhamento = matriculas.map(m => {
      const curso = data.cursos.find(c => c.id === m.curso_id);
      const disciplinas = data.disciplinas.filter(d => d.curso_id === curso?.id);
      
      return {
        curso: curso?.nome,
        disciplinas: disciplinas.map(d => ({
          nome: d.nome,
          modulos: data.modulos.filter(mod => mod.disciplina_id === d.id).map(mod => {
            const prova = data.provas.find(p => p.modulo_id === mod.id);
            const nota = data.notas.find(n => n.aluno_id === usuario.id && n.prova_id === prova?.id)?.valor || 0;
            return { nome: mod.nome, nota };
          })
        }))
      };
    });

    // Dados para o gráfico: Média por disciplina do aluno
    const dadosGrafico = detalhamento.flatMap(c => 
      c.disciplinas.map(d => ({
        disciplina: d.nome,
        media: d.modulos.reduce((acc, m) => acc + m.nota, 0) / (d.modulos.length || 1)
      }))
    );

    return { usuario, detalhamento, dadosGrafico };
  }, [id]);

  if (!alunoRelatorio) return <div className="p-6">Aluno não encontrado.</div>;

  return (
    <div className="p-6 space-y-6">
      <Link href="/dashboard" className="flex items-center text-blue-600 hover:underline"><ArrowLeft size={16}/> Voltar</Link>
      
      <h1 className="text-3xl font-bold">{alunoRelatorio.usuario.nome}</h1>

      <div className="grid grid-cols-1 gap-6">
        {alunoRelatorio.detalhamento.map((det, i) => (
          <div key={i} className="bg-white p-6 rounded shadow border">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{det.curso}</h2>
            {det.disciplinas.map((d, j) => (
              <div key={j} className="mb-4">
                <h3 className="font-semibold text-blue-700">{d.nome}</h3>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {d.modulos.map((m, k) => (
                    <div key={k} className="bg-gray-50 p-2 rounded text-sm">
                      <p>{m.nome}</p>
                      <p className="font-bold">Nota: {m.nota}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded shadow border">
        <h3 className="font-semibold mb-4">Média de Rendimento por Disciplina</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={alunoRelatorio.dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="disciplina" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="media" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}