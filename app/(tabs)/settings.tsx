import { useNotifications } from '@/hooks/useNotifications';
import { useSettingsStore } from '@/stores/settingsStore';
import type { CategoryFilter, PlatformFilter } from '@/types/notifications';
import { format } from 'date-fns';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLATFORM_OPTIONS: { value: PlatformFilter; label: string }[] = [
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
];

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'devops', label: 'DevOps' },
  { value: 'ai', label: 'AI/ML' },
  { value: 'security', label: 'Security' },
  { value: 'database', label: 'Database' },
];

export default function SettingsScreen() {
  const {
    notificationsEnabled,
    platformFilters,
    categoryFilters,
    customKeywords,
    keywordMatchMode,
    minScore,
    allowedDomains,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
    lastBackgroundFetch,
    toggleNotifications,
    togglePlatformFilter,
    toggleCategoryFilter,
    addCustomKeyword,
    removeCustomKeyword,
    setKeywordMatchMode,
    setMinScore,
    addAllowedDomain,
    removeAllowedDomain,
    toggleQuietHours,
    setQuietHoursStart,
    setQuietHoursEnd,
    resetToDefaults,
  } = useSettingsStore();

  const { permissionStatus, requestPermissions, sendTestNotification } = useNotifications();

  const [keywordInput, setKeywordInput] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      addCustomKeyword(keywordInput);
      setKeywordInput('');
    }
  };

  const handleAddDomain = () => {
    if (domainInput.trim()) {
      addAllowedDomain(domainInput);
      setDomainInput('');
    }
  };

  const handleTestNotification = async () => {
    setIsSendingTest(true);
    try {
      await sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all notification settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetToDefaults },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Master Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.label}>Enable Notifications</Text>
              <Text style={styles.description}>Master toggle for all notifications</Text>
            </View>
            <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Permission Status:</Text>
            <View style={[styles.badge, permissionStatus === 'granted' && styles.badgeSuccess]}>
              <Text style={styles.badgeText}>{permissionStatus}</Text>
            </View>
          </View>

          {permissionStatus !== 'granted' && (
            <TouchableOpacity style={styles.button} onPress={requestPermissions}>
              <Text style={styles.buttonText}>Request Permissions</Text>
            </TouchableOpacity>
          )}

          {lastBackgroundFetch > 0 && (
            <Text style={styles.infoText}>
              Last fetch: {format(lastBackgroundFetch, 'MMM d, h:mm a')}
            </Text>
          )}
        </View>

        {/* Platform Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Filters</Text>
          <Text style={styles.sectionDescription}>
            Get notifications for specific platforms
          </Text>

          {PLATFORM_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={styles.checkboxRow}
              onPress={() => togglePlatformFilter(option.value)}>
              <View
                style={[
                  styles.checkbox,
                  platformFilters.has(option.value) && styles.checkboxChecked,
                ]}>
                {platformFilters.has(option.value) && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Category Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technology Categories</Text>
          <Text style={styles.sectionDescription}>
            Get notifications for specific tech topics
          </Text>

          <View style={styles.grid}>
            {CATEGORY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={styles.gridItem}
                onPress={() => toggleCategoryFilter(option.value)}>
                <View
                  style={[
                    styles.gridCheckbox,
                    categoryFilters.has(option.value) && styles.gridCheckboxChecked,
                  ]}>
                  <Text style={styles.gridLabel}>{option.label}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Custom Keywords */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Keywords</Text>
          <Text style={styles.sectionDescription}>
            Add your own keywords to match
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={keywordInput}
              onChangeText={setKeywordInput}
              placeholder="e.g., typescript, rust, tutorial"
              placeholderTextColor="#999"
              onSubmitEditing={handleAddKeyword}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddKeyword}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipContainer}>
            {customKeywords.map((keyword) => (
              <View key={keyword} style={styles.chip}>
                <Text style={styles.chipText}>{keyword}</Text>
                <TouchableOpacity onPress={() => removeCustomKeyword(keyword)}>
                  <Text style={styles.chipRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Match Mode</Text>
            <View style={styles.segmentedControl}>
              <Pressable
                style={[
                  styles.segment,
                  keywordMatchMode === 'any' && styles.segmentActive,
                ]}
                onPress={() => setKeywordMatchMode('any')}>
                <Text
                  style={[
                    styles.segmentText,
                    keywordMatchMode === 'any' && styles.segmentTextActive,
                  ]}>
                  Any
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.segment,
                  keywordMatchMode === 'all' && styles.segmentActive,
                ]}
                onPress={() => setKeywordMatchMode('all')}>
                <Text
                  style={[
                    styles.segmentText,
                    keywordMatchMode === 'all' && styles.segmentTextActive,
                  ]}>
                  All
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Score Threshold */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Score</Text>
          <Text style={styles.sectionDescription}>
            Only notify for articles with at least {minScore} points (0 = disabled)
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={minScore.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                setMinScore(num);
              }}
              keyboardType="number-pad"
              placeholder="0"
            />
          </View>
        </View>

        {/* Domain Filtering */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allowed Domains</Text>
          <Text style={styles.sectionDescription}>
            Whitelist specific domains (empty = allow all)
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={domainInput}
              onChangeText={setDomainInput}
              placeholder="e.g., github.com"
              placeholderTextColor="#999"
              autoCapitalize="none"
              onSubmitEditing={handleAddDomain}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddDomain}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipContainer}>
            {allowedDomains.map((domain) => (
              <View key={domain} style={styles.chip}>
                <Text style={styles.chipText}>{domain}</Text>
                <TouchableOpacity onPress={() => removeAllowedDomain(domain)}>
                  <Text style={styles.chipRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <Text style={styles.sectionDescription}>
            Suppress notifications during specific hours
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Enable Quiet Hours</Text>
            <Switch value={quietHoursEnabled} onValueChange={toggleQuietHours} />
          </View>

          {quietHoursEnabled && (
            <>
              <View style={styles.timeRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.label}>Start Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={quietHoursStart}
                    onChangeText={setQuietHoursStart}
                    placeholder="22:00"
                  />
                </View>
                <View style={styles.timeColumn}>
                  <Text style={styles.label}>End Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={quietHoursEnd}
                    onChangeText={setQuietHoursEnd}
                    placeholder="08:00"
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleTestNotification}
            disabled={isSendingTest || permissionStatus !== 'granted'}>
            {isSendingTest ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonPrimaryText}>Send Test Notification</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleResetDefaults}>
            <Text style={styles.buttonDangerText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  badgeSuccess: {
    backgroundColor: '#d4edda',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridItem: {
    width: '50%',
    padding: 4,
  },
  gridCheckbox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  gridCheckboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    marginRight: 4,
  },
  chipRemove: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  segment: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  segmentActive: {
    backgroundColor: '#007AFF',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  segmentTextActive: {
    color: '#fff',
  },
  timeRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  timeColumn: {
    flex: 1,
    marginRight: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDanger: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  buttonDangerText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
});
