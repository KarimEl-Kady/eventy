import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInvitation, publishInvitation, fetchRsvps } from '../api/invitations';
import type { Rsvp } from '../api/invitations';
import { PreviewRenderer } from '../components/previews/PreviewRenderer';
import styles from './InvitationDetailPage.module.css';

export function InvitationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invitation, isLoading, isError } = useQuery({
    queryKey: ['invitation', id],
    queryFn: () => fetchInvitation(id!),
    enabled: !!id,
  });

  const { data: rsvps = [] } = useQuery<Rsvp[]>({
    queryKey: ['rsvps', id],
    queryFn: () => fetchRsvps(id!),
    enabled: !!id,
  });

  const queryClient = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: () => publishInvitation(id!),
    onSuccess: (updated) => {
      queryClient.setQueryData(['invitation', id], updated);
    },
  });

  if (isLoading) return <div className={styles.status}>Loading invitation…</div>;
  if (isError || !invitation) return <div className={styles.status}>Invitation not found.</div>;

  const publicUrl = invitation.slug
    ? `${window.location.origin}/i/${invitation.slug}`
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/templates')} id="back-to-templates">
          ← Back to templates
        </button>
        <div className={styles.statusPill}>
          {invitation.status === 'draft' ? '📝 Draft' : '✅ Published'}
        </div>
      </div>

      <h1 className={styles.pageTitle}>Preview</h1>
      <p className={styles.pageSubtitle}>This is exactly how your guests will see your invitation.</p>

      <div className={styles.previewWrapper}>
        <PreviewRenderer invitation={invitation} />
      </div>

      <div className={styles.actions}>
        {publicUrl ? (
          <div className={styles.shareBox}>
            <p className={styles.shareLabel}>🎉 Your invitation is live!</p>
            <div className={styles.urlRow}>
              <input
                id="public-url-input"
                className={styles.urlInput}
                readOnly
                value={publicUrl}
                onFocus={(e) => e.target.select()}
              />
              <button
                id="copy-url-btn"
                className={styles.copyBtn}
                onClick={() => navigator.clipboard.writeText(publicUrl)}
              >
                Copy
              </button>
            </div>
            <a
              id="open-public-url"
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openLink}
            >
              Open public page →
            </a>
          </div>
        ) : (
          <>
            <button
              id="publish-invitation-btn"
              className={styles.publishBtn}
              disabled={publishMutation.isPending}
              onClick={() => publishMutation.mutate()}
            >
              {publishMutation.isPending ? 'Publishing…' : 'Publish Invitation →'}
            </button>
            {publishMutation.isError && (
              <p className={styles.publishError} role="alert">Failed to publish. Please try again.</p>
            )}
            <p className={styles.publishHint}>Publishing will make your invitation available via a public link.</p>
          </>
        )}
      </div>

      {rsvps.length > 0 && (
        <div className={styles.rsvpList}>
          <h2 className={styles.rsvpListTitle}>Responses ({rsvps.length})</h2>
          <ul className={styles.rsvpItems}>
            {rsvps.map((r) => (
              <li key={r.id} className={styles.rsvpItem}>
                <span className={styles.rsvpName}>{r.guestName}</span>
                <span className={`${styles.rsvpStatus} ${r.attendanceStatus === 'attending' ? styles.attending : styles.notAttending}`}>
                  {r.attendanceStatus === 'attending' ? '✓ Attending' : '✗ Not Attending'}
                </span>
                <span className={styles.rsvpCount}>{r.guestCount} guest{r.guestCount !== 1 ? 's' : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
