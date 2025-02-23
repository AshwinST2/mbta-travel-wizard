
import { motion } from "framer-motion";
import { Disruption } from "@/lib/types";
import { X, Clock, MapPin } from "lucide-react";

interface DisruptionDetailProps {
  disruption: Disruption;
  onClose: () => void;
}

export function DisruptionDetail({ disruption, onClose }: DisruptionDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-x-0 bottom-0 p-6 bg-white/90 backdrop-blur-lg rounded-t-2xl shadow-lg z-50"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <span className="text-sm font-medium text-gray-500">Service Alert</span>
          <h2 className="text-xl font-semibold mt-1">{disruption.reason}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">
              Started: {new Date(disruption.startTime).toLocaleString()}
            </p>
            {disruption.endTime && (
              <p className="text-sm text-gray-600">
                Expected end: {new Date(disruption.endTime).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {disruption.affectedStations.length > 0 && (
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-700">Affected Stations:</p>
              <ul className="mt-1 space-y-1">
                {disruption.affectedStations.map((station) => (
                  <li key={station} className="text-sm text-gray-600">
                    {station}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <p className="text-gray-600 text-sm">{disruption.description}</p>
      </div>
    </motion.div>
  );
}
