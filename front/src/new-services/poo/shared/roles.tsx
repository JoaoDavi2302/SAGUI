import { LoggedUser, Role } from "./types";

export abstract class perfilBase {
  constructor(
    protected database: any,
    protected user: LoggedUser,
  ) {}

  protected isAdmin(): boolean {
    return this.user.perfil === "ADMIN";
  }

  protected isProfessor(): boolean {
    return this.user.perfil === "PROFESSOR";
  }

  protected isStudent(): boolean {
    return this.user.perfil === "ALUNO";
  }

  protected canManageCourses(): boolean {
    return this.isAdmin();
  }

  protected canManageDisciplines(): boolean {
    return this.isAdmin() || this.isProfessor();
  }

  protected canViewCourse(courseId: string): boolean {
    return this.isAdmin() || this.isStudent() || this.isProfessor();
  }

  protected canEnroll(): boolean {
    return this.isStudent();
  }

  protected assertPerfil(perfil: Role) {
    return this.user.perfil === perfil;
  }
}
