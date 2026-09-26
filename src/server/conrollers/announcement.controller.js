const Announcement = require("../models/announcement.model");

// Get Announcement for storefront
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne();

    if (!announcement) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const announcementObj = announcement.toObject ? announcement.toObject() : { ...announcement };

    // Normalize items: ensure items array exists even if it's a legacy record with a single message
    if (!announcementObj.items || announcementObj.items.length === 0) {
      if (announcementObj.message && announcementObj.message.trim()) {
        announcementObj.items = [
          {
            text: announcementObj.message.trim(),
            link: announcementObj.link || "",
          },
        ];
      } else {
        announcementObj.items = [];
      }
    }

    res.status(200).json({
      success: true,
      data: announcementObj,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAnnouncement,
};