"use server";

import { redirect } from "next/navigation";

export default async function ListeningIndexRedirect() {
  // Keep users landing on /dashboard/courses/listening routed to the
  // new review UI (lesson cards) to avoid confusion with the older
  // learning flow page.
  redirect('/dashboard/courses/listening/review');
}
