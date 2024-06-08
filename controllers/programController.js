const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createProgram = async (req, res) => {
  const {
    title,
    duration,
    description,
    channelId,
    typeId,
    categoryId,
    videoUrl,
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

  // Helper function to check if a value is valid for numeric IDs
  const isValidNumericValue = (value) => value !== undefined && value !== null && value !== '' && !isNaN(value);

  // Helper function to check if a value is valid for non-numeric IDs
  const isValidStringValue = (value) => value !== undefined && value !== null && value !== '';

  // Apply column filters
  if (filters) {
    const parsedFilters = JSON.parse(filters);
    parsedFilters.forEach((filter) => {
      const { id, value, type } = filter;

      // Check the type of ID
      const isIdNumeric =
        id === "id" ||
        id === "channelId" ||
        id === "typeId" ||
        id === "categoryId" ||
        id === "duration";
      if (isIdNumeric) {
        // If the ID is numeric, treat the value as a number
        const numericValue = parseFloat(value);
        switch (type) {
          case "equals":
            if (isValidNumericValue(numericValue)) where[id] = { equals: numericValue };
            break;
          case "notEquals":
            if (isValidNumericValue(numericValue)) where[id] = { not: numericValue };
            break;
          case "between":
          case "betweenInclusive":
            const [lower, upper] = value;
            if (isValidNumericValue(lower) && isValidNumericValue(upper)) {
              where[id] = { gte: parseFloat(lower), lte: parseFloat(upper) };
            }
            break;
          case "greaterThan":
            if (isValidNumericValue(numericValue)) where[id] = { gt: numericValue };
            break;
          case "greaterThanOrEqual":
            if (isValidNumericValue(numericValue)) where[id] = { gte: numericValue };
            break;
          case "lessThan":
            if (isValidNumericValue(numericValue)) where[id] = { lt: numericValue };
            break;
          case "lessThanOrEqual":
            if (isValidNumericValue(numericValue)) where[id] = { lte: numericValue };
            break;
          default:
            break;
        }
      } else {
        // If the ID is not numeric, treat the value as a string
        switch (type) {
          case "fuzzy":
          case "contains":
            if (isValidStringValue(value)) where[id] = { contains: value, mode: "insensitive" };
            break;
          case "startsWith":
            if (isValidStringValue(value)) where[id] = { startsWith: value, mode: "insensitive" };
            break;
          case "endsWith":
            if (isValidStringValue(value)) where[id] = { endsWith: value, mode: "insensitive" };
            break;
          case "equals":
            if (isValidStringValue(value)) where[id] = { equals: value, mode: "insensitive" };
            break;
          case "notEquals":
            if (isValidStringValue(value)) where[id] = { not: value, mode: "insensitive" };
            break;
          case "empty":
            where[id] = { equals: null };
            break;
          case "notEmpty":
            where[id] = { not: null };
            break;
          default:
            break;
        }
      }
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
      data: { programs: programs },
      meta: {
        totalRowCount,
      },
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
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
