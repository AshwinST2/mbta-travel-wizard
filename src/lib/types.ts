
export type TrainLine = "red" | "blue" | "orange" | "green";

export interface LineStatus {
  id: string;
  line: TrainLine;
  status: "normal" | "minor" | "major";
  description: string;
  timestamp: string;
}

export interface Disruption {
  id: string;
  line: TrainLine;
  reason: string;
  startTime: string;
  endTime: string | null;
  affectedStations: string[];
  description: string;
}
