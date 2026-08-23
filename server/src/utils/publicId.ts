import { Counter } from '../models/Counter';
import { Complaint } from '../models/Complaint';

export const getNextPublicId = async (prefix = 'FF'): Promise<string> => {
  // Loop to guarantee a unique, non-colliding public ID even if counter was out of sync
  for (let attempt = 0; attempt < 20; attempt++) {
    const counter = await Counter.findOneAndUpdate(
      { name: 'complaint' },
      { $inc: { value: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const candidateId = `${prefix}-${counter.value}`;

    // Check if this ID is already in use
    const exists = await Complaint.exists({ publicId: candidateId });
    if (!exists) {
      return candidateId;
    }

    // Collision detected (e.g., from seed data or counter desync).
    // Find the highest existing public ID in DB and advance counter past it.
    const complaints = await Complaint.find({ publicId: { $regex: `^${prefix}-\\d+$` } })
      .select('publicId')
      .lean();

    let maxNum = 1000;
    for (const c of complaints) {
      const parts = c.publicId.split('-');
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }

    // Set counter value to at least maxNum so the next increment is safe
    await Counter.findOneAndUpdate(
      { name: 'complaint' },
      { $max: { value: maxNum } },
      { new: true, upsert: true }
    );
  }

  // Fallback timestamp-based ID to ensure creation never fails
  return `${prefix}-${Date.now()}`;
};

