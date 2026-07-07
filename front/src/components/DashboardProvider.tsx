"use client";

import { createContext, useContext, useState } from "react";
import initialData from "./mock.json";

const DashboardContext = createContext<any>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(initialData);

  // Função para atualizar notas e status do aluno (mantém a lógica de correção)
  const handleUpdateNota = (alunoId: number, atividadeId: number, novaNota: number) => {
    setData((prev: any) => {
      const novasTentativas = prev.tentativas_atividade.map((t: any) =>
        t.aluno_id === alunoId && t.atividade_id === atividadeId
          ? { ...t, nota: novaNota }
          : t
      );

      const novasMatriculas = prev.matriculas.map((m: any) => {
        if (m.aluno_id === alunoId) {
          const statusCalculado = novaNota >= 70 ? "APROVADA" : "EM_RISCO";
          return { ...m, status: statusCalculado };
        }
        return m;
      });

      return { 
        ...prev, 
        tentativas_atividade: novasTentativas,
        matriculas: novasMatriculas 
      };
    });
  };

  // Funções para gerenciar Aulas
  const handleAddAula = (novoMaterial: any) => {
    setData((prev: any) => ({
      ...prev,
      aulas: [...prev.aulas, { ...novoMaterial, id: Date.now() }] 
    }));
  };

  const handleEditAula = (aulaId: number, novoTitulo: string) => {
    setData((prev: any) => ({
      ...prev,
      aulas: prev.aulas.map((a: any) => 
        a.id === aulaId ? { ...a, titulo: novoTitulo } : a
      )
    }));
  };

  const handleDeleteAula = (aulaId: number) => {
    setData((prev: any) => ({
      ...prev,
      aulas: prev.aulas.filter((a: any) => a.id !== aulaId)
    }));
  };

  const handleUpdateConteudoAula = (aulaId: number, dadosAula: any) => {
    setData((prev: any) => ({
      ...prev,
      aulas: prev.aulas.map((a: any) => 
        a.id === aulaId ? { ...a, ...dadosAula } : a
      )
    }));
  };

  // Funções para gerenciar Módulos
  const handleAddModulo = (novoModulo: any) => {
    setData((prev: any) => ({
      ...prev,
      modulos: [...prev.modulos, { ...novoModulo, id: Date.now() }] 
    }));
  };

  const handleEditModulo = (moduloId: number, novoNome: string) => {
    setData((prev: any) => ({
      ...prev,
      modulos: prev.modulos.map((m: any) => 
        m.id === moduloId ? { ...m, nome: novoNome } : m
      )
    }));
  };

  const handleDeleteModulo = (moduloId: number) => {
    setData((prev: any) => ({
      ...prev,
      modulos: prev.modulos.filter((m: any) => m.id !== moduloId),
      aulas: prev.aulas.filter((a: any) => a.modulo_id !== moduloId)
    }));
  };

  // Funções para gerenciar Avaliações (CRUD completo)
  const handleSaveAvaliacao = (avaliacao: any) => {
    setData((prev: any) => {
      const index = prev.atividades.findIndex((a: any) => a.id === avaliacao.id);
      if (index !== -1) {
        const novasAtividades = [...prev.atividades];
        novasAtividades[index] = avaliacao;
        return { ...prev, atividades: novasAtividades };
      }
      return { ...prev, atividades: [...prev.atividades, { ...avaliacao, id: Date.now() }] };
    });
  };

  const handleDeleteAvaliacao = (avaliacaoId: number) => {
    setData((prev: any) => ({
      ...prev,
      atividades: prev.atividades.filter((a: any) => a.id !== avaliacaoId)
    }));
  };

  return (
    <DashboardContext.Provider value={{ 
      data, 
      handleUpdateNota, 
      handleAddAula, 
      handleEditAula, 
      handleDeleteAula,
      handleUpdateConteudoAula,
      handleAddModulo, 
      handleEditModulo,
      handleDeleteModulo,
      handleSaveAvaliacao,
      handleDeleteAvaliacao
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);