
export type MainLine = "red" | "blue" | "orange";
export type GreenLineBranch = "green-b" | "green-c" | "green-d" | "green-e";
export type TrainLine = MainLine | GreenLineBranch;
export type Direction = "inbound" | "outbound";

export interface LineStatus {
  id: string;
  line: TrainLine;
  status: "normal" | "minor" | "major";
  description: string;
  timestamp: string;
  direction?: Direction;
  destination?: string;
  startTime?: string;
}

export interface Disruption {
  id: string;
  line: TrainLine;
  reason: string;
  startTime: string;
  endTime: string | null;
  affectedStations: string[];
  description: string;
  direction?: Direction;
}
