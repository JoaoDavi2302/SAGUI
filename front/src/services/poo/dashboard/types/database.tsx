// dados do banco
export interface User {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  data_nascimento: string;
  logradouro: string;
  cidade: string;
  estado: string;
  peril: string;
  ativo: string;
}

export interface Course {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string
}

export interface Discipline {
  id: string;
  course_id: string;
  professor_id: string;
  name: string;
  description: string;
  workload: number;
  order_index: number;
}

export interface Module {
  id: string;
  discipline_id: string;
  name: string;
  description: string;
  order_index: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  name: string;
  content: string;
  order_index: number;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
}

export interface Quiz {
  id: string;
  module_id: string;
  name: string;
  description: string;
  passing_score: number;
}
export interface StudentPerformance {
  student_id: string;
  discipline_id: string;
  progress_percent: number;
  grade: number;
}
export interface AppDatabase {
  users: User[];
  courses: Course[];
  disciplines: Discipline[];
  modules: Module[];
  lessons: Lesson[];
  materials: Material[];
  quizzes: Quiz[];
  student_performance: StudentPerformance[];
}

