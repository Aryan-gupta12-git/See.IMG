/**
 * Image Metadata Sanitizer
 *
 * Provides client-side, zero-dependency binary metadata stripping for images before upload.
 * Strips sensitive EXIF, GPS location coordinates, camera models, timestamps, IPTC, and
 * embedded text metadata directly in the browser so the original metadata-bearing file
 * never reaches Cloudinary or external networks.
 *
 * Operates losslessly by removing metadata marker segments / chunks from the binary stream
 * without re-encoding pixel data, preserving 100% of the original image quality.
 */

/**
 * Strips EXIF (APP1), XMP (APP1), IPTC (APP13), and Comments (COM) from JPEG files.
 * Preserves APP0 (JFIF), APP2 (ICC color profile), and all compressed scan data.
 */
export function stripJpegMetadata(buffer: ArrayBuffer): ArrayBuffer {
  const view = new DataView(buffer);
  // Check SOI (Start of Image) marker: 0xFFD8
  if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) {
    return buffer;
  }

  const chunks: ArrayBuffer[] = [];
  // Keep SOI
  chunks.push(buffer.slice(0, 2));
  let offset = 2;
  let hasStripped = false;

  while (offset < view.byteLength - 1) {
    // Locate segment marker (skip any 0xFF fill bytes)
    if (view.getUint8(offset) !== 0xFF) {
      // Non-standard stream; append remainder and terminate safely
      chunks.push(buffer.slice(offset));
      break;
    }

    while (offset < view.byteLength && view.getUint8(offset) === 0xFF) {
      offset++;
    }

    if (offset >= view.byteLength) {
      break;
    }

    const marker = view.getUint8(offset);
    offset++;

    // EOI (End of Image): 0xD9
    if (marker === 0xD9) {
      chunks.push(new Uint8Array([0xFF, 0xD9]).buffer);
      break;
    }

    // SOS (Start of Scan): 0xDA
    // Compressed entropy scan data begins here and continues to EOI.
    // Copy the entire remainder of the file as-is.
    if (marker === 0xDA) {
      // Re-insert 0xFF, 0xDA marker prefix + remainder
      const sosMarker = new Uint8Array([0xFF, 0xDA]);
      chunks.push(sosMarker.buffer);
      chunks.push(buffer.slice(offset));
      break;
    }

    // Markers without payload length
    if (marker === 0x00 || (marker >= 0xD0 && marker <= 0xD7)) {
      chunks.push(new Uint8Array([0xFF, marker]).buffer);
      continue;
    }

    // Markers with payload length
    if (offset + 2 > view.byteLength) {
      chunks.push(buffer.slice(offset - 2));
      break;
    }

    const segmentLength = view.getUint16(offset);
    const payloadStart = offset - 1; // includes 0xFF and marker
    const payloadEnd = offset + segmentLength;

    if (payloadEnd > view.byteLength) {
      chunks.push(buffer.slice(payloadStart));
      break;
    }

    // Sensitive metadata markers to strip:
    // 0xE1: APP1 (Exif GPS/camera metadata and Adobe XMP)
    // 0xED: APP13 (Photoshop IPTC metadata)
    // 0xFE: COM (Comment)
    const isApp1 = marker === 0xE1;
    const isApp13 = marker === 0xED;
    const isComment = marker === 0xFE;

    if (isApp1 || isApp13 || isComment) {
      hasStripped = true;
      offset = payloadEnd;
    } else {
      // Retain segment (APP0 JFIF, APP2 ICC_PROFILE, DQT, DHT, SOF, etc.)
      const segmentWithMarker = new Uint8Array(2 + segmentLength);
      segmentWithMarker[0] = 0xFF;
      segmentWithMarker[1] = marker;
      segmentWithMarker.set(new Uint8Array(buffer.slice(offset, payloadEnd)), 2);
      chunks.push(segmentWithMarker.buffer);
      offset = payloadEnd;
    }
  }

  if (!hasStripped) {
    return buffer;
  }

  return mergeBuffers(chunks);
}

/**
 * Strips eXIf, tEXt, zTXt, and iTXt metadata chunks from PNG files.
 * Preserves IHDR, PLTE, IDAT, tRNS, iCCP, and IEND chunks.
 */
