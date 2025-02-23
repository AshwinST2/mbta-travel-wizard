
import { LineStatus, Disruption } from "./types";

const API_KEY = "39fcdfa840624066b6d9153cfb41fc70";
const BASE_URL = "https://cors-proxy.lovableio.com/https://api-v3.mbta.com";

const headers = {
  "x-api-key": API_KEY,
  Accept: "application/vnd.api+json",
  "Content-Type": "application/vnd.api+json",
};

export async function fetchLineStatuses(): Promise<LineStatus[]> {
  try {
    console.log("Fetching line statuses from:", `${BASE_URL}/alerts?filter[route_type]=0,1`);
    
    const response = await fetch(`${BASE_URL}/alerts?filter[route_type]=0,1`, {
      headers,
      method: 'GET'
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`Failed to fetch line statuses: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("MBTA API Response:", data);
    
    if (!data || !data.data) {
      throw new Error("Invalid API response format");
    }
    
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
    console.log("Fetching disruption details for:", alertId);
    
    const response = await fetch(`${BASE_URL}/alerts/${alertId}`, {
      headers,
      method: 'GET'
    });

    console.log("Disruption response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch disruption details: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const alert = data.data;

    if (!alert) {
      throw new Error("Invalid disruption response format");
    }

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
