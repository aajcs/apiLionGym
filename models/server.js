const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const { dbConnection } = require("../database/config");
const Sockets = require("./sockets");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;

    // Definición de rutas
    this.paths = {
      auth: "/api/auth",

      usuarios: "/api/usuarios",
      uploads: "/api/uploads",
    };

    // Conectar a base de datos
    this.conectarDB();

    // Middlewares
    this.middlewares();

    // Crear servidor HTTP
    this.server = http.createServer(this.app);

    // Configuración de sockets
    this.io = socketio(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"], // Acepta WebSocket y polling
    });

    // Middleware para inyectar sockets en las solicitudes
    this.app.use((req, res, next) => {
      req.io = this.io;
      next();
    });

    // Rutas de la aplicación
    this.routes();
  }

  async conectarDB() {
    await dbConnection();
  }

  middlewares() {
    // CORS
    this.app.use(cors());

    // Lectura y parseo del body
    this.app.use(express.json());

    // Directorio Público
    this.app.use(express.static("public"));

    // Fileupload - Carga de archivos
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        createParentPath: true,
      })
    );
  }

  routes() {
    // Rutas de autenticación y usuarios
    this.app.use(this.paths.auth, require("../routes/auth"));
    this.app.use(this.paths.usuarios, require("../routes/usuarios"));

    // Rutas de archivos y cargas
    this.app.use(this.paths.uploads, require("../routes/uploads"));
  }

  configurarSockets() {
    new Sockets(this.io);
  }

  listen() {
    // Inicializar sockets
    this.configurarSockets();
    this.server.listen(this.port, () => {
      console.log("Servidor corriendo en puerto", this.port);
    });
  }
}

module.exports = Server;
