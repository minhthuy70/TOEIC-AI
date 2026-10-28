"use server";

import { redirect } from "next/navigation";

export default async function ReadingIndexRedirect() {
  redirect("/dashboard/courses/reading/review");
}
