export const filterObj = <T extends Record<string, any>>(obj: T, ...allowedFields: (keyof T)[]): Partial<T> => {
  const newObj: Partial<T> = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el as keyof T)) {
      newObj[el as keyof T] = obj[el];
    }
  });
  return newObj;
};
