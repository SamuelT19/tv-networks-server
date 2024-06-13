const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { applyFilter } = require("./filterHandler");

exports.getAllChannels = async (req, res) => {
  const { start, size, filters, globalFilter, sorting } = req.query;

  const pageIndex = parseInt(start, 10) || 0;
  const pageSize = parseInt(size, 10) || 10;
  let where = {};

  // Apply global filter
  if (globalFilter) {
    where.OR = [{ name: { contains: globalFilter, mode: "insensitive" } }];
  }

  // Apply column filters
  if (filters) {
    const parsedFilters = JSON.parse(filters);
    parsedFilters.forEach((filter) => {
      applyFilter(filter, where);
    });
  }

  // Apply sorting
  let orderBy = [];
  if (sorting) {
    const parsedSorting = JSON.parse(sorting);
    orderBy = parsedSorting.map((sort) => ({
      [sort.id]: sort.desc ? "desc" : "asc",
    }));
  }

  try {
    const totalRowCount = await prisma.channel.count({ where });
    const channels = await prisma.channel.findMany({
      where,
      orderBy,
      skip: pageIndex * pageSize,
      take: pageSize,
    });

    res.json({
      data: { channels: channels },
      meta: {
        totalRowCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};

exports.createChannel = async (req, res) => {
  const { name, isActive } = req.body;
  try {
    const channel = await prisma.channel.create({
      data: {
        name,
        isActive 
      }
    });
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
  const { name, isActive } = req.body; 
  try {
    const channel = await prisma.channel.update({
      where: { id: parseInt(id) },
      data: {
        name,
        isActive 
      }
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
