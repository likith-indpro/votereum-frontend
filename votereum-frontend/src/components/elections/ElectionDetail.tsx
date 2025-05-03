import { useState, useEffect } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';
import CandidateList from './CandidateList';

interface ElectionDetailProps {
  electionId: string;
  numericElectionId: number;
  onBack: () => void;
}

const ElectionDetail = ({ electionId, numericElectionId, onBack }: ElectionDetailProps) => {
  const { getElection, getCandidates, hasVoted, vote } = useBlockchain();
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchElectionDetails = async () => {
      try {
        setIsLoading(true);
        const electionData = await getElection(electionId, numericElectionId);
        setElection(electionData);

        // Check if user has voted
        const voted = await hasVoted(electionId, numericElectionId);
        setUserHasVoted(voted);

        // Get candidates
        const candidateData = await getCandidates(electionId, numericElectionId);
        setCandidates(candidateData);
      } catch (e) {
        console.error("Failed to fetch election details:", e);
        setError("Failed to load election details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchElectionDetails();
  }, [getElection, getCandidates, hasVoted, electionId, numericElectionId]);

  const handleVote = async () => {
    if (selectedCandidate === null) {
      setError("Please select a candidate to vote for.");
      return;
    }

    try {
      setIsVoting(true);
      setError(null);
      
      await vote(electionId, numericElectionId, selectedCandidate);
      
      setSuccessMessage("Your vote has been recorded successfully!");
      setUserHasVoted(true);
      
      // Refresh election data
      const updatedElection = await getElection(electionId, numericElectionId);
      setElection(updatedElection);
      
      // Refresh candidates data
      const updatedCandidates = await getCandidates(electionId, numericElectionId);
      setCandidates(updatedCandidates);
    } catch (e) {
      console.error("Failed to cast vote:", e);
      setError("Failed to cast your vote. Please try again later.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleSelectCandidate = (candidateId: number) => {
    setSelectedCandidate(candidateId);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 mb-4" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-gray-600">Loading election details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-semibold mb-2">Election Not Found</h3>
        <p className="text-gray-600 mb-4">The requested election could not be found.</p>
        <button 
          onClick={onBack}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        ></button>
          Back to Elections
        </button>
      </div>
    );
  }

  const startDate = new Date(election.startTime * 1000);
  const endDate = new Date(election.endTime * 1000);
  const now = new Date();
  
  const isActive = now >= startDate && now <= endDate && !election.finalized;
  const isUpcoming = now < startDate;
  const isEnded = now > endDate || election.finalized;

  return (
    <div>
      <button 
        onClick={onBack} 
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Elections
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{election.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isActive ? 'bg-green-100 text-green-800' : 
              isUpcoming ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Ended'}
            </span>
          </div>
          
          <p className="text-gray-600 mb-6">{election.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Election Details</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"></svg>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span><strong>Start Date:</strong> {startDate.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span><strong>End Date:</strong> {endDate.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span><strong>Candidates:</strong> {election.candidateCount}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Voting Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span><strong>Total Votes:</strong> {election.totalVotes}</span>
                </div>
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span><strong>Status:</strong> {election.finalized ? 'Finalized' : 'In Progress'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span><strong>Your Status:</strong> {userHasVoted ? 'Voted' : 'Not Voted'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{successMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Candidates</h3>
          <CandidateList 
            candidates={candidates} 
            selectedCandidate={selectedCandidate} 
            onSelectCandidate={handleSelectCandidate}
            showVotes={isEnded || election.finalized}
            disableSelection={userHasVoted || !isActive}
          />

          {isActive && !userHasVoted && (
            <div className="mt-6">
              <button
                onClick={handleVote}
                disabled={isVoting || selectedCandidate === null}
                className={`w-full py-2 px-4 rounded font-bold ${
                  isVoting || selectedCandidate === null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-700 text-white transition duration-300'
                }`}
              >
                {isVoting ? 'Submitting Vote...' : 'Submit Vote'}
              </button>
              {selectedCandidate === null && (
                <p className="text-sm text-gray-500 mt-2 text-center">Select a candidate to vote</p>
              )}
            </div>
          )}

          {!isActive && isUpcoming && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-center text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                This election has not started yet. Voting begins on {startDate.toLocaleDateString()}.
              </p>
            </div>
          )}

          {userHasVoted && isActive && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-center text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You have already cast your vote for this election.
              </p>
            </div>
          )}

          {isEnded && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4">
              <p className="text-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                This election has ended. Results are displayed above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectionDetail;
