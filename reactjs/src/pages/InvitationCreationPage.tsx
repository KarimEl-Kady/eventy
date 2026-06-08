import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createInvitation } from '../api/invitations';
import { useTemplateStore } from '../store/templateStore';
import styles from './InvitationCreationPage.module.css';

const EMPTY = { title: '', brideName: '', groomName: '', weddingDate: '', weddingTime: '', venue: '' };

export function InvitationCreationPage() {
  const navigate = useNavigate();
  const { selectedTemplate } = useTemplateStore();
  const [fields, setFields] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTemplate) navigate('/templates', { replace: true });
  }, [selectedTemplate, navigate]);

  const mutation = useMutation({
    mutationFn: () =>
      createInvitation({ ...fields, templateId: selectedTemplate!.id }),
    onSuccess: (data) => navigate(`/invitations/${data.id}`),
    onError: () => setError('Something went wrong. Please try again.'),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const missing = Object.entries(fields).find(([, v]) => !v.trim());
    if (missing) { setError('Please fill in all fields.'); return; }
    mutation.mutate();
  }

  if (!selectedTemplate) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.templateBadge}>
          <img src={selectedTemplate.thumbnail} alt={selectedTemplate.name} className={styles.templateThumb} />
          <span className={styles.templateName}>{selectedTemplate.name}</span>
        </div>

        <h1 className={styles.title}>Create Your Invitation</h1>
        <p className={styles.subtitle}>Fill in your wedding details below</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Field id="title"       label="Invitation Title" name="title"       value={fields.title}       onChange={handleChange} placeholder="e.g. Sarah & James Wedding" />
          <div className={styles.row}>
            <Field id="brideName" label="Bride's Name"     name="brideName"  value={fields.brideName}  onChange={handleChange} placeholder="Bride's full name" />
            <Field id="groomName" label="Groom's Name"     name="groomName"  value={fields.groomName}  onChange={handleChange} placeholder="Groom's full name" />
          </div>
          <div className={styles.row}>
            <Field id="weddingDate" label="Wedding Date" name="weddingDate" type="date" value={fields.weddingDate} onChange={handleChange} />
            <Field id="weddingTime" label="Wedding Time" name="weddingTime" type="time" value={fields.weddingTime} onChange={handleChange} />
          </div>
          <Field id="venue" label="Venue" name="venue" value={fields.venue} onChange={handleChange} placeholder="e.g. The Grand Ballroom, Cairo" />

          {error && <p className={styles.errorMsg} role="alert">{error}</p>}

          <button
            id="submit-invitation"
            type="submit"
            className={styles.submitBtn}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving…' : 'Save Draft →'}
          </button>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  id: string; label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
}
function Field({ id, label, name, value, onChange, placeholder, type = 'text' }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}
