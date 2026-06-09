import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchPublicInvitation } from '../../src/api/invitations';
import { submitRsvp } from '../../src/api/rsvp';
import { colors } from '../../src/theme/colors';
import { Rsvp } from '../../src/types';

export default function PublicInvitationScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [submittedRsvp, setSubmittedRsvp] = useState<Rsvp | null>(null);

  const { data: invitation, isLoading, isError } = useQuery({
    queryKey: ['public-invitation', slug],
    queryFn: () => fetchPublicInvitation(slug!),
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading invitation...</Text>
      </View>
    );
  }

  if (isError || !invitation) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundIcon}>💌</Text>
        <Text style={styles.notFoundTitle}>Invitation not found</Text>
        <Text style={styles.notFoundMsg}>
          This link may be invalid or the invitation hasn't been published yet.
        </Text>
      </View>
    );
  }

  const formattedDate = new Date(invitation.weddingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Main Invitation Card */}
      <View style={styles.invitationCard}>
        <Text style={styles.floralDecor}>✿ ❀ ✿</Text>
        <Text style={styles.label}>Together with their families</Text>
        <Text style={styles.coupleNames}>
          {invitation.brideName}{'\n'}
          <Text style={styles.ampersand}>&</Text>
          {'\n'}{invitation.groomName}
        </Text>
        <Text style={styles.invTitle}>{invitation.title}</Text>
        <View style={styles.divider} />
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.timeText}>at {invitation.weddingTime}</Text>
        <Text style={styles.venueText}>📍 {invitation.venue}</Text>
        <Text style={styles.floralDecor}>✿ ❀ ✿</Text>
      </View>

      {/* Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>📋 Wedding Details</Text>
        <DetailRow label="Couple" value={`${invitation.brideName} & ${invitation.groomName}`} />
        <DetailRow label="Date" value={formattedDate} />
        <DetailRow label="Time" value={invitation.weddingTime} />
        <DetailRow label="Venue" value={invitation.venue} />
      </View>

      {/* RSVP Section */}
      {submittedRsvp ? (
        <View style={styles.rsvpSuccess}>
          <Text style={styles.rsvpSuccessIcon}>🎉</Text>
          <Text style={styles.rsvpSuccessTitle}>
            {submittedRsvp.attendanceStatus === 'attending'
              ? "You're coming!"
              : 'Response recorded'}
          </Text>
          <Text style={styles.rsvpSuccessMsg}>
            Thank you, <Text style={{ fontWeight: '700' }}>{submittedRsvp.guestName}</Text>!
            {'\n'}Your RSVP has been sent to the couple.
          </Text>
        </View>
      ) : (
        <RsvpForm invitationId={invitation.id} onSuccess={setSubmittedRsvp} />
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ on Eventy</Text>
      </View>
    </ScrollView>
  );
}

function RsvpForm({
  invitationId,
  onSuccess,
}: {
  invitationId: string;
  onSuccess: (rsvp: Rsvp) => void;
}) {
  const [guestName, setGuestName] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('attending');
  const [guestCount, setGuestCount] = useState('1');
  const [notes, setNotes] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      submitRsvp({
        invitationId,
        guestName,
        attendanceStatus,
        guestCount: parseInt(guestCount, 10) || 1,
        notes: notes || undefined,
      }),
    onSuccess,
    onError: () => Alert.alert('Error', 'Could not submit your RSVP. Please try again.'),
  });

  const handleSubmit = () => {
    if (!guestName.trim()) {
      Alert.alert('Missing Name', 'Please enter your name.');
      return;
    }
    mutation.mutate();
  };

  return (
    <View style={styles.rsvpForm}>
      <Text style={styles.rsvpFormTitle}>✉️ RSVP</Text>
      <Text style={styles.rsvpFormSubtitle}>Let the couple know if you'll be there</Text>

      <Text style={styles.fieldLabel}>Your Name</Text>
      <TextInput
        style={styles.input}
        value={guestName}
        onChangeText={setGuestName}
        placeholder="Full name"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.fieldLabel}>Will you attend?</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, attendanceStatus === 'attending' && styles.toggleActive]}
          onPress={() => setAttendanceStatus('attending')}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleEmoji}>🎉</Text>
          <Text style={[styles.toggleText, attendanceStatus === 'attending' && styles.toggleTextActive]}>
            Yes, attending!
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, attendanceStatus === 'not_attending' && styles.toggleNotActive]}
          onPress={() => setAttendanceStatus('not_attending')}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleEmoji}>😔</Text>
          <Text style={[styles.toggleText, attendanceStatus === 'not_attending' && styles.toggleTextNotActive]}>
            Can't make it
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>Number of Guests</Text>
      <TextInput
        style={styles.input}
        value={guestCount}
        onChangeText={setGuestCount}
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.fieldLabel}>Notes <Text style={styles.optional}>(optional)</Text></Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Dietary requirements, special requests..."
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.rsvpSubmitBtn, mutation.isPending && styles.rsvpSubmitBtnDisabled]}
        onPress={handleSubmit}
        disabled={mutation.isPending}
        activeOpacity={0.8}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.rsvpSubmitText}>Send RSVP ✨</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
  content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: colors.textMuted, fontSize: 14 },
  notFoundIcon: { fontSize: 56, marginBottom: 16 },
  notFoundTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  notFoundMsg: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 8, maxWidth: 280, lineHeight: 20 },
  invitationCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    marginBottom: 20,
  },
  floralDecor: {
    color: colors.gold,
    fontSize: 16,
    letterSpacing: 8,
    marginVertical: 8,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: 16,
  },
  coupleNames: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
  },
  ampersand: {
    fontSize: 22,
    fontStyle: 'italic',
    color: colors.gold,
  },
  invTitle: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 12,
    marginBottom: 4,
  },
  divider: { width: 50, height: 1.5, backgroundColor: colors.gold, marginVertical: 16 },
  dateText: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  timeText: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  venueText: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  detailsTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F3F0',
  },
  detailLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: colors.textMuted, letterSpacing: 0.5 },
  detailValue: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, textAlign: 'right', flex: 1, marginLeft: 16 },
  rsvpForm: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  rsvpFormTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  rsvpFormSubtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  optional: { fontWeight: '400', color: colors.textMuted },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1.5,
    borderColor: '#E8E4DE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggle: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E8E4DE',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  toggleActive: { backgroundColor: '#E8F8ED', borderColor: colors.success },
  toggleNotActive: { backgroundColor: '#FDE8E8', borderColor: colors.danger },
  toggleEmoji: { fontSize: 18 },
  toggleText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  toggleTextActive: { color: colors.success },
  toggleTextNotActive: { color: colors.danger },
  rsvpSubmitBtn: {
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rsvpSubmitBtnDisabled: { opacity: 0.6 },
  rsvpSubmitText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  rsvpSuccess: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#D4EDDA',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  rsvpSuccessIcon: { fontSize: 40, marginBottom: 10 },
  rsvpSuccessTitle: { fontSize: 20, fontWeight: '800', color: colors.success },
  rsvpSuccessMsg: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  footer: { alignItems: 'center', marginTop: 16, paddingVertical: 20 },
  footerText: { fontSize: 12, color: colors.textMuted },
});
