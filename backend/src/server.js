require('dotenv').config();
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 5000;

// Sync database
db.sequelize.sync({ force: false, alter: false }).then(() => {
  console.log('Database synced successfully.');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
