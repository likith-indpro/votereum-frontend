import { useState } from "react";
import { useBlockchain } from "../../context/BlockchainContext";

interface CandidateAdditionFormProps {
  electionId: string;
  numericElectionId: number;
  onSuccess: () => void;
}

const CandidateAdditionForm = ({
  electionId,
  numericElectionId,
  onSuccess,
}: CandidateAdditionFormProps) => {
  const { addCandidate } = useBlockchain();
  const [name, setName] = useState("");
  const [metadata, setMetadata] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!name) {
        throw new Error("Candidate name is required");
      }

      // If no metadata is provided, create a simple JSON object with the name
      const candidateMetadata = metadata || JSON.stringify({ name });

      // Add the candidate to the election
      await addCandidate(
        electionId,
        numericElectionId,
        name,
        candidateMetadata
      );

      // Reset the form
      setName("");
      setMetadata("");

      // Notify parent component
      onSuccess();
    } catch (err: any) {
      console.error("Error adding candidate:", err);
      setError(err.message || "Failed to add candidate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Add a Candidate</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
            Candidate Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter candidate name"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="metadata"
          >
            Metadata (Optional)
          </label>
          <textarea
            id="metadata"
            className="w-full p-2 border rounded"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            disabled={loading}
            placeholder="Enter additional metadata such as IPFS image URL, candidate bio, etc."
            rows={3}
          />
          <p className="text-sm text-gray-500 mt-1">
            Metadata can include additional information like candidate image
            URL, bio, etc.
          </p>
        </div>

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Candidate"}
        </button>
      </form>
    </div>
  );
};

export default CandidateAdditionForm;
