const passport = require('passport');
const passportJwt = require('passport-jwt');

const { Strategy, ExtractJwt } = passportJwt;

const secret = 'D3F5F5F2E5428DCA56BA4892C7DA7';

module.exports = (app) => {
  const params = {
    secretOrKey: secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  };

  const strategy = new Strategy(params, (payload, done) => {
    app.services.user
      .findOne({ id: payload.id })
      .then((user) => {
        if (user) {
          done(null, { ...payload });
        } else {
          done(null, false);
        }
      })
      .catch((error) => done(error, false));
  });

  passport.use(strategy);

  return {
    authenticate: () => passport.authenticate('jwt', { session: false }),
  };
};
