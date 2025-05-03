import { useState } from "react";
import { useBlockchain } from "../../context/BlockchainContext";
import { ethers } from "ethers";

interface ElectionCreationFormProps {
  onSuccess: (electionId: string, numericElectionId: number) => void;
}

const ElectionCreationForm = ({ onSuccess }: ElectionCreationFormProps) => {
  const { createVotingSystem, createElection } = useBlockchain();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!title || !description || !startDate || !endDate) {
        throw new Error("Please fill in all required fields");
      }

      const startTime = new Date(startDate).getTime() / 1000;
      const endTime = new Date(endDate).getTime() / 1000;

      if (startTime >= endTime) {
        throw new Error("End time must be later than start time");
      }

      if (startTime <= Date.now() / 1000) {
        throw new Error("Start time must be in the future");
      }

      // Create a unique ID for the election (using ethers.js to generate a hash)
      const electionId = ethers.id(`election-${title}-${Date.now()}`);

      // Create a new voting system
      const votingSystemAddress = await createVotingSystem();
      console.log("Voting system created at:", votingSystemAddress);

      // Create the election
      const receipt = await createElection(
        electionId,
        votingSystemAddress,
        title,
        description,
        Math.floor(startTime),
        Math.floor(endTime)
      );

      console.log("Election created:", receipt);

      // Get the numeric election ID from events (this would typically be 1 for a new voting system)
      const numericElectionId = 1;

      // Call the onSuccess callback with the election ID
      onSuccess(electionId, numericElectionId);

      // Reset the form
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
    } catch (err: any) {
      console.error("Error creating election:", err);
      setError(err.message || "Failed to create election. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Create a New Election</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
            Election Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter election title"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter election description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="startDate"
            >
              Start Date & Time
            </label>
            <input
              id="startDate"
              type="datetime-local"
              className="w-full p-2 border rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="endDate"
            >
              End Date & Time
            </label>
            <input
              id="endDate"
              type="datetime-local"
              className="w-full p-2 border rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Election"}
        </button>
      </form>
    </div>
  );
};

export default ElectionCreationForm;
