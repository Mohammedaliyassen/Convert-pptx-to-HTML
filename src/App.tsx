import React, { useState, useRef } from 'react';
import { StoryBuilder } from './story-engine/builder/StoryBuilder';
import { StoryPlayer } from './story-engine/player/StoryPlayer';
import type { Story } from './story-engine/core/types';
import { importImageFromUrl, importImageFromFile } from './story-engine/importers/image';
import {
  importPptxFromFile,
  type PptxQualityPreset,
  PPTX_QUALITY_PRESETS,
} from './story-engine/importers/pptx';
import { importPdfFromFile } from './story-engine/importers/pdf';
import { useStoryStore } from './story-engine/store/useStoryStore';
import { Code, Upload, Link, FileJson, Copy, Check, X, Sliders, Play } from 'lucide-react';
import styles from './App.module.css';

// Helper to truncate base64 data strings for smooth JSON previews in developer panel
const getTruncatedJson = (story: Story | null): string => {
  if (!story) return '';
  try {
    const clone = JSON.parse(JSON.stringify(story));
    clone.slides.forEach((slide: any) => {
      if (slide.background && slide.background.type === 'image' && slide.background.value.startsWith('data:')) {
        slide.background.value = slide.background.value.substring(0, 60) + '... [TRUNCATED BASE64]';
      }
      if (slide.audio && slide.audio.src.startsWith('data:')) {
        slide.audio.src = slide.audio.src.substring(0, 60) + '... [TRUNCATED BASE64]';
      }
      slide.elements.forEach((el: any) => {
        if (el.type === 'image' && el.src.startsWith('data:')) {
          el.src = el.src.substring(0, 60) + '... [TRUNCATED BASE64]';
        }
      });
    });
    return JSON.stringify(clone, null, 2);
  } catch (err) {
    return JSON.stringify(story, null, 2);
  }
};

