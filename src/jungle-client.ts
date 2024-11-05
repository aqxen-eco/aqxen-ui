import { CHAIN_API_URL } from "@/constants";
import { APIClient } from "@wharfkit/antelope";

export const jungleClient = new APIClient({
  url: CHAIN_API_URL,
});
