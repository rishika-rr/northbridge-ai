const chips = [
  "GitLab",
  "HR Policy",
  "Security",
  "Architecture",
  "VPN",
];

export default function SuggestionChips() {
  return (
    <div
      className="
      flex

      justify-center

      gap-3

      flex-wrap
      "
    >
      {chips.map((chip) => (
        <button
          key={chip}
          className="
          px-4

          h-10

          rounded-full

          border

          border-white/6

          bg-white/[0.02]

          text-sm

          text-zinc-400

          hover:text-white

          hover:border-blue-500/30

          hover:bg-blue-500/5

          transition-all
          "
        >
          {chip}
        </button>
      ))}
    </div>
  );
}