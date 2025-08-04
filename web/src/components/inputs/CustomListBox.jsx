import React from "react";
import { Listbox } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";

/**
 * Reusable CustomListBox Component
 * @param {Object} props - Component props
 * @param {Array} props.options - Array of options with {id, name} structure
 * @param {Object} props.selectedValue - Currently selected option
 * @param {Function} props.onChange - Function called when selection changes
 * @param {string} props.label - Label for the listbox
 * @param {string} props.placeholder - Placeholder text when no option is selected
 * @param {boolean} props.disabled - Whether the listbox is disabled
 * @param {string} props.className - Additional CSS classes
 */
const CustomListBox = ({
  options = [],
  selectedValue,
  onChange,
  label,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}) => {
  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* ListBox */}
      <Listbox value={selectedValue} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saveButton focus:border-transparent bg-white text-left flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed">
            <span className={selectedValue ? "text-gray-900" : "text-gray-500"}>
              {selectedValue ? selectedValue.name : placeholder}
            </span>
            <FaChevronDown className="w-4 h-4 text-gray-400" />
          </Listbox.Button>

          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <Listbox.Option
                key={option.id}
                value={option}
                className={({ active }) =>
                  `cursor-pointer select-none px-4 py-2 ${
                    active ? "bg-saveButton text-white" : "text-gray-900"
                  }`
                }
              >
                {option.name}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

export default CustomListBox;
