import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server-data";
import CreateEvent from "@/components/form/CreateEvent";
import styles from "./style.module.scss";
interface PageProps {
  params: Promise<{ id: number }>; // En Next.js 15+, params est une Promise
}
export default async function CreateEventPage({ params }: PageProps) {
  const response = await getCurrentUser();

  if (!response?.user) redirect("/auth/login?from=/events/createvent");
  if (!["ORGANISATEUR", "ADMIN"].includes(response.user.role)) {
    redirect("/events");
  }
  const { id } = await params;
  return (
    <main className={styles.page}>
      <CreateEvent id={id} />
    </main>
  );
}
