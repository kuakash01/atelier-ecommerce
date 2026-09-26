// import { useState, useEffect } from "react";

// const Select = ({
//   options,
//   placeholder = "Select an option",
//   onChange,
//   className = "",
//   value, // <-- added for controlled mode
//   defaultValue = "",
// }) => {
//   const [selectedValue, setSelectedValue] = useState(defaultValue);

//   // if parent passes a controlled value, sync it
//   useEffect(() => {
//     if (value !== undefined) {
//       setSelectedValue(value);
//     }
//   }, [value]);

//   const handleChange = (e) => {
//     const val = e.target.value;
//     setSelectedValue(val);
//     onChange(val);
//   };

//   return (
//     <select
//       className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
//         selectedValue
//           ? "text-gray-800 dark:text-white/90"
//           : "text-gray-400 dark:text-gray-400"
//       } ${className}`}
//       value={selectedValue}
//       onChange={handleChange}
//     >
//       <option
//         value=""
//         disabled
//         className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
//       >
//         {placeholder}
//       </option>
//       {options.map((option) => (
//         <option
//           key={option.value}
//           value={option.value}
//           className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
//         >
//           {option.label}
//         </option>
//       ))}
//     </select>
//   );
// };

// export default Select;

















import { useState, useEffect } from "react";

const Select = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  value,
  defaultValue = "",
  error = false,
  success = false,
  hint,
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  // Sync with controlled value from parent
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setSelectedValue(val);
    onChange(val);
  };

  // Base styles (copied from your Input component)
  let selectClasses = `
    h-11 w-full rounded-lg border appearance-none px-4 py-2.5 pr-11 text-sm
    shadow-theme-xs placeholder:text-gray-400
    focus:outline-hidden focus:ring-3
    dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30
    ${className}
  `;

  // Apply error/success/normal styles (same logic as Input)
  if (error) {
    selectClasses += `
      border-error-500 
      focus:border-error-300 
      focus:ring-error-500/20 
      dark:text-error-400 
      dark:border-error-500 
      dark:focus:border-error-800
    `;
  } else if (success) {
    selectClasses += `
      border-success-500 
      focus:border-success-300 
      focus:ring-success-500/20 
      dark:text-success-400 
      dark:border-success-500 
      dark:focus:border-success-800
    `;
  } else {
    selectClasses += `
      bg-transparent text-gray-800 border-gray-300
      focus:border-brand-300 focus:ring-brand-500/20
      dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800
    `;
  }

  return (
    <div className="relative">
      <select
        className={selectClasses}
        value={selectedValue}
        onChange={handleChange}
      >
        <option
          value=""
          disabled
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {placeholder}
        </option>

        {options?.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Hint Area (Error message / Success message) */}
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Select;