function App() {
  const [appMode, setAppMode] = useState<'builder' | 'player'>('builder');
  const [latestSave, setLatestSave] = useState<Story | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [copied, setCopied] = useState(false);

  // PPTX import progress + quality
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [importMessage, setImportMessage] = useState<string>('');
  const [pptxQuality, setPptxQuality] = useState<PptxQualityPreset>('balanced');

  // Standalone Player states
  const [standaloneStory, setStandaloneStory] = useState<Story | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const { loadStory } = useStoryStore();

  const handleSave = (story: Story) => {
    setLatestSave(story);
    console.log('[Autosave] Exposing story JSON state to host site:', story);
  };

  const handleCopyJson = () => {
    if (!latestSave) return;
    navigator.clipboard.writeText(JSON.stringify(latestSave, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUrlImport = () => {
    if (!imgUrlInput.trim()) return;
    const importedStory = importImageFromUrl(imgUrlInput.trim(), 'قصة مستوردة من الرابط');
    loadStory(importedStory);
    setImgUrlInput('');
    setIsConsoleOpen(false);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedStory = await importImageFromFile(file);
      loadStory(importedStory);
      setIsConsoleOpen(false);
    } catch (err) {
      console.error('Error importing file:', err);
      alert('فشل استيراد الصورة المحملة.');
    }
  };

  const handlePptxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be selected again later
    e.target.value = '';
    setImportProgress(0);
    setImportMessage('بدء استيراد PowerPoint...');
    try {
      const importedStory = await importPptxFromFile(
        file,
        (percent, message) => {
          setImportProgress(percent);
          if (message) setImportMessage(message);
        },
        { preset: pptxQuality }
      );
      loadStory(importedStory);
      setIsConsoleOpen(false);
    } catch (err) {
      console.error('Error importing PPTX:', err);
      const detail =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'خطأ غير معروف';
      alert(`فشل استيراد ملف البوربوينت.\n${detail}`);
    } finally {
      setImportProgress(null);
      setImportMessage('');
    }
  };

  const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedStory = await importPdfFromFile(file);
      loadStory(importedStory);
      setIsConsoleOpen(false);
    } catch (err) {
      console.error('Error importing PDF:', err);
      alert('فشل استيراد ملف الـ PDF.');
    }
  };

  // JSON story upload — loads into builder (and optional standalone player)
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedStory = JSON.parse(event.target?.result as string);
        if (!parsedStory.slides || !Array.isArray(parsedStory.slides)) {
          throw new Error('ملف JSON غير متوافق مع بنية القصص.');
        }
        const normalized = {
          id: typeof parsedStory.id === 'string' ? parsedStory.id : Math.random().toString(36).slice(2, 9),
          title:
            typeof parsedStory.title === 'string'
              ? parsedStory.title
              : file.name.replace(/\.json$/i, ''),
          language: parsedStory.language === 'en' ? 'en' : 'ar',
          direction: parsedStory.direction === 'ltr' ? 'ltr' : 'rtl',
          slides: parsedStory.slides,
        };
        // Open in the editor
        loadStory(normalized as any);
        // Also keep available for standalone player mode
        setStandaloneStory(normalized as any);
        setAppMode('builder');
        setIsConsoleOpen(false);
      } catch (err) {
        console.error('JSON Parse error:', err);
        alert('حدث خطأ أثناء قراءة الملف. يرجى التأكد من اختيار ملف JSON صالح ومصدّر من محرر القصص.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={styles.appHost}>
      {/* Full-screen loading overlay during PPTX import */}
      {importProgress !== null && (
        <div className={styles.importOverlay} role="status" aria-live="polite">
          <div className={styles.importCard}>
            <div className={styles.importSpinner} />
            <div className={styles.importPercent}>{importProgress}%</div>
            <div className={styles.importMessage}>{importMessage || 'جاري الاستيراد...'}</div>
            <div className={styles.importBarTrack}>
              <div
                className={styles.importBarFill}
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Header Navigation Bar */}
      <div className={styles.appHeader}>
        <div className={styles.appBrand}>Grafity Story Engine</div>
        <div className={styles.appNav}>
          <button
            className={`${styles.navItem} ${appMode === 'builder' ? styles.navItemActive : ''}`}
            onClick={() => setAppMode('builder')}
          >
            <Sliders size={14} style={{ display: 'inline', marginLeft: '6px', verticalAlign: 'text-bottom' }} />
            <span>منشئ القصص (Editor Mode)</span>
          </button>
          <button
            className={`${styles.navItem} ${appMode === 'player' ? styles.navItemActive : ''}`}
            onClick={() => setAppMode('player')}
          >
            <Play size={14} style={{ display: 'inline', marginLeft: '6px', verticalAlign: 'text-bottom' }} />
            <span>المشغل المستقل (Standalone Player)</span>
          </button>
        </div>
      </div>

      {appMode === 'builder' ? (
        <>
          {/* Embedded Story Builder Module */}
          <StoryBuilder onSave={handleSave} />

          {/* Floating Developer Console Toggle */}
          <button
            className={styles.consoleToggle}
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            title="عرض لوحة التحكم للمطور"
          >
            <Code size={18} />
            <span>لوحة المطور (Autosave JSON)</span>
          </button>

          {/* Developer Console Drawer */}
          <div className={`${styles.consoleDrawer} ${isConsoleOpen ? styles.drawerOpen : ''}`}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitle}>
                <FileJson size={18} />
                <span>لوحة التحكم ومخرجات الحفظ التلقائي</span>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsConsoleOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.drawerContent}>
              {/* Section 1: Importers */}
              <div className={styles.consoleSection}>
                <div className={styles.sectionTitle}>📥 اختبار مستورد الملفات (Importers)</div>
                <p className={styles.sectionDesc}>
                  قم باستيراد عروض تقديمية (PPTX)، ملفات (PDF)، أو صور لإنشاء قصة جديدة متوافقة مع المخطط.
                </p>
                
                <div className={styles.importControls}>
                  {/* PPTX quality preset */}
                  <div className={styles.qualityRow}>
                    <label className={styles.qualityLabel} htmlFor="pptx-quality">
                      جودة تصدير PPTX (حجم الملف):
                    </label>
                    <select
                      id="pptx-quality"
                      className={styles.qualitySelect}
                      value={pptxQuality}
                      onChange={(e) =>
                        setPptxQuality(e.target.value as PptxQualityPreset)
                      }
                    >
                      <option value="high">
                        عالية — {PPTX_QUALITY_PRESETS.high.imageMaxEdge}px /{' '}
                        {Math.round(PPTX_QUALITY_PRESETS.high.imageJpegQuality * 100)}% + صوت كامل
                      </option>
                      <option value="balanced">
                        متوازنة — {PPTX_QUALITY_PRESETS.balanced.imageMaxEdge}px /{' '}
                        {Math.round(PPTX_QUALITY_PRESETS.balanced.imageJpegQuality * 100)}% (موصى بها)
                      </option>
                      <option value="small">
                        صغيرة — {PPTX_QUALITY_PRESETS.small.imageMaxEdge}px /{' '}
                        {Math.round(PPTX_QUALITY_PRESETS.small.imageJpegQuality * 100)}% + صوت مضغوط
                      </option>
                      <option value="minimal">
                        أصغر حجم — {PPTX_QUALITY_PRESETS.minimal.imageMaxEdge}px /{' '}
                        {Math.round(PPTX_QUALITY_PRESETS.minimal.imageJpegQuality * 100)}% بدون سرد
                      </option>
                    </select>
                  </div>

                  {/* PowerPoint PPTX Import */}
                  <label className={styles.fileUploadLabel} style={{ borderColor: 'rgba(235, 87, 87, 0.4)' }}>
                    <Upload size={16} style={{ color: '#eb5757' }} />
                    <span style={{ color: '#eb5757' }}>استيراد عرض PowerPoint (PPTX)...</span>
                    <input
                      type="file"
                      accept=".pptx"
                      onChange={handlePptxImport}
                      className={styles.fileInputHidden}
                    />
                  </label>

                  {/* PDF Import */}
                  <label className={styles.fileUploadLabel} style={{ borderColor: 'rgba(47, 128, 237, 0.4)' }}>
                    <Upload size={16} style={{ color: '#2f80ed' }} />
                    <span style={{ color: '#2f80ed' }}>استيراد ملف مستند (PDF)...</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfImport}
                      className={styles.fileInputHidden}
                    />
                  </label>
                  {/* JSON Story Import */}
                  <label className={styles.fileBtn} style={{ marginTop: 10 }}>
                    <Upload size={16} />
                    <span style={{ color: '#34d399' }}>استيراد قصة JSON...</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleJsonUpload}
                      style={{ display: 'none' }}
                    />
                  </label>


                  {/* File Image Upload */}
                  <label className={styles.fileUploadLabel}>
                    <Upload size={16} />
                    <span>تحميل صورة مفردة...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileImport}
                      className={styles.fileInputHidden}
                    />
                  </label>

                  {/* URL image input */}
                  <div className={styles.urlInputRow}>
                    <input
                      type="text"
                      placeholder="أو أدخل رابط صورة مباشر (URL)..."
                      value={imgUrlInput}
                      onChange={(e) => setImgUrlInput(e.target.value)}
                      className={styles.urlInput}
                    />
                    <button className={styles.importBtn} onClick={handleUrlImport}>
                      <Link size={14} />
                      <span>استيراد</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Real-time JSON output */}
              <div className={styles.consoleSection} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div className={styles.jsonHeaderRow}>
                  <div className={styles.sectionTitle}>💾 مخرجات JSON الفورية (Autosaved Story JSON)</div>
                  {latestSave && (
                    <button className={styles.copyBtn} onClick={handleCopyJson}>
                      {copied ? <Check size={14} style={{ color: '#27ae60' }} /> : <Copy size={14} />}
                      <span>{copied ? 'تم النسخ!' : 'نسخ كود JSON'}</span>
                    </button>
                  )}
                </div>
                
                <div className={styles.jsonPreWrapper}>
                  {isConsoleOpen && latestSave ? (
                    <pre className={styles.jsonPre}>
                      <code>{getTruncatedJson(latestSave)}</code>
                    </pre>
                  ) : isConsoleOpen ? (
                    <div className={styles.jsonPlaceholder}>
                      قم بإجراء أي تعديل في منشئ القصة (مثل إضافة نص أو تحريكه) لمشاهدة تحديث كائن الـ JSON المحفوظ تلقائيًا في الوقت الفعلي.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.playerModeContainer}>
          {standaloneStory ? (
            <div className={styles.playerWrapper}>
              <StoryPlayer story={standaloneStory} onClose={() => setStandaloneStory(null)} />
            </div>
          ) : (
            <div className={styles.uploadJsonCard}>
              <div className={styles.jsonIconWrapper}>
                <FileJson size={32} />
              </div>
              <h2 className={styles.cardTitle}>تصفح وتشغيل القصص المستقلة</h2>
              <p className={styles.cardDesc}>
                قم برفع ملف قصة بصيغة <strong>JSON</strong> (الذي قمت بتصديره من منشئ القصص) ليتم رندرته وعرضه داخل المشغل المستقل تلقائياً وبأداء عالٍ.
              </p>
              <button
                className={styles.uploadJsonBtn}
                onClick={() => jsonFileInputRef.current?.click()}
              >
                <Upload size={16} />
                <span>تحميل ملف قصة (.json)</span>
              </button>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                onChange={handleJsonUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
