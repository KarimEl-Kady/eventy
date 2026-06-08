import type { Invitation } from '../../api/invitations';
import styles from './RusticCharmPreview.module.css';

interface Props { invitation: Invitation; }

export function RusticCharmPreview({ invitation }: Props) {
  const date = new Date(invitation.weddingDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return (
    <div className={styles.card}>
      <p className={styles.label}>~ Join us for the wedding of ~</p>
      <h1 className={styles.couple}>{invitation.brideName} <span>&amp;</span> {invitation.groomName}</h1>
      <p className={styles.title}>{invitation.title}</p>
      <div className={styles.divider}>— ✦ —</div>
      <p className={styles.date}>{date}</p>
      <p className={styles.time}>{invitation.weddingTime}</p>
      <p className={styles.venue}>{invitation.venue}</p>
    </div>
  );
}
