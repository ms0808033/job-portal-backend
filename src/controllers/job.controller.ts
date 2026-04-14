// backend/src/controllers/job.controller.ts
import { Request, Response } from 'express';
import { JobService } from '../services/job.service';
import { z } from 'zod';

const jobService = new JobService();

const createReqSchema = z.object({
  internalTitle: z.string().min(3),
  headcount: z.number().int().positive().default(1),
});

export const createRequisition = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = createReqSchema.parse(req.body);

    // Safety check for auth middleware
    if (!req.user || !req.user.tenantId) {
      res.status(401).json({ success: false, error: "Unauthorized: Missing tenant context" });
      return;
    }

    const requisition = await jobService.createRequisition(
      req.user.tenantId,
      parsedData.internalTitle,
      parsedData.headcount
    );

    res.status(201).json({ success: true, data: requisition });
  } catch (error) {
    res.status(400).json({ success: false, error: "Validation or processing error" });
  }
};

export const getActiveJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const jobs = await jobService.getPaginatedPublicJobs(page, limit);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch jobs" });
  }
};