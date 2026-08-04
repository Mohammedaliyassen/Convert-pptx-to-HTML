import React, { useState, useRef, useEffect } from 'react';
import { useStoryStore } from '../../store/useStoryStore';
import { Mic, Square, Play, Pause, Trash2, Upload, Volume2, Clock } from 'lucide-react';
import styles from './AudioRecorder.module.css';

export const AudioRecorder: React.FC = () => {
  const { story, activeSlideId, updateSlideAudio, deleteSlideAudio, updateSlideDuration } = useStoryStore();
  const currentSlide = story?.slides.find((s) => s.id === activeSlideId);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!currentSlide) return null;

  const slideDuration = currentSlide.duration || 4;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedUrl(audioUrl);
        
        // Stop all stream tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      setRecordingTime(0);
      setIsRecording(true);
      mediaRecorder.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('لا يمكن الوصول إلى الميكروفون. يرجى التحقق من صلاحيات المتصفح.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlayPreview = () => {
    if (!recordedUrl) return;
    if (isPlaying) {
      audioPreviewRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio(recordedUrl);
        audioPreviewRef.current.onended = () => setIsPlaying(false);
      } else {
        audioPreviewRef.current.src = recordedUrl;
      }
      audioPreviewRef.current.play();
      setIsPlaying(true);
    }
  };

  const saveRecordedAudio = () => {
    if (!recordedUrl) return;
    updateSlideAudio(currentSlide.id, {
      src: recordedUrl,
      name: `تسجيل صوتي - ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`,
      duration: recordingTime || 1,
    });
    // Clear preview state without revoking the URL since it was saved to the store
    setRecordedUrl('');
    setRecordingTime(0);
  };

  const discardRecordedAudio = () => {
    if (recordedUrl && recordedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedUrl('');
    setRecordingTime(0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    
    // Get audio duration
    const tempAudio = new Audio(url);
    tempAudio.addEventListener('loadedmetadata', () => {
      updateSlideAudio(currentSlide.id, {
        src: url,
        name: file.name,
        duration: Math.round(tempAudio.duration) || 1,
      });
    });
    tempAudio.addEventListener('error', () => {
      // Fallback if load fails
      updateSlideAudio(currentSlide.id, {
        src: url,
        name: file.name,
        duration: 5,
      });
    });
  };

  const handleDeleteAudio = () => {
    if (confirm('هل أنت متأكد من حذف التعليق الصوتي لهذه الشريحة؟')) {
      deleteSlideAudio(currentSlide.id);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.audioWidgetContainer}>
      <div className={styles.widgetHeader}>
        <Volume2 size={16} className={styles.iconPrimary} />
        <span>التعليق الصوتي للشريحة</span>
      </div>

      {currentSlide.audio ? (
        <div className={styles.activeAudioCard}>
          <div className={styles.audioDetails}>
            <span className={styles.audioName}>{currentSlide.audio.name}</span>
            <span className={styles.audioDuration}>{formatTime(currentSlide.audio.duration)}</span>
          </div>
          <div className={styles.audioActions}>
            <audio controls src={currentSlide.audio.src} className={styles.audioControl} />
            <button className={styles.deleteBtn} onClick={handleDeleteAudio} title="حذف الصوت">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.recordingInterface}>
          {isRecording ? (
            <div className={styles.recordingState}>
              <div className={styles.pulsingMic}>
                <Mic size={24} className={styles.micIconPulsing} />
              </div>
              <span className={styles.timer}>{formatTime(recordingTime)}</span>
              <button className={styles.stopButton} onClick={stopRecording}>
                <Square size={16} />
                <span>إيقاف التسجيل</span>
              </button>
            </div>
          ) : recordedUrl ? (
            <div className={styles.previewState}>
              <div className={styles.previewControls}>
                <button className={styles.previewPlayBtn} onClick={handlePlayPreview}>
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  <span>{isPlaying ? 'إيقاف مؤقت' : 'استماع للتسجيل'}</span>
                </button>
                <span className={styles.timer}>{formatTime(recordingTime)}</span>
              </div>
              <div className={styles.saveDeleteRow}>
                <button className={styles.saveBtn} onClick={saveRecordedAudio}>
                  <span>حفظ التعليق</span>
                </button>
                <button className={styles.discardBtn} onClick={discardRecordedAudio}>
                  <span>إلغاء</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.idleState}>
              <button className={styles.recordStartBtn} onClick={startRecording}>
                <Mic size={18} />
                <span>تسجيل صوتي 🎙️</span>
              </button>
              <button className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} />
                <span>رفع ملف صوتي 📁</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Slide duration config */}
      <hr style={{ border: 'none', borderTop: '1px solid #34373f', margin: '8px 0' }} />
      <div className={styles.durationControlSection}>
        <div className={styles.durationLabel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} className={styles.iconPrimary} />
            <span>زمن عرض هذه الشريحة:</span>
          </div>
          <span className={styles.durationVal}>{slideDuration} ثانية</span>
        </div>
        <input
          type="range"
          min="1"
          max="30"
          step="1"
          value={slideDuration}
          onChange={(e) => updateSlideDuration(currentSlide.id, parseInt(e.target.value, 10))}
          className={styles.durationSlider}
        />
      </div>
    </div>
  );
};
