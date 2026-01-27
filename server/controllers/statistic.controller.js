import Statistic from "../models/statistic.model.js";

// Get latest statistic
export const getStatistic = async (req, res) => {
  try {
    // Find the latest statistic or create default
    let statistic = await Statistic.findOne().sort({ createdAt: -1 });

    if (!statistic) {
      // Create default statistic if none exists
      statistic = new Statistic({
        clientsServed: 0,
        projectsCompleted: 0,
        ongoingProjects: 0,
        countriesReached: 0,
      });
      await statistic.save();
    }

    res.status(200).json({
      success: true,
      statistic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
};

// Update statistic (always updates the latest one or creates new)
export const updateStatistic = async (req, res) => {
  try {
    // 🔐 Admin check
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const {
      clientsServed,
      projectsCompleted,
      ongoingProjects,
      countriesReached,
    } = req.body;

    // Find the latest statistic
    let statistic = await Statistic.findOne().sort({ createdAt: -1 });

    if (!statistic) {
      // Create new statistic if none exists
      statistic = new Statistic({
        clientsServed: clientsServed || 0,
        projectsCompleted: projectsCompleted || 0,
        ongoingProjects: ongoingProjects || 0,
        countriesReached: countriesReached || 0,
      });
    } else {
      // Update existing statistic
      if (clientsServed !== undefined) statistic.clientsServed = clientsServed;
      if (projectsCompleted !== undefined)
        statistic.projectsCompleted = projectsCompleted;
      if (ongoingProjects !== undefined)
        statistic.ongoingProjects = ongoingProjects;
      if (countriesReached !== undefined)
        statistic.countriesReached = countriesReached;
    }

    await statistic.save();

    res.status(200).json({
      success: true,
      message: "Statistics updated successfully",
      statistic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update statistics",
    });
  }
};
