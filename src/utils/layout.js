import dagre from '@dagrejs/dagre';
import { sortChildrenByOrder } from './orderUtils';
import { getAllSpouses } from './marriageUtils';

export const NODE_WIDTH = 260;
export const NODE_HEIGHT = 140;
export const NODE_SEP = 60;   // Increased horizontal gap between nodes
export const RANK_SEP = 100;  // Increased vertical gap between generations

/**
 * Menghitung tata letak hierarki otomatis (Top-to-Bottom) yang cerdas:
 * 1. Menggabungkan Pasangan (Virtual Grouping) — pasangan selalu sejajar.
 * 2. Menentukan generasi/rank menggunakan Dagre.
 * 3. Menukar koordinat (Order-Aware) agar urutan anak sesuai data.
 * 4. Membongkar Virtual Group kembali menjadi node individu yang rapi.
 *
 * Fix v2:
 * - Pasangan (in-law) yang berasal dari luar pohon tidak diperlakukan sebagai sibling.
 * - Setiap spouse group diberi width yang cukup agar tidak tumpang tindih.
 * - Anak di-center tepat di antara pasangan Ayah dan Ibu yang benar.
 */
export function getLayoutedElements(nodes, edges, direction = 'TB', treeId = null, dbMarriages = []) {
  if (!nodes || nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const rawMembers = nodes.map((n) => ({ id: n.id, ...(n.data || {}) }));

  // --- 1. Identifikasi Spouse Groups (Connected Components) ---
  // Buat adjacency list berdasarkan relasi pasangan
  const adjList = new Map();
  nodes.forEach(n => adjList.set(n.id, new Set()));

  nodes.forEach(node => {
    const spouses = getAllSpouses(node.id, rawMembers, dbMarriages);
    spouses.forEach(({ spouse }) => {
      if (adjList.has(spouse.id)) {
        adjList.get(node.id).add(spouse.id);
        adjList.get(spouse.id).add(node.id);
      }
    });
  });

  const visited = new Set();
  const spouseGroups = [];
  const nodeToGroup = new Map();

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const groupMembers = [];
      const queue = [node.id];
      visited.add(node.id);

      while (queue.length > 0) {
        const curr = queue.shift();
        const currNode = nodes.find(n => n.id === curr);
        if (currNode) groupMembers.push(currNode);
        
        adjList.get(curr).forEach(neighbor => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }
      
      // Tentukan urutan internal dalam group
      // Untuk poligami: Istri 1 - Suami - Istri 2
      const males = groupMembers.filter(m => m.data?.jenis_kelamin === 'L');
      const females = groupMembers.filter(m => m.data?.jenis_kelamin === 'P');
      const unknowns = groupMembers.filter(m => m.data?.jenis_kelamin !== 'L' && m.data?.jenis_kelamin !== 'P');
      
      let orderedMembers;
      if (males.length === 1 && females.length === 2) {
        // Poligami: Istri 1 - Suami - Istri 2
        orderedMembers = [females[0], males[0], females[1], ...unknowns];
      } else {
        // Default: Laki-laki di kiri, Perempuan di kanan
        orderedMembers = [...males, ...females, ...unknowns];
      }
      
      const groupId = `group_${groupMembers.map(m => m.id).join('_')}`;
      // Gunakan jarak 60px antar pasangan agar simpul knot (24px) leluasa di tengah
      const intraGroupSep = 60;
      const groupObj = {
        id: groupId,
        members: orderedMembers,
        width: orderedMembers.length * NODE_WIDTH + (orderedMembers.length - 1) * intraGroupSep,
        height: NODE_HEIGHT,
        intraGroupSep,
      };
      
      spouseGroups.push(groupObj);
      orderedMembers.forEach(m => nodeToGroup.set(m.id, groupObj));
    }
  });

  // --- 2. Buat Dagre Graph Virtual ---
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: NODE_SEP,
    ranksep: RANK_SEP,
    marginx: 60,
    marginy: 60,
    // Pastikan setiap node mendapat cukup ruang
    acyclicer: 'greedy',
    ranker: 'network-simplex',
  });

  // Tambahkan Virtual Node (mewakili satu Spouse Group)
  spouseGroups.forEach(group => {
    dagreGraph.setNode(group.id, { width: group.width, height: group.height });
  });

  // Tambahkan Virtual Edges antar Group (parent → child relationship)
  // Gunakan hanya edge parent-child (bukan marriage edge)
  const groupEdges = new Set();
  edges.forEach(edge => {
    const sourceGroup = nodeToGroup.get(edge.source);
    const targetGroup = nodeToGroup.get(edge.target);
    
    if (sourceGroup && targetGroup && sourceGroup.id !== targetGroup.id) {
      const edgeId = `${sourceGroup.id}->${targetGroup.id}`;
      if (!groupEdges.has(edgeId)) {
        groupEdges.add(edgeId);
        dagreGraph.setEdge(sourceGroup.id, targetGroup.id);
      }
    }
  });

  // --- 3. Layout menggunakan Dagre ---
  dagre.layout(dagreGraph);

  // --- 4. Custom Bottom-Up Subtree Layout (X-Coordinates) ---
  // 4.1 Identifikasi Root & Relasi Tree (Forest)
  const parentToChildren = new Map();
  spouseGroups.forEach(parentGroup => {
    const outEdges = dagreGraph.outEdges(parentGroup.id) || [];
    const childGroupIds = outEdges.map(e => e.w);
    
    if (childGroupIds.length > 0) {
      const childGroups = childGroupIds.map(id => spouseGroups.find(g => g.id === id)).filter(Boolean);
      
      const parentMemberIds = new Set(parentGroup.members.map(m => m.id));
      const groupsWithTargetChild = childGroups.map(cg => {
        const actualChild = cg.members.find(m => 
          parentMemberIds.has(m.data?.ayah_id) || parentMemberIds.has(m.data?.ibu_id)
        );
        return { group: cg, actualChild: actualChild || cg.members[0] };
      });

      const childrenNodes = groupsWithTargetChild.map(g => g.actualChild);
      const firstParentId = parentGroup.members[0].id;
      const sortedChildrenNodes = sortChildrenByOrder(childrenNodes, treeId, firstParentId);

      const sortedGroups = sortedChildrenNodes.map(childNode =>
        groupsWithTargetChild.find(g => g.actualChild.id === childNode.id)?.group
      ).filter(Boolean);

      parentToChildren.set(parentGroup.id, sortedGroups);
    } else {
      parentToChildren.set(parentGroup.id, []);
    }
  });

  const childToMainParent = new Map();
  spouseGroups.forEach(parentGroup => {
    const children = parentToChildren.get(parentGroup.id) || [];
    children.forEach(childGroup => {
      // Assign ke parent pertama yang ditemukan (menghindari double-counting pada cross-marriage)
      if (!childToMainParent.has(childGroup.id)) {
        childToMainParent.set(childGroup.id, parentGroup.id);
      }
    });
  });

  const treeChildren = new Map();
  spouseGroups.forEach(g => {
    const sorted = parentToChildren.get(g.id) || [];
    const filtered = sorted.filter(child => childToMainParent.get(child.id) === g.id);
    treeChildren.set(g.id, filtered);
  });

  // Root groups adalah mereka yang tidak memiliki Main Parent
  const rootGroups = spouseGroups.filter(g => !childToMainParent.has(g.id));
  // Urutkan root berdasarkan X dari Dagre untuk meminimalkan garis menyilang antar pohon
  rootGroups.sort((a, b) => {
    const dNodeA = dagreGraph.node(a.id);
    const dNodeB = dagreGraph.node(b.id);
    return (dNodeA ? dNodeA.x : 0) - (dNodeB ? dNodeB.x : 0);
  });

  // 4.2 Bottom-Up: Hitung Kebutuhan Lebar (Subtree Width)
  const subtreeWidths = new Map();
  function calculateSubtreeWidth(groupId) {
    if (subtreeWidths.has(groupId)) return subtreeWidths.get(groupId);
    
    const group = spouseGroups.find(g => g.id === groupId);
    const children = treeChildren.get(groupId) || [];
    
    if (children.length === 0) {
      subtreeWidths.set(groupId, group.width);
      return group.width;
    }
    
    let childrenTotalWidth = 0;
    children.forEach((child, index) => {
      childrenTotalWidth += calculateSubtreeWidth(child.id);
      if (index > 0) childrenTotalWidth += NODE_SEP;
    });
    
    const width = Math.max(group.width, childrenTotalWidth);
    subtreeWidths.set(groupId, width);
    return width;
  }
  rootGroups.forEach(root => calculateSubtreeWidth(root.id));

  // 4.3 Top-Down: Assign X Coordinates
  function assignXCoordinates(groupId, startX) {
    const sWidth = subtreeWidths.get(groupId) || 0;
    const children = treeChildren.get(groupId) || [];
    
    const centerX = startX + sWidth / 2;
    const dNode = dagreGraph.node(groupId);
    if (dNode) dNode.x = centerX;
    
    let childrenTotalWidth = 0;
    children.forEach((child, index) => {
      childrenTotalWidth += subtreeWidths.get(child.id) || 0;
      if (index > 0) childrenTotalWidth += NODE_SEP;
    });
    
    let childStartX = centerX - (childrenTotalWidth / 2);
    
    children.forEach(child => {
      assignXCoordinates(child.id, childStartX);
      childStartX += (subtreeWidths.get(child.id) || 0) + NODE_SEP;
    });
  }

  let currentRootX = 0;
  rootGroups.forEach(root => {
    assignXCoordinates(root.id, currentRootX);
    currentRootX += (subtreeWidths.get(root.id) || 0) + NODE_SEP;
  });

  // 4.4 Normalisasi margin kiri agar tidak ada koordinat negatif
  const minLeftX = Math.min(
    ...spouseGroups.map(g => {
      const d = dagreGraph.node(g.id);
      return d ? d.x - g.width / 2 : Infinity;
    })
  );
  if (minLeftX < 60 && Number.isFinite(minLeftX)) {
    const shift = 60 - minLeftX;
    spouseGroups.forEach(g => {
      const d = dagreGraph.node(g.id);
      if (d) d.x += shift;
    });
  }

  // --- 5. Unpack Spouse Groups → Koordinat Node Individual ---
  const layoutedNodes = [];
  
  spouseGroups.forEach(group => {
    const dNode = dagreGraph.node(group.id);
    if (!dNode) return;

    const centerX = dNode.x;
    const centerY = dNode.y;
    
    // Hitung titik X mulai dari ujung kiri group
    let startX = centerX - group.width / 2 + NODE_WIDTH / 2;

    group.members.forEach(member => {
      layoutedNodes.push({
        ...member,
        position: {
          x: startX - NODE_WIDTH / 2, // React Flow: X dari sisi kiri node
          y: centerY - NODE_HEIGHT / 2, // React Flow: Y dari sisi atas node
        },
      });
      startX += NODE_WIDTH + group.intraGroupSep;
    });
  });

  // Pertahankan urutan array seperti input awal
  const finalNodes = nodes.map(node => layoutedNodes.find(ln => ln.id === node.id) || node);

  return { nodes: finalNodes, edges };
}
