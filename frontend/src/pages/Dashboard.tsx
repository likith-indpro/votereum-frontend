import { motion } from "framer-motion";

const Dashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">
              ACTIVE ELECTIONS
            </h2>
            <span className="bg-blue-50 text-[#66B0FF] text-xs font-medium py-1 px-2 rounded">
              Live
            </span>
          </div>
          <p className="text-3xl font-semibold text-gray-800 mt-2">3</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <span className="text-green-500 mr-1">+2</span> since last month
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">YOUR VOTES</h2>
            <span className="bg-green-50 text-green-600 text-xs font-medium py-1 px-2 rounded">
              Verified
            </span>
          </div>
          <p className="text-3xl font-semibold text-gray-800 mt-2">5</p>
          <p className="text-sm text-gray-500 mt-1">
            Elections participated in
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">
              WALLET BALANCE
            </h2>
            <span className="bg-purple-50 text-purple-600 text-xs font-medium py-1 px-2 rounded">
              ETH
            </span>
          </div>
          <p className="text-3xl font-semibold text-gray-800 mt-2">1.24</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <span className="text-red-500 mr-1">-0.05</span> past 24h
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">GAS USED</h2>
            <span className="bg-gray-50 text-gray-600 text-xs font-medium py-1 px-2 rounded">
              Gwei
            </span>
          </div>
          <p className="text-3xl font-semibold text-gray-800 mt-2">42.8</p>
          <p className="text-sm text-gray-500 mt-1">Last transaction</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">
                Recent Activity
              </h2>
              <button className="text-sm text-[#66B0FF] font-medium">
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                {
                  action: "Voted in Presidential Election",
                  time: "3 hours ago",
                  tx: "0x1a2...3f4",
                },
                {
                  action: "Registered for Local Board Election",
                  time: "1 day ago",
                  tx: "0xb73...e29",
                },
                {
                  action: "Voted in Corporate Board Election",
                  time: "3 days ago",
                  tx: "0x8f1...d45",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="rounded-full bg-[#EFF8FF] p-2 flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-[#66B0FF]"
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
                        {item.action}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Transaction: {item.tx}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Elections */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-800">
                Upcoming Elections
              </h2>
            </div>
            <div className="p-4">
              {[
                {
                  name: "Presidential Election",
                  date: "May 20, 2025",
                  daysLeft: 13,
                  color: "bg-yellow-500",
                },
                {
                  name: "Local Board Election",
                  date: "May 15, 2025",
                  daysLeft: 8,
                  color: "bg-green-500",
                },
                {
                  name: "Student Council",
                  date: "June 1, 2025",
                  daysLeft: 25,
                  color: "bg-indigo-500",
                },
              ].map((election, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex items-center mb-1">
                    <div
                      className={`w-3 h-3 rounded-full ${election.color} mr-2`}
                    ></div>
                    <h3 className="text-sm font-medium text-gray-800">
                      {election.name}
                    </h3>
                  </div>
                  <div className="pl-5 flex justify-between text-xs">
                    <span className="text-gray-500">{election.date}</span>
                    <span className="text-[#66B0FF] font-medium">
                      {election.daysLeft} days left
                    </span>
                  </div>
                  <div className="mt-2 pl-5 relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                      <div
                        style={{
                          width: `${100 - (election.daysLeft / 30) * 100}%`,
                        }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${election.color}`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">System Status</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <div className="text-sm font-medium text-gray-500 mb-1">
                NETWORK
              </div>
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                <span className="text-sm font-medium text-gray-800">
                  Ethereum Mainnet
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Connected: Block #21034583
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium text-gray-500 mb-1">
                SMART CONTRACT
              </div>
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                <span className="text-sm font-medium text-gray-800">
                  Operational
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Latest update: 3 hours ago
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium text-gray-500 mb-1">
                API SERVICES
              </div>
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                <span className="text-sm font-medium text-gray-800">
                  All Systems Normal
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                100% uptime last 24h
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
