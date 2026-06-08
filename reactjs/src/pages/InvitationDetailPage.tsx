import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchInvitation } from '../api/invitations';
import styles from './InvitationDetailPage.module.css';

export function InvitationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['invitation', id],
    queryFn: () => fetchInvitation(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className={styles.status}>Loading invitation…</div>;
  if (isError || !data) return <div className={styles.status}>Invitation not found.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.badge}>Draft</span>
        <h1 className={styles.title}>{data.title}</h1>
        <p className={styles.couple}>{data.brideName} &amp; {data.groomName}</p>
        <p className={styles.meta}>{data.venue}</p>
        <p className={styles.meta}>{new Date(data.weddingDate).toLocaleDateString()} · {data.weddingTime}</p>
        <p className={styles.note}>Invitation saved. Preview and publish coming next.</p>
      </div>
    </div>
  );
}
