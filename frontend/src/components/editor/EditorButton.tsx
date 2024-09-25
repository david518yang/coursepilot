import { Button } from "@headlessui/react";
import clsx from "clsx";

const EditorButton = ({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
}) => {
  return (
    <Button
      className={clsx(
        "transition all ease-in-out rounded p-1 hover:outline outline-border",
        active ? "bg-blue-500 text-white" : ""
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default EditorButton;
