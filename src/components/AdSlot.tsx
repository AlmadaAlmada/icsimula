interface AdSlotProps {
  /** Identificador do espaço publicitário (útil para integração futura com uma rede de anúncios). */
  slot: 'topo' | 'lateral' | 'rodape';
}

const SIZES: Record<AdSlotProps['slot'], string> = {
  topo: '728 × 90',
  lateral: '300 × 250',
  rodape: '970 × 90',
};

/**
 * Espaço reservado para anúncio/conteúdo patrocinado.
 * A monetização não é implementada — o componente apenas reserva a área no layout.
 */
export function AdSlot({ slot }: AdSlotProps) {
  return (
    <aside className={`ad ad--${slot}`} aria-label="Espaço publicitário" data-ad-slot={slot}>
      <span className="ad__tag">Publicidade</span>
      {/* eslint-disable-next-line security/detect-object-injection -- slot é uma união literal tipada */}
      <span className="ad__size">Anuncie aqui · {SIZES[slot]}</span>
    </aside>
  );
}
