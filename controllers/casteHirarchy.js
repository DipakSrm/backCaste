import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHanlder.js";

async function generateCasteHierarchyTree() {
  try {
    // Fetch users sorted by caste_no
    const users = await User.find({}).sort({ caste_no: 1 });
    if (!users.length) {
      return { message: "No users found", data: null };
    }

    const rootNode = {
      name: "Bhattarai",
      children: [],
    };

    // Helper function to create user node
    const createUserNode = (user) => ({
      _id: user._id,
      fatherId: user.fatherId,
      grandfatherId: user.grandfatherId,
      identity_no: user.identity_no,
      caste_no: user.caste_no,
      name: user.name,
      children: [],
      avatar:
        user.avatar ||
        "https://res.cloudinary.com/dgzf4h7hn/image/upload/v1734938977/images_o8usbu.jpg",
      attributes: {
        DOB: user.DOB,
        address: user.address,
        casteNo: user.caste_no,
      },
    });

    // Helper function to create dummy node
    const createDummyNode = (casteNo) => ({
      _id: `dummy-${Date.now()}-${Math.random()}`,
      name: "NO Data",
      fatherId: null,
      grandfatherId: null,
      avatar:
        "https://res.cloudinary.com/dgzf4h7hn/image/upload/v1734938977/images_o8usbu.jpg",
      caste_no: casteNo,
      children: [],
      attributes: {
        DOB: "no data",
        address: "no data",
        casteNo: casteNo,
      },
    });

    // Get all unique caste numbers and fill gaps
    const casteNumbers = [...new Set(users.map((u) => u.caste_no))].sort(
      (a, b) => a - b
    );
    const minCaste = casteNumbers[0];
    const maxCaste = casteNumbers[casteNumbers.length - 1];

    // Create a map to store nodes at each level
    const levelMap = new Map();

    // Initialize first level
    const firstLevelUsers = users
      .filter((u) => u.caste_no === minCaste)
      .map(createUserNode);
    rootNode.children = firstLevelUsers;
    levelMap.set(minCaste, firstLevelUsers);

    // Process each subsequent level
    for (let casteNo = minCaste + 1; casteNo <= maxCaste; casteNo++) {
      const currentUsers = users
        .filter((u) => u.caste_no === casteNo)
        .map(createUserNode);

      if (!currentUsers.length) continue;

      levelMap.set(casteNo, currentUsers);

      // Process each user at current level
      currentUsers.forEach((currentUser) => {
        // Try to find parent in previous level
        const previousLevel = casteNo - 1;
        const previousLevelNodes = levelMap.get(previousLevel) || [];
        const parent = previousLevelNodes.find(
          (node) => node._id.toString() === currentUser.fatherId?.toString()
        );

        if (parent) {
          // Add to actual parent
          parent.children.push(currentUser);
        } else {
          // Create chain of dummy nodes if needed
          let lastDummy = null;
          let currentLevel = previousLevel;

          // Create dummy nodes for each missing level
          while (currentLevel >= minCaste) {
            const dummyNode = createDummyNode(currentLevel);

            if (lastDummy) {
              dummyNode.children.push(lastDummy);
            } else {
              dummyNode.children.push(currentUser);
            }

            lastDummy = dummyNode;

            // Try to find a node at this level to attach to
            const levelNodes = levelMap.get(currentLevel);
            if (levelNodes && levelNodes.length > 0) {
              // Found a level to attach to
              const attachTo = levelNodes[0];
              const parentNode = findParentNode(rootNode, attachTo._id);
              if (parentNode) {
                parentNode.children.push(lastDummy);
                break;
              }
            }

            currentLevel--;
          }

          // If we reached the root level, attach directly to root
          if (currentLevel < minCaste && lastDummy) {
            rootNode.children.push(lastDummy);
          }
        }
      });
    }

    return {
      message: "Caste hierarchy tree generated successfully",
      data: rootNode,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Error generating caste hierarchy tree",
      data: null,
      error: error.message,
    };
  }
}

// Helper function to find parent node in tree
function findParentNode(node, childId) {
  if (
    node.children?.some(
      (child) => child._id?.toString() === childId?.toString()
    )
  ) {
    return node;
  }

  for (const child of node.children || []) {
    const found = findParentNode(child, childId);
    if (found) return found;
  }

  return null;
}

const getCasteHierarchyTree = asyncHandler(async (req, res) => {
  const response = await generateCasteHierarchyTree();
  res.json(response);
});

export { getCasteHierarchyTree };
