// backend/src/repositories/job.repository.ts
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class JobRepository {
  // INTERNAL: HR creates a requisition for headcount
  async createRequisition(data: Prisma.JobRequisitionUncheckedCreateInput) {
    return prisma.jobRequisition.create({ data });
  }

  // INTERNAL: HR gets all requisitions for their specific tenant (company)
  async getTenantRequisitions(tenantId: string) {
    return prisma.jobRequisition.findMany({
      where: { tenantId },
      include: { postings: true, department: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // EXTERNAL: Publish a requisition to the public job board
  async createPosting(data: Prisma.JobPostingUncheckedCreateInput) {
    return prisma.jobPosting.create({ data });
  }

  // EXTERNAL: Fetch active postings for the Candidate Job Board
  async getActivePostings(skip: number, take: number) {
    return prisma.jobPosting.findMany({
      where: { status: 'PUBLISHED_EXTERNAL' },
      skip,
      take,
      include: {
        requisition: {
          include: { tenant: { select: { name: true, slug: true } } }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });
  }
}