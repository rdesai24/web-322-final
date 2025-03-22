/*********************************************************************************
V
WEB322 - Assignment 02
I declare that this assignment is my own work in accordance with Seneca
Academic Policy. No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknoledge that violation of this policy 
to any degree results in a ZERO for this assignment and possible failure of 
the course.

Name: Rushabh Desai
Student ID: 190713230
Date: 21 March 2025
Cyclic Web App URL:
GitHub Repository URL:
********************************************************************************/

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const itemData = require("./store-service");

const app = express();
const PORT = process.env.PORT || 1400;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Setup Handlebars
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
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
        return context.replace(/<script.*?>.*?<\/script>/gi, "");
      }
    }
  })
);
app.set("view engine", ".hbs");

// Middleware for route tracking
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

// ROUTES

app.get("/", (req, res) => {
  res.redirect("/shop");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/items/add", (req, res) => {
  res.render("addItem");
});

app.post("/items/add", async (req, res) => {
  try {
    req.body.postDate = new Date().toISOString().split("T")[0];
    req.body.published = req.body.published ? "true" : "false"; 
    await itemData.addItem(req.body);
    res.redirect("/shop");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to Add Item");
  }
});

  

app.get("/items", async (req, res) => {
  try {
    const data = req.query.category
      ? await itemData.getItemsByCategory(req.query.category)
      : await itemData.getAllItems();
    res.render("items", { items: data });
  } catch (err) {
    res.render("items", { message: "no results" });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const categories = await itemData.getCategories();
    res.render("categories", { categories: categories });
  } catch (err) {
    res.render("categories", { message: "no results" });
  }
});

app.get("/shop", async (req, res) => {
  let pageContent = {};

  try {
    let items = req.query.category
      ? await itemData.getPublishedItemsByCategory(req.query.category)
      : await itemData.getPublishedItems();

    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    pageContent.posts = items;
    pageContent.post = items[0];
  } catch (err) {
    pageContent.message = "no results";
  }

  try {
    pageContent.categories = await itemData.getCategories();
  } catch (err) {
    pageContent.categoriesMessage = "no results";
  }

  res.render("shop", {
    data: pageContent,
    viewingCategory: req.query.category
  });
});

app.get("/shop/:id", async (req, res) => {
  let pageContent = {};

  try {
    const post = await itemData.getItemById(req.params.id);
    pageContent.post = post;
  } catch (err) {
    pageContent.message = "no results";
  }

  try {
    const items = req.query.category
      ? await itemData.getPublishedItemsByCategory(req.query.category)
      : await itemData.getPublishedItems();
    pageContent.posts = items;
  } catch (err) {
    pageContent.message = "no results";
  }

  try {
    const categories = await itemData.getCategories();
    pageContent.categories = categories;
  } catch (err) {
    pageContent.categoriesMessage = "no results";
  }

  res.render("shop", {
    data: pageContent,
    viewingCategory: req.query.category
  });
});

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
