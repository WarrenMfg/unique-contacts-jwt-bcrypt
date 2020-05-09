import mongoose from 'mongoose';
import { Contact } from '../models/contactModel';


// one
export const addNewContact = async (req, res) => {
  try {
    const createdBy = req.user._id;
    const newContact = await Contact.create({ ...req.body, createdBy });
    res.send(newContact);

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({ createdBy: req.user._id, _id: req.params.contactID }).lean().exec();

    if (!contact) {
      res.status(400).json({ message: 'No contact found.' });
    } else {
      res.send(contact);
    }

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


export const updateContact = async (req, res) => {
  try {
    const updatedContact = await Contact.findOneAndUpdate({ createdBy: req.user._id, _id: req.params.contactID}, req.body, { new: true }).lean().exec();

    if (!updatedContact) {
      res.status(400).json({ message: 'No contact found.' });
    } else {
      res.send(updatedContact);
    }

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


export const deleteContact = async (req, res) => {
  try {
    const deletedContact = await Contact.findOneAndRemove({ createdBy: req.user._id, _id: req.params.contactID}).lean().exec();

    if (!deletedContact) {
      res.status(400).json({ message: 'No contact found.' });
    } else {
      res.send(deletedContact);
    }

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};




// many
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ createdBy: req.user._id }).lean().exec();

    res.send(contacts);

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


export const deleteContacts = async (req, res, next) => {
  try {
    const deletedContacts = await Contact.deleteMany({ createdBy: req.user._id }).lean().exec();
    console.log(deletedContacts);
    if (!deletedContacts) {
      res.status(400).json({ message: 'No contacts found.' });
    } else {
      next();
    }

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};