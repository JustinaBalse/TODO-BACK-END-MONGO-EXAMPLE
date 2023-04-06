const express = require("express");
const app = express();

// Duomenų bazės valdymui
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Kintamųjų iš .env failo naudojimui
const dotenv = require("dotenv");
dotenv.config();

// Prisijungimas prie DB
mongoose
  .connect(process.env.MONGO_URL)
  .then(console.log("Connected to MongoDB"))
  .catch((err)=> console.log(err));

// Dokumento schema (vieno įrašo schema)
let taskSchema = new Schema(
  {
    task: {
        type: String
    },
    status: {
        type: Boolean
    }
  }
);

// Modelis, čia rašome Task, bet DB susikurs tasks.
const Task = new model("Task", taskSchema);


// middleware - decode JSON data for POST, PUT, PATCH
app.use(express.json());

// GET TASKS
// http://localhost:4000/api/v1/todos
app.get("/api/v1/todos", async (req, res) => {
  try {
    const allTasks = await Task.find();
    res.status(200).json({
      status: "success",
      results: allTasks.length,
      data: {
        tasks: allTasks,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
})

// GET TASK BY ID
// http://localhost:4000/api/v1/todos/id
// id - iš duomenų bazės
app.get("/api/v1/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id });
    console.log(task);

    if (!task) {
      return res.status(404).json({ msg: `No task with id: ${id}` });
    } else {
      res.status(200).json({
        status: "success",
        data: {
          task: task,
        }
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
})

// CREATE TASK
// http://localhost:4000/api/v1/todos
app.post("/api/v1/todos", async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        task: newTask,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
})

// UPDATE TASK
// http://localhost:4000/api/v1/todos/id
// id - iš duomenų bazės
app.patch("/api/v1/todos/:id", async (req, res) => {
  try {
    const upatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.status(200).json({
      status: "success",
      data: {
        task: upatedTask,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
})



// DELETE TASK
// http://localhost:4000/api/v1/todos/id
app.delete("/api/v1/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ msg: `No todo with id: ${id}` });
    } else {
      res.status(200).json({
        status: "success",
        message: `Task with id: ${id} deleted successfully.`,
        task: task,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 

const port = 4000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
