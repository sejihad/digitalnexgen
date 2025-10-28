import React from "react";

const InputField = ({
  label,
  id,
  type,
  name,
  value,
  required,
  accept,
  onChange,
}) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="text-primaryText dark:text-[#ededed] font-openSans font-semibold"
    >
      {label}
    </label>
    <input
      className="bg-inherit border border-colorNeonPink focus:outline-none focus:shadow-focusNeonPink px-2 py-2 rounded-md text-primaryText dark:text-[#ededed]"
      id={id}
      type={type}
      name={name}
      value={value}
      required={required}
      accept={accept}
      onChange={onChange}
    />
  </div>
);

export default InputField;
