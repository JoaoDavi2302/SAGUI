export interface DashboardData {
  stats: any[];
  courses: any[];
  subjects: any[];
  // faltam resto das tabelas
}

export abstract class Dashboard {
  protected user: any;
  protected database: any;

  constructor(user: any, database: any) {
    this.user = user;
    this.database = database;
  }

  abstract getData(): DashboardData;
}