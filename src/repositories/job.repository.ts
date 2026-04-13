// backend/src/repositories/job.repository.ts
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class JobRepository {
  async createJob(data: Prisma.JobUncheckedCreateInput) {
    return prisma.job.create({ data });
  }

  async getActiveJobs(skip: number, take: number) {
    return prisma.job.findMany({
      where: { isActive: true },
      skip,
      take,
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}