import { parseAsString, parseAsInteger, useQueryStates } from "nuqs";

export const shopParamsParsers = {
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true, shallow: true }),
  category: parseAsString.withDefault("").withOptions({ clearOnDefault: true, shallow: true }),
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true, shallow: true }),
  sort: parseAsString.withDefault("newest").withOptions({ clearOnDefault: true, shallow: true }),
  view: parseAsString.withDefault("grid").withOptions({ clearOnDefault: true, shallow: true }),
};

export function useShopParams() {
  return useQueryStates(shopParamsParsers);
}
