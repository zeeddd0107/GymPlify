const express = require("express");
const router = express.Router();

/**
 * POST /notifications/send-push
 * Send push notification via Expo Push API
 * This bypasses CORS issues by calling from backend
 */
router.post("/send-push", async (req, res) => {
  try {
    const { pushToken, title, body, data, priority } = req.body;

    console.log(" Backend: Sending push notification...");
    console.log("   Token:", pushToken?.substring(0, 30) + "...");
    console.log("   Title:", title);

    // Validate input
    if (!pushToken || !title || !body) {
      return res.status(400).json({
        error: "Missing required fields: pushToken, title, body",
      });
    }

    if (!pushToken.startsWith("ExponentPushToken")) {
      return res.status(400).json({
        error: "Invalid push token format",
      });
    }

    // Prepare Expo push notification payload
    const payload = {
      to: pushToken,
      sound: "default",
      title,
      body,
      data: data || {},
      priority: priority === "high" ? "high" : "default",
      channelId: "default",
    };

    console.log(" Payload:", JSON.stringify(payload, null, 2));

    // Send to Expo Push API
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(" Expo API error:", response.status, errorText);
      return res.status(response.status).json({
        error: `Expo API error: ${response.status}`,
        details: errorText,
      });
    }

    const result = await response.json();
    console.log(" Expo API response:", result);

    if (result.data?.[0]?.status === "ok") {
      return res.status(200).json({
        success: true,
        ticketId: result.data[0].id,
        message: "Push notification sent successfully",
      });
    } else if (result.data?.[0]?.status === "error") {
      return res.status(400).json({
        success: false,
        error: result.data[0].message,
        details: result.data[0].details,
      });
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error(" Error sending push notification:", error);
    res.status(500).json({
      error: "Failed to send push notification",
      message: error.message,
    });
  }
});

module.exports = router;

