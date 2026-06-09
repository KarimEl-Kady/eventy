import { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Template } from '@/types';
import { styles } from '../styles/create-screen.styles';

interface TemplateBadgeProps {
  template: Template;
  onChangePress: () => void;
}

export function TemplateBadge({ template, onChangePress }: TemplateBadgeProps) {
  const [thumbError, setThumbError] = useState(false);

  return (
    <View style={styles.templateBadge}>
      {thumbError ? (
        <View style={styles.templateThumbFallback}>
          <Text style={styles.templateThumbIcon}>🎨</Text>
        </View>
      ) : (
        <Image
          source={{ uri: template.thumbnail }}
          style={styles.templateThumb}
          onError={() => setThumbError(true)}
          accessibilityLabel={`Template: ${template.name}`}
        />
      )}
      <View style={styles.templateInfo}>
        <Text style={styles.templateLabel}>Using template</Text>
        <Text style={styles.templateName}>{template.name}</Text>
      </View>
      <TouchableOpacity
        style={styles.changeBtn}
        onPress={onChangePress}
        accessibilityLabel="Change template"
        accessibilityRole="button"
      >
        <Text style={styles.changeBtnText}>Change</Text>
      </TouchableOpacity>
    </View>
  );
}
