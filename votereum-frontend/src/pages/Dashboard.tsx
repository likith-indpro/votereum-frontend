import { useState, useEffect } from "react";

interface ElectionStats {
  totalVoters: number;
  votesSubmitted: number;
  activeElections: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<ElectionStats>({
    totalVoters: 0,
    votesSubmitted: 0,
    activeElections: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data from Directus REST API
    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with your actual Directus REST API endpoint
        const response = await fetch(
          `${import.meta.env.VITE_DIRECTUS_URL}/items/election_stats`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch election stats");
        }
        const data = await response.json();
        setStats({
          totalVoters: data.data.total_voters || 0,
          votesSubmitted: data.data.votes_submitted || 0,
          activeElections: data.data.active_elections || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Use placeholder data for development
        setStats({
          totalVoters: 1500,
          votesSubmitted: 843,
          activeElections: 2,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Election Dashboard</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700">
                Total Registered Voters
              </h2>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.totalVoters}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700">
                Votes Submitted
              </h2>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.votesSubmitted}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700">
                Active Elections
              </h2>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.activeElections}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Recent Elections</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Election
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Student Council Election
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Apr 28, 2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      May 10, 2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">62%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Faculty Board Election
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Apr 30, 2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      May 15, 2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">41%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Budget Committee
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">Apr 1, 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Apr 15, 2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">78%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
