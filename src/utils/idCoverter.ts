import mongoose, { ObjectId, Types } from 'mongoose';

export const Idconverter = (ids: string[]) => {
  const convertedIds = ids.map((id: string) => new mongoose.Types.ObjectId(id));
  return convertedIds;
};

export const singleIdconverter = (id: string) => {
  return new mongoose.Types.ObjectId(id);
};

export const removeObjectIdFromArray = (arr: Types.ObjectId[], id: string): Types.ObjectId[] => {
  // Use filter to remove the objectIdToRemove from the array
  const newArray = arr.filter((objectId) => objectId.toString() !== id);

  return newArray;
};

export const convertObjectIdArrayToStringArray = (objectIdArray: mongoose.mongo.BSON.ObjectId[]): string[] => {
  const stringArray = objectIdArray.map((objectId) => objectId.toString());

  return stringArray;
};

export const convertObjectIdToStringArray = (objectId: mongoose.mongo.BSON.ObjectId): string => {
  const stringArray = objectId.toString();

  return stringArray;
};
