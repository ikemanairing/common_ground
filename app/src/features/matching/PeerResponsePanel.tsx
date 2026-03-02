import { useEffect, useMemo, useState } from "react";

export type PeerResponseItem = {
  id: string;
  name: string;
  answer: string;
  detail?: string;
};

type PeerResponsePanelProps = {
  peers: PeerResponseItem[];
  initialPeerId?: string;
  onChangePeer?: (peer: PeerResponseItem, index: number) => void;
};

const EMPTY_PEER: PeerResponseItem = {
  id: "peer-empty",
  name: "친구",
  answer: "아직 공유된 답변이 없어요.",
  detail: "조금 뒤에 다시 확인해 주세요.",
};

const PeerResponsePanel = ({
  peers,
  initialPeerId,
  onChangePeer,
}: PeerResponsePanelProps) => {
  const normalizedPeers = useMemo(() => {
    const filtered = peers.filter((peer) => {
      return Boolean(peer) && (peer.name.trim().length > 0 || peer.answer.trim().length > 0);
    });
    return filtered.length > 0 ? filtered : [EMPTY_PEER];
  }, [peers]);

  const initialIndex = useMemo(() => {
    if (!initialPeerId) {
      return 0;
    }
    const found = normalizedPeers.findIndex((peer) => peer.id === initialPeerId);
    return found >= 0 ? found : 0;
  }, [initialPeerId, normalizedPeers]);

  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  const activePeer = normalizedPeers[activeIndex] ?? normalizedPeers[0];

  const handleSelect = (index: number) => {
    setActiveIndex(index);
    const selectedPeer = normalizedPeers[index];
    if (selectedPeer) {
      onChangePeer?.(selectedPeer, index);
    }
  };

  return (
    <section className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {normalizedPeers.map((peer, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={`${peer.id}-${index}`}
              type="button"
              onClick={() => handleSelect(index)}
              className={[
                "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition",
                isActive
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 text-orange-800 hover:bg-orange-200",
              ].join(" ")}
            >
              {peer.name}
            </button>
          );
        })}
      </div>

      <article className="rounded-xl border border-orange-100 bg-orange-50 p-4">
        <p className="text-base font-semibold text-slate-900">{activePeer.answer}</p>
        {activePeer.detail ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{activePeer.detail}</p>
        ) : null}
      </article>
    </section>
  );
};

export default PeerResponsePanel;
