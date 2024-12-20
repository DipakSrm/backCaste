import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHanlder.js";

async function generateFamilyTreeData(userId) {
  try {
    // Get the initial user
    const user = await User.findById(userId);
    if (!user) {
      return {
        message: "User not found",
        data: [],
      };
    }

    // Get grandfather
    const grandfatherId = user.grandfatherId;
    if (!grandfatherId) {
      return {
        message: "Grandfather not found",
        data: [],
      };
    }

    // Start building tree from grandfather
    const grandfather = await User.findById(grandfatherId);
    if (!grandfather) {
      return {
        message: "Grandfather details not found",
        data: [],
      };
    }

    // Initialize tree structure
    const familyTree = {
      id: grandfather._id,
      children: [],
    };

    // Find all children of grandfather (fathers)
    const fathers = await User.find({ fatherId: grandfather._id });
    if (!fathers || fathers.length === 0) {
      return {
        message: "No fathers found",
        data: familyTree,
      };
    }

    // For each father, find their children
    for (const father of fathers) {
      const fatherNode = {
        id: father._id,
        children: [],
      };

      // Find children of current father
      const children = await User.find({ fatherId: father._id });

      // Add children to father's node
      for (const child of children) {
        const childNode = {
          id: child._id,
          children: [],
        };

        // Find children of current child (grandchildren)
        const grandChildren = await User.find({ fatherId: child._id });

        // Add grandchildren to child's node if they exist
        if (grandChildren && grandChildren.length > 0) {
          childNode.children = grandChildren.map((grandChild) => ({
            id: grandChild._id,
            children: null,
          }));
        }

        fatherNode.children.push(childNode);
      }

      familyTree.children.push(fatherNode);
    }

    return {
      message: "Family tree generated successfully",
      data: familyTree,
    };
  } catch (error) {
    console.log(error);
    return {
      message: "Error generating family tree",
      data: [],
      error: error.message,
    };
  }
}

const getFamilyTree = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await generateFamilyTreeData(userId);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

export { getFamilyTree };
