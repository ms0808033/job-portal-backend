// backend/src/services/job.service.ts
import { JobRepository } from '../repositories/job.repository';

export class JobService {
  private jobRepository: JobRepository;

  constructor() {
    this.jobRepository = new JobRepository();
  }

  async createJob(companyId: number, title: string, description: string, location: string) {
    // Add business logic, notifications, or limits here
    return this.jobRepository.createJob({ companyId, title, description, location });
  }

  async getPaginatedJobs(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.jobRepository.getActiveJobs(skip, limit);
  }
}