const isValidNumericValue = (value) =>
  value !== undefined && value !== null && value !== "" && !isNaN(value);

const isValidStringValue = (value) =>
  value !== undefined && value !== null && value !== "";

const applyFilter = (filter, where) => {
  const { id, value, type, filtervariant } = filter;

  // Skip filter if the value is null, undefined, or empty
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.every((v) => v === null || v === ""))
  )
    return;

  // Function to apply text filters
  const applyTextFilter = (nestedFilter, key) => {
    switch (type) {
      case "fuzzy":
      case "contains":
        if (isValidStringValue(value))
          nestedFilter[key] = { contains: value, mode: "insensitive" };
        break;
      case "startsWith":
        if (isValidStringValue(value))
          nestedFilter[key] = { startsWith: value, mode: "insensitive" };
        break;
      case "endsWith":
        if (isValidStringValue(value))
          nestedFilter[key] = { endsWith: value, mode: "insensitive" };
        break;
      case "equals":
        if (isValidStringValue(value))
          nestedFilter[key] = { equals: value, mode: "insensitive" };
        break;
      case "notEquals":
        if (isValidStringValue(value))
          nestedFilter[key] = { not: value, mode: "insensitive" };
        break;
      case "between":
        const [lower, upper] = value;
        if (isValidStringValue(lower) && isValidStringValue(upper)) {
          nestedFilter[key] = {
            gt: lower,
            lt: upper,
          };
        }
        break;
      case "betweenInclusive":
        const [lowerInclusive, upperInclusive] = value;
        if (
          isValidStringValue(lowerInclusive) &&
          isValidStringValue(upperInclusive)
        ) {
          nestedFilter[key] = {
            gte: lowerInclusive,
            lte: upperInclusive,
          };
        }
        break;
      case "greaterThan":
        if (isValidStringValue(value)) nestedFilter[key] = { gt: value };
        break;
      case "greaterThanOrEqualTo":
        if (isValidStringValue(value)) nestedFilter[key] = { gte: value };
        break;
      case "lessThan":
        if (isValidStringValue(value)) nestedFilter[key] = { lt: value };
        break;
      case "lessThanOrEqualTo":
        if (isValidStringValue(value)) nestedFilter[key] = { lte: value };
        break;
      case "empty":
        nestedFilter[key] = { equals: null };
        break;
      case "notEmpty":
        nestedFilter[key] = { not: null };
        break;
      default:
        break;
    }
  };

  // Function to handle multi-select filters
  const applyMultiSelectFilter = (nestedFilter, key) => {
    switch (type) {
      case "equals":
        nestedFilter[key] = { in: value };
        break;
      case "notEquals":
        nestedFilter[key] = { notIn: value };
        break;


      // case "contains":
      // case "fuzzy":
      //   nestedFilter[key] = {
      //     OR: value.filter(isValidStringValue).map((val) => ({
      //       contains: val,
      //       mode: "insensitive",
      //     })),
      //   };
      //   break;
      // case "startsWith":
      //   nestedFilter[key] = {
      //     OR: value.filter(isValidStringValue).map((val) => ({
      //       startsWith: val,
      //       mode: "insensitive",
      //     })),
      //   };
      //   break;
      // case "endsWith":
      //   nestedFilter[key] = {
      //     OR: value.filter(isValidStringValue).map((val) => ({
      //       endsWith: val,
      //       mode: "insensitive",
      //     })),
      //   };
      //   break;
      // case "empty":
      //   nestedFilter[key] = { equals: null };
      //   break;
      // case "notEmpty":
      //   nestedFilter[key] = { not: null };
      //   break;

      default:
        break;
    }
  };

  // Function to handle numeric filters
  const applyNumericFilter = (nestedFilter, key) => {
    const numericValue = parseFloat(value);
    switch (type) {
      case "equals":
        if (isValidNumericValue(numericValue))
          nestedFilter[key] = { equals: numericValue };
        break;
      case "notEquals":
        if (isValidNumericValue(numericValue))
          nestedFilter[key] = { not: numericValue };
        break;
      case "between":
        const [lower, upper] = value;
        if (isValidNumericValue(lower) && isValidNumericValue(upper)) {
          nestedFilter[key] = { gt: parseFloat(lower), lt: parseFloat(upper) };
        }
        break;
      case "betweenInclusive":
        const [lowerInclusive, upperInclusive] = value;
        if (
          isValidNumericValue(lowerInclusive) &&
          isValidNumericValue(upperInclusive)
        ) {
          nestedFilter[key] = {
            gte: parseFloat(lowerInclusive),
            lte: parseFloat(upperInclusive),
          };
        }
        break;
      case "greaterThan":
        if (isValidNumericValue(numericValue))
          nestedFilter[key] = { gt: numericValue };
        break;
      case "greaterThanOrEqualTo":
        if (isValidNumericValue(numericValue))
          nestedFilter[key] = { gte: numericValue };
        break;
      case "lessThan":
        if (isValidNumericValue(numericValue))
          nestedFilter[key] = { lt: numericValue };
        break;
      case "lessThanOrEqualTo":
        if (isValidNumericValue(numericValue))
          nestedFilter[key] = { lte: numericValue };
        break;
      default:
        break;
    }
  };

  // Function to handle date and datetime filters
  const applyDateFilter = (nestedFilter, key) => {
    if (Array.isArray(value)) {
      switch (type) {
        case "between":
          const [startDate, endDate] = value.map((v) => new Date(v));
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            nestedFilter[key] = { gte: startDate, lte: endDate };
          }
          break;
        case "betweenInclusive":
          const [startDateInclusive, endDateInclusive] = value.map(
            (v) => new Date(v)
          );
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            nestedFilter[key] = {
              gte: startDateInclusive,
              lte: endDateInclusive,
            };
          }
          break;
      }
    } else {
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        switch (type) {
          case "equals":
            nestedFilter[key] = { equals: dateValue };
            break;
          case "notEquals":
            nestedFilter[key] = { not: dateValue };
            break;
          case "lessThan":
            nestedFilter[key] = { lt: dateValue };
            break;
          case "lessThanOrEqualTo":
            nestedFilter[key] = { lte: dateValue };
            break;
          case "greaterThan":
            nestedFilter[key] = { gt: dateValue };
            break;
          case "greaterThanOrEqualTo":
            nestedFilter[key] = { gte: dateValue };
            break;
          default:
            break;
        }
      }
    }
  };


  const applyTimeFilter = (nestedFilter, key) => {
    const isValidStringValue = (str) => typeof str === 'string' && str.trim() !== '';
  
    switch (type) {
      case "equals":
        if (isValidStringValue(value)) {
          const dateObject = new Date(value);
          if (!isNaN(dateObject.getTime())) {
            nestedFilter[key] = { equals: dateObject.toLocaleTimeString() };
          }
        }
        break;
      case "notEquals":
        if (isValidStringValue(value)) {
          const dateObject = new Date(value);
          if (!isNaN(dateObject.getTime())) {
            nestedFilter[key] = { not: dateObject.toLocaleTimeString() };
          }
        }
        break;
      case "greaterThan":
        if (isValidStringValue(value)) {
          const dateObject = new Date(value);
          if (!isNaN(dateObject.getTime())) {
            nestedFilter[key] = { gt: dateObject.toLocaleTimeString() };
          }
        }
        break;
      case "greaterThanOrEqualTo":
        if (isValidStringValue(value)) {
          const dateObject = new Date(value);
          if (!isNaN(dateObject.getTime())) {
            nestedFilter[key] = { gte: dateObject.toLocaleTimeString() };
          }
        }
        break;
      case "lessThan":
        if (isValidStringValue(value)) {
          const dateObject = new Date(value);
          if (!isNaN(dateObject.getTime())) {
            nestedFilter[key] = { lt: dateObject.toLocaleTimeString() };
          }
        }
        break;
      case "lessThanOrEqualTo":
        if (isValidStringValue(value)) {
          const dateObject = new Date(value);
          if (!isNaN(dateObject.getTime())) {
            nestedFilter[key] = { lte: dateObject.toLocaleTimeString() };
          }
        }
        break;
        case "between":
        if (Array.isArray(value) && value.length === 2) {
          const [startTime, endTime] = value.map(dateTimeString => {
            const dateObject = new Date(dateTimeString);
            return isValidStringValue(dateTimeString) && !isNaN(dateObject.getTime()) ? dateObject.toLocaleTimeString() : null;
          });
  
          if (startTime && endTime) {
            nestedFilter[key] = { gt: startTime, lt: endTime };
          }
        }
        break;
      case "betweenInclusive":
        if (Array.isArray(value) && value.length === 2) {
          const [startTime, endTime] = value.map(dateTimeString => {
            const dateObject = new Date(dateTimeString);
            return isValidStringValue(dateTimeString) && !isNaN(dateObject.getTime()) ? dateObject.toLocaleTimeString() : null;
          });
  
          if (startTime && endTime) {
            nestedFilter[key] = { gte: startTime, lte: endTime };
          }}
      default:
        break;
    }
  };

  // Function to handle range filters
  const applyRangeFilter = (nestedFilter, key) => {
    switch (type) {
      case "between":
        if (Array.isArray(value) && value.length === 2) {
          const [min, max] = value;
          if (isValidNumericValue(min) && isValidNumericValue(max)) {
            nestedFilter[key] = { gt: parseFloat(min), lt: parseFloat(max) };
          }
        }
        break;
      case "betweenInclusive":
        if (Array.isArray(value) && value.length === 2) {
          const [min, max] = value;
          if (isValidNumericValue(min) && isValidNumericValue(max)) {
            nestedFilter[key] = { gte: parseFloat(min), lte: parseFloat(max) };
          }
        }
        break;
      default:
        break;
    }
  };

  // Function to handle boolean filters
  const applyBooleanFilter = (nestedFilter, key) => {
    let booleanValue;
    if (value === "false") {
      booleanValue = false;
    } else {
      booleanValue = true;
    }
    if (typeof booleanValue === "boolean") {
      nestedFilter[key] = { equals: booleanValue };
    }
  };

  // Function to apply the filter based on the filtervariant
  const applyFilterByVariant = (nestedFilter, key) => {
    switch (filtervariant) {
      case "text":
      case "autocomplete":
      case "select":
        applyTextFilter(nestedFilter, key);
        break;
      case "number":
        applyNumericFilter(nestedFilter, key);
        break;
      case "multi-select":
        applyMultiSelectFilter(nestedFilter, key);
        break;
      case "date":
      case "datetime":
        applyDateFilter(nestedFilter, key);
        break;
      case "date-range":
      case "datetime-range":
        applyDateFilter(nestedFilter, key);
        break;
      case "time":
      case "time-range":
        applyTimeFilter(nestedFilter, key);
        break;
      case "range":
      case "range-slider":
        applyRangeFilter(nestedFilter, key);
        break;
      case "checkbox":
        applyBooleanFilter(nestedFilter, key);
        break;
      default:
        break;
    }
  };

  // Apply the filter to nested or non-nested properties
  const match = id.match(/^([a-z]+)_([a-z]+)$/);
  if (match) {
    const parent = match[1];
    const nestedProperty = match[2];
    if (!where[parent]) {
      where[parent] = {};
    }
    applyFilterByVariant(where[parent], nestedProperty);
  } else {
    applyFilterByVariant(where, id);
  }
};

module.exports = {
  applyFilter,
};




