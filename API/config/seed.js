// run:  node config/seed.js

require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const DB_NAME = process.env.DB_NAME || "Eduverse";

//  FREE COURSES DATA
const FREE_COURSES = [
  //1. JavaScript
  {
    meta: {
      title: "JavaScript for Beginners",
      description:
        "Learn JavaScript from scratch — variables, functions, DOM, and more. Completely free.",
      category: "Computer",
    },
    chapters: [
      {
        title: "Getting Started",
        lessons: [
          {
            title: "What is JavaScript?",
            content: `JavaScript is a lightweight, interpreted programming language with first-class functions.
It is most well-known as the scripting language for Web pages, but also used in server environments like Node.js.

JavaScript is prototype-based, multi-paradigm, single-threaded, and dynamic — supporting object-oriented, imperative, and declarative programming styles.

**Why learn JavaScript?**
- It runs in every browser with no installation needed
- It powers both frontend (React, Vue) and backend (Node.js)
- It is the most popular language on GitHub for years running
- Huge ecosystem with millions of packages on npm`,
            code_example: `// Your first JavaScript program
console.log("Hello, World!");

// Variables
let name  = "Alice";
const age = 25;
var city  = "Delhi"; // older style, prefer let/const

console.log(name + " is " + age + " years old");`,
            code_lang: "javascript",
          },
          {
            title: "Variables and Data Types",
            content: `JavaScript has several built-in data types:

**Primitive Types:**
- \`string\` — text like "hello"
- \`number\` — integers and decimals: 42, 3.14
- \`boolean\` — true or false
- \`null\` — intentional absence of value
- \`undefined\` — variable declared but not assigned

**Reference Types:**
- \`object\` — key-value pairs
- \`array\` — ordered list
- \`function\` — callable block of code

Use \`typeof\` to check the type of any value.`,
            code_example: `let message = "Hello";        // string
let count   = 10;              // number
let isReady = true;            // boolean
let nothing = null;            // null
let unknown;                   // undefined

console.log(typeof message);   // "string"
console.log(typeof count);     // "number"

// Objects
let user = { name: "Bob", age: 30 };
console.log(user.name);        // "Bob"

// Arrays
let colors = ["red", "green", "blue"];
console.log(colors[0]);        // "red"`,
            code_lang: "javascript",
          },
        ],
        quiz: {
          question:
            "Which keyword declares a variable that cannot be reassigned?",
          option_a: "var",
          option_b: "let",
          option_c: "const",
          option_d: "static",
          correct: "c",
          explanation:
            "const declares a block-scoped variable that cannot be reassigned after declaration.",
        },
      },
      {
        title: "Functions",
        lessons: [
          {
            title: "Defining Functions",
            content: `Functions are reusable blocks of code. JavaScript has three main ways to define them:

**Function Declaration** — hoisted, can be called before definition
**Function Expression** — assigned to a variable
**Arrow Function** — concise syntax, no own \`this\`

Functions accept **parameters** and **return** a value.
If no return statement is used, the function returns \`undefined\`.`,
            code_example: `// Function declaration
function greet(name) {
  return "Hello, " + name + "!";
}

// Function expression
const add = function(a, b) { return a + b; };

// Arrow function
const multiply = (a, b) => a * b;

console.log(greet("Alice"));   // Hello, Alice!
console.log(add(3, 4));        // 7
console.log(multiply(5, 6));   // 30`,
            code_lang: "javascript",
          },
          {
            title: "Scope and Closures",
            content: `**Scope** determines where a variable is accessible.

- **Global scope** — accessible everywhere
- **Function scope** — only inside the function
- **Block scope** — only inside \`{}\` with \`let\`/\`const\`

**Closure** — a function that retains access to variables from its outer scope even after that outer function has returned. This is one of JavaScript's most powerful features.`,
            code_example: `// Scope example
let globalVar = "I am global";

function outer() {
  let outerVar = "I am outer";
  function inner() {
    console.log(globalVar);  // accessible
    console.log(outerVar);   // accessible via closure
  }
  inner();
}

// Practical closure: counter
function makeCounter() {
  let count = 0;
  return function() { return ++count; };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3`,
            code_lang: "javascript",
          },
        ],
        quiz: {
          question: "What is a closure in JavaScript?",
          option_a: "A way to close the browser window",
          option_b:
            "A function that retains access to its outer scope variables",
          option_c: "A method to end a loop early",
          option_d: "A type of error handling",
          correct: "b",
          explanation:
            "A closure is a function that remembers variables from its lexical scope even when executed outside that scope.",
        },
      },
      {
        title: "DOM Manipulation",
        lessons: [
          {
            title: "Selecting and Modifying Elements",
            content: `The **Document Object Model (DOM)** represents a web page as a tree of objects that JavaScript can read and modify in real time.

**Key selector methods:**
- \`getElementById('id')\` — fastest, by unique id
- \`querySelector('selector')\` — first CSS match
- \`querySelectorAll('selector')\` — all CSS matches (NodeList)

Once you have an element, you can change its text, HTML, styles, attributes, or attach event listeners.`,
            code_example: `// Select elements
const title = document.getElementById('title');
const para  = document.querySelector('.intro');

// Modify content & styles
title.textContent = "Updated by JavaScript!";
title.style.color  = "purple";
title.style.fontSize = "32px";

// Create and add a new element
const div = document.createElement('div');
div.textContent = "I was created dynamically!";
document.body.appendChild(div);

// Event listener
title.addEventListener('click', () => {
  alert('Title was clicked!');
});`,
            code_lang: "javascript",
          },
        ],
        quiz: {
          question:
            "Which method returns the FIRST element matching a CSS selector?",
          option_a: "getElementById()",
          option_b: "querySelectorAll()",
          option_c: "querySelector()",
          option_d: "getElement()",
          correct: "c",
          explanation:
            "querySelector() returns the first Element that matches the specified CSS selector.",
        },
      },
    ],
  },

  //2. React.js
  {
    meta: {
      title: "React.js for Beginners",
      description:
        "Learn React from the ground up — components, hooks, state, props, and building real UIs.",
      category: "Computer",
    },
    chapters: [
      {
        title: "React Fundamentals",
        lessons: [
          {
            title: "What is React?",
            content: `React is a **JavaScript library** for building user interfaces, developed by Meta (Facebook).

**Core ideas:**
- **Component-based** — UIs are built from small, reusable pieces called components
- **Declarative** — describe what the UI should look like; React handles updates
- **Virtual DOM** — React keeps an in-memory copy of the DOM and only updates what changed
- **One-way data flow** — data moves from parent to child via props

React powers Facebook, Instagram, Airbnb, Netflix, and thousands of other apps.`,
            code_example: `// A minimal React component
import React from 'react';

function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Using the component
function App() {
  return (
    <div>
      <Welcome name="Alice" />
      <Welcome name="Bob"   />
    </div>
  );
}

export default App;`,
            code_lang: "jsx",
          },
          {
            title: "JSX — JavaScript + HTML",
            content: `**JSX** (JavaScript XML) is a syntax extension that lets you write HTML-like code directly in JavaScript.

**Key JSX rules:**
- Use \`className\` instead of \`class\`
- All tags must be closed: \`<br />\`, \`<img />\`
- Return a single root element (use \`<></>\` fragments)
- JavaScript expressions go inside \`{ }\`
- Event handlers use camelCase: \`onClick\`, \`onChange\`

Babel compiles JSX to \`React.createElement()\` calls.`,
            code_example: `function UserCard({ name, age, isOnline }) {
  return (
    <div className="user-card">
      <h2>{name}</h2>
      <p>Age: {age}</p>

      {/* Conditional rendering */}
      {isOnline
        ? <span style={{ color: 'green' }}>● Online</span>
        : <span style={{ color: 'gray'  }}>○ Offline</span>
      }

      {/* List rendering */}
      <ul>
        {['HTML', 'CSS', 'JS'].map(skill => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </div>
  );
}`,
            code_lang: "jsx",
          },
        ],
        quiz: {
          question: "What does JSX stand for?",
          option_a: "Java Syntax Extension",
          option_b: "JavaScript XML",
          option_c: "JSON eXchange",
          option_d: "JavaScript Extra",
          correct: "b",
          explanation:
            "JSX stands for JavaScript XML. It allows writing HTML-like syntax inside JavaScript files, compiled by Babel.",
        },
      },
      {
        title: "State & Hooks",
        lessons: [
          {
            title: "useState Hook",
            content: `**State** is data that changes over time and causes the component to re-render.

\`useState\` lets you add state to functional components.

**Syntax:** \`const [value, setValue] = useState(initialValue)\`

- \`value\` — the current state
- \`setValue\` — function to update it (triggers re-render)
- Never mutate state directly — always use the setter

**Rules of Hooks:**
- Only call hooks at the top level (not in loops/conditions)
- Only call hooks inside React function components`,
            code_example: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+ Increment</button>
      <button onClick={() => setCount(count - 1)}>- Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// Form with controlled inputs
function LoginForm() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  return (
    <form onSubmit={e => { e.preventDefault(); console.log(email); }}>
      <input value={email}    onChange={e => setEmail(e.target.value)}    placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
      <button type="submit">Login</button>
    </form>
  );
}`,
            code_lang: "jsx",
          },
          {
            title: "useEffect Hook",
            content: `\`useEffect\` runs side effects — fetching data, subscriptions, timers, or DOM updates — after render.

**Syntax:** \`useEffect(callback, [dependencies])\`

- **No deps array** — runs after every render
- **Empty \`[]\`** — runs once on mount
- **\`[value]\`** — runs when \`value\` changes
- **Return cleanup function** — runs before next effect / on unmount`,
            code_example: `import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(\`https://jsonplaceholder.typicode.com/users/\${userId}\`)
      .then(res  => res.json())
      .then(data => { setUser(data); setLoading(false); });

    // Cleanup runs when userId changes or component unmounts
    return () => console.log('Cleanup:', userId);

  }, [userId]); // re-run when userId changes

  if (loading) return <p>Loading...</p>;
  return <h2>Hello, {user?.name}</h2>;
}`,
            code_lang: "jsx",
          },
        ],
        quiz: {
          question: "How do you correctly update state in React?",
          option_a: "state.value = newValue",
          option_b: "this.state = newValue",
          option_c: "Using the setter function: setValue(newValue)",
          option_d: "updateState(newValue)",
          correct: "c",
          explanation:
            "State must always be updated using the setter from useState. Direct mutation does not trigger re-renders.",
        },
      },
      {
        title: "Props & Component Patterns",
        lessons: [
          {
            title: "Props and Component Communication",
            content: `**Props** (properties) pass data from parent to child components. They are read-only.

**Key rules:**
- Props flow one way — parent → child
- You can pass strings, numbers, arrays, objects, and functions
- Children content is passed via the special \`children\` prop
- To send data back up, pass a callback function as a prop

Think of props like function parameters — the parent calls the child with arguments.`,
            code_example: `// Child component
function ProductCard({ name, price, onAddToCart, children }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>\${price}</p>
      {children}
      <button onClick={() => onAddToCart(name)}>Add to Cart</button>
    </div>
  );
}

// Parent component
function Shop() {
  const handleAdd = (productName) => {
    alert(productName + ' added!');
  };

  return (
    <div>
      <ProductCard name="React Course" price={49} onAddToCart={handleAdd}>
        <span> Bestseller</span>
      </ProductCard>
      <ProductCard name="JS Book" price={29} onAddToCart={handleAdd} />
    </div>
  );
}`,
            code_lang: "jsx",
          },
        ],
        quiz: {
          question: "Can a child component directly modify props it receives?",
          option_a: "Yes, using setState()",
          option_b: "Yes, by reassigning the prop variable",
          option_c: "No — props are read-only",
          option_d: "Only if the prop is an object",
          correct: "c",
          explanation:
            "Props are read-only. To communicate back to a parent, pass a callback function as a prop instead.",
        },
      },
    ],
  },

  //3. Node.js
  {
    meta: {
      title: "Node.js Essentials",
      description:
        "Master server-side JavaScript — modules, Express, REST APIs, async patterns, and file system.",
      category: "Computer",
    },
    chapters: [
      {
        title: "Node.js Basics",
        lessons: [
          {
            title: "What is Node.js?",
            content: `**Node.js** is a JavaScript runtime built on Chrome's V8 engine, allowing JavaScript to run on a server outside the browser.

**Key features:**
- **Non-blocking I/O** — handles many operations concurrently
- **Event-driven** — uses an event loop for async operations
- **Single-threaded** — one thread handles requests, delegates I/O to the OS
- **npm** — world's largest package registry (2M+ packages)
- **Cross-platform** — Windows, Mac, Linux

Used for: REST APIs, real-time apps (chat, games), CLI tools, microservices.`,
            code_example: `// hello.js — run with: node hello.js
console.log("Hello from Node.js!");
console.log("Node version:", process.version);
console.log("Platform:    ", process.platform);

// Built-in modules
const os   = require('os');
const path = require('path');

console.log("CPU cores:", os.cpus().length);
console.log("Home dir: ", os.homedir());
console.log("Resolved: ", path.join(__dirname, 'data', 'file.txt'));`,
            code_lang: "javascript",
          },
          {
            title: "Modules and npm",
            content: `Node.js uses a **module system** to split code into separate files.

**CommonJS (default):** \`require()\` / \`module.exports\`
**ES Modules:** \`import\` / \`export\` — use with \`"type":"module"\` in package.json

**npm commands:**
- \`npm init -y\` — create package.json
- \`npm install express\` — install a package
- \`npm install -D nodemon\` — dev dependency
- \`npm run dev\` — run a script from package.json`,
            code_example: `// math.js — export functions
function add(a, b)      { return a + b; }
function subtract(a, b) { return a - b; }

module.exports = { add, subtract };

// ─────────────────────────
// app.js — import and use
const { add, subtract } = require('./math');

console.log(add(5, 3));       // 8
console.log(subtract(10, 4)); // 6

// Third-party package
const _ = require('lodash');
console.log(_.capitalize('hello world')); // Hello world`,
            code_lang: "javascript",
          },
        ],
        quiz: {
          question: "What does npm stand for?",
          option_a: "Node Programming Module",
          option_b: "New Project Manager",
          option_c: "Node Package Manager",
          option_d: "Native Process Module",
          correct: "c",
          explanation:
            "npm stands for Node Package Manager — the default package manager for Node.js with 2M+ packages.",
        },
      },
      {
        title: "Building REST APIs with Express",
        lessons: [
          {
            title: "Express.js Fundamentals",
            content: `**Express.js** is a minimal, flexible Node.js web framework for building APIs and web apps.

**Core concepts:**
- **Route** — a URL path + HTTP method handler
- **Middleware** — functions that run between request and response
- **req** — the incoming request (body, params, query, headers)
- **res** — send back data (json, send, status, redirect)

Install: \`npm install express\``,
            code_example: `const express = require('express');
const app     = express();

app.use(express.json()); // parse JSON bodies

let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob'   },
];

// GET all
app.get('/api/users', (req, res) => {
  res.json({ success: true, data: users });
});

// GET by id
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === +req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ data: user });
});

// POST create
app.post('/api/users', (req, res) => {
  const newUser = { id: users.length + 1, ...req.body };
  users.push(newUser);
  res.status(201).json({ data: newUser });
});

app.listen(3000, () => console.log('Running on :3000'));`,
            code_lang: "javascript",
          },
          {
            title: "Middleware and Error Handling",
            content: `**Middleware** functions have access to \`req\`, \`res\`, and \`next\`. They can modify the request, end the response, or pass control forward.

**Types:**
- **Application-level** — \`app.use()\`
- **Built-in** — \`express.json()\`, \`express.static()\`
- **Third-party** — cors, morgan, helmet
- **Error-handling** — exactly 4 arguments: \`(err, req, res, next)\`

Always call \`next()\` to pass control, or \`next(err)\` to trigger the error handler.`,
            code_example: `const express = require('express');
const app     = express();

// Logger middleware
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.url}\`);
  next();
});

// Auth guard
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  next();
};

// Protected route
app.get('/api/profile', requireAuth, (req, res) => {
  res.json({ name: 'Alice' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (4 params)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});`,
            code_lang: "javascript",
          },
        ],
        quiz: {
          question: "What does next() do inside Express middleware?",
          option_a: "Ends the request-response cycle",
          option_b: "Sends a JSON response",
          option_c: "Passes control to the next middleware or route handler",
          option_d: "Redirects to the next route",
          correct: "c",
          explanation:
            "next() passes control to the next function in the middleware stack. Without it, the request hangs.",
        },
      },
      {
        title: "Async Patterns",
        lessons: [
          {
            title: "Async/Await and the File System",
            content: `Node.js excels at async operations. Modern code uses **async/await** with Promises for clean, readable flow.

**Rules:**
- \`async\` functions always return a Promise
- \`await\` pauses execution until the Promise resolves
- Wrap in \`try/catch\` to handle errors
- Use \`Promise.all()\` to run multiple async ops in parallel

The \`fs.promises\` API gives you Promise-based file system access.`,
            code_example: `const fs = require('fs').promises;

// Read a file
async function readConfig() {
  try {
    const raw    = await fs.readFile('config.json', 'utf8');
    const config = JSON.parse(raw);
    console.log('Loaded:', config);
  } catch (err) {
    console.error('Read error:', err.message);
  }
}

// Write a file
async function saveData(data) {
  await fs.writeFile('output.json', JSON.stringify(data, null, 2));
  console.log('Saved!');
}

// Parallel reads
async function loadAll() {
  const [a, b] = await Promise.all([
    fs.readFile('a.txt', 'utf8'),
    fs.readFile('b.txt', 'utf8'),
  ]);
  console.log(a, b);
}`,
            code_lang: "javascript",
          },
        ],
        quiz: {
          question:
            "Which keyword waits for a Promise to resolve inside an async function?",
          option_a: "wait",
          option_b: "defer",
          option_c: "yield",
          option_d: "await",
          correct: "d",
          explanation:
            "await pauses the async function and waits for the Promise to resolve or reject before continuing.",
        },
      },
    ],
  },

  //4. C# and .NET
  {
    meta: {
      title: "C# and .NET Fundamentals",
      description:
        "Learn C# programming — syntax, OOP, collections, LINQ, and building apps with the .NET platform.",
      category: "Computer",
    },
    chapters: [
      {
        title: "C# Basics",
        lessons: [
          {
            title: "Introduction to C# and .NET",
            content: `**C#** is a modern, strongly typed, object-oriented language developed by Microsoft as part of the **.NET** platform.

**Why C#?**
- Compile-time type checking catches errors early
- Full OOP support — classes, interfaces, inheritance, generics
- Rich BCL (Base Class Library) for everything from files to networking
- Used for: Windows apps, ASP.NET Core web APIs, Unity games, Xamarin/MAUI mobile

**.NET** (formerly .NET Core) is cross-platform — runs on Windows, Mac, and Linux.
**.NET Framework** is the older Windows-only version.`,
            code_example: `// Program.cs — Hello World
using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Hello, World!");

        // Variables (strongly typed)
        string  name     = "Alice";
        int     age      = 25;
        double  price    = 9.99;
        bool    isActive = true;

        // String interpolation
        Console.WriteLine($"{name} is {age} years old");
        Console.WriteLine($"Price: {price:C2}");       // currency format
        Console.WriteLine($"Active: {isActive}");
        Console.WriteLine($"Today: {DateTime.Now:yyyy-MM-dd}");
    }
}`,
            code_lang: "csharp",
          },
          {
            title: "Classes and Object-Oriented Programming",
            content: `C# is fully object-oriented. The **four pillars of OOP:**

- **Encapsulation** — restrict access using \`public\`/\`private\`/\`protected\`
- **Inheritance** — a class inherits from another using \`:\`
- **Polymorphism** — override base methods with \`virtual\`/\`override\`
- **Abstraction** — abstract classes and interfaces define contracts

**Properties** provide controlled access to private fields through get/set accessors.`,
            code_example: `public class Animal
{
    public string Name { get; set; }
    private int _age;

    public int Age
    {
        get => _age;
        set => _age = value > 0 ? value : 0; // validation
    }

    public Animal(string name, int age) { Name = name; Age = age; }

    public virtual string Speak() => $"{Name} makes a sound.";
}

public class Dog : Animal
{
    public string Breed { get; }

    public Dog(string name, int age, string breed)
        : base(name, age) => Breed = breed;

    public override string Speak() => $"{Name} says: Woof!";
}

// Usage
var dog = new Dog("Rex", 3, "Labrador");
Console.WriteLine(dog.Speak());  // Rex says: Woof!
Console.WriteLine(dog.Age);      // 3`,
            code_lang: "csharp",
          },
        ],
        quiz: {
          question:
            "Which access modifier restricts a member to its own class only?",
          option_a: "public",
          option_b: "protected",
          option_c: "internal",
          option_d: "private",
          correct: "d",
          explanation:
            "private is the most restrictive access modifier — accessible only within the containing class.",
        },
      },
      {
        title: "Collections and LINQ",
        lessons: [
          {
            title: "Collections — List, Dictionary, Array",
            content: `C# provides powerful generic collection types in \`System.Collections.Generic\`:

- \`List<T>\` — dynamic ordered list, allows duplicates
- \`Dictionary<K,V>\` — key-value pairs, O(1) lookup by key
- \`HashSet<T>\` — unique values only
- \`Queue<T>\` — FIFO (first in, first out)
- \`Stack<T>\` — LIFO (last in, first out)

Generic type parameters (\`<T>\`) ensure type safety at compile time.`,
            code_example: `using System.Collections.Generic;

// List
var fruits = new List<string> { "Apple", "Banana", "Cherry" };
fruits.Add("Date");
fruits.Remove("Banana");
Console.WriteLine(fruits.Count);   // 3
Console.WriteLine(fruits[0]);      // Apple

// Dictionary
var scores = new Dictionary<string, int>
{
    ["Alice"] = 95,
    ["Bob"]   = 87,
};
scores["Carol"] = 92;
Console.WriteLine(scores["Alice"]); // 95

// Iterate
foreach (var kvp in scores)
    Console.WriteLine($"{kvp.Key}: {kvp.Value}");

// Safe access
if (scores.TryGetValue("Dave", out int score))
    Console.WriteLine($"Dave: {score}");
else
    Console.WriteLine("Dave not found");`,
            code_lang: "csharp",
          },
          {
            title: "LINQ — Language Integrated Query",
            content: `**LINQ** lets you query any \`IEnumerable<T>\` using a SQL-like syntax directly in C#.

**Two syntax styles:**
- **Query syntax** — \`from x in list where x > 5 select x\`
- **Method syntax** — \`list.Where(x => x > 5)\` ← more common

Common LINQ methods:
- \`Where()\` — filter
- \`Select()\` — transform/project
- \`OrderBy()\` / \`OrderByDescending()\` — sort
- \`GroupBy()\` — group
- \`First()\`, \`FirstOrDefault()\` — get one item
- \`Count()\`, \`Sum()\`, \`Average()\`, \`Max()\`, \`Min()\` — aggregates`,
            code_example: `using System.Linq;

var students = new[]
{
    (Name: "Alice",  Score: 95),
    (Name: "Bob",    Score: 72),
    (Name: "Carol",  Score: 88),
    (Name: "David",  Score: 55),
    (Name: "Emma",   Score: 91),
};

// Filter + sort + project
var topNames = students
    .Where(s  => s.Score >= 85)
    .OrderByDescending(s => s.Score)
    .Select(s => s.Name);

// Emma, Alice, Carol
foreach (var name in topNames)
    Console.WriteLine(name);

// Aggregates
Console.WriteLine($"Average: {students.Average(s => s.Score):F1}");
Console.WriteLine($"Highest: {students.Max(s => s.Score)}");
Console.WriteLine($"Passed:  {students.Count(s => s.Score >= 60)}");`,
            code_lang: "csharp",
          },
        ],
        quiz: {
          question:
            "Which LINQ method filters a collection based on a condition?",
          option_a: "Select()",
          option_b: "Find()",
          option_c: "Where()",
          option_d: "Filter()",
          correct: "c",
          explanation:
            "Where() filters elements by a predicate. Select() projects (transforms) each element into a new form.",
        },
      },
    ],
  },

  //5. Angular
  {
    meta: {
      title: "Angular Fundamentals",
      description:
        "Learn Angular — TypeScript, components, directives, services, routing, and building enterprise SPAs.",
      category: "Computer",
    },
    chapters: [
      {
        title: "Angular Basics",
        lessons: [
          {
            title: "What is Angular?",
            content: `**Angular** is a full-featured TypeScript framework by Google for building single-page applications.

**Angular vs React:**
- Angular is a complete **framework** (routing, forms, HTTP, DI built-in)
- React is a **library** (you choose your own tools)
- Angular uses **TypeScript** by default
- Angular has **two-way data binding** with \`[(ngModel)]\`

**Getting started:**
\`npm install -g @angular/cli\`
\`ng new my-app\`
\`cd my-app && ng serve\``,
            code_example: `// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector:    'app-root',
  templateUrl: './app.component.html',
  styleUrls:   ['./app.component.css']
})
export class AppComponent {
  title = 'My Angular App';
  count = 0;

  increment() { this.count++; }
  decrement() { this.count--; }
}

// app.component.html
// <h1>{{ title }}</h1>
// <p>Count: {{ count }}</p>
// <button (click)="increment()">+</button>
// <button (click)="decrement()">-</button>`,
            code_lang: "typescript",
          },
          {
            title: "Components, Templates and Directives",
            content: `**Components** are the core building blocks of Angular. Each has a TypeScript class, an HTML template, and scoped CSS.

**Built-in structural directives** (change DOM structure):
- \`*ngIf\` — conditionally render an element
- \`*ngFor\` — render a list of items
- \`*ngSwitch\` — switch/case in templates

**Attribute directives** (change element appearance):
- \`[ngClass]\` — apply CSS classes dynamically
- \`[ngStyle]\` — apply inline styles dynamically
- \`[(ngModel)]\` — two-way data binding (needs FormsModule)`,
            code_example: `@Component({
  selector: 'app-products',
  template: \`
    <div *ngIf="products.length > 0; else empty">
      <div *ngFor="let p of products; let i = index"
           [ngClass]="{ 'out-of-stock': !p.inStock }">
        <h3>{{ i+1 }}. {{ p.name }}</h3>
        <p>{{ p.price | currency }}</p>
        <span *ngIf="p.inStock">✓ In Stock</span>
        <span *ngIf="!p.inStock">✗ Out of Stock</span>
      </div>
    </div>
    <ng-template #empty><p>No products.</p></ng-template>
  \`
})
export class ProductsComponent {
  products = [
    { name: 'React Course',   price: 49, inStock: true  },
    { name: 'Angular Guide',  price: 39, inStock: false },
    { name: 'Node.js Basics', price: 29, inStock: true  },
  ];
}`,
            code_lang: "typescript",
          },
        ],
        quiz: {
          question:
            "Which Angular directive loops over an array in a template?",
          option_a: "*ngIf",
          option_b: "*ngFor",
          option_c: "*ngSwitch",
          option_d: "*ngRepeat",
          correct: "b",
          explanation:
            "*ngFor is a structural directive that creates a template instance for each item in an iterable collection.",
        },
      },
      {
        title: "Services and Routing",
        lessons: [
          {
            title: "Services and Dependency Injection",
            content: `**Services** hold business logic and shared data that multiple components need.

**Dependency Injection (DI)** — Angular automatically provides service instances to any component that declares them in its constructor. Decorate a class with \`@Injectable()\` to make it injectable.

**Benefits:**
- Keeps components focused on UI only
- One service instance shared across the app (singleton by default)
- Easy to test — mock the service in unit tests`,
            code_example: `// user.service.ts
import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';

@Injectable({ providedIn: 'root' }) // app-wide singleton
export class UserService {
  private url = 'https://api.example.com/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]>  { return this.http.get<any[]>(this.url); }
  getOne(id: number): Observable<any> { return this.http.get(\`\${this.url}/\${id}\`); }
}

// user-list.component.ts
@Component({ selector: 'app-users', template: \`
  <ul><li *ngFor="let u of users">{{ u.name }}</li></ul>
\`})
export class UserListComponent implements OnInit {
  users: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getAll().subscribe(data => this.users = data);
  }
}`,
            code_lang: "typescript",
          },
          {
            title: "Angular Router",
            content: `**Angular Router** enables navigation between pages in a SPA without full page reloads.

**Key pieces:**
- **Routes array** — maps URL paths to components
- **\`<router-outlet>\`** — where the matched component is rendered
- **\`routerLink\`** — directive for navigation (replaces \`href\`)
- **\`ActivatedRoute\`** — access route params (\`:id\`) and query params
- **Route guards** — \`CanActivate\` to protect private routes

Order matters — put \`**\` (wildcard) last.`,
            code_example: `// app-routing.module.ts
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '',          component: HomeComponent     },
  { path: 'courses',   component: CoursesComponent  },
  { path: 'courses/:id', component: CourseDetailComponent },
  { path: '**',        component: NotFoundComponent },  // must be last
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

// In any template:
// <nav>
//   <a routerLink="/">Home</a>
//   <a routerLink="/courses">Courses</a>
// </nav>
// <router-outlet></router-outlet>

// Read route param in component:
// constructor(private route: ActivatedRoute) {}
// ngOnInit() { const id = this.route.snapshot.paramMap.get('id'); }`,
            code_lang: "typescript",
          },
        ],
        quiz: {
          question:
            "Which decorator marks a class as an injectable Angular service?",
          option_a: "@Service()",
          option_b: "@Component()",
          option_c: "@Injectable()",
          option_d: "@Provider()",
          correct: "c",
          explanation:
            '@Injectable() registers the class with Angular\'s DI system. providedIn: "root" makes it a singleton.',
        },
      },
    ],
  },

  // 6.Basic Mathematics
  {
    meta: {
      title: "Basic Mathematics",
      description:
        "Master foundational maths — numbers, fractions, algebra, geometry, and statistics. Free for all standards.",
      category: "Science",
    },
    chapters: [
      {
        title: "Numbers and Operations",
        lessons: [
          {
            title: "Number Systems",
            content: `Mathematics begins with understanding numbers. Different **number systems** describe different types of values.

**Types of Numbers:**
- **Natural (ℕ)** — counting numbers: 1, 2, 3, 4, 5 …
- **Whole (W)** — natural + zero: 0, 1, 2, 3 …
- **Integer (ℤ)** — whole + negatives: … -2, -1, 0, 1, 2 …
- **Rational (ℚ)** — expressible as p/q: 1/2, 3/4, 0.75, 2.333…
- **Irrational** — cannot be expressed as fractions: π, √2, e
- **Real (ℝ)** — all rational and irrational numbers

**Place Value** of 5,847.23:
5 → Thousands | 8 → Hundreds | 4 → Tens | 7 → Ones | 2 → Tenths | 3 → Hundredths`,
            code_example: `-- Number Classification Examples --

Natural:    1, 2, 3, 10, 100
Whole:      0, 1, 2, 3, 100
Integer:    -5, -1, 0, 3, 7
Rational:   1/2 = 0.5,  3/4 = 0.75,  1/3 = 0.333...
Irrational: π ≈ 3.14159...,  √2 ≈ 1.41421...,  e ≈ 2.71828...

-- Place Value of 3,756.48 --

Digit  | Place       | Value
  3    | Thousands   | 3,000
  7    | Hundreds    |   700
  5    | Tens        |    50
  6    | Ones        |     6
  4    | Tenths      |   0.4
  8    | Hundredths  |  0.08

Expanded: 3,000 + 700 + 50 + 6 + 0.4 + 0.08 = 3,756.48`,
            code_lang: "text",
          },
          {
            title: "Fractions, Decimals and Percentages",
            content: `Fractions, decimals, and percentages are three ways to represent the same part-of-a-whole.

**Fraction operations:**
- **Add/Subtract** — find a common denominator first
- **Multiply** — numerator × numerator, denominator × denominator
- **Divide** — multiply by the reciprocal (flip the second fraction)

**Conversions:**
- Fraction → Decimal: divide numerator by denominator (3/4 = 0.75)
- Decimal → Percent: multiply by 100 (0.75 → 75%)
- Percent → Decimal: divide by 100 (75% → 0.75)`,
            code_example: `-- Fraction Operations --

Addition:    1/3 + 1/4 = 4/12 + 3/12  = 7/12
Subtraction: 3/4 - 1/3 = 9/12 - 4/12  = 5/12
Multiply:    2/3 × 3/5 = 6/15          = 2/5
Divide:      3/4 ÷ 2/3 = 3/4 × 3/2    = 9/8 = 1⅛

-- Conversion Table --

Fraction | Decimal | Percent
  1/2    |  0.5    |  50%
  1/4    |  0.25   |  25%
  3/4    |  0.75   |  75%
  1/5    |  0.2    |  20%
  2/5    |  0.4    |  40%

-- Percentage Problems --

30% of 200  = 30/100 × 200 = 60
15 is ?% of 60 = (15÷60) × 100 = 25%
Increase 80 by 15% = 80 + (80×0.15) = 80 + 12 = 92`,
            code_lang: "text",
          },
        ],
        quiz: {
          question: "What is 2/3 + 3/4?",
          option_a: "5/7",
          option_b: "17/12",
          option_c: "6/12",
          option_d: "5/12",
          correct: "b",
          explanation:
            "Common denominator is 12: 2/3 = 8/12, 3/4 = 9/12. So 8/12 + 9/12 = 17/12.",
        },
      },
      {
        title: "Algebra Basics",
        lessons: [
          {
            title: "Variables, Expressions and Equations",
            content: `**Algebra** uses letters (variables) to represent unknown quantities and describe mathematical relationships.

**Vocabulary:**
- **Variable** — a letter for an unknown value (x, y, n)
- **Expression** — numbers/variables combined with operations: \`3x + 5\`
- **Equation** — two expressions set equal: \`3x + 5 = 20\`
- **Coefficient** — number multiplied by a variable (3 in 3x)
- **Constant** — a fixed number (5 in 3x + 5)

**Solving strategy:** isolate the variable by performing identical operations on both sides.`,
            code_example: `-- Solving Linear Equations --

Example 1:  3x + 5 = 20
  → 3x = 20 - 5 = 15
  →  x = 15 ÷ 3 = 5          ✓

Example 2:  2(x - 3) = 10
  → 2x - 6 = 10               (expand brackets)
  → 2x = 16                   (add 6 both sides)
  →  x = 8                    ✓

Example 3:  x/4 + 2 = 7
  → x/4 = 5                   (subtract 2)
  →   x = 20                  (multiply by 4) ✓

-- Simultaneous Equations --

  x + y = 10
  x - y = 4
  ─────────
  2x    = 14  → x = 7
  y = 10 - 7  → y = 3         ✓`,
            code_lang: "text",
          },
          {
            title: "Geometry — Shapes, Area and Perimeter",
            content: `**Geometry** studies shapes, sizes, angles, and spatial relationships.

**2D Shape Formulas:**

| Shape     | Perimeter        | Area              |
|-----------|------------------|-------------------|
| Square    | 4s               | s²                |
| Rectangle | 2(l + w)         | l × w             |
| Triangle  | a + b + c        | ½ × base × height |
| Circle    | 2πr              | πr²               |

**3D Solid Formulas:**
- **Cube:** Volume = s³, Surface = 6s²
- **Cuboid:** Volume = l × w × h
- **Cylinder:** Volume = πr²h
- **Sphere:** Volume = (4/3)πr³

π ≈ 3.14159`,
            code_example: `-- 2D Calculations --

Rectangle (l=8, w=5):
  Perimeter = 2(8+5) = 26 units
  Area      = 8×5   = 40 sq units

Triangle (base=6, height=4):
  Area = ½ × 6 × 4 = 12 sq units

Circle (radius=7):
  Circumference = 2 × 3.14 × 7 = 43.96 units
  Area          = 3.14 × 7²    = 153.86 sq units

-- 3D Calculations --

Cube (side=4):
  Volume       = 4³ = 64 cubic units
  Surface area = 6 × 16 = 96 sq units

Cylinder (r=3, h=10):
  Volume = 3.14 × 9 × 10 = 282.6 cubic units`,
            code_lang: "text",
          },
        ],
        quiz: {
          question:
            "What is the area of a circle with radius 5 cm? (Use π = 3.14)",
          option_a: "15.70 cm²",
          option_b: "31.40 cm²",
          option_c: "78.50 cm²",
          option_d: "25.00 cm²",
          correct: "c",
          explanation: "Area = π × r² = 3.14 × 5² = 3.14 × 25 = 78.50 cm².",
        },
      },
      {
        title: "Statistics and Probability",
        lessons: [
          {
            title: "Mean, Median, Mode and Range",
            content: `**Statistics** helps us summarise and interpret data.

**Measures of Central Tendency:**
- **Mean** — sum of all values ÷ count (the average)
- **Median** — the middle value of sorted data
  - Odd count: middle item
  - Even count: average of two middle items
- **Mode** — value that appears most frequently (can be multiple)

**Spread:**
- **Range** — maximum − minimum
- **Standard Deviation** — how far values are from the mean`,
            code_example: `Data: 4, 7, 2, 9, 4, 6, 4, 8, 3, 9

Sorted: 2, 3, 4, 4, 4, 6, 7, 8, 9, 9

Mean   = (2+3+4+4+4+6+7+8+9+9) ÷ 10 = 56 ÷ 10 = 5.6
Median = avg of 5th & 6th = (4+6) ÷ 2 = 5.0
Mode   = 4  (appears 3 times)
Range  = 9 - 2 = 7

-- Probability --

P(event) = favourable outcomes ÷ total outcomes

Fair coin:   P(Heads) = 1/2 = 50%
Fair die:    P(getting 6) = 1/6 ≈ 16.7%
             P(even)      = 3/6 = 50%
Deck of cards: P(Ace)     = 4/52 = 1/13 ≈ 7.7%`,
            code_lang: "text",
          },
        ],
        quiz: {
          question: "Find the median of: 3, 7, 1, 9, 5, 2, 8",
          option_a: "5",
          option_b: "7",
          option_c: "4",
          option_d: "5.5",
          correct: "a",
          explanation:
            "Sorted: 1, 2, 3, 5, 7, 8, 9. With 7 items the middle (4th) value is 5.",
        },
      },
    ],
  },
];

