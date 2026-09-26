const Announcement = require("../../models/announcement.model");

// Create or Update Announcement (Single Document Logic)
const saveAnnouncement = async (req, res) => {
  try {
    const { items, message, backgroundColor, textColor, link, isActive, autoplaySpeed } = req.body;

    let parsedItems = [];
    if (Array.isArray(items)) {
      parsedItems = items
        .filter((item) => item && typeof item.text === "string" && item.text.trim().length > 0)
        .map((item) => ({
          text: item.text.trim(),
          link: typeof item.link === "string" ? item.link.trim() : "",
        }));
    } else if (typeof message === "string" && message.trim().length > 0) {
      parsedItems = [
        {
          text: message.trim(),
          link: typeof link === "string" ? link.trim() : "",
        },
      ];
    }

    if (parsedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one announcement item with text is required.",
      });
    }

    let announcement = await Announcement.findOne();

    const updateData = {
      items: parsedItems,
      message: parsedItems[0].text,
      link: parsedItems[0].link || "",
      backgroundColor: backgroundColor || "#0f0f11",
      textColor: textColor || "#f4f4f5",
      isActive: typeof isActive === "boolean" ? isActive : true,
      autoplaySpeed: Number(autoplaySpeed) || 4000,
    };

    if (announcement) {
      announcement.items = updateData.items;
      announcement.message = updateData.message;
      announcement.link = updateData.link;
      announcement.backgroundColor = updateData.backgroundColor;
      announcement.textColor = updateData.textColor;
      announcement.isActive = updateData.isActive;
      announcement.autoplaySpeed = updateData.autoplaySpeed;

      await announcement.save();
    } else {
      announcement = await Announcement.create(updateData);
    }

    res.status(200).json({
      success: true,
      message: "Announcement settings saved successfully",
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Announcement
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
  saveAnnouncement,
  getAnnouncement,
};