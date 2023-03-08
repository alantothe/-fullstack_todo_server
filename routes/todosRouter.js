const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../mongo');



router.get('/todos/all', async (req, res) => {
	try {
	  const todos = await db().collection('todos').find({}).toArray();
	  res.json(todos);
	} catch (error) {
	  console.error(error);
	  res.status(500).send('Internal server error');
	}
  });

  router.post('/todos/create-one', async (req, res) => {
	const { title, description, priority } = req.body;

	const todo = {
	  id: uuidv4(),
	  title,
	  description,
	  priority,
	  isComplete: false,
	  creationDate: new Date(),
	  lastModified: new Date(),
	};

	try {
	  const result = await db().collection('todos').insertOne(todo);
	  res.json({
		success: true,
	  });
	} catch (err) {
	  res.json({
		success: false,
		error: err.toString(),
	})
}});


router.put('/todos/update-one/:id', async (req, res) => {
	const { id } = req.params;
	const { isComplete } = req.body;
	const { todo } = req.body;

	try {
	  if (isComplete === undefined) {
		res.status(400).send('isComplete field is not defined in the request body');
		return;
	  }

	  const todo = await db().collection('todos').findOneAndUpdate(
		{ id: id },
		{
		  $set: {
			isComplete: isComplete,
			completedDate: isComplete ? new Date() : null,
			lastModified: new Date(),
		  },
		},
		{ returnOriginal: false }
	  );

	  if (!todo.value) {
		res.status(404).send(`No ToDo found with id ${id}`);
		return;
	  }

	  res.status(200).json(todo.value);
	} catch (error) {
	  console.error(error);
	  res.status(500).send('An error occurred while updating the ToDo');
	}
  });

  router.delete("/todos/delete-one/:id", async (req, res) => {
	try {
	  const { id } = req.params;
	  const result = await db().collection("todos").deleteOne({ id: id });
	  res.json({
		success: true,
	  });
	} catch (err) {
	  console.log(err);
	  res.json({
		success: false,
		error: err.toString(),
	  });
	}
  });



  module.exports = router;