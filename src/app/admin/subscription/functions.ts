"use server";

export async function getSubscription() {
  return {
    duration: "2025-12-01",
    unique_issuances: "20 out of 100",
    concurrent_seasons: "3 out of 5",
  };
}
