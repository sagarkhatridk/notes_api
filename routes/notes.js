const express = require("express");
const fetchuser = require("../middleware/fetchUser");
const router = express.Router();
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// ROUTE 1 : fetch all notes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    // console.log(notes);
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).send({ error: "Something wend wrong!" });
  }
});

//  ROUTE 2 : POST: add ontes
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "title must be grater then 3").isLength({ min: 3 }),
    body("description", "title must be grater then 5").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const Errors = validationResult(req);
      if (!Errors.isEmpty()) {
        return res.status(400).json({
          errors: Errors.array(),
        });
      }
      const { title, description, tag } = req.body;

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const saveNote = await note.save();
      // console.log(saveNote);
      res.status(200).json(saveNote);
    } catch (error) {
      res.status(500).send({ error: "Something wend wrong!" });
    }
  }
);

//  ROUTE 3 : POST: update note "api/auth/updatenote/:id"
router.put(
  "/updatenote/:id",
  fetchuser,
  [
    body("title", "title must be grater then 3").isLength({ min: 3 }),
    body("description", "title must be grater then 5").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const { title, description, tag } = req.body;

    const newNote = {};

    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(400).send("Not Authorised");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    return res.json({ newNote });
  }
);

// ROUTE 4, delete note : delete "api/auth/deletenote/:id"
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  let note = await Notes.findById(req.params.id);
  if (!note) {
    return res.status(404).send("Not found");
  }

  if (note.user.toString() !== req.user.id) {
    return res.status(400).send("Not Authorised");
  }
  // console.log(note.user.toString());

  note = await Notes.findByIdAndDelete(req.params.id);
  return res.json({ Success: "Note has been deleted" });
});

module.exports = router;
