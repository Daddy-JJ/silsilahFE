/**
 * Utilitas untuk mengelola relasi pernikahan (Marriage Relationship).
 *
 * v2 - Database-backed:
 * - Data pernikahan kini DISIMPAN di database melalui REST API, bukan localStorage.
 * - `getExplicitMarriages` menerima list marriages yang sudah di-fetch dari DB.
 * - Semua fungsi bekerja murni berdasarkan data yang dikirim sebagai parameter (stateless).
 */

/**
 * Mengambil daftar pasangan eksplisit dari data DB yang sudah di-fetch.
 * @param {Array} dbMarriages - Data dari API GET /trees/:id/marriages
 * @returns {Array<[string, string]>}
 */
export function getExplicitMarriages(dbMarriages = []) {
  const safeList = Array.isArray(dbMarriages) ? dbMarriages : [];
  return safeList.map(({ suami_id, istri_id }) =>
    [suami_id, istri_id].sort()
  );
}

/**
 * Mengambil seluruh pasangan terpadu untuk suatu anggota.
 * Menggabungkan pasangan dari anak bersama (inferred) dan pernikahan eksplisit (dari DB).
 *
 * @param {string} memberId
 * @param {Array} allMembers
 * @param {Array} dbMarriages - Data dari API GET /trees/:id/marriages
 * @returns {Array<{ spouse, sharedChildren, isExplicitOnly, marriageId }>}
 */
export function getAllSpouses(memberId, allMembers = [], dbMarriages = []) {
  const member = allMembers.find((m) => m.id === memberId);
  if (!member) return [];

  const isMale = member.jenis_kelamin === 'L';
  const spouseMap = new Map(); // spouseId -> { sharedChildren, marriageId }

  // 1. Inferred dari anak bersama
  const children = allMembers.filter(
    (m) => m.ayah_id === memberId || m.ibu_id === memberId
  );

  children.forEach((child) => {
    const otherParentId = isMale ? child.ibu_id : child.ayah_id;
    if (!otherParentId) return;

    if (!spouseMap.has(otherParentId)) {
      spouseMap.set(otherParentId, { sharedChildren: [], marriageId: null });
    }
    spouseMap.get(otherParentId).sharedChildren.push(child);
  });

  // 2. Gabungkan dengan pernikahan eksplisit dari Database (Defensif terhadap tipe non-array)
  const safeMarriages = Array.isArray(dbMarriages) ? dbMarriages : [];
  safeMarriages.forEach((marriage) => {
    if (!marriage) return;
    const { id: marriageId, suami_id, istri_id } = marriage;
    let otherId = null;
    if (suami_id === memberId) otherId = istri_id;
    else if (istri_id === memberId) otherId = suami_id;

    if (otherId) {
      if (!spouseMap.has(otherId)) {
        spouseMap.set(otherId, { sharedChildren: [], marriageId });
      } else {
        spouseMap.get(otherId).marriageId = marriageId;
      }
    }
  });

  // 3. Bentuk daftar pasangan
  const result = [];
  spouseMap.forEach(({ sharedChildren, marriageId }, spouseId) => {
    const spouse = allMembers.find((m) => m.id === spouseId);
    if (spouse) {
      result.push({
        spouse,
        sharedChildren,
        isExplicitOnly: sharedChildren.length === 0,
        marriageId,
      });
    }
  });

  return result;
}

/**
 * Cek apakah seorang anggota memiliki setidaknya satu pasangan
 * @param {string} memberId
 * @param {Array} allMembers
 * @param {Array} dbMarriages
 * @returns {boolean}
 */
export function hasSpouseRelation(memberId, allMembers = [], dbMarriages = []) {
  return getAllSpouses(memberId, allMembers, dbMarriages).length > 0;
}

/**
 * Mendapatkan seluruh pasangan unik di pohon untuk digambar di kanvas
 * @param {Array} allMembers
 * @param {Array} dbMarriages
 * @returns {Array<{ spouseA, spouseB, sharedChildren }>}
 */
export function getAllUniqueMarriagePairs(allMembers = [], dbMarriages = []) {
  const processedPairs = new Set();
  const pairs = [];

  allMembers.forEach((member) => {
    const spouses = getAllSpouses(member.id, allMembers, dbMarriages);
    spouses.forEach(({ spouse, sharedChildren }) => {
      const pairKey = [member.id, spouse.id].sort().join('_');
      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey);
        pairs.push({ spouseA: member, spouseB: spouse, sharedChildren });
      }
    });
  });

  return pairs;
}
