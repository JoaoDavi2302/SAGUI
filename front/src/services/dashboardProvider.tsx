import { StudentDashboard } from "./poo/dashboardAluno";
import { ProfessorDashboard } from "./poo/dashboardProfessor";
import { AdminDashboard } from "./poo/dashboardAdmin";

export class DashboardProvider {
  static create(role: string, user: any, database: any) {
    switch (role) {
      case "ALUNO":
        return new StudentDashboard(user, database);

      case "PROFESSOR":
        return new ProfessorDashboard(user, database);

      case "ADMIN":
        return new AdminDashboard(user, database);

      default:
        throw new Error("Perfil inválido");
    }
  }
}
