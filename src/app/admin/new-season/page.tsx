"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputBadges } from "@/components/ui/input-badges";
import { InputSymbol } from "@/components/ui/input-symbol";

const newSeasonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(3, "Symbol is required"),
  badges: z.string().array().min(1, "Badges is required"),
});

type NewSeasonSchema = z.infer<typeof newSeasonSchema>;

export default function NewSeasonPage() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewSeasonSchema>({
    resolver: zodResolver(newSeasonSchema),
  });

  async function onSubmit({ name, symbol, badges }: NewSeasonSchema) {
    console.log({
      name,
      symbol,
      badges,
    });
  }

  return (
    <Box className="p-0 mobile:rounded-none mobile:border-0 mobile:bg-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8 mobile:p-0"
      >
        <Input
          {...register("name")}
          label="Name"
          placeholder="String"
          error={errors["name"]?.message}
        />
        <Controller
          name="symbol"
          control={control}
          render={({ field }) => (
            <InputSymbol
              label="Symbol"
              error={errors["symbol"]?.message}
              maxLength={3}
              {...field}
            />
          )}
        />
        <Controller
          name="badges"
          control={control}
          render={({ field }) => (
            <InputBadges
              value={field.value}
              onChange={field.onChange}
              error={errors["badges"]?.message}
            />
          )}
        />
        <Button type="submit" variant="primary" size="lg">
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
      </form>
    </Box>
  );
}
