import { Suspense } from "react";
import Loading from "@/components/ui/Loading";
import ParticipationCallbackClient from "./ParticipationCallbackClient";

export default function ParticipationCallbackPage() {
  return (
    <Suspense
      fallback={<Loading message="Finalisation de votre inscription..." />}
    >
      <ParticipationCallbackClient />
    </Suspense>
  );
}
