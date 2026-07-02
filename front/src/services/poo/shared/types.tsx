import database from "@/components/mock.json";

export type Database = typeof database;

export type Role = "ADMIN" | "PROFESSOR" | "ALUNO";

export interface UserEntity {
    id: string;
    name: string;
    email: string;
    birth_date: string;
    status: string;
    password_hash: string;
    photo_url: string | null;
}

export interface LoggedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/* curso */
export interface CourseEntity {
  id: string;
  description: string;
  name: string;
  area: string;
  workload: number;
}

export interface CourseCard extends CourseEntity {
  image?: string;

  enrolled?: boolean;
  available?: boolean;
  disciplinesCount?: number;
}

/* disciplina */
export interface DisciplineEntity {
  id: string;
  course_id: string;
  professor_id: string | null;
  name: string;
  description: string;
  workload: number;
  order_index: number;
}

/* cards de disciplina */
export interface DisciplineCard extends DisciplineEntity {
  professorName: string;
  modules: ModuleEntity[];
  progress: DisciplineProgress;
  courseName:string;
}

/* modulo de entidade */
export interface ModuleEntity {
  id: string;
  discipline_id: string;
  name: string;
  description: string;
  order_index: number;
}

/* lessons */
export interface LessonEntity {
  id: string;
  module_id: string;
  name: string;
  content: string;
  order_index: number;
}

// detalhes da aula disciplina
export interface LessonCard extends LessonEntity {
  completed: boolean;
}

/* material */
export interface MaterialEntity {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
}

export interface MaterialCard extends MaterialEntity {
  courseId: string;
  courseName: string;
  disciplineId: string;
  disciplineName: string;
  moduleId: string;
  moduleName: string;
}

/* quiz */
export interface QuizEntity {
  id: string;
  module_id: string;
  name: string;
  description: string | null;
  passing_score: number;
  max_attempts: number
}

export interface ModuleActivityCard {
    moduleId: string;
    moduleName: string;

    disciplineId: string;
    disciplineName: string;

    courseId: string;
    courseName: string;

    quizzes: ActivityCard[];
}

export interface ActivityCard extends QuizEntity {
  courseId: string;
  courseName: string;

  disciplineId: string;
  disciplineName: string;

  moduleId: string;
  moduleName: string;

  questionCount: number;
}

export interface EnrollmentEntity {
  id: string;
  student_id: string;
  course_id: string;
}

/* progressos de modulo da disciplina */
export interface ModuleProgressEntity {
  id: string;
  student_id: string;
  module_id: string;
  status: string;
}

/* progresso de disciplina */
export interface DisciplineProgress {
  completedModules: number;
  totalModules: number;
  percentage: number;
}

/* grupo disciplina */
export interface DisciplineGroup {
  course: CourseEntity | null;
  subjects: DisciplineCard[];
}

/* dados da pagina de disciplina */
export interface DisciplinePageData {
  grouped: DisciplineGroup[];
  modules: ModuleEntity[];
  lessons: LessonEntity[];
  moduleProgress: ModuleProgressEntity[];
}

export interface ModuleCard extends ModuleEntity {
  lessons: LessonCard[];
  lessonsCount: number;
  completedLessons: number;
  percentage: number;
}

// detalhes da disciplina
export interface ModuleDetailsCard extends ModuleEntity {
  lessons: LessonCard[];
  progress: number;
}


export interface StudentProgressCard {
  id: string;
  name: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  average: number;
}

export interface DisciplineDetailsPage {
  discipline: DisciplineCard;
  modules: ModuleDetailsCard[];
  students: StudentProgressCard[];
  materials:MaterialCard[];
  quizzes:ActivityCard[];
}
