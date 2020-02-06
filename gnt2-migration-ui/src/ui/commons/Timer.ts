export const Timer = (lockTime: number, setValue: (time: string | undefined) => void) => setInterval(function () {
  const timeLeft = new Date(lockTime - Date.now().valueOf());
  const hours = Math.floor(timeLeft.valueOf() / 3600000).toString().padStart(2, '0');
  const minutes = Math.floor(timeLeft.getMinutes()).toString().padStart(2, '0');
  const seconds = Math.floor(timeLeft.getSeconds()).toString().padStart(2, '0');

  setValue(`${hours}:${minutes}:${seconds}`);

  if (timeLeft.valueOf() < 0) {
    setValue('00:00:00');
  }
}, 1000);
