import { StudentDashboard, ProfessorDashboard, AdminDashboard } from "./Roles";

export class DashboardProvider {

  static create(
    role: string,
    user: any,
    database: any
  ) {

    switch (role) {

      case "Aluno":
        return new StudentDashboard(
          user,
          database
        );

      case "Professor":
        return new ProfessorDashboard(
          user,
          database
        );

        case "Admin":
        return new AdminDashboard(
          user,
          database
        );

      default:
        throw new Error("Perfil inválido");
    }
  }
}