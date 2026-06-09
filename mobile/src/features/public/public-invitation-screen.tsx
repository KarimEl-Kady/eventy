import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api/client';
import { useSubmitRsvp } from '../rsvp/hooks/use-rsvps';
import { Loading } from '../../components/ui/loading';
import { ErrorState } from '../../components/ui/error-state';
import { formatDate } from '../../lib/utils/format';
import { Invitation, Rsvp } from '../../types';
import { publicStyles as styles } from './styles';

export function PublicInvitationScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [submittedRsvp, setSubmittedRsvp] = useState<Rsvp | null>(null);

  const { data: invitation, isLoading, isError } = useQuery<Invitation>({
    queryKey: ['public-invitation', slug],
    queryFn: async () => { const { data } = await api.get(`/api/invitations/public/${slug}`); return data; },
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) return <Loading message="Loading invitation..." />;
  if (isError || !invitation) return <ErrorState icon="💌" title="Invitation not found" message="This link may be invalid or the invitation hasn't been published yet." />;

  const formattedDate = formatDate(invitation.weddingDate);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.floral}>✿ ❀ ✿</Text>
        <Text style={styles.label}>Together with their families</Text>
        <Text style={styles.couple}>{invitation.brideName}{'\n'}<Text style={styles.amp}>&</Text>{'\n'}{invitation.groomName}</Text>
        <Text style={styles.title}>{invitation.title}</Text>
        <View style={styles.divider} />
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.time}>at {invitation.weddingTime}</Text>
        <Text style={styles.venue}>📍 {invitation.venue}</Text>
        <Text style={styles.floral}>✿ ❀ ✿</Text>
      </View>

      {submittedRsvp ? (
        <View style={styles.success}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>{submittedRsvp.attendanceStatus === 'attending' ? "You're coming!" : 'Response recorded'}</Text>
          <Text style={styles.successMsg}>Thank you, {submittedRsvp.guestName}!</Text>
        </View>
      ) : (
        <RsvpFormSection invitationId={invitation.id} onSuccess={setSubmittedRsvp} />
      )}

      <Text style={styles.footer}>Made with ❤️ on Eventy</Text>
    </ScrollView>
  );
}

function RsvpFormSection({ invitationId, onSuccess }: { invitationId: string; onSuccess: (r: Rsvp) => void }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('attending');
  const [count, setCount] = useState('1');
  const mutation = useSubmitRsvp();

  const submit = () => {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    mutation.mutate(
      { invitationId, guestName: name, attendanceStatus: status, guestCount: parseInt(count) || 1 },
      { onSuccess, onError: () => Alert.alert('Error', 'Could not submit RSVP.') }
    );
  };

  return (
    <View style={styles.rsvpForm}>
      <Text style={styles.rsvpTitle}>✉️ RSVP</Text>
      <Text style={styles.rsvpSub}>Let the couple know if you'll be there</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#999" />
      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggle, status === 'attending' && styles.toggleYes]} onPress={() => setStatus('attending')}><Text style={[styles.toggleText, status === 'attending' && styles.toggleYesText]}>🎉 Yes!</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.toggle, status === 'not_attending' && styles.toggleNo]} onPress={() => setStatus('not_attending')}><Text style={[styles.toggleText, status === 'not_attending' && styles.toggleNoText]}>😔 No</Text></TouchableOpacity>
      </View>
      <TextInput style={styles.input} value={count} onChangeText={setCount} keyboardType="numeric" placeholder="Guests" placeholderTextColor="#999" />
      <TouchableOpacity style={[styles.submitBtn, mutation.isPending && styles.submitDisabled]} onPress={submit} disabled={mutation.isPending}>
        {mutation.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Send RSVP ✨</Text>}
      </TouchableOpacity>
    </View>
  );
}
