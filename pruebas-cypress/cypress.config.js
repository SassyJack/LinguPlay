const { defineConfig } = require("cypress");

module.exports = defineConfig({

  allowCypressEnv: false,

  e2e: {

    baseUrl: "http://localhost:8081",

    defaultCommandTimeout: 10000,
    pageLoadTimeout: 120000,

    setupNodeEvents(on, config) {

      // implement node event listeners here

    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});