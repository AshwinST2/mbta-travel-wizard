import { LineStatus, Disruption, TrainLine } from "./types";

const API_KEY = "39fcdfa840624066b6d9153cfb41fc70";
const BASE_URL = "https://api-v3.mbta.com";

const headers = new Headers({
  'x-api-key': API_KEY,
  'Accept': 'application/vnd.api+json'
});

export async function fetchLineStatuses(): Promise<LineStatus[]> {
  try {
    console.log("Fetching line statuses...");
    
    const response = await fetch(`${BASE_URL}/alerts?filter[route_type]=0,1`, {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'no-cache'
    });
    
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch line statuses: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("MBTA API Response:", data);
    
    if (!data || !data.data) {
      throw new Error("Invalid API response format");
    }
    
    // Create a base set of normal statuses for all lines
    const baseStatuses: LineStatus[] = [
      {
        id: 'red-base',
        line: 'red' as TrainLine,
        status: 'normal',
        description: 'Service operating normally',
        timestamp: new Date().toISOString()
      },
      {
        id: 'blue-base',
        line: 'blue' as TrainLine,
        status: 'normal',
        description: 'Service operating normally',
        timestamp: new Date().toISOString()
      },
      {
        id: 'orange-base',
        line: 'orange' as TrainLine,
        status: 'normal',
        description: 'Service operating normally',
        timestamp: new Date().toISOString()
      },
      {
        id: 'green-base',
        line: 'green' as TrainLine,
        status: 'normal',
        description: 'Service operating normally',
        timestamp: new Date().toISOString()
      }
    ];

    // Get alerts from the API
    const alerts = data.data.map((alert: any) => {
      const affectedLine = alert.attributes.informed_entity?.[0]?.route_id?.toLowerCase() || 'unknown';
      if (!['red', 'blue', 'orange', 'green'].includes(affectedLine)) {
        return null;
      }
      
      return {
        id: alert.id,
        line: affectedLine as TrainLine,
        status: determineStatus(alert.attributes.severity),
        description: alert.attributes.header || 'Service update',
        timestamp: alert.attributes.updated_at || new Date().toISOString(),
      };
    }).filter(Boolean);

    // For each line with alerts, replace the base status
    alerts.forEach((alert: LineStatus) => {
      const index = baseStatuses.findIndex(base => base.line === alert.line);
      if (index !== -1) {
        baseStatuses[index] = alert;
      }
    });

    return baseStatuses;
  } catch (error) {
    console.error("Error fetching line statuses:", error);
    throw error;
  }
}

export async function fetchDisruption(alertId: string): Promise<Disruption | null> {
  try {
    console.log("Fetching disruption details for:", alertId);
    
    const response = await fetch(`${BASE_URL}/alerts/${alertId}`, {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'no-cache'
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

    const affectedLine = alert.attributes.informed_entity?.[0]?.route_id?.toLowerCase() || 'unknown';

    return {
      id: alert.id,
      line: affectedLine as any,
      reason: alert.attributes.cause || "Unknown cause",
      startTime: alert.attributes.active_period[0]?.start || new Date().toISOString(),
      endTime: alert.attributes.active_period[0]?.end || null,
      affectedStations: alert.attributes.informed_entity
        .filter((entity: any) => entity.stop)
        .map((entity: any) => entity.stop),
      description: alert.attributes.description || alert.attributes.header || "No description available",
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
