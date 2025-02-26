
import { motion } from "framer-motion";
import { Disruption } from "@/lib/types";
import { X, Clock, MapPin, AlertTriangle, ExternalLink } from "lucide-react";

interface DisruptionDetailProps {
  disruption: Disruption;
  onClose: () => void;
}

export function DisruptionDetail({ disruption, onClose }: DisruptionDetailProps) {
  const startDate = new Date(disruption.startTime);
  const endDate = disruption.endTime ? new Date(disruption.endTime) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-x-0 bottom-0 p-6 bg-white/90 backdrop-blur-lg rounded-t-2xl shadow-lg z-50 max-h-[90vh] overflow-y-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-mbta-red" />
            <span className="text-sm font-medium text-mbta-red">Service Alert</span>
          </div>
          <h2 className="text-xl font-semibold">{disruption.reason}</h2>
        </div>

        <div className="space-y-4 bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-gray-500 mt-1" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">Timeline</p>
              <p className="text-sm text-gray-600">
                Started: {startDate.toLocaleString()}
              </p>
              {endDate && (
                <p className="text-sm text-gray-600">
                  Expected end: {endDate.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {disruption.affectedStations.length > 0 && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-1" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">Affected Stations</p>
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
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Details</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{disruption.description}</p>
        </div>

        <a
          href="https://www.mbta.com/alerts"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ExternalLink className="h-4 w-4" />
          View on MBTA website
        </a>
      </div>
    </motion.div>
  );
}
