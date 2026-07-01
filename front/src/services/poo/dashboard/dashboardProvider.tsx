import { StudentDashboard, ProfessorDashboard } from "./Roles";

export class DashboardProvider {

  static create(
    role: string,
    user: any,
    database: any
  ) {

    switch (role) {

      case "ALUNO":
        return new StudentDashboard(
          user,
          database
        );

      case "PROFESSOR":
        return new ProfessorDashboard(
          user,
          database
        );

      default:
        throw new Error("Perfil inválido");
    }
  }
}