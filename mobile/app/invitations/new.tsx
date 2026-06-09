import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { createInvitation } from '../../src/api/invitations';
import { useTemplateStore } from '../../src/store/templateStore';
import { useInvitationStore } from '../../src/store/invitationStore';
import { colors } from '../../src/theme/colors';

export default function CreateInvitationScreen() {
  const router = useRouter();
  const { selectedTemplate } = useTemplateStore();
  const { setCurrentInvitation } = useInvitationStore();

  const [title, setTitle] = useState('');
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingTime, setWeddingTime] = useState('');
  const [venue, setVenue] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      createInvitation({
        title,
        brideName,
        groomName,
        weddingDate,
        weddingTime,
        venue,
        templateId: selectedTemplate!.id,
      }),
    onSuccess: (data) => {
      setCurrentInvitation(data);
      router.replace(`/invitations/${data.id}`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    },
  });

  const handleSubmit = () => {
    if (!title || !brideName || !groomName || !weddingDate || !weddingTime || !venue) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(weddingDate)) {
      Alert.alert('Invalid Date', 'Please enter date as YYYY-MM-DD\n(e.g. 2025-09-15)');
      return;
    }
    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(weddingTime)) {
      Alert.alert('Invalid Time', 'Please enter time as HH:MM\n(e.g. 17:00)');
      return;
    }
    mutation.mutate();
  };

  if (!selectedTemplate) {
    router.replace('/');
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Template Badge */}
        <View style={styles.templateBadge}>
          <Image source={{ uri: selectedTemplate.thumbnail }} style={styles.templateThumb} />
          <View style={styles.templateInfo}>
            <Text style={styles.templateLabel}>Using template</Text>
            <Text style={styles.templateName}>{selectedTemplate.name}</Text>
          </View>
        </View>

        {/* Form Header */}
        <Text style={styles.heading}>Wedding Details</Text>
        <Text style={styles.subtitle}>
          Fill in your information to create a beautiful invitation
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <Field
            label="Invitation Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Sarah & James Wedding"
            icon="💍"
          />

          <View style={styles.sectionLabel}>
            <Text style={styles.sectionText}>👫 Couple</Text>
          </View>
          <View style={styles.row}>
            <Field
              label="Bride's Name"
              value={brideName}
              onChangeText={setBrideName}
              placeholder="Bride's full name"
              half
            />
            <Field
              label="Groom's Name"
              value={groomName}
              onChangeText={setGroomName}
              placeholder="Groom's full name"
              half
            />
          </View>

          <View style={styles.sectionLabel}>
            <Text style={styles.sectionText}>📅 When & Where</Text>
          </View>
          <View style={styles.row}>
            <Field
              label="Date"
              value={weddingDate}
              onChangeText={setWeddingDate}
              placeholder="YYYY-MM-DD"
              half
            />
            <Field
              label="Time"
              value={weddingTime}
              onChangeText={setWeddingTime}
              placeholder="HH:MM"
              half
            />
          </View>
          <Field
            label="Venue"
            value={venue}
            onChangeText={setVenue}
            placeholder="e.g. The Grand Ballroom, Cairo"
            icon="📍"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, mutation.isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={mutation.isPending}
          activeOpacity={0.8}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Create Invitation ✨</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  half,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  half?: boolean;
  icon?: string;
}) {
  return (
    <View style={[styles.field, half && styles.fieldHalf]}>
      <Text style={styles.label}>
        {icon ? `${icon} ` : ''}{label}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48 },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0EBE3',
    borderRadius: 14,
    padding: 14,
    marginBottom: 28,
  },
  templateThumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#F0EBE3' },
  templateInfo: { flex: 1 },
  templateLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  templateName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },
  form: { gap: 14 },
  sectionLabel: { marginTop: 8 },
  sectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  row: { flexDirection: 'row', gap: 12 },
  field: { flex: 1 },
  fieldHalf: { flex: 1 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E8E4DE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
