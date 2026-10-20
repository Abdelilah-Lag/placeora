export function ErrorMessage({ message }: { message: string }) {
  return <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>;
}
