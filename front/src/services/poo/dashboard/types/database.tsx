// dados do banco
export interface User {
  id: string;
  name: string;
  email: string;
  birth_date: string;
  status: string;
}

export interface Course {
  id: string;
  name: string;
  area: string;
  workload: number;
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

