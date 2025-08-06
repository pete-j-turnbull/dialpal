import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

const variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
};

const Component = () => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <button aria-label="Copy code snippet" onClick={copy}>
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div
            key="checkmark"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <CheckIcon />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <CopyIcon />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

/**
 * A vertically stacked set of interactive headings that each reveal a section
 * of content.
 */
const meta = {
  title: "test",
  component: Component,
  tags: ["autodocs"],
  render: (args) => <Component />,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default behavior of the accordion allows only one item to be open.
 */
export const Default: Story = {};
