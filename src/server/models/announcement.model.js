const mongoose = require("mongoose");

const announcementItemSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
        },
        link: {
            type: String,
            default: "",
            trim: true,
        },
    },
    { _id: true }
);

const announcementSchema = new mongoose.Schema(
    {
        items: {
            type: [announcementItemSchema],
            default: [],
        },
        // Backward-compatibility fields
        message: {
            type: String,
            trim: true,
        },
        link: {
            type: String,
            default: "",
            trim: true,
        },
        backgroundColor: {
            type: String,
            default: "#0f0f11",
        },
        textColor: {
            type: String,
            default: "#f4f4f5",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        autoplaySpeed: {
            type: Number,
            default: 4000,
        },
    },
    { timestamps: true }
);

const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;