import { useState } from "react";
import { getWorkoutTip } from "@/src/services/dashboardService";

export const useWorkoutTip = () => {
  const [workoutTip, setWorkoutTip] = useState(null);

  const fetchWorkoutTipHook = async () => {
    try {
      const tip = getWorkoutTip();
      setWorkoutTip(tip);
    } catch (error) {
      console.error("Error fetching workout tip:", error);
    }
  };

  return {
    workoutTip,
    setWorkoutTip,
    fetchWorkoutTipHook,
  };
};
