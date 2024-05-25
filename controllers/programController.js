
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.createProgram = async (req, res) => {
  const { title, duration, description, channelId, typeId, categoryId, videoUrl } = req.body;
  
  const endDate = new Date();
  const randomDays = Math.floor(Math.random() * 30) + 1;
  const airDate = new Date(endDate);
  airDate.setDate(airDate.getDate() - randomDays);

  
  try {
    const program = await prisma.program.create({
      data: { title, duration, description, channelId, typeId, categoryId, videoUrl, airDate }, 
    });
    req.io.emit('programsUpdated'); 
    res.json(program);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await prisma.program.findMany({
      include: {
        channel: true,
        type: true,
        category: true,
      },
    });
    const transformedPrograms = programs.map(program => ({
      id: program.id,
      title: program.title,
      duration: program.duration,
      description: program.description,
      videoUrl: program.videoUrl,
      channelId: program.channelId,
      typeId: program.typeId,
      categoryId: program.categoryId,
      typeName: program.type.name,
      categoryName: program.category.name,
      channelName: program.channel.name,
      airDate: program.airDate
    }));
    res.json(transformedPrograms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProgramCount = async (req, res) => {
  try {
    const count = await prisma.program.count();
    req.io.emit('programsUpdated'); 
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProgram = async (req, res) => {
  const { id } = req.params;
  const { title, duration, description, channelId, typeId, categoryId, videoUrl } = req.body;
  try {
    const program = await prisma.program.update({
      where: { id: parseInt(id) },
      data: { title, duration, description, channelId, typeId, categoryId, videoUrl },
    });
    req.io.emit('programsUpdated'); 
    res.json(program);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProgram = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.program.delete({ where: { id: parseInt(id) } });
    req.io.emit('programsUpdated'); 
    res.json({ message: 'Program deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};