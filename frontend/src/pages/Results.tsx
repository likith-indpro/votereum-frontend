import { motion } from "framer-motion";

const Results = () => {
  const electionResults = [
    {
      id: 1,
      title: "Corporate Board Election",
      completed: "May 5, 2025",
      totalVotes: 1253,
      candidates: [
        { id: 1, name: "John Smith", votes: 523, percentage: 41.7 },
        { id: 2, name: "Sarah Johnson", votes: 489, percentage: 39.0 },
        { id: 3, name: "Michael Brown", votes: 241, percentage: 19.3 },
      ],
      winner: "John Smith",
    },
    {
      id: 2,
      title: "School Board Election",
      completed: "April 15, 2025",
      totalVotes: 836,
      candidates: [
        { id: 1, name: "Emily Davis", votes: 418, percentage: 50.0 },
        { id: 2, name: "Robert Wilson", votes: 312, percentage: 37.3 },
        { id: 3, name: "Jennifer Lee", votes: 106, percentage: 12.7 },
      ],
      winner: "Emily Davis",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Election Results</h1>
        <p className="text-gray-600 mt-2">
          View completed elections and their results
        </p>
      </div>

      <div className="space-y-8">
        {electionResults.map((election) => (
          <motion.div
            key={election.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: election.id * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-800">
                {election.title}
              </h2>
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Winner: {election.winner}
                </span>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-500">
              Completed on {election.completed} • {election.totalVotes} total
              votes
            </div>

            <div className="mt-6 space-y-5">
              {election.candidates.map((candidate) => (
                <div key={candidate.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium flex items-center">
                      {candidate.name}
                      {election.winner === candidate.name && (
                        <svg
                          className="w-4 h-4 text-yellow-500 ml-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      )}
                    </div>
                    <div className="text-sm">
                      {candidate.votes} votes ({candidate.percentage}%)
                    </div>
                  </div>
                  <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-4 ${
                        election.winner === candidate.name
                          ? "bg-blue-600"
                          : "bg-blue-400"
                      } rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${candidate.percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                View transaction details
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Results;
