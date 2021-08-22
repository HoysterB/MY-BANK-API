import express from "express"; //! importar o express, que serve para criação de rodas
import accountsRouter from "./routes/accounts.js";
import { promises as fs } from "fs";
import winston from "winston";

const { readFile, writeFile } = fs;

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  leve: "silly",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "my-bank-api.log" }),
  ],
  format: combine(label({ label: "my-bank-api" }), timestamp(), myFormat)
});

const app = express(); // instancia o express
app.use(express.json()); // fala para o express usar json

app.use("/account", accountsRouter);

app.listen(3000, async () => {
  //!INICIA A API

  try {
    await readFile("accounts.json");
    logger.info("API Started!");
  } catch (err) {
    const initialJson = {
      //!! ESSE É O JSON QUE SERÁ CRIADO
      nextId: 1,
      accounts: [],
    };
    writeFile("accounts.json", JSON.stringify(initialJson)) //stringify converte json para string, transforma de objct js para string
      .then(() => {
        logger.info("API Started and file Created!");
      })
      .catch((err) => {
        logger.error(err);
      });
  }
});
