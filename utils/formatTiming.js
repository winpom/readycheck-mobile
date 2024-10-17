export const formatTiming = (timing) => {
  const date = new Date(timing);
  
  // Automatically uses user's locale
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  };

  // Get time first, then date
  const formattedTime = date.toLocaleString(undefined, {
    hour: options.hour,
    minute: options.minute,
  });

  const formattedDate = date.toLocaleString(undefined, {
    day: options.day,
    month: options.month,
    year: options.year,
  });

  return `${formattedTime}, ${formattedDate}`;
};
