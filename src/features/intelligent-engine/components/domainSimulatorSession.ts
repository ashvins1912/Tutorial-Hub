export type DomainPredictionFeedback = { correct: boolean; answer: string; expected: string; rationale: string };
export type DomainSimulatorSession = {
  step: number;
  choice: string;
  feedback: DomainPredictionFeedback | null;
  correctPredictions: number;
  answeredPredictions: number;
};

export function createDomainSimulatorSession(): DomainSimulatorSession {
  return { step: 0, choice: '', feedback: null, correctPredictions: 0, answeredPredictions: 0 };
}

export function chooseDomainPrediction(session: DomainSimulatorSession, choice: string): DomainSimulatorSession {
  return { ...session, choice, feedback: null };
}

export function revealDomainPrediction(
  session: DomainSimulatorSession,
  prediction: { correctOption: string; rationale: string } | undefined,
  finalStep: number,
): DomainSimulatorSession {
  if (!prediction || !session.choice || session.step >= finalStep) return session;
  const correct = session.choice === prediction.correctOption;
  return {
    ...session,
    step: session.step + 1,
    choice: '',
    feedback: { correct, answer: session.choice, expected: prediction.correctOption, rationale: prediction.rationale },
    correctPredictions: session.correctPredictions + (correct ? 1 : 0),
    answeredPredictions: session.answeredPredictions + 1,
  };
}

export function previousDomainStep(session: DomainSimulatorSession): DomainSimulatorSession {
  if (session.step === 0) return session;
  return { ...session, step: session.step - 1, choice: '', feedback: null };
}
