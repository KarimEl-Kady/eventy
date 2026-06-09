import { useRef, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Field } from '@/components/form/field';
import { formatDateInput, formatTimeInput, isValidDate, isValidTime } from '@/lib/utils/format';
import { colors } from '@/theme';
import { styles } from '../styles/create-screen.styles';

type FieldErrors = {
  title?: string;
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  weddingTime?: string;
  venue?: string;
};

interface InvitationFormProps {
  isPending: boolean;
  onSubmit: (data: {
    title: string;
    brideName: string;
    groomName: string;
    weddingDate: string;
    weddingTime: string;
    venue: string;
  }) => void;
}

export function InvitationForm({ isPending, onSubmit }: InvitationFormProps) {
  const [title, setTitle] = useState('');
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingTime, setWeddingTime] = useState('');
  const [venue, setVenue] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Refs for keyboard focus chaining
  const brideRef = useRef<TextInput>(null);
  const groomRef = useRef<TextInput>(null);
  const dateRef = useRef<TextInput>(null);
  const timeRef = useRef<TextInput>(null);
  const venueRef = useRef<TextInput>(null);

  const clearError = (field: keyof FieldErrors) => {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = useCallback((): boolean => {
    const newErrors: FieldErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!brideName.trim()) newErrors.brideName = 'Required';
    if (!groomName.trim()) newErrors.groomName = 'Required';
    if (!weddingDate.trim()) {
      newErrors.weddingDate = 'Required';
    } else if (!isValidDate(weddingDate)) {
      newErrors.weddingDate = 'Use YYYY-MM-DD';
    }
    if (!weddingTime.trim()) {
      newErrors.weddingTime = 'Required';
    } else if (!isValidTime(weddingTime)) {
      newErrors.weddingTime = 'Use HH:MM';
    }
    if (!venue.trim()) newErrors.venue = 'Venue is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, brideName, groomName, weddingDate, weddingTime, venue]);

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ title, brideName, groomName, weddingDate, weddingTime, venue });
  };

  return (
    <View style={styles.form}>
      <Field
        label="Invitation Title"
        icon="💍"
        value={title}
        onChangeText={(t) => { setTitle(t); clearError('title'); }}
        placeholder="e.g. Sarah & James Wedding"
        error={errors.title}
        returnKeyType="next"
        onSubmitEditing={() => brideRef.current?.focus()}
        accessibilityLabel="Invitation title"
      />

      <View style={styles.sectionLabel}>
        <Text style={styles.sectionText}>👫 Couple</Text>
      </View>
      <View style={styles.row}>
        <Field
          ref={brideRef}
          label="Bride's Name"
          value={brideName}
          onChangeText={(t) => { setBrideName(t); clearError('brideName'); }}
          placeholder="Bride's full name"
          half
          error={errors.brideName}
          returnKeyType="next"
          onSubmitEditing={() => groomRef.current?.focus()}
          accessibilityLabel="Bride's name"
        />
        <Field
          ref={groomRef}
          label="Groom's Name"
          value={groomName}
          onChangeText={(t) => { setGroomName(t); clearError('groomName'); }}
          placeholder="Groom's full name"
          half
          error={errors.groomName}
          returnKeyType="next"
          onSubmitEditing={() => dateRef.current?.focus()}
          accessibilityLabel="Groom's name"
        />
      </View>

      <View style={styles.sectionLabel}>
        <Text style={styles.sectionText}>📅 When & Where</Text>
      </View>
      <View style={styles.row}>
        <Field
          ref={dateRef}
          label="Date"
          value={weddingDate}
          onChangeText={(t) => { setWeddingDate(formatDateInput(t)); clearError('weddingDate'); }}
          placeholder="YYYY-MM-DD"
          half
          error={errors.weddingDate}
          keyboardType="numeric"
          maxLength={10}
          returnKeyType="next"
          onSubmitEditing={() => timeRef.current?.focus()}
          accessibilityLabel="Wedding date"
          accessibilityHint="Enter in format year-month-day"
        />
        <Field
          ref={timeRef}
          label="Time"
          value={weddingTime}
          onChangeText={(t) => { setWeddingTime(formatTimeInput(t)); clearError('weddingTime'); }}
          placeholder="HH:MM"
          half
          error={errors.weddingTime}
          keyboardType="numeric"
          maxLength={5}
          returnKeyType="next"
          onSubmitEditing={() => venueRef.current?.focus()}
          accessibilityLabel="Wedding time"
          accessibilityHint="Enter in format hours colon minutes"
        />
      </View>

      <Field
        ref={venueRef}
        label="Venue"
        icon="📍"
        value={venue}
        onChangeText={(t) => { setVenue(t); clearError('venue'); }}
        placeholder="e.g. The Grand Ballroom, Cairo"
        error={errors.venue}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        accessibilityLabel="Wedding venue"
      />

      <TouchableOpacity
        style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={isPending}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Create invitation"
        accessibilityState={{ disabled: isPending }}
      >
        {isPending ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitBtnText}>Create Invitation ✨</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
