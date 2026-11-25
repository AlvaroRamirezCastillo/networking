import cors from 'cors';
import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());

app.get('/api/user', (_request, response) => {
  response.json({ id: 1, name: 'Ana Pérez' });
});

const server = app.listen(port);
server.once('listening', () => {
  console.log(`Backend escuchando en el puerto ${server.address().port}`);
});
