// backend/src/controllers/job.controller.ts
import { Request, Response } from 'express';
import { JobService } from '../services/job.service';
import { z } from 'zod';

const jobService = new JobService();

const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string()
});

export const createJob = async (req: Request, res: Response) => {
  try {
    const parsedData = createJobSchema.parse(req.body);
    // Assuming auth middleware sets req.user
    const companyId = req.user.companyId;

    const job = await jobService.createJob(
      companyId,
      parsedData.title,
      parsedData.description,
      parsedData.location
    );
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: "Validation or processing error" });
  }
};

// ADD THIS NEW FUNCTION:
export const getActiveJobs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const jobs = await jobService.getPaginatedJobs(page, limit);

    // The frontend expects the jobs inside the 'data' property
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch jobs" });
  }
};