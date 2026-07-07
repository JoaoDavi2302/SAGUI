import DisciplineManagementView from "@/components/DisciplineView";

export default function AdminDisciplineDetailsPage({ data }: any) {
  return <DisciplineManagementView data={data} canDelete />;
}
