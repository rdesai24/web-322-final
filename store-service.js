const Sequelize = require('sequelize');

const sequelize = new Sequelize('web322_gmv9', 'web322_gmv9_user', '54V9GSP49qkn5sUe7fspuuyYUuaEG7Tu', {
  host: 'dpg-cvrjidali9vc739gq09g-a.oregon-postgres.render.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  }
});

// Define models
const Category = sequelize.define("Category", {
  category: Sequelize.STRING
});

const Item = sequelize.define("Item", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE
});

// Define relationship
Item.belongsTo(Category, { foreignKey: 'category' });

// Initialize database
module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

// Add item
module.exports.addItem = function (itemData) {
  return new Promise((resolve, reject) => {
    itemData.published = itemData.published ? true : false;
    for (let prop in itemData) {
      if (itemData[prop] === "") {
        itemData[prop] = null;
      }
    }
    itemData.postDate = new Date();

    Item.create(itemData)
      .then(() => resolve())
      .catch((err) => {
        console.error("Error creating item:", err);
        reject("unable to create post");
      });
  });
};

// Get all items (with category)
module.exports.getAllItems = function () {
  return new Promise((resolve, reject) => {
    Item.findAll({
      include: [Category]
    })
    .then(data => resolve(data))
    .catch((err) => {
      console.error("❌ getAllItems error:", err);
      reject("no results returned");
    });
  });
};

// Get item by ID
module.exports.getItemById = function (id) {
  return new Promise((resolve, reject) => {
    Item.findOne({
      where: { id },
      include: [Category]
    })
    .then(data => {
      if (data) resolve(data);
      else reject("no results returned");
    })
    .catch(err => {
      console.error("❌ getItemById error:", err);
      reject("no results returned");
    });
  });
};

// Get items by category
module.exports.getItemsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: { category },
      include: [Category]
    })
    .then(data => resolve(data))
    .catch(err => {
      console.error("❌ getItemsByCategory error:", err);
      reject("no results returned");
    });
  });
};

// Get items by minimum date
module.exports.getItemsByMinDate = function (minDateStr) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        postDate: {
          [Sequelize.Op.gte]: new Date(minDateStr)
        }
      },
      include: [Category]
    })
    .then(data => resolve(data))
    .catch(err => {
      console.error("❌ getItemsByMinDate error:", err);
      reject("no results returned");
    });
  });
};

// Get published items
module.exports.getPublishedItems = function () {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: { published: true },
      include: [Category]
    })
    .then(data => resolve(data))
    .catch(err => {
      console.error("❌ getPublishedItems error:", err);
      reject("no results returned");
    });
  });
};

// Get published items by category
module.exports.getPublishedItemsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        category,
        published: true
      },
      include: [Category]
    })
    .then(data => resolve(data))
    .catch(err => {
      console.error("❌ getPublishedItemsByCategory error:", err);
      reject("no results returned");
    });
  });
};

// Get all categories
module.exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then(data => resolve(data))
      .catch(() => reject("no results returned"));
  });
};

// Add a new category
module.exports.addCategory = function (categoryData) {
  return new Promise((resolve, reject) => {
    for (let prop in categoryData) {
      if (categoryData[prop] === "") {
        categoryData[prop] = null;
      }
    }

    Category.create(categoryData)
      .then(() => resolve())
      .catch(() => reject("unable to create category"));
  });
};

// Delete category
module.exports.deleteCategoryById = function (id) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: { id }
    })
    .then(() => resolve())
    .catch(() => reject("unable to delete category"));
  });
};

// Delete item
module.exports.deletePostById = function (id) {
  return new Promise((resolve, reject) => {
    Item.destroy({
      where: { id }
    })
    .then(() => resolve())
    .catch(() => reject("unable to delete post"));
  });
};
