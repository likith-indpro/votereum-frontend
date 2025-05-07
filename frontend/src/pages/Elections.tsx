import { motion } from "framer-motion";

const Elections = () => {
  const elections = [
    {
      id: 1,
      title: "Presidential Election",
      description: "Vote for the next president of the country.",
      startDate: "May 20, 2025",
      endDate: "June 20, 2025",
      status: "Upcoming",
    },
    {
      id: 2,
      title: "Local Board Election",
      description: "Election for local community board members.",
      startDate: "May 15, 2025",
      endDate: "May 30, 2025",
      status: "Active",
    },
    {
      id: 3,
      title: "Student Council",
      description: "Vote for student representatives.",
      startDate: "June 1, 2025",
      endDate: "June 15, 2025",
      status: "Upcoming",
    },
    {
      id: 4,
      title: "Corporate Board Election",
      description: "Annual election for board of directors.",
      startDate: "April 5, 2025",
      endDate: "May 5, 2025",
      status: "Completed",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Elections</h1>
        <p className="text-gray-600 mt-2">View all available elections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {elections.map((election) => (
          <motion.div
            key={election.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold text-gray-800">
                {election.title}
              </h2>
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  election.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : election.status === "Upcoming"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {election.status}
              </span>
            </div>
            <p className="text-gray-600 mt-2">{election.description}</p>
            <div className="mt-4 flex flex-col gap-1">
              <div className="text-sm">
                <span className="text-gray-500">Start:</span>{" "}
                <span className="font-medium">{election.startDate}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">End:</span>{" "}
                <span className="font-medium">{election.endDate}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className={`px-4 py-2 rounded-md text-white ${
                  election.status === "Active"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : election.status === "Upcoming"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={election.status !== "Active"}
              >
                {election.status === "Active"
                  ? "Vote Now"
                  : election.status === "Upcoming"
                    ? "Coming Soon"
                    : "Completed"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Elections;
