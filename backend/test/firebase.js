app.get("/test/firebase", async (req, res) => {
  try {
    const time = new Date();
    res.status(200).json({
      firebase: "connected",
      time: time.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Firebase failed" });
  }
});
