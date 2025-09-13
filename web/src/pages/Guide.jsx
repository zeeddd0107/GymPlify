import React, { useState, useEffect } from "react";
import { FaPlay, FaUpload } from "react-icons/fa";
import { EditModal } from "@/components";
import guideService from "@/services/guideService";

const Guide = () => {
  // Mock user for now to avoid authentication issues
  const user = { uid: "test-user", email: "test@example.com" };
  const [guides, setGuides] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
      videoFile: null,
      videoName: guide.videoName || "",
      videoSizeMB: guide.videoSizeMB || "",
    });
  };

  const openCreate = () =>
    setEditing({
      id: null,
      title: "",
      target: "Shoulders",
      category: "Treadmill",
      description: "",
      status: "Draft",
      videoFile: null,
      videoName: "",
      videoSizeMB: "",
    });

  const onSave = async () => {
    if (!user) {
      alert("Please log in to save guides");
      return;
    }

    console.log("Saving guide:", editing);
    console.log("User:", user);
    console.log("User UID:", user.uid);

    setSaving(true);

    try {
      if (editing.id) {
        // Update existing guide
        console.log("Updating existing guide...");
        const updatedGuide = await guideService.updateGuide(
          editing.id,
          editing,
          user.uid,
        );
        setGuides((prev) =>
          prev.map((g) => (g.id === editing.id ? updatedGuide : g)),
        );
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

        const newGuide = await guideService.createGuide(editing, user.uid);
        console.log("Created guide:", newGuide);
        setGuides((prev) => [newGuide, ...prev]);
      }
      setEditing(null);
    } catch (error) {
      console.error("Error saving guide:", error);
      console.error("Error details:", error.message);
      alert(`Failed to save guide: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (guideId) => {
    if (!user) {
      alert("Please log in to delete guides");
      return;
    }

    if (window.confirm("Are you sure you want to delete this guide?")) {
      try {
        await guideService.deleteGuide(guideId);
        setGuides((prev) => prev.filter((g) => g.id !== guideId));
      } catch (error) {
        console.error("Error deleting guide:", error);
        alert("Failed to delete guide. Please try again.");
      }
    }
  };
  return (
    <div className="pl-1 pt-6">
      <div className="flex items-center justify-end">
        <button
          onClick={openCreate}
          className="px-5 py-3 bg-primary hover:bg-secondary text-white rounded-xl shadow text-sm"
        >
          Upload Guide
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Loading guides...</p>
          </div>
        ) : (
          guides.map((g) => (
            <div
              key={g.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="h-48 bg-primary rounded-t-2xl flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center text-primary">
                  <FaPlay className="w-4 h-4" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {g.title}
                </h3>
                <p className="text-sm text-gray-600 mb-5">{g.description}</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEdit(g)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(g.id)}
                    className="px-5 py-2.5 rounded-xl text-white bg-red-500 hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <EditModal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSave={onSave}
        saving={saving}
        title={editing?.id ? "Edit Equipment Guide" : "Create Equipment Guide"}
        saveText={editing?.id ? "Save Changes" : "Upload"}
        cancelButtonClassName="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary text-sm"
        saveButtonClassName="px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-secondary text-sm"
        noShadow
        className="max-w-2xl"
      >
        {editing && (
          <div className="space-y-5">
            {editing.id && (
              <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-8 mt-4">
                <div className="w-14 h-14 mr-2 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-primary">
                    <FaPlay className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {editing.title || "New Guide"}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {editing.description || "Provide details below."}
                  </p>
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
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
                  value={editing.target || "Shoulders"}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, target: e.target.value }))
                  }
                >
                  {[
                    "Shoulders",
                    "Back",
                    "Chest",
                    "Arms",
                    "Legs",
                    "Core",
                    "Full Body",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Equipment Category
                </label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
                  value={editing.category || "Treadmill"}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, category: e.target.value }))
                  }
                >
                  {[
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
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm min-h-[100px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
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
                  <option>Archive</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Replace Video
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
                        Upload New Video
                      </span>
                    </label>
                  </div>
                  {editing.videoName && (
                    <p className="text-sm text-slate-500 italic">
                      Current: {editing.videoName} ({editing.videoSizeMB} MB)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </EditModal>
    </div>
  );
};

export default Guide;
