import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {AppStackParamList} from '../../navigation/types';
import {useUploadNote} from '../../hooks/useUploadNote';
import {notesService} from '../../services/notes';
import {colors} from '../../theme/colors';
import {typography} from '../../theme/typography';
import {spacing, borderRadius} from '../../theme/spacing';

type ProcessNoteScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'ProcessNote'
>;

type ProcessNoteScreenRouteProp = RouteProp<AppStackParamList, 'ProcessNote'>;

interface Props {
  navigation: ProcessNoteScreenNavigationProp;
  route: ProcessNoteScreenRouteProp;
}

type ProcessingStatus = 'uploading' | 'processing' | 'completed' | 'error';

const ProcessNoteScreen: React.FC<Props> = ({navigation, route}) => {
  const {imageUri, source} = route.params;
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatus>('uploading');
  const [jobId, setJobId] = useState<string | null>(null);

  const uploadNoteMutation = useUploadNote();

  useEffect(() => {
    startUpload();
  }, []);

  useEffect(() => {
    if (jobId) {
      pollJobStatus();
    }
  }, [jobId]);

  const startUpload = async () => {
    try {
      setProcessingStatus('uploading');
      const response = await uploadNoteMutation.mutateAsync({
        imageUri,
        source,
        onProgress: setUploadProgress,
      });

      setJobId(response.job_id);
      setProcessingStatus('processing');
    } catch (error) {
      console.error('Upload error:', error);
      setProcessingStatus('error');
      Alert.alert(
        'Upload Failed',
        'Failed to upload image. Please try again.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    }
  };

  const pollJobStatus = () => {
    const interval = setInterval(async () => {
      try {
        if (!jobId) return;

        const status = await notesService.getJobStatus(jobId);

        if (status.status === 'completed') {
          clearInterval(interval);
          setProcessingStatus('completed');
          setTimeout(() => {
            navigation.navigate('Main');
          }, 1500);
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setProcessingStatus('error');
          Alert.alert(
            'Processing Failed',
            status.error || 'Failed to process note',
            [{text: 'OK', onPress: () => navigation.goBack()}],
          );
        }
      } catch (error) {
        clearInterval(interval);
        setProcessingStatus('error');
        Alert.alert('Error', 'Failed to check processing status', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      }
    }, 2000);

    setTimeout(() => {
      clearInterval(interval);
      if (processingStatus === 'processing') {
        setProcessingStatus('error');
        Alert.alert('Timeout', 'Processing is taking too long', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      }
    }, 60000);
  };

  const getStatusMessage = () => {
    switch (processingStatus) {
      case 'uploading':
        return 'Uploading image...';
      case 'processing':
        return 'Processing with AI...';
      case 'completed':
        return 'Note created successfully!';
      case 'error':
        return 'Something went wrong';
      default:
        return 'Processing...';
    }
  };

  const getStatusIcon = () => {
    switch (processingStatus) {
      case 'uploading':
      case 'processing':
        return '⏳';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{uri: imageUri}} style={styles.image} resizeMode="contain" />

      <View style={styles.statusContainer}>
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        <Text style={styles.statusText}>{getStatusMessage()}</Text>

        {processingStatus === 'uploading' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, {width: `${uploadProgress}%`}]}
              />
            </View>
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          </View>
        )}

        {processingStatus === 'processing' && (
          <Text style={styles.subtext}>
            Extracting text and generating summary...
          </Text>
        )}

        {processingStatus === 'completed' && (
          <Text style={styles.subtext}>Redirecting to your notes...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: '50%',
    backgroundColor: colors.surface,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  statusIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtext: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});

export default ProcessNoteScreen;
