"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { Badge } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrganization } from "./actions";

const organizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo: z.string().min(1, "Logo is required"),
});

type OrganizationSchema = z.infer<typeof organizationSchema>;

export function OrganizationForm({
  defaultValues,
}: { defaultValues?: OrganizationSchema }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationSchema>({
    resolver: zodResolver(organizationSchema),
    defaultValues,
  });

  async function onSubmit({ name, logo }: OrganizationSchema) {
    await createOrganization({ name, logo });
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
          defaultValue={defaultValues?.name}
        />
        <Input
          {...register("logo")}
          label="Logo IPFS Image hash"
          error={errors["logo"]?.message}
          defaultValue={defaultValues?.logo}
        />
        <Button type="submit" variant="primary" size="lg">
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
      <div className="desktop:col-span-2 p-8 mobile:p-4 space-y-4 border-l mobile:border border-gray-2 mobile:rounded-2xl mobile:bg-gray-1">
        <h2 className="text-title-2 text-white">Organization preview</h2>
        <Badge name="Organization Name" balance="ORGN" />
        <hr className="border-t border-gray-2" />
        <div className="flex justify-between py-2">
          <p className="text-body-2 text-white">Active users</p>
          <p className="text-body-2 text-white">48</p>
        </div>
      </div>
    </Box>
  );
}
