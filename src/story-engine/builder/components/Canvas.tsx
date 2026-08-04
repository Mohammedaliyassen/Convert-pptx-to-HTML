import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Text as KonvaText, Image as KonvaImage, Transformer } from 'react-konva';
import { useStoryStore } from '../../store/useStoryStore';
import type { TextElement, ImageElement } from '../../core/types';
import styles from '../StoryBuilder.module.css';
import { applyAnimation, BUILTIN_PRESETS } from '../../utils/animationEngine';
import { loadGoogleFont } from '../../utils/fontLoader';

// Helper component to render images in Konva
const CanvasImage: React.FC<{
  el: ImageElement;
  onSelect: () => void;
  onChange: (updates: Partial<ImageElement>) => void;
}> = ({ el, onSelect, onChange }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = el.src;
    img.crossOrigin = 'anonymous'; // prevent canvas tainting where possible
    img.onload = () => {
      setImage(img);
      setError(false);
    };
    img.onerror = () => {
      setError(true);
    };
  }, [el.src]);

  if (error) {
    // Fallback if image fails to load
    return (
      <KonvaText
        id={el.id}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        text="⚠️ فشل تحميل الصورة"
        fontSize={16}
        fill="#ff0000"
        align="center"
        verticalAlign="middle"
        draggable={!el.locked}
        onClick={onSelect}
        onTouchStart={onSelect}
      />
    );
  }

  if (!image) {
    return (
      <KonvaText
        id={el.id}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        text="جاري التحميل..."
        fontSize={14}
        fill="#888"
        align="center"
        verticalAlign="middle"
      />
    );
  }

  return (
    <KonvaImage
      id={el.id}
      image={image}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation}
      opacity={el.opacity}
      draggable={!el.locked}
      onClick={onSelect}
      onTouchStart={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(10, node.width() * scaleX),
          height: Math.max(10, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
};

// Helper component to render texts in Konva
const CanvasText: React.FC<{
  el: TextElement;
  onSelect: () => void;
  onChange: (updates: Partial<TextElement>) => void;
}> = ({ el, onSelect, onChange }) => {
  const styleParts: string[] = [];
  if (el.bold) styleParts.push('bold');
  if (el.italic) styleParts.push('italic');
  const fontStyle = styleParts.join(' ') || 'normal';

  return (
    <KonvaText
      id={el.id}
      x={el.x}
      y={el.y}
      width={el.width}
      height={undefined}
      text={el.text}
      fontSize={el.fontSize}
      fontFamily={el.fontFamily}
      fill={el.color}
      fontStyle={fontStyle}
      align={el.align}
      textDecoration={el.underline ? 'underline' : 'none'}
      rotation={el.rotation}
      opacity={el.opacity}
      lineHeight={el.lineHeight || 1.25}
      wrap="word"
      draggable={!el.locked}
      onClick={onSelect}
      onTouchStart={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * scaleX),
          height: Math.max(10, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
};

export const Canvas: React.FC = () => {
  const {
    story,
    activeSlideId,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    deleteElement,
  } = useStoryStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [scale, setScale] = useState(1);

  const baseWidth = 1200;
  const baseHeight = 675;

  const currentSlide = story?.slides.find((s) => s.id === activeSlideId);

  // Resize handler for scaling the Konva stage responsively
  const resizeCanvas = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Buffer margins
    const availableWidth = containerWidth - 40;
    const availableHeight = containerHeight - 40;

    const scaleW = availableWidth / baseWidth;
    const scaleH = availableHeight / baseHeight;
    const newScale = Math.min(scaleW, scaleH, 1); // Clamp max scale to 1 for crisp rendering

    setScale(newScale);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const timer = setTimeout(resizeCanvas, 100);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(timer);
    };
  }, [resizeCanvas, activeSlideId]);

  // Handle animation preview triggers inside the editor canvas
  useEffect(() => {
    const handlePreview = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { elementId } = customEvent.detail || {};
      if (!elementId || !stageRef.current) return;

      const node = stageRef.current.findOne('#' + elementId);
      const el = currentSlide?.elements.find((item) => item.id === elementId);

      if (node && el && el.animation) {
        // Find custom preset or built-in preset
        const customPresets = useStoryStore.getState().customPresets || [];
        const preset = BUILTIN_PRESETS.find((p) => p.id === el.animation?.presetId)
          || customPresets.find((p) => p.id === el.animation?.presetId);

        if (preset) {
          applyAnimation(node, preset, {
            startTime: 0, // play immediately
            duration: el.animation.duration,
            delay: 0,
            repeat: 0, // preview once (no infinite loop in editor)
            ease: el.animation.ease,
          });
        }
      }
    };

    window.addEventListener('preview-element-animation', handlePreview);
    return () => {
      window.removeEventListener('preview-element-animation', handlePreview);
    };
  }, [currentSlide]);

  // Handle stage selection / click on empty area
  const handleStageMouseDown = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background-rect';
    if (clickedOnEmpty) {
      setSelectedElementId(null);
    }
  };

  // Sync Transformer nodes when selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    if (selectedElementId) {
      // Find node on stage
      const node = stageRef.current.findOne('#' + selectedElementId);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedElementId, activeSlideId, currentSlide?.elements]);

  // Global keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      const code = e.code;
      if (e.ctrlKey && (code === 'KeyZ' || key === 'z' || key === 'ئ')) {
        e.preventDefault();
        useStoryStore.temporal.getState().undo();
      } else if (e.ctrlKey && (code === 'KeyY' || key === 'y' || key === 'إ')) {
        e.preventDefault();
        useStoryStore.temporal.getState().redo();
      } else if (key === 'delete' || key === 'backspace' || code === 'Delete' || code === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedElementId, deleteElement]);

  // Compute a stable key representing the text font families present on this slide
  const textFontKeys = currentSlide?.elements
    .filter((el) => el.type === 'text')
    .map((el) => `${el.id}-${(el as TextElement).fontFamily}`)
    .join(',');

  // Load Google Fonts for active slide text elements and redraw Konva stage when ready
  useEffect(() => {
    if (!currentSlide) return;

    // Scan slide text elements
    currentSlide.elements.forEach((el) => {
      if (el.type === 'text') {
        loadGoogleFont(el.fontFamily);
      }
    });

    // Request stage redraw once fonts finish loading in browser
    if (document.fonts) {
      document.fonts.ready.then(() => {
        stageRef.current?.batchDraw();
      });
    }
  }, [currentSlide?.id, textFontKeys]);

  if (!story || !currentSlide) {
    return <div className={styles.canvasArea}>برجاء تحديد شريحة للبدء في التعديل.</div>;
  }

  // Generate CSS style for active slide background
  const getBackgroundStyle = (bg: any): React.CSSProperties => {
    if (bg.type === 'color') return { backgroundColor: bg.value };
    if (bg.type === 'gradient') return { background: bg.value };
    if (bg.type === 'image') {
      return {
        backgroundImage: `url(${bg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { backgroundColor: '#ffffff' };
  };

  const isRTL = story.direction === 'rtl';

  return (
    <main ref={containerRef} className={styles.canvasArea} onKeyDown={(e) => {
      // Delete element on Backspace/Delete keys
      if (selectedElementId && (e.key === 'Backspace' || e.key === 'Delete')) {
        // Prevent deleting if user is typing in input/textarea (handled by focused elements check)
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          useStoryStore.getState().deleteElement(selectedElementId);
        }
      }
    }} tabIndex={0}>
      <div
        className={`${styles.canvasStageWrapper} ${!selectedElementId ? styles.canvasStageWrapperSelected : ''}`}
        style={{
          width: baseWidth * scale,
          height: baseHeight * scale,
          ...getBackgroundStyle(currentSlide.background),
        }}
      >
        <Stage
          ref={stageRef}
          width={baseWidth * scale}
          height={baseHeight * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleStageMouseDown}
          onTouchStart={handleStageMouseDown}
        >
          <Layer>
            {/* Elements Layer */}
            {currentSlide.elements
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((el) => {
                if (el.type === 'text') {
                  return (
                    <CanvasText
                      key={el.id}
                      el={el as TextElement}
                      onSelect={() => setSelectedElementId(el.id)}
                      onChange={(updates) => updateElement(el.id, updates)}
                    />
                  );
                }
                if (el.type === 'image') {
                  return (
                    <CanvasImage
                      key={el.id}
                      el={el as ImageElement}
                      onSelect={() => setSelectedElementId(el.id)}
                      onChange={(updates) => updateElement(el.id, updates)}
                    />
                  );
                }
                return null;
              })}

            {/* Selection Bounding Box Transformer */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Minimum size constraints
                if (newBox.width < 20 || newBox.height < 10) {
                  return oldBox;
                }
                return newBox;
              }}
              enabledAnchors={[
                'top-left', 'top-center', 'top-right',
                'middle-right', 'middle-left',
                'bottom-left', 'bottom-center', 'bottom-right'
              ]}
              rotateEnabled={true}
              anchorSize={8}
              anchorCornerRadius={4}
              anchorStroke="#4facfe"
              anchorFill="#ffffff"
              borderStroke="#4facfe"
              borderDash={[3, 3]}
            />
          </Layer>
        </Stage>
      </div>

      <div className={styles.dragTip}>
        {isRTL 
          ? 'اسحب لتغيير الموضع. استخدم المقابض للتكبير والتصغير والتدوير. زر Backspace للحذف.' 
          : 'Drag to position. Use handles to scale & rotate. Backspace to delete.'}
      </div>
    </main>
  );
};
