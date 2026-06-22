import { redirect } from "next/navigation";

export default function Home() {
  // TODO: Backend Integration — JWT Authentication
  // When backend is connected, check JWT token and redirect to /login if not authenticated
  redirect("/dashboard");
}
