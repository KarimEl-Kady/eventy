import type { Invitation } from '../../api/invitations';
import styles from './BeachBlissPreview.module.css';

interface Props { invitation: Invitation; }

export function BeachBlissPreview({ invitation }: Props) {
  const date = new Date(invitation.weddingDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return (
    <div className={styles.card}>
      <p className={styles.label}>With joy, we invite you to celebrate</p>
      <h1 className={styles.couple}>{invitation.brideName} <span>&amp;</span> {invitation.groomName}</h1>
      <p className={styles.title}>{invitation.title}</p>
      <div className={styles.wave} aria-hidden="true">〰〰〰</div>
      <p className={styles.date}>{date}</p>
      <p className={styles.time}>{invitation.weddingTime}</p>
      <p className={styles.venue}>{invitation.venue}</p>
    </div>
  );
}
