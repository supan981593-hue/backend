async function login(req, res) {
  const { email, password } = req.body;

  // Temporary login (hardcoded)
  if (email === "admin" && password === "1234") {
    return res.json({
      token: "dummy-token",
      user: {
        id: "1",
        name: "Admin",
        email: "admin",
        role: "admin",
      },
    });
  }

  return res.status(401).json({ message: "Invalid email or password" });
}

module.exports = {
  login,
};
