import { getOrganization } from "./functions";
import { OrganizationForm } from "./organization-form";

export default async function OrganizationPage() {
  const response = await getOrganization();

  const defaultValues = {
    name: response?.name ?? "",
    logo: response?.logo ?? "",
  };

  return (
    <div className="mx-auto max-w-container-md py-8 px-4 space-y-8">
      <h1 className="text-title-1 text-white">Organization</h1>
      <OrganizationForm defaultValues={defaultValues} />
    </div>
  );
}
