'use client'

import { HeaderAdmin, HeaderAdminBack, HeaderAdminTitle } from "@/components/header-admin";

import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InputBadges } from "@/components/ui/input-badges";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const addSeriesSchema = z.object({
  name: z.string().min(1, "Name is required"),
  badges: z.string().array().min(1, 'Badges is required'),
  start_right_away: z.boolean(),
});

type AddSeriesSchema = z.infer<typeof addSeriesSchema>;

export default function AddSeriesPage() {
  const params = useParams();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddSeriesSchema>({
    resolver: zodResolver(addSeriesSchema)
  });

  async function onSubmit({
    name,
    badges,
    start_right_away,
  }: AddSeriesSchema) {
    console.log({
      name,
      badges,
      start_right_away
    });
  }

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href={`/admin/seasons/${params.slug}`}>
          {params.slug}
        </HeaderAdminBack>
        <HeaderAdminTitle 
          title={<>Add Series <span className="text-gray-3">(5th)</span></>}
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="max-w-container-md mx-auto px-4 pb-8 min-h-[calc(100vh-24rem)]">
        <Box className="mobile:rounded-none mobile:border-0 mobile:bg-black mobile:p-0">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <Input
              {...register("name")}
              label="Name"
              error={errors["name"]?.message}
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

            <Checkbox
              {...register("start_right_away")}
              label="Start the new series right away"
              error={errors["start_right_away"]?.message}
            />
            <Button type="submit" variant="primary" size="lg">
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </form>
        </Box>
      </div>
    </>
  )
}