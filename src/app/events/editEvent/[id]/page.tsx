import { notFound, redirect } from "next/navigation";
import { getEventById } from "@/actions/event";
import { getUser } from "@/actions/auth/authActions";
import EventForm from "../../_components/EventForm";
import styles from "./style.module.scss";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const [event, response] = await Promise.all([getEventById(id), getUser()]);

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
      <EventForm event={event} />
    </main>
  );
}
