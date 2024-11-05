import { forwardRef, useId } from "react";
import { MdErrorOutline } from "react-icons/md";

type InputComponentProps = {
  label?: string;
  error?: string;
} & React.ComponentProps<"input">;

function InputComponent(
  { label, error, ...restProps }: InputComponentProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const id = useId();

  return (
    <div className="group/input" data-error={!!error}>
      {label && (
        <label
          htmlFor={id}
          className="text-body-2 font-medium text-white block cursor-pointer group-data-[error=true]/input:text-red-600"
        >
          {label}
        </label>
      )}
      <div className="border-b border-gray-3 focus-within:border-white flex gap-1 items-center group-data-[error=true]/input:border-red-600">
        <input
          ref={forwardedRef}
          id={id}
          className="flex-1 text-body-2 placeholder-gray-3 text-white pt-2 pb-[calc(1rem-1px)] bg-transparent focus:outline-0"
          {...restProps}
        />
        {error && <MdErrorOutline className="size-6 text-red-600" />}
      </div>
      {error && (
        <p className="mt-2 text-body-3 group-data-[error=true]/input:text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(InputComponent);
