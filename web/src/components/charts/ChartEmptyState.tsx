export function ChartEmptyState({ message = "Aguardando dados de mercado." }: { message?: string }) {
  return (
    <div className="h-48 flex items-center justify-center rounded-lg bg-[#f5f7f3] text-sm text-[#4a5a52]">
      {message}
    </div>
  );
}
