import React, { useState, useEffect, useMemo } from "react";
import {
  FaPlay,
  FaUpload,
  FaCheck,
  FaTimes,
  FaTh,
  FaFolder,
  FaSearch,
  FaChevronDown,
  FaChevronRight,
  FaPlus,
} from "react-icons/fa";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/config/firebase";
import {
  EditModal,
  FormInput,
  FormSelect,
  FormFileUpload,
  EditDeleteButtons,
  TargetWorkoutFilter,
  GuideFolderView,
  ToastNotification,
} from "@/components";
import { DeleteModal } from "@/components/modals";
import guideService from "@/services/guideService";
import { useAuth } from "@/context";

const Guide = () => {
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedInstructions, setExpandedInstructions] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [abortController, setAbortController] = useState(null);
  const [preUploaded, setPreUploaded] = useState({ url: "", path: "" });
  const handleCancel = async () => {
    // If uploading in progress, abort and keep modal open
    if (abortController && uploadProgress > 0 && uploadProgress < 100) {
      try {
        abortController.abort();
      } catch (err) {
        console.debug("AbortController abort failed:", err);
      }
      // Keep the modal open; reset saving and progress state
      setSaving(false);
      setUploadProgress(0);
      setAbortController(null);
      return;
    }
    // If an upload is completed but not yet submitted, clear the pre-uploaded asset and keep modal open
    if (preUploaded.url && uploadProgress === 100) {
      // Delete the orphaned uploaded file since user canceled before committing
      try {
        if (preUploaded.path) {
          await deleteObject(ref(storage, preUploaded.path));
          console.log(
            "Deleted pre-uploaded video on cancel:",
            preUploaded.path,
          );
        }
      } catch (err) {
        console.error("Failed to delete pre-uploaded file on cancel:", err);
      }
      setPreUploaded({ url: "", path: "" });
      setUploadProgress(0);
      return;
    }
    // Otherwise just close the modal
    if (editing?.id) {
      // Return to viewing modal when canceling edit
      setViewing(editing);
    }
    setEditing(null);
  };

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    item: null,
  });
  const [deleting, setDeleting] = useState(false);
  // Smart toast notification system
  const [activeToasts, setActiveToasts] = useState([]);

  // Function to add a new toast with smart grouping
  const addToast = (message, type = "success") => {
    const toastId = Date.now() + Math.random();
    
    setActiveToasts(prev => {
      // Limit to maximum 3 toasts at once
      if (prev.length >= 3) {
        // Remove oldest toast to make room
        const sortedToasts = [...prev].sort((a, b) => a.timestamp - b.timestamp);
        const filteredToasts = prev.filter(toast => toast.id !== sortedToasts[0].id);
        
        const newToast = { 
          id: toastId, 
          message, 
          type,
          timestamp: Date.now()
        };
        
        return [...filteredToasts, newToast];
      }
      
      // Check for similar operations and group them
      const similarToast = prev.find(toast => 
        toast.message === message && 
        toast.type === type &&
        (Date.now() - toast.timestamp) < 1000 // Within 1 second
      );
      
      if (similarToast) {
        // Update existing toast with count
        const updatedToasts = prev.map(toast => 
          toast.id === similarToast.id 
            ? { ...toast, count: (toast.count || 1) + 1, timestamp: Date.now() }
            : toast
        );
        return updatedToasts;
      }
      
      // Add new toast
      const newToast = { 
        id: toastId, 
        message, 
        type,
        timestamp: Date.now(),
        count: 1
      };
      
      return [...prev, newToast];
    });
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(toast => toast.id !== toastId));
    }, 3000);
  };

  // Function to remove a specific toast
  const removeToast = (toastId) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== toastId));
  };
  const [validationErrors, setValidationErrors] = useState({});

  // Filter state
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'folder'
  const [customTarget, setCustomTarget] = useState("");
  const [customTargets, setCustomTargets] = useState([]);
  const [showCustomTargets, setShowCustomTargets] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [subcategoryInput, setSubcategoryInput] = useState("");
  const [showSubcategorySuggestions, setShowSubcategorySuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Main target workout categories (required)
  const MAIN_TARGET_CATEGORIES = [
    "Shoulders",
    "Back", 
    "Chest",
    "Arms",
    "Legs",
    "Core",
    "Full Body",
    "Cardio",
  ];

  // Helper function to show error notifications
  const showErrorNotification = (message) => {
    addToast(message, "error");
  };

  // Helper function to add target with optional subcategory
  const addTargetWithSubcategory = () => {
    if (!selectedMainCategory) {
      showErrorNotification("Please select a main category first");
      return;
    }

    const currentTargets = editing.target || [];
    let targetName = selectedMainCategory;
    
    // Add subcategory if provided
    if (subcategoryInput.trim()) {
      targetName = `${selectedMainCategory} - ${subcategoryInput.trim()}`;
    }

    // Check if target already exists
    if (currentTargets.includes(targetName)) {
      showErrorNotification("This target workout already exists");
      return;
    }

    setEditing((s) => ({
      ...s,
      target: [...currentTargets, targetName],
    }));

    // Reset form
    setSelectedMainCategory("");
    setSubcategoryInput("");
  };

  // Helper function to remove target
  const removeTarget = (targetToRemove) => {
    const currentTargets = editing.target || [];
    setEditing((s) => ({
      ...s,
      target: currentTargets.filter((target) => target !== targetToRemove),
    }));
  };

  // Extract existing subcategories for a given main category
  const getExistingSubcategories = (mainCategory) => {
    const subcategories = new Set();
    
    // Get subcategories from all guides
    guides.forEach((guide) => {
      const guideTargets = Array.isArray(guide.target) ? guide.target : guide.target ? [guide.target] : [];
      guideTargets.forEach((target) => {
        if (target.includes(' - ')) {
          const [category, subcategory] = target.split(' - ');
          if (category === mainCategory && subcategory) {
            subcategories.add(subcategory.trim());
          }
        }
      });
    });

    // Get subcategories from custom targets
    if (Array.isArray(customTargets)) {
      customTargets.forEach((target) => {
        if (target.includes(' - ')) {
          const [category, subcategory] = target.split(' - ');
          if (category === mainCategory && subcategory) {
            subcategories.add(subcategory.trim());
          }
        }
      });
    }

    return Array.from(subcategories).sort();
  };

  // Get existing subcategories for the selected main category
  const existingSubcategories = useMemo(() => {
    if (!selectedMainCategory) return [];
    return getExistingSubcategories(selectedMainCategory);
  }, [selectedMainCategory, guides, customTargets]);

  // Handle subcategory selection from suggestions
  const selectSubcategory = (subcategory) => {
    setSubcategoryInput(subcategory);
    setShowSubcategorySuggestions(false);
  };

  // Handle main category change
  const handleMainCategoryChange = (category) => {
    setSelectedMainCategory(category);
    setSubcategoryInput(""); // Clear subcategory when main category changes
    setShowSubcategorySuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSubcategorySuggestions && !event.target.closest('.subcategory-suggestions')) {
        setShowSubcategorySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSubcategorySuggestions]);

  // Load guides from Firebase
  useEffect(() => {
    const loadGuides = async () => {
      try {
        console.log("Loading guides...");
        console.log("Firebase config check:", {
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "Set" : "Missing",
        });
        setLoading(true);
        const guidesData = await guideService.getAllGuides();
        console.log("Loaded guides:", guidesData);
        setGuides(guidesData);

        // Load custom targets separately to avoid blocking guide loading
        guideService
          .getCustomTargets()
          .then((customTargetsData) => {
            console.log("Loaded custom targets:", customTargetsData);
            setCustomTargets(customTargetsData);
          })
          .catch((customTargetsError) => {
            console.warn("Failed to load custom targets:", customTargetsError);
            setCustomTargets([]);
          });
      } catch (error) {
        console.error("Error loading guides:", error);
        console.error("Error details:", error.message);
        showErrorNotification(`Failed to load guides: ${error.message}`);
        // Fallback to default guides if Firebase fails
        setGuides([
          {
            id: "treadmill",
            title: "Treadmill Usage Guide",
            instructions:
              "Learn how to properly use the treadmill for maximum safety and effectiveness.",
            sets: "3-4",
            reps: "20-30 minutes",
            target: "Legs",
            category: "Treadmill",
            status: "Published",
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: "system",
          },
          {
            id: "weight",
            title: "Weight Training Basics",
            instructions:
              "Essential techniques for safe and effective weight training.",
            sets: "3-4",
            reps: "8-12",
            target: "Arms",
            category: "Dumbbells",
            status: "Published",
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: "system",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadGuides();
  }, []);

  const openEdit = (guide) => {
    setEditing({
      ...guide,
      status: guide.status || "Published",
      target: Array.isArray(guide.target)
        ? guide.target
        : guide.target
          ? [guide.target]
          : [],
      videoFile: null,
      videoName: guide.videoName || "",
      videoSizeMB: guide.videoSizeMB || "",
    });
    setExpandedInstructions(false);
    // Reset any previous pre-upload state when opening modal
    setPreUploaded({ url: "", path: "" });
    setUploadProgress(0);
    setValidationErrors({});
  };

  const openCreate = async () => {
    // Clean up any existing pre-uploaded video before opening new create modal
    if (preUploaded.url && preUploaded.path) {
      try {
        await deleteObject(ref(storage, preUploaded.path));
        console.log(
          "Deleted pre-uploaded video before opening new create modal:",
          preUploaded.path,
        );
      } catch (err) {
        console.warn(
          "Failed to delete pre-uploaded file before opening new create modal:",
          err,
        );
      }
    }

    setEditing({
      id: null,
      title: "",
      target: [],
      category: "",
      instructions: "",
      sets: "",
      reps: "",
      status: "",
      videoFile: null,
      videoName: "",
      videoSizeMB: "",
    });
    // Also reset pre-upload state for new create
    setPreUploaded({ url: "", path: "" });
    setUploadProgress(0);
    setValidationErrors({});
  };

  const onSave = async () => {
    if (!user) {
      showErrorNotification("Please log in to save guides");
      return;
    }

    // Validation
    const errors = {};
    if (!editing.title || editing.title.trim() === "") {
      errors.title = "Guide Title is required";
    }
    if (!editing.category || editing.category === "") {
      errors.category = "Equipment Category is required";
    }
    if (!editing.instructions || editing.instructions.trim() === "") {
      errors.instructions = "Instructions are required";
    }
    if (!editing.status || editing.status === "") {
      errors.status = "Status is required";
    }
    if (!editing.target || editing.target.length === 0) {
      errors.target = "At least one target workout is required";
    }
    if (!editing.videoFile && !editing.videoUrl && !preUploaded.url) {
      errors.video = "Video upload is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear validation errors if validation passes
    setValidationErrors({});

    console.log("Saving guide:", editing);
    console.log("User:", user);
    console.log("User UID:", user.uid);

    setSaving(true);
    // Step 1: If there is a new file and it hasn't been uploaded yet, upload only
    if (editing?.videoFile && !preUploaded.url) {
      const controller = new AbortController();
      setAbortController(controller);
      try {
        const file = editing.videoFile;
        // Create unique path using timestamp + random string for each video upload
        // This ensures unlimited video uploads without overwriting previous ones
        const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const safeFileName = file.name.replace(/[^a-zA-Z0-9\s.-]/g, "").replace(/\s+/g, "_");
        const path = `guides/${uniqueId}_${safeFileName}`;
        const task = uploadBytesResumable(ref(storage, path), file, {
          contentType: file.type || "video/mp4",
        });

        // Tie the AbortController to the Firebase upload task so Cancel stops immediately
        const cancelUpload = () => {
          try {
            task.cancel();
          } catch (err) {
            console.debug("Upload task cancel failed:", err);
          }
        };
        if (controller.signal.aborted) {
          cancelUpload();
          throw new Error("Upload canceled");
        }
        controller.signal.addEventListener("abort", cancelUpload, {
          once: true,
        });

        await new Promise((resolve, reject) =>
          task.on(
            "state_changed",
            (snap) => {
              const pct = Math.round(
                (snap.bytesTransferred / snap.totalBytes) * 100,
              );
              setUploadProgress(pct);
            },
            (err) => {
              controller.signal.removeEventListener("abort", cancelUpload);
              reject(err);
            },
            () => {
              controller.signal.removeEventListener("abort", cancelUpload);
              resolve();
            },
          ),
        );
        const url = await getDownloadURL(task.snapshot.ref);
        setPreUploaded({ url, path });
        setSaving(false);
        setAbortController(null);
        return; // Wait for second click to commit to Firestore
      } catch (error) {
        console.error("Error uploading video:", error);
        setSaving(false);
        setAbortController(null);
        if (!/cancell?ed|canceled/i.test(error?.message || "")) {
          showErrorNotification(`Failed to upload video: ${error.message}`);
        }
        return;
      }
    }

    // Step 2: Commit to Firestore (use preUploaded url/path if available)
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Build payloads that avoid re-uploading if we already have a preUploaded URL
      const { videoFile: _ignoredVideoFile, ...restEditing } = editing || {};

      if (editing.id) {
        // Update existing guide
        console.log("Updating existing guide...");
        const updatedGuide = await guideService.updateGuide(
          editing.id,
          {
            ...restEditing,
            videoUrl: preUploaded.url || editing.videoUrl,
            videoPath: preUploaded.path || editing.videoPath,
          },
          user.uid,
          (pct) => setUploadProgress(pct),
          user.displayName || user.email || "Unknown User",
          controller.signal,
        );
        setGuides((prev) =>
          prev.map((g) => (g.id === editing.id ? updatedGuide : g)),
        );
        addToast("Guide updated successfully!");
      } else {
        // Create new guide
        console.log("Creating new guide...");
        console.log("Guide data being sent:", {
          title: editing.title,
          target: editing.target,
          category: editing.category,
          instructions: editing.instructions,
          sets: editing.sets,
          reps: editing.reps,
          status: editing.status,
          createdBy: user.uid,
        });

        const newGuide = await guideService.createGuide(
          {
            ...restEditing,
            videoUrl: preUploaded.url,
            videoPath: preUploaded.path,
          },
          user.uid,
          (pct) => setUploadProgress(pct),
          user.displayName || user.email || "Unknown User",
          controller.signal,
        );
        console.log("Created guide:", newGuide);
        setGuides((prev) => [newGuide, ...prev]);
        addToast("Guide uploaded successfully!");
      }
      setEditing(null);
    } catch (error) {
      console.error("Error saving guide:", error);
      console.error("Error details:", error.message);
      if (error && /cancell?ed|canceled/i.test(error.message)) {
        // Swallow cancellation alerts; user intentionally canceled
      } else {
        showErrorNotification(`Failed to save guide: ${error.message}`);
      }
    } finally {
      setSaving(false);
      setUploadProgress(0);
      setAbortController(null);
    }
  };

  const onDelete = (guide) => setConfirmDelete({ open: true, item: guide });

  const confirmDeleteGuide = async () => {
    const guide = confirmDelete.item;
    if (!guide) return;
    try {
      setDeleting(true);
      await guideService.deleteGuide(guide.id);
      setGuides((prev) => prev.filter((g) => g.id !== guide.id));
      
      // Refresh custom targets after deletion (cleanup may have removed unused ones)
      try {
        const updatedCustomTargets = await guideService.getCustomTargets();
        setCustomTargets(updatedCustomTargets);
        console.log("Refreshed custom targets after guide deletion:", updatedCustomTargets);
      } catch (customTargetsError) {
        console.warn("Failed to refresh custom targets after guide deletion:", customTargetsError);
      }
      
      addToast("Guide deleted successfully!");
    } catch (error) {
      console.error("Error deleting guide:", error);
      showErrorNotification("Failed to delete guide. Please try again.");
    } finally {
      setDeleting(false);
      setConfirmDelete({ open: false, item: null });
    }
  };

  // Extract all available target workouts from guides
  const availableTargets = useMemo(() => {
    const targets = new Set();
    guides.forEach((guide) => {
      const guideTargets = Array.isArray(guide.target)
        ? guide.target
        : guide.target
          ? [guide.target]
          : [];
      guideTargets.forEach((target) => targets.add(target));
    });
    // Add custom targets from database (with safety check)
    if (Array.isArray(customTargets)) {
      customTargets.forEach((target) => targets.add(target));
    }
    return Array.from(targets);
  }, [guides, customTargets]);

  // Filter guides based on selected targets and search term
  const filteredGuides = guides.filter((guide) => {
    // Filter by search term (guide title)
    if (searchTerm && !guide.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by selected targets
    if (selectedTargets.length === 0) return true;

    const guideTargets = Array.isArray(guide.target)
      ? guide.target
      : guide.target
        ? [guide.target]
        : [];
    return selectedTargets.some((target) => guideTargets.includes(target));
  });

  const handleTargetChange = (targets) => {
    setSelectedTargets(targets);
  };

  const handleClearFilters = () => {
    setSelectedTargets([]);
    setSearchTerm("");
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };


  const handleAddCustomTarget = () => {
    if (customTarget.trim() && !editing.target?.includes(customTarget.trim())) {
      const currentTargets = editing.target || [];
      setEditing((s) => ({
        ...s,
        target: [...currentTargets, customTarget.trim()],
      }));
      setCustomTarget("");
    }
  };

  return (
    <div className="pl-1 pt-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaTh className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("folder")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "folder"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaFolder className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={openCreate}
            className="px-4 sm:px-5 py-2 sm:py-3 bg-primary hover:bg-secondary text-white rounded-xl shadow text-sm flex-1 sm:flex-none"
          >
            Upload Guide
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <TargetWorkoutFilter
          selectedTargets={selectedTargets}
          onTargetChange={handleTargetChange}
          onClearFilters={handleClearFilters}
          availableTargets={availableTargets}
          guides={guides}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* Guides Display */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading guides...</p>
        </div>
      ) : viewMode === "folder" ? (
        <GuideFolderView
          guides={filteredGuides}
          selectedTargets={selectedTargets}
          onGuideClick={setViewing}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGuides.map((g) => (
            <div
              key={g.id}
              onClick={() => setViewing(g)}
              className="bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden flex flex-col h-full transform transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
            >
              <div className="h-48 bg-primary rounded-t-2xl flex items-center justify-center overflow-hidden">
                {g.videoUrl ? (
                  <video
                    src={g.videoUrl}
                    className="w-full h-full video-portrait"
                    muted
                    controls
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center text-primary">
                    <FaPlay className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                    {g.title}
                  </h3>
                  {(g.sets || g.reps) && (
                    <div className="flex gap-4 mb-3">
                      {g.sets && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Sets:
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {g.sets}
                          </span>
                        </div>
                      )}
                      {g.reps && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Reps:
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {g.reps}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-3 overflow-hidden break-words">
                    {g.instructions}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <span
                    className={
                      `inline-block px-4 py-2 rounded-full text-sm font-semibold ` +
                      (g.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : g.status === "Draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-700")
                    }
                  >
                    {g.status || "Draft"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-[100px]"
          onClick={() => setViewing(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="relative">
              {viewing.videoUrl ? (
                <video
                  src={viewing.videoUrl}
                  className="w-full h-64 object-contain bg-slate-900"
                  controls
                />
              ) : (
                <div className="w-full h-64 bg-slate-900 flex items-center justify-center text-white">
                  No video
                </div>
              )}
              <button
                onClick={() => setViewing(null)}
                className="absolute top-3 right-3 p-2 text-white hover:text-gray-200 hover:bg-black/5 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 break-words">
                      {viewing.title}
                    </h3>
                    <div className="mt-2 space-y-2">
                      {/* Status Row */}
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            `inline-block px-3 py-1 rounded-full text-xs font-semibold ` +
                            (viewing.status === "Published"
                              ? "bg-green-100 text-green-700"
                              : viewing.status === "Draft"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-700")
                          }
                        >
                          {viewing.status || "Draft"}
                        </span>
                        {viewing.category && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                            {viewing.category}
                          </span>
                        )}
                      </div>

                      {/* Target Workout Tags Row */}
                      {viewing.target && viewing.target.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(viewing.target)
                            ? viewing.target
                            : [viewing.target]
                          ).map((t, index) => (
                            <span
                              key={index}
                              className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {(viewing.sets || viewing.reps) && (
                  <div className="mt-4">
                    <div className="bg-[#F8F9FA] rounded-lg overflow-hidden">
                      <div className="flex">
                        {viewing.sets && (
                          <div className="flex-1 p-3 border-r-2 border-gray/10 h-15 my-2">
                            <div className="text-center">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Sets
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {viewing.sets}
                              </div>
                            </div>
                          </div>
                        )}
                        {viewing.reps && (
                          <div className="flex-1 p-3 my-2">
                            <div className="text-center">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Reps
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {viewing.reps}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {viewing.instructions && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Instructions
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line break-words">
                      {viewing.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Button Area */}
            <div className="flex-shrink-0 p-6 py-5 border-t border-gray-200 bg-white">
              <EditDeleteButtons
                onEdit={() => {
                  setViewing(null);
                  openEdit(viewing);
                }}
                onDelete={() => {
                  setViewing(null);
                  onDelete(viewing);
                }}
                editing={false}
                deleting={deleting}
                editText="Edit"
                deleteText="Delete"
                editingText="Editing..."
                deletingText="Deleting..."
                disabled={false}
              />
            </div>
          </div>
        </div>
      )}

      <EditModal
        isOpen={Boolean(editing)}
        onClose={async () => {
          // Clean up any pre-uploaded video if modal is closed
          if (preUploaded.url && preUploaded.path) {
            try {
              await deleteObject(ref(storage, preUploaded.path));
              console.log(
                "Deleted pre-uploaded video on modal close:",
                preUploaded.path,
              );
            } catch (err) {
              console.warn(
                "Failed to delete pre-uploaded file on modal close:",
                err,
              );
            }
          }
          setPreUploaded({ url: "", path: "" });
          setUploadProgress(0);
          if (editing?.id) setViewing(editing);
          setEditing(null);
        }}
        onCancel={handleCancel}
        onSave={onSave}
        saving={saving && !(uploadProgress > 0 && uploadProgress < 100)}
        savingText={
          editing?.id
            ? "Saving..."
            : editing?.videoFile && !preUploaded.url
              ? "Saving..."
              : "Uploading..."
        }
        title={editing?.id ? "Edit Equipment Guide" : "Create Equipment Guide"}
        saveText={
          uploadProgress > 0 && uploadProgress < 100
            ? "Uploading..."
            : editing?.videoFile && preUploaded?.url && uploadProgress === 100
              ? editing?.id
                ? "Save"
                : "Upload"
              : editing?.id
                ? "Save"
                : "Save"
        }
        cancelButtonClassName="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary text-sm pointer-events-auto"
        saveButtonClassName={`px-5 py-2.5 rounded-xl text-white hover:bg-secondary text-sm ${
          uploadProgress > 0 && uploadProgress < 100
            ? "opacity-50 cursor-not-allowed"
            : "bg-primary"
        }`}
        disabled={uploadProgress > 0 && uploadProgress < 100}
        forceEnableCancel={
          (uploadProgress > 0 && uploadProgress < 100) ||
          (!!preUploaded.url && uploadProgress === 100)
        }
        noShadow
        className="max-w-2xl"
      >
        {editing && (
          <div className="space-y-5">
            {editing.id && (
              <div className="flex items-start gap-3 bg-slate-50 rounded-xl px-8 py-5 mt-4">
                <div className="w-14 h-14 mr-2 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-primary">
                    <FaPlay className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {editing.title || "New Guide"}
                  </p>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p
                      className={
                        !expandedInstructions
                          ? "line-clamp-3 overflow-hidden"
                          : ""
                      }
                    >
                      {editing.instructions || "Provide details below."}
                    </p>
                    {editing.instructions &&
                      editing.instructions.length > 200 && (
                        <button
                          onClick={() =>
                            setExpandedInstructions(!expandedInstructions)
                          }
                          className="text-sm text-primary hover:text-secondary mt-2 font-medium"
                        >
                          {expandedInstructions ? "Show less" : "Show more"}
                        </button>
                      )}
                  </div>
                  <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                    {editing.status?.toUpperCase()}
                  </div>
                </div>
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-700 font-medium">
                    Uploading video... Please wait while the video is being
                    uploaded. Form fields are temporarily disabled.
                  </span>
                </div>
              </div>
            )}
            <div
              className={`grid grid-cols-1 gap-4 ${
                editing.id
                  ? "pt-0"
                  : uploadProgress > 0 && uploadProgress < 100
                    ? "pt-0"
                    : "pt-4"
              }`}
            >
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Guide Title <span className="text-red-500">*</span>
                </label>
                <div
                  className={
                    uploadProgress > 0 && uploadProgress < 100
                      ? "opacity-80 pointer-events-none"
                      : ""
                  }
                >
                  <FormInput
                    type="text"
                    value={editing.title}
                    onChange={(e) => {
                      setEditing((s) => ({ ...s, title: e.target.value }));
                      if (validationErrors.title) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          title: null,
                        }));
                      }
                    }}
                    placeholder="Enter guide title"
                    required={true}
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                    className={
                      validationErrors.title
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                        : ""
                    }
                  />
                  {validationErrors.title && (
                    <p className="text-xs text-red-500 mt-1 italic">
                      {validationErrors.title}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Target Workout <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border border-slate-200 rounded-xl p-4 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-colors ${uploadProgress > 0 && uploadProgress < 100 ? "opacity-80 pointer-events-none" : ""}`}
                >
                  {/* Add New Target Section */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Add Target Workout</h4>
                    
                    {/* Main Category Selection */}
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Main Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedMainCategory}
                        onChange={(e) => handleMainCategoryChange(e.target.value)}
                        disabled={uploadProgress > 0 && uploadProgress < 100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select main category...</option>
                        {MAIN_TARGET_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Optional Subcategory */}
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Subcategory <span className="text-gray-400">(Optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={subcategoryInput}
                          onChange={(e) => {
                            setSubcategoryInput(e.target.value);
                            setShowSubcategorySuggestions(e.target.value.length > 0);
                          }}
                          onFocus={() => setShowSubcategorySuggestions(subcategoryInput.length > 0 && existingSubcategories.length > 0)}
                          placeholder="e.g., Lateral Deltoids, Upper Back, etc."
                          disabled={uploadProgress > 0 && uploadProgress < 100}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTargetWithSubcategory();
                            }
                          }}
                        />
                        
                        {/* Subcategory Suggestions */}
                        {showSubcategorySuggestions && existingSubcategories.length > 0 && (
                          <div className="subcategory-suggestions absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            <div className="p-2">
                              <div className="text-xs text-gray-500 mb-2 font-medium">Existing subcategories:</div>
                              {existingSubcategories
                                .filter(sub => sub.toLowerCase().includes(subcategoryInput.toLowerCase()))
                                .map((subcategory) => (
                                  <button
                                    key={subcategory}
                                    type="button"
                                    onClick={() => selectSubcategory(subcategory)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                  >
                                    {subcategory}
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Show existing subcategories when main category is selected */}
                      {selectedMainCategory && existingSubcategories.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">Existing subcategories for {selectedMainCategory}:</div>
                          <div className="flex flex-wrap gap-1">
                            {existingSubcategories.map((subcategory) => (
                              <button
                                key={subcategory}
                                type="button"
                                onClick={() => selectSubcategory(subcategory)}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                              >
                                {subcategory}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Add a specific area within the main category (e.g., "Lateral Deltoids" for Shoulders)
                      </p>
                    </div>

                    {/* Add Button */}
                    <button
                      type="button"
                      onClick={addTargetWithSubcategory}
                      disabled={!selectedMainCategory || (uploadProgress > 0 && uploadProgress < 100)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPlus className="w-3 h-3" />
                      Add Target Workout
                    </button>
                  </div>

                  {/* Selected Targets Display */}
                  {editing.target && editing.target.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Selected Target Workouts
                        </span>
                        <span className="text-xs text-gray-400">
                          ({editing.target.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editing.target.map((target, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
                          >
                            {target}
                            <button
                              type="button"
                              onClick={() => removeTarget(target)}
                              disabled={
                                uploadProgress > 0 && uploadProgress < 100
                              }
                              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {validationErrors.target && (
                    <p className="text-xs text-red-500 mt-2 italic">
                      {validationErrors.target}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Equipment Category <span className="text-red-500">*</span>
                </label>
                <div
                  className={
                    uploadProgress > 0 && uploadProgress < 100
                      ? "opacity-80 pointer-events-none"
                      : ""
                  }
                >
                  <FormSelect
                    value={editing.category ?? ""}
                    onChange={(e) => {
                      setEditing((s) => ({ ...s, category: e.target.value }));
                      if (validationErrors.category) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          category: null,
                        }));
                      }
                    }}
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                    options={[
                      { value: "Free Weights", label: "Free Weights" },
                      { value: "Benches & Racks", label: "Benches & Racks" },
                      {
                        value: "Plate-Loaded Machines (Hammer Strength–style)",
                        label: "Plate-Loaded Machines (Hammer Strength–style)",
                      },
                      {
                        value: "Selectorized Weight Machines (Pin-Loaded)",
                        label: "Selectorized Weight Machines (Pin-Loaded)",
                      },
                      { value: "Cable Machines", label: "Cable Machines" },
                      {
                        value: "Bodyweight/Assisted Machines",
                        label: "Bodyweight/Assisted Machines",
                      },
                      {
                        value: "Leg & Glute Specialty Machines",
                        label: "Leg & Glute Specialty Machines",
                      },
                      { value: "Cardio Machines", label: "Cardio Machines" },
                      {
                        value: "Other Strength/Functional Training Tools",
                        label: "Other Strength/Functional Training Tools",
                      },
                    ]}
                    placeholder="Select Equipment Category"
                    required={true}
                    className={
                      validationErrors.category
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                        : ""
                    }
                  />
                  {validationErrors.category && (
                    <p className="text-xs text-red-500 mt-1 italic">
                      {validationErrors.category}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1 -mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Instructions <span className="text-red-500">*</span>
                </label>
                <div
                  className={
                    uploadProgress > 0 && uploadProgress < 100
                      ? "opacity-80 pointer-events-none"
                      : ""
                  }
                >
                  <FormInput
                    type="textarea"
                    rows={4}
                    value={editing.instructions}
                    onChange={(e) => {
                      setEditing((s) => ({
                        ...s,
                        instructions: e.target.value,
                      }));
                      if (validationErrors.instructions) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          instructions: null,
                        }));
                      }
                    }}
                    placeholder="Enter detailed instructions (press Enter for new lines)"
                    required={true}
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                    className={
                      validationErrors.instructions
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                        : ""
                    }
                  />
                  {validationErrors.instructions && (
                    <p className="text-xs text-red-500 mt-1 italic">
                      {validationErrors.instructions}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Sets
                  </label>
                  <div
                    className={
                      uploadProgress > 0 && uploadProgress < 100
                        ? "opacity-80 pointer-events-none"
                        : ""
                    }
                  >
                    <FormInput
                      type="text"
                      value={editing.sets || ""}
                      onChange={(e) =>
                        setEditing((s) => ({ ...s, sets: e.target.value }))
                      }
                      placeholder="e.g., 3-4"
                      disabled={uploadProgress > 0 && uploadProgress < 100}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Reps
                  </label>
                  <div
                    className={
                      uploadProgress > 0 && uploadProgress < 100
                        ? "opacity-80 pointer-events-none"
                        : ""
                    }
                  >
                    <FormInput
                      type="text"
                      value={editing.reps || ""}
                      onChange={(e) =>
                        setEditing((s) => ({ ...s, reps: e.target.value }))
                      }
                      placeholder="e.g., 8-12"
                      disabled={uploadProgress > 0 && uploadProgress < 100}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <div
                  className={
                    uploadProgress > 0 && uploadProgress < 100
                      ? "opacity-80 pointer-events-none"
                      : ""
                  }
                >
                  <FormSelect
                    value={editing.status}
                    onChange={(e) => {
                      setEditing((s) => ({ ...s, status: e.target.value }));
                      if (validationErrors.status) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          status: null,
                        }));
                      }
                    }}
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                    options={[
                      { value: "Published", label: "Published" },
                      { value: "Draft", label: "Draft" }
                    ]}
                    placeholder="Select Status"
                    required={true}
                    className={
                      validationErrors.status
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                        : ""
                    }
                  />
                  {validationErrors.status && (
                    <p className="text-xs text-red-500 mt-1 italic">
                      {validationErrors.status}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  {editing.id ? "Replace Video" : "Upload Video"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 opacity-100">
                  <FormFileUpload
                    id="video-upload"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // If there's a pre-uploaded video that hasn't been saved yet, delete it
                        if (preUploaded.url && preUploaded.path) {
                          try {
                            await deleteObject(ref(storage, preUploaded.path));
                            console.log(
                              "Deleted previous pre-uploaded video:",
                              preUploaded.path,
                            );
                          } catch (error) {
                            console.warn(
                              "Failed to delete previous pre-uploaded video:",
                              error,
                            );
                          }
                        }

                        // Reset pre-upload state when a new file is chosen
                        setPreUploaded({ url: "", path: "" });
                        setUploadProgress(0);
                        setEditing((s) => ({
                          ...s,
                          videoFile: file,
                          videoName: file.name,
                          videoSizeMB: (file.size / (1024 * 1024)).toFixed(1),
                        }));
                        // Clear video validation error when file is selected
                        if (validationErrors.video) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            video: null,
                          }));
                        }
                      }
                    }}
                    selectedFile={editing.videoFile}
                    existingFile={editing.videoName}
                    uploadText={
                      editing.id ? "Upload New Video" : "Upload Video"
                    }
                    replaceText="Upload New Video"
                    uploading={uploadProgress > 0 && uploadProgress < 100}
                    className={
                      validationErrors.video
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                        : ""
                    }
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full opacity-100">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Uploading {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
                {validationErrors.video && (
                  <p className="text-xs text-red-500 mt-1 italic">
                    {validationErrors.video}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </EditModal>

      <DeleteModal
        isOpen={confirmDelete.open}
        onClose={() => {
          if (confirmDelete.item) setViewing(confirmDelete.item);
          setConfirmDelete({ open: false, item: null });
        }}
        title="Delete Guide"
        itemName={confirmDelete.item?.title || "Guide"}
        itemType="guide"
        onConfirm={confirmDeleteGuide}
        deleting={deleting}
      />

      {/* Toast Notifications - Multiple simultaneous toasts */}
      {activeToasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            top: `${20 + (index * 80)}px`, // Stack toasts vertically
            right: '20px',
            zIndex: 1000 + index,
          }}
        >
          <ToastNotification
            isVisible={true}
            onClose={() => removeToast(toast.id)}
            message={toast.count > 1 ? `${toast.message} (${toast.count}x)` : toast.message}
            type={toast.type}
            position="top-right"
          />
        </div>
      ))}
    </div>
  );
};

export default Guide;
