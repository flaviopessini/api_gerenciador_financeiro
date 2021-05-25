const passport = require('passport');
const passportJwt = require('passport-jwt');

const { Strategy, ExtractJwt } = passportJwt;

const secret = `eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTYyMTk2Njc5MywiaWF0IjoxNjIxOTY2NzkzfQ.cSfSZaUkj69ioQAauRMT9ybI1x3aO07RKKv6g-n9dbY
`;

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
