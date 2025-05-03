import { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';

interface ElectionListProps {
  onSelectElection: (electionId: string, numericElectionId: number) => void;
}

const ElectionList = ({ onSelectElection }: ElectionListProps) => {
  const { getAllVotingSystems, getElection } = useBlockchain();
  const [isLoading, setIsLoading] = useState(true);
  const [elections, setElections] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setIsLoading(true);
        const votingSystems = await getAllVotingSystems();
        
        // For each voting system, try to get its elections
        const fetchedElections = [];
        
        for (const systemAddress of votingSystems) {
          try {
            // For simplicity, we're assuming each voting system has at most 10 elections
            // In a real app, you would need pagination or a way to get the total count first
            for (let i = 1; i <= 10; i++) {
              try {
                const election = await getElection(systemAddress, i);
                fetchedElections.push({
                  id: systemAddress,
                  numericId: i,
                  ...election
                });
              } catch (e) {
                // If we get an error, we've likely reached the end of elections for this system
                break;
              }
            }
          } catch (e) {
            console.error(`Error fetching elections for system ${systemAddress}:`, e);
            continue;
          }
        }
        
        setElections(fetchedElections);
      } catch (e) {
        console.error("Failed to fetch elections:", e);
        setError("Failed to load elections. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchElections();
  }, [getAllVotingSystems, getElection]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 mb-4" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-gray-600">Loading elections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-sm font-semibold underline mt-2"
        >
          Try again
        </button>
      </div>
    );
  }

  if (elections.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-semibold mb-2">No Elections Found</h3>
        <p className="text-gray-600 mb-6">There are currently no elections available on the blockchain.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {elections.map((election) => {
        const startDate = new Date(election.startTime * 1000);
        const endDate = new Date(election.endTime * 1000);
        const now = new Date();
        
        let status = "upcoming";
        if (election.finalized) {
          status = "completed";
        } else if (now > endDate) {
          status = "ended";
        } else if (now >= startDate && now <= endDate) {
          status = "active";
        }

        return (
            <>
          <div 
            key={`${election.id}-${election.numericId}`}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4"></div>
                <h3 className="text-xl font-bold">{election.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  status === 'active' ? 'bg-green-100 text-green-800' : 
                  status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  status === 'ended' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{election.description}</p>
              
              <div className="text-sm text-gray-500 mb-4">
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"></svg>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Start: {startDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>End: {endDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Candidates: {election.candidateCount}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Total Votes: {election.totalVotes}</span>
                </div>
              </div>
              
              <button
                onClick={() => onSelectElection(election.id, election.numericId)}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                View Election
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ElectionList;
