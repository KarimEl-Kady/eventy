import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreateInvitation } from './hooks/use-create-invitation';
import { useTemplateStore } from '../../store/templateStore';
import { useInvitationStore } from '../../store/invitationStore';
import { Field } from '../../components/form/field';
import { formatDateInput, formatTimeInput, isValidDate, isValidTime } from '../../lib/utils/format';
import { styles } from './styles';

type FieldErrors = Record<string, string | undefined>;

export function CreateInvitationScreen() {
  const router = useRouter();
  const { selectedTemplate } = useTemplateStore();
  const { setCurrentInvitation } = useInvitationStore();

  const [title, setTitle] = useState('');
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingTime, setWeddingTime] = useState('');
  const [venue, setVenue] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [thumbError, setThumbError] = useState(false);

  const brideRef = useRef<TextInput>(null);
  const groomRef = useRef<TextInput>(null);
  const dateRef = useRef<TextInput>(null);
  const timeRef = useRef<TextInput>(null);
  const venueRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const mutation = useCreateInvitation();

  useEffect(() => {
    if (!selectedTemplate) router.replace('/');
  }, [selectedTemplate, router]);

  const validate = useCallback((): boolean => {
    const e: FieldErrors = {};
    if (!title.trim()) e.title = 'Required';
    if (!brideName.trim()) e.brideName = 'Required';
    if (!groomName.trim()) e.groomName = 'Required';
    if (!weddingDate.trim()) e.weddingDate = 'Required';
    else if (!isValidDate(weddingDate)) e.weddingDate = 'Use YYYY-MM-DD';
    if (!weddingTime.trim()) e.weddingTime = 'Required';
    else if (!isValidTime(weddingTime)) e.weddingTime = 'Use HH:MM';
    if (!venue.trim()) e.venue = 'Required';
    setErrors(e);
    if (Object.keys(e).length > 0) { scrollRef.current?.scrollTo({ y: 0, animated: true }); return false; }
    return true;
  }, [title, brideName, groomName, weddingDate, weddingTime, venue]);

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate(
      { title, brideName, groomName, weddingDate, weddingTime, venue, templateId: selectedTemplate!.id },
      {
        onSuccess: (data) => { setCurrentInvitation(data); router.replace(`/invitations/${data.id}`); },
        onError: (err: unknown) => {
          const axErr = err as { response?: { data?: { message?: string | string[] } } };
          const msg = axErr?.response?.data?.message || 'Something went wrong.';
          Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
        },
      }
    );
  };

  const clearError = (field: string) => setErrors((e) => ({ ...e, [field]: undefined }));

  if (!selectedTemplate) return null;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <ScrollView ref={scrollRef} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.templateBadge}>
          {thumbError ? (
            <View style={styles.thumbFallback}><Text style={styles.thumbIcon}>🎨</Text></View>
          ) : (
            <Image source={{ uri: selectedTemplate.thumbnail }} style={styles.thumb} onError={() => setThumbError(true)} />
          )}
          <View style={styles.templateInfo}>
            <Text style={styles.templateLabel}>Using template</Text>
            <Text style={styles.templateName}>{selectedTemplate.name}</Text>
          </View>
          <TouchableOpacity style={styles.changeBtn} onPress={() => router.back()} accessibilityLabel="Change template">
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.heading}>Wedding Details</Text>
        <Text style={styles.subtitle}>Fill in your information to create a beautiful invitation</Text>

        <View style={styles.form}>
          <Field label="Invitation Title" icon="💍" value={title} onChangeText={(t) => { setTitle(t); clearError('title'); }} placeholder="e.g. Sarah & James Wedding" error={errors.title} returnKeyType="next" onSubmitEditing={() => brideRef.current?.focus()} />

          <Text style={styles.sectionText}>👫 Couple</Text>
          <View style={styles.row}>
            <Field ref={brideRef} label="Bride's Name" value={brideName} onChangeText={(t) => { setBrideName(t); clearError('brideName'); }} placeholder="Full name" error={errors.brideName} half returnKeyType="next" onSubmitEditing={() => groomRef.current?.focus()} />
            <Field ref={groomRef} label="Groom's Name" value={groomName} onChangeText={(t) => { setGroomName(t); clearError('groomName'); }} placeholder="Full name" error={errors.groomName} half returnKeyType="next" onSubmitEditing={() => dateRef.current?.focus()} />
          </View>

          <Text style={styles.sectionText}>📅 When & Where</Text>
          <View style={styles.row}>
            <Field ref={dateRef} label="Date" value={weddingDate} onChangeText={(t) => { setWeddingDate(formatDateInput(t)); clearError('weddingDate'); }} placeholder="YYYY-MM-DD" error={errors.weddingDate} half keyboardType="numeric" maxLength={10} returnKeyType="next" onSubmitEditing={() => timeRef.current?.focus()} />
            <Field ref={timeRef} label="Time" value={weddingTime} onChangeText={(t) => { setWeddingTime(formatTimeInput(t)); clearError('weddingTime'); }} placeholder="HH:MM" error={errors.weddingTime} half keyboardType="numeric" maxLength={5} returnKeyType="next" onSubmitEditing={() => venueRef.current?.focus()} />
          </View>
          <Field ref={venueRef} label="Venue" icon="📍" value={venue} onChangeText={(t) => { setVenue(t); clearError('venue'); }} placeholder="e.g. The Grand Ballroom" error={errors.venue} returnKeyType="done" onSubmitEditing={handleSubmit} />
        </View>

        <TouchableOpacity style={[styles.submitBtn, mutation.isPending && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={mutation.isPending} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Create invitation">
          {mutation.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Create Invitation ✨</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
