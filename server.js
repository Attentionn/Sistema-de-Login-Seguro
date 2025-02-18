const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Deja esto vacío si no has puesto contraseña en MySQL
    database: "login_db"
});

db.connect(err => {
    if (err) throw err;
    console.log("📌 Conectado a MySQL");
});

// Registro de usuario
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Faltan datos" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: "Error en el registro" });
        res.json({ message: "Usuario registrado con éxito" });
    });
});

// Login de usuario
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ message: "Error en el login" });
        if (results.length === 0) return res.status(401).json({ message: "Credenciales inválidas" });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(401).json({ message: "Credenciales inválidas" });

        res.json({ message: "Inicio de sesión exitoso", success: true });
    });
});

app.listen(3000, () => {
    console.log("🚀 Servidor corriendo en http://localhost:3000");
});
