import { motion } from "framer-motion";

export default function HeroTitle() {
  return (

    <motion.div

      initial={{
        opacity:0,
        y:15,
      }}

      animate={{
        opacity:1,
        y:0,
      }}

      transition={{
        delay:.1,
      }}

      className="
      text-center

      max-w-[760px]
      "
    >

      <p
        className="
        uppercase

        tracking-[0.45em]

        text-[11px]

        text-blue-400

        font-medium
        "
      >
        NORTHBRIDGE AI
      </p>

      <h1
        className="
        mt-5

        text-[64px]

        leading-[1.02]

        tracking-[-0.05em]

        font-bold
        "
      >
        Search trusted
        <br />
        company knowledge
      </h1>

      <p
        className="
        mt-8

        text-[22px]

        leading-10

        text-zinc-400
        "
      >
        Find answers across engineering documentation,
        GitHub,
        HR policies,
        Confluence,
        architecture,
        onboarding,
        and your enterprise knowledge base.
      </p>

    </motion.div>

  );
}