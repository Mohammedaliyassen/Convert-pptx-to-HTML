import JSZip from 'jszip';
import type { Story, Slide, StoryElement, TextElement, ImageElement } from '../core/types';
import { compressImageToBase64 } from '../utils/imageCompressor';

// Helper to convert Blob to base64 Data URL
const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
};

// Helper to check if an image covers the slide area (at least 85% of slide viewport)
const isFullScreenBackground = (x: number, y: number, w: number, h: number, slideW: number, slideH: number): boolean => {
  const elementArea = w * h;
  const slideArea = slideW * slideH;
  const isNearOrigin = Math.abs(x) < 50 && Math.abs(y) < 50;
  return isNearOrigin && (elementArea / slideArea) >= 0.85;
};

// Converts PowerPoint EMUs (English Metric Units) to Canvas Pixels
const emuToPx = (emuAttr: string | null): number => {
  if (!emuAttr) return 0;
  const val = parseInt(emuAttr, 10);
  if (isNaN(val)) return 0;
  return val / 9525;
};

// Check if a Hex color is dark or light using YIQ formula
const isColorDark = (hex: string): boolean => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length < 6) return false; // Default to light if invalid
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq < 128;
};

// Resolve PowerPoint theme scheme colors to actual HEX codes
const resolveSchemeColor = (schemeVal: string | null, isBgDark: boolean): string => {
  if (!schemeVal) return isBgDark ? '#ffffff' : '#1a1b1f';
  
  switch (schemeVal) {
    case 'tx1':
    case 'dk1':
    case 'dk2':
      return '#1a1b1f'; // dark text/fill
    case 'bg1':
    case 'lt1':
    case 'lt2':
      return '#ffffff'; // light text/fill
    case 'accent1': return '#2f80ed'; // standard blue
    case 'accent2': return '#eb5757'; // standard red
    case 'accent3': return '#27ae60'; // standard green
    case 'accent4': return '#f2c94c'; // standard yellow
    case 'accent5': return '#9b51e0'; // purple
    case 'accent6': return '#f2994a'; // orange
    default:
      return isBgDark ? '#ffffff' : '#1a1b1f';
  }
};

