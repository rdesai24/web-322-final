/*********************************************************************************
 *  WEB322 – Assignment 05
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
 *  No part of this assignment has been copied manually or electronically from any other source 
 *  (including web sites) or distributed to other students.
 *
 *  Name: Rushabh Desai       Student ID: 190713230      Date: 21 March 2025
 *
 *  Cyclic Web App URL: __________________________________________
 *  GitHub Repository URL: https://github.senecapolytechnic.ca/rdesai24/web322-app.git
 ********************************************************************************/

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const storeService = require("./store-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Setup Handlebars
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    handlebars: allowInsecurePrototypeAccess(require("handlebars")),
    helpers: {
      navLink: function (url, options) {
        return (
          '<li class="nav-item">' +
          '<a class="nav-link' +
          (url === app.locals.activeRoute ? " active" : "") +
          '" href="' +
          url +
          '">' +
          options.fn(this) +
          "</a>" +
          "</li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        return lvalue !== rvalue
          ? options.inverse(this)
          : options.fn(this);
      },
      safeHTML: function (context) {
        if (typeof context !== "string") return "";
        return context.replace(/<script.*?>.*?<\/script>/gi, "");
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        let day = dateObj.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    }
  })
);

app.set("view engine", ".hbs");

// Route tracker middleware
app.use((req, res, next) => {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Setup multer and cloudinary (if used)
const upload = multer(); // memory storage

// ROUTES

app.get("/", (req, res) => {
  res.redirect("/shop");
});

app.get("/about", (req, res) => {
  res.render("about");
});

// Show add post form
app.get("/Items/add", (req, res) => {
  storeService.getCategories()
    .then((data) => res.render("addPost", { categories: data }))
    .catch(() => res.render("addPost", { categories: [] }));
});

// Handle new post
app.post("/Items/add", (req, res) => {
  console.log("🔍 Form Data:", req.body); // <== this will log the submitted values

  storeService.addItem(req.body)
    .then(() => res.redirect("/Items"))
    .catch((err) => {
      console.error("❌ Unable to add item:", err);
      res.status(500).send("Unable to add item");
    });
});

app.get("/debug/items", async (req, res) => {
  const items = await storeService.getAllItems();
  res.json(items);
});


// Show all items
app.get("/Items", async (req, res) => {
  try {
    const data = req.query.category
      ? await storeService.getItemsByCategory(req.query.category)
      : await storeService.getAllItems();
    res.render("Items", { items: data.length > 0 ? data : null, message: data.length ? null : "no results" });
  } catch {
    res.render("Items", { message: "no results" });
  }
});

// Delete item
app.get("/Items/delete/:id", (req, res) => {
  storeService.deletePostById(req.params.id)
    .then(() => res.redirect("/Items"))
    .catch(() => res.status(500).send("Unable to Remove Post / Post not found"));
});

// Show categories
app.get("/categories", async (req, res) => {
  try {
    const data = await storeService.getCategories();
    res.render("categories", { categories: data.length > 0 ? data : null, message: data.length ? null : "no results" });
  } catch {
    res.render("categories", { message: "no results" });
  }
});

// Show add category form
app.get("/categories/add", (req, res) => {
  res.render("addCategory");
});

// Handle new category
app.post("/categories/add", (req, res) => {
  storeService.addCategory(req.body)
    .then(() => res.redirect("/categories"))
    .catch(() => res.status(500).send("Unable to Add Category"));
});

// Delete category
app.get("/categories/delete/:id", (req, res) => {
  storeService.deleteCategoryById(req.params.id)
    .then(() => res.redirect("/categories"))
    .catch(() => res.status(500).send("Unable to Remove Category / Category not found"));
});

// Shop view
app.get("/shop", async (req, res) => {
  let viewData = {};
  try {
    const items = req.query.category
      ? await storeService.getPublishedItemsByCategory(req.query.category)
      : await storeService.getPublishedItems();
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    viewData.posts = items;
    viewData.post = items[0];
  } catch {
    viewData.message = "no results";
  }

  try {
    viewData.categories = await storeService.getCategories();
  } catch {
    viewData.categoriesMessage = "no results";
  }

  res.render("shop", { data: viewData, viewingCategory: req.query.category });
});

// View single item
app.get("/shop/:id", async (req, res) => {
  let viewData = {};
  try {
    viewData.post = await storeService.getItemById(req.params.id);
  } catch {
    viewData.message = "no results";
  }

  try {
    viewData.posts = req.query.category
      ? await storeService.getPublishedItemsByCategory(req.query.category)
      : await storeService.getPublishedItems();
  } catch {
    viewData.message = "no results";
  }

  try {
    viewData.categories = await storeService.getCategories();
  } catch {
    viewData.categoriesMessage = "no results";
  }

  res.render("shop", { data: viewData, viewingCategory: req.query.category });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).render("404");
});

// Start server
storeService.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error(" Failed to start server:", err?.message || err);
  });
