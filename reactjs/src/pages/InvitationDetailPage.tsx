import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchInvitation } from '../api/invitations';
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

  if (isLoading) return <div className={styles.status}>Loading invitation…</div>;
  if (isError || !invitation) return <div className={styles.status}>Invitation not found.</div>;

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
        <button
          id="publish-invitation-btn"
          className={styles.publishBtn}
          disabled
          title="Publishing coming in the next step"
        >
          Publish Invitation →
        </button>
        <p className={styles.publishHint}>Publishing will make your invitation available via a public link.</p>
      </div>
    </div>
  );
}
