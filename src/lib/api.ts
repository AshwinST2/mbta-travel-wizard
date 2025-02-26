
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
        line: 'red',
        status: 'normal',
        description: 'Service operating normally',
        timestamp: new Date().toISOString()
      },
      {
        id: 'blue-base',
        line: 'blue',
        status: 'normal',
        description: 'Service operating normally',
        timestamp: new Date().toISOString()
      },
      {
        id: 'orange-base',
        line: 'orange',
        status: 'normal',
        description: 'Service operating normally',
        timestamp: new Date().toISOString()
      },
      {
        id: 'green-b-base',
        line: 'green-b',
        status: 'normal',
        description: 'Service operating normally',
        timestamp: new Date().toISOString()
      },
      {
        id: 'green-c-base',
        line: 'green-c',
        status: 'normal',
        description: 'Service operating normally',
        timestamp: new Date().toISOString()
      },
      {
        id: 'green-d-base',
        line: 'green-d',
        status: 'normal',
        description: 'Service operating normally',
        timestamp: new Date().toISOString()
      },
      {
        id: 'green-e-base',
        line: 'green-e',
        status: 'normal',
        description: 'Service operating normally',
        timestamp: new Date().toISOString()
      }
    ] as LineStatus[];

    // Get alerts from the API and handle multiple alerts per line
    const alerts = data.data.flatMap((alert: any) => {
      const entities = alert.attributes.informed_entity || [];
      const routes = new Set(entities.map((entity: any) => entity.route?.toLowerCase()).filter(Boolean));
      
      return Array.from(routes).map(routeId => {
        // Map MBTA route IDs to our line types
        let line: TrainLine | null = null;
        if (routeId === 'red') line = 'red';
        else if (routeId === 'blue') line = 'blue';
        else if (routeId === 'orange') line = 'orange';
        else if (routeId === 'green-b') line = 'green-b';
        else if (routeId === 'green-c') line = 'green-c';
        else if (routeId === 'green-d') line = 'green-d';
        else if (routeId === 'green-e') line = 'green-e';
        
        if (!line) return null;

        const severity = alert.attributes.severity || 0;
        const effect = alert.attributes.effect || '';
        
        // Determine status based on both severity and effect
        let status: "normal" | "minor" | "major" = "normal";
        if (severity >= 7 || ['SUSPENSION', 'STATION_CLOSURE'].includes(effect)) {
          status = 'major';
        } else if (severity >= 3 || ['DELAY', 'DETOUR', 'SHUTTLE', 'STOP_MOVED'].includes(effect)) {
          status = 'minor';
        }
        
        return {
          id: alert.id,
          line,
          status,
          description: alert.attributes.header || alert.attributes.short_header || 'Service update',
          timestamp: alert.attributes.updated_at || new Date().toISOString(),
        };
      }).filter(Boolean);
    });

    // For each line with alerts, update the base status with the most severe alert
    alerts.forEach((alert: LineStatus) => {
      const index = baseStatuses.findIndex(base => base.line === alert.line);
      if (index !== -1) {
        const currentStatus = baseStatuses[index];
        // Update only if the new alert is more severe
        if (
          (alert.status === 'major') || 
          (alert.status === 'minor' && currentStatus.status === 'normal')
        ) {
          baseStatuses[index] = alert;
        }
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

    // Get all affected routes
    const routes = new Set(
      alert.attributes.informed_entity
        ?.map((entity: any) => entity.route?.toLowerCase())
        .filter(Boolean)
    );
    
    // Get the first route as the primary one
    const affectedLine = Array.from(routes)[0] || 'unknown';

    // Get all unique affected stations with proper type assertion
    const stations = new Set(
      alert.attributes.informed_entity
        ?.filter((entity: any) => entity.stop)
        ?.map((entity: any) => entity.stop as string)
    );

    return {
      id: alert.id,
      line: affectedLine as TrainLine,
      reason: alert.attributes.cause || alert.attributes.effect || "Unknown cause",
      startTime: alert.attributes.active_period?.[0]?.start || new Date().toISOString(),
      endTime: alert.attributes.active_period?.[0]?.end || null,
      affectedStations: Array.from(stations) as string[],
      description: alert.attributes.description || alert.attributes.header || "No description available",
    };
  } catch (error) {
    console.error("Error fetching disruption:", error);
    return null;
  }
}
