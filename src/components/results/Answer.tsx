import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  answer: string;
};

export default function Answer({ answer }: Props) {
  return (
    <section>
      <p
        className="
        text-[11px]
        uppercase
        tracking-[0.28em]
        text-blue-400
        font-medium
        "
      >
        Answer
      </p>

      <div
        className="
        mt-7

        rounded-[28px]

        border
        border-white/6

        bg-white/[0.025]

        p-10
        "
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold mb-6 text-white">
                {children}
              </h1>
            ),

            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">
                {children}
              </h2>
            ),

            h3: ({ children }) => (
              <h3 className="text-xl font-semibold mt-6 mb-3 text-white">
                {children}
              </h3>
            ),

            p: ({ children }) => (
              <p className="text-zinc-200 leading-8 mb-5">
                {children}
              </p>
            ),

            ul: ({ children }) => (
              <ul className="list-disc pl-6 space-y-3 mb-5 text-zinc-200">
                {children}
              </ul>
            ),

            ol: ({ children }) => (
              <ol className="list-decimal pl-6 space-y-3 mb-5 text-zinc-200">
                {children}
              </ol>
            ),

            li: ({ children }) => (
              <li className="leading-8">
                {children}
              </li>
            ),

            strong: ({ children }) => (
              <strong className="font-semibold text-white">
                {children}
              </strong>
            ),

            code: ({ children }) => (
              <code
                className="
                rounded-md
                bg-zinc-900
                px-1.5
                py-1

                text-blue-300

                text-sm
                "
              >
                {children}
              </code>
            ),

            blockquote: ({ children }) => (
              <blockquote
                className="
                border-l-4

                border-blue-500

                pl-5

                italic

                text-zinc-300

                my-5
                "
              >
                {children}
              </blockquote>
            ),
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>
    </section>
  );
}