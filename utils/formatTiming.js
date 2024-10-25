// utils/formatTiming.js
export const formatTiming = (timing) => {
  const date = new Date(timing);
  
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });

  return { time: formattedTime, date: formattedDate };
};
