interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function AdminTable<T>({
  columns,
  data,
  keyField,
  onRowClick,
  emptyMessage = "Nenhum registro encontrado",
}: AdminTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-brand-border bg-brand-card p-12">
        <p className="text-sm text-brand-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-brand-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-brand-muted ${col.className ?? ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={String(row[keyField])}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-brand-border last:border-b-0 transition-colors ${
                onRowClick ? "cursor-pointer hover:bg-white/[0.03]" : ""
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-sm ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
