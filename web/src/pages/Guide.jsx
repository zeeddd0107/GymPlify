import React, { useState, useEffect } from "react";
import { FaPlay, FaUpload, FaCheck, FaTimes } from "react-icons/fa";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/config/firebase";
import { EditModal } from "@/components";
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
  const [expandedDescription, setExpandedDescription] = useState(false);
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "Guide updated successfully!",
  );

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
      } catch (error) {
        console.error("Error loading guides:", error);
        console.error("Error details:", error.message);
        alert(`Failed to load guides: ${error.message}`);
        // Fallback to default guides if Firebase fails
        setGuides([
          {
            id: "treadmill",
            title: "Treadmill Usage Guide",
            description:
              "Learn how to properly use the treadmill for maximum safety and effectiveness.",
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
            description:
              "Essential techniques for safe and effective weight training.",
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
    setExpandedDescription(false);
    // Reset any previous pre-upload state when opening modal
    setPreUploaded({ url: "", path: "" });
    setUploadProgress(0);
  };

  const openCreate = () => {
    setEditing({
      id: null,
      title: "",
      target: [],
      category: "",
      description: "",
      status: "Draft",
      videoFile: null,
      videoName: "",
      videoSizeMB: "",
    });
    // Also reset pre-upload state for new create
    setPreUploaded({ url: "", path: "" });
    setUploadProgress(0);
  };

  const onSave = async () => {
    if (!user) {
      alert("Please log in to save guides");
      return;
    }

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
        const safeName = `${Date.now()}_${file.name}`;
        const path = `guides/${user.uid}/${safeName}`;
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
          alert(`Failed to upload video: ${error.message}`);
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
        setSuccessMessage("Guide updated successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        // Create new guide
        console.log("Creating new guide...");
        console.log("Guide data being sent:", {
          title: editing.title,
          target: editing.target,
          category: editing.category,
          description: editing.description,
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
        setSuccessMessage("Guide uploaded successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
      setEditing(null);
    } catch (error) {
      console.error("Error saving guide:", error);
      console.error("Error details:", error.message);
      if (error && /cancell?ed|canceled/i.test(error.message)) {
        // Swallow cancellation alerts; user intentionally canceled
      } else {
        alert(`Failed to save guide: ${error.message}`);
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
      setSuccessMessage("Guide deleted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error deleting guide:", error);
      alert("Failed to delete guide. Please try again.");
    } finally {
      setDeleting(false);
      setConfirmDelete({ open: false, item: null });
    }
  };
  return (
    <div className="pl-1 pt-5">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[60] bg-green-500 text-white rounded-xl shadow px-4 py-3 flex items-center gap-2">
          <span className="bg-white/20 rounded-full p-1">
            <FaCheck className="w-4 h-4" />
          </span>
          <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}
      <div className="flex items-center justify-end">
        <button
          onClick={openCreate}
          className="px-5 py-3 bg-primary hover:bg-secondary text-white rounded-xl shadow text-sm"
        >
          Upload Guide
        </button>
      </div>

      <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Loading guides...</p>
          </div>
        ) : (
          guides.map((g) => (
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {g.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 overflow-hidden">
                    {g.description}
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
          ))
        )}
      </div>

      {viewing && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
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
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {viewing.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
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
                    {viewing.category && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                        {viewing.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {viewing.description && (
                <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">
                  {viewing.description}
                </p>
              )}
              <div className="mt-6 flex items-center justify-end gap-3">
                <div className="flex items-center gap-3">
                  <button
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary transition-colors text-sm"
                    onClick={() => {
                      setViewing(null);
                      openEdit(viewing);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-5 py-2.5 rounded-xl text-white bg-red-500 hover:bg-red-600 text-sm"
                    onClick={() => {
                      setViewing(null);
                      onDelete(viewing);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <EditModal
        isOpen={Boolean(editing)}
        onClose={() => {
          if (editing?.id) setViewing(editing);
          setEditing(null);
        }}
        onCancel={handleCancel}
        onSave={onSave}
        saving={saving}
        savingText={
          editing?.id
            ? "Saving..."
            : editing?.videoFile && !preUploaded.url
              ? "Saving..."
              : "Uploading..."
        }
        title={editing?.id ? "Edit Equipment Guide" : "Create Equipment Guide"}
        saveText={
          editing?.videoFile && preUploaded?.url && uploadProgress === 100
            ? editing?.id
              ? "Save Changes"
              : "Upload"
            : editing?.id
              ? "Save Changes"
              : "Save"
        }
        cancelButtonClassName="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary text-sm"
        saveButtonClassName="px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-secondary text-sm"
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
                        !expandedDescription
                          ? "line-clamp-3 overflow-hidden"
                          : ""
                      }
                    >
                      {editing.description || "Provide details below."}
                    </p>
                    {editing.description &&
                      editing.description.length > 200 && (
                        <button
                          onClick={() =>
                            setExpandedDescription(!expandedDescription)
                          }
                          className="text-sm text-primary hover:text-secondary mt-2 font-medium"
                        >
                          {expandedDescription ? "Show less" : "Show more"}
                        </button>
                      )}
                  </div>
                  <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                    {editing.status?.toUpperCase()}
                  </div>
                </div>
              </div>
            )}
            <div
              className={`grid grid-cols-1 gap-4 ${editing.id ? "pt-0" : "pt-4"}`}
            >
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Guide Title
                </label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
                  value={editing.title}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, title: e.target.value }))
                  }
                  placeholder="Enter guide title"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Target Workout
                </label>
                <div className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-colors">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Shoulders",
                      "Back",
                      "Chest",
                      "Arms",
                      "Legs",
                      "Core",
                      "Full Body",
                    ].map((t) => (
                      <label
                        key={t}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={editing.target?.includes(t) || false}
                          onChange={(e) => {
                            const currentTargets = editing.target || [];
                            if (e.target.checked) {
                              setEditing((s) => ({
                                ...s,
                                target: [...currentTargets, t],
                              }));
                            } else {
                              setEditing((s) => ({
                                ...s,
                                target: currentTargets.filter(
                                  (target) => target !== t,
                                ),
                              }));
                            }
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Equipment Category
                </label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
                  value={editing.category ?? ""}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, category: e.target.value }))
                  }
                >
                  <option value="" disabled>
                    Select Equipment Category
                  </option>
                  {[
                    "Machine",
                    "Treadmill",
                    "Dumbbells",
                    "Rowing Machine",
                    "Elliptical",
                    "Kettlebell",
                    "Barbell",
                    "Bodyweight",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 -mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
                  rows={2}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, description: e.target.value }))
                  }
                  placeholder="Enter detailed description"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
                  value={editing.status}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, status: e.target.value }))
                  }
                >
                  <option>Published</option>
                  <option>Draft</option>
                  {editing?.id && <option>Archive</option>}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  {editing.id ? "Replace Video" : "Upload Video"}
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="file"
                      id="video-upload"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Reset pre-upload state when a new file is chosen
                          setPreUploaded({ url: "", path: "" });
                          setUploadProgress(0);
                          setEditing((s) => ({
                            ...s,
                            videoFile: file,
                            videoName: file.name,
                            videoSizeMB: (file.size / (1024 * 1024)).toFixed(1),
                          }));
                        }
                      }}
                    />
                    <label
                      htmlFor="video-upload"
                      className="flex items-center justify-left gap-2 w-full px-4 py-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <FaUpload className="text-primary text-lg" />
                      <span className="text-primary font-normal text-sm">
                        {editing.id
                          ? "Upload New Video"
                          : editing.videoName
                            ? "Upload New Video"
                            : "Upload Video"}
                      </span>
                    </label>
                  </div>
                  {editing.videoName && (
                    <p className="text-sm text-slate-500 italic">
                      {preUploaded?.url && uploadProgress === 100
                        ? "Saved"
                        : "Current"}
                      : {editing.videoName} ({editing.videoSizeMB} MB)
                    </p>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full">
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
    </div>
  );
};

export default Guide;
