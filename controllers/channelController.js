const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


exports.getAllChannels = async (req, res) => {
  const { start, size, filters, globalFilter, sorting } = req.query;

  const pageIndex = parseInt(start, 10) || 0;
  const pageSize = parseInt(size, 10) || 10;
  let where = {};

  // Apply global filter
  if (globalFilter) {
    where.OR = [{ name: { contains: globalFilter, mode: "insensitive" } }];
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
      const isIdNumeric = id === "id";
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
