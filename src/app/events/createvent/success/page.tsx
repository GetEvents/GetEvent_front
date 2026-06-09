import { redirect } from "next/navigation";

export default function CreateEventSuccessPage() {
  redirect("/events/my-events");
}
