import { Material } from "./material";
import { MaterialCard, MaterialEntity } from "../shared/types";

function buildMaterialCard(db: any, material: any): MaterialCard | null {
  const lessonMaterial = db.lesson_materials.find(
    (lm: any) => lm.material_id === material.id,
  );

  if (!lessonMaterial) return null;

  const lesson = db.lessons.find(
    (l: any) => l.id === lessonMaterial.lesson_id,
  );

  if (!lesson) return null;

  const module = db.modules.find(
    (m: any) => m.id === lesson.module_id,
  );

  if (!module) return null;

  const discipline = db.disciplines.find(
    (d: any) => d.id === module.discipline_id,
  );

  if (!discipline) return null;

  const course = db.courses.find(
    (c: any) => c.id === discipline.course_id,
  );

  if (!course) return null;

  return {
    ...material,

    lessonId: lesson.id,
    lessonName: lesson.name,

    moduleId: module.id,
    moduleName: module.name,

    disciplineId: discipline.id,
    disciplineName: discipline.name,

    courseId: course.id,
    courseName: course.name,
  };
}

/* aluno */
export class StudentMaterial extends Material {
  listMaterials(): MaterialCard[] {
    const courseIds = this.getStudentCourseIds();

    return this.database.materials
      .map((material: any) => buildMaterialCard(this.database, material))
      .filter(
        (material): material is MaterialCard =>
          material !== null &&
          courseIds.includes(material.courseId),
      );
  }

  getMaterial(id: string) {
    return this.database.materials.find((m: any) => m.id === id) ?? null;
  }

  updateMaterial() {
    return null;
  }
}

/* professor */
export class ProfessorMaterial extends Material {
  listMaterials(): MaterialCard[] {
    return this.database.materials
      .map((material: any) => buildMaterialCard(this.database, material))
      .filter(
        (material): material is MaterialCard =>
          material !== null &&
          this.database.disciplines.some(
            (d: any) =>
              d.id === material.disciplineId &&
              d.professor_id === this.user.id,
          ),
      );
  }

  getMaterial(id: string) {
    const material = buildMaterialCard(
      this.database,
      this.database.materials.find((m: any) => m.id === id),
    );

    if (!material) return null;

    const allowed = this.database.disciplines.some(
      (d: any) =>
        d.id === material.disciplineId &&
        d.professor_id === this.user.id,
    );

    return allowed
      ? this.database.materials.find((m: any) => m.id === id) ?? null
      : null;
  }

  updateMaterial(id: string, data: Partial<MaterialEntity>) {
    const material = this.getMaterial(id);

    if (!material) return null;

    Object.assign(material, data);

    return material;
  }
}

/* admin */
export class AdminMaterial extends Material {
  listMaterials(): MaterialCard[] {
    return this.database.materials
      .map((material: any) => buildMaterialCard(this.database, material))
      .filter(
        (material): material is MaterialCard =>
          material !== null,
      );
  }

  getMaterial(id: string) {
    return this.database.materials.find((m: any) => m.id === id) ?? null;
  }

  updateMaterial(id: string, data: Partial<MaterialEntity>) {
    const material = this.database.materials.find(
      (m: any) => m.id === id,
    );

    if (!material) return null;

    Object.assign(material, data);

    return material;
  }
}