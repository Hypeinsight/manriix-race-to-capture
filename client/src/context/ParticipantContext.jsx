import { createContext, useContext, useState } from 'react';

const ParticipantContext = createContext();

export function ParticipantProvider({ children }) {
  const [participant, setParticipant] = useState(() => {
    try {
      const saved = localStorage.getItem('manriix-participant');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const updateParticipant = (data) => {
    setParticipant(data);
    localStorage.setItem('manriix-participant', JSON.stringify(data));
  };

  const clearParticipant = () => {
    setParticipant(null);
    localStorage.removeItem('manriix-participant');
  };

  /** Determine which step to resume at based on completed flags */
  const getResumeStep = () => {
    if (!participant) return 1;
    if (!participant.step2_completed) return 2;
    if (!participant.step3_completed) return 3;
    if (!participant.step4_completed) return 4;
    return null; // all done
  };

  return (
    <ParticipantContext.Provider value={{ participant, updateParticipant, clearParticipant, getResumeStep }}>
      {children}
    </ParticipantContext.Provider>
  );
}

export const useParticipant = () => useContext(ParticipantContext);
