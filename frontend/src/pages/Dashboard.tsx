import { motion } from "framer-motion";

const Dashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your Votereum dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Elections Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            Active Elections
          </h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
          <p className="text-sm text-gray-500 mt-1">
            Current ongoing elections
          </p>
        </motion.div>

        {/* Your Votes Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500"
        >
          <h2 className="text-lg font-semibold text-gray-800">Your Votes</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">5</p>
          <p className="text-sm text-gray-500 mt-1">
            Elections you've participated in
          </p>
        </motion.div>

        {/* Wallet Balance Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            Wallet Balance
          </h2>
          <p className="text-3xl font-bold text-purple-600 mt-2">1.24 ETH</p>
          <p className="text-sm text-gray-500 mt-1">Current balance</p>
        </motion.div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="rounded-full bg-blue-100 p-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Voted in Presidential Election
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Transaction: 0x1a2...3f4
                    </p>
                    <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Elections Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Upcoming Elections
        </h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  name: "Presidential Election",
                  startDate: "May 20, 2025",
                  endDate: "June 20, 2025",
                  status: "Upcoming",
                },
                {
                  name: "Local Board Election",
                  startDate: "May 15, 2025",
                  endDate: "May 30, 2025",
                  status: "Active",
                },
                {
                  name: "Student Council",
                  startDate: "June 1, 2025",
                  endDate: "June 15, 2025",
                  status: "Upcoming",
                },
              ].map((election, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {election.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {election.startDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {election.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        election.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {election.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
