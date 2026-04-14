// backend/src/services/job.service.ts
import { JobRepository } from '../repositories/job.repository';

export class JobService {
  private jobRepository: JobRepository;

  constructor() {
    this.jobRepository = new JobRepository();
  }

  async createRequisition(tenantId: string, internalTitle: string, headcount: number) {
    return this.jobRepository.createRequisition({
      tenantId,
      internalTitle,
      headcount,
      status: 'DRAFT'
    });
  }

  async getPaginatedPublicJobs(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.jobRepository.getActivePostings(skip, limit);
  }
}