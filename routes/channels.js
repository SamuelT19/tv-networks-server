const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res) => {
  const channels = await prisma.channel.findMany();
  res.json(channels);
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  const channel = await prisma.channel.create({ data: { name } });
  req.app.get('io').emit('channelsUpdated'); 
  res.json(channel);
});

router.get('/count', async (req, res) => {
  const count = await prisma.channel.count();
  req.app.get('io').emit('channelsUpdated'); 
  res.json({ count });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const channel = await prisma.channel.update({ where: { id: parseInt(id) }, data: { name } });
  req.app.get('io').emit('channelsUpdated'); 
  res.json(channel);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.channel.delete({ where: { id: parseInt(id) } });
  req.app.get('io').emit('channelsUpdated'); 
  res.json({ message: 'Channel deleted' });
});

module.exports = router;
