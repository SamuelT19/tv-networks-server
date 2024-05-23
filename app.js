const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const app = express();

const port = 5000;

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// CRUD Operations for Channels
app.get('/api/channels', async (req, res) => {
  const channels = await prisma.channel.findMany();
  res.json(channels);
});

app.post('/api/channels', async (req, res) => {
  const { name } = req.body;
  const channel = await prisma.channel.create({ data: { name } });
  res.json(channel);
});

app.put('/api/channels/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const channel = await prisma.channel.update({ where: { id: parseInt(id) }, data: { name } });
  res.json(channel);
});

app.delete('/api/channels/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.channel.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Channel deleted' });
});

// CRUD Operations for programs
app.get('/api/programs', async (req, res) => {
  const programs = await prisma.program.findMany();
  res.json(programs);
});

app.post('/api/programs', async (req, res) => {
  const { title, duration, description, channelId, typeId, categoryId, videoUrl } = req.body;
  const program = await prisma.program.create({
    data: { title, duration, description, channelId, typeId, categoryId, videoUrl },
  });
  res.json(program);
});

app.put('/api/programs/:id', async (req, res) => {
  const { id } = req.params;
  const { title, duration, description, channelId, typeId, categoryId, videoUrl } = req.body;
  const program = await prisma.program.update({
    where: { id: parseInt(id) },
    data: { title, duration, description, channelId, typeId, categoryId, videoUrl },
  });
  res.json(program);
});

app.delete('/api/programs/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.program.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'programs deleted' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
