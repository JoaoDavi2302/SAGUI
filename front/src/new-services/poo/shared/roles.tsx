import { LoggedUser, Role } from "./types";

export abstract class RoleBase {
  constructor(
    protected database: any,
    protected user: LoggedUser,
  ) {}

  protected isAdmin(): boolean {
    return this.user.role === "Admin";
  }

  protected isProfessor(): boolean {
    return this.user.role === "Professor";
  }

  protected isStudent(): boolean {
    return this.user.role === "Aluno";
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

  protected assertRole(role: Role) {
    return this.user.role === role;
  }
}