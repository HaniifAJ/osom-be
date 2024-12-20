const express = require('express');
const router = require('./routes');
const { PORT } = require('./config')

const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/v1', router)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
