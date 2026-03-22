const bcrypt = require('bcryptjs')
bcrypt.hash('YourPassword123', 12).then(hash => console.log(hash))