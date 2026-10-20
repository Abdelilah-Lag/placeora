export function LoadingState({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
      <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label}
    </div>
  );
}
