// para homepage de dashboard e (ead)
export interface DashboardData {
  stats: any[];
  courses: any[];
  subjects: any[];
  modules: any[];
  // faltam resto das tabelas
   module_progress?: any[];
  progressPercent?: number;
  completedModules?: number;
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

