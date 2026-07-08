import databaseJson from "@/components/mock.json";

export const database = databaseJson as Database;

<<<<<<< HEAD
export type Role = "Admin" | "Professor" | "Aluno";
=======
export type Role = "ADMINISTRADOR" | "PROFESSOR" | "ALUNO";
>>>>>>> origin/develop

export interface Database {
  usuarios: UserEntity[];
  cursos: CourseEntity[];
  disciplinas: DisciplineEntity[];
  modulos: ModuleEntity[];
  aulas: LessonEntity[];
  anexos: AttachmentEntity[];
  atividades: ActivityEntity[];
  questoes: QuestionsEntity[];
  alternativas: AlternativeEntity[];
  matriculas: EnrollmentEntity[];
  progresso_modulo: ModuleProgressEntity[];
  tentativas_atividade: AttemptEntity[];
  respostas_aluno: AnswerEntity[];
  // tokens_recuperacao_senha: PasswordTokenEntity[];
}

export interface UserEntity {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  data_nascimento: string;
  logradouro: string;
  cidade: string;
  estado: string;
  perfil: Role;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface LoggedUser {
<<<<<<< HEAD
  id: string;
  name: string;
  email: string;
  role: Role;
=======
  id: number;
  nome: string;
  email: string;
  perfil: Role;
>>>>>>> origin/develop
}

/* curso */
export interface CourseEntity {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

/* disciplina */
export interface DisciplineEntity {
  id: number;
  curso_id: number;
  professor_id: number;

  nome: string;
  descricao: string;

  ativo: boolean;

  criado_em: string;
  atualizado_em: string;
}

/* matriculas */
export interface EnrollmentEntity {
  id: number;
  aluno_id: number;
  curso_id: number;
  disciplina_id?: number | null;
  status: string;
  aprovado_por?: number | null;
  aprovado_em?: string | null;
  criado_em: string;
}

export interface AttemptEntity {
  id: number;
  aluno_id: number;
  atividade_id: number;
  numero: number; /* numero da tentativa */
  nota: number;
  realizado_em: string;
}

/* respostas do aluno */
export interface AnswerEntity {
  id: number;
  tentativa_id: number;
  questao_id: number;
  alternativa_id: number;
}

/* modulo de entidade */
export interface ModuleEntity {
  id: number;
  disciplina_id: number;
  nome: string;
  descricao: string;
  ordem: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

/* progressos de modulo da disciplina */
export interface ModuleProgressEntity {
  id: number;
  aluno_id: number;
  modulo_id: number;
  tentativas: number;
  nota: number;
  concluido: boolean;
  concluido_em: string;
  atualizado_em: string;
}

/* atividades */
export interface ActivityEntity {
  id: number;
  modulo_id: number;
  titulo: string;
  descricao: string;
  max_tentativas: number;
  nota_aprovacao: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

// questões
export interface QuestionsEntity {
  id: number;
  atividade_id: number;
  enunciado: string;
  ordem: number;
  tipo: string;
  criado_em: string;
}

// alternativas
export interface AlternativeEntity {
  id: number;
  questao_id: number;
  texto: string;
  correta: boolean;
  ordem: number;
}

/* atividades */
export interface LessonEntity {
  id: number;
  modulo_id: number;
  titulo: string;
  conteudo: string;
  ordem: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

/* antigo material (anexos) */
export interface AttachmentEntity {
  id: number;
  modulo_id?: number | null;
  aula_id?: number | null;
  atividade_id?: number | null;
  tipo: string;
  nome_arquivo: string;
  url: string;
  tamanho_bytes: number;
  criado_em: string;
}

// /* cards de disciplina */
export interface DisciplineCard extends DisciplineEntity {
  professorName: string;
  modules: ModuleEntity[];
  progress: DisciplineProgress;
  courseName: string;
}

// // detalhes da aula disciplina
export interface LessonCard extends LessonEntity {
  completed: boolean;
}

export interface MaterialCard extends AttachmentEntity {
  lessonId: number;
  lessonName: string;

  moduleId: number;
  moduleName: string;

  disciplineId: number;
  disciplineName: string;

  courseId: number;
  courseName: string;
}

// // corrigir
export interface CourseCard extends CourseEntity {
  image?: string;

  enrolled?: boolean;
  available?: boolean;
  disciplinesCount?: number;
}

export interface ModuleActivityCard {
  moduleId: number;
  moduleName: string;

  disciplineId: number;
  disciplineName: string;

  courseId: number;
  courseName: string;

  quizzes: ActivityCard[];
}

export interface ActivityCard extends ActivityEntity {
  courseId: number;
  courseName: string;

  disciplineId: number;
  disciplineName: string;

  moduleId: number;
  moduleName: string;

  questionCount: number;
}

/* progresso de disciplina */
export interface DisciplineProgress {
  completedModules: number;
  totalModules: number;
  percentage: number;
}

export interface ModuleCard extends ModuleEntity {
  lessons: LessonCard[];
  lessonsCount: number;
  completedLessons: number;
  percentage: number;
}

// // detalhes da disciplina
export interface ModuleDetailsCard extends ModuleEntity {
  lessons: LessonCard[];
  progress: number;
}

export interface StudentProgressCard {
  id: number;
  name: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  // average: number; ainda não usado
}

// front

/* grupo disciplina por curso */
export interface DisciplineGroup {
  course: CourseEntity | null;
  subjects: DisciplineCard[];
}

/* dados da pagina de disciplina */
export interface DisciplinePageData {
<<<<<<< HEAD
  enrolledSubjects?: DisciplineCard[];
  availableSubjects?: DisciplineCard[];

  // professor
  disciplines: DisciplineCard[];

  modules: ModuleEntity[];

  lessons: LessonEntity[];

=======
  grouped: DisciplineGroup[];
  modules: ModuleEntity[];
  lessons: LessonEntity[];
>>>>>>> origin/develop
  moduleProgress: ModuleProgressEntity[];
}

// detalhes da disciplina
export interface DisciplineDetailsPage {
  discipline: DisciplineCard;
  modules: ModuleDetailsCard[];
  students: StudentProgressCard[];
  materials: MaterialCard[];
  activities: ActivityCard[];
}
