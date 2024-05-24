const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res) => {
  const programs = await prisma.program.findMany({
    include: {
      channel: true,
      type: true,
      category: true,
    },
  });
  const transformedPrograms = programs.map(program => ({
    ...program,
    typeName: program.type.name,
    categoryName: program.category.name,
    channelName: program.channel.name
  }));
  res.json(transformedPrograms);
});

router.get('/count', async (req, res) => {
  const count = await prisma.program.count();
  req.app.get('io').emit('programsUpdated'); 
  res.json({ count });
});

router.post('/', async (req, res) => {
  const { title, duration, description, channelId, typeId, categoryId, videoUrl } = req.body;
  const program = await prisma.program.create({
    data: { title, duration, description, channelId, typeId, categoryId, videoUrl },
  });
  req.app.get('io').emit('programsUpdated'); 
  res.json(program);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, duration, description, channelId, typeId, categoryId, videoUrl } = req.body;
  const program = await prisma.program.update({
    where: { id: parseInt(id) },
    data: { title, duration, description, channelId, typeId, categoryId, videoUrl },
  });
  req.app.get('io').emit('programsUpdated'); 
  res.json(program);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.program.delete({ where: { id: parseInt(id) } });
  req.app.get('io').emit('programsUpdated'); 
  res.json({ message: 'Program deleted' });
});

module.exports = router;