export const importPptxFromFile = async (file: File): Promise<Story> => {
  const zip = await JSZip.loadAsync(file);
  const domParser = new DOMParser();

  // 1. Determine presentation dimensions (default to standard 16:9 widescreen in EMUs)
  let baseWidth = 1280;
  let baseHeight = 720;
  try {
    const presentationXmlText = await zip.file('ppt/presentation.xml')?.async('string');
    if (presentationXmlText) {
      const presDoc = domParser.parseFromString(presentationXmlText, 'text/xml');
      const sldSz = presDoc.getElementsByTagNameNS('*', 'sldSz')[0] || presDoc.getElementsByTagName('p:sldSz')[0];
      if (sldSz) {
        const cx = emuToPx(sldSz.getAttribute('cx'));
        const cy = emuToPx(sldSz.getAttribute('cy'));
        if (cx > 0 && cy > 0) {
          baseWidth = cx;
          baseHeight = cy;
        }
      }
    }
  } catch (err) {
    console.warn('Could not parse ppt/presentation.xml size, using 1280x720 defaults:', err);
  }

  // Target canvas is 1200x675
  const targetWidth = 1200;
  const targetHeight = 675;
  const scaleX = targetWidth / baseWidth;
  const scaleY = targetHeight / baseHeight;

  // Discover slide files
  const slideFileNames = Object.keys(zip.files).filter((path) =>
    path.startsWith('ppt/slides/slide') && path.endsWith('.xml')
  );

  // Sort slides numerically
  slideFileNames.sort((a, b) => {
    const numA = parseInt(a.replace(/[^\d]/g, ''), 10);
    const numB = parseInt(b.replace(/[^\d]/g, ''), 10);
    return numA - numB;
  });

  const slides: Slide[] = [];

  // Helper selectors to fetch tags safely across namespaces
  const getTag = (parent: Element, tagName: string): Element | null => {
    return parent.getElementsByTagNameNS('*', tagName)[0] || parent.getElementsByTagName(`p:${tagName}`)[0] || parent.getElementsByTagName(`a:${tagName}`)[0];
  };

  const getTags = (parent: Element, tagName: string): Element[] => {
    const list1 = Array.from(parent.getElementsByTagNameNS('*', tagName));
    if (list1.length > 0) return list1 as Element[];
    return Array.from(parent.getElementsByTagName(`p:${tagName}`))
      .concat(Array.from(parent.getElementsByTagName(`a:${tagName}`))) as Element[];
  };

  // Process slides
  for (let i = 0; i < slideFileNames.length; i++) {
    const slidePath = slideFileNames[i];
    const slideNum = slidePath.replace(/[^\d]/g, '');
    const slideXmlText = await zip.file(slidePath)?.async('string');
    
    if (!slideXmlText) continue;

    const slideDoc = domParser.parseFromString(slideXmlText, 'text/xml');
    const sld = slideDoc.getElementsByTagNameNS('*', 'sld')[0] || slideDoc.getElementsByTagName('p:sld')[0];
    if (!sld) continue;

    // Load relationships for media mappings
    const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    const relsXmlText = await zip.file(relsPath)?.async('string');
    const relsMap: Record<string, string> = {};
    
    if (relsXmlText) {
      try {
        const relsDoc = domParser.parseFromString(relsXmlText, 'text/xml');
        const relationships = Array.from(relsDoc.getElementsByTagName('Relationship'));
        relationships.forEach((rel) => {
          const id = rel.getAttribute('Id');
          const target = rel.getAttribute('Target');
          if (id && target) {
            relsMap[id] = target.replace(/^\.\.\//, 'ppt/');
          }
        });
      } catch (e) {
        console.warn(`Could not parse relations for slide ${slideNum}:`, e);
      }
    }

    const elements: StoryElement[] = [];
    const idMap = new Map<string, string[]>();
    let elementZIndex = 0;
    let slideBackgroundUrl = '';
    let slideBackgroundColor = '#ffffff';

    // Parse slide theme background color
    try {
      const bgPr = getTag(sld, 'bgPr') || getTag(sld, 'bg');
      if (bgPr) {
        const solidFill = getTag(bgPr, 'solidFill');
        if (solidFill) {
          const srgbClr = getTag(solidFill, 'srgbClr');
          if (srgbClr && srgbClr.getAttribute('val')) {
            slideBackgroundColor = `#${srgbClr.getAttribute('val')}`;
          }
        }
      }
    } catch (e) {
      console.warn('Could not parse slide background theme:', e);
    }

    const isBgDark = isColorDark(slideBackgroundColor);

    const spTree = getTag(sld, 'spTree');
    if (spTree) {
      // Get all child nodes to process in EXACT XML order (preserving Z-order)
      const childNodes = Array.from(spTree.childNodes).filter(
        (node) => node.nodeType === 1 // Element nodes
      ) as Element[];

      for (const child of childNodes) {
        const localName = child.localName;

        if (localName === 'nvGrpSpPr' || localName === 'grpSpPr') continue;

        // Extract shape identifier
        const cNvPr = getTag(child, 'cNvPr');
        const originalId = cNvPr ? cNvPr.getAttribute('id') : null;

        // Extract off, ext coordinates
        const xfrm = getTag(child, 'xfrm');
        if (!xfrm) continue;

        const off = getTag(xfrm, 'off');
        const ext = getTag(xfrm, 'ext');
        if (!off || !ext) continue;

        const rawX = emuToPx(off.getAttribute('x'));
        const rawY = emuToPx(off.getAttribute('y'));
        const rawW = emuToPx(ext.getAttribute('cx'));
        const rawH = emuToPx(ext.getAttribute('cy'));
        const rotAttr = xfrm.getAttribute('rot');
        const rawRot = rotAttr ? parseInt(rotAttr, 10) / 60000 : 0;

        const scaledX = Math.round(rawX * scaleX);
        const scaledY = Math.round(rawY * scaleY);
        const scaledW = Math.round(rawW * scaleX);
        const scaledH = Math.round(rawH * scaleY);

        // --- PICTURES / IMAGES (<p:pic>) ---
        if (localName === 'pic') {
          const blip = getTag(child, 'blip');
          const embedId = blip ? (blip.getAttribute('r:embed') || blip.getAttribute('embed')) : null;
          if (!embedId) continue;

          const mediaPath = relsMap[embedId];
          if (!mediaPath) continue;

          const imageFile = zip.file(mediaPath);
          if (!imageFile) continue;

          const imageBlob = await imageFile.async('blob');
          const objectUrl = await compressImageToBase64(imageBlob, 1200, 1200, 0.75, mediaPath);

          // Heuristic check: is this the very first element and does it fill the screen?
          if (elementZIndex === 0 && isFullScreenBackground(scaledX, scaledY, scaledW, scaledH, targetWidth, targetHeight)) {
            slideBackgroundUrl = objectUrl;
            continue; // set as slide background
          }

          const imgEl: ImageElement = {
            id: `el-pptx-i-${Math.random().toString(36).substring(2, 9)}`,
            type: 'image',
            x: scaledX,
            y: scaledY,
            width: scaledW,
            height: scaledH,
            rotation: Math.round(rawRot),
            opacity: 1,
            zIndex: elementZIndex++,
            locked: false,
            hidden: false,
            animation: null,
            src: objectUrl,
          };
          elements.push(imgEl);
          if (originalId) {
            idMap.set(originalId, [imgEl.id]);
          }
        }

        // --- SHAPES / TEXTS (<p:sp>) ---
        if (localName === 'sp') {
          // Identify shape placeholder type from its name
          const cNvPr = getTag(child, 'cNvPr');
          const shapeName = cNvPr ? cNvPr.getAttribute('name') || '' : '';
          const isTitleShape = /title/i.test(shapeName) || /header/i.test(shapeName);
          const isSubtitleShape = /subtitle/i.test(shapeName);

          // Check if shape has a picture fill (e.g. textured parchment background!)
          const blip = getTag(child, 'blip');
          const embedId = blip ? (blip.getAttribute('r:embed') || blip.getAttribute('embed')) : null;
          let hasImageBackground = false;
          let shapeBgUrl = '';

          if (embedId) {
            const mediaPath = relsMap[embedId];
            if (mediaPath) {
              const imageFile = zip.file(mediaPath);
              if (imageFile) {
                const imageBlob = await imageFile.async('blob');
                shapeBgUrl = await compressImageToBase64(imageBlob, 1200, 1200, 0.75, mediaPath);
                hasImageBackground = true;
              }
            }
          }

          // If shape has background image, insert it as an Image element first
          if (hasImageBackground && shapeBgUrl) {
            if (elementZIndex === 0 && isFullScreenBackground(scaledX, scaledY, scaledW, scaledH, targetWidth, targetHeight)) {
              slideBackgroundUrl = shapeBgUrl;
            } else {
              const imgEl: ImageElement = {
                id: `el-pptx-i-shp-${Math.random().toString(36).substring(2, 9)}`,
                type: 'image',
                x: scaledX,
                y: scaledY,
                width: scaledW,
                height: scaledH,
                rotation: Math.round(rawRot),
                opacity: 1,
                zIndex: elementZIndex++,
                locked: false,
                hidden: false,
                animation: null,
                src: shapeBgUrl,
              };
              elements.push(imgEl);
              if (originalId) {
                idMap.set(originalId, [imgEl.id]);
              }
            }
          }

          // Parse text inside shape
          const txBody = getTag(child, 'txBody');
          if (txBody) {
            const paragraphs = getTags(txBody, 'p');
            let currentOffsetY = 0;
            const paragraphSpacing = 8; // spacing between paragraphs in pixels
            const paragraphIds: string[] = [];

            paragraphs.forEach((p) => {
              // Extract paragraph properties
              const pPr = getTag(p, 'pPr');
              let align: 'left' | 'center' | 'right' | 'justify' = 'right';
              let textDirection: 'ltr' | 'rtl' = 'rtl';
              let defaultFontSize = isTitleShape ? 36 : (isSubtitleShape ? 24 : 18);
              let defaultTextColor = (hasImageBackground || !isBgDark) ? '#1a1b1f' : '#ffffff';
              let defaultFontFamily = 'Cairo';

              // 1. Read paragraph-level properties
              if (pPr) {
                const algnAttr = pPr.getAttribute('algn');
                if (algnAttr === 'ctr') align = 'center';
                else if (algnAttr === 'l') align = 'left';
                else if (algnAttr === 'r') align = 'right';
                else if (algnAttr === 'just') align = 'justify';

                const rtlAttr = pPr.getAttribute('rtl');
                if (rtlAttr === '1' || rtlAttr === 'true') textDirection = 'rtl';
                else if (rtlAttr === '0' || rtlAttr === 'false') textDirection = 'ltr';

                // Check default run properties for paragraph
                const defRPr = getTag(pPr, 'defRPr');
                if (defRPr) {
                  const szAttr = defRPr.getAttribute('sz');
                  if (szAttr) {
                    const ptSize = parseInt(szAttr, 10) / 100;
                    if (!isNaN(ptSize)) defaultFontSize = Math.round(ptSize * 1.33);
                  }

                  const solidFill = getTag(defRPr, 'solidFill');
                  if (solidFill) {
                    const srgbClr = getTag(solidFill, 'srgbClr');
                    const schemeClr = getTag(solidFill, 'schemeClr');
                    if (srgbClr && srgbClr.getAttribute('val')) {
                      defaultTextColor = `#${srgbClr.getAttribute('val')}`;
                    } else if (schemeClr) {
                      defaultTextColor = resolveSchemeColor(schemeClr.getAttribute('val'), isBgDark);
                    }
                  }

                  // Check default fonts on paragraph
                  const latinFont = getTag(defRPr, 'latin');
                  const csFont = getTag(defRPr, 'cs');
                  const eaFont = getTag(defRPr, 'ea');
                  const typeface = (csFont ? csFont.getAttribute('typeface') : null) || 
                                   (latinFont ? latinFont.getAttribute('typeface') : null) ||
                                   (eaFont ? eaFont.getAttribute('typeface') : null);
                  if (typeface) {
                    defaultFontFamily = typeface;
                  }
                }
              }

              // 2. Iterate paragraph children sequentially to preserve text strings & line breaks
              let pText = '';
              let pFontSize = defaultFontSize;
              let pTextColor = defaultTextColor;
              let pFontFamily = defaultFontFamily;
              let isBold = false;
              let isItalic = false;
              let isUnderline = false;
              let hasContent = false;

              const children = Array.from(p.childNodes).filter((node) => node.nodeType === 1) as Element[];
              children.forEach((childNode) => {
                const tag = childNode.localName;

                // Line Break (<a:br>)
                if (tag === 'br') {
                  pText += '\n';
                  hasContent = true;
                }

                // Text Run (<a:r>) or Field Run (<a:fld>)
                if (tag === 'r' || tag === 'fld') {
                  const t = getTag(childNode, 't');
                  if (t) {
                    pText += t.textContent || '';
                    hasContent = true;
                  }

                  // Parse specific styles
                  const rPr = getTag(childNode, 'rPr');
                  if (rPr) {
                    const szAttr = rPr.getAttribute('sz');
                    if (szAttr) {
                      const pt = parseInt(szAttr, 10) / 100;
                      if (!isNaN(pt)) pFontSize = Math.max(pFontSize, Math.round(pt * 1.33));
                    }

                    if (rPr.getAttribute('b') === '1' || rPr.getAttribute('b') === 'true') isBold = true;
                    if (rPr.getAttribute('i') === '1' || rPr.getAttribute('i') === 'true') isItalic = true;
                    if (rPr.getAttribute('u') === 'sng') isUnderline = true;

                    // Extract font face for run
                    const latinFont = getTag(rPr, 'latin');
                    const csFont = getTag(rPr, 'cs');
                    const eaFont = getTag(rPr, 'ea');
                    const typeface = (csFont ? csFont.getAttribute('typeface') : null) || 
                                     (latinFont ? latinFont.getAttribute('typeface') : null) ||
                                     (eaFont ? eaFont.getAttribute('typeface') : null);
                    if (typeface) {
                      pFontFamily = typeface;
                    }

                    const solidFill = getTag(rPr, 'solidFill');
                    if (solidFill) {
                      const srgbClr = getTag(solidFill, 'srgbClr');
                      const schemeClr = getTag(solidFill, 'schemeClr');
                      if (srgbClr && srgbClr.getAttribute('val')) {
                        pTextColor = `#${srgbClr.getAttribute('val')}`;
                      } else if (schemeClr) {
                        pTextColor = resolveSchemeColor(schemeClr.getAttribute('val'), isBgDark);
                      }
                    }
                  }
                }
              });

              if (!hasContent || !pText.trim()) return;

              // Calculate bounding height of this paragraph using line-wrapping estimation
              let totalLines = 0;
              pText.split('\n').forEach((subLine) => {
                const approxCharWidth = pFontSize * 0.48;
                const charsPerLine = Math.max(10, Math.floor(scaledW / approxCharWidth));
                totalLines += Math.max(1, Math.ceil(subLine.length / charsPerLine));
              });
              const pHeight = totalLines * Math.round(pFontSize * 1.35);

              const textEl: TextElement = {
                id: `el-pptx-t-${Math.random().toString(36).substring(2, 9)}`,
                type: 'text',
                x: scaledX,
                y: scaledY + currentOffsetY,
                width: scaledW,
                height: pHeight,
                rotation: Math.round(rawRot),
                opacity: 1,
                zIndex: elementZIndex++,
                locked: false,
                hidden: false,
                animation: null,
                text: pText,
                fontFamily: pFontFamily,
                fontSize: pFontSize,
                color: pTextColor,
                bold: isBold,
                italic: isItalic,
                underline: isUnderline,
                align: align,
                dir: textDirection,
              };

              elements.push(textEl);
              paragraphIds.push(textEl.id);
              currentOffsetY += pHeight + paragraphSpacing;
            });

            if (originalId && paragraphIds.length > 0) {
              idMap.set(originalId, paragraphIds);
            }
          }
        }
      }
    }

    // Parse PowerPoint timing animations (best-effort)
    try {
      const timing = getTag(sld, 'timing');
      if (timing) {
        // Query spTgt tags to find all animated element targets
        const spTgts = getTags(timing, 'spTgt');
        spTgts.forEach((spTgt) => {
          const spid = spTgt.getAttribute('spid');
          if (spid && idMap.has(spid)) {
            // Traverse up to find the timing effect node (animEffect, anim, set, animMotion, etc.)
            let effectNode = spTgt.parentElement; // p:tgtEl
            if (effectNode) effectNode = effectNode.parentElement; // p:cBhvr
            if (effectNode) effectNode = effectNode.parentElement; // effect block (animEffect, anim, set, etc.)

            if (effectNode) {
              const localName = effectNode.localName;
              let presetId = 'fade'; // default fallback for basic appearance
              
              if (localName === 'animEffect') {
                const filter = effectNode.getAttribute('filter') || 'fade';
                const lowercaseFilter = filter.toLowerCase();
                if (lowercaseFilter.includes('zoom')) presetId = 'zoom';
                else if (lowercaseFilter.includes('fly') || lowercaseFilter.includes('slide')) presetId = 'slide-left';
                else if (lowercaseFilter.includes('bounce')) presetId = 'bounce';
                else if (lowercaseFilter.includes('spin') || lowercaseFilter.includes('rotate')) presetId = 'rotate';
                else if (lowercaseFilter.includes('flip')) presetId = 'flip';
              } else if (localName === 'animMotion') {
                presetId = 'slide-left';
              } else if (localName === 'set') {
                presetId = 'fade'; // sets are usually visibility triggers
              } else if (localName === 'anim') {
                presetId = 'fade';
              }

              // Search parents hierarchically for dur & delay attributes
              let durVal = 1000;
              let delayVal = 0;
              
              let currentParent = effectNode.parentElement;
              while (currentParent && currentParent.localName !== 'timing') {
                const tag = currentParent.localName;
                if (tag === 'cTn' || tag === 'par') {
                  const durAttr = currentParent.getAttribute('dur');
                  const delayAttr = currentParent.getAttribute('delay');
                  if (durAttr) durVal = parseInt(durAttr, 10);
                  if (delayAttr) delayVal = parseInt(delayAttr, 10);
                }
                currentParent = currentParent.parentElement;
              }

              const duration = durVal / 1000 || 1.0;
              const delay = delayVal / 1000 || 0.0;

              const targetElementIds = idMap.get(spid);
              if (targetElementIds) {
                targetElementIds.forEach((elId) => {
                  const el = elements.find((item) => item.id === elId);
                  if (el) {
                    el.animation = {
                      presetId,
                      startTime: delay,
                      duration: duration,
                      delay: 0,
                      repeat: 0,
                    };
                  }
                });
              }
            }
          }
        });
      }
    } catch (timingErr) {
      console.warn('Could not parse slide timing animations:', timingErr);
    }

    // Scan relationships for any audio file
    let slideAudioUrl = '';
    let slideAudioName = '';
    let slideAudioDuration = 0;

    const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.wma', '.aac'];
    const audioRel = Object.values(relsMap).find((targetPath) => {
      const lower = targetPath.toLowerCase();
      return audioExtensions.some((ext) => lower.endsWith(ext));
    });

    if (audioRel) {
      try {
        const audioFile = zip.file(audioRel);
        if (audioFile) {
          const audioBlob = await audioFile.async('blob');
          const dataUrl = await blobToDataURL(audioBlob);
          slideAudioUrl = dataUrl;
          slideAudioName = audioRel.substring(audioRel.lastIndexOf('/') + 1);
          
          // Get duration
          slideAudioDuration = await new Promise<number>((resolve) => {
            const audioObj = new Audio(slideAudioUrl);
            audioObj.addEventListener('loadedmetadata', () => {
              resolve(audioObj.duration || 0);
            });
            audioObj.addEventListener('error', () => {
              resolve(0);
            });
            // Set 1-second timeout in case browser takes too long to load
            setTimeout(() => resolve(0), 1000);
          });
        }
      } catch (audioErr) {
        console.warn(`Could not extract audio relationship for slide ${slideNum}:`, audioErr);
      }
    }

    // Assign final background
    const background = slideBackgroundUrl 
      ? { type: 'image' as const, value: slideBackgroundUrl }
      : { type: 'color' as const, value: slideBackgroundColor };

    const slide: Slide = {
      id: `slide-pptx-${Math.random().toString(36).substring(2, 9)}`,
      background: background,
      elements: elements,
      audio: slideAudioUrl ? {
        src: slideAudioUrl,
        name: slideAudioName,
        duration: slideAudioDuration,
      } : null,
    };
    slides.push(slide);
  }

  if (slides.length === 0) {
    throw new Error('لم يتم العثور على شرائح صالحة لاستيرادها من ملف الـ PowerPoint.');
  }

  const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

  return {
    id: `story-pptx-${Math.random().toString(36).substring(2, 9)}`,
    title: cleanTitle,
    language: 'ar',
    direction: 'rtl',
    slides: slides,
  };
};
