const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { applyFilter } = require("./filterHandler");

exports.createProgram = async (req, res) => {
  const {
    title,
    duration,
    description,
    channelId,
    typeId,
    categoryId,
    videoUrl,
    isActive
  } = req.body;

  const endDate = new Date();
  const randomDays = Math.floor(Math.random() * 30) + 1;
  const airDate = new Date(endDate);
  airDate.setDate(airDate.getDate() - randomDays);

  try {
    const program = await prisma.program.create({
      data: {
        title,
        duration,
        description,
        channelId,
        typeId,
        categoryId,
        videoUrl,
        airDate,
      },
    });
    req.io.emit("programsUpdated");
    res.json(program);
  } catch (error) {
    console.error("Error creating program:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProgramCount = async (req, res) => {
  try {
    const count = await prisma.program.count();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching program count:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProgram = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    duration,
    description,
    channelId,
    typeId,
    categoryId,
    videoUrl,
    isActive
  } = req.body;

  try {
    const program = await prisma.program.update({
      where: { id: parseInt(id) },
      data: {
        title,
        duration,
        description,
        channelId,
        typeId,
        categoryId,
        videoUrl,
        isActive
      },
    });
    req.io.emit("programsUpdated");
    res.json(program);
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProgram = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.program.delete({ where: { id: parseInt(id) } });
    req.io.emit("programsUpdated");
    res.json({ message: "Program deleted" });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.getAllPrograms = async (req, res) => {
  const { start, size, filters, globalFilter, sorting } = req.query;

  const pageIndex = parseInt(start, 10) || 0;
  const pageSize = parseInt(size, 10) || 10;
  let where = {};

  // Apply global filter
  if (globalFilter) {
    where.OR = [
      { title: { contains: globalFilter, mode: "insensitive" } },
      { description: { contains: globalFilter, mode: "insensitive" } },
      { videoUrl: { contains: globalFilter, mode: "insensitive" } },
      { channel: { name: { contains: globalFilter, mode: "insensitive" } } },
      { type: { name: { contains: globalFilter, mode: "insensitive" } } },
      { category: { name: { contains: globalFilter, mode: "insensitive" } } },
    ];
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
    const totalRowCount = await prisma.program.count({ where });
    const programs = await prisma.program.findMany({
      where,
      orderBy,
      skip: pageIndex * pageSize,
      take: pageSize,
      include: {
        channel: true,
        type: true,
        category: true,
      },
    });

    res.json({
      data: { programs },
      meta: {
        totalRowCount,
      },
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};
