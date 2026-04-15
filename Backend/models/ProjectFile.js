const mongoose = require('mongoose');

const projectFileSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['file', 'folder'],
      default: 'file',
    },
    language: {
      type: String,
      enum: ['javascript', 'typescript', 'html', 'css', 'json', 'markdown', 'python', 'java', 'cpp', 'jsx', 'tsx', 'sql', 'xml', 'yaml'],
      default: 'javascript',
    },
    parentPath: {
      type: String,
      default: null,
    },
    isModified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

// Compound index for efficient queries
projectFileSchema.index({ projectId: 1, userId: 1, path: 1 }, { unique: true });

module.exports = mongoose.model('ProjectFile', projectFileSchema);
