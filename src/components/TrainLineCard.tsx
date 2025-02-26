
import { motion } from "framer-motion";
import { LineStatus, TrainLine } from "@/lib/types";
import { AlertCircle, CheckCircle, Clock, Info } from "lucide-react";

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

export function TrainLineCard({ line, status, onSelect }: TrainLineCardProps) {
  const isDisrupted = status?.status !== "normal";

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
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{lineNames[line]}</h3>
            {status?.status === "major" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Major delays
              </span>
            )}
            {status?.status === "minor" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Minor delays
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <p>
              {status ? (
                new Date(status.timestamp).toLocaleString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  month: "short",
                  day: "numeric",
                })
              ) : (
                "Updating..."
              )}
            </p>
          </div>
        </div>
        {status ? (
          isDisrupted ? (
            <AlertCircle className="text-mbta-red h-6 w-6 shrink-0" />
          ) : (
            <CheckCircle className="text-mbta-green h-6 w-6 shrink-0" />
          )
        ) : null}
      </div>

      {status && (
        <div className="mt-4 space-y-2">
          <p className={`text-sm ${
            isDisrupted ? "text-mbta-red" : "text-gray-600"
          }`}>
            {status.description || "Service operating normally"}
          </p>
          {isDisrupted && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Info className="h-4 w-4" />
              <p>Tap for more details</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
