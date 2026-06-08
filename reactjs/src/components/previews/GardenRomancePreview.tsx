import type { Invitation } from '../../api/invitations';
import styles from './GardenRomancePreview.module.css';

interface Props { invitation: Invitation; }

export function GardenRomancePreview({ invitation }: Props) {
  const date = new Date(invitation.weddingDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return (
    <div className={styles.card}>
      <div className={styles.floralTop} aria-hidden="true">✿ ❀ ✿</div>
      <p className={styles.label}>Together with their families</p>
      <h1 className={styles.couple}>{invitation.brideName} <span>&amp;</span> {invitation.groomName}</h1>
      <p className={styles.title}>{invitation.title}</p>
      <div className={styles.divider} />
      <p className={styles.date}>{date}</p>
      <p className={styles.time}>at {invitation.weddingTime}</p>
      <p className={styles.venue}>{invitation.venue}</p>
      <div className={styles.floralBottom} aria-hidden="true">✿ ❀ ✿</div>
    </div>
  );
}
