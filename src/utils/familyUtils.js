/**
 * Utility functions for inferring family relationships from flat member data.
 * Approach: "Inferred Spouse" — two members are spouses if they share at least one child.
 */

/**
 * Get all inferred spouses for a given member.
 * A spouse is inferred when a child exists with both ayah_id and ibu_id pointing
 * to two different members — one of which is the target member.
 *
 * @param {string} memberId - The member ID to find spouses for
 * @param {Array} allMembers - All family members in the tree
 * @returns {Array<{spouse: Object, sharedChildren: Array}>}
 */
export function getInferredSpouses(memberId, allMembers = []) {
  const member = allMembers.find((m) => m.id === memberId);
  if (!member) return [];

  const isMale = member.jenis_kelamin === 'L';

  // Find all children where this member is listed as ayah or ibu
  const children = allMembers.filter(
    (m) => m.ayah_id === memberId || m.ibu_id === memberId
  );

  // Group children by their "other parent" ID
  const spouseMap = new Map();

  children.forEach((child) => {
    const otherParentId = isMale ? child.ibu_id : child.ayah_id;
    if (!otherParentId) return; // Child has only one parent recorded

    if (!spouseMap.has(otherParentId)) {
      spouseMap.set(otherParentId, []);
    }
    spouseMap.get(otherParentId).push(child);
  });

  // Build result array with resolved spouse objects
  const result = [];
  spouseMap.forEach((sharedChildren, spouseId) => {
    const spouse = allMembers.find((m) => m.id === spouseId);
    if (spouse) {
      result.push({ spouse, sharedChildren });
    }
  });

  return result;
}

/**
 * Smart parent prefill for the "Add Child" action.
 * If the clicked parent has exactly one inferred spouse, auto-fill BOTH parents.
 * Otherwise, only fill the clicked parent and let the user select the other.
 *
 * @param {Object} parentData - The parent node data that was clicked
 * @param {Array} allMembers - All family members in the tree
 * @returns {Object} { ayah_id, ibu_id }
 */
export function getSmartParentPrefill(parentData, allMembers = [], treeId = null) {
  const isMale = parentData.jenis_kelamin === 'L';

  // Attempt to find inferred spouse(s)
  const inferred = getInferredSpouses(parentData.id, allMembers);

  // Also check explicit marriages via marriageUtils (imported at call site or use allMembers heuristic)
  // We combine inferred spouses for the check
  const allSpouseIds = new Set(inferred.map(s => s.spouse.id));

  if (allSpouseIds.size === 1) {
    // Exactly one spouse — auto-pair both parents (no prompt needed)
    const spouse = inferred[0].spouse;
    return {
      ayah_id: isMale ? parentData.id : spouse.id,
      ibu_id: isMale ? spouse.id : parentData.id,
    };
  }

  if (allSpouseIds.size > 1) {
    // POLIGAMI: Multiple spouses — require user to choose which co-parent
    return {
      parentNode: parentData,
      spouseChoices: inferred.map(s => s.spouse),
      // ayah_id / ibu_id will be determined after user picks spouse in AddMemberModal
    };
  }

  // No spouse — fill only the clicked parent
  return {
    ayah_id: isMale ? parentData.id : null,
    ibu_id: isMale ? null : parentData.id,
  };
}

/**
 * Count the number of children for a given member.
 *
 * @param {string} memberId - The member ID
 * @param {Array} allMembers - All family members in the tree
 * @returns {number}
 */
export function getChildrenCount(memberId, allMembers = []) {
  return allMembers.filter(
    (m) => m.ayah_id === memberId || m.ibu_id === memberId
  ).length;
}

/**
 * Check if a member has at least one inferred spouse.
 *
 * @param {string} memberId - The member ID
 * @param {Array} allMembers - All family members in the tree
 * @returns {boolean}
 */
export function hasInferredSpouse(memberId, allMembers = []) {
  return getInferredSpouses(memberId, allMembers).length > 0;
}
