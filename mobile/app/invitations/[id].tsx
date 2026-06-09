import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInvitation, publishInvitation } from '../../src/api/invitations';
import { fetchRsvps } from '../../src/api/rsvp';
import { colors } from '../../src/theme/colors';
import { Rsvp } from '../../src/types';

export default function InvitationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: invitation, isLoading, isError } = useQuery({
    queryKey: ['invitation', id],
    queryFn: () => fetchInvitation(id!),
    enabled: !!id,
  });

  const { data: rsvps = [] } = useQuery<Rsvp[]>({
    queryKey: ['rsvps', id],
    queryFn: () => fetchRsvps(id!),
    enabled: !!id,
  });

  const publishMutation = useMutation({
    mutationFn: () => publishInvitation(id!),
    onSuccess: (updated) => {
      queryClient.setQueryData(['invitation', id], updated);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to publish. Please try again.');
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading your invitation...</Text>
      </View>
    );
  }

  if (isError || !invitation) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>😢</Text>
        <Text style={styles.errorText}>Invitation not found.</Text>
      </View>
    );
  }

  const formattedDate = new Date(invitation.weddingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const publicUrl = invitation.slug
    ? `http://10.0.8.251:5173/i/${invitation.slug}`
    : null;

  const handleShare = async () => {
    if (publicUrl) {
      await Share.share({
        message: `You're invited to ${invitation.title}! 💒\n\n${publicUrl}`,
      });
    }
  };

  const attending = rsvps.filter((r: Rsvp) => r.attendanceStatus === 'attending');
  const notAttending = rsvps.filter((r: Rsvp) => r.attendanceStatus === 'not_attending');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Status */}
      <View style={styles.statusRow}>
        <View style={[styles.badge, invitation.status === 'published' && styles.badgePublished]}>
          <Text style={[styles.badgeText, invitation.status === 'published' && styles.badgeTextPublished]}>
            {invitation.status === 'published' ? '✅ Published' : '📝 Draft'}
          </Text>
        </View>
      </View>

      {/* Invitation Card */}
      <View style={styles.invitationCard}>
        <Text style={styles.cardLabel}>Together with their families</Text>
        <Text style={styles.coupleNames}>
          {invitation.brideName} & {invitation.groomName}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.cardTitle}>{invitation.title}</Text>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{formattedDate}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🕐</Text>
            <Text style={styles.detailText}>{invitation.weddingTime}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{invitation.venue}</Text>
          </View>
        </View>
        {invitation.template && (
          <View style={styles.templateTag}>
            <Text style={styles.templateTagText}>
              🎨 {invitation.template.name}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {publicUrl ? (
        <View style={styles.shareBox}>
          <Text style={styles.shareIcon}>🎉</Text>
          <Text style={styles.shareLabel}>Your invitation is live!</Text>
          <TextInput
            style={styles.urlInput}
            value={publicUrl}
            editable={false}
            selectTextOnFocus
          />
          <View style={styles.shareActions}>
            <TouchableOpacity style={styles.copyBtn} onPress={() => Alert.alert('Copied!', publicUrl)}>
              <Text style={styles.copyBtnText}>📋 Copy Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>📤 Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.publishSection}>
          <TouchableOpacity
            style={[styles.publishBtn, publishMutation.isPending && styles.publishBtnDisabled]}
            onPress={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
            activeOpacity={0.8}
          >
            {publishMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.publishBtnText}>Publish & Share 🚀</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.publishHint}>
            Publishing makes your invitation accessible via a shareable link
          </Text>
        </View>
      )}

      {/* RSVP Summary */}
      {rsvps.length > 0 && (
        <View style={styles.rsvpSection}>
          <View style={styles.rsvpHeader}>
            <Text style={styles.rsvpTitle}>Responses</Text>
            <View style={styles.rsvpStats}>
              <View style={styles.statBadge}>
                <Text style={styles.statGreen}>✓ {attending.length}</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statRed}>✗ {notAttending.length}</Text>
              </View>
            </View>
          </View>
          {rsvps.map((rsvp: Rsvp) => (
            <View key={rsvp.id} style={styles.rsvpRow}>
              <View style={styles.rsvpAvatar}>
                <Text style={styles.rsvpAvatarText}>
                  {rsvp.guestName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.rsvpInfo}>
                <Text style={styles.rsvpName}>{rsvp.guestName}</Text>
                <Text style={styles.rsvpMeta}>
                  {rsvp.guestCount} guest{rsvp.guestCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <View
                style={[
                  styles.rsvpBadge,
                  rsvp.attendanceStatus === 'attending'
                    ? styles.rsvpAttending
                    : styles.rsvpNotAttending,
                ]}
              >
                <Text
                  style={[
                    styles.rsvpBadgeText,
                    rsvp.attendanceStatus === 'attending'
                      ? styles.rsvpAttendingText
                      : styles.rsvpNotAttendingText,
                  ]}
                >
                  {rsvp.attendanceStatus === 'attending' ? '✓ Yes' : '✗ No'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textMuted, fontSize: 14 },
  errorIcon: { fontSize: 40, marginBottom: 8 },
  errorText: { color: colors.textMuted, fontSize: 16 },
  statusRow: { alignItems: 'center', marginBottom: 16 },
  badge: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E4DE',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgePublished: { backgroundColor: '#E8F8ED', borderColor: '#E8F8ED' },
  badgeText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  badgeTextPublished: { color: colors.success },
  invitationCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: 12,
  },
  coupleNames: {
    fontSize: 26,
    fontWeight: '300',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  divider: {
    width: 50,
    height: 1.5,
    backgroundColor: colors.gold,
    marginVertical: 16,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  detailsRow: { gap: 10, width: '100%' },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  detailIcon: { fontSize: 14 },
  detailText: { fontSize: 14, color: colors.textSecondary },
  templateTag: {
    marginTop: 16,
    backgroundColor: '#FDF8EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  templateTagText: { fontSize: 12, color: colors.warmText, fontWeight: '600' },
  shareBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#D4EDDA',
    marginBottom: 20,
  },
  shareIcon: { fontSize: 32 },
  shareLabel: { fontSize: 17, fontWeight: '700', color: colors.success },
  urlInput: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E8E4DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  shareActions: { flexDirection: 'row', gap: 10 },
  copyBtn: {
    backgroundColor: '#F0EBE3',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  copyBtnText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  shareBtn: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  shareBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  publishSection: { alignItems: 'center', marginBottom: 20 },
  publishBtn: {
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  publishBtnDisabled: { opacity: 0.6 },
  publishBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  publishHint: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  rsvpSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  rsvpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rsvpTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rsvpStats: { flexDirection: 'row', gap: 8 },
  statBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
  },
  statGreen: { fontSize: 12, fontWeight: '700', color: colors.success },
  statRed: { fontSize: 12, fontWeight: '700', color: colors.danger },
  rsvpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F3F0',
    gap: 12,
  },
  rsvpAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0EBE3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rsvpAvatarText: { fontSize: 14, fontWeight: '700', color: colors.gold },
  rsvpInfo: { flex: 1 },
  rsvpName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  rsvpMeta: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  rsvpBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  rsvpAttending: { backgroundColor: '#E8F8ED' },
  rsvpNotAttending: { backgroundColor: '#FDE8E8' },
  rsvpBadgeText: { fontSize: 12, fontWeight: '700' },
  rsvpAttendingText: { color: colors.success },
  rsvpNotAttendingText: { color: colors.danger },
});
