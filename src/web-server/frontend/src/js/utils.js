export const getTextAndColor = (
    data,
    value,
    placeholder
  ) => {
    if (data === value && data !== "") {
      return [data, "text-gray-800"];
    } else if (data !== value && value !== "") {
      return [value, "text-blue-600"];
    } else {
      return [placeholder, 'text-gray-400'];
    }
  };