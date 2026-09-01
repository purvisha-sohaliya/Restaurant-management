const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },

    table_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true
    },

    waiting_entry_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WaitingEntry",
    },

    customer_name: {
      type: String,
      default: ""
    },

    token_number: {
      type: String,
      required: true
    },

    waiter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },

    order_number: {
      type: String,
      required: true,
      unique: true
    },

    order_type: {
      type: String,
      enum: ["Dine In", "Takeaway", "Delivery"],
      default: "Dine In"
    },

    items: [
      {
        menu_item_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem"
        },
        item_name: String,
        price: Number,
        quantity: Number,
        total: Number,

        is_sent_to_kitchen: {
          type: Boolean,
          default: false
        },

        kitchen_status: {
          type: String,
          enum: ["Pending", "Preparing", "Ready", "Served"],
          default: "Pending"
        }
      }
    ],

    total_amount: {
      type: Number,
      default: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    grand_total: {
      type: Number,
      default: 0
    },

    payment_status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },

    order_status: {
      type: String,
      enum: [
        "Pending",
        "Preparing",
        "Ready",
        "Served",
        "Completed",
        "Cancelled"
      ],
      default: "Pending"
    },

    notes: {
      type: String
    },

    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Order", orderSchema);