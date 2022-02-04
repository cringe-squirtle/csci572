import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
const app = express();
const __dirname = path.resolve();

app.use(cors());

const REQUEST_HANDLER = {
  SELECT: "select",
  SPELL: "spell",
  SUGGEST: "suggest",
};

const getResponse = async(q, r, handler = REQUEST_HANDLER.SPELL) =>{
  const fetchResponse = await fetch(getUrl(q, r, handler));
  return await fetchResponse.json();
}

const getUrl = (query = "", sort = "", handler = REQUEST_HANDLER.SPELL) =>
  `http://localhost:8983/solr/hw4api3/${handler}?q.op=OR&q=${query}&sort=${sort}`;

app.get("/api/search", async (req, res) => {
  const { q, r } = req.query;
  const spellcheckResponseJson = await getResponse(q, r);
  
  let sendBack = {}
  sendBack.spellcheck = spellcheckResponseJson?.spellcheck?.suggestions??[];
  sendBack.docs = spellcheckResponseJson?.response?.docs??null;

  res.send(sendBack)
});

app.get("/api/suggest", async(req, res)=>{
  let sendBack = {}
  const { q, r } = req.query;
  const suggestionResonseJson = await getResponse(q, r, REQUEST_HANDLER.SUGGEST);
  sendBack.suggestion = suggestionResonseJson?.suggest?.suggest[q]?.suggestions?.map(({term})=>term)??[]
  res.send(sendBack);
})


app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname + "/index.html"));
});

const server = http.createServer(app);
server.listen(process.env.PORT || 3000);
