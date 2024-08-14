export const arrayToObject = (array: string[]) => {
  const obj: { [key: string]: number } = {};

  for (let i = 0; i < array.length; i++) {
    obj[array[i]] = i + 1;
  }

  return obj;
};
