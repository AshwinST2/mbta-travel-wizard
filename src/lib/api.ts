
import { LineStatus, Disruption } from "./types";

const API_KEY = "39fcdfa840624066b6d9153cfb41fc70";
const BASE_URL = "https://api-v3.mbta.com";

const headers = {
  "x-api-key": API_KEY,
  Accept: "application/vnd.api+json",
  "Content-Type": "application/vnd.api+json",
};

export async function fetchLineStatuses(): Promise<LineStatus[]> {
  try {
    const response = await fetch(`${BASE_URL}/alerts?filter[route_type]=0,1`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch line statuses");
    }

    const data = await response.json();
    
    // Process MBTA API response into our LineStatus format
    return data.data.map((alert: any) => ({
      id: alert.id,
      line: alert.attributes.service_effect.toLowerCase(),
      status: determineStatus(alert.attributes.severity),
      description: alert.attributes.header,
      timestamp: alert.attributes.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching line statuses:", error);
    throw error;
  }
}

export async function fetchDisruption(alertId: string): Promise<Disruption | null> {
  try {
    const response = await fetch(`${BASE_URL}/alerts/${alertId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch disruption details");
    }

    const data = await response.json();
    const alert = data.data;

    return {
      id: alert.id,
      line: alert.attributes.service_effect.toLowerCase(),
      reason: alert.attributes.cause || "Unknown cause",
      startTime: alert.attributes.active_period[0]?.start || new Date().toISOString(),
      endTime: alert.attributes.active_period[0]?.end || null,
      affectedStations: alert.attributes.informed_entity.map((entity: any) => entity.stop),
      description: alert.attributes.description,
    };
  } catch (error) {
    console.error("Error fetching disruption:", error);
    return null;
  }
}

function determineStatus(severity: number): "normal" | "minor" | "major" {
  switch (severity) {
    case 7:
      return "major";
    case 5:
    case 4:
      return "minor";
    default:
      return "normal";
  }
}
