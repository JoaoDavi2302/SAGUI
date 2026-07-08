import { Material } from "./material";
import {
  AttachmentEntity,
  Database,
  MaterialCard,
} from "../shared/types";

// corrigido
function buildMaterialCard(
  db: Database,
  attachment: AttachmentEntity,
): MaterialCard | null {
  if (attachment.aula_id == null) {
    return null;
  }

  const lesson = db.aulas.find((lesson) => lesson.id === attachment.aula_id);

  if (!lesson) {
    return null;
  }

  const module = db.modulos.find((module) => module.id === lesson.modulo_id);

  if (!module) {
    return null;
  }

  const discipline = db.disciplinas.find(
    (discipline) => discipline.id === module.disciplina_id,
  );

  if (!discipline) {
    return null;
  }

  const course = db.cursos.find((course) => course.id === discipline.curso_id);

  if (!course) {
    return null;
  }

  return {
    ...attachment,

    lessonId: lesson.id,
    lessonName: lesson.titulo,

    moduleId: module.id,
    moduleName: module.nome,

    disciplineId: discipline.id,
    disciplineName: discipline.nome,

    courseId: course.id,
    courseName: course.nome,
  };
}

/* aluno */
export class StudentMaterial extends Material {
  listMaterials(): MaterialCard[] {
    const courseIds = this.getStudentCourseIds();

    return this.database.anexos
      .map((attachment) => buildMaterialCard(this.database, attachment))
      .filter(
        (material): material is MaterialCard =>
          material !== null && courseIds.includes(material.courseId),
      );
  }

  getMaterial(id: number) {
    return (
      this.database.anexos.find((attachment) => attachment.id === id) ?? null
    );
  }

  updateMaterial() {
    return null;
  }
}

/* professor */
export class ProfessorMaterial extends Material {
  listMaterials(): MaterialCard[] {
<<<<<<< HEAD
    const disciplineIds = this.database.disciplinas
      .filter((d) => this.matchesUserId(d.professor_id))
      .map((d) => d.id);

    return this.database.anexos
      .map((attachment) => buildMaterialCard(this.database, attachment))
      .filter(
        (material): material is MaterialCard =>
          material !== null && disciplineIds.includes(material.disciplineId),
      );
  }

  getMaterial(id: number) {
    const attachment =
      this.database.anexos.find((a) => a.id === id) ?? null;

    if (!attachment) return null;

    const card = buildMaterialCard(this.database, attachment);
    if (!card) return null;

    const allowed = this.database.disciplinas.some(
      (d) => d.id === card.disciplineId && this.matchesUserId(d.professor_id),
    );

    return allowed ? attachment : null;
  }

  updateMaterial(id: number, data: Partial<AttachmentEntity>) {
=======
    // return this.database.materials
    //   .map((material: any) => buildMaterialCard(this.database, material))
    //   .filter(
    //     (material): material is MaterialCard =>
    //       material !== null &&
    //       this.database.disciplinas.some(
    //         (d: any) =>
    //           d.id === material.disciplineId && d.professor_id === this.user.id,
    //       ),
    //   );
  }

  getMaterial(id: string) {
    const material = buildMaterialCard(
      this.database,
      this.database.materials.find((m: any) => m.id === id),
    );

    if (!material) return null;

    const allowed = this.database.disciplinas.some(
      (d: any) =>
        d.id === material.disciplineId && d.professor_id === this.user.id,
    );

    return allowed
      ? (this.database.materials.find((m: any) => m.id === id) ?? null)
      : null;
  }

  updateMaterial(id: string, data: Partial<AttachmentEntity>) {
>>>>>>> origin/develop
    const material = this.getMaterial(id);

    if (!material) return null;

    Object.assign(material, data);

    return material;
  }
}

/* admin */
export class AdminMaterial extends Material {
  listMaterials(): MaterialCard[] {
<<<<<<< HEAD
    return this.database.anexos
      .map((attachment) => buildMaterialCard(this.database, attachment))
      .filter((material): material is MaterialCard => material !== null);
  }

  getMaterial(id: number) {
    return this.database.anexos.find((attachment) => attachment.id === id) ?? null;
  }

  updateMaterial(id: number, data: Partial<AttachmentEntity>) {
    const material = this.getMaterial(id);
=======
    return this.database.materials
      .map((material: any) => buildMaterialCard(this.database, material))
      .filter((material): material is MaterialCard => material !== null);
  }

  getMaterial(id: string) {
    return this.database.materials.find((m: any) => m.id === id) ?? null;
  }

  updateMaterial(id: string, data: Partial<AttachmentEntity>) {
    const material = this.database.materials.find((m: any) => m.id === id);
>>>>>>> origin/develop

    if (!material) return null;

    Object.assign(material, data);

    return material;
  }
}
