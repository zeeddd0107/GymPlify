const request = require("supertest");
const express = require("express");

const app = express();

// A mock route to test
app.get("/", (req, res) => {
  res.status(200).send("GymPlify API is running");
});

describe("GET /", () => {
  it("should return GymPlify API status", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("GymPlify API is running");
  });
});
