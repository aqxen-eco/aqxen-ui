"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { getSubscription } from "./functions";

const subscriptionSchema = z.object({
  duration: z.string().min(1, "Duration is required"),
  unique_issuances: z.string().min(1, "Unique issuances is required"),
  concurrent_seasons: z.string().min(1, "Concurrent seasons"),
});

type SubscriptionSchema = z.infer<typeof subscriptionSchema>;

export default function SubscriptionPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionSchema>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: async() => await getSubscription()
  });

  async function onSubmit({
    duration,
    unique_issuances,
    concurrent_seasons,
  }: SubscriptionSchema) {
    console.log({ duration, unique_issuances, concurrent_seasons });
  }

  return (
    <Box
      className="space-y-8 mobile:p-0 mobile:rounded-none mobile:border-0 mobile:bg-black"
      asChild
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("duration")}
          label="Duration"
          error={errors["duration"]?.message}
        />
        <Input
          {...register("unique_issuances")}
          label="Unique issuances"
          error={errors["unique_issuances"]?.message}
        />
        <Input
          {...register("concurrent_seasons")}
          label="Concurrent seasons"
          error={errors["concurrent_seasons"]?.message}
        />
        <Button type="submit" variant="primary" size="lg">
          {isSubmitting ? "Saving..." : "Manage"}
        </Button>
      </form>
    </Box>
  );
}
