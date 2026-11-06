import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Item = mongoose.model('Item', itemSchema)
export default Item
