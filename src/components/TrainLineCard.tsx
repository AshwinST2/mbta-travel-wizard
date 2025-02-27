import { motion } from "framer-motion";
import { LineStatus, TrainLine, Direction } from "@/lib/types";
import { AlertCircle, CheckCircle, Clock, Info, ArrowRight, AlertTriangle } from "lucide-react";

interface TrainLineCardProps {
  line: TrainLine;
  status: LineStatus | null;
  onSelect: () => void;
}

const lineColors = {
  red: "bg-mbta-red",
  blue: "bg-mbta-blue",
  orange: "bg-mbta-orange",
  "green-b": "bg-mbta-green",
  "green-c": "bg-mbta-green",
  "green-d": "bg-mbta-green",
  "green-e": "bg-mbta-green"
} as const;

const lineNames = {
  red: "Red Line",
  blue: "Blue Line",
  orange: "Orange Line",
  "green-b": "Green Line B",
  "green-c": "Green Line C",
  "green-d": "Green Line D",
  "green-e": "Green Line E"
} as const;

const lineDestinations = {
  red: {
    inbound: "Ashmont/Braintree",
    outbound: "Alewife"
  },
  blue: {
    inbound: "Bowdoin",
    outbound: "Wonderland"
  },
  orange: {
    inbound: "Forest Hills",
    outbound: "Oak Grove"
  },
  "green-b": {
    inbound: "Government Center",
    outbound: "Boston College"
  },
  "green-c": {
    inbound: "Government Center",
    outbound: "Cleveland Circle"
  },
  "green-d": {
    inbound: "Government Center",
    outbound: "Riverside"
  },
  "green-e": {
    inbound: "Government Center",
    outbound: "Heath Street"
  }
} as const;

export function TrainLineCard({ line, status, onSelect }: TrainLineCardProps) {
  const isToday = (date: string) => {
    const today = new Date();
    const alertDate = new Date(date);
    return (
      alertDate.getDate() === today.getDate() &&
      alertDate.getMonth() === today.getMonth() &&
      alertDate.getFullYear() === today.getFullYear()
    );
  };

  const formatAlertTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(timestamp)) {
      return date.toLocaleString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm shadow-lg p-6 cursor-pointer transition-all"
    >
      <div className={`absolute top-0 left-0 w-2 h-full ${lineColors[line]}`} />
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{lineNames[line]}</h3>
          {status?.status !== "normal" && isToday(status.timestamp) && (
            <AlertTriangle className="text-red-500 h-5 w-5" />
          )}
        </div>

        {/* Outbound Direction */}
        <div className="space-y-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="h-4 w-4" />
            <p className="font-medium">To {lineDestinations[line].outbound}</p>
          </div>
          {status?.status !== "normal" && status?.direction === "outbound" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {status.status === "major" && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Major delays
                  </span>
                )}
                {status.status === "minor" && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Minor delays
                  </span>
                )}
              </div>
              {isToday(status.timestamp) && (
                <div className="text-sm text-gray-700">
                  <p>
                    <span className="font-medium text-mbta-red">Alert as of {formatAlertTime(status.timestamp)}:</span>{" "}
                    {status.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inbound Direction */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="h-4 w-4" />
            <p className="font-medium">To {lineDestinations[line].inbound}</p>
          </div>
          {status?.status !== "normal" && status?.direction === "inbound" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {status.status === "major" && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Major delays
                  </span>
                )}
                {status.status === "minor" && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Minor delays
                  </span>
                )}
              </div>
              {isToday(status.timestamp) && (
                <div className="text-sm text-gray-700">
                  <p>
                    <span className="font-medium text-mbta-red">Alert as of {formatAlertTime(status.timestamp)}:</span>{" "}
                    {status.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* General Status Information */}
        {status && status.status !== "normal" && !status.direction && (
          <div className="mt-2 space-y-2 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <p>
                Alert as of {formatAlertTime(status.timestamp)}
              </p>
            </div>
            <p className="text-sm text-mbta-red">
              {status.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Info className="h-4 w-4" />
              <p>Tap for more details</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
