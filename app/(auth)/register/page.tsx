import { redirect } from "next/navigation";

// OAuth login = registration. A separate register page is no longer needed.
export default function RegisterPage() {
  redirect("/login");
}
