import { Counter } from '../models/Counter';

export const getNextPublicId = async (prefix = 'FF'): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'complaint' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return `${prefix}-${counter.value}`;
};
