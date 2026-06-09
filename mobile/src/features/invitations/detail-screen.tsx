import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useInvitation, usePublishInvitation } from './hooks/use-invitation';
import { useRsvps } from '../rsvp/hooks/use-rsvps';
import { Loading } from '../../components/ui/loading';
import { ErrorState } from '../../components/ui/error-state';
import { formatDate } from '../../lib/utils/format';
import { Rsvp } from '../../types';
import { detailStyles as styles } from './detail-styles';

export function InvitationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: invitation, isLoading, isError, refetch } = useInvitation(id!);
  const { data: rsvps = [] } = useRsvps(id!);
  const publishMutation = usePublishInvitation(id!);

  if (isLoading) return <Loading message="Loading your invitation..." />;
  if (isError || !invitation) return <ErrorState icon="😢" message="Invitation not found." onRetry={refetch} />;

  const formattedDate = formatDate(invitation.weddingDate);
  const publicUrl = invitation.slug ? `http://10.0.8.251:5173/i/${invitation.slug}` : null;
  const attending = rsvps.filter((r: Rsvp) => r.attendanceStatus === 'attending');
  const notAttending = rsvps.filter((r: Rsvp) => r.attendanceStatus === 'not_attending');

  const handleShare = async () => {
    if (publicUrl) await Share.share({ message: `You're invited to ${invitation.title}! 💒\n\n${publicUrl}` });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.statusRow}>
        <View style={[styles.badge, invitation.status === 'published' && styles.badgePublished]}>
          <Text style={[styles.badgeText, invitation.status === 'published' && styles.badgeTextPublished]}>
            {invitation.status === 'published' ? '✅ Published' : '📝 Draft'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Together with their families</Text>
        <Text style={styles.coupleNames}>{invitation.brideName} & {invitation.groomName}</Text>
        <View style={styles.divider} />
        <Text style={styles.cardTitle}>{invitation.title}</Text>
        <Text style={styles.detailText}>📅 {formattedDate}</Text>
        <Text style={styles.detailText}>🕐 {invitation.weddingTime}</Text>
        <Text style={styles.detailText}>📍 {invitation.venue}</Text>
      </View>

      {publicUrl ? (
        <View style={styles.shareBox}>
          <Text style={styles.shareIcon}>🎉</Text>
          <Text style={styles.shareLabel}>Your invitation is live!</Text>
          <TextInput style={styles.urlInput} value={publicUrl} editable={false} selectTextOnFocus />
          <View style={styles.shareActions}>
            <TouchableOpacity style={styles.copyBtn} onPress={() => Alert.alert('Copied!', publicUrl)}><Text style={styles.copyBtnText}>📋 Copy</Text></TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}><Text style={styles.shareBtnText}>📤 Share</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={[styles.publishBtn, publishMutation.isPending && styles.publishBtnDisabled]} onPress={() => publishMutation.mutate()} disabled={publishMutation.isPending} activeOpacity={0.8}>
          {publishMutation.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.publishBtnText}>Publish & Share 🚀</Text>}
        </TouchableOpacity>
      )}

      {rsvps.length > 0 && (
        <View style={styles.rsvpSection}>
          <View style={styles.rsvpHeader}>
            <Text style={styles.rsvpTitle}>Responses</Text>
            <Text style={styles.rsvpStats}>✓{attending.length}  ✗{notAttending.length}</Text>
          </View>
          {rsvps.map((r: Rsvp) => (
            <View key={r.id} style={styles.rsvpRow}>
              <View style={styles.rsvpAvatar}><Text style={styles.rsvpAvatarText}>{r.guestName.charAt(0)}</Text></View>
              <View style={styles.rsvpInfo}>
                <Text style={styles.rsvpName}>{r.guestName}</Text>
                <Text style={styles.rsvpMeta}>{r.guestCount} guest{r.guestCount !== 1 ? 's' : ''}</Text>
              </View>
              <View style={[styles.rsvpBadge, r.attendanceStatus === 'attending' ? styles.rsvpGreen : styles.rsvpRed]}>
                <Text style={[styles.rsvpBadgeText, r.attendanceStatus === 'attending' ? styles.rsvpGreenText : styles.rsvpRedText]}>
                  {r.attendanceStatus === 'attending' ? '✓' : '✗'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
