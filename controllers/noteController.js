const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const { json, response } = require('express');

// @desc Get all notes
// @route GET /note
// @access Private
const getAllNotes = asyncHandler( async (req, res) => {
  const notes = await Note.find().lean();
  if (!notes?.length) return res.status(400).json({ message: 'No notes found' });
  res.json(notes);
});

// @desc Create new note
// @route POST /note
// @access Private
const createNote = asyncHandler( async (req, res) => {

  // Extract data from request
  const { user, title, text } = req.body;
  if (!user || !title || !text) return res.status(400).json({ message: 'All fields are required' });
  
  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate) return res.status(400).json({ message: 'Duplicate title' });

  // Create note object
  const noteObject = { user, title, text };

  // Create and store note in database
  const note = await Note.create(noteObject);

  // Send appropriate response
  if (note) {
    res.status(201).json({ message: `New note (${title}) created` });
  } else {
    res.status(400).json({ message: 'Invalid note data received' });
  }
});

// @desc Update a note
// @route PATCH /note
// @access Private
const updateNote = asyncHandler( async (req, res) => {

  // Extract request data
  const { id, user, title, text, completed } = req.body;
  if (!id || !user || !title || !text || typeof completed !== 'boolean') return res.status(400).json({ message: 'All fields are required' });

  // Check that note exists
  const note = await Note.findById(id).exec();
  if (!note) return res.status(400).json({ message: 'Note not found' });

  // Check for duplicate note title
  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate) return res.status(400).json({ message: 'Duplicate title' });

  note.title = title;
  note.text = text;
  note.completed = completed;

  const updateNote = await note.save();

  res.json({ message: `${updateNote.title} updated` });
});

// @desc Delete a note
// @route DELETE /note
// @access Private
const deleteNote = asyncHandler( async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'Note ID required' });

  const note = await Note.findById(id).exec();

  const result = await Note.deleteOne();

  const reply = `Note ${result.title} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote
}