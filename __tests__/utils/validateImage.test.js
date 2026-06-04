import { validateImage } from '@/utils/validateImage';

describe('validateImage', () => {
  it('accepts jpeg image under 10MB', () => {
    expect(() => validateImage({ mimeType: 'image/jpeg', fileSize: 5 * 1024 * 1024 })).not.toThrow();
  });

  it('accepts png image under 10MB', () => {
    expect(() => validateImage({ mimeType: 'image/png', fileSize: 1024 })).not.toThrow();
  });

  it('rejects non-image mime type', () => {
    expect(() => validateImage({ mimeType: 'application/pdf', fileSize: 100 })).toThrow(/image/i);
  });

  it('rejects file over 10MB', () => {
    expect(() => validateImage({ mimeType: 'image/jpeg', fileSize: 11 * 1024 * 1024 })).toThrow(/10/);
  });
});
