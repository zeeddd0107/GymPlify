import React, { useState, useMemo } from "react";
import { FaFilter, FaTimes, FaSearch, FaChevronDown, FaChevronRight, FaPlus } from "react-icons/fa";

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
  guides = [],
  onSearchChange,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDefaultTargets, setShowDefaultTargets] = useState(true);
  const [showCustomTargets, setShowCustomTargets] = useState(true);

  const handleTargetToggle = (target) => {
    const isSelected = selectedTargets.includes(target);
    if (isSelected) {
      onTargetChange(selectedTargets.filter((t) => t !== target));
    } else {
      onTargetChange([...selectedTargets, target]);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const hasActiveFilters = selectedTargets.length > 0;

  // Separate default and custom targets
  const { defaultTargets, customTargets } = useMemo(() => {
    const custom = availableTargets.filter(
      (target) => !DEFAULT_TARGET_WORKOUTS.includes(target),
    );
    return {
      defaultTargets: DEFAULT_TARGET_WORKOUTS,
      customTargets: custom,
    };
  }, [availableTargets]);

  // Get matching guides based on search term
  const matchingGuides = useMemo(() => {
    if (!searchTerm) return [];
    return guides.filter(guide =>
      guide.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [guides, searchTerm]);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}
    >
      {/* Search Bar */}
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search guide titles..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              if (onSearchChange) onSearchChange("");
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Header */}
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

      {/* Search Results */}
      {searchTerm && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-800 mb-2">
            Found {matchingGuides.length} guide{matchingGuides.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </div>
          {matchingGuides.length > 0 ? (
            <div className="space-y-1">
              {matchingGuides.slice(0, 5).map((guide) => (
                <div key={guide.id} className="text-sm text-blue-700 truncate">
                  • {guide.title}
                </div>
              ))}
              {matchingGuides.length > 5 && (
                <div className="text-xs text-blue-600 italic">
                  ... and {matchingGuides.length - 5} more
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-blue-600">
              No guides found with that title
            </div>
          )}
        </div>
      )}

      {/* Default Targets Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowDefaultTargets(!showDefaultTargets)}
          className="flex items-center gap-2 w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors mb-2"
        >
          {showDefaultTargets ? (
            <FaChevronDown className="w-3 h-3" />
          ) : (
            <FaChevronRight className="w-3 h-3" />
          )}
          <span>Default Targets ({defaultTargets.length})</span>
        </button>
        
        {showDefaultTargets && (
          <div className="flex flex-wrap gap-2">
            {defaultTargets.map((target) => {
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
        )}
      </div>

      {/* Custom Targets Section */}
      {customTargets.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowCustomTargets(!showCustomTargets)}
            className="flex items-center gap-2 w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors mb-2"
          >
            {showCustomTargets ? (
              <FaChevronDown className="w-3 h-3" />
            ) : (
              <FaChevronRight className="w-3 h-3" />
            )}
            <FaPlus className="w-3 h-3 text-primary" />
            <span>Custom Targets ({customTargets.length})</span>
          </button>
          
          {showCustomTargets && (
            <div className="flex flex-wrap gap-2">
              {customTargets.map((target) => {
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
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 border border-blue-200"
                      }
                    `}
                  >
                    {target}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 font-medium">Active filters:</span>
            <span className="text-xs text-gray-400">({selectedTargets.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTargets.map((target) => (
              <span
                key={target}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
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
      )}
    </div>
  );
};

export default TargetWorkoutFilter;
