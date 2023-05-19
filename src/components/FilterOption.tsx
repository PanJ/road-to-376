import { ChangeEventHandler, PropsWithChildren } from "react";

export type FilterOptionProps = {
  isActive: boolean;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function FilterOption({
  isActive,
  value,
  onChange,
  children,
}: PropsWithChildren<FilterOptionProps>) {
  return (
    <>
      <input
        type="radio"
        name="show"
        id={value}
        className="hidden"
        value={value}
        onChange={(e) => {
          console.log(e);
          onChange(e);
        }}
      />
      {isActive ? (
        <label
          htmlFor={value}
          className="px-4 py-2 text-black bg-gray-300 rounded-full hover:cursor-pointer"
        >
          {children}
        </label>
      ) : (
        <label
          htmlFor={value}
          className="px-4 py-2 bg-gray-600 rounded-full hover:cursor-pointer"
        >
          {children}
        </label>
      )}
    </>
  );
}
