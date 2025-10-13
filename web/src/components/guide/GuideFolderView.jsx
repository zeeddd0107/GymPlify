import React, { useState } from "react";
import {
  FaPlay,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
} from "react-icons/fa";

const GuideFolderView = ({ guides, selectedTargets, onGuideClick }) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  // Group guides by target workout
  const groupedGuides = guides.reduce((acc, guide) => {
    const targets = Array.isArray(guide.target)
      ? guide.target
      : guide.target
        ? [guide.target]
        : [];

    targets.forEach((target) => {
      if (!acc[target]) {
        acc[target] = [];
      }
      acc[target].push(guide);
    });

    return acc;
  }, {});

  // Filter folders based on selected targets
  const filteredFolders =
    selectedTargets.length > 0
      ? Object.keys(groupedGuides).filter((target) =>
          selectedTargets.includes(target),
        )
      : Object.keys(groupedGuides);

  const toggleFolder = (target) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [target]: !prev[target],
    }));
  };

  const getFolderIcon = (target, isExpanded) => {
    if (isExpanded) {
      return <FaFolderOpen className="w-4 h-4 text-primary" />;
    }
    return <FaFolder className="w-4 h-4 text-gray-500" />;
  };

  const getTargetColor = (target) => {
    const colors = {
      Shoulders: "bg-orange-100 text-orange-700 border-orange-200",
      Back: "bg-blue-100 text-blue-700 border-blue-200",
      Chest: "bg-red-100 text-red-700 border-red-200",
      Arms: "bg-purple-100 text-purple-700 border-purple-200",
      Legs: "bg-green-100 text-green-700 border-green-200",
      Core: "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Full Body": "bg-indigo-100 text-indigo-700 border-indigo-200",
      Cardio: "bg-pink-100 text-pink-700 border-pink-200",
    };

    // For custom targets, use a default color scheme
    if (colors[target]) {
      return colors[target];
    }

    // Generate a consistent color for custom targets based on the target name
    const customColors = [
      "bg-teal-100 text-teal-700 border-teal-200",
      "bg-cyan-100 text-cyan-700 border-cyan-200",
      "bg-emerald-100 text-emerald-700 border-emerald-200",
      "bg-lime-100 text-lime-700 border-lime-200",
      "bg-amber-100 text-amber-700 border-amber-200",
      "bg-rose-100 text-rose-700 border-rose-200",
      "bg-violet-100 text-violet-700 border-violet-200",
      "bg-sky-100 text-sky-700 border-sky-200",
    ];

    // Use a simple hash to consistently assign colors to custom targets
    const hash = target.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return (
      customColors[Math.abs(hash) % customColors.length] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  if (filteredFolders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <FaFolder className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No guides found
        </h3>
        <p className="text-gray-500">
          {selectedTargets.length > 0
            ? "No guides match your selected filters. Try adjusting your filter criteria."
            : "No workout guides available yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredFolders.map((target) => {
        const guides = groupedGuides[target];
        const isExpanded = expandedFolders[target];
        const guideCount = guides.length;

        return (
          <div
            key={target}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Folder Header */}
            <button
              onClick={() => toggleFolder(target)}
              className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {getFolderIcon(target, isExpanded)}
                <div className="text-left min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {target} Workouts
                  </h3>
                  <p className="text-sm text-gray-500">
                    {guideCount} {guideCount === 1 ? "guide" : "guides"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getTargetColor(target)} hidden sm:inline-block`}
                >
                  {target}
                </span>
                {isExpanded ? (
                  <FaChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <FaChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>

            {/* Folder Content */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {guides.map((guide) => (
                      <div
                        key={guide.id}
                        onClick={() => onGuideClick(guide)}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            {guide.videoUrl ? (
                              <video
                                src={guide.videoUrl}
                                className="w-full h-full object-cover rounded-lg"
                                muted
                              />
                            ) : (
                              <FaPlay className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 break-words">
                              {guide.title}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              {guide.sets && (
                                <span className="text-xs text-gray-500">
                                  {guide.sets} sets
                                </span>
                              )}
                              {guide.reps && (
                                <span className="text-xs text-gray-500">
                                  {guide.reps} reps
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  guide.status === "Published"
                                    ? "bg-green-100 text-green-700"
                                    : guide.status === "Draft"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {guide.status || "Draft"}
                              </span>
                              {guide.category && (
                                <span className="text-xs text-gray-500 truncate">
                                  {guide.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GuideFolderView;