//  SEED FREE COURSE HELPER
const seedFreeCourse = async (conn, mentorId, courseDef) => {
  const { meta, chapters } = courseDef;
  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

  await conn.execute(
    `
    INSERT IGNORE INTO courses
      (title, description, category, price, is_free, mentor_id,
       lessons, has_cert, language, access, rating, total_reviews, is_published)
    VALUES (?, ?, ?, 0.00, 1, ?, ?, 0, 'English', 'Lifetime', 4.9, 50, 1)
  `,
    [meta.title, meta.description, meta.category, mentorId, totalLessons],
  );

  const [[row]] = await conn.execute(`SELECT id FROM courses WHERE title = ?`, [
    meta.title,
  ]);
  const courseId = row.id;

  for (let ci = 0; ci < chapters.length; ci++) {
    const ch = chapters[ci];

    await conn.execute(
      `INSERT IGNORE INTO course_chapters (course_id, title, sort_order) VALUES (?, ?, ?)`,
      [courseId, ch.title, ci + 1],
    );
    const [[chRow]] = await conn.execute(
      `SELECT id FROM course_chapters WHERE course_id = ? AND title = ?`,
      [courseId, ch.title],
    );
    const chapterId = chRow.id;

    for (let li = 0; li < ch.lessons.length; li++) {
      const l = ch.lessons[li];
      await conn.execute(
        `
        INSERT IGNORE INTO chapter_lessons
          (chapter_id, title, content, code_example, code_lang, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [chapterId, l.title, l.content, l.code_example, l.code_lang, li + 1],
      );
    }

    await conn.execute(
      `
      INSERT IGNORE INTO chapter_quizzes
        (chapter_id, question, option_a, option_b, option_c, option_d, correct, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        chapterId,
        ch.quiz.question,
        ch.quiz.option_a,
        ch.quiz.option_b,
        ch.quiz.option_c || null,
        ch.quiz.option_d || null,
        ch.quiz.correct,
        ch.quiz.explanation,
      ],
    );
  }

  const total = chapters.reduce((s, ch) => s + ch.lessons.length, 0);
  console.log(
    `   ✔  "${meta.title}" — ${chapters.length} chapters, ${total} lessons, ${chapters.length} quizzes`,
  );
};

//  MAIN
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: DB_NAME,
  });

  console.log("  Seeding …\n");

  // Pricing plans
  await conn.execute(`
    INSERT IGNORE INTO pricing_plans
      (name, price, hd_lessons, official_exams, practice_questions,
       subscriptions, free_books, has_quizzes, has_explanations, has_instructor)
    VALUES
      ('basic',    200,   3, 1, 100, 1, 1, 0, 0, 0),
      ('standard', 600,   8, 2, 200, 1, 3, 1, 0, 0),
      ('premium',  1200, 15, 3, 300, 1, 5, 1, 1, 1)
  `);
  console.log("     pricing_plans");

  // Admin
  const adminHash = await bcrypt.hash("admin123", 12);
  await conn.execute(
    `
    INSERT IGNORE INTO users (full_name, email, password, role)
    VALUES ('Admin User', 'admin@Eduverse.co', ?, 'admin')
  `,
    [adminHash],
  );
  console.log("     admin          → admin@Eduverse.co / admin123");

  // Mentor
  const mentorHash = await bcrypt.hash("mentor123", 12);
  await conn.execute(
    `
    INSERT IGNORE INTO users (full_name, email, password, role)
    VALUES ('Kristin Watson', 'kristin@Eduverse.co', ?, 'mentor')
  `,
    [mentorHash],
  );

  const [[mentorUser]] = await conn.execute(
    `SELECT id FROM users WHERE email = 'kristin@Eduverse.co'`,
  );
  await conn.execute(
    `
    INSERT IGNORE INTO mentors
      (user_id, title, bio, certification, experience, graduated,
       category, rating, total_reviews, total_courses, is_approved)
    VALUES (?, 'Founder & Mentor',
      'Expert educator with 10 years of experience in programming and mathematics.',
      'M.Sc. Computer Science, Certified Educator.',
      10, 1, 'High School', 4.9, 153, 30, 1)
  `,
    [mentorUser.id],
  );

  const [[mentor]] = await conn.execute(
    `SELECT id FROM mentors WHERE user_id = ?`,
    [mentorUser.id],
  );
  await conn.execute(
    `
    INSERT IGNORE INTO mentor_languages (mentor_id, language)
    VALUES (?, 'English'), (?, 'French')
  `,
    [mentor.id, mentor.id],
  );
  await conn.execute(
    `
    INSERT IGNORE INTO mentor_socials (mentor_id, facebook, instagram, twitter, linkedin)
    VALUES (?, '#', '#', '#', '#')
  `,
    [mentor.id],
  );
  console.log("     mentor         → kristin@Eduverse.co / mentor123");

  // Paid courses
  const paidCourses = [
    [
      "Maths - for Standard 3 Students",
      "High School",
      "Standard Three",
      49.0,
      30,
      5,
      1,
    ],
    ["Introduction to Algebra", "High School", "Standard One", 39.0, 20, 3, 1],
    ["English Grammar Basics", "Kindergarten", "Standard One", 29.0, 15, 2, 1],
    ["College Physics 101", "College", null, 59.0, 40, 6, 1],
    ["Computer Science Fundamentals", "Computer", null, 79.0, 50, 8, 1],
  ];
  for (const [title, cat, std, price, lessons, quizzes, cert] of paidCourses) {
    await conn.execute(
      `
      INSERT IGNORE INTO courses
        (title, category, standard, price, mentor_id, lessons, quizzes,
         has_cert, language, access, rating, total_reviews, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'English', 'Lifetime', 4.8, 50, 1)
    `,
      [title, cat, std, price, mentor.id, lessons, quizzes, cert],
    );
  }
  console.log("     paid courses (5)");

  // Books
  const books = [
    ["The Three Musketeers", "Alexandre Dumas", "All", 39.0, 0],
    ["Think Outside the Box", "Various", "High School", 40.0, 1],
    ["Adventure Awaits", "Various", "Kindergarten", 40.0, 1],
    ["BOOK Essentials", "Various", "College", 40.0, 0],
  ];
  for (const [title, author, cat, price, isNew] of books) {
    await conn.execute(
      `
      INSERT IGNORE INTO books (title, author, category, price, rating, is_new)
      VALUES (?, ?, ?, ?, 4.9, ?)
    `,
      [title, author, cat, price, isNew],
    );
  }
  console.log("books (4)");

  // Free courses
  console.log("\n   Seeding free courses …");
  for (const def of FREE_COURSES) {
    await seedFreeCourse(conn, mentor.id, def);
  }

  console.log(`\nDone! Seeded ${FREE_COURSES.length} free courses.\n`);
  await conn.end();
})();
