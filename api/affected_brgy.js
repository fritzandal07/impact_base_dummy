const fs = require("fs");
const path = require("path");

const rows = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data.json"), "utf8")
);

module.exports = (req, res) => {
  const { page = 1, page_size = 10, affected } = req.query;
  let data = rows;
  if (affected) data = data.filter(r => r.affected === affected);

  const size = Math.min(parseInt(page_size) || 10, 1000);
  const p = Math.max(parseInt(page) || 1, 1);
  const lastPage = Math.max(Math.ceil(data.length / size), 1);

  const link = n => {
    const q = new URLSearchParams(req.query);
    q.set("page", n);
    return `https://${req.headers.host}/affected_brgy/?` + q.toString();
  };

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    count: data.length,
    next: p < lastPage ? link(p + 1) : null,
    previous: p > 1 ? link(p - 1) : null,
    results: data.slice((p - 1) * size, p * size),
  });
};