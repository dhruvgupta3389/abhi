import bcrypt from "bcryptjs";

const password = "worker123";

bcrypt.hash(password, 10).then(hash => {
  console.log("New bcrypt hash for worker123:", hash);
});
