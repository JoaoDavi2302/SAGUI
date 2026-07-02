import { StudentDashboard, ProfessorDashboard, AdminDashboard } from "./Roles";

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

        case "ADMIN":
        return new AdminDashboard(
          user,
          database
        );

      default:
        throw new Error("Perfil inválido");
    }
  }
}