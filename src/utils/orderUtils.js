/**
 * Utilitas untuk membaca, menyimpan, dan mengurutkan urutan anak (urutan kelahiran).
 * Disimpan di localStorage dengan prefix `silsilah_birth_order_{treeId}_{parentId}`.
 */

const STORAGE_PREFIX = 'silsilah_birth_order';

/**
 * Mendapatkan daftar ID anak yang sudah diurutkan dari localStorage
 * @param {string} treeId 
 * @param {string} parentId 
 * @returns {Array<string>} Daftar ID anak berurutan
 */
export function getChildOrder(treeId, parentId) {
  if (!treeId || !parentId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${treeId}_${parentId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Gagal membaca urutan anak dari localStorage:', err);
    return [];
  }
}

/**
 * Menyimpan urutan ID anak ke localStorage
 * @param {string} treeId 
 * @param {string} parentId 
 * @param {Array<string>} orderedIds 
 */
export function saveChildOrder(treeId, parentId, orderedIds) {
  if (!treeId || !parentId || !Array.isArray(orderedIds)) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}_${treeId}_${parentId}`, JSON.stringify(orderedIds));
  } catch (err) {
    console.error('Gagal menyimpan urutan anak ke localStorage:', err);
  }
}

/**
 * Mengurutkan array anak berdasarkan urutan tersimpan, dengan fallback tanggal lahir atau urutan awal.
 * @param {Array} children - Daftar node anak
 * @param {string} treeId 
 * @param {string} parentId 
 * @returns {Array} Daftar anak yang sudah tersortir
 */
export function sortChildrenByOrder(children = [], treeId = null, parentId = null) {
  if (!children || children.length <= 1) return children;

  const savedOrder = treeId && parentId ? getChildOrder(treeId, parentId) : [];

  return [...children].sort((a, b) => {
    const indexA = savedOrder.indexOf(a.id);
    const indexB = savedOrder.indexOf(b.id);

    // Jika keduanya ada dalam urutan tersimpan
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // Jika hanya a yang ada
    if (indexA !== -1) return -1;
    // Jika hanya b yang ada
    if (indexB !== -1) return 1;

    // Fallback: urutkan berdasarkan tanggal lahir (tertua dulu)
    if (a.tanggal_lahir && b.tanggal_lahir) {
      return new Date(a.tanggal_lahir) - new Date(b.tanggal_lahir);
    }
    if (a.tanggal_lahir) return -1;
    if (b.tanggal_lahir) return 1;

    return 0;
  });
}
