import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(20),
  username: parseAsString,
  role: parseAsString,
  creatorUsername: parseAsString,
  status: parseAsString,
  sort: parseAsString,
};

export const searchParamsCache = createSearchParamsCache(searchParams);
