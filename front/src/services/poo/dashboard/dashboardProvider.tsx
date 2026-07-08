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

<<<<<<< HEAD
        case "Admin":
=======
        case "ADMINISTRADOR":
>>>>>>> origin/develop
        return new AdminDashboard(
          user,
          database
        );

      default:
        throw new Error("Perfil inválido");
    }
  }
}