import { describe, expect, it } from "vitest";
import { recommendTripStops, toggleTripStop, type TripStop } from "./tripPlanner";

const stops: TripStop[] = [
  { id: "mobility", name: "حركة", type: "", summary: "", needs: ["mobility"], duration: "", verificationNote: "" },
  { id: "visual", name: "بصر", type: "", summary: "", needs: ["visual"], duration: "", verificationNote: "" },
  { id: "other", name: "أخرى", type: "", summary: "", needs: ["hearing"], duration: "", verificationNote: "" },
];

describe("trip planner", () => {
  it("returns all stops when the user has no saved needs", () => {
    expect(recommendTripStops(stops, []).map((stop) => stop.id)).toEqual(["mobility", "visual", "other"]);
  });

  it("prioritizes matching stops and excludes non-matching stops", () => {
    expect(recommendTripStops(stops, ["visual"]).map((stop) => stop.id)).toEqual(["visual"]);
  });

  it("toggles a selected stop without mutating the original array", () => {
    const selected = ["mobility"];
    expect(toggleTripStop(selected, "visual")).toEqual(["mobility", "visual"]);
    expect(toggleTripStop(selected, "mobility")).toEqual([]);
    expect(selected).toEqual(["mobility"]);
  });
});
