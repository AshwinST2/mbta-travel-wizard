
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { fetchLineStatuses, fetchDisruption } from "@/lib/api";
import { TrainLineCard } from "@/components/TrainLineCard";
import { DisruptionDetail } from "@/components/DisruptionDetail";
import { Disruption, LineStatus, TrainLine } from "@/lib/types";
import { Loader2 } from "lucide-react";

const LINES: TrainLine[] = ["red", "blue", "orange", "green"];

export default function Index() {
  const [selectedDisruption, setSelectedDisruption] = useState<Disruption | null>(null);

  const { data: statuses, isLoading, error } = useQuery({
    queryKey: ["lineStatuses"],
    queryFn: fetchLineStatuses,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const getLineStatus = (line: TrainLine): LineStatus | null => {
    return statuses?.find((status) => status.line === line) || null;
  };

  const handleLineSelect = async (line: TrainLine) => {
    const status = getLineStatus(line);
    if (status?.id) {
      const disruption = await fetchDisruption(status.id);
      if (disruption) {
        setSelectedDisruption(disruption);
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-red-500">Unable to load train line statuses</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <header className="max-w-2xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            MBTA Line Status
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time updates for Boston's train lines
          </p>
        </motion.div>
      </header>

      <main className="max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid gap-4">
            {LINES.map((line, index) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TrainLineCard
                  line={line}
                  status={getLineStatus(line)}
                  onSelect={() => handleLineSelect(line)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedDisruption && (
          <DisruptionDetail
            disruption={selectedDisruption}
            onClose={() => setSelectedDisruption(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
