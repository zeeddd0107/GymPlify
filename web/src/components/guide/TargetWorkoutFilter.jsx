import React from "react";
import { FaFilter, FaTimes } from "react-icons/fa";

const DEFAULT_TARGET_WORKOUTS = [
  "Shoulders",
  "Back",
  "Chest",
  "Arms",
  "Legs",
  "Core",
  "Full Body",
  "Cardio",
];

const TargetWorkoutFilter = ({
  selectedTargets,
  onTargetChange,
  onClearFilters,
  availableTargets = [],
  className = "",
}) => {
  const handleTargetToggle = (target) => {
    const isSelected = selectedTargets.includes(target);
    if (isSelected) {
      onTargetChange(selectedTargets.filter((t) => t !== target));
    } else {
      onTargetChange([...selectedTargets, target]);
    }
  };

  const hasActiveFilters = selectedTargets.length > 0;

  // Combine default targets with custom targets from database
  const allTargets = React.useMemo(() => {
    const customTargets = availableTargets.filter(
      (target) => !DEFAULT_TARGET_WORKOUTS.includes(target),
    );
    return [...DEFAULT_TARGET_WORKOUTS, ...customTargets];
  }, [availableTargets]);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500 w-4 h-4" />
          <h3 className="text-sm font-semibold text-gray-700">
            Filter by Target Workout
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors self-start sm:self-auto"
          >
            <FaTimes className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {allTargets.map((target) => {
          const isSelected = selectedTargets.includes(target);
          return (
            <button
              key={target}
              onClick={() => handleTargetToggle(target)}
              className={`
                px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                ${
                  isSelected
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }
              `}
            >
              {target}
            </button>
          );
        })}
      </div>

      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            <div className="flex flex-wrap gap-1">
              {selectedTargets.map((target) => (
                <span
                  key={target}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {target}
                  <button
                    onClick={() => handleTargetToggle(target)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <FaTimes className="w-2 h-2" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetWorkoutFilter;
