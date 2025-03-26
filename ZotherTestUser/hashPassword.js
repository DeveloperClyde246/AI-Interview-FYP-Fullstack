const bcrypt = require("bcryptjs");

const generateHash = async () => {
  const password = "test"; // Change this to any test password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`Hashed Password: ${hashedPassword}`);
};

generateHash();


//$2b$10$mEfO/vTj9x1VhiREfmcxu.DkaGMIIZE4M/uLWLNZdiGmefdJQvZDm