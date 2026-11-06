import mongoose from 'mongoose'
import { Course } from './course.model.js'
import { Enrollment } from '../enrollments/enrollment.model.js'
import { AppError } from '../../utils/AppError.js'
import { uploadImageBuffer, uploadDocumentBuffer, deleteImage, optimiseUrl } from '../../config/cloudinary.js'

/* Only these fields can be changed from the request body (stops mass assignment) */
const FIELDS = ['title', 'slug', 'shortDesc', 'fullDesc', 'price', 'originalPrice', 'level', 'totalWeeks', 'thumbAlt', 'previewVideoId', 'status', 'syllabusUrl', 'syllabus', 'documents']

const slugify = (s = '') =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

async function makeUniqueSlug(baseSlug, currentId = null) {
  let base = slugify(baseSlug) || 'course'
  let slug = base
  let count = 1
  while (await Course.exists({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })) {
    count++
    slug = `${base}-${count}`
  }
  return slug
}

function pickCourse(body = {}) {
  const out = {}
  for (const k of FIELDS) if (body[k] !== undefined) out[k] = body[k]
  if (out.slug !== undefined) out.slug = slugify(out.slug)
  // Dotted paths update one nested field without wiping seo.image
  if (body.seo) {
    if (body.seo.title !== undefined) out['seo.title'] = body.seo.title
    if (body.seo.description !== undefined) out['seo.description'] = body.seo.description
  }
  return out
}

function assertPublishable(course) {
  if (course.status === 'Published' && !String(course.thumbAlt || '').trim()) {
    throw new AppError('Add image alt text before publishing.', 400)
  }
}

function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid course id.', 400)
}

async function findOrFail(id) {
  assertValidId(id)
  const course = await Course.findById(id)
  if (!course) throw new AppError('Course not found', 404)
  return course
}

/* A duplicated course shares the same Cloudinary image, so only delete it when nothing else uses it */
async function removeImageIfUnused(publicId, exceptId) {
  if (!publicId) return
  const stillUsed = await Course.exists({ thumbnailPublicId: publicId, _id: { $ne: exceptId } })
  if (!stillUsed) await deleteImage(publicId)
}

export const courseService = {
  /* Public website: published courses only */
  listPublic() {
    return Course.find({ status: 'Published' }).select('-thumbnailPublicId').sort({ createdAt: -1 })
  },

  async getBySlug(slug) {
    const course = await Course.findOne({ slug, status: 'Published' }).select('-thumbnailPublicId')
    if (!course) throw new AppError('Course not found', 404)
    return course
  },

  /* Admin panel: every course, with how many students each has */
  async listAdmin() {
    const courses = await Course.find().sort({ createdAt: -1 }).lean()
    const counts = await Enrollment.aggregate([{ $group: { _id: '$courseId', n: { $sum: 1 } } }])
    const byCourse = new Map(counts.map((c) => [String(c._id), c.n]))
    return courses.map((c) => ({ ...c, studentCount: byCourse.get(String(c._id)) || 0 }))
  },

  getById: findOrFail,

  async create(data) {
    const course = new Course()
    const picked = pickCourse(data)
    if (!picked.slug && picked.title) {
      picked.slug = slugify(picked.title)
    }
    if (picked.slug) {
      picked.slug = await makeUniqueSlug(picked.slug)
    }
    course.set(picked)
    assertPublishable(course)
    return course.save()
  },

  async update(id, data) {
    assertValidId(id)
    const course = await findOrFail(id)
    const picked = pickCourse(data)
    if (picked.slug && picked.slug !== course.slug) {
      picked.slug = await makeUniqueSlug(picked.slug, id)
    }
    course.set(picked)
    assertPublishable(course)
    return course.save()
  },

  async setStatus(id, status) {
    if (!['Draft', 'Published', 'Archived'].includes(status)) throw new AppError('Invalid status.', 400)
    const course = await findOrFail(id)
    course.status = status
    assertPublishable(course)
    return course.save()
  },

  /* Students bought it: archive. No students: delete for good (and its image). */
  async remove(id) {
    assertValidId(id)
    const course = await findOrFail(id)
    const students = await Enrollment.countDocuments({ courseId: id })
    if (students > 0) {
      course.status = 'Archived'
      await course.save()
      return { archived: true, students }
    }
    await course.deleteOne()
    await removeImageIfUnused(course.thumbnailPublicId, course._id)
    return { deleted: true }
  },

  async duplicate(id) {
    assertValidId(id)
    const original = (await findOrFail(id)).toObject()
    // eslint-disable-next-line no-unused-vars
    const { _id, __v, createdAt, updatedAt, ...rest } = original
    return Course.create({
      ...rest,
      title: `${rest.title} (copy)`,
      slug: `${rest.slug}-copy-${Date.now().toString(36)}`,
      status: 'Draft',
    })
  },

  /* Upload to Cloudinary, save the URL, then remove the old image */
  async uploadThumbnail(id, file) {
    assertValidId(id)
    if (!file) throw new AppError('Choose an image to upload.', 400)
    const course = await findOrFail(id)
    const oldPublicId = course.thumbnailPublicId
    const result = await uploadImageBuffer(file.buffer)
    course.thumbnail = optimiseUrl(result.secure_url)
    course.thumbnailPublicId = result.public_id
    await course.save()
    if (oldPublicId && oldPublicId !== result.public_id) await removeImageIfUnused(oldPublicId, course._id)
    return course
  },

  /* Upload PDF/Word documents to Cloudinary and append to the course's documents array */
  async uploadDocuments(id, files) {
    assertValidId(id)
    const course = await findOrFail(id)
    if (!files || files.length === 0) throw new AppError('No documents to upload.', 400)
    const uploaded = []
    for (const file of files) {
      const result = await uploadDocumentBuffer(file.buffer)
      uploaded.push({ label: file.originalname, url: optimiseUrl(result.secure_url) })
    }
    course.documents.push(...uploaded)
    await course.save()
    return course
  },

  /* Upload official syllabus PDF to Cloudinary and set course.syllabusUrl */
  async uploadSyllabus(id, file) {
    assertValidId(id)
    if (!file) throw new AppError('Choose a syllabus file to upload.', 400)
    const course = await findOrFail(id)
    const result = await uploadDocumentBuffer(file.buffer)
    course.syllabusUrl = optimiseUrl(result.secure_url)
    await course.save()
    return course
  },

  /* Fetch course for serving syllabus PDF directly */
  async getSyllabusFile(idOrSlug) {
    let course
    if (mongoose.isValidObjectId(idOrSlug)) {
      course = await Course.findById(idOrSlug)
    } else {
      course = await Course.findOne({ slug: idOrSlug })
    }
    if (!course) throw new AppError('Course not found', 404)
    if (!course.syllabusUrl) throw new AppError('No syllabus PDF uploaded for this course', 404)
    return course
  },
}