const chips = [
  { label: "GitLab", question: "What is GitLab and how is the company organised?" },
  { label: "HR Policy", question: "What are the main HR policies I should know about?" },
  { label: "Security", question: "What are the security practices employees must follow?" },
  { label: "Architecture", question: "How is the system architecture described?" },
  { label: "VPN", question: "How do I get VPN access?" },
];

export default function SuggestionChips({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div className="flex justify-center gap-3 flex-wrap">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={() => onPick(chip.question)}
          title={chip.question}
          className="
          px-4 h-10 rounded-full border border-white/6 bg-white/[0.02]
          text-sm text-zinc-400
          hover:text-white hover:border-blue-500/30 hover:bg-blue-500/5
          transition-all
          "
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
