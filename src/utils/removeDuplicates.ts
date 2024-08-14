import { ObjectId } from 'mongoose'; // Import ObjectId from the relevant library

export function objectIdToString(obj: ObjectId): string {
  return obj.toString();
}

export function removeDuplicates(array: string[]): string[] {
  return [...new Set(array)];
}
