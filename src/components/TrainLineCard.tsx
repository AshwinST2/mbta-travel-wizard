
import { motion } from "framer-motion";
import { LineStatus, TrainLine } from "@/lib/types";
import { AlertCircle, CheckCircle } from "lucide-react";

interface TrainLineCardProps {
  line: TrainLine;
  status: LineStatus | null;
  onSelect: () => void;
}

const lineColors = {
  red: "bg-mbta-red",
  blue: "bg-mbta-blue",
  orange: "bg-mbta-orange",
  green: "bg-mbta-green",
};

const lineNames = {
  red: "Red Line",
  blue: "Blue Line",
  orange: "Orange Line",
  green: "Green Line",
};

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
        <div>
          <h3 className="text-lg font-semibold mb-1">{lineNames[line]}</h3>
          <p className="text-sm text-gray-500">
            {status ? (
              new Date(status.timestamp).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })
            ) : (
              "Updating..."
            )}
          </p>
        </div>
        {status ? (
          isDisrupted ? (
            <AlertCircle className="text-mbta-red h-6 w-6" />
          ) : (
            <CheckCircle className="text-mbta-green h-6 w-6" />
          )
        ) : null}
      </div>
      {status && (
        <p className={`mt-4 text-sm ${
          isDisrupted ? "text-mbta-red" : "text-gray-600"
        }`}>
          {status.description || "Service operating normally"}
        </p>
      )}
    </motion.div>
  );
}
