// const SeedData = require("./seed-data");
// const deepCopy = require("./deep-copy");
// const { sortTodoLists, sortTodos } = require("./sort");
// const nextId = require("./next-id");
// const { Client } = require("pg");
const { dbQuery } = require("./db-query");

module.exports = class PgPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(SeedData);
    session.todoLists = this._todoLists;
  }

  async sortedTodoLists() {
    const ALL_TODOLISTS = "SELECT * FROM todolists ORDER BY lower(title) ASC";
    const FIND_TODOS = "SELECT * FROM todos WHERE todolist_id = $1";  
  
    let result = await dbQuery(ALL_TODOLISTS);
    let todoLists = result.rows;

    for (let index = 0; index < todoLists.length; ++index) {
      let todoList = todoLists[index];
      let todos = await dbQuery(FIND_TODOS, todoList.id);
      todoList.todos = todos.rows;
    }

    return this._partitionTodoLists(todoLists);
  }

  _partitionTodoLists(todoLists) {
    let undone = [];
    let done = [];

    todoLists.forEach(todoList => {
      if (this.isDoneTodoList(todoList)) {
        done.push(todoList);
      } else {
        undone.push(todoList);
      }
    });

    return undone.concat(done);
  }

  // Are all of the todos in the todo list done? If the todo list has at least
  // one todo and all of its todos are marked as done, then the todo list is
  // done. Otherwise, it is undone.
  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }

  //Does the todo list have any undone todos? Returns true if yes, false if no.
  hasUndoneTodos(todoList) {
    return todoList.todos.some(todo => !todo.done);
  }

  // //Returns a copy of the list of todo lists sorted by completion status and (case-sensitive) title
  // sortedTodoLists() {
  //   let todoLists = deepCopy(this._todoLists);
  //   let undone = todoLists.filter(todoList => !this.isDoneTodoList(todoList));
  //   let done = todoLists.filter(todoList => this.isDoneTodoList(todoList));
  //   return sortTodoLists(undone, done);
  // }

  // Returns a promise that resolves to a sorted list of all the todos in the
  // specified todo list. The list is sorted by completion status and title
  // (case-insensitive).
  async sortedTodos(todoList) {
    const SORTED_TODOS = "SELECT * FROM todos" +
                         "  WHERE todolist_id = $1" +
                         "  ORDER BY done ASC, lower(title) ASC";

    let result = await dbQuery(SORTED_TODOS, todoList.id);
    return result.rows;
  };

  // Returns a promise that resolves to the todo list with the specified ID. The
  // todo list contains the todos for that list. The todos are not sorted. The
  // Promise resolves to `undefined` if the todo list is not found.

  async loadTodoList(todoListId) {
    const FIND_TODOLIST = "SELECT * FROM todolists WHERE id = $1";
    const FIND_TODOS = "SELECT * FROM todos WHERE todolist_id = $1"; 
  
    let resultTodoList = dbQuery(FIND_TODOLIST, todoListId);
    let resultTodos = dbQuery(FIND_TODOS, todoListId);
    let resultBoth = await Promise.all([resultTodoList, resultTodos]);

    let todoList = resultBoth[0].rows[0];
    if (!todoList) return undefined;

    todoList.todos = resultBoth[1].rows;
    return todoList;
  }

  // Returns a copy of the indicated todo in the indicated todo list. Returns
  // `undefined` if either the todo list or the todo is not found. Note that
  // both IDs must be numeric.

  async loadTodo(todoListId, todoId) {
    const FIND_TODO = "SELECT * FROM todos WHERE todolist_id = $1 AND id = $2";

    let result = await dbQuery(FIND_TODO, todoListId, todoId);
    return result.rows[0];
  }

  // Toggle a todo between the done and not done state. Returns a promise that
  // resolves to `true` on success, `false` if the todo list or todo doesn't
  // exist. The id arguments must both be numeric.
  async toggleDoneTodo(todoListId, todoId) {
    const TOGGLE_DONE = "UPDATE todos SET done = NOT done" +
                        "  WHERE todolist_id = $1 AND id = $2"; 
    
    let result = await dbQuery(TOGGLE_DONE, todoListId, todoId);
    return result.rowCount > 0;
  }

  // // PRIVATE method: Returns a reference to the todo list with the indicated ID. Returns
  // // `undefined`. if not found. Note that `todoListId` must be numeric.
  // _findTodoList(todoListId) {
  //   return this._todoLists.find(todoList => todoList.id === todoListId);
  // }

  // // PRIVATE method: Returns a reference to the indicated todo in the indicated todo list.
  // // Returns `undefined` if either the todo list or the todo is not found. Note
  // // that both IDs must be numeric.
  // _findTodo(todoListId, todoId) {
  //   let todoList = this._findTodoList(todoListId);
  //   if (!todoList) return undefined;

  //   return todoList.todos.find(todo => todo.id === todoId);
  // }

  // // Create a new todo list with the specified title and add it to the list of
  // // todo lists. Returns `true` on success, `false` on failure. (At this time,
  // // there are no known failure conditions.)
  // createTodoList(title) {
  //   this._todoLists.push({
  //     title, 
  //     id:nextId(),
  //     todos: [],
  //   });

  //   return true;
  // }

  // // Create a new todo with the specified title and add it to the indicated todo
  // // list. Returns `true` on success, `false` on failure.
  // createTodo(todoListId, title) {
  //   let todoList = this._findTodoList(todoListId);
  //   if (!todoList) return false;
    
  //   todoList.todos.push({
  //     title, 
  //     id: nextId(),
  //     done: false,
  //   });

  //   return true;
  // }


  // // Delete a todo list from the list of todo lists. Returns `true` on success,
  // // `false` if the todo list doesn't exist. The ID argument must be numeric.
  // deleteTodoList(todoListId) {
  //   let todoListIndex = this._todoLists.findIndex(todoList => {
  //     return todoList.id === todoListId;
  //   });

  //   if (todoListIndex === -1) return false;

  //   this._todoLists.splice(todoListIndex, 1);
  //   return true; 
  // }

  
  // Delete a todo from the specified todo list. Returns a promise that resolves
  // to `true` on success, `false` on failure.
  async deleteTodo(todoListId, todoId) {
    const DELETE_TODO = "DELETE FROM todos WHERE todolist_id = $1 AND id = $2";

    let result = await dbQuery(DELETE_TODO, todoListId, todoId);
    return result.rowCount > 0;
  }

  // Mark all todos in the specified todo list as done. Returns a promise that
  // resolves to `true` on success, `false` if the todo list doesn't exist. The
  // todo list ID must be numeric.
  async completeAllTodos(todoListId) {
    const COMPLETE_ALL = "UPDATE todos SET done = TRUE" +
                         "  WHERE todolist_id = $1 AND NOT done";

    let result = await dbQuery(COMPLETE_ALL, todoListId);
    return result.rowCount > 0;
  }

  // // Set a new title for the specified todo list. Returns `true` on success,
  // // `false` if the todo list isn't found. The todo list ID must be numeric.
  // setTodoListTitle(todoListId, title) {
  //   let todoList = this._findTodoList(todoListId);
  //   if (!todoList) return false;

  //   todoList.title = title;
  //   return true;
  // }

  // // Returns `true` if a todo list with the specified title exists in the list
  // // of todo lists, `false` otherwise.
  // existsTodoListTitle(title) {
  //   return this._todoLists.some(todoList => todoList.title === title);
  // }

};