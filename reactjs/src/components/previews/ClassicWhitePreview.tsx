import type { Invitation } from '../../api/invitations';
import styles from './ClassicWhitePreview.module.css';

interface Props { invitation: Invitation; }

export function ClassicWhitePreview({ invitation }: Props) {
  const date = new Date(invitation.weddingDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return (
    <div className={styles.card}>
      <div className={styles.outerBorder}>
        <p className={styles.label}>Marriage Ceremony</p>
        <h1 className={styles.couple}>{invitation.brideName} <span>&amp;</span> {invitation.groomName}</h1>
        <p className={styles.title}>{invitation.title}</p>
        <div className={styles.rule} />
        <p className={styles.date}>{date}</p>
        <p className={styles.time}>{invitation.weddingTime}</p>
        <p className={styles.venue}>{invitation.venue}</p>
      </div>
    </div>
  );
}
