export function LiveBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        connected ? "text-[#174f3d]" : "text-[#754600]"
      }`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`h-2 w-2 rounded-full ${
          connected ? "bg-[#174f3d]" : "bg-[#f5ac45]"
        }`}
        aria-hidden="true"
      />
      {connected ? "Tempo real" : "Atualização periódica"}
    </span>
  );
}
