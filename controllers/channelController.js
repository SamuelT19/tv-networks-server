const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllChannels = async (req, res) => {
  try {
    const channels = await prisma.channel.findMany();
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createChannel = async (req, res) => {
  const { name } = req.body;
  try {
    const channel = await prisma.channel.create({ data: { name } });
    req.io.emit("channelsUpdated");
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChannelCount = async (req, res) => {
  try {
    const count = await prisma.channel.count();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateChannel = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const channel = await prisma.channel.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    req.io.emit("channelsUpdated");
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteChannel = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.channel.delete({ where: { id: parseInt(id) } });
    req.io.emit("channelsUpdated");
    res.json({ message: "Channel deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
