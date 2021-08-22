import express from "express";
import { promises as fs, write } from "fs";

const router = express.Router();

const { readFile, writeFile } = fs;

global.fileName = "accounts.json";

router.post("/", async (req, res, next) => {
  try {
    let account = req.body;

    if(!account.balance || account.name == null){
      throw new Error("Name ou Balance obrigatórios");
    }

    const data = JSON.parse(await readFile(fileName)); //!ELE VAI ESCREVER NO JSON E TRANSFORMAR PARA O PADRAO JSON

    account = { 
      id: data.nextId++,
      name: account.name,
      balance: account.balance
      }; //pega todas as propriedades e coloca nesse objeto account

    data.accounts.push(account);

    await writeFile(fileName, JSON.stringify(data, null, 2));

    res.send(account);

    logger.info(`POST /accout - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(fileName));
    delete data.nextId; //mostra o json sem o NEXTID
    res.send(data);
    logger.info("GET /account");
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(fileName));
    const account = data.accounts.find(
      (account) => account.id === parseInt(req.params.id)
    ); //Quando a gente passa o parâmetro, ele vem como string(pois é um input do teclado), quando usamos o == ele faz a conversão para number
    //mas por boa prática é melhor usando o === e fazer a conversão explícita
    res.send(account);
    logger.info("GET /account/:id");
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.accounts = data.accounts.filter(
      (account) => account.id !== parseInt(req.params.id)
    );

    await writeFile(fileName, JSON.stringify(data, null, 2));

    res.end("Usuário deletado com sucesso!");
    logger.info(`DELETE /account/:id -  ${req.params.id}`)
  } catch (err) {
    next(err);
  }
});

router.put("/", async (req, res, next) => {
  //altera todo o corpo da conta
  try {
    const account = req.body;
    const data = JSON.parse(await readFile(fileName));
    const index = data.accounts.findIndex((a) => a.id === account.id);

    data.accounts[index] = account;

    await writeFile(fileName, JSON.stringify(data));

    res.send(account);
    logger.info(`PUT /accout - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

router.patch("/updateBalance", async (req, res, next) => {
  //altera a conta parcialmente
  try {
    const account = req.body;
    const data = JSON.parse(await readFile(fileName));
    const index = data.accounts.findIndex((a) => a.id === account.id);

    data.accounts[index].balance = account.balance;

    await writeFile(fileName, JSON.stringify(data));

    res.send(data.accounts[index]);
    logger.info(`PATCH /accout/updateBalance - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;
