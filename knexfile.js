module.exports = {
  test: {
    client: 'pg',
    version: '12.5',
    connection: {
      host: '192.168.0.150',
      user: 'postgres',
      password: 'postgres',
      database: 'gerenc_financeiro',
    },
    migrations: {
      directory: 'src/migrations',
    },
    seeds: {
      directory: 'src/seeds',
    },
  },
};
