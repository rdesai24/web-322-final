let items = [];
let categories = [];

module.exports = {
  addItem(item) {
    return new Promise((resolve, reject) => {
      item.id = items.length + 1;
      item.postDate = new Date().toISOString().split("T")[0];
      item.published = item.published === "true"; // << make sure this is a boolean
      items.push(item);
      resolve();
    });
  },

  getPublishedItems() {
    return Promise.resolve(items.filter(item => item.published));
  },

  getPublishedItemsByCategory(category) {
    return Promise.resolve(items.filter(item => item.published && item.category === category));
  },

  getItemsByCategory(category) {
    return Promise.resolve(items.filter(item => item.category === category));
  },

  getAllItems() {
    return Promise.resolve(items);
  },

  getItemById(id) {
    return Promise.resolve(items.find(item => item.id == id));
  },

  getCategories() {
    return Promise.resolve(categories);
  },

  initialize() {
    return Promise.resolve();
  }
};
