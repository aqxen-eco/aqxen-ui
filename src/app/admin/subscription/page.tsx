import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { MdOutlineInfo } from "react-icons/md";

import { getSubscription } from "./functions";
import { SubscriptionForm } from "./subscription-form";

export default async function SubscriptionPage() {
  const response = await getSubscription();

  const defaultValues = {
    duration: response?.duration ?? "",
    unique_issuances: response?.unique_issuances ?? "",
    concurrent_seasons: response?.concurrent_seasons ?? "",
  };

  return (
    <div className="mx-auto max-w-container-md py-8 px-4 space-y-8">
      <header className="flex items-center gap-1">
        <h1 className="text-title-1 text-white">Subscription</h1>
        <Tooltip content="Lorem ipsum dolor sit amed">
          <Button variant="link" size="md" square>
            <MdOutlineInfo className="size-6" />
          </Button>
        </Tooltip>
      </header>
      <SubscriptionForm defaultValues={defaultValues} />
    </div>
  );
}
