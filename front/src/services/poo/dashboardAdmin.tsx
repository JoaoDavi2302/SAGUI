import {
  LayersOutlined,
  MenuBookOutlined,
  SchoolOutlined,
} from "@mui/icons-material";
import { Dashboard } from "./dashboard";
import { DashboardData } from "./dashboard";

export class AdminDashboard extends Dashboard {
  getData(): DashboardData {
    const courses = this.database.courses ?? [];
    const disciplines = this.database.disciplines ?? [];
    const disciplineIds = disciplines.map((d: { id: string }) => d.id);

    const modules = (this.database.modules ?? []).filter((m: { discipline_id: string }) =>
      disciplineIds.includes(m.discipline_id),
    );

    return {
      stats: [
        {
          icon: <SchoolOutlined sx={{ color: "#1976d2" }} />,
          label: "Cursos",
          value: courses.length,
        },
        {
          icon: <MenuBookOutlined sx={{ color: "#1976d2" }} />,
          label: "Disciplinas",
          value: disciplines.length,
        },
        {
          icon: <LayersOutlined sx={{ color: "#1976d2" }} />,
          label: "Módulos",
          value: modules.length,
        },
      ],
      courses,
      subjects: disciplines,
      modules,
    };
  }
}
