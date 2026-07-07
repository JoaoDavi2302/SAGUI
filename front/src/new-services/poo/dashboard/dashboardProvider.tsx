import { StudentDashboard, ProfessorDashboard, AdminDashboard } from "./Roles";
import { UserEntity } from "../shared/types";

export class DashboardProvider {
  static create(role: string, user: UserEntity) {
    switch (role) {
      case "ALUNO":
        return new StudentDashboard(user);

      case "PROFESSOR":
        return new ProfessorDashboard(user);

      case "ADMINISTRADOR":
        return new AdminDashboard(user);

      default:
        throw new Error("Perfil inválido");
    }
  }
}