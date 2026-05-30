const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: [
        "Burger",
        "Pizza",
        "Pasta",
        "Sandwich",
        "BBQ",
        "Dessert",
        "Drink",
        "Other",
      ],
    },

    cookTime: {
      type: Number,
      required: [true, "Cook time is required"],
      min: [1, "Cook time must be at least 1 minute"],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Menu", menuSchema);