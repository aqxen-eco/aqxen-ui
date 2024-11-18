import {
  HeaderAdmin,
  HeaderAdminBack,
  HeaderAdminTitle,
} from "@/components/header-admin";

type NewBadgeLayoutProps = {
  children: React.ReactNode;
};

export default async function NewBadgeLayout({
  children,
}: NewBadgeLayoutProps) {
  const defaultValues = {
    name: "",
    symbol: "ASD",
    image: "",
    description: "",
    lifetimeAggregate: true,
    lifetimeStats: true,
  };

  return (
    <>
      <HeaderAdmin>
        <HeaderAdminBack href="/admin/seasons">Season</HeaderAdminBack>
        <HeaderAdminTitle
          title="New Season"
          tooltip="Lorem ipsum dolor sit amed"
          className="max-w-container-md"
        />
      </HeaderAdmin>
      <div className="mx-auto max-w-container-md px-4 space-y-8 min-h-[calc(100vh-24rem)] pb-8">
        {children}
      </div>
    </>
  );
}
