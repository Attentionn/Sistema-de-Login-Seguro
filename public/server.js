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

    try {
        // Verificar si el usuario ya existe
        const checkUserSQL = "SELECT * FROM users WHERE username = ?";
        const [existingUser] = await new Promise((resolve, reject) =>
            db.query(checkUserSQL, [username], (err, results) => {
                if (err) reject(err);
                resolve(results);
            })
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "El nombre de usuario ya existe" });
        }

        // Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insertar el nuevo usuario
        const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        await new Promise((resolve, reject) =>
            db.query(sql, [username, hashedPassword], (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        );

        res.json({ message: "Usuario registrado con éxito" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en el registro" });
    }
});

// Login de usuario
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = "SELECT * FROM users WHERE username = ?";
        const [results] = await new Promise((resolve, reject) =>
            db.query(sql, [username], (err, results) => {
                if (err) reject(err);
                resolve(results);
            })
        );

        if (results.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(401).json({ message: "Credenciales inválidas" });

        res.json({ message: "Inicio de sesión exitoso", success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en el login" });
    }
});

app.listen(3000, () => {
    console.log("🚀 Servidor corriendo en http://localhost:3000");
});
