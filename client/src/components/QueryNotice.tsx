import { Button } from "./ui/Button";
export function QueryNotice({ retry, busy, stale = false }: { retry: () => void; busy?: boolean; stale?: boolean }) {
  return <div role="alert" className="my-4 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-surface-800">
    <p className="font-semibold">{stale ? "Couldn’t refresh your visits" : "Couldn’t load your visits"}</p>
    <p className="mt-1">{stale ? "Showing the last loaded information. It may be out of date." : "Check your connection and try again. Your visits have not been removed."}</p>
    <Button className="mt-3" size="sm" variant="secondary" isLoading={busy} onClick={retry}>Try again</Button>
  </div>;
}
