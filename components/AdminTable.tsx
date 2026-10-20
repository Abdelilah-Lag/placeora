import { ReactNode } from "react";

export function AdminTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white shadow-sm"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-700"><tr>{headers.map((header) => (<th key={header} className="px-4 py-3 font-medium">{header}</th>))}</tr></thead><tbody>{rows.length ? rows.map((row, idx) => (<tr key={idx} className="border-t border-slate-100 align-top">{row.map((cell, cellIdx) => (<td key={`${idx}-${cellIdx}`} className="px-4 py-3 text-slate-700">{cell}</td>))}</tr>)) : <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-slate-500">Aucune donnée disponible.</td></tr>}</tbody></table></div>
  );
}