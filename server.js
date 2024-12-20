const express = require('express');
const router = require('./routes');

const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/v1', router)

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});