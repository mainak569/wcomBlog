"use server";

import { answer, user } from "@prisma/client";

export async function FetchUser(
  filter: string,
  users:
    | (user & {
        answer: answer[];
        // optional extra field injected by caller
        computedPoints?: number;
      })[]
    | null
) {
  // Final sorting based on the filter
  let sortedUser;
  if (filter === "top_contributors") {
    sortedUser = users?.sort(
      (a, b) =>
        (b.points ?? b.computedPoints ?? 0) - (a.points ?? a.computedPoints ?? 0)
    );
    return sortedUser;
  }
  if (filter === "new_users" || "old_users") {
    return users;
  }
}
