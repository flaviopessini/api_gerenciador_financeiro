module.exports = (app) => {
  // [/auth]
  app.route('/auth/signin').post(app.routes.auth.signin);
  // [/users]
  app
    .route('/users')
    .all(app.config.passport.authenticate())
    .get(app.routes.users.findAll)
    .post(app.routes.users.create);
  // [/accounts]
  app
    .route('/accounts')
    .all(app.config.passport.authenticate())
    .get(app.routes.accounts.findAll)
    .post(app.routes.accounts.create);
  app
    .route('/accounts/:id')
    .all(app.config.passport.authenticate())
    .get(app.routes.accounts.findById)
    .put(app.routes.accounts.update)
    .delete(app.routes.accounts.remove);
};
