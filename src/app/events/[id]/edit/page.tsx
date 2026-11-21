import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getEventDetails } from "@/lib/server-data";
import CreateEvent from "@/components/form/CreateEvent";
import styles from "./style.module.scss";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const [event, response] = await Promise.all([
    getEventDetails(id),
    getCurrentUser(),
  ]);

  if (!event) notFound();
  if (!response?.user) redirect("/auth/login");
  if (
    response.user.role !== "ADMIN" &&
    response.user.id !== event.organisateurId
  ) {
    redirect(`/events/${event.id}`);
  }

  return (
    <main className={styles.page}>
      <CreateEvent id={event.id} />
    </main>
  );
}
