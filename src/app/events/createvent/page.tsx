import { redirect } from "next/navigation";
import { getUser } from "@/actions/auth/authActions";
import CreateEvent from "@/components/form/CreateEvent";
import styles from "./style.module.scss";
interface PageProps {
  params: Promise<{ id: number }>; // En Next.js 15+, params est une Promise
}
export default async function CreateEventPage({ params }: PageProps) {
  const response = await getUser();

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
