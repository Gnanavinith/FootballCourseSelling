import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required.'], trim: true },
    slug: { type: String, required: [true, 'URL name is required.'], unique: true, trim: true, lowercase: true },
    shortDesc: { type: String, default: '' },
    fullDesc: { type: String, default: '' },
    price: { type: Number, required: [true, 'Price is required.'], min: [0, 'Price must be 0 or more.'] },
    originalPrice: { type: Number, default: 0, min: [0, 'Original price must be 0 or more.'] },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    totalWeeks: { type: Number, default: 8, min: [1, 'A course needs at least 1 week.'] },
    thumbnail: { type: String, default: '' },
    thumbnailPublicId: { type: String, default: '' }, // needed to replace or delete the image on Cloudinary
    thumbAlt: { type: String, default: '' },
    previewVideoId: { type: String, default: '' },
    /* Syllabus and supplementary documents uploaded by the admin while creating/editing a course.
       These are exposed to enrolled students on the student dashboard and course pages. */
    syllabusUrl: { type: String, default: '' },
    syllabus: { type: String, default: '' }, // Admin pasted text / curriculum breakdown
    documents: [{ label: { type: String, default: '' }, url: { type: String, default: '' } }],
    status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Draft' },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      image: { type: String, default: '' },
    },
  },
  { timestamps: true }
)

export const Course = mongoose.model('Course', courseSchema)
export default Course