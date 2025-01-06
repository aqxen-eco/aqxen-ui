import { useId } from "react";
import {
  MdErrorOutline,
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md";

type CheckboxProps = {
  label: string;
  error?: string;
} & React.ComponentProps<"input">;

export function Checkbox({ label, error, ref, ...restProps }: CheckboxProps) {
  const id = useId();

  return (
    <div className="group/input" data-error={!!error}>
      <div className="flex gap-2 items-center border-b border-gray-3 focus-within:border-white group-data-[error=true]/input:border-red-600">
        <label
          htmlFor={id}
          className="flex-1 select-none text-body-2 font-medium text-white flex gap-1 cursor-pointer group-data-[error=true]/input:text-red-600 py-4"
        >
          {label}
        </label>
        <div className="relative pr-2">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className="appearance-none cursor-pointer absolute size-full z-10 peer"
            {...restProps}
          />
          <MdOutlineCheckBox className="size-6 peer-checked:block hidden" />
          <MdOutlineCheckBoxOutlineBlank className="size-6 peer-checked:hidden block" />
        </div>
        {error && <MdErrorOutline className="size-6 text-red-600" />}
      </div>
      {error && (
        <p className="mt-2 group-data-[error=true]/input:text-red-600 text-body-3">
          {error}
        </p>
      )}
    </div>
  );
}
