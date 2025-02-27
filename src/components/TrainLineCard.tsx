
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

  const getStatusSeverity = (status: LineStatus | null) => {
    if (!status) return 0;
    if (status.status === "major" && isToday(status.timestamp)) return 3;
    if (status.status === "major") return 2;
    if (status.status === "minor" && isToday(status.timestamp)) return 1;
    return 0;
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
          <div className="flex items-center gap-2">
            {status?.status === "major" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Major delays {isToday(status.timestamp) && "TODAY"}
              </span>
            )}
            {status?.status === "minor" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Minor delays {isToday(status.timestamp) && "TODAY"}
              </span>
            )}
          </div>
        </div>

        {/* Inbound Direction */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="h-4 w-4" />
            <p className="font-medium">To {lineDestinations[line].inbound}</p>
          </div>
          <div className="flex items-center gap-2">
            {status?.status === "major" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Major delays {isToday(status.timestamp) && "TODAY"}
              </span>
            )}
            {status?.status === "minor" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Minor delays {isToday(status.timestamp) && "TODAY"}
              </span>
            )}
          </div>
        </div>

        {/* Status Information */}
        {status && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <p>
                {new Date(status.timestamp).toLocaleString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <p className={`text-sm ${
              status.status !== "normal" ? "text-mbta-red" : "text-gray-600"
            }`}>
              {status.description || "Service operating normally"}
            </p>
            {status.status !== "normal" && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Info className="h-4 w-4" />
                <p>Tap for more details</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
