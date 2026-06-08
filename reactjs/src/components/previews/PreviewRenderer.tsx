import React from 'react';
import type { Invitation } from '../../api/invitations';
import { GardenRomancePreview }    from './GardenRomancePreview';
import { MidnightElegancePreview } from './MidnightElegancePreview';
import { RusticCharmPreview }      from './RusticCharmPreview';
import { BeachBlissPreview }       from './BeachBlissPreview';
import { ClassicWhitePreview }     from './ClassicWhitePreview';
import { GoldenLuxePreview }       from './GoldenLuxePreview';

const PREVIEW_MAP: Record<string, React.ComponentType<{ invitation: Invitation }>> = {
  'garden-romance':    GardenRomancePreview,
  'midnight-elegance': MidnightElegancePreview,
  'rustic-charm':      RusticCharmPreview,
  'beach-bliss':       BeachBlissPreview,
  'classic-white':     ClassicWhitePreview,
  'golden-luxe':       GoldenLuxePreview,
};

interface Props { invitation: Invitation; }

export function PreviewRenderer({ invitation }: Props) {
  const Component = PREVIEW_MAP[invitation.template.slug];
  if (!Component) {
    return (
      <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
        Preview not available for this template.
      </div>
    );
  }
  return <Component invitation={invitation} />;
}
