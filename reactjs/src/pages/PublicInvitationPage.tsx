import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicInvitation } from '../api/invitations';
import { PreviewRenderer } from '../components/previews/PreviewRenderer';
import styles from './PublicInvitationPage.module.css';

export function PublicInvitationPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: invitation, isLoading, isError, error } = useQuery({
    queryKey: ['public-invitation', slug],
    queryFn: () => fetchPublicInvitation(slug!),
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className={styles.centred}>
        <div className={styles.spinner} aria-label="Loading" />
        <p>Loading invitation…</p>
      </div>
    );
  }

  if (isError) {
    const isNotFound = (error as Error).message === 'NOT_FOUND';
    return (
      <div className={styles.centred}>
        <div className={styles.notFoundIcon} aria-hidden="true">💌</div>
        <h1 className={styles.notFoundTitle}>
          {isNotFound ? 'Invitation not found' : 'Something went wrong'}
        </h1>
        <p className={styles.notFoundMsg}>
          {isNotFound
            ? 'This invitation link may be invalid or the invitation has not been published yet.'
            : 'Please try again later.'}
        </p>
      </div>
    );
  }

  if (!invitation) return null;

  const date = new Date(invitation.weddingDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Template-styled invitation preview */}
        <div className={styles.previewSection}>
          <PreviewRenderer invitation={invitation} />
        </div>

        {/* Gallery / preview image section */}
        {invitation.template?.previewImage && (
          <section className={styles.gallery} aria-label="Template preview">
            <h2 className={styles.galleryTitle}>Wedding Preview</h2>
            <img
              src={invitation.template.previewImage}
              alt={`${invitation.title} — ${invitation.template.name} design`}
              className={styles.galleryImage}
            />
          </section>
        )}

        {/* Structured wedding details for guests */}
        <section className={styles.details} aria-label="Wedding details">
          <h2 className={styles.detailsTitle}>Wedding Details</h2>
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt>Couple</dt>
              <dd>{invitation.brideName} &amp; {invitation.groomName}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Date</dt>
              <dd>{date}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Time</dt>
              <dd>{invitation.weddingTime}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Venue</dt>
              <dd>{invitation.venue}</dd>
            </div>
          </dl>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Made with ❤️ on Eventy</p>
      </footer>
    </div>
  );
}
