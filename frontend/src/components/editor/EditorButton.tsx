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
        "transition all ease-in-out rounded border p-1",
        active ? "bg-blue-500 text-white" : ""
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default EditorButton;
