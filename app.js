const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is Running");
    });
    const hasPriorityAndStatusProperties = (requestQuery) => {
      return (
        requestQuery.priority !== undefined && requestQuery.status !== undefined
      );
    };

    const hasPriorityProperty = (requestQuery) => {
      return requestQuery.priority !== undefined;
    };

    const hasStatusProperty = (requestQuery) => {
      return requestQuery.status !== undefined;
    };
    app.get("/todos/", async (request, response) => {
      let data = null;
      let getTodosQuery = "";
      const { search_q = "", priority, status } = request.query;

      switch (true) {
        case hasPriorityAndStatusProperties(request.query):
          getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
          break;

        case hasPriorityProperty(request.query):
          getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
          break;

        case hasStatusProperty(request.query):
          getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
          break;
        default:
          getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
      }

      data = await db.all(getTodosQuery);
      response.send(data);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// API 1

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;

    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;

    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
     *
    FROM
       todo
    WHERE
       id=${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

// API 3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;

  const addTodoQuery = `INSERT INTO 
  todo  (id,todo,priority,status)
  VALUES(${id},'${todo}','${priority}','${status}');`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});
//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  let updateColumn = "";

  switch (true) {
    case todoDetails.status !== undefined:
      updateColumn = "Status";
      break;
    case todoDetails.priority !== undefined:
      updateColumn = "Priority";
      break;
    case todoDetails.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `SELECT *
    FROM todo 
    WHERE id=${todoId};`;
  const {
    todo = previousTodoQuery.todo,
    priority = previousTodoQuery.priority,
    status = previousTodoQuery.status,
  } = todoDetails;

  const UpdateQuery = `UPDATE todo
        SET 
        todo='${todo}',
        priority='${priority}',
        status='${status}'
        WHERE id=${todoId};`;
  await db.run(UpdateQuery);
  response.send(`${updateColumn} Updated`);
});

// API 5
app.delete(`/todos/:todoId/`, async (request, response) => {
  const { todoId } = request.params;
  const DeleteTodoQuery = `
  DELETE FROM todo
    WHERE id=${todoId}`;
  await db.run(DeleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
