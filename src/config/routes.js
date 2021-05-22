module.exports = (app) => {
  // [/users]
  app
    .route('/users')
    .get(app.routes.users.findAll)
    .post(app.routes.users.create);
  // [/accounts]
  app
    .route('/accounts')
    .get(app.routes.accounts.findAll)
    .post(app.routes.accounts.create);
};
