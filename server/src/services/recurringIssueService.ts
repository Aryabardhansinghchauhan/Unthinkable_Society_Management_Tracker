import { Complaint } from '../models/Complaint';

export interface RecurringPattern {
  category: string;
  building: string;
  count: number;
  uniqueFlatsCount: number;
  flats: string[];
  complaintIds: string[];
  publicIds: string[];
  firstReported: Date;
  lastReported: Date;
  summary: string;
  recommendation: string;
}

export const detectRecurringIssues = async (
  lookbackDays = 30,
  thresholdCount = 3
): Promise<RecurringPattern[]> => {
  const sinceDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: sinceDate },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'resident',
        foreignField: '_id',
        as: 'residentInfo',
      },
    },
    {
      $unwind: '$residentInfo',
    },
    {
      $group: {
        _id: {
          category: '$category',
          building: '$residentInfo.building',
        },
        count: { $sum: 1 },
        flats: { $addToSet: '$residentInfo.flatNumber' },
        complaintIds: { $push: '$_id' },
        publicIds: { $push: '$publicId' },
        firstReported: { $min: '$createdAt' },
        lastReported: { $max: '$createdAt' },
      },
    },
    {
      $match: {
        count: { $gte: thresholdCount },
        '_id.building': { $ne: null, $exists: true },
      },
    },
    {
      $sort: { count: -1 as const },
    },
  ];

  const results = await Complaint.aggregate(pipeline);

  return results.map((item) => {
    const category = item._id.category;
    const building = item._id.building || 'Common Area';
    const count = item.count;
    const flats = (item.flats || []).filter(Boolean);
    const uniqueFlatsCount = flats.length;

    const summary = `${count} complaints · ${uniqueFlatsCount} flat${
      uniqueFlatsCount !== 1 ? 's' : ''
    } · ${building} · ${category}`;

    let recommendation = 'Cluster detected. Consider a root-cause inspection rather than isolated repairs.';
    if (category === 'Plumbing') {
      recommendation = `High frequency of plumbing issues in ${building}. Recommended: inspect the main riser and common drainage line.`;
    } else if (category === 'Lift') {
      recommendation = `Multiple lift incidents in ${building}. Recommended: schedule OEM technical audit for elevator controls.`;
    } else if (category === 'Electrical') {
      recommendation = `Repeated electrical faults in ${building}. Recommended: check floor distribution boxes and earthing.`;
    }

    return {
      category,
      building,
      count,
      uniqueFlatsCount,
      flats,
      complaintIds: item.complaintIds,
      publicIds: item.publicIds,
      firstReported: item.firstReported,
      lastReported: item.lastReported,
      summary,
      recommendation,
    };
  });
};
