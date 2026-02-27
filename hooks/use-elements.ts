import type { Element } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

const API_URL =
  "https://api.dedolist.com/api/v1/science/periodic-table-detailed/";

async function fetchElements(): Promise<Element[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`Failed to fetch elements: ${res.status}`);
  const json = await res.json();
  // API returns an array where numeric key is `number` — map to `atomicNumber` for compatibility
  return (json as any[]).map(e => ({ ...e, atomicNumber: e.number }));
}

export function useElements() {
  return useQuery<Element[], Error>({
    queryKey: ["elements"],
    queryFn: fetchElements,
    staleTime: 1000 * 60 * 60,
  });
}
