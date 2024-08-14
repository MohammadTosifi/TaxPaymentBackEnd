import { ObjectId } from 'mongodb';

// Utility function to extract _id values from an array of objects
export const extractIds = <T>(objects: T[], idKey: string = '_id'): ObjectId[] => {
  return objects.map((obj) => (obj as any)[idKey]);
};

export const extractField = <T>(objects: T[], keyToExtract: string): ObjectId[] => {
  return objects.map((obj) => (obj as any)[keyToExtract]);
};
