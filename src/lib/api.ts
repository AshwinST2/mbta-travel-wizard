import { LineStatus, Disruption, TrainLine, Direction } from "./types";

const API_KEY = "39fcdfa840624066b6d9153cfb41fc70";
const BASE_URL = "https://api-v3.mbta.com";

const headers = new Headers({
  'x-api-key': API_KEY,
  'Accept': 'application/vnd.api+json'
});

const isToday = (date: Date): boolean => {
  const today = new Date();
  const targetDate = new Date(date);
  return (
    targetDate.getDate() === today.getDate() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getFullYear() === today.getFullYear()
  );
};

const isCurrentAlert = (alert: any): boolean => {
  const now = new Date();
  const startTime = alert.attributes.active_period?.[0]?.start;
  const endTime = alert.attributes.active_period?.[0]?.end;
  
  // If no start time, use created_at
  const effectiveStartTime = startTime ? new Date(startTime) : new Date(alert.attributes.created_at);
  
  // Check if the alert is from today
  if (!isToday(effectiveStartTime)) {
    return false;
  }
  
  // If it has an end time, check if it's still valid
  if (endTime) {
    const effectiveEndTime = new Date(endTime);
    return effectiveEndTime > now;
  }
  
  return true;
};

export async function fetchLineStatuses(): Promise<LineStatus[]> {
  try {
    console.log("Fetching line statuses...");
    
    const response = await fetch(`${BASE_URL}/alerts?filter[route_type]=0,1`, {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch line statuses: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("MBTA API Response:", data);
    
    if (!data || !data.data) {
      throw new Error("Invalid API response format");
    }

    // Filter to only include current alerts
    const currentAlerts = data.data.filter(isCurrentAlert).sort((a: any, b: any) => {
      const dateA = new Date(a.attributes.active_period?.[0]?.start || a.attributes.created_at);
      const dateB = new Date(b.attributes.active_period?.[0]?.start || b.attributes.created_at);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });

    console.log("Current alerts:", currentAlerts);

    const lineStatuses: LineStatus[] = [];

    for (const alert of currentAlerts) {
      const entities = alert.attributes.informed_entity || [];
      
      for (const entity of entities) {
        const routeId = entity.route?.toLowerCase();
        if (!routeId) continue;

        let line: TrainLine | null = null;

        // Handle both direct routes and routes that include the line name
        if (routeId === 'red' || routeId.includes('red')) line = 'red';
        else if (routeId === 'blue' || routeId.includes('blue')) line = 'blue';
        else if (routeId === 'orange' || routeId.includes('orange')) line = 'orange';
        else if (routeId.includes('green-b')) line = 'green-b';
        else if (routeId.includes('green-c')) line = 'green-c';
        else if (routeId.includes('green-d')) line = 'green-d';
        else if (routeId.includes('green-e')) line = 'green-e';
        // Special handling for general Green Line alerts
        else if (routeId === 'green' || routeId.includes('green')) {
          // Add alert to all Green Line branches
          ['green-b', 'green-c', 'green-d', 'green-e'].forEach(greenLine => {
            const direction = entity.direction_id === 0 ? "outbound" : "inbound";
            const severity = alert.attributes.severity || 0;
            const effect = alert.attributes.effect || '';
            
            let status: "normal" | "minor" | "major" = "normal";
            if (severity >= 7 || ['SUSPENSION', 'STATION_CLOSURE'].includes(effect)) {
              status = 'major';
            } else if (severity >= 3 || ['DELAY', 'DETOUR', 'SHUTTLE', 'STOP_MOVED'].includes(effect)) {
              status = 'minor';
            }

            const description = alert.attributes.header || alert.attributes.short_header;
            if (!description) return;

            lineStatuses.push({
              id: alert.id,
              line: greenLine as TrainLine,
              status,
              description,
              timestamp: alert.attributes.updated_at || alert.attributes.created_at,
              direction
            });
          });
          continue;
        }
        
        if (!line) continue;

        const direction = entity.direction_id === 0 ? "outbound" : "inbound";
        const severity = alert.attributes.severity || 0;
        const effect = alert.attributes.effect || '';
        
        let status: "normal" | "minor" | "major" = "normal";
        if (severity >= 7 || ['SUSPENSION', 'STATION_CLOSURE'].includes(effect)) {
          status = 'major';
        } else if (severity >= 3 || ['DELAY', 'DETOUR', 'SHUTTLE', 'STOP_MOVED'].includes(effect)) {
          status = 'minor';
        }

        const description = alert.attributes.header || alert.attributes.short_header;
        if (!description) continue;
        
        const timestamp = alert.attributes.updated_at || alert.attributes.created_at;

        lineStatuses.push({
          id: alert.id,
          line,
          status,
          description,
          timestamp,
          direction
        });
      }
    }

    console.log("Processed line statuses:", lineStatuses);
    return lineStatuses;
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