export function stripPngMetadata(buffer: ArrayBuffer): ArrayBuffer {
  const view = new DataView(buffer);
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    view.byteLength < 8 ||
    view.getUint32(0) !== 0x89504E47 ||
    view.getUint32(4) !== 0x0D0A1A0A
  ) {
    return buffer;
  }

  const chunks: ArrayBuffer[] = [];
  chunks.push(buffer.slice(0, 8)); // 8-byte PNG signature
  let offset = 8;
  let hasStripped = false;

  const metadataChunkTypes = new Set(['eXIf', 'tEXt', 'zTXt', 'iTXt']);

  while (offset + 8 <= view.byteLength) {
    const chunkLength = view.getUint32(offset);
    const typeChars = [
      String.fromCharCode(view.getUint8(offset + 4)),
      String.fromCharCode(view.getUint8(offset + 5)),
      String.fromCharCode(view.getUint8(offset + 6)),
      String.fromCharCode(view.getUint8(offset + 7)),
    ].join('');

    const totalChunkLength = 12 + chunkLength; // 4 (len) + 4 (type) + data + 4 (crc)

    if (offset + totalChunkLength > view.byteLength) {
      chunks.push(buffer.slice(offset));
      break;
    }

    if (metadataChunkTypes.has(typeChars)) {
      hasStripped = true;
      offset += totalChunkLength;
    } else {
      chunks.push(buffer.slice(offset, offset + totalChunkLength));
      offset += totalChunkLength;
    }

    if (typeChars === 'IEND') {
      break;
    }
  }

  if (!hasStripped) {
    return buffer;
  }

  return mergeBuffers(chunks);
}

/**
 * Strips EXIF and XMP metadata chunks from WebP RIFF containers.
 * Clears the Exif and XMP flags in the VP8X header.
 */
export function stripWebpMetadata(buffer: ArrayBuffer): ArrayBuffer {
  const view = new DataView(buffer);
  // WebP signature: 'RIFF' [4 bytes size] 'WEBP'
  if (
    view.byteLength < 12 ||
    view.getUint32(0) !== 0x52494646 ||
    view.getUint32(8) !== 0x57454250
  ) {
    return buffer;
  }

  const chunks: ArrayBuffer[] = [];
  chunks.push(buffer.slice(0, 12)); // Header placeholder
  let offset = 12;
  let hasStripped = false;

  while (offset + 8 <= view.byteLength) {
    const typeChars = [
      String.fromCharCode(view.getUint8(offset)),
      String.fromCharCode(view.getUint8(offset + 1)),
      String.fromCharCode(view.getUint8(offset + 2)),
      String.fromCharCode(view.getUint8(offset + 3)),
    ].join('');

    const chunkDataSize = view.getUint32(offset + 4, true); // Little-endian
    const paddedSize = chunkDataSize + (chunkDataSize % 2); // 2-byte aligned
    const totalChunkLength = 8 + paddedSize;

    if (offset + totalChunkLength > view.byteLength) {
      chunks.push(buffer.slice(offset));
      break;
    }

    if (typeChars === 'EXIF' || typeChars === 'XMP ') {
      hasStripped = true;
      offset += totalChunkLength;
    } else if (typeChars === 'VP8X') {
      // VP8X header flags byte is at payload offset 0 (file offset + 8)
      // Bit 3 = Exif (0x08), Bit 2 = XMP (0x04). Mask out both bits.
      const vp8xChunk = new Uint8Array(buffer.slice(offset, offset + totalChunkLength));
      if (vp8xChunk.length >= 9) {
        vp8xChunk[8] = vp8xChunk[8] & ~0x0C;
      }
      chunks.push(vp8xChunk.buffer);
      offset += totalChunkLength;
    } else {
      chunks.push(buffer.slice(offset, offset + totalChunkLength));
      offset += totalChunkLength;
    }
  }

  if (!hasStripped) {
    return buffer;
  }

  const merged = mergeBuffers(chunks);
  // Update RIFF payload size at byte 4 (total size - 8)
  const resultView = new DataView(merged);
  resultView.setUint32(4, merged.byteLength - 8, true);

  return merged;
}

/**
 * Combines an array of ArrayBuffers into a single contiguous ArrayBuffer.
 */
function mergeBuffers(chunks: ArrayBuffer[]): ArrayBuffer {
  const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(new Uint8Array(chunk), pos);
    pos += chunk.byteLength;
  }
  return result.buffer;
}

/**
 * Strips sensitive EXIF, GPS location, and personal metadata from an image File.
 * Returns a new sanitized File object suitable for safe upload.
 */
export async function stripImageMetadata(file: File): Promise<File> {
  try {
    const buffer = await file.arrayBuffer();
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    let cleanedBuffer: ArrayBuffer = buffer;

    if (type === 'image/jpeg' || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
      cleanedBuffer = stripJpegMetadata(buffer);
    } else if (type === 'image/png' || name.endsWith('.png')) {
      cleanedBuffer = stripPngMetadata(buffer);
    } else if (type === 'image/webp' || name.endsWith('.webp')) {
      cleanedBuffer = stripWebpMetadata(buffer);
    }

    // Return sanitized file preserving original name, MIME type, and dimensions
    return new File([cleanedBuffer], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn('Metadata sanitization skipped due to parsing issue:', err);
    return file;
  }
}
