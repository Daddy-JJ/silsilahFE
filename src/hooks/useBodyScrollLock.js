import { useEffect } from 'react';

// Counter global agar modal bertingkat (nested modals) tidak saling menimpa status overflow
let lockCount = 0;

/**
 * Hook untuk mengunci scroll background (body) saat modal atau drawer aktif.
 * Menggunakan reference counter sehingga aman digunakan oleh beberapa modal sekaligus.
 * @param {boolean} isLocked
 */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    lockCount++;
    if (lockCount === 1) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [isLocked]);
}

export default useBodyScrollLock;
