import { ModalShell } from '../shared/ui/ModalShell';
import { AlgorithmMatcherPanel } from '../features/matcher/components/AlgorithmMatcherPanel';

interface AlgorithmMatcherModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTopic?: (topicId: string) => void;
}

export function AlgorithmMatcherModal({
  open,
  onClose,
  onSelectTopic,
}: AlgorithmMatcherModalProps) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Algorithm Matcher · Constraint & Pattern Parser"
      subtitle="Paste a problem description or tune constraints to extract complexity ceilings and jump directly to Algorithms Studio."
      maxWidthClass="max-w-5xl"
    >
      <AlgorithmMatcherPanel
        mode="modal"
        onNavigateDone={onClose}
        onSelectTopic={onSelectTopic}
      />
    </ModalShell>
  );
}
