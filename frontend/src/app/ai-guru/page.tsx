import { redirect } from "next/navigation";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type AIGuruAliasPageProps = {
  searchParams: Promise<SearchParams>;
};

function appendSearchParams(params: URLSearchParams, key: string, value: string | string[] | undefined) {
  if (typeof value === "string") {
    params.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => {
      params.append(key, entry);
    });
  }
}

export default async function AIGuruAliasPage({ searchParams }: AIGuruAliasPageProps) {
  const resolvedParams = await searchParams;
  const query = new URLSearchParams();

  Object.entries(resolvedParams).forEach(([key, value]) => {
    appendSearchParams(query, key, value);
  });

  const queryString = query.toString();
  redirect(queryString ? `/chat?${queryString}` : "/chat");
}