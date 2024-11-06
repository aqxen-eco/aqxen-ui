"use client"

import { Badge } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InputSymbol } from "@/components/ui/input-symbol";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const newBadgeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(3, "Symbol is required"),
  image: z.string().min(1, "IPFS Image hash is required"),
  description: z.string().min(1, "Description is required"),
  lifetimeAggregate: z.boolean(),
  lifetimeStats: z.boolean(),
});

type NewBadgeSchema = z.infer<typeof newBadgeSchema>;

export default function NewBadgePage() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewBadgeSchema>({
    resolver: zodResolver(newBadgeSchema)
  });

  async function onSubmit({
    name,
    symbol,
    image,
    description,
    lifetimeAggregate,
    lifetimeStats,
  }: NewBadgeSchema) {
    console.log({
      name,
      symbol,
      image,
      description,
      lifetimeAggregate,
      lifetimeStats,
    });
  }

  return (
    <Box className="p-0 mobile:rounded-none mobile:border-0 mobile:bg-black desktop:grid desktop:grid-cols-6 mobile:space-y-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 desktop:col-span-4 p-8 mobile:p-0"
      >
        <Input
          {...register("name")}
          label="Name"
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
        <Input
          {...register("image")}
          label="IPFS Image hash"
          error={errors["image"]?.message}
        />
        <Input
          {...register("description")}
          label="Description"
          error={errors["description"]?.message}
        />
        <Checkbox
          {...register("lifetimeAggregate")}
          label="Lifetime Aggregate"
          error={errors["lifetimeAggregate"]?.message}
        />
        <Checkbox
          {...register("lifetimeStats")}
          label="Lifetime Stats"
          error={errors["lifetimeStats"]?.message}
        />
        <Button type="submit" variant="primary" size="lg">
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
      </form>
      <div className="desktop:col-span-2 p-8 mobile:p-4 space-y-4 border-l mobile:border border-gray-2 mobile:rounded-2xl mobile:bg-gray-1">
        <h2 className="text-title-2 text-white">Badge preview</h2>
        <Badge name="Organization Name" balance="ORGN" />
        <hr className="border-t border-gray-2" />
        <div className="flex justify-between py-2">
          <p className="text-body-2 text-white">Lorem</p>
          <p className="text-body-2 text-white">914</p>
        </div>
      </div>
    </Box>
  );
}
