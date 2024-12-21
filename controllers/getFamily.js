import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHanlder.js";

async function generateFamilyTreeData(userId) {
  try {
    // Helper function to format node data for react-d3-tree
    const formatNodeData = (user) => ({
      name: user.name,
      attributes: {
        DOB: user.DOB,
        address: user.address,
        casteNo: user.caste_no,
      },
      avatar: user.avatar, // Will be used for custom node rendering
    });

    const user = await User.findById(userId);
    if (!user) {
      return {
        message: "User not found",
        data: null,
      };
    }

    const grandfatherId = user.grandfatherId;
    if (!grandfatherId) {
      return {
        message: "Grandfather not found",
        data: null,
      };
    }

    const grandfather = await User.findById(grandfatherId);
    if (!grandfather) {
      return {
        message: "Grandfather details not found",
        data: null,
      };
    }

    // Initialize tree structure compatible with react-d3-tree
    const familyTree = {
      ...formatNodeData(grandfather),
      children: [],
    };

    const fathers = await User.find({ fatherId: grandfather._id });
    if (!fathers || fathers.length === 0) {
      return {
        message: "No fathers found",
        data: familyTree,
      };
    }

    // Build the tree structure
    for (const father of fathers) {
      const fatherNode = {
        ...formatNodeData(father),
        children: [],
      };

      const children = await User.find({ fatherId: father._id });

      for (const child of children) {
        const childNode = {
          ...formatNodeData(child),
          children: [],
        };

        const grandChildren = await User.find({ fatherId: child._id });

        if (grandChildren && grandChildren.length > 0) {
          childNode.children = grandChildren.map((grandChild) => ({
            ...formatNodeData(grandChild),
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
      data: null,
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
