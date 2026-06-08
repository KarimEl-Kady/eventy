import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { submitRsvp } from '../api/invitations';
import type { Rsvp } from '../api/invitations';
import styles from './RsvpForm.module.css';

interface Props {
  invitationId: string;
  onSuccess: (rsvp: Rsvp) => void;
}

export function RsvpForm({ invitationId, onSuccess }: Props) {
  const [guestName, setGuestName] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('attending');
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => submitRsvp({ invitationId, guestName, attendanceStatus, guestCount, notes: notes || undefined }),
    onSuccess,
    onError: () => setFormError('Could not submit your RSVP. Please try again.'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!guestName.trim()) { setFormError('Please enter your name.'); return; }
    mutation.mutate();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>RSVP</h2>
      <p className={styles.subtitle}>Let the couple know if you'll be there</p>

      <div className={styles.field}>
        <label htmlFor="rsvp-name">Your Name</label>
        <input
          id="rsvp-name"
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Full name"
        />
      </div>

      <div className={styles.field}>
        <label>Attendance</label>
        <div className={styles.toggleGroup} role="group" aria-label="Attendance status">
          {['attending', 'not_attending'].map((status) => (
            <button
              key={status}
              type="button"
              id={`rsvp-status-${status}`}
              className={`${styles.toggle} ${attendanceStatus === status ? styles.toggleActive : ''}`}
              onClick={() => setAttendanceStatus(status)}
            >
              {status === 'attending' ? '✓ Attending' : '✗ Not Attending'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="rsvp-count">Number of Guests</label>
        <input
          id="rsvp-count"
          type="number"
          min={1}
          max={20}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="rsvp-notes">Notes <span className={styles.optional}>(optional)</span></label>
        <input
          id="rsvp-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Dietary requirements, etc."
        />
      </div>

      {formError && <p className={styles.error} role="alert">{formError}</p>}

      <button
        id="submit-rsvp"
        type="submit"
        className={styles.submitBtn}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Sending…' : 'Send RSVP'}
      </button>
    </form>
  );
}
