import { useState, useEffect } from "react";
import { searchGithub, searchGithubUser } from "../api/API";
import Candidate from "../interfaces/Candidate.interface";

const CandidateSearch = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [potentialCandidates, setPotentialCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const transformUserToCandidate = async (user: { login: string; id: number; avatar_url: string; html_url: string; }): Promise<Candidate> => {
    const detailedUser = await searchGithubUser(user.login);
    return {
      id: user.id,
      name: detailedUser.name || "Unknown",
      username: user.login,
      location: detailedUser.location || "Unknown",
      avatar: user.avatar_url,
      email: detailedUser.email || "Not Available",
      html_url: user.html_url,
      company: detailedUser.company || "Unknown",
    };
  };

  const fetchCandidates = async () => {
    try {
      setError(null);
      setLoading(true);
      const rawUsers = await searchGithub();
      const transformedCandidates = await Promise.all(
        rawUsers.map((user: { login: string; id: number; avatar_url: string; html_url: string; }) => transformUserToCandidate(user))
      );
      setCandidates(transformedCandidates);
    } catch {
      setError("Failed to load candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSave = () => {
    if (candidates.length > 0) {
      const [currentCandidate, ...rest] = candidates;
      setPotentialCandidates([...potentialCandidates, currentCandidate]);
      setCandidates(rest);
    }
  };

  const handleSkip = () => {
    if (candidates.length > 0) {
      const [, ...rest] = candidates;
      setCandidates(rest);
    }
  };

  useEffect(() => {
    localStorage.setItem("potentialCandidates", JSON.stringify(potentialCandidates));
  }, [potentialCandidates]);

  if (loading) return <div>Loading candidates...</div>;
  if (error) return <div>{error}</div>;
  if (candidates.length === 0) return <div>No more candidates available!</div>;

  const currentCandidate = candidates[0];

  return (
    <div>
      <h2>Candidate Review</h2>
      <div>
        <img src={currentCandidate.avatar} alt={`${currentCandidate.name}'s avatar`} />
        <h3>{currentCandidate.name}</h3>
        <p>Username: {currentCandidate.username}</p>
        <p>Location: {currentCandidate.location}</p>
        <p>Email: {currentCandidate.email}</p>
        <p>Company: {currentCandidate.company}</p>
        <a href={currentCandidate.html_url} target="_blank" rel="noopener noreferrer">
          Profile Link
        </a>
      </div>
      <button onClick={handleSave}>+</button>
      <button onClick={handleSkip}>-</button>
    </div>
  );
};

export default CandidateSearch;
